"""
tests/conftest.py
Shared pytest fixtures for the VibePilot backend test suite.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import create_app


@pytest.fixture(scope="session")
def client() -> TestClient:
    """
    Session-scoped TestClient so the FastAPI app is created only once per
    test session. Uses httpx under the hood; no real network calls are made.
    """
    application = create_app()
    with TestClient(application, raise_server_exceptions=True) as c:
        yield c
