"""
tests/test_jobs.py
Tests for GET /jobs/{id} and GET /jobs/{id}/stream.

Strategy
────────
- Use the TestClient to POST /api/analyze → get job_id.
- Poll GET /jobs/{job_id} and wait for DONE (with a short timeout).
- For SSE, read the first few chunks from the stream and verify format.
- Job store is module-level, so jobs created in one test are visible in others.
"""

from __future__ import annotations

import asyncio
import json
import time
from typing import Generator

import pytest
from fastapi.testclient import TestClient


ANALYZE_ENDPOINT = "/api/analyze"
VALID_URL = "https://my-saas.vercel.app"
TERMINAL_STATES = {"DONE", "FAILED", "GUIDED"}


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────


def _queue_job(client: TestClient, url: str = VALID_URL) -> str:
    """Queue a job and return its job_id."""
    response = client.post(ANALYZE_ENDPOINT, json={"app_url": url})
    assert response.status_code == 202, response.text
    return response.json()["job_id"]


def _poll_until_done(
    client: TestClient,
    job_id: str,
    timeout: float = 30.0,
) -> dict:
    """
    Poll GET /jobs/{job_id} until the job reaches a terminal state.
    Returns the final job dict. Raises TimeoutError if not done in time.
    """
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        resp = client.get(f"/jobs/{job_id}")
        assert resp.status_code == 200, resp.text
        data = resp.json()
        if data["status"] in TERMINAL_STATES:
            return data
        time.sleep(0.2)
    raise TimeoutError(f"Job {job_id} did not complete within {timeout}s.")


# ─────────────────────────────────────────────────────────────────────────────
# GET /jobs/{id} — polling endpoint
# ─────────────────────────────────────────────────────────────────────────────


def test_get_job_returns_404_for_unknown_id(client: TestClient) -> None:
    """Requesting a non-existent job must return 404."""
    response = client.get("/jobs/non-existent-job-id-12345")
    assert response.status_code == 404, response.text


def test_get_job_returns_200_for_known_job(client: TestClient) -> None:
    """A newly queued job should be retrievable."""
    job_id = _queue_job(client)
    response = client.get(f"/jobs/{job_id}")
    assert response.status_code == 200, response.text


def test_get_job_has_required_fields(client: TestClient) -> None:
    """Job poll response must have job_id, status, created_at, app_url."""
    job_id = _queue_job(client)
    data = client.get(f"/jobs/{job_id}").json()
    for field in ("job_id", "status", "created_at", "app_url"):
        assert field in data, f"Missing field: {field}"


def test_get_job_id_matches(client: TestClient) -> None:
    """The job_id in the response must match the requested job_id."""
    job_id = _queue_job(client)
    data = client.get(f"/jobs/{job_id}").json()
    assert data["job_id"] == job_id


def test_get_job_app_url_matches(client: TestClient) -> None:
    """The app_url in the job response must match what was submitted."""
    job_id = _queue_job(client, url=VALID_URL)
    data = client.get(f"/jobs/{job_id}").json()
    assert VALID_URL in data["app_url"]


def test_get_job_initial_status_is_queued_or_analyzing(client: TestClient) -> None:
    """A freshly created job should be QUEUED or already ANALYZING."""
    job_id = _queue_job(client)
    data = client.get(f"/jobs/{job_id}").json()
    assert data["status"] in {"QUEUED", "ANALYZING", "DONE", "FAILED"}, (
        f"Unexpected initial status: {data['status']}"
    )


def test_job_reaches_terminal_state(client: TestClient) -> None:
    """A job must eventually reach a terminal state (DONE or FAILED)."""
    job_id = _queue_job(client)
    final = _poll_until_done(client, job_id)
    assert final["status"] in TERMINAL_STATES


def test_done_job_has_app_map(client: TestClient) -> None:
    """A DONE job must have a populated app_map field."""
    job_id = _queue_job(client)
    final = _poll_until_done(client, job_id)
    if final["status"] == "DONE":
        assert final.get("app_map") is not None, "DONE job must have app_map."
        assert "summary" in final["app_map"], "app_map must have a summary."


def test_done_job_has_completed_at(client: TestClient) -> None:
    """A terminal job must have a completed_at timestamp."""
    job_id = _queue_job(client)
    final = _poll_until_done(client, job_id)
    assert final.get("completed_at") is not None, (
        "Terminal job must have completed_at set."
    )


