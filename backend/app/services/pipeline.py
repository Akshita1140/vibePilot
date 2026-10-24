"""
app/services/pipeline.py
Background analysis pipeline — Steps 4 + 5 fully wired.

Job lifecycle
─────────────
QUEUED
  → ANALYZING     (fetch + LLM)
  → AWAITING_APPROVAL  (if autofix gaps exist)
  → EXECUTING     (TinyFish apply fix, per approved gap)
  → VERIFYING     (TinyFish confirm fix)
  → DONE
  → FAILED        (unrecoverable)
  → GUIDED        (approval timeout / all rejected / TinyFish unavailable)
"""

from __future__ import annotations

import asyncio
import logging

from app.demo.fixture import build_demo_response
from app.models.jobs import (
    AwaitingApprovalEvent,
    DoneEvent,
    ErrorEvent,
    JobState,
    LLMDoneEvent,
    LogEvent,
    PageFetchedEvent,
    ResultEvent,
    StateChangeEvent,
)
from app.services.fetcher import fetch_app
from app.services.job_store import Job
from app.services.llm import generate_app_map
from app.services.tinyfish import diagnose_gap, execute_fix, verify_fix

logger = logging.getLogger(__name__)

_APPROVAL_TIMEOUT = 300     # seconds before timeout → GUIDED


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

async def _state(job: Job, s: JobState, msg: str) -> None:
    job.transition(s)
    await job.push_event(StateChangeEvent(state=s, message=msg))

async def _log(job: Job, msg: str) -> None:
    await job.push_event(LogEvent(message=msg))

async def _err(job: Job, msg: str, fatal: bool = False) -> None:
    await job.push_event(ErrorEvent(message=msg, is_fatal=fatal))


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────

async def run_analysis_pipeline(job: Job) -> None:
    logger.info("Pipeline start | job_id=%s | url=%s", job.job_id, job.app_url)
    try:
        await _run(job)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unhandled error | job_id=%s", job.job_id)
        job.error = str(exc)
        await _err(job, f"Unexpected error: {exc}", fatal=True)
        await _state(job, JobState.FAILED, "Pipeline failed.")
        await job.push_event(DoneEvent(message="Terminated."))


