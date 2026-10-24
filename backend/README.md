# VibePilot Backend

Python 3.11+ · FastAPI · Pydantic v2 · Uvicorn · pytest

> **Current milestone:** foundation / demo mode.  
> No LLM calls, browser agents, or database writes are active yet.  
> All analysis responses are clearly-labelled fixtures.

---

## Project structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI app factory + lifespan hooks
│   ├── config.py        # Settings via pydantic-settings (.env)
│   ├── models/
│   │   ├── requests.py  # AnalyzeRequest Pydantic model
│   │   └── responses.py # AppMap, SetupGap, and all nested models
│   ├── routers/
│   │   ├── health.py    # GET /health
│   │   └── analyze.py   # POST /api/analyze
│   └── demo/
│       └── fixture.py   # Clearly-labelled demo App Map fixture
├── tests/
│   ├── conftest.py      # Session-scoped TestClient fixture
│   ├── test_health.py   # Health endpoint tests
│   └── test_analyze.py  # Analyze endpoint tests (happy + error paths)
├── .env.example         # Template — copy to .env, never commit .env
├── requirements.txt     # Pinned Python dependencies
└── README.md            # This file
```

---

## Prerequisites

- Python **3.11** or newer
- Git

---

## Local setup (exact commands)

### 1 · Clone and enter the backend directory

```bash
git clone https://github.com/Akshita1140/vibePilot.git
cd vibePilot/backend
```

### 2 · Create and activate a virtual environment

**macOS / Linux**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

**Windows PowerShell**
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

### 3 · Install dependencies

```bash
pip install -r requirements.txt
```

### 4 · Configure environment variables

```bash
# macOS / Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Open `.env` and fill in real values where needed (API keys for future milestones).  
**Never commit `.env` to version control.**

### 5 · Run the development server

```bash
uvicorn app.main:app --reload
```

The API is now available at **http://localhost:8000**

| URL | Description |
|---|---|
| http://localhost:8000/health | Liveness probe |
| http://localhost:8000/docs | Swagger / OpenAPI UI |
| http://localhost:8000/redoc | ReDoc documentation |
| http://localhost:8000/openapi.json | Raw OpenAPI schema |

---

## Running the tests

```bash
# from the backend/ directory, with the venv activated
pytest -v
```

Expected output (all tests must pass):

```
tests/test_health.py::test_health_returns_200                          PASSED
tests/test_health.py::test_health_returns_correct_body                 PASSED
tests/test_health.py::test_health_content_type_is_json                 PASSED
tests/test_analyze.py::test_analyze_minimal_payload_returns_200        PASSED
tests/test_analyze.py::test_analyze_full_payload_returns_200           PASSED
tests/test_analyze.py::test_analyze_response_is_labelled_demo          PASSED
tests/test_analyze.py::test_analyze_response_has_disclaimer            PASSED
tests/test_analyze.py::test_analyze_response_has_job_id                PASSED
tests/test_analyze.py::test_analyze_response_has_status                PASSED
tests/test_analyze.py::test_analyze_app_map_contains_pages             PASSED
tests/test_analyze.py::test_analyze_app_map_pages_have_required_fields PASSED
tests/test_analyze.py::test_analyze_app_map_contains_detected_services PASSED
tests/test_analyze.py::test_analyze_app_map_contains_setup_gaps        PASSED
tests/test_analyze.py::test_analyze_setup_gaps_have_required_fields    PASSED
tests/test_analyze.py::test_analyze_app_url_echoed_in_app_map          PASSED
tests/test_analyze.py::test_analyze_missing_app_url_returns_422        PASSED
tests/test_analyze.py::test_analyze_invalid_url_string_returns_422     PASSED
tests/test_analyze.py::test_analyze_non_http_scheme_rejected           PASSED
tests/test_analyze.py::test_analyze_description_too_long_returns_422   PASSED
tests/test_analyze.py::test_analyze_invalid_repository_url_returns_422 PASSED
tests/test_analyze.py::test_analyze_null_optional_fields_accepted      PASSED
tests/test_analyze.py::test_analyze_empty_string_app_url_returns_422   PASSED
```

---

## API reference

### `GET /health`

Liveness probe. No authentication required.

