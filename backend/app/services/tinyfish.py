"""
app/services/tinyfish.py
TinyFish browser-agent integration — Step 5.

TinyFish is a browser automation service that can:
  - Click through UI flows and report what it sees (DIAGNOSE)
  - Perform edits in provider dashboards like Google Cloud Console (EXECUTE)
  - Re-run a flow and confirm the fix worked (VERIFY)

It is called via a simple REST API with an `output_schema` that structures
its observations as typed JSON — similar to Gemini's structured output.

Current state
─────────────
The client is fully wired: it builds the correct task descriptions, calls the
TinyFish REST API, and maps the response to our internal schemas.
If TINYFISH_API_KEY is not set, every function returns None (the pipeline falls
back to "stub" behaviour and marks the phase as skipped).

API shape (from TinyFish docs)
───────────────────────────────
POST https://api.tinyfish.io/v1/run
{
  "task": "...",
  "url": "...",
  "output_schema": { ...JSON Schema... },
  "timeout": 60
}

→ 200 { "run_id": "...", "status": "completed", "output": { ...structured... } }
→ 4xx/5xx on error

References
──────────
- https://docs.tinyfish.io (placeholder — verify exact shape during hackathon)
"""

from __future__ import annotations

import logging
from typing import Any, Optional

import httpx
import asyncio
from datetime import date

from app.config import settings

logger = logging.getLogger(__name__)

_TINYFISH_API = "https://agent.tinyfish.ai/v1/automation/run"
_TIMEOUT = httpx.Timeout(connect=10.0, read=120.0, write=10.0, pool=5.0)


# ─────────────────────────────────────────────────────────────────────────────
# Output schemas for each phase
# ─────────────────────────────────────────────────────────────────────────────

_DIAGNOSE_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "error_text": {"type": "string", "description": "Exact error text the agent saw."},
        "error_url": {"type": "string", "description": "URL where the error appeared."},
        "screenshot_b64": {"type": "string", "description": "Base64 screenshot (optional)."},
        "additional_observations": {"type": "string"},
    },
    "required": ["error_text", "error_url"],
}

_EXECUTE_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "success": {"type": "boolean"},
        "steps_taken": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Human-readable list of actions performed.",
        },
        "screenshot_b64": {"type": "string"},
        "notes": {"type": "string"},
    },
    "required": ["success", "steps_taken"],
}

_VERIFY_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "fix_confirmed": {"type": "boolean"},
        "error_still_present": {"type": "boolean"},
        "observations": {"type": "string"},
        "screenshot_b64": {"type": "string"},
    },
    "required": ["fix_confirmed", "error_still_present"],
}


# ─────────────────────────────────────────────────────────────────────────────
# Internal helper
# ─────────────────────────────────────────────────────────────────────────────
def _strip_descriptions(node):
    """TinyFish rejects the JSON Schema 'description' keyword; remove it."""
    if isinstance(node, dict):
        return {
            k: _strip_descriptions(v)
            for k, v in node.items()
            if not (k == "description" and isinstance(v, str))
        }
    if isinstance(node, list):
        return [_strip_descriptions(i) for i in node]
    return node

_budget: dict = {"day": None, "runs": 0}
_sem: asyncio.Semaphore | None = None


def _get_sem() -> asyncio.Semaphore:
    global _sem
    if _sem is None:
        _sem = asyncio.Semaphore(settings.tinyfish_concurrency)
    return _sem


def budget_allows() -> bool:
    today = date.today().isoformat()
    if _budget["day"] != today:
        _budget["day"], _budget["runs"] = today, 0
    return _budget["runs"] < settings.tinyfish_daily_run_cap


def budget_record() -> None:
    _budget["runs"] += 1


def build_payload(url: str, task: str, output_schema: dict) -> dict:
    payload = {
        "url": url,
        "goal": task,
        "output_schema": _strip_descriptions(output_schema),
    }
    if settings.tinyfish_max_steps > 0:
        payload["agent_config"] = {"max_steps": settings.tinyfish_max_steps}
    return payload

