"""
app/models/responses.py
Pydantic response models for the VibePilot App Map and all its nested objects.

Schema overview
───────────────
AnalyzeResponse
└── AppMap
    ├── page: Page[]
    │   └── detected_feature: DetectedFeature[]
    ├── detected_service: DetectedService[]
    ├── data_collected: DataPoint[]
    ├── setup_gap: SetupGap[]
    └── analysis_meta: AnalysisMeta
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, HttpUrl


# ─────────────────────────────────────────────────────────────────────────────
# Enumerations
# ─────────────────────────────────────────────────────────────────────────────


class Severity(str, Enum):
    """Severity level for a SetupGap."""

    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"
    info = "info"


class GapStatus(str, Enum):
    """Current resolution status of a SetupGap."""

    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    wont_fix = "wont_fix"


class AnalysisMode(str, Enum):
    """How the analysis was produced."""

    demo = "demo"          # Clearly-labelled fixture; no real scan was performed.
    live = "live"          # Real LLM + browser analysis (not implemented yet).


# ─────────────────────────────────────────────────────────────────────────────
# Nested leaf models
# ─────────────────────────────────────────────────────────────────────────────


class DetectedFeature(BaseModel):
    """A UI feature or behaviour identified on a page."""

    name: str = Field(..., description="Short human-readable feature name.")
    description: str = Field(..., description="What the feature does or exposes.")
    requires_auth: bool = Field(
        default=False,
        description="True if this feature requires the user to be authenticated.",
    )
    notes: Optional[str] = Field(
        default=None,
        description="Extra context, e.g. provider SDK detected, known quirks.",
    )


class Page(BaseModel):
    """A distinct page or route discovered in the target application."""

    path: str = Field(
        ...,
        description="Relative URL path, e.g. '/dashboard' or '/auth/callback'.",
    )
    title: Optional[str] = Field(
        default=None,
        description="<title> tag content or inferred human-readable name.",
    )
    description: str = Field(
        ...,
        description="Plain-English description of what this page does.",
    )
    detected_features: list[DetectedFeature] = Field(
        default_factory=list,
        description="Features detected on this page.",
    )


class DetectedService(BaseModel):
    """A third-party service or integration detected in the application."""

    name: str = Field(..., description="Provider name, e.g. 'Google OAuth 2.0'.")
    category: str = Field(
        ...,
        description="Category, e.g. 'authentication', 'payments', 'analytics'.",
    )
    evidence: str = Field(
        ...,
        description="Why this service was flagged (script URLs, SDK imports, etc.).",
    )
    dashboard_url: Optional[HttpUrl] = Field(
        default=None,
        description="Link to the provider's configuration dashboard.",
    )
    configuration_required: bool = Field(
        default=True,
        description="True if manual dashboard configuration is likely required.",
    )


class DataPoint(BaseModel):
    """A category of user data the application appears to collect or process."""

    category: str = Field(
        ...,
        description="High-level data category, e.g. 'email address', 'payment card'.",
    )
    source: str = Field(
        ...,
        description="Where the data is collected, e.g. 'signup form', 'Stripe SDK'.",
    )
    notes: Optional[str] = Field(
        default=None,
        description="Compliance or privacy notes relevant to this data category.",
    )


class SetupGap(BaseModel):
    """
    A misconfiguration, missing step, or potential security issue identified
    during analysis that requires action before the app is production-ready.
    """

    id: str = Field(
        ...,
        description="Stable slug identifier for this gap, e.g. 'oauth-redirect-uri'.",
    )
    title: str = Field(..., description="Short human-readable title.")
    description: str = Field(
        ...,
        description="Detailed explanation of the problem and its impact.",
    )
    severity: Severity = Field(..., description="How urgent the gap is.")
    status: GapStatus = Field(
        default=GapStatus.open,
        description="Current resolution state.",
    )
    affected_service: Optional[str] = Field(
        default=None,
        description="The provider or service this gap relates to.",
    )
    suggested_action: str = Field(
        ...,
        description="Recommended remediation step in plain English.",
    )
    can_autofix: bool = Field(
        default=False,
        description=(
            "True if VibePilot's browser agent can resolve this gap automatically "
            "(subject to user approval)."
        ),
    )


class AnalysisMeta(BaseModel):
    """Metadata describing how and when the analysis was produced."""

    mode: AnalysisMode = Field(
        ...,
        description=(
            "Indicates whether this is a DEMO fixture or a real LIVE analysis. "
            "Demo responses are clearly labelled and do NOT reflect an actual scan."
        ),
    )
    analysed_at: datetime = Field(
        ...,
        description="UTC timestamp when the analysis was created.",
    )
    analyser_version: str = Field(
        default="0.1.0-foundation",
        description="VibePilot backend version that produced this analysis.",
    )
    disclaimer: Optional[str] = Field(
        default=None,
        description="Human-readable caveat shown to the user for demo responses.",
    )


# ─────────────────────────────────────────────────────────────────────────────
# Top-level response models
# ─────────────────────────────────────────────────────────────────────────────


class AppMap(BaseModel):
    """
    Structured representation of the target application, produced by VibePilot's
    analysis pipeline.
    """

    app_url: str = Field(..., description="The URL that was analysed.")
    app_name: Optional[str] = Field(
        default=None,
        description="Inferred application name (from title tag, meta tags, etc.).",
    )
    summary: str = Field(
        ...,
        description="One-paragraph plain-English summary of what the app does.",
    )
    pages: list[Page] = Field(
        default_factory=list,
        description="Pages / routes discovered in the application.",
    )
    detected_services: list[DetectedService] = Field(
        default_factory=list,
        description="Third-party services identified in the application.",
    )
    data_collected: list[DataPoint] = Field(
        default_factory=list,
        description="Categories of user data the app appears to collect or handle.",
    )
    setup_gaps: list[SetupGap] = Field(
        default_factory=list,
        description="Misconfigurations or outstanding setup steps found.",
    )
    meta: AnalysisMeta = Field(
        ...,
        description="Metadata about this analysis run.",
    )


class AnalyzeResponse(BaseModel):
    """Root response envelope for POST /api/analyze."""

    job_id: str = Field(
        ...,
        description=(
            "Unique identifier for this analysis job. "
            "Will be used to stream progress and retrieve receipts in future versions."
        ),
    )
    status: str = Field(
        ...,
        description="Current job status, e.g. 'completed', 'analyzing', 'failed'.",
    )
    app_map: AppMap = Field(..., description="The structured App Map for the analysed URL.")


class HealthResponse(BaseModel):
    """Response model for GET /health."""

    status: str = Field(default="ok")
    service: str = Field(default="vibepilot-backend")
