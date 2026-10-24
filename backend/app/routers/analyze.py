"""
app/routers/analyze.py
POST /api/analyze — queue an analysis job and return immediately.

Pipeline (Step 3 — SSE milestone)
───────────────────────────────────
1. Validate request.
2. Create a job in the job store.
3. Launch the analysis pipeline as a background asyncio task.
4. Return {job_id, status: "QUEUED", stream_url, result_url} immediately.

The client then:
  - Connects to GET /jobs/{id}/stream to watch live progress.
  - Polls GET /jobs/{id} to check completion and retrieve the App Map.
"""

from __future__ import annotations

import asyncio
import logging
import uuid

from fastapi import APIRouter, HTTPException, status

from app.models.jobs import JobSummary
from app.models.requests import AnalyzeRequest
from app.services.job_store import job_store
from app.services.pipeline import run_analysis_pipeline

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["analyze"])


@router.post(
    "/analyze",
    response_model=JobSummary,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Queue an analysis job",
    description=(
        "Submit an app URL for analysis. Returns a job ID immediately.\n\n"
        "**Progress:** Connect to `stream_url` (Server-Sent Events) for live trace.\n"
        "**Result:** Poll `result_url` until `status == 'DONE'` to get the App Map."
    ),
    responses={
        202: {"description": "Job accepted and queued."},
        400: {"description": "Invalid URL scheme."},
        422: {"description": "Validation error."},
    },
)
async def analyze(request: AnalyzeRequest) -> JobSummary:
    """
    Accept an analysis request, create a job, and start the pipeline.

    Returns HTTP 202 Accepted immediately.
    """
    app_url = str(request.app_url)

    logger.info(
        "Queuing analysis | app_url=%s | has_description=%s",
        app_url,
        request.description is not None,
    )

    # Scheme guard
    scheme = app_url.split("://")[0].lower()
    if scheme not in {"http", "https"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"app_url scheme must be 'http' or 'https', got '{scheme}'.",
        )

    # Create job
    job_id = str(uuid.uuid4())
    job = job_store.create(
        job_id=job_id,
        app_url=app_url,
        description=request.description,
    )

    # Launch pipeline as a background task (non-blocking)
    asyncio.create_task(
        run_analysis_pipeline(job),
        name=f"pipeline-{job_id}",
    )

    logger.info("Job queued | job_id=%s", job_id)

    return JobSummary(
        job_id=job_id,
        status=job.state,
        stream_url=f"/jobs/{job_id}/stream",
        result_url=f"/jobs/{job_id}",
    )
