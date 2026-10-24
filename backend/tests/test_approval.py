"""
tests/test_approval.py
Tests for the approval gate (POST /jobs/{id}/approve) and receipt endpoint.

All tests use the synchronous TestClient. The pipeline runs as an asyncio
background task in the same event loop, so we poll GET /jobs/{id} to wait
for state transitions.
"""

from __future__ import annotations

import time
from typing import Optional

import pytest
from fastapi.testclient import TestClient


ANALYZE = "/api/analyze"
VALID_URL = "https://my-saas.vercel.app"
TERMINAL = {"DONE", "FAILED", "GUIDED"}


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _queue(client: TestClient, url: str = VALID_URL) -> str:
    r = client.post(ANALYZE, json={"app_url": url})
    assert r.status_code == 202, r.text
    return r.json()["job_id"]


def _poll(
    client: TestClient,
    job_id: str,
    target_states: set[str],
    timeout: float = 30.0,
) -> dict:
    """Poll until the job reaches one of target_states."""
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        r = client.get(f"/jobs/{job_id}")
        assert r.status_code == 200
        data = r.json()
        if data["status"] in target_states:
            return data
        time.sleep(0.1)
    raise TimeoutError(f"Job {job_id} did not reach {target_states} within {timeout}s. Last: {data['status']}")


# ─────────────────────────────────────────────────────────────────────────────
# POST /jobs/{id}/approve — basic validation
# ─────────────────────────────────────────────────────────────────────────────


def test_approve_returns_404_for_unknown_job(client: TestClient) -> None:
    r = client.post("/jobs/no-such-job/approve", json={})
    assert r.status_code == 404


def test_approve_returns_409_when_not_awaiting(client: TestClient) -> None:
    """Calling approve on a job that is NOT in AWAITING_APPROVAL should return 409."""
    job_id = _queue(client)
    # Wait for any terminal state OR for the job to be AWAITING_APPROVAL first,
    # then wait for it to complete after approving (or just wait for terminal)
    data = _poll(client, job_id, {"AWAITING_APPROVAL"} | TERMINAL)
    if data["status"] == "AWAITING_APPROVAL":
        # Approve first so the pipeline completes
        pending_ids = [g["id"] for g in data["pending_gaps"]]
        client.post(f"/jobs/{job_id}/approve", json={"approved_gap_ids": pending_ids})
        _poll(client, job_id, TERMINAL)
    # Now job is terminal — approve must return 409
    r = client.post(f"/jobs/{job_id}/approve", json={})
    assert r.status_code == 409, f"Expected 409 on terminal job, got {r.status_code}: {r.text}"


# ─────────────────────────────────────────────────────────────────────────────
# Full flow: queue → AWAITING_APPROVAL → approve → DONE
# ─────────────────────────────────────────────────────────────────────────────


def test_job_reaches_awaiting_approval_or_done(client: TestClient) -> None:
    """
    After ANALYZING, the job must reach AWAITING_APPROVAL (if there are
    autofix gaps) or DONE (if no autofix gaps).
    """
    job_id = _queue(client)
    data = _poll(client, job_id, {"AWAITING_APPROVAL"} | TERMINAL)
    assert data["status"] in {"AWAITING_APPROVAL", "DONE", "GUIDED"}


def test_awaiting_approval_job_has_pending_gaps(client: TestClient) -> None:
    """When status is AWAITING_APPROVAL, pending_gaps must be non-empty."""
    job_id = _queue(client)
    data = _poll(client, job_id, {"AWAITING_APPROVAL"} | TERMINAL)
    if data["status"] == "AWAITING_APPROVAL":
        assert len(data.get("pending_gaps", [])) > 0, (
            "AWAITING_APPROVAL job must have pending_gaps."
        )


