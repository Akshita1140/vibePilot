"""
tests/test_health.py
Tests for GET /health.
"""

from fastapi.testclient import TestClient


def test_health_returns_200(client: TestClient) -> None:
    """The health endpoint must respond with HTTP 200."""
    response = client.get("/health")
    assert response.status_code == 200, (
        f"Expected 200, got {response.status_code}: {response.text}"
    )


def test_health_returns_correct_body(client: TestClient) -> None:
    """The health endpoint must return the exact required JSON body."""
    response = client.get("/health")
    data = response.json()
    assert data["status"] == "ok", f"Unexpected status field: {data}"
    assert data["service"] == "vibepilot-backend", f"Unexpected service field: {data}"


def test_health_content_type_is_json(client: TestClient) -> None:
    """The health endpoint must return Content-Type: application/json."""
    response = client.get("/health")
    assert "application/json" in response.headers.get("content-type", ""), (
        f"Unexpected content-type: {response.headers.get('content-type')}"
    )
