"""
app/main.py
FastAPI application factory and entry point.
"""

from __future__ import annotations

import logging
import logging.config
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers.analyze import router as analyze_router
from app.routers.health import router as health_router
from app.routers.jobs import router as jobs_router
from app.routers.receipt import router as receipt_router

# ─────────────────────────────────────────────────────────────────────────────
# Logging
# ─────────────────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%SZ",
)
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Lifespan (startup / shutdown hooks)
# ─────────────────────────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:  # noqa: ARG001
    """Application lifespan context manager."""
    logger.info("VibePilot backend starting up (foundation / demo mode).")
    logger.info("CORS origins: %s", settings.cors_origins)
    yield
    logger.info("VibePilot backend shutting down.")


# ─────────────────────────────────────────────────────────────────────────────
# Application factory
# ─────────────────────────────────────────────────────────────────────────────


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="VibePilot Backend API",
        description=(
            "AI-assisted deployment and configuration agent for apps built with "
            "Lovable, Bolt, v0, Replit, Cursor, and similar AI coding tools.\n\n"
            "> **Current milestone:** foundation / demo mode. "
            "Live LLM and browser-agent integration is not yet active."
        ),
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Global exception handler ───────────────────────────────────────────────
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        logger.exception("Unhandled exception on %s %s", request.method, request.url)
        return JSONResponse(
            status_code=500,
            content={"detail": "An unexpected internal server error occurred."},
        )

    # ── Routers ───────────────────────────────────────────────────────────────
    app.include_router(health_router)
    app.include_router(analyze_router)
    app.include_router(jobs_router)
    app.include_router(receipt_router)

    return app


# Module-level app instance used by Uvicorn: `uvicorn app.main:app`
app = create_app()


# ─────────────────────────────────────────────────────────────────────────────
# Dev-mode direct execution: `python -m app.main` or `python app/main.py`
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