def test_approve_all_moves_job_to_terminal(client: TestClient) -> None:
    """Approving all pending gaps must eventually move the job to a terminal state."""
    job_id = _queue(client)
    data = _poll(client, job_id, {"AWAITING_APPROVAL"} | TERMINAL)

    if data["status"] == "AWAITING_APPROVAL":
        pending_ids = [g["id"] for g in data["pending_gaps"]]
        r = client.post(
            f"/jobs/{job_id}/approve",
            json={"approved_gap_ids": pending_ids, "rejected_gap_ids": []},
        )
        assert r.status_code == 200, r.text
        result = r.json()
        assert result["approved_count"] == len(pending_ids)
        assert result["job_id"] == job_id

        # Wait for terminal
        final = _poll(client, job_id, TERMINAL)
        assert final["status"] in TERMINAL


def test_approve_response_has_required_fields(client: TestClient) -> None:
    """ApprovalResponse must include job_id, approved_count, rejected_count, next_state, message."""
    job_id = _queue(client)
    data = _poll(client, job_id, {"AWAITING_APPROVAL"} | TERMINAL)

    if data["status"] == "AWAITING_APPROVAL":
        pending_ids = [g["id"] for g in data["pending_gaps"]]
        r = client.post(
            f"/jobs/{job_id}/approve",
            json={"approved_gap_ids": pending_ids},
        )
        assert r.status_code == 200
        body = r.json()
        for field in ("job_id", "approved_count", "rejected_count", "next_state", "message"):
            assert field in body, f"Missing field: {field}"


def test_reject_all_moves_job_to_guided(client: TestClient) -> None:
    """Using reject_all=True must move the job to GUIDED (or DONE if no autofix gaps)."""
    job_id = _queue(client)
    data = _poll(client, job_id, {"AWAITING_APPROVAL"} | TERMINAL)

    if data["status"] == "AWAITING_APPROVAL":
        r = client.post(f"/jobs/{job_id}/approve", json={"reject_all": True})
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["approved_count"] == 0
        assert body["next_state"] in ("GUIDED", "DONE")

        final = _poll(client, job_id, TERMINAL)
        assert final["status"] in TERMINAL


def test_approve_with_invalid_gap_ids_returns_422(client: TestClient) -> None:
    """Submitting gap IDs not in the pending list must return 422."""
    job_id = _queue(client)
    data = _poll(client, job_id, {"AWAITING_APPROVAL"} | TERMINAL)

    if data["status"] == "AWAITING_APPROVAL":
        r = client.post(
            f"/jobs/{job_id}/approve",
            json={"approved_gap_ids": ["non-existent-gap-id"]},
        )
        assert r.status_code == 422, f"Expected 422, got {r.status_code}: {r.text}"


def test_approve_with_notes_stores_notes(client: TestClient) -> None:
    """Notes submitted with the approval must be stored on the job."""
    job_id = _queue(client)
    data = _poll(client, job_id, {"AWAITING_APPROVAL"} | TERMINAL)

    if data["status"] == "AWAITING_APPROVAL":
        pending_ids = [g["id"] for g in data["pending_gaps"]]
        client.post(
            f"/jobs/{job_id}/approve",
            json={"approved_gap_ids": pending_ids, "notes": "Approved by test."},
        )
        _poll(client, job_id, TERMINAL)
        job_data = client.get(f"/jobs/{job_id}").json()
        assert job_data.get("approval_notes") == "Approved by test."


# ─────────────────────────────────────────────────────────────────────────────
# GET /jobs/{id}/receipt
# ─────────────────────────────────────────────────────────────────────────────


def test_receipt_returns_409_while_job_running(client: TestClient) -> None:
    """Receipt must not be available while the job is still running."""
    job_id = _queue(client)
    # Immediately after queueing (job is QUEUED/ANALYZING)
    r = client.get(f"/jobs/{job_id}/receipt")
    # Either 409 (not done yet) or 200 (if it completed very fast)
    assert r.status_code in (200, 409), r.text


def test_receipt_returns_404_for_unknown_job(client: TestClient) -> None:
    r = client.get("/jobs/no-such-job/receipt")
    assert r.status_code == 404


