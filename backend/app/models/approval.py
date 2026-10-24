"""
app/models/approval.py
Request / response models for the human-in-the-loop approval gate.

Flow
────
1. Pipeline reaches AWAITING_APPROVAL and pushes an `awaiting_approval` SSE event
   listing the gaps that have can_autofix=True.
2. The frontend presents the gap list to the user.
3. User calls POST /jobs/{id}/approve with the gap IDs they want actioned.
4. The pipeline resumes: approved gaps go to EXECUTING, the rest to GUIDED.
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from app.models.jobs import JobState


class PendingGap(BaseModel):
    """A gap that is pending the user's approval decision."""

    id: str = Field(description="Gap slug, e.g. 'oauth-redirect-uri-missing'.")
    title: str
    description: str
    severity: str
    affected_service: Optional[str] = None
    suggested_action: str
    can_autofix: bool = True


class ApprovalRequest(BaseModel):
    """
    Body for POST /jobs/{id}/approve.

    Either approve a subset of gaps (approved_gap_ids) or reject all (reject_all=True).
    Gap IDs not in either list are skipped (left as GUIDED).
    """

    approved_gap_ids: list[str] = Field(
        default_factory=list,
        description=(
            "IDs of gaps the user approves for automated fixing. "
            "VibePilot's browser agent will action these."
        ),
    )
    rejected_gap_ids: list[str] = Field(
        default_factory=list,
        description=(
            "IDs of gaps the user explicitly rejects. "
            "These will be marked GUIDED (manual action required)."
        ),
    )
    reject_all: bool = Field(
        default=False,
        description="If true, reject all pending gaps and move the job to GUIDED.",
    )
    notes: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Optional comment from the user (stored for the job receipt).",
    )


class ApprovalResponse(BaseModel):
    """Response returned immediately after the approval decision is recorded."""

    job_id: str
    approved_count: int
    rejected_count: int
    next_state: JobState = Field(
        description="State the job will transition to after this decision."
    )
    message: str
