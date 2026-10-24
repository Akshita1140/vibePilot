"""
app/config.py
Application settings loaded from environment variables / .env file.
No secrets are hardcoded here; all sensitive values come from the environment.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    """
    All configuration for the VibePilot backend.

    Values are read from environment variables first, then from a .env file
    in the project root. Sensitive fields (API keys) are never given default
    values so the application fails fast if a required secret is missing.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Server ────────────────────────────────────────────────────────────────
    host: str = Field(default="0.0.0.0", description="Bind address for Uvicorn")
    port: int = Field(default=8000, description="Listen port for Uvicorn")
    debug: bool = Field(default=False, description="Enable auto-reload / debug mode")

    # ── CORS ──────────────────────────────────────────────────────────────────
    cors_origins: list[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000"],
        description="Allowed CORS origins",
    )

    # ── LLM — Google Gemini ───────────────────────────────────────────────────
    # Set in .env — never commit real keys.
    gemini_api_key: str = Field(
        default="",
        description="Google Gemini API key. Get one at https://aistudio.google.com/apikey",
    )
    gemini_model: str = Field(
        default="gemini-2.0-flash",
        description="Gemini model name to use for analysis.",
    )

    # ── Future integrations ───────────────────────────────────────────────────
    tinyfish_api_key: str = Field(
        default="",
        description="TinyFish browser-agent API key (not used in demo mode)",
    )
    database_url: str = Field(
        default="sqlite:///./vibepilot.db",
        description="SQLAlchemy database URL (SQLite default for dev)",
    )


# Singleton — import this throughout the app instead of re-instantiating.
settings = Settings()
