"""
tests/test_parser.py
Unit tests for app/services/parser.py

These tests run completely offline — no HTTP requests are made.
"""

from __future__ import annotations

from app.services.parser import parse_html, build_page_summary
from app.schemas.fetch_result import ParsedPage


BASE_URL = "https://example.com"


# ─────────────────────────────────────────────────────────────────────────────
# Title and meta extraction
# ─────────────────────────────────────────────────────────────────────────────

def test_parser_extracts_title() -> None:
    html = "<html><head><title>My App</title></head><body></body></html>"
    page = parse_html(html, BASE_URL, BASE_URL, 200)
    assert page.title == "My App"


def test_parser_extracts_meta_description() -> None:
    html = '<html><head><meta name="description" content="Best app ever"></head></html>'
    page = parse_html(html, BASE_URL, BASE_URL, 200)
    assert page.meta_description == "Best app ever"


def test_parser_extracts_og_title() -> None:
    html = '<html><head><meta property="og:title" content="OG Title"></head></html>'
    page = parse_html(html, BASE_URL, BASE_URL, 200)
    assert page.og_title == "OG Title"


def test_parser_extracts_og_description() -> None:
    html = '<html><head><meta property="og:description" content="OG Desc"></head></html>'
    page = parse_html(html, BASE_URL, BASE_URL, 200)
    assert page.og_description == "OG Desc"


def test_parser_extracts_meta_keywords() -> None:
    html = '<html><head><meta name="keywords" content="saas, app, tool"></head></html>'
    page = parse_html(html, BASE_URL, BASE_URL, 200)
    assert page.meta_keywords == "saas, app, tool"


# ─────────────────────────────────────────────────────────────────────────────
# Headings
# ─────────────────────────────────────────────────────────────────────────────

def test_parser_extracts_h1() -> None:
    html = "<html><body><h1>Welcome to MyApp</h1></body></html>"
    page = parse_html(html, BASE_URL, BASE_URL, 200)
    assert "Welcome to MyApp" in page.h1_tags


def test_parser_extracts_h2() -> None:
    html = "<html><body><h2>Features</h2><h2>Pricing</h2></body></html>"
    page = parse_html(html, BASE_URL, BASE_URL, 200)
    assert len(page.h2_tags) == 2


# ─────────────────────────────────────────────────────────────────────────────
# Links
# ─────────────────────────────────────────────────────────────────────────────

def test_parser_classifies_external_links() -> None:
    html = '<html><body><a href="https://stripe.com/docs">Stripe</a></body></html>'
    page = parse_html(html, BASE_URL, BASE_URL, 200)
    external = [lk for lk in page.links if lk.is_external]
    assert len(external) == 1
    assert "stripe.com" in external[0].href


def test_parser_classifies_internal_links() -> None:
    html = '<html><body><a href="/dashboard">Dashboard</a></body></html>'
    page = parse_html(html, BASE_URL, BASE_URL, 200)
    internal = [lk for lk in page.links if not lk.is_external]
    assert len(internal) == 1
    assert internal[0].href == "https://example.com/dashboard"


def test_parser_skips_anchor_and_js_links() -> None:
    html = '<html><body><a href="#section">Anchor</a><a href="javascript:void(0)">JS</a></body></html>'
    page = parse_html(html, BASE_URL, BASE_URL, 200)
    assert len(page.links) == 0


# ─────────────────────────────────────────────────────────────────────────────
# Forms
# ─────────────────────────────────────────────────────────────────────────────

def test_parser_extracts_form() -> None:
    html = """
    <html><body>
      <form action="/login" method="post">
        <input name="email" type="email">
        <input name="password" type="password">
      </form>
    </body></html>
    """
    page = parse_html(html, BASE_URL, BASE_URL, 200)
    assert len(page.forms) == 1
    form = page.forms[0]
    assert "email" in form.field_names
    assert "password" in form.field_names
    assert form.method == "POST"


def test_parser_resolves_relative_form_action() -> None:
    html = '<html><body><form action="/api/submit"></form></body></html>'
    page = parse_html(html, BASE_URL, BASE_URL, 200)
    assert page.forms[0].action == "https://example.com/api/submit"


# ─────────────────────────────────────────────────────────────────────────────
# Scripts and third-party service detection
# ─────────────────────────────────────────────────────────────────────────────

def test_parser_detects_stripe_script() -> None:
    html = '<html><head><script src="https://js.stripe.com/v3/"></script></head></html>'
    page = parse_html(html, BASE_URL, BASE_URL, 200)
    assert "Stripe" in page.detected_script_domains


def test_parser_detects_google_analytics_inline() -> None:
    html = """
    <html><head>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
    </script>
    </head></html>
    """
    page = parse_html(html, BASE_URL, BASE_URL, 200)
    # gtag( inline signature should be detected
    assert any("Google" in d for d in page.detected_script_domains)


def test_parser_detects_supabase_inline() -> None:
    html = """
    <html><head>
    <script>
      const supabase = createClient('https://xyz.supabase.co', 'key');
    </script>
    </head></html>
    """
    page = parse_html(html, BASE_URL, BASE_URL, 200)
    assert any("Supabase" in d for d in page.detected_script_domains)


# ─────────────────────────────────────────────────────────────────────────────
# Status code and URL passthrough
# ─────────────────────────────────────────────────────────────────────────────

def test_parser_stores_status_code() -> None:
    page = parse_html("<html></html>", BASE_URL, BASE_URL, 404)
    assert page.status_code == 404


def test_parser_stores_final_url() -> None:
    final = "https://example.com/home"
    page = parse_html("<html></html>", BASE_URL, final, 200)
    assert page.final_url == final


# ─────────────────────────────────────────────────────────────────────────────
# Text content extraction
# ─────────────────────────────────────────────────────────────────────────────

def test_parser_extracts_text_content() -> None:
    html = "<html><body><p>Hello world from VibePilot.</p></body></html>"
    page = parse_html(html, BASE_URL, BASE_URL, 200)
    assert "Hello world from VibePilot" in page.text_content


def test_parser_excludes_script_text_from_content() -> None:
    html = "<html><body><script>var secret = 'hidden';</script><p>Visible</p></body></html>"
    page = parse_html(html, BASE_URL, BASE_URL, 200)
    assert "hidden" not in page.text_content
    assert "Visible" in page.text_content


# ─────────────────────────────────────────────────────────────────────────────
# Empty / malformed HTML
# ─────────────────────────────────────────────────────────────────────────────

def test_parser_handles_empty_html() -> None:
    page = parse_html("", BASE_URL, BASE_URL, 200)
    assert page.title is None
    assert page.links == []


def test_parser_handles_malformed_html() -> None:
    """Parser should not raise on broken HTML."""
    html = "<html<body><h1>Broken</h1></body>"
    page = parse_html(html, BASE_URL, BASE_URL, 200)
    assert isinstance(page, ParsedPage)


# ─────────────────────────────────────────────────────────────────────────────
# build_page_summary
# ─────────────────────────────────────────────────────────────────────────────

def test_build_page_summary_contains_url() -> None:
    html = "<html><head><title>Test</title></head></html>"
    page = parse_html(html, BASE_URL, BASE_URL, 200)
    summary = build_page_summary(page)
    assert BASE_URL in summary


def test_build_page_summary_contains_title() -> None:
    html = "<html><head><title>My SaaS</title></head></html>"
    page = parse_html(html, BASE_URL, BASE_URL, 200)
    summary = build_page_summary(page)
    assert "My SaaS" in summary
