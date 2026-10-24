"""
app/routers/jobs.py
Job management endpoints.

Endpoints
─────────
GET  /jobs/{job_id}           — Poll job state + result + approval info
GET  /jobs/{job_id}/stream    — SSE live trace
POST /jobs/{job_id}/approve   — Submit approval decision (Step 4)
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import StreamingResponse

from app.models.approval import ApprovalRequest, ApprovalResponse
from app.models.jobs import AwaitingApprovalEvent, DoneEvent, JobResult, JobState, JobSummary, SSEEvent
from app.services.job_store import Job, job_store

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/jobs", tags=["jobs"])

_SSE_KEEPALIVE_SECONDS = 15
_SSE_STREAM_TIMEOUT = 300


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _format_sse(event: SSEEvent) -> str:
    payload = event.model_dump(mode="json")
    event_type = payload.get("event_type", "message")
    return f"event: {event_type}\r\ndata: {json.dumps(payload, default=str)}\r\n\r\n"

def _keepalive() -> str:
    return ": keepalive\r\n\r\n"

def _get_job_or_404(job_id: str) -> Job:
    job = job_store.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")
    return job


# ─────────────────────────────────────────────────────────────────────────────
# SSE generator
# ─────────────────────────────────────────────────────────────────────────────

async def _sse_generator(job: Job, request: Request) -> AsyncGenerator[str, None]:
    logger.info("SSE stream opened | job_id=%s", job.job_id)
    elapsed = 0.0
    try:
        while elapsed < _SSE_STREAM_TIMEOUT:
            if await request.is_disconnected():
                break
            try:
                event: SSEEvent = await asyncio.wait_for(
                    job.event_queue.get(), timeout=_SSE_KEEPALIVE_SECONDS
                )
                yield _format_sse(event)
                if isinstance(event, DoneEvent):
                    break
            except asyncio.TimeoutError:
                yield _keepalive()
                elapsed += _SSE_KEEPALIVE_SECONDS
                if job.state.is_terminal and job.event_queue.empty():
                    break
    except (asyncio.CancelledError, Exception):
        pass
    logger.info("SSE generator exit | job_id=%s", job.job_id)


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/{job_id}/stream",
    summary="Stream job progress (SSE)",
    response_class=StreamingResponse,
    responses={200: {"description": "SSE stream"}, 404: {"description": "Not found"}},
)
async def stream_job(job_id: str, request: Request) -> StreamingResponse:
    """Server-Sent Events stream for a job."""
    job = _get_job_or_404(job_id)
    return StreamingResponse(
        _sse_generator(job, request),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )


@router.get(
    "/{job_id}",
    response_model=JobResult,
    summary="Poll job status and result",
)
async def get_job(job_id: str) -> JobResult:
    """Return current job state, timestamps, result, and approval info."""
    job = _get_job_or_404(job_id)
    return JobResult(
        job_id=job.job_id,
        status=job.state,
        created_at=job.created_at,
        updated_at=job.updated_at,
        completed_at=job.completed_at,
        app_url=job.app_url,
        app_map=job.app_map,
        error=job.error,
        pending_gaps=job.pending_approval_gaps,
        approved_gap_ids=job.approved_gap_ids,
        rejected_gap_ids=job.rejected_gap_ids,
        approval_notes=job.approval_notes,
    )


@router.post(
    "/{job_id}/approve",
    response_model=ApprovalResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit approval decision",
    description=(
        "Submit a human approval decision for a job in `AWAITING_APPROVAL` state.\n\n"
        "- **approved_gap_ids**: The browser agent will auto-fix these gaps.\n"
        "- **rejected_gap_ids**: These gaps require manual action (moves job to GUIDED).\n"
        "- **reject_all**: Shortcut to reject everything and move to GUIDED.\n\n"
        "If the job is not in `AWAITING_APPROVAL`, returns HTTP 409."
    ),
    responses={
        200: {"description": "Decision recorded; pipeline will resume."},
        404: {"description": "Job not found."},
        409: {"description": "Job is not awaiting approval."},
        422: {"description": "Validation error."},
    },
)
async def approve_job(job_id: str, request: ApprovalRequest) -> ApprovalResponse:
    """
    Record the user's approve/reject decision and resume the pipeline.

    The pipeline is waiting on `job.approval_event`. Setting it here wakes it
    immediately; the pipeline will read `job.approved_gap_ids` and continue.
    """
    job = _get_job_or_404(job_id)

    if job.state != JobState.AWAITING_APPROVAL:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Job '{job_id}' is in state '{job.state.value}', "
                f"not AWAITING_APPROVAL. Cannot submit approval."
            ),
        )

    # Handle reject_all shortcut
    if request.reject_all:
        all_pending_ids = [g["id"] for g in job.pending_approval_gaps]
        job.record_approval(
            approved_gap_ids=[],
            rejected_gap_ids=all_pending_ids,
            notes=request.notes,
        )
        return ApprovalResponse(
            job_id=job_id,
            approved_count=0,
            rejected_count=len(all_pending_ids),
            next_state=JobState.GUIDED,
            message=f"All {len(all_pending_ids)} gap(s) rejected. Job moving to GUIDED.",
        )

    # Validate that submitted IDs exist in pending gaps
    pending_ids = {g["id"] for g in job.pending_approval_gaps}
    invalid_approved = [gid for gid in request.approved_gap_ids if gid not in pending_ids]
    invalid_rejected = [gid for gid in request.rejected_gap_ids if gid not in pending_ids]

    if invalid_approved or invalid_rejected:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": "Some gap IDs are not in the pending list.",
                "invalid_approved": invalid_approved,
                "invalid_rejected": invalid_rejected,
                "pending_ids": list(pending_ids),
            },
        )

    job.record_approval(
        approved_gap_ids=request.approved_gap_ids,
        rejected_gap_ids=request.rejected_gap_ids,
        notes=request.notes,
    )

    approved_count = len(request.approved_gap_ids)
    rejected_count = len(request.rejected_gap_ids)

    # Determine next state: if anything was approved → EXECUTING, else → GUIDED
    next_state = JobState.EXECUTING if approved_count > 0 else JobState.GUIDED

    message = (
        f"Decision recorded: {approved_count} approved, {rejected_count} rejected. "
        f"Pipeline resuming → {next_state.value}."
    )
    logger.info("Approval submitted | job_id=%s | %s", job_id, message)

    return ApprovalResponse(
        job_id=job_id,
        approved_count=approved_count,
        rejected_count=rejected_count,
        next_state=next_state,
        message=message,
    )
