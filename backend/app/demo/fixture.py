"""
app/demo/fixture.py
Clearly-labelled demo analysis fixture.

⚠️  DEMO MODE ──────────────────────────────────────────────────────────────
This module returns a pre-built, static App Map. It does NOT scan or contact
the submitted URL. Real LLM and TinyFish browser-agent integration is planned
for a future milestone. The response is always tagged with mode="demo" and
includes a prominent disclaimer.
────────────────────────────────────────────────────────────────────────────
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from app.models.responses import (
    AnalysisMeta,
    AnalysisMode,
    AnalyzeResponse,
    AppMap,
    DataPoint,
    DetectedFeature,
    DetectedService,
    GapStatus,
    Page,
    Severity,
    SetupGap,
)

_DEMO_DISCLAIMER = (
    "⚠️  DEMO RESPONSE — This App Map was generated from a pre-built fixture and "
    "does NOT reflect an actual scan of the submitted URL. "
    "Live LLM and browser-agent analysis will be available in a future release."
)


def build_demo_response(app_url: str) -> AnalyzeResponse:
    """
    Return a clearly-labelled demo AnalyzeResponse.

    Parameters
    ----------
    app_url:
        The URL submitted by the user; echoed back in the App Map so the
        frontend can display it alongside the disclaimer.
    """

    pages = [
        Page(
            path="/",
            title="Home — Demo SaaS App",
            description=(
                "Marketing landing page with a CTA to sign up or log in. "
                "Loads Google Fonts and a third-party analytics beacon."
            ),
            detected_features=[
                DetectedFeature(
                    name="Sign up / Log in CTA",
                    description="Buttons that redirect to the authentication flow.",
                    requires_auth=False,
                ),
                DetectedFeature(
                    name="Analytics beacon",
                    description="Fires a page-view event on load (Google Analytics).",
                    requires_auth=False,
                    notes="GA4 measurement ID detected in page source.",
                ),
            ],
        ),
        Page(
            path="/auth/callback",
            title="OAuth Callback",
            description=(
                "Google OAuth 2.0 redirect target. Receives the authorisation code "
                "and exchanges it for a session token. Currently failing on the "
                "deployed domain due to a missing redirect URI."
            ),
            detected_features=[
                DetectedFeature(
                    name="Google OAuth callback handler",
                    description=(
                        "Expects ?code= and ?state= query parameters from Google. "
                        "On mismatch the browser shows redirect_uri_mismatch."
                    ),
                    requires_auth=False,
                    notes=(
                        "The deployed domain is not registered in the Google Cloud "
                        "Console OAuth client's Authorised redirect URIs list."
                    ),
                ),
            ],
        ),
        Page(
            path="/dashboard",
            title="Dashboard",
            description=(
                "Main authenticated view. Shows user data and allows task management."
            ),
            detected_features=[
                DetectedFeature(
                    name="Task list",
                    description="Fetches and renders the current user's tasks via REST API.",
                    requires_auth=True,
                ),
                DetectedFeature(
                    name="Profile menu",
                    description="Shows user avatar and email; logout button clears session.",
                    requires_auth=True,
                ),
            ],
        ),
        Page(
            path="/settings",
            title="Settings",
            description="Account and notification settings. Email update requires re-verification.",
            detected_features=[
                DetectedFeature(
                    name="Email change",
                    description="Sends a verification email via a transactional email provider.",
                    requires_auth=True,
                    notes="Transactional email provider not yet configured.",
                ),
            ],
        ),
    ]

    detected_services = [
        DetectedService(
            name="Google OAuth 2.0",
            category="authentication",
            evidence=(
                "accounts.google.com authorisation endpoint referenced in page source; "
                "GOOGLE_CLIENT_ID environment variable expected by the app."
            ),
            dashboard_url="https://console.cloud.google.com/apis/credentials",  # type: ignore[arg-type]
            configuration_required=True,
        ),
        DetectedService(
            name="Google Analytics 4",
            category="analytics",
            evidence="gtag.js script loaded with a GA4 measurement ID (G-XXXXXXXXXX).",
            dashboard_url="https://analytics.google.com/",  # type: ignore[arg-type]
            configuration_required=False,
        ),
        DetectedService(
            name="Vercel",
            category="hosting",
            evidence=(
                "x-vercel-id response header detected; deployment domain matches "
                "*.vercel.app pattern."
            ),
            dashboard_url="https://vercel.com/dashboard",  # type: ignore[arg-type]
            configuration_required=True,
        ),
        DetectedService(
            name="Supabase",
            category="database / auth",
            evidence=(
                "supabase.co API calls observed in network requests; "
                "NEXT_PUBLIC_SUPABASE_URL environment variable expected."
            ),
            dashboard_url="https://app.supabase.com/",  # type: ignore[arg-type]
            configuration_required=True,
        ),
    ]

    data_collected = [
        DataPoint(
            category="Email address",
            source="Sign-up / login form",
            notes="Stored in Supabase auth.users. Ensure email verification is enabled.",
        ),
        DataPoint(
            category="OAuth identity token",
            source="Google OAuth 2.0 callback",
            notes="Short-lived; exchanged for a Supabase session. Not stored raw.",
        ),
        DataPoint(
            category="Usage analytics",
            source="Google Analytics 4 beacon",
            notes=(
                "Requires a cookie consent banner in jurisdictions covered by GDPR/CCPA."
            ),
        ),
    ]

    setup_gaps = [
        SetupGap(
            id="oauth-redirect-uri-missing",
            title="Google OAuth redirect URI not registered for deployed domain",
            description=(
                "The app's deployed domain (e.g. https://my-app.vercel.app/auth/callback) "
                "is not listed in the Authorised redirect URIs of the Google Cloud Console "
                "OAuth 2.0 client. Any attempt to sign in with Google on the live site "
                "will fail with error 400: redirect_uri_mismatch."
            ),
            severity=Severity.critical,
            status=GapStatus.open,
            affected_service="Google OAuth 2.0",
            suggested_action=(
                "Open the Google Cloud Console → APIs & Services → Credentials → "
                "select the OAuth 2.0 client → add "
                "https://<your-deployed-domain>/auth/callback to Authorised redirect URIs "
                "→ Save."
            ),
            can_autofix=True,
        ),
        SetupGap(
            id="supabase-redirect-url-missing",
            title="Supabase redirect URL list not updated for deployed domain",
            description=(
                "Supabase maintains its own allowlist of redirect URLs for OAuth flows. "
                "If the deployed domain is not added, auth sessions will silently fail "
                "or users will be redirected to localhost."
            ),
            severity=Severity.high,
            status=GapStatus.open,
            affected_service="Supabase",
            suggested_action=(
                "In the Supabase dashboard → Authentication → URL Configuration → "
                "add https://<your-deployed-domain>/auth/callback to Redirect URLs → Save."
            ),
            can_autofix=False,
        ),
        SetupGap(
            id="env-vars-not-set-production",
            title="Production environment variables may not be configured on Vercel",
            description=(
                "The app requires NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, "
                "GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET to be present at runtime. "
                "If any of these are missing on Vercel, API calls will fail silently."
            ),
            severity=Severity.high,
            status=GapStatus.open,
            affected_service="Vercel",
            suggested_action=(
                "Vercel Dashboard → your project → Settings → Environment Variables → "
                "add each required variable for the Production environment → Redeploy."
            ),
            can_autofix=False,
        ),
        SetupGap(
            id="cookie-consent-missing",
            title="No cookie consent banner detected",
            description=(
                "Google Analytics 4 sets cookies and collects IP-based geolocation data. "
                "Without a consent mechanism this may violate GDPR, CCPA, and similar laws."
            ),
            severity=Severity.medium,
            status=GapStatus.open,
            affected_service="Google Analytics 4",
            suggested_action=(
                "Integrate a consent management library (e.g. react-cookie-consent) and "
                "only load the GA4 script after the user accepts analytics cookies."
            ),
            can_autofix=False,
        ),
    ]

    meta = AnalysisMeta(
        mode=AnalysisMode.demo,
        analysed_at=datetime.now(tz=timezone.utc),
        analyser_version="0.1.0-foundation",
        disclaimer=_DEMO_DISCLAIMER,
    )

    app_map = AppMap(
        app_url=str(app_url),
        app_name="Demo SaaS App (fixture)",
        summary=(
            "A Next.js SaaS application using Google OAuth 2.0 for authentication, "
            "Supabase as the backend database and auth provider, deployed on Vercel. "
            "The app collects email addresses and usage analytics. "
            "Critical setup gaps exist: the Google OAuth redirect URI and Supabase "
            "redirect URL for the live domain are not registered, causing sign-in failures."
        ),
        pages=pages,
        detected_services=detected_services,
        data_collected=data_collected,
        setup_gaps=setup_gaps,
        meta=meta,
    )

    return AnalyzeResponse(
        job_id=str(uuid.uuid4()),
        status="completed",
        app_map=app_map,
    )
