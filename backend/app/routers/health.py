"""
app/routers/health.py
GET /health — liveness probe endpoint.
"""

from fastapi import APIRouter
from app.models.responses import HealthResponse

router = APIRouter(tags=["health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description=(
        "Liveness probe. Returns HTTP 200 with a fixed JSON body as long as "
        "the process is running. No database or external service connectivity "
        "is checked here; use /health/ready for that (future milestone)."
    ),
)
async def health_check() -> HealthResponse:
    """Return service health status."""
    return HealthResponse(status="ok", service="vibepilot-backend")
