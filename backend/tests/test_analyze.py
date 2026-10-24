"""
tests/test_analyze.py
Tests for POST /api/analyze.

Response shape changed in Step 3:
  - Status code: 202 Accepted (was 200)
  - Body: {job_id, status, stream_url, result_url} — no app_map inline
  - App Map is delivered via SSE stream and GET /jobs/{id}

Coverage
────────
• Happy path: minimal payload → 202 with job_id
• Happy path: full payload → 202 with job_id
• Response structure: job_id, status, stream_url, result_url
• Validation: missing app_url → 422
• Validation: non-HTTP scheme → 400 or 422
• Validation: description too long → 422
• Validation: invalid URL string → 422
• Validation: invalid repository_url → 422
• Validation: null optional fields accepted → 202
• Validation: empty string app_url → 422
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


ENDPOINT = "/api/analyze"
VALID_URL = "https://my-saas.vercel.app"


# ─────────────────────────────────────────────────────────────────────────────
# Happy-path tests
# ─────────────────────────────────────────────────────────────────────────────


def test_analyze_minimal_payload_returns_202(client: TestClient) -> None:
    """Sending only the required app_url must return HTTP 202 Accepted."""
    response = client.post(ENDPOINT, json={"app_url": VALID_URL})
    assert response.status_code == 202, (
        f"Expected 202, got {response.status_code}: {response.text}"
    )


def test_analyze_full_payload_returns_202(client: TestClient) -> None:
    """Sending all optional fields must also return HTTP 202."""
    payload = {
        "app_url": VALID_URL,
        "repository_url": "https://github.com/user/my-saas",
        "description": "Google OAuth fails with redirect_uri_mismatch.",
    }
    response = client.post(ENDPOINT, json=payload)
    assert response.status_code == 202, (
        f"Expected 202, got {response.status_code}: {response.text}"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Response structure
# ─────────────────────────────────────────────────────────────────────────────


def test_analyze_response_has_job_id(client: TestClient) -> None:
    """Response must include a non-empty job_id."""
    response = client.post(ENDPOINT, json={"app_url": VALID_URL})
    data = response.json()
    assert data.get("job_id"), "Response must have a non-empty job_id."


def test_analyze_response_has_status(client: TestClient) -> None:
    """Response must include a status field (QUEUED on creation)."""
    response = client.post(ENDPOINT, json={"app_url": VALID_URL})
    data = response.json()
    assert data.get("status") == "QUEUED", (
        f"Expected status='QUEUED', got {data.get('status')}"
    )


def test_analyze_response_has_stream_url(client: TestClient) -> None:
    """Response must include a stream_url pointing to the SSE endpoint."""
    response = client.post(ENDPOINT, json={"app_url": VALID_URL})
    data = response.json()
    stream_url = data.get("stream_url", "")
    assert "/stream" in stream_url, f"stream_url should contain '/stream': {stream_url}"


def test_analyze_response_has_result_url(client: TestClient) -> None:
    """Response must include a result_url pointing to the job poll endpoint."""
    response = client.post(ENDPOINT, json={"app_url": VALID_URL})
    data = response.json()
    result_url = data.get("result_url", "")
    job_id = data.get("job_id", "")
    assert job_id in result_url, f"result_url should contain job_id: {result_url}"


def test_analyze_each_request_gets_unique_job_id(client: TestClient) -> None:
    """Two requests must produce different job IDs."""
    r1 = client.post(ENDPOINT, json={"app_url": VALID_URL})
    r2 = client.post(ENDPOINT, json={"app_url": VALID_URL})
    assert r1.json()["job_id"] != r2.json()["job_id"]


def test_analyze_stream_url_uses_job_id(client: TestClient) -> None:
    """The stream_url must contain the job's own job_id."""
    response = client.post(ENDPOINT, json={"app_url": VALID_URL})
    data = response.json()
    assert data["job_id"] in data["stream_url"]


# ─────────────────────────────────────────────────────────────────────────────
# Request validation — invalid inputs
# ─────────────────────────────────────────────────────────────────────────────


def test_analyze_missing_app_url_returns_422(client: TestClient) -> None:
    """Omitting the required app_url must return HTTP 422."""
    response = client.post(ENDPOINT, json={})
    assert response.status_code == 422, (
        f"Expected 422, got {response.status_code}: {response.text}"
    )


def test_analyze_invalid_url_string_returns_422(client: TestClient) -> None:
    """A plain string that isn't a URL must return HTTP 422."""
    response = client.post(ENDPOINT, json={"app_url": "not-a-url-at-all"})
    assert response.status_code == 422, (
        f"Expected 422, got {response.status_code}: {response.text}"
    )


def test_analyze_non_http_scheme_rejected(client: TestClient) -> None:
    """A non-HTTP/HTTPS URL scheme must be rejected with 4xx."""
    response = client.post(ENDPOINT, json={"app_url": "ftp://example.com/app"})
    assert response.status_code in (400, 422), (
        f"Expected 400 or 422 for ftp:// scheme, got {response.status_code}: {response.text}"
    )


def test_analyze_description_too_long_returns_422(client: TestClient) -> None:
    """A description exceeding 2000 characters must return HTTP 422."""
    long_description = "x" * 2001
    response = client.post(
        ENDPOINT,
        json={"app_url": VALID_URL, "description": long_description},
    )
    assert response.status_code == 422, (
        f"Expected 422 for overlong description, got {response.status_code}: {response.text}"
    )


def test_analyze_invalid_repository_url_returns_422(client: TestClient) -> None:
    """An invalid repository_url must return HTTP 422."""
    response = client.post(
        ENDPOINT,
        json={"app_url": VALID_URL, "repository_url": "not-a-url"},
    )
    assert response.status_code == 422, (
        f"Expected 422 for invalid repository_url, got {response.status_code}: {response.text}"
    )


def test_analyze_null_optional_fields_accepted(client: TestClient) -> None:
    """Explicitly sending null for optional fields must be accepted (202)."""
    payload = {
        "app_url": VALID_URL,
        "repository_url": None,
        "description": None,
    }
    response = client.post(ENDPOINT, json=payload)
    assert response.status_code == 202, (
        f"Expected 202 with null optional fields, got {response.status_code}: {response.text}"
    )


def test_analyze_empty_string_app_url_returns_422(client: TestClient) -> None:
    """An empty string for app_url must return HTTP 422."""
    response = client.post(ENDPOINT, json={"app_url": ""})
    assert response.status_code == 422, (
        f"Expected 422 for empty app_url, got {response.status_code}: {response.text}"
    )
