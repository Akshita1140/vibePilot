"""
app/services/fetcher.py
HTTP fetcher — downloads a URL and returns a FetchResult.

Design decisions
────────────────
- Uses httpx (async) with a realistic browser User-Agent so most apps don't
  serve empty pages or Cloudflare challenges.
- Follows redirects (up to 10 hops) and records the final URL.
- Caps response body at 2 MB to avoid memory issues with huge pages.
- Fetches the homepage, then discovers and fetches up to MAX_EXTRA_PAGES
  internal links to give the LLM richer context.
- Never raises — errors are captured in FetchResult.error / ParsedPage.fetch_error
  so the caller always gets a usable object.
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Optional
from urllib.parse import urljoin, urlparse

import httpx

from app.schemas.fetch_result import FetchResult, ParsedPage
from app.services.parser import parse_html

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────────────────────

_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)
_TIMEOUT = httpx.Timeout(connect=10.0, read=20.0, write=10.0, pool=5.0)
_MAX_BODY_BYTES = 2 * 1024 * 1024      # 2 MB
_MAX_EXTRA_PAGES = 3                    # sub-pages to crawl after homepage
_MAX_REDIRECTS = 10


# ─────────────────────────────────────────────────────────────────────────────
# Internal helpers
# ─────────────────────────────────────────────────────────────────────────────


def _same_origin(base: str, target: str) -> bool:
    """Return True if target is on the same host as base."""
    b = urlparse(base)
    t = urlparse(target)
    return b.netloc == t.netloc


def _candidate_sub_pages(parsed_page: ParsedPage, base_url: str) -> list[str]:
    """
    Pick up to _MAX_EXTRA_PAGES internal links that look like useful pages
    (login, dashboard, signup, pricing, etc.) rather than assets.
    """
    priority_keywords = [
        "login", "signin", "signup", "register", "dashboard",
        "auth", "callback", "pricing", "settings", "profile",
        "docs", "api", "features",
    ]
    seen: set[str] = {base_url}
    candidates: list[str] = []

    # Priority links first
    for link in parsed_page.links:
        if link.is_external:
            continue
        href = link.href.split("?")[0].split("#")[0]  # strip query/fragment
        if href in seen:
            continue
        # Skip obvious asset paths
        if any(href.endswith(ext) for ext in (".js", ".css", ".png", ".jpg", ".ico", ".svg", ".woff")):
            continue
        seen.add(href)
        text_lower = (link.text + href).lower()
        if any(kw in text_lower for kw in priority_keywords):
            candidates.insert(0, href)  # put priority links first
        else:
            candidates.append(href)

    return candidates[:_MAX_EXTRA_PAGES]


async def _fetch_one(
    client: httpx.AsyncClient,
    url: str,
) -> ParsedPage:
    """Fetch a single URL and return a ParsedPage. Never raises."""
    try:
        logger.debug("Fetching: %s", url)
        response = await client.get(url, follow_redirects=True)
        final_url = str(response.url)
        status_code = response.status_code

        # Read body (capped)
        body_bytes = response.content[:_MAX_BODY_BYTES]
        # Detect encoding
        encoding = response.encoding or "utf-8"
        try:
            html = body_bytes.decode(encoding, errors="replace")
        except (LookupError, UnicodeDecodeError):
            html = body_bytes.decode("utf-8", errors="replace")

        return parse_html(html=html, url=url, final_url=final_url, status_code=status_code)

    except httpx.TimeoutException as exc:
        logger.warning("Timeout fetching %s: %s", url, exc)
        return ParsedPage(
            url=url, final_url=url, status_code=0,
            title=None, meta_description=None, meta_keywords=None,
            og_title=None, og_description=None,
            fetch_error=f"Timeout: {exc}",
        )
    except httpx.RequestError as exc:
        logger.warning("Request error fetching %s: %s", url, exc)
        return ParsedPage(
            url=url, final_url=url, status_code=0,
            title=None, meta_description=None, meta_keywords=None,
            og_title=None, og_description=None,
            fetch_error=f"Request error: {exc}",
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Unexpected error fetching %s: %s", url, exc)
        return ParsedPage(
            url=url, final_url=url, status_code=0,
            title=None, meta_description=None, meta_keywords=None,
            og_title=None, og_description=None,
            fetch_error=f"Unexpected error: {exc}",
        )


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────


async def fetch_app(url: str) -> FetchResult:
    """
    Fetch the app at *url* and up to _MAX_EXTRA_PAGES sub-pages.

    Strategy
    ────────
    1. Fetch the homepage.
    2. Parse it to discover internal links.
    3. Concurrently fetch up to _MAX_EXTRA_PAGES priority sub-pages.
    4. Return a FetchResult containing all ParsedPage objects.

    Parameters
    ----------
    url:
        The root URL to fetch (as submitted in AnalyzeRequest.app_url).

    Returns
    -------
    FetchResult
        Always returns; errors are captured inside the result object.
    """
    t0 = time.monotonic()

    headers = {
        "User-Agent": _USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }

    async with httpx.AsyncClient(
        headers=headers,
        timeout=_TIMEOUT,
        max_redirects=_MAX_REDIRECTS,
        follow_redirects=True,
    ) as client:

        # Step 1: Fetch homepage
        homepage = await _fetch_one(client, url)

        if homepage.fetch_error:
            elapsed = int((time.monotonic() - t0) * 1000)
            return FetchResult(
                requested_url=url,
                pages=[homepage],
                total_fetch_time_ms=elapsed,
                error=homepage.fetch_error,
            )

        pages: list[ParsedPage] = [homepage]

        # Step 2: Discover and fetch sub-pages concurrently
        sub_urls = _candidate_sub_pages(homepage, url)
        if sub_urls:
            logger.info("Fetching %d sub-page(s): %s", len(sub_urls), sub_urls)
            sub_tasks = [_fetch_one(client, u) for u in sub_urls]
            sub_pages = await asyncio.gather(*sub_tasks)
            pages.extend(sub_pages)

    elapsed = int((time.monotonic() - t0) * 1000)
    logger.info(
        "Fetch complete | url=%s | pages=%d | elapsed_ms=%d",
        url, len(pages), elapsed,
    )
    return FetchResult(
        requested_url=url,
        pages=pages,
        total_fetch_time_ms=elapsed,
    )