**Response `200 OK`**
```json
{
  "status": "ok",
  "service": "vibepilot-backend"
}
```

---

### `POST /api/analyze`

Submit an app URL for analysis.

> ⚠️ **Demo mode** — The current response is a clearly-labelled fixture.  
> `app_map.meta.mode` is always `"demo"` in this milestone.  
> No real scan, LLM call, or browser-agent run is performed.

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `app_url` | `string` (HTTP/HTTPS URL) | ✅ | The deployed app URL to analyse |
| `repository_url` | `string` (HTTP/HTTPS URL) | ❌ | Source repository URL |
| `description` | `string` (max 2000 chars) | ❌ | Free-text context |

**Example request**
```json
{
  "app_url": "https://my-saas.vercel.app",
  "repository_url": "https://github.com/user/my-saas",
  "description": "Sign in with Google fails with redirect_uri_mismatch."
}
```

**Response `200 OK`** — `AnalyzeResponse`
```json
{
  "job_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "completed",
  "app_map": {
    "app_url": "https://my-saas.vercel.app",
    "app_name": "Demo SaaS App (fixture)",
    "summary": "...",
    "pages": [...],
    "detected_services": [...],
    "data_collected": [...],
    "setup_gaps": [...],
    "meta": {
      "mode": "demo",
      "analysed_at": "2026-10-24T11:00:00Z",
      "analyser_version": "0.1.0-foundation",
      "disclaimer": "⚠️  DEMO RESPONSE — ..."
    }
  }
}
```

**Error responses**

| Code | Cause |
|---|---|
| `422` | Missing `app_url`, invalid URL format, or description too long |
| `400` | Non-HTTP/HTTPS URL scheme |
| `500` | Unexpected server error |

---

## App Map schema

The `app_map` object models a VibePilot analysis of a web application:

| Field | Type | Description |
|---|---|---|
| `app_url` | string | The URL that was analysed |
| `app_name` | string? | Inferred application name |
| `summary` | string | Plain-English one-paragraph summary |
| `pages` | `Page[]` | Discovered pages/routes |
| `detected_services` | `DetectedService[]` | Third-party integrations found |
| `data_collected` | `DataPoint[]` | User data categories handled |
| `setup_gaps` | `SetupGap[]` | Misconfigurations and missing setup steps |
| `meta` | `AnalysisMeta` | Mode, timestamp, version, disclaimer |

A `SetupGap` has severity levels: `critical` · `high` · `medium` · `low` · `info`  
and statuses: `open` · `in_progress` · `resolved` · `wont_fix`

---

## Environment variables

See [`.env.example`](.env.example) for the full list.  
Key variables:

| Variable | Default | Purpose |
|---|---|---|
| `HOST` | `0.0.0.0` | Uvicorn bind address |
| `PORT` | `8000` | Uvicorn listen port |
| `DEBUG` | `false` | Enable auto-reload |
| `CORS_ORIGINS` | `["http://localhost:3000"]` | Allowed frontend origins |
| `LLM_API_KEY` | _(empty)_ | LLM provider key — **not used yet** |
| `TINYFISH_API_KEY` | _(empty)_ | TinyFish key — **not used yet** |
| `DATABASE_URL` | `sqlite:///./vibepilot.db` | DB URL — **not used yet** |

---

## Roadmap (backend)

- [ ] Live analysis: fetch app pages and pass to LLM for structured App Map
- [ ] TinyFish integration: browser-agent diagnosis of live errors  
- [ ] Job state machine: `ANALYZING → DIAGNOSING → AWAITING_APPROVAL → EXECUTING → VERIFYING → DONE`
- [ ] `GET /jobs/{id}/stream` — SSE progress stream
- [ ] `POST /jobs/{id}/approve` — approval gate
- [ ] `GET /jobs/{id}/receipt` — evidence log and Setup Receipt
- [ ] SQLite persistence for jobs and evidence
- [ ] Redis queue for long-running jobs

---

## Security notes

- API keys are never hardcoded. They are read from `.env` at startup.
- `.env` is in `.gitignore` — never commit it.
- The approval gate for provider automation is enforced server-side.
- Sensitive values are never forwarded to the LLM in raw form.
