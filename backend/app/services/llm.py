"""
app/services/llm.py
Google Gemini integration — converts a FetchResult into a structured AppMap.

Architecture
────────────
1.  Build a rich text prompt from the fetched page data.
2.  Call gemini-2.0-flash with structured JSON output (response_schema).
3.  Gemini returns a validated LLMAppMap Pydantic object.
4.  Map LLMAppMap → AppMap (our HTTP response model).

Two-model design
────────────────
We keep LLM-specific Pydantic models (LLMAppMap, etc.) separate from the HTTP
response models in app/models/responses.py.  Reasons:
  - The LLM schema uses simple str fields everywhere (no HttpUrl, no Enums)
    so Gemini can produce valid JSON without type-coercion friction.
  - The HTTP response models can evolve independently.
  - The mapping function is a clean, testable boundary.

Failure handling
────────────────
generate_app_map() never raises.  On any error it returns None so the caller
can fall back to the demo fixture.
"""

from __future__ import annotations

import logging
import re
import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field

from app.config import settings
from app.models.responses import (
    AnalysisMeta,
    AnalysisMode,
    AnalyzeResponse,
    AppMap,
    DataPoint,
    DetectedFeature,
    DetectedService,
    GapStatus,
    Page,
    Severity,
    SetupGap,
)
from app.schemas.fetch_result import FetchResult
from app.services.parser import build_page_summary

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# LLM-specific Pydantic schemas (plain str types — no HttpUrl, no Enum)
# ─────────────────────────────────────────────────────────────────────────────


class _LLMDetectedFeature(BaseModel):
    name: str = Field(description="Short feature name, e.g. 'Google Sign-In button'.")
    description: str = Field(description="What this feature does.")
    requires_auth: bool = Field(default=False, description="True if auth required.")
    notes: Optional[str] = Field(default=None, description="Provider SDK, quirks, etc.")


class _LLMPage(BaseModel):
    path: str = Field(description="Relative URL path, e.g. '/auth/callback'.")
    title: Optional[str] = Field(default=None, description="Page title if known.")
    description: str = Field(description="Plain-English page purpose.")
    detected_features: list[_LLMDetectedFeature] = Field(default_factory=list)


class _LLMDetectedService(BaseModel):
    name: str = Field(description="Provider name, e.g. 'Google OAuth 2.0'.")
    category: str = Field(description="'authentication' | 'payments' | 'analytics' | 'hosting' | 'database' | 'other'.")
    evidence: str = Field(description="Why this service was flagged.")
    dashboard_url: Optional[str] = Field(default=None, description="Provider dashboard URL.")
    configuration_required: bool = Field(default=True)


class _LLMDataPoint(BaseModel):
    category: str = Field(description="Data category, e.g. 'email address'.")
    source: str = Field(description="Where collected, e.g. 'signup form'.")
    notes: Optional[str] = Field(default=None, description="Compliance or privacy notes.")


class _LLMSetupGap(BaseModel):
    id: str = Field(description="Kebab-case slug, e.g. 'oauth-redirect-uri-missing'.")
    title: str = Field(description="Short gap title.")
    description: str = Field(description="Problem and its impact.")
    severity: str = Field(description="'critical' | 'high' | 'medium' | 'low' | 'info'.")
    affected_service: Optional[str] = Field(default=None)
    suggested_action: str = Field(description="Plain-English remediation step.")
    can_autofix: bool = Field(
        default=False,
        description="True if VibePilot browser agent can fix this automatically.",
    )


class _LLMAppMap(BaseModel):
    """Structured Gemini output — maps 1-to-1 with our AppMap response model."""

    app_name: Optional[str] = Field(default=None, description="Inferred app name.")
    summary: str = Field(description="One-paragraph plain-English summary of the app.")
    pages: list[_LLMPage] = Field(default_factory=list)
    detected_services: list[_LLMDetectedService] = Field(default_factory=list)
    data_collected: list[_LLMDataPoint] = Field(default_factory=list)
    setup_gaps: list[_LLMSetupGap] = Field(default_factory=list)


# ─────────────────────────────────────────────────────────────────────────────
# Prompt builder
# ─────────────────────────────────────────────────────────────────────────────

_SYSTEM_INSTRUCTION = """\
You are VibePilot's App Map engine. Your job is to analyse a web application and \
produce a structured App Map in JSON format.

An App Map describes:
- Pages/routes and their purpose
- Detected third-party services (OAuth providers, payment SDKs, analytics, hosting)
- Data collected from users
- Setup gaps: misconfigurations, missing dashboard settings, or security issues that \
  would prevent the app from working correctly in production

Rules:
1. Only report what you can actually infer from the provided page data.
2. Be specific about evidence — cite script URLs, form fields, or page content.
3. Severity: 'critical' = breaks core function; 'high' = likely production failure; \
   'medium' = should fix; 'low' = nice to fix; 'info' = informational.
4. For setup_gaps, set can_autofix=true ONLY for provider dashboard changes that a \
   browser agent could make (e.g. adding a redirect URI in Google Cloud Console).
5. Produce at least one setup_gap if any third-party services require configuration.
6. Use kebab-case IDs for setup_gaps (e.g. 'google-oauth-redirect-uri-missing').
"""


