"""
app/routers/receipt.py
GET /jobs/{job_id}/receipt — the post-run structured evidence page.

Returns a rich summary of everything that happened:
  - The final App Map
  - Which gaps were approved / rejected
  - TinyFish diagnosis, execution, and verification evidence
  - Timestamps for each phase
"""

from __future__ import annotations

import logging
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.models.jobs import JobState
from app.services.job_store import job_store

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/jobs", tags=["receipt"])


# ─────────────────────────────────────────────────────────────────────────────
# Response model
# ─────────────────────────────────────────────────────────────────────────────

class GapReceipt(BaseModel):
    """Evidence record for a single gap."""
    id: str
    title: str
    severity: str
    decision: str   # "approved" | "rejected" | "skipped" | "not_applicable"
    diagnose_evidence: Optional[dict[str, Any]] = None
    execute_evidence: Optional[dict[str, Any]] = None
    verify_evidence: Optional[dict[str, Any]] = None
    fix_confirmed: Optional[bool] = None


class JobReceipt(BaseModel):
    """Full post-run receipt for a completed job."""
    job_id: str
    app_url: str
    status: JobState
    created_at: str
    completed_at: Optional[str] = None
    approval_notes: Optional[str] = None
    summary: Optional[str] = None
    gap_receipts: list[GapReceipt] = Field(default_factory=list)
    raw_app_map: Optional[dict[str, Any]] = None


# ─────────────────────────────────────────────────────────────────────────────
# Route
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/{job_id}/receipt",
    response_model=JobReceipt,
    summary="Get job receipt",
    description=(
        "Return a structured receipt for a completed job.\n\n"
        "Available once `status` is `DONE`, `GUIDED`, or `FAILED`. "
        "Includes the App Map, approval decision, and TinyFish evidence per gap."
    ),
    responses={
        200: {"description": "Job receipt."},
        404: {"description": "Job not found."},
        409: {"description": "Job has not completed yet."},
    },
)
async def get_receipt(job_id: str) -> JobReceipt:
    """Build and return the job receipt."""
    job = job_store.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")

    if not job.state.is_terminal:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Job '{job_id}' is still {job.state.value}. Receipt available after completion.",
        )

    app_map = job.app_map or {}
    evidence = app_map.get("_execution_evidence", {})
    diagnose_ev = evidence.get("diagnose", {})
    execute_ev = evidence.get("execute", {})
    verify_ev = evidence.get("verify", {})

    gap_receipts: list[GapReceipt] = []
    for gap in app_map.get("setup_gaps", []):
        gap_id = gap.get("id", "")
        if gap_id in job.approved_gap_ids:
            decision = "approved"
        elif gap_id in job.rejected_gap_ids:
            decision = "rejected"
        elif gap.get("can_autofix"):
            decision = "skipped"   # was pending but never acted on (e.g. timeout)
        else:
            decision = "not_applicable"

        verify_data = verify_ev.get(gap_id)
        gap_receipts.append(GapReceipt(
            id=gap_id,
            title=gap.get("title", ""),
            severity=gap.get("severity", ""),
            decision=decision,
            diagnose_evidence=diagnose_ev.get(gap_id),
            execute_evidence=execute_ev.get(gap_id),
            verify_evidence=verify_data,
            fix_confirmed=verify_data.get("fix_confirmed") if verify_data else None,
        ))

    return JobReceipt(
        job_id=job.job_id,
        app_url=job.app_url,
        status=job.state,
        created_at=job.created_at.isoformat(),
        completed_at=job.completed_at.isoformat() if job.completed_at else None,
        approval_notes=job.approval_notes,
        summary=app_map.get("summary"),
        gap_receipts=gap_receipts,
        raw_app_map={k: v for k, v in app_map.items() if not k.startswith("_")},
    )
