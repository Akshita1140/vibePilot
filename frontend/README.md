# VibePilot — Frontend

> **“AI Built Your App. VibePilot Gets It Ready to Ship.”**  
> *Developed for the 24-Hour Hackathon at IIIT Delhi.*

VibePilot provides developers and hackathon judges with an end-to-end cockpit to analyze AI-generated projects, orchestrate setup tasks, govern sensitive operations with explicit human-in-the-loop approvals, and verify application integrity through automated checks and cryptographic Setup Receipts.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧭 Demonstrating VibePilot to Judges

The frontend supports an interactive, end-to-end workflow:

1. **Preset Scenarios**:
   - In the top navigation bar, use the preset dropdown to toggle between **DocuPilot AI** *(Next.js + Supabase pgvector + Stripe + NextAuth)* and **AgentFleet Hub** *(FastAPI + Redis + Claude 3.7)*.
2. **Step 1: UNDERSTAND**:
   - Enter or modify an Application URL / GitHub repository.
   - Click **Analyze App** to simulate automated route discovery and AST dependency scanning.
   - Inspect the **App Map**: Discovered routes with auth badges, detected integrations (Supabase, Stripe, OpenAI), missing secrets, and prioritized setup checklist.
   - Click **Initialize Setup Run**.
3. **Step 2: SET UP (Pipeline & Approvals)**:
   - Click **Run Pipeline** or **Execute Next Task**.
   - Watch task progression and stream live execution logs in the right-hand terminal drawer.
   - Notice that task 2 (*Supabase pgvector Migration*) pauses automatically with status `Awaiting Approval`.
   - Click **Review Approval Gate** to inspect the command preview (`psql $DATABASE_URL ...`), SQL diff, and risk assessment.
   - Click **Authorize Execution** to simulate verified approval.
   - Notice task 4 demonstrates how manual configuration requirements (Stripe Webhook secrets) are surfaced without false claims.
4. **Step 3: VERIFY**:
   - Review synthetic health probes, JWT minting verification, database read/write handshakes, and webhook latency.
   - Sign off manual verification steps using the interactive checkbox.
5. **Step 4: SETUP RECEIPT**:
   - View the **VibePilot Certified Setup Receipt**.
   - Click **Print / Save as PDF** to generate a clean, paper/PDF deployment audit certificate.
   - Click **Export JSON** to copy machine-readable audit metadata.

---

## 🔌 Backend Integration Contracts

When integrating a live backend, specify the base URL in `.env.local`:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```
If unset, VibePilot defaults seamlessly to **Verified Demo Telemetry**.

### Proposed API Endpoints:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/analyze` | Ingests `{ appUrl, repoUrl? }`, returns `AppAnalysis` object with routes, integrations, and config gaps. |
| `GET` | `/api/runs/:runId` | Returns current setup pipeline status, tasks, and streaming logs. |
| `POST` | `/api/runs/:runId/tasks/:taskId/approval` | Submits human authorization decision `{ approved: boolean }`. |
| `GET` | `/api/receipts/:receiptId` | Returns finalized verification checks and cryptographic signature. |

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 (Obsidian Slate developer theme)
- **Icons**: Lucide React
- **Typography**: Geist Sans & Geist Mono