def _build_prompt(fetch_result: FetchResult, description: Optional[str]) -> str:
    """Assemble the full user prompt from fetched page data."""
    lines: list[str] = []

    lines.append(f"## App URL\n{fetch_result.requested_url}\n")

    if description:
        lines.append(f"## User-provided context\n{description}\n")

    lines.append(f"## Fetched pages ({len(fetch_result.pages)} total)\n")
    for i, page in enumerate(fetch_result.pages, 1):
        lines.append(f"### Page {i}")
        lines.append(build_page_summary(page))
        lines.append("")

    if fetch_result.error:
        lines.append(f"## Fetch note\nThe homepage could not be fetched: {fetch_result.error}")

    lines.append(
        "\n## Task\n"
        "Produce a complete App Map JSON object for this application. "
        "Focus especially on:\n"
        "- Any OAuth / authentication configuration (redirect URIs, callback URLs)\n"
        "- Missing environment variables or secrets the app needs\n"
        "- Third-party services that need dashboard configuration\n"
        "- Data privacy implications of collected user data\n"
    )

    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────────────────────
# LLMAppMap → AppMap converter
# ─────────────────────────────────────────────────────────────────────────────

_VALID_SEVERITIES = {s.value for s in Severity}


def _to_severity(raw: str) -> Severity:
    """Coerce an LLM severity string to the Severity enum, defaulting to 'medium'."""
    clean = (raw or "medium").lower().strip()
    return Severity(clean) if clean in _VALID_SEVERITIES else Severity.medium


def _to_gap_id(raw: str, index: int) -> str:
    """Ensure gap ID is a valid non-empty kebab-case slug."""
    if not raw:
        return f"gap-{index}"
    return re.sub(r"[^a-z0-9-]", "-", raw.lower())[:80]


def _map_llm_to_app_map(
    llm: _LLMAppMap,
    app_url: str,
    fetch_result: FetchResult,
) -> AppMap:
    """Convert an _LLMAppMap to the public AppMap response model."""

    pages = [
        Page(
            path=p.path,
            title=p.title,
            description=p.description,
            detected_features=[
                DetectedFeature(
                    name=f.name,
                    description=f.description,
                    requires_auth=f.requires_auth,
                    notes=f.notes,
                )
                for f in p.detected_features
            ],
        )
        for p in llm.pages
    ]

    detected_services = [
        DetectedService(
            name=s.name,
            category=s.category,
            evidence=s.evidence,
            dashboard_url=s.dashboard_url,  # type: ignore[arg-type]
            configuration_required=s.configuration_required,
        )
        for s in llm.detected_services
    ]

    data_collected = [
        DataPoint(category=d.category, source=d.source, notes=d.notes)
        for d in llm.data_collected
    ]

    setup_gaps = [
        SetupGap(
            id=_to_gap_id(g.id, i),
            title=g.title,
            description=g.description,
            severity=_to_severity(g.severity),
            status=GapStatus.open,
            affected_service=g.affected_service,
            suggested_action=g.suggested_action,
            can_autofix=g.can_autofix,
        )
        for i, g in enumerate(llm.setup_gaps)
    ]

    # Use the final URL (after redirects) from the homepage, fall back to requested
    final_url = app_url
    if fetch_result.pages and not fetch_result.pages[0].fetch_error:
        final_url = fetch_result.pages[0].final_url

    meta = AnalysisMeta(
        mode=AnalysisMode.live,
        analysed_at=datetime.now(tz=timezone.utc),
        analyser_version="0.1.0-llm",
        disclaimer=None,  # No disclaimer needed — this is a real analysis
    )

    return AppMap(
        app_url=final_url,
        app_name=llm.app_name,
        summary=llm.summary,
        pages=pages,
        detected_services=detected_services,
        data_collected=data_collected,
        setup_gaps=setup_gaps,
        meta=meta,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────


async def generate_app_map(
    fetch_result: FetchResult,
    app_url: str,
    description: Optional[str] = None,
) -> Optional[AnalyzeResponse]:
    """
    Call Gemini to produce a structured App Map from fetched page data.

    Parameters
    ----------
    fetch_result:
        The FetchResult produced by the HTTP fetcher (Step 1).
    app_url:
        The original submitted URL (used in the response).
    description:
        Optional user-provided context about the app or problem.

    Returns
    -------
    AnalyzeResponse | None
        A fully populated response on success.
        None if the API key is missing, the call fails, or parsing fails.
        The caller should fall back to the demo fixture on None.
    """
    if not settings.gemini_api_key:
        logger.info(
            "GEMINI_API_KEY not set — skipping LLM analysis and using demo fixture."
        )
        return None

    try:
        # Import inside function so the module loads even without google-genai installed
        from google import genai  # type: ignore[import-untyped]
        from google.genai import types  # type: ignore[import-untyped]
    except ImportError:
        logger.warning("google-genai not installed — cannot run LLM analysis.")
        return None

    prompt = _build_prompt(fetch_result, description)

    logger.info(
        "Calling Gemini | model=%s | prompt_chars=%d",
        settings.gemini_model,
        len(prompt),
    )

    try:
        client = genai.Client(api_key=settings.gemini_api_key)

        response = await client.aio.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=_SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                response_schema=_LLMAppMap,
                temperature=0.2,   # Low temperature → more deterministic, structured output
                max_output_tokens=8192,
            ),
        )

        llm_output: _LLMAppMap = response.parsed

        if llm_output is None:
            logger.warning("Gemini returned None parsed output.")
            return None

        logger.info(
            "Gemini success | pages=%d | services=%d | gaps=%d",
            len(llm_output.pages),
            len(llm_output.detected_services),
            len(llm_output.setup_gaps),
        )

    except Exception as exc:  # noqa: BLE001
        logger.warning("Gemini call failed: %s", exc)
        return None

    try:
        app_map = _map_llm_to_app_map(llm_output, app_url, fetch_result)
        return AnalyzeResponse(
            job_id=str(uuid.uuid4()),
            status="completed",
            app_map=app_map,
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Failed to map LLM output to AppMap: %s", exc)
        return None
