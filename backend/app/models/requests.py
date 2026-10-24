"""
app/models/requests.py
Pydantic request models for the VibePilot API.
"""

from __future__ import annotations

from pydantic import BaseModel, Field, HttpUrl, field_validator
from typing import Optional


class AnalyzeRequest(BaseModel):
    """
    Request body for POST /api/analyze.

    Fields
    ------
    app_url:
        The publicly accessible URL of the app to analyse.
        Must be a valid HTTP or HTTPS URL.
    repository_url:
        (Optional) A link to the app's source repository (GitHub, GitLab, etc.).
        When provided it must also be a valid HTTP/HTTPS URL.
    description:
        (Optional) Free-text description supplied by the user to give the
        analyser more context about what the app does or what problem they
        are experiencing.
    """

    app_url: HttpUrl = Field(
        ...,
        description="Publicly accessible HTTP/HTTPS URL of the target application.",
        examples=["https://my-app.vercel.app"],
    )
    repository_url: Optional[HttpUrl] = Field(
        default=None,
        description="Optional HTTP/HTTPS URL of the app's source repository.",
        examples=["https://github.com/user/my-app"],
    )
    description: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Optional free-text context about the app or problem to investigate.",
        examples=["Google OAuth redirect_uri_mismatch on the deployed domain."],
    )

    @field_validator("app_url", mode="before")
    @classmethod
    def app_url_must_be_http(cls, v: object) -> object:
        """Reject non-HTTP(S) schemes before Pydantic's URL parser runs."""
        if isinstance(v, str) and not v.startswith(("http://", "https://")):
            raise ValueError(
                "app_url must be an HTTP or HTTPS URL "
                f"(received: {v!r})"
            )
        return v

    @field_validator("repository_url", mode="before")
    @classmethod
    def repo_url_must_be_http(cls, v: object) -> object:
        """Reject non-HTTP(S) schemes for repository_url."""
        if v is None:
            return v
        if isinstance(v, str) and not v.startswith(("http://", "https://")):
            raise ValueError(
                "repository_url must be an HTTP or HTTPS URL "
                f"(received: {v!r})"
            )
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "app_url": "https://my-saas.vercel.app",
                "repository_url": "https://github.com/user/my-saas",
                "description": "Sign-in with Google fails with redirect_uri_mismatch.",
            }
        }
    }
