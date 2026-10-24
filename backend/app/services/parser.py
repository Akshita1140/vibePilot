"""
app/services/parser.py
HTML parser — converts raw HTML bytes into a structured ParsedPage.

Uses the stdlib html.parser (no external dependency) with BeautifulSoup-style
patterns so we can swap to bs4 later if needed without changing callers.

Responsibilities
────────────────
- Extract title, meta tags (description, keywords, OG tags)
- Collect headings (h1, h2)
- Collect links (internal vs external)
- Collect form structures (action, method, field names)
- Collect script srcs and short inline snippets
- Identify well-known third-party script domains
- Cap and clean text content for LLM consumption
"""

from __future__ import annotations

import re
from html.parser import HTMLParser
from typing import Optional
from urllib.parse import urljoin, urlparse

from app.schemas.fetch_result import FormInfo, LinkInfo, ParsedPage, ScriptInfo

# ─────────────────────────────────────────────────────────────────────────────
# Well-known third-party script domains to flag
# ─────────────────────────────────────────────────────────────────────────────

KNOWN_SCRIPT_DOMAINS: dict[str, str] = {
    "accounts.google.com": "Google OAuth",
    "apis.google.com": "Google APIs",
    "www.googletagmanager.com": "Google Tag Manager",
    "www.google-analytics.com": "Google Analytics",
    "googletagmanager.com": "Google Tag Manager",
    "cdn.jsdelivr.net": "jsDelivr CDN",
    "unpkg.com": "unpkg CDN",
    "cdn.auth0.com": "Auth0",
    "js.stripe.com": "Stripe",
    "js.braintreegateway.com": "Braintree",
    "checkout.razorpay.com": "Razorpay",
    "connect.facebook.net": "Facebook SDK",
    "platform.twitter.com": "Twitter SDK",
    "cdn.segment.com": "Segment Analytics",
    "cdn.amplitude.com": "Amplitude Analytics",
    "static.hotjar.com": "Hotjar",
    "assets.lemonsqueezy.com": "Lemon Squeezy",
    "supabase.co": "Supabase",
    "firebase.googleapis.com": "Firebase",
    "firebaseapp.com": "Firebase",
    "clerk.browser.js": "Clerk Auth",
    "cdn.clerk.io": "Clerk Auth",
    "www.clarity.ms": "Microsoft Clarity",
    "posthog.com": "PostHog Analytics",
    "cdn.intercom.io": "Intercom",
    "js.intercomcdn.com": "Intercom",
    "widget.intercom.io": "Intercom",
}

_MAX_TEXT_CHARS = 4_000   # Cap plain-text for LLM context window
_MAX_LINKS = 40
_MAX_SCRIPTS = 20
_SNIPPET_LEN = 300


# ─────────────────────────────────────────────────────────────────────────────
# Low-level HTML parser
# ─────────────────────────────────────────────────────────────────────────────