async def _call_tinyfish(
    task: str,
    url: str,
    output_schema: dict[str, Any],
    timeout_seconds: int = 90,
) -> Optional[dict[str, Any]]:
    """
    Call the TinyFish /run endpoint.

    Returns the parsed `output` dict on success, or None on any failure.
    Never raises.
    """
    if not settings.tinyfish_api_key:
        logger.info("TINYFISH_API_KEY not set — skipping browser-agent call.")
        return None

    payload = {
        "goal": task,
        "url": url,
        "output_schema": _strip_descriptions(output_schema),
        "timeout": timeout_seconds,
    }
    headers = {
        "X-API-Key": settings.tinyfish_api_key,
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            logger.info("TinyFish call | url=%s | task_preview=%.80s", url, task)
            if not budget_allows():
                logger.warning("TinyFish daily run cap reached (%s); skipping call", settings.tinyfish_daily_run_cap)
                return None
            response = await client.post(_TINYFISH_API, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            logger.info("TinyFish done | status=%s | run_id=%s", data.get("status"), data.get("run_id"))
            return data.get("output")  # type: ignore[return-value]

    except httpx.HTTPStatusError as exc:
        logger.warning("TinyFish HTTP error: %s — %s", exc.response.status_code, exc.response.text[:200])
    except httpx.RequestError as exc:
        logger.warning("TinyFish request error: %s", exc)
    except Exception as exc:  # noqa: BLE001
        logger.warning("TinyFish unexpected error: %s", exc)

    return None


# ─────────────────────────────────────────────────────────────────────────────
# Public phase functions — called by the pipeline
# ─────────────────────────────────────────────────────────────────────────────

async def diagnose_gap(
    app_url: str,
    gap_title: str,
    gap_description: str,
    suggested_action: str,
) -> Optional[dict[str, Any]]:
    """
    DIAGNOSE phase: send a browser agent to the app to reproduce the error
    described by a setup gap.

    Returns a dict with `error_text`, `error_url`, optionally `screenshot_b64`.
    Returns None if TinyFish is not configured or the call fails.
    """
    task = (
        f"You are testing a web application at {app_url}.\n"
        f"There is a known issue: {gap_title}.\n"
        f"Details: {gap_description}\n"
        f"Expected fix: {suggested_action}\n\n"
        f"1. Navigate to {app_url}.\n"
        f"2. Try to trigger the issue (e.g. click Sign in, attempt to pay, etc.).\n"
        f"3. Report the exact error text you see and the URL it appears on.\n"
        f"4. Take a screenshot if possible."
    )
    return await _call_tinyfish(
        task=task,
        url=app_url,
        output_schema=_DIAGNOSE_SCHEMA,
        timeout_seconds=90,
    )


async def execute_fix(
    console_url: str,
    gap_title: str,
    suggested_action: str,
    evidence: str,
) -> Optional[dict[str, Any]]:
    """
    EXECUTE phase: send a browser agent to a provider dashboard to apply the fix.

    Parameters
    ----------
    console_url:
        URL of the provider dashboard (e.g. Google Cloud Console credentials page).
    gap_title:
        Human-readable name of the fix to apply.
    suggested_action:
        Plain-English instruction for the agent.
    evidence:
        Context about what was detected (e.g. "the app uses Google OAuth 2.0").

    Returns a dict with `success`, `steps_taken`, optionally `screenshot_b64`.
    """
    task = (
        f"You are a VibePilot browser agent.\n"
        f"Fix to apply: {gap_title}\n"
        f"Context: {evidence}\n"
        f"Instructions: {suggested_action}\n\n"
        f"Navigate to {console_url}, locate the relevant setting, and apply the fix. "
        f"Report each step you took and whether you succeeded."
    )
    return await _call_tinyfish(
        task=task,
        url=console_url,
        output_schema=_EXECUTE_SCHEMA,
        timeout_seconds=120,
    )


async def verify_fix(
    app_url: str,
    gap_title: str,
    gap_description: str,
) -> Optional[dict[str, Any]]:
    """
    VERIFY phase: re-run the failing flow to confirm the fix worked.

    Returns a dict with `fix_confirmed`, `error_still_present`, `observations`.
    """
    task = (
        f"You are verifying a fix for: {gap_title}.\n"
        f"Issue was: {gap_description}\n\n"
        f"1. Navigate to {app_url}.\n"
        f"2. Trigger the same flow that previously failed.\n"
        f"3. Report whether the fix worked (fix_confirmed=true) or the error persists.\n"
        f"4. Describe what you observed."
    )
    return await _call_tinyfish(
        task=task,
        url=app_url,
        output_schema=_VERIFY_SCHEMA,
        timeout_seconds=90,
    )
