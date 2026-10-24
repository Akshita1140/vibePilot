"""
tests/test_fetcher.py
Unit tests for app/services/fetcher.py

Uses respx to mock all outbound HTTP calls — no real network requests.
Tests run with pytest-anyio for async support.
"""

from __future__ import annotations

import pytest
import respx
import httpx

from app.services.fetcher import fetch_app
from app.schemas.fetch_result import FetchResult


# ─────────────────────────────────────────────────────────────────────────────
# Helper HTML fixtures
# ─────────────────────────────────────────────────────────────────────────────

SIMPLE_HTML = """
<!DOCTYPE html>
<html>
<head>
  <title>Test App</title>
  <meta name="description" content="A test application">
  <script src="https://js.stripe.com/v3/"></script>
</head>
<body>
  <h1>Welcome</h1>
  <a href="/login">Login</a>
  <a href="/dashboard">Dashboard</a>
  <a href="https://github.com/external">External</a>
</body>
</html>
"""

MINIMAL_HTML = "<html><head><title>Min</title></head><body><p>Hello</p></body></html>"

TARGET_URL = "https://test-app.example.com"
LOGIN_URL = "https://test-app.example.com/login"
DASHBOARD_URL = "https://test-app.example.com/dashboard"


# ─────────────────────────────────────────────────────────────────────────────
# Happy-path tests
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.anyio
@respx.mock
async def test_fetch_app_returns_fetch_result() -> None:
    """fetch_app should always return a FetchResult."""
    respx.get(TARGET_URL).mock(return_value=httpx.Response(200, text=SIMPLE_HTML))
    respx.get(LOGIN_URL).mock(return_value=httpx.Response(200, text=MINIMAL_HTML))
    respx.get(DASHBOARD_URL).mock(return_value=httpx.Response(200, text=MINIMAL_HTML))

    result = await fetch_app(TARGET_URL)
    assert isinstance(result, FetchResult)


@pytest.mark.anyio
@respx.mock
async def test_fetch_app_homepage_is_first_page() -> None:
    """The first page in the result should be the homepage."""
    respx.get(TARGET_URL).mock(return_value=httpx.Response(200, text=SIMPLE_HTML))
    respx.get(LOGIN_URL).mock(return_value=httpx.Response(200, text=MINIMAL_HTML))
    respx.get(DASHBOARD_URL).mock(return_value=httpx.Response(200, text=MINIMAL_HTML))

    result = await fetch_app(TARGET_URL)
    assert len(result.pages) >= 1
    assert result.pages[0].url == TARGET_URL


@pytest.mark.anyio
@respx.mock
async def test_fetch_app_fetches_sub_pages() -> None:
    """Fetcher should discover and fetch sub-pages like /login and /dashboard."""
    respx.get(TARGET_URL).mock(return_value=httpx.Response(200, text=SIMPLE_HTML))
    respx.get(LOGIN_URL).mock(return_value=httpx.Response(200, text=MINIMAL_HTML))
    respx.get(DASHBOARD_URL).mock(return_value=httpx.Response(200, text=MINIMAL_HTML))

    result = await fetch_app(TARGET_URL)
    fetched_urls = [p.url for p in result.pages]
    # At least one sub-page should have been fetched
    assert len(result.pages) > 1, f"Expected >1 pages, got: {fetched_urls}"


@pytest.mark.anyio
@respx.mock
async def test_fetch_app_parses_title() -> None:
    """Homepage ParsedPage should have the correct title."""
    respx.get(TARGET_URL).mock(return_value=httpx.Response(200, text=SIMPLE_HTML))
    respx.get(LOGIN_URL).mock(return_value=httpx.Response(200, text=MINIMAL_HTML))
    respx.get(DASHBOARD_URL).mock(return_value=httpx.Response(200, text=MINIMAL_HTML))

    result = await fetch_app(TARGET_URL)
    assert result.pages[0].title == "Test App"


@pytest.mark.anyio
@respx.mock
async def test_fetch_app_detects_stripe() -> None:
    """Stripe script tag should appear in detected_script_domains."""
    respx.get(TARGET_URL).mock(return_value=httpx.Response(200, text=SIMPLE_HTML))
    respx.get(LOGIN_URL).mock(return_value=httpx.Response(200, text=MINIMAL_HTML))
    respx.get(DASHBOARD_URL).mock(return_value=httpx.Response(200, text=MINIMAL_HTML))

    result = await fetch_app(TARGET_URL)
    homepage = result.pages[0]
    assert "Stripe" in homepage.detected_script_domains


@pytest.mark.anyio
@respx.mock
async def test_fetch_app_records_elapsed_time() -> None:
    """total_fetch_time_ms should be a non-negative integer."""
    respx.get(TARGET_URL).mock(return_value=httpx.Response(200, text=MINIMAL_HTML))

    result = await fetch_app(TARGET_URL)
    assert isinstance(result.total_fetch_time_ms, int)
    assert result.total_fetch_time_ms >= 0


@pytest.mark.anyio
@respx.mock
async def test_fetch_app_stores_status_code() -> None:
    """HomePage status code should be stored."""
    respx.get(TARGET_URL).mock(return_value=httpx.Response(200, text=MINIMAL_HTML))

    result = await fetch_app(TARGET_URL)
    assert result.pages[0].status_code == 200


# ─────────────────────────────────────────────────────────────────────────────
# Error handling
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.anyio
@respx.mock
async def test_fetch_app_handles_timeout() -> None:
    """Timeout should be captured in fetch_error, not raised."""
    respx.get(TARGET_URL).mock(side_effect=httpx.TimeoutException("timeout"))

    result = await fetch_app(TARGET_URL)
    assert result.pages[0].fetch_error is not None
    assert "timeout" in result.pages[0].fetch_error.lower()


@pytest.mark.anyio
@respx.mock
async def test_fetch_app_handles_connection_error() -> None:
    """Connection error should be captured in fetch_error, not raised."""
    respx.get(TARGET_URL).mock(side_effect=httpx.ConnectError("refused"))

    result = await fetch_app(TARGET_URL)
    assert result.pages[0].fetch_error is not None


@pytest.mark.anyio
@respx.mock
async def test_fetch_app_handles_404() -> None:
    """A 404 response should still produce a ParsedPage (not an error)."""
    respx.get(TARGET_URL).mock(
        return_value=httpx.Response(404, text="<html><body>Not Found</body></html>")
    )

    result = await fetch_app(TARGET_URL)
    assert result.pages[0].status_code == 404
    assert result.pages[0].fetch_error is None


@pytest.mark.anyio
@respx.mock
async def test_fetch_app_sub_page_failure_does_not_break_result() -> None:
    """If a sub-page fetch fails, the result should still contain the homepage."""
    respx.get(TARGET_URL).mock(return_value=httpx.Response(200, text=SIMPLE_HTML))
    respx.get(LOGIN_URL).mock(side_effect=httpx.TimeoutException("timeout"))
    respx.get(DASHBOARD_URL).mock(side_effect=httpx.TimeoutException("timeout"))

    result = await fetch_app(TARGET_URL)
    # Homepage must still be present
    assert len(result.pages) >= 1
    assert result.pages[0].title == "Test App"
    assert result.pages[0].fetch_error is None
