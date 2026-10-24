# VibePilot — Frontend

> **“AI writes the app. VibePilot gets it ready to ship.”**  
> *Developed for the 24-Hour Hackathon at IIIT Delhi.*

VibePilot provides developers and hackathon judges with an end-to-end cockpit to analyze AI-generated projects, orchestrate setup tasks, govern sensitive operations with explicit human-in-the-loop approvals, and verify application integrity through automated checks and cryptographic Setup Receipts.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd vibePilot/frontend
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Typecheck
```bash
npm run build
```

---

## 🧭 Demonstrating VibePilot to Judges

The frontend supports an interactive, end-to-end developer journey:

1. **Preset Scenarios**:
   - In the top navigation bar, use the scenario dropdown to switch between:
     - **DocuPilot AI** *(Next.js + Supabase pgvector + Stripe + NextAuth)*
     - **PromptNotes AI** *(Lovable.dev Vite + OAuth redirect mismatch fix)*
     - **AgentFleet Hub** *(FastAPI + Redis + Claude 3.7 tool use)*
2. **Stage 1: App Map**:
   - Enter or modify an Application URL / GitHub repository.
   - Click **Analyze App** to inspect routes, framework AST, and environment requirements.
   - Inspect the **App Map**: Discovered routes with auth badges, detected integrations (Supabase, Stripe, OpenAI), missing secrets, and prioritized setup checklist.
   - Note the **`DEMO DATA`** indicator when running offline/demo telemetry.
   - Click **Initialize Setup Run**.
3. **Stage 2: Live Run (Execution Trace & Approvals)**:
   - Click **Run Pipeline** or **Execute Next Task**.
   - Watch task progression and stream live execution logs in the right-hand terminal drawer.
   - Notice that sensitive tasks (*Supabase pgvector Migration*) pause automatically with status `Awaiting Approval`.
   - Click **Review Approval Gate** to inspect the command preview (`psql $DATABASE_URL ...`), SQL diff, and risk assessment.
   - Click **Authorize Execution** to approve the migration.
   - For tasks requiring manual intervention (e.g. Stripe Webhook secrets), inspect guided instructions and step-by-step resolution.
4. **Stage 3: Verification**:
   - Review synthetic health probes, JWT minting verification, database read/write handshakes, and webhook latency.
   - Toggle filters (`passed`, `manual_required`, `failed`) and mark manual sign-offs.
   - Click **Generate Setup Receipt**.
5. **Stage 4: Setup Receipt**:
   - View the **VibePilot Certified Setup Receipt** featuring an explicit status stamp (`PASS · READY TO SHIP` or `WARN · ACTION REQUIRED`).
   - Audit the itemized **Configuration Changes Made & Audit Parameters** table.
   - Click **Print / Save as PDF** to generate an audit-grade deployment certificate.
   - Click **Export JSON** to copy machine-readable audit metadata to your clipboard.

---

## 🔌 Backend Integration Contracts

When connecting to a live backend, specify the base URL in `.env.local`:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```
If unset, VibePilot defaults seamlessly to **Verified Demo Telemetry** so that judging and live demos never break.

### Primary API Endpoints:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/analyze` | Ingests `{ appUrl, repoUrl? }`, returns `AppAnalysis` object with routes, integrations, and config gaps. (Fallback: `/api/analyze`) |
| `GET` | `/jobs/{id}/stream` | Server-Sent Events (SSE) streaming live chronological task updates, status changes, and terminal logs. |
| `POST` | `/jobs/{id}/approve` | Submits human authorization decision `{ taskId, approved: boolean }`. (Fallback: `/api/runs/{runId}/tasks/{taskId}/approval`) |
| `GET` | `/jobs/{id}/receipt` | Returns finalized verification checks, config changes, and cryptographic audit signature. (Fallback: `/api/receipts/{receiptId}`) |

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 (Obsidian Slate developer theme)
- **Icons**: Lucide React
- **Typography**: Geist Sans & Geist Mono

