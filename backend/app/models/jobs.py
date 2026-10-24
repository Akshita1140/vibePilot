"""
app/models/jobs.py
Job state machine definitions and SSE event schemas.

Job lifecycle
─────────────
QUEUED → ANALYZING → DIAGNOSING → AWAITING_APPROVAL → EXECUTING → VERIFYING → DONE
                                                                 → FAILED
                                                                 → GUIDED   (human handoff)

SSE event types
───────────────
Each event is one JSON object on the `data:` line.
The `event:` field tells the frontend which handler to call.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


# ─────────────────────────────────────────────────────────────────────────────
# Job state machine
# ─────────────────────────────────────────────────────────────────────────────


class JobState(str, Enum):
    """All possible states of a VibePilot analysis job."""

    QUEUED = "QUEUED"
    ANALYZING = "ANALYZING"          # Fetching pages + running LLM
    DIAGNOSING = "DIAGNOSING"        # Browser agent checking live errors (Step 5)
    AWAITING_APPROVAL = "AWAITING_APPROVAL"  # Waiting for human to approve a fix
    EXECUTING = "EXECUTING"          # Browser agent applying the fix
    VERIFYING = "VERIFYING"          # Re-testing after fix
    DONE = "DONE"                    # All steps complete
    FAILED = "FAILED"                # Unrecoverable error
    GUIDED = "GUIDED"                # Automation failed; human must act

    @property
    def is_terminal(self) -> bool:
        """True if no further state transitions will occur."""
        return self in {JobState.DONE, JobState.FAILED, JobState.GUIDED}


# ─────────────────────────────────────────────────────────────────────────────
# SSE event payloads (sent over the stream)
# ─────────────────────────────────────────────────────────────────────────────


class SSEEvent(BaseModel):
    """
    A single Server-Sent Event payload.

    Wire format (sent by the router):
        event: <event_type>
        data: <SSEEvent JSON>
        \\n\\n
    """

    event_type: str = Field(description="Discriminator: state_change | log | page_fetched | llm_done | awaiting_approval | result | error | done")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(tz=timezone.utc))
    message: Optional[str] = None
    # Extra fields — only populated for specific event types
    data: Optional[dict[str, Any]] = None


class StateChangeEvent(SSEEvent):
    """Emitted whenever the job transitions to a new state."""
    event_type: str = "state_change"
    state: JobState


class LogEvent(SSEEvent):
    """Free-text progress log line."""
    event_type: str = "log"


class PageFetchedEvent(SSEEvent):
    """Emitted after each page is successfully fetched."""
    event_type: str = "page_fetched"
    url: str
    title: Optional[str] = None
    status_code: int = 200
    detected_services: list[str] = Field(default_factory=list)


class LLMDoneEvent(SSEEvent):
    """Emitted when the Gemini analysis returns."""
    event_type: str = "llm_done"
    pages_mapped: int = 0
    services_detected: int = 0
    gaps_found: int = 0


class ResultEvent(SSEEvent):
    """Carries the final AppMap result. Sent just before `done`."""
    event_type: str = "result"
    job_id: str
    app_map: dict[str, Any]          # serialised AppMap


class ErrorEvent(SSEEvent):
    """Non-fatal or fatal error during the pipeline."""
    event_type: str = "error"
    is_fatal: bool = False


class DoneEvent(SSEEvent):
    """Final event — signals the client to close the stream."""
    event_type: str = "done"


class AwaitingApprovalEvent(SSEEvent):
    """
    Emitted when the pipeline pauses for human approval.
    Lists the gaps that can be auto-fixed subject to user consent.
    """
    event_type: str = "awaiting_approval"
    pending_gaps: list[dict[str, Any]] = Field(default_factory=list)
    approve_url: str = Field(description="POST this URL with ApprovalRequest body.")


# ─────────────────────────────────────────────────────────────────────────────
# HTTP response models for the jobs router
# ─────────────────────────────────────────────────────────────────────────────


class JobSummary(BaseModel):
    """Returned by POST /api/analyze immediately after queueing."""

    job_id: str
    status: JobState
    stream_url: str = Field(description="SSE stream endpoint.")
    result_url: str = Field(description="Polling endpoint for the final result.")


class JobResult(BaseModel):
    """Returned by GET /jobs/{id} — full result once DONE."""

    job_id: str
    status: JobState
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    app_url: str
    # Populated once the job reaches DONE
    app_map: Optional[dict[str, Any]] = None
    error: Optional[str] = None
    # Approval gate — populated when status is AWAITING_APPROVAL or later
    pending_gaps: list[dict[str, Any]] = Field(default_factory=list)
    approved_gap_ids: list[str] = Field(default_factory=list)
    rejected_gap_ids: list[str] = Field(default_factory=list)
    approval_notes: Optional[str] = None