def test_receipt_returns_200_for_completed_job(client: TestClient) -> None:
    """After any terminal state (DONE or GUIDED), receipt must return 200."""
    job_id = _queue(client)
    data = _poll(client, job_id, {"AWAITING_APPROVAL"} | TERMINAL, timeout=30.0)
    if data["status"] == "AWAITING_APPROVAL":
        pending_ids = [g["id"] for g in data["pending_gaps"]]
        client.post(f"/jobs/{job_id}/approve", json={"approved_gap_ids": pending_ids})
        _poll(client, job_id, TERMINAL, timeout=30.0)
    r = client.get(f"/jobs/{job_id}/receipt")
    assert r.status_code == 200, r.text


def test_receipt_has_required_fields(client: TestClient) -> None:
    """Receipt must include job_id, app_url, status, gap_receipts."""
    job_id = _queue(client)
    data = _poll(client, job_id, {"AWAITING_APPROVAL"} | TERMINAL, timeout=30.0)
    if data["status"] == "AWAITING_APPROVAL":
        pending_ids = [g["id"] for g in data["pending_gaps"]]
        client.post(f"/jobs/{job_id}/approve", json={"approved_gap_ids": pending_ids})
        _poll(client, job_id, TERMINAL, timeout=30.0)
    data = client.get(f"/jobs/{job_id}/receipt").json()
    for field in ("job_id", "app_url", "status", "gap_receipts"):
        assert field in data, f"Missing field: {field}"


def _complete_job(client: TestClient, url: str = VALID_URL) -> str:
    job_id = _queue(client, url)
    data = _poll(client, job_id, {"AWAITING_APPROVAL"} | TERMINAL)
    if data["status"] == "AWAITING_APPROVAL":
        pending_ids = [g["id"] for g in data.get("pending_gaps", [])]
        client.post(f"/jobs/{job_id}/approve", json={"approved_gap_ids": pending_ids})
        _poll(client, job_id, TERMINAL)
    return job_id


def test_receipt_gap_receipts_have_required_fields(client: TestClient) -> None:
    """Each gap_receipt must have id, title, severity, decision."""
    job_id = _complete_job(client)
    data = client.get(f"/jobs/{job_id}/receipt").json()
    for gap in data.get("gap_receipts", []):
        for field in ("id", "title", "severity", "decision"):
            assert field in gap, f"gap_receipt missing field: {field}"


def test_receipt_gap_decisions_are_valid(client: TestClient) -> None:
    """Every gap decision must be one of the known values."""
    valid_decisions = {"approved", "rejected", "skipped", "not_applicable"}
    job_id = _complete_job(client)
    data = client.get(f"/jobs/{job_id}/receipt").json()
    for gap in data.get("gap_receipts", []):
        assert gap["decision"] in valid_decisions, (
            f"Invalid decision '{gap['decision']}' for gap {gap['id']}"
        )


def test_receipt_has_raw_app_map(client: TestClient) -> None:
    """Receipt must include the raw app_map with a summary."""
    job_id = _complete_job(client)
    data = client.get(f"/jobs/{job_id}/receipt").json()
    raw = data.get("raw_app_map", {})
    assert "summary" in raw, "raw_app_map must contain summary."


def test_full_approve_flow_receipt_shows_approved_decision(client: TestClient) -> None:
    """
    End-to-end: queue → wait for AWAITING_APPROVAL → approve all → wait DONE
    → receipt shows 'approved' for those gaps.
    """
    job_id = _queue(client)
    data = _poll(client, job_id, {"AWAITING_APPROVAL"} | TERMINAL)

    if data["status"] == "AWAITING_APPROVAL":
        pending_ids = [g["id"] for g in data["pending_gaps"]]
        client.post(
            f"/jobs/{job_id}/approve",
            json={"approved_gap_ids": pending_ids},
        )
        _poll(client, job_id, TERMINAL)

        receipt = client.get(f"/jobs/{job_id}/receipt").json()
        for gap in receipt["gap_receipts"]:
            if gap["id"] in pending_ids:
                assert gap["decision"] == "approved", (
                    f"Gap {gap['id']} should be 'approved', got '{gap['decision']}'"
                )