class _VibePilotHTMLParser(HTMLParser):
    """
    Single-pass HTML parser that collects all data needed for ParsedPage.
    Written against stdlib html.parser — no third-party deps required.
    """

    def __init__(self, base_url: str) -> None:
        super().__init__(convert_charrefs=True)
        self._base_url = base_url
        self._base_domain = urlparse(base_url).netloc

        # Output accumulators
        self.title: Optional[str] = None
        self.meta: dict[str, str] = {}
        self.h1: list[str] = []
        self.h2: list[str] = []
        self.links: list[LinkInfo] = []
        self.forms: list[FormInfo] = []
        self.scripts: list[ScriptInfo] = []
        self.detected_domains: set[str] = set()
        self._text_parts: list[str] = []

        # Parser state
        self._current_tag: Optional[str] = None
        self._current_form: Optional[FormInfo] = None
        self._in_script = False
        self._inline_script_buf: list[str] = []
        self._in_style = False
        self._in_head = False
        self._skip_tags = {"script", "style", "noscript", "head"}

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _attr(self, attrs: list[tuple[str, Optional[str]]], name: str) -> Optional[str]:
        for k, v in attrs:
            if k.lower() == name:
                return v
        return None

    def _is_external(self, href: str) -> bool:
        parsed = urlparse(href)
        if not parsed.netloc:
            return False
        return parsed.netloc != self._base_domain

    # ── HTMLParser overrides ──────────────────────────────────────────────────

    def handle_starttag(self, tag: str, attrs: list[tuple[str, Optional[str]]]) -> None:
        tag = tag.lower()
        self._current_tag = tag

        if tag == "head":
            self._in_head = True

        elif tag == "title":
            pass  # content collected in handle_data

        elif tag == "meta":
            name = (self._attr(attrs, "name") or "").lower()
            prop = (self._attr(attrs, "property") or "").lower()
            content = self._attr(attrs, "content") or ""
            if name == "description":
                self.meta["description"] = content
            elif name == "keywords":
                self.meta["keywords"] = content
            elif prop == "og:title":
                self.meta["og_title"] = content
            elif prop == "og:description":
                self.meta["og_description"] = content

        elif tag == "a":
            href = self._attr(attrs, "href") or ""
            text = ""  # collected later via handle_data
            if href and not href.startswith(("#", "javascript:", "mailto:", "tel:")):
                abs_href = urljoin(self._base_url, href)
                if len(self.links) < _MAX_LINKS:
                    self.links.append(
                        LinkInfo(
                            href=abs_href,
                            text="",  # placeholder; updated in handle_data
                            is_external=self._is_external(abs_href),
                        )
                    )

        elif tag == "form":
            action = urljoin(self._base_url, self._attr(attrs, "action") or "")
            method = (self._attr(attrs, "method") or "get").upper()
            self._current_form = FormInfo(action=action, method=method)

        elif tag in ("input", "select", "textarea") and self._current_form is not None:
            field_name = self._attr(attrs, "name") or self._attr(attrs, "id") or ""
            if field_name:
                self._current_form.field_names.append(field_name)

        elif tag == "script":
            self._in_script = True
            src = self._attr(attrs, "src")
            if src:
                abs_src = urljoin(self._base_url, src)
                domain = urlparse(abs_src).netloc
                if domain in KNOWN_SCRIPT_DOMAINS:
                    self.detected_domains.add(domain)
                if len(self.scripts) < _MAX_SCRIPTS:
                    self.scripts.append(ScriptInfo(src=abs_src, content_snippet=""))
            else:
                self._inline_script_buf = []

        elif tag == "style":
            self._in_style = True

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag == "head":
            self._in_head = False
        elif tag == "form" and self._current_form is not None:
            self.forms.append(self._current_form)
            self._current_form = None
        elif tag == "script":
            self._in_script = False
            if self._inline_script_buf:
                snippet = "".join(self._inline_script_buf)[:_SNIPPET_LEN]
                if len(self.scripts) < _MAX_SCRIPTS:
                    self.scripts.append(ScriptInfo(src=None, content_snippet=snippet))
                # Check inline scripts for known service signatures
                self._scan_inline_script(snippet)
                self._inline_script_buf = []
        elif tag == "style":
            self._in_style = False
        self._current_tag = None

    def handle_data(self, data: str) -> None:
        data_stripped = data.strip()
        if not data_stripped:
            return

        if self._in_script:
            self._inline_script_buf.append(data)
            return

        if self._in_style:
            return

        tag = self._current_tag
        if tag == "title" and not self.title:
            self.title = data_stripped
        elif tag == "h1":
            self.h1.append(data_stripped)
        elif tag == "h2":
            self.h2.append(data_stripped)
        elif tag == "a" and self.links:
            # Backfill the most recent link's text
            if not self.links[-1].text:
                self.links[-1].text = data_stripped[:120]

        # Accumulate readable text (skip head, scripts, styles)
        if tag not in self._skip_tags and not self._in_head:
            if len("".join(self._text_parts)) < _MAX_TEXT_CHARS:
                self._text_parts.append(data_stripped)

    # ── Inline script scanning ─────────────────────────────────────────────────

    def _scan_inline_script(self, snippet: str) -> None:
        """Check inline script text for known third-party service signatures."""
        patterns = {
            "gtag(": "www.googletagmanager.com",
            "ga(": "www.google-analytics.com",
            "fbq(": "connect.facebook.net",
            "Stripe(": "js.stripe.com",
            "posthog.": "posthog.com",
            "Intercom(": "widget.intercom.io",
            "amplitude.": "cdn.amplitude.com",
            "hotjar": "static.hotjar.com",
            "clarity": "www.clarity.ms",
            "supabase": "supabase.co",
            "firebase": "firebase.googleapis.com",
        }
        for pattern, domain in patterns.items():
            if pattern.lower() in snippet.lower():
                self.detected_domains.add(domain)

    # ── Result builder ─────────────────────────────────────────────────────────

    def get_text_content(self) -> str:
        return " ".join(self._text_parts)[:_MAX_TEXT_CHARS]


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────


