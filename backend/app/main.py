"""
app/main.py
FastAPI application factory and entry point.
"""

from __future__ import annotations

import logging
import logging.config
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse

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

    # ── Root status & documentation landing ──────────────────────────────────
    @app.api_route("/", methods=["GET", "HEAD"], response_class=HTMLResponse, include_in_schema=False)
    async def root_index(request: Request):
        if request.method == "HEAD":
            return Response(status_code=200)
        accept = request.headers.get("accept", "")
        if "application/json" in accept and "text/html" not in accept:
            return JSONResponse({
                "service": "vibepilot-backend",
                "status": "online",
                "version": "0.1.0",
                "tagline": "AI writes the app. VibePilot gets it ready to ship.",
                "docs_url": "/docs",
                "health_url": "/health",
                "openapi_url": "/openapi.json",
            })

        html = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VibePilot Backend API (v1.0)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #090d16;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 20px;
      padding: 36px;
      max-width: 520px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6);
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
    }
    h1 { font-size: 24px; color: #f8fafc; font-weight: 800; margin-bottom: 8px; }
    p.tagline { color: #94a3b8; font-size: 14px; margin-bottom: 24px; line-height: 1.5; }
    .links { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
    .link-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 13px 18px;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      color: #38bdf8;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.15s ease;
    }
    .link-btn:hover {
      background: #0284c7;
      color: #ffffff;
      border-color: #38bdf8;
      transform: translateY(-2px);
    }
    .link-btn.primary {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      border-color: #3b82f6;
      color: #ffffff;
    }
    .link-btn.primary:hover {
      background: linear-gradient(135deg, #1d4ed8, #1e40af);
    }
    .footer {
      font-size: 12px;
      color: #64748b;
      text-align: center;
      border-top: 1px solid #1e293b;
      padding-top: 18px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="pill"><span class="dot"></span> Backend v1.0 Active</div>
    <h1>VibePilot Backend API</h1>
    <p class="tagline">“AI writes the app. VibePilot gets it ready to ship.”</p>
    <div class="links">
      <a href="/docs" class="link-btn primary">
        <span>📖 Swagger UI Interactive Docs (/docs)</span>
        <span>→</span>
      </a>
      <a href="/health" class="link-btn">
        <span>🩺 Health Check Status (/health)</span>
        <span>→</span>
      </a>
      <a href="/redoc" class="link-btn">
        <span>📄 ReDoc Specification (/redoc)</span>
        <span>→</span>
      </a>
      <a href="http://localhost:3000" class="link-btn" style="border-color: #6366f1; color: #a5b4fc;">
        <span>🚀 VibePilot Frontend App (localhost:3000)</span>
        <span>↗</span>
      </a>
    </div>
    <div class="footer">
      Running on port 8000 • FastAPI + Uvicorn • Python 3.13
    </div>
  </div>
</body>
</html>"""
        return HTMLResponse(content=html)

    @app.api_route("/favicon.ico", methods=["GET", "HEAD"], include_in_schema=False)
    async def favicon():
        return Response(status_code=204)

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
