"""
app/schemas/fetch_result.py
Typed data structures produced by the HTML fetcher and parser.
These are internal schemas (not HTTP response models).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class LinkInfo:
    """A hyperlink found on the page."""
    href: str
    text: str
    is_external: bool


@dataclass
class FormInfo:
    """An HTML form found on the page."""
    action: str
    method: str
    field_names: list[str] = field(default_factory=list)


@dataclass
class ScriptInfo:
    """A <script> tag or inline script snippet."""
    src: Optional[str]          # None for inline scripts
    content_snippet: str        # first 300 chars of inline, or empty for external


@dataclass
class ParsedPage:
    """
    Structured data extracted from a single fetched HTML page.
    This is what the LLM (Step 2) will receive as its context.
    """
    url: str
    final_url: str              # URL after any redirects
    status_code: int
    title: Optional[str]
    meta_description: Optional[str]
    meta_keywords: Optional[str]
    og_title: Optional[str]
    og_description: Optional[str]
    h1_tags: list[str] = field(default_factory=list)
    h2_tags: list[str] = field(default_factory=list)
    links: list[LinkInfo] = field(default_factory=list)
    forms: list[FormInfo] = field(default_factory=list)
    scripts: list[ScriptInfo] = field(default_factory=list)
    # Well-known third-party script domains found in src attributes
    detected_script_domains: list[str] = field(default_factory=list)
    # Raw text content (capped to avoid token explosion)
    text_content: str = ""
    fetch_error: Optional[str] = None   # Set if the page could not be fetched


@dataclass
class FetchResult:
    """
    Top-level result of a fetch-and-parse operation.
    Wraps one or more ParsedPage objects (homepage + discovered sub-pages).
    """
    requested_url: str
    pages: list[ParsedPage] = field(default_factory=list)
    total_fetch_time_ms: int = 0
    error: Optional[str] = None         # Set if the initial fetch failed entirely