def test_app_map_has_setup_gaps(client: TestClient) -> None:
    """The app_map in a completed job must have setup_gaps."""
    job_id = _queue_job(client)
    final = _poll_until_done(client, job_id)
    if final["status"] == "DONE":
        gaps = final["app_map"].get("setup_gaps", [])
        assert len(gaps) >= 1, "App Map must contain at least one setup gap."


def test_app_map_has_pages(client: TestClient) -> None:
    """The app_map in a completed job must have at least one page."""
    job_id = _queue_job(client)
    final = _poll_until_done(client, job_id)
    if final["status"] == "DONE":
        pages = final["app_map"].get("pages", [])
        assert len(pages) >= 1, "App Map must contain at least one page."


# ─────────────────────────────────────────────────────────────────────────────
# GET /jobs/{id}/stream — SSE endpoint
# ─────────────────────────────────────────────────────────────────────────────


def test_stream_returns_404_for_unknown_job(client: TestClient) -> None:
    """Streaming a non-existent job must return 404."""
    with client.stream("GET", "/jobs/no-such-job-abc/stream") as response:
        assert response.status_code == 404


def test_stream_returns_200_for_known_job(client: TestClient) -> None:
    """SSE stream for a known job must return HTTP 200."""
    job_id = _queue_job(client)
    with client.stream("GET", f"/jobs/{job_id}/stream") as response:
        assert response.status_code == 200, response.text


def test_stream_content_type_is_event_stream(client: TestClient) -> None:
    """SSE endpoint must respond with text/event-stream content type."""
    job_id = _queue_job(client)
    with client.stream("GET", f"/jobs/{job_id}/stream") as response:
        assert "text/event-stream" in response.headers.get("content-type", "")


def test_stream_emits_valid_sse_lines(client: TestClient) -> None:
    """SSE stream must emit lines in `event: ...` / `data: ...` format."""
    job_id = _queue_job(client)
    lines_seen: list[str] = []

    with client.stream("GET", f"/jobs/{job_id}/stream") as response:
        for raw in response.iter_lines():
            if raw:
                lines_seen.append(raw)
            # Read until we've seen at least one event or a done marker
            if any("done" in line for line in lines_seen):
                break
            if len(lines_seen) >= 10:
                break

    # At least some lines must start with "event:" or "data:"
    prefixed = [l for l in lines_seen if l.startswith(("event:", "data:"))]
    assert len(prefixed) > 0, f"No SSE-formatted lines found. Got: {lines_seen}"


def test_stream_data_lines_are_valid_json(client: TestClient) -> None:
    """Every `data:` line in the SSE stream must be valid JSON."""
    job_id = _queue_job(client)

    with client.stream("GET", f"/jobs/{job_id}/stream") as response:
        for raw in response.iter_lines():
            if raw.startswith("data:"):
                json_str = raw[len("data:"):].strip()
                try:
                    parsed = json.loads(json_str)
                except json.JSONDecodeError:
                    pytest.fail(f"Invalid JSON in data line: {raw!r}")
                assert "event_type" in parsed, f"Missing event_type: {parsed}"
            # Stop after seeing the done event
            if raw == "event: done":
                break


def test_stream_emits_state_change_event(client: TestClient) -> None:
    """At least one state_change event must appear in the stream."""
    job_id = _queue_job(client)
    event_types: list[str] = []

    with client.stream("GET", f"/jobs/{job_id}/stream") as response:
        for raw in response.iter_lines():
            if raw.startswith("event:"):
                event_types.append(raw.split(":", 1)[1].strip())
            if "done" in event_types:
                break

    assert "state_change" in event_types, (
        f"No state_change event found. Events seen: {event_types}"
    )


def test_stream_ends_with_done_event(client: TestClient) -> None:
    """The SSE stream must eventually emit a `done` event."""
    job_id = _queue_job(client)
    event_types: list[str] = []

    with client.stream("GET", f"/jobs/{job_id}/stream") as response:
        for raw in response.iter_lines():
            if raw.startswith("event:"):
                evt = raw.split(":", 1)[1].strip()
                event_types.append(evt)
            if "done" in event_types:
                break

    assert "done" in event_types, (
        f"Stream never emitted 'done'. Events: {event_types}"
    )
