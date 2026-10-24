"""
app/services/job_store.py
In-memory job store with per-job SSE event queues.

Design
──────
- Each job has an asyncio.Queue for SSE events.
- The pipeline task pushes events; the SSE router reads them.
- Jobs are stored in a module-level dict (singleton).
- TTL cleanup prevents unbounded memory growth.
- Thread-safe for asyncio (single-threaded event loop).

Future: replace with SQLite/PostgreSQL + Redis pub-sub for multi-worker deploys.
"""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from typing import Any, Optional

from app.models.jobs import JobState, SSEEvent

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Job dataclass (internal — not a Pydantic model)
# ─────────────────────────────────────────────────────────────────────────────

_JOB_TTL_HOURS = 2          # Jobs older than this are eligible for cleanup
_MAX_QUEUE_SIZE = 256        # Maximum buffered SSE events per job


@dataclass
class Job:
    """Internal representation of a VibePilot analysis job."""

    job_id: str
    app_url: str
    description: Optional[str]
    state: JobState = JobState.QUEUED
    created_at: datetime = field(default_factory=lambda: datetime.now(tz=timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(tz=timezone.utc))
    completed_at: Optional[datetime] = None
    app_map: Optional[dict[str, Any]] = None     # serialised AppMap JSON
    error: Optional[str] = None

    # ── Approval gate ─────────────────────────────────────────────────────────
    # Gaps awaiting the user's approve/reject decision
    pending_approval_gaps: list[dict[str, Any]] = field(default_factory=list)
    # Gap IDs the user approved (pipeline will action these)
    approved_gap_ids: list[str] = field(default_factory=list)
    # Gap IDs the user explicitly rejected (will be marked GUIDED)
    rejected_gap_ids: list[str] = field(default_factory=list)
    # Optional comment from the user
    approval_notes: Optional[str] = None
    # Pipeline waits on this event; POST /approve sets it
    approval_event: asyncio.Event = field(default_factory=asyncio.Event)

    # SSE event queue — pipeline pushes, SSE router consumes
    event_queue: asyncio.Queue = field(
        default_factory=lambda: asyncio.Queue(maxsize=_MAX_QUEUE_SIZE)
    )


    def transition(self, new_state: JobState) -> None:
        """Update state and timestamps atomically."""
        logger.info(
            "Job %s: %s → %s", self.job_id, self.state.value, new_state.value
        )
        self.state = new_state
        self.updated_at = datetime.now(tz=timezone.utc)
        if new_state.is_terminal:
            self.completed_at = self.updated_at

    async def push_event(self, event: SSEEvent) -> None:
        """
        Push an SSE event onto the queue.
        Drops the event (with a warning) if the queue is full.
        """
        try:
            self.event_queue.put_nowait(event)
        except asyncio.QueueFull:
            logger.warning("Job %s event queue full — dropping event %s", self.job_id, event.event_type)

    def record_approval(
        self,
        approved_gap_ids: list[str],
        rejected_gap_ids: list[str],
        notes: Optional[str] = None,
    ) -> None:
        """
        Record the user's approval decision and wake the waiting pipeline.

        Called by POST /jobs/{id}/approve. Safe to call from any async context
        because asyncio.Event.set() is not a coroutine.
        """
        self.approved_gap_ids = list(approved_gap_ids)
        self.rejected_gap_ids = list(rejected_gap_ids)
        self.approval_notes = notes
        self.approval_event.set()   # Wake the pipeline's await
        logger.info(
            "Approval recorded | job_id=%s | approved=%d | rejected=%d",
            self.job_id,
            len(approved_gap_ids),
            len(rejected_gap_ids),
        )



# ─────────────────────────────────────────────────────────────────────────────
# Job store singleton
# ─────────────────────────────────────────────────────────────────────────────


class JobStore:
    """
    Thread-safe (asyncio) in-memory store for VibePilot jobs.

    Usage
    -----
    from app.services.job_store import job_store   # singleton

    job = job_store.create(job_id, app_url, description)
    job = job_store.get(job_id)
    """

    def __init__(self) -> None:
        self._jobs: dict[str, Job] = {}

    def create(
        self,
        job_id: str,
        app_url: str,
        description: Optional[str] = None,
    ) -> Job:
        """Create and register a new job."""
        job = Job(job_id=job_id, app_url=app_url, description=description)
        self._jobs[job_id] = job
        logger.info("Created job %s for url=%s", job_id, app_url)
        return job

    def get(self, job_id: str) -> Optional[Job]:
        """Return the job with *job_id*, or None if not found."""
        return self._jobs.get(job_id)

    def all(self) -> list[Job]:
        """Return all stored jobs (newest first)."""
        return sorted(self._jobs.values(), key=lambda j: j.created_at, reverse=True)

    def cleanup_expired(self) -> int:
        """Remove terminal jobs older than _JOB_TTL_HOURS. Returns count removed."""
        cutoff = datetime.now(tz=timezone.utc) - timedelta(hours=_JOB_TTL_HOURS)
        to_remove = [
            jid
            for jid, job in self._jobs.items()
            if job.state.is_terminal and job.updated_at < cutoff
        ]
        for jid in to_remove:
            del self._jobs[jid]
        if to_remove:
            logger.info("Cleaned up %d expired jobs.", len(to_remove))
        return len(to_remove)

    def __len__(self) -> int:
        return len(self._jobs)


# Module-level singleton — import this everywhere
job_store = JobStore()