async def _run(job: Job) -> None:

    # ── PHASE 1: ANALYZING ────────────────────────────────────────────────────
    await _state(job, JobState.ANALYZING, "Fetching application pages…")
    await _log(job, f"HTTP fetch → {job.app_url}")

    fetch_result = None
    try:
        fetch_result = await fetch_app(job.app_url)
        for page in fetch_result.pages:
            if page.fetch_error:
                await _err(job, f"Could not fetch {page.url}: {page.fetch_error}")
            else:
                await job.push_event(PageFetchedEvent(
                    url=page.final_url, title=page.title,
                    status_code=page.status_code,
                    detected_services=page.detected_script_domains,
                    message=f"Fetched: {page.title or page.final_url}",
                ))
        await _log(job, f"Fetch done — {len(fetch_result.pages)} page(s) in {fetch_result.total_fetch_time_ms} ms.")
    except Exception as exc:  # noqa: BLE001
        await _err(job, f"Fetch failed: {exc}")

    await _log(job, "Calling Gemini…")
    analyze_response = None
    if fetch_result:
        try:
            analyze_response = await generate_app_map(
                fetch_result=fetch_result,
                app_url=job.app_url,
                description=job.description,
            )
            if analyze_response:
                await job.push_event(LLMDoneEvent(
                    pages_mapped=len(analyze_response.app_map.pages),
                    services_detected=len(analyze_response.app_map.detected_services),
                    gaps_found=len(analyze_response.app_map.setup_gaps),
                    message=f"Gemini done — {len(analyze_response.app_map.setup_gaps)} gap(s).",
                ))
            else:
                await _log(job, "No GEMINI_API_KEY — using demo fixture.")
        except Exception as exc:  # noqa: BLE001
            await _err(job, f"LLM failed: {exc}")

    if analyze_response is None:
        try:
            analyze_response = build_demo_response(app_url=job.app_url)
            analyze_response.job_id = job.job_id
            await _log(job, "Demo fixture loaded.")
        except Exception as exc:  # noqa: BLE001
            job.error = str(exc)
            await _err(job, job.error, fatal=True)
            await _state(job, JobState.FAILED, "Could not build App Map.")
            await job.push_event(DoneEvent(message="Failed."))
            return

    # ── PHASE 2: DIAGNOSING (TinyFish) ────────────────────────────────────────
    await _state(job, JobState.DIAGNOSING, "Diagnosing live errors with browser agent…")
    diagnose_results: dict[str, dict] = {}

    autofix_gaps = [g for g in analyze_response.app_map.setup_gaps if g.can_autofix]

    for gap in autofix_gaps:
        await _log(job, f"[DIAGNOSE] {gap.title}")
        result = await diagnose_gap(
            app_url=job.app_url,
            gap_title=gap.title,
            gap_description=gap.description,
            suggested_action=gap.suggested_action,
        )
        if result:
            diagnose_results[gap.id] = result
            await _log(job, f"[DIAGNOSE ✓] {gap.id}: {result.get('error_text', 'observed')[:100]}")
        else:
            await _log(job, f"[DIAGNOSE SKIP] {gap.id} — TinyFish not configured or call failed.")

    # ── PHASE 3: AWAITING_APPROVAL ────────────────────────────────────────────
    if autofix_gaps:
        pending_dicts = [g.model_dump(mode="json") for g in autofix_gaps]
        job.pending_approval_gaps = pending_dicts

        await _state(
            job, JobState.AWAITING_APPROVAL,
            f"{len(autofix_gaps)} gap(s) ready for your approval.",
        )
        await job.push_event(AwaitingApprovalEvent(
            pending_gaps=pending_dicts,
            approve_url=f"/jobs/{job.job_id}/approve",
            message="Review and approve proposed fixes.",
        ))

        try:
            await asyncio.wait_for(job.approval_event.wait(), timeout=_APPROVAL_TIMEOUT)
        except asyncio.TimeoutError:
            await _log(job, "Approval timeout.")
            _store(job, analyze_response)
            await _state(job, JobState.GUIDED, "Timed out — please act manually.")
            await job.push_event(DoneEvent(message="GUIDED."))
            return

        if not job.approved_gap_ids:
            _store(job, analyze_response)
            await _state(job, JobState.GUIDED, "No gaps approved — manual action required.")
            await job.push_event(DoneEvent(message="GUIDED."))
            return

        await _log(job, f"Approved: {job.approved_gap_ids}")
    else:
        await _log(job, "No auto-fixable gaps — skipping approval gate.")

    # ── PHASE 4: EXECUTING (TinyFish) ─────────────────────────────────────────
    execute_results: dict[str, dict] = {}
    if job.approved_gap_ids:
        await _state(job, JobState.EXECUTING, "Applying fixes via browser agent…")

        approved_gaps = [g for g in autofix_gaps if g.id in job.approved_gap_ids]
        for gap in approved_gaps:
            await _log(job, f"[EXECUTE] {gap.title}")
            console_url = str(gap.model_dump(mode="json").get("dashboard_url") or job.app_url)

            # Try to get dashboard URL from detected services
            for svc in analyze_response.app_map.detected_services:
                if svc.name and gap.affected_service and (
                    svc.name.lower() in (gap.affected_service or "").lower()
                ):
                    if svc.dashboard_url:
                        console_url = str(svc.dashboard_url)
                    break

            result = await execute_fix(
                console_url=console_url,
                gap_title=gap.title,
                suggested_action=gap.suggested_action,
                evidence=gap.description,
            )
            if result:
                execute_results[gap.id] = result
                ok = result.get("success", False)
                await _log(job, f"[EXECUTE {'✓' if ok else '✗'}] {gap.id}: {result.get('notes','')[:80]}")
            else:
                await _log(job, f"[EXECUTE SKIP] {gap.id} — TinyFish not configured.")

    # ── PHASE 5: VERIFYING (TinyFish) ─────────────────────────────────────────
    verify_results: dict[str, dict] = {}
    if job.approved_gap_ids:
        await _state(job, JobState.VERIFYING, "Verifying fixes…")

        approved_gaps = [g for g in autofix_gaps if g.id in job.approved_gap_ids]
        for gap in approved_gaps:
            await _log(job, f"[VERIFY] {gap.title}")
            result = await verify_fix(
                app_url=job.app_url,
                gap_title=gap.title,
                gap_description=gap.description,
            )
            if result:
                verify_results[gap.id] = result
                confirmed = result.get("fix_confirmed", False)
                await _log(job, f"[VERIFY {'✓' if confirmed else '✗'}] {gap.id}")
            else:
                await _log(job, f"[VERIFY SKIP] {gap.id} — TinyFish not configured.")

    # ── DONE ──────────────────────────────────────────────────────────────────
    _store(job, analyze_response)

    # Attach execution evidence to the job for the receipt
    job.app_map["_execution_evidence"] = {  # type: ignore[index]
        "diagnose": diagnose_results,
        "execute": execute_results,
        "verify": verify_results,
    }

    await job.push_event(ResultEvent(
        job_id=job.job_id,
        app_map=job.app_map,  # type: ignore[arg-type]
        message="App Map ready.",
    ))
    await _state(job, JobState.DONE, "All done.")
    await job.push_event(DoneEvent(message="Stream complete."))
    logger.info("Pipeline done | job_id=%s", job.job_id)


def _store(job: Job, analyze_response) -> None:  # type: ignore[no-untyped-def]
    job.app_map = analyze_response.app_map.model_dump(mode="json")
    job.error = None