def parse_html(
    html: str,
    url: str,
    final_url: str,
    status_code: int,
) -> ParsedPage:
    """
    Parse raw HTML and return a structured ParsedPage.

    Parameters
    ----------
    html:
        Raw HTML content as a string (already decoded).
    url:
        The original URL that was requested.
    final_url:
        The URL after any HTTP redirects.
    status_code:
        The HTTP status code of the response.

    Returns
    -------
    ParsedPage
        Fully populated page data ready for LLM consumption.
    """
    parser = _VibePilotHTMLParser(base_url=final_url)
    # Feed in chunks to be safe with large pages
    try:
        parser.feed(html)
    except Exception:  # noqa: BLE001
        pass  # Best-effort; partial results are still useful

    detected_domains = list(parser.detected_domains)
    domain_labels = [
        KNOWN_SCRIPT_DOMAINS[d] for d in detected_domains if d in KNOWN_SCRIPT_DOMAINS
    ]

    return ParsedPage(
        url=url,
        final_url=final_url,
        status_code=status_code,
        title=parser.title,
        meta_description=parser.meta.get("description"),
        meta_keywords=parser.meta.get("keywords"),
        og_title=parser.meta.get("og_title"),
        og_description=parser.meta.get("og_description"),
        h1_tags=parser.h1[:5],
        h2_tags=parser.h2[:10],
        links=parser.links[:_MAX_LINKS],
        forms=parser.forms,
        scripts=parser.scripts[:_MAX_SCRIPTS],
        detected_script_domains=domain_labels,
        text_content=parser.get_text_content(),
    )


def build_page_summary(page: ParsedPage) -> str:
    """
    Build a compact, human-readable summary of a ParsedPage.
    Used as the LLM prompt context in Step 2.
    """
    lines: list[str] = []
    lines.append(f"URL: {page.final_url}  (status {page.status_code})")
    if page.title:
        lines.append(f"Title: {page.title}")
    if page.meta_description:
        lines.append(f"Meta description: {page.meta_description}")
    if page.og_title:
        lines.append(f"OG title: {page.og_title}")
    if page.h1_tags:
        lines.append(f"H1 headings: {', '.join(page.h1_tags)}")
    if page.h2_tags:
        lines.append(f"H2 headings: {', '.join(page.h2_tags[:6])}")
    if page.detected_script_domains:
        lines.append(f"Detected third-party services: {', '.join(sorted(set(page.detected_script_domains)))}")
    if page.forms:
        for i, f in enumerate(page.forms, 1):
            lines.append(
                f"Form {i}: action={f.action} method={f.method} "
                f"fields=[{', '.join(f.field_names)}]"
            )
    external_links = [lk.href for lk in page.links if lk.is_external]
    if external_links:
        lines.append(f"External links ({len(external_links)}): {', '.join(external_links[:10])}")
    if page.text_content:
        lines.append(f"\nPage text (first {_MAX_TEXT_CHARS} chars):\n{page.text_content}")
    return "\n".join(lines)
