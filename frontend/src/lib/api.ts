import { AppAnalysis, SetupRun, SetupReceipt } from './types';
import { DEMO_PRESETS } from './demo-data';
import { 
  adaptBackendAppMapToAnalysis, 
  adaptBackendJobToSetupRun, 
  adaptBackendReceiptToFrontend,
  BackendJobSummary,
  BackendJobResult,
  BackendJobReceipt
} from './backend-adapter';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isDemo: boolean;
}

export interface BackendHealthStatus {
  isHealthy: boolean;
  service: string;
  latencyMs: number;
  url: string;
  error?: string;
}

export class VibePilotApi {
  private static isDemoMode: boolean = false;

  public static setDemoMode(enabled: boolean) {
    this.isDemoMode = enabled;
  }

  public static getIsDemoMode(): boolean {
    return this.isDemoMode;
  }

  public static getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vibepilot_api_url');
      if (stored && stored.trim()) return stored.trim().replace(/\/$/, '');
    }
    return (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
  }

  /**
   * Check Backend Health and probe GET /health endpoint
   */
  public static async checkBackendHealth(): Promise<BackendHealthStatus> {
    const baseUrl = this.getBaseUrl();
    const startTime = Date.now();
    try {
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      }).catch(() => fetch(`${baseUrl}/api/health`));

      const latencyMs = Date.now() - startTime;
      if (response && response.ok) {
        const body = await response.json().catch(() => ({}));
        return {
          isHealthy: true,
          service: body.service || 'vibepilot-backend',
          latencyMs,
          url: baseUrl,
        };
      }
      return {
        isHealthy: false,
        service: 'offline',
        latencyMs,
        url: baseUrl,
        error: `HTTP ${response?.status || 500} response from backend`,
      };
    } catch (err: unknown) {
      const latencyMs = Date.now() - startTime;
      const message = err instanceof Error ? err.message : 'Connection refused';
      return {
        isHealthy: false,
        service: 'offline',
        latencyMs,
        url: baseUrl,
        error: message,
      };
    }
  }

  /**
   * Analyze an application by URL and optional GitHub repository
   * Connects to FastAPI: POST /api/analyze -> 202 Accepted -> Polls /jobs/{job_id}
   */
  public static async analyzeApp(
    appUrl: string, 
    repoUrl?: string
  ): Promise<ApiResponse<{ analysis: AppAnalysis; setupRun?: SetupRun }>> {
    // If user explicitly chose demo mode, resolve with preset
    if (this.isDemoMode) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const preset = DEMO_PRESETS.find((p) => p.appUrl.toLowerCase() === appUrl.trim().toLowerCase()) || DEMO_PRESETS[0];
      const analysis: AppAnalysis = JSON.parse(JSON.stringify(preset.analysisData));
      analysis.targetApp.url = appUrl.trim();
      if (repoUrl?.trim()) {
        analysis.targetApp.repoUrl = repoUrl.trim();
      }
      return {
        data: {
          analysis,
          setupRun: JSON.parse(JSON.stringify(preset.setupRunData)),
        },
        error: null,
        isDemo: true,
      };
    }

    const baseUrl = this.getBaseUrl();

    try {
      // 1. Submit analysis request to FastAPI backend (POST /api/analyze)
      const postUrl = `${baseUrl}/api/analyze`;
      const response = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_url: appUrl.trim(),
          description: repoUrl?.trim() ? `GitHub Repo: ${repoUrl.trim()}` : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend responded with HTTP ${response.status}: ${response.statusText}`);
      }

      // 2. Read JobSummary (HTTP 202)
      const jobSummary: BackendJobSummary = await response.json();
      const jobId = jobSummary.job_id;

      // 3. Poll /jobs/{job_id} until the backend finishes initial analysis or reaches approval gate
      let jobResult: BackendJobResult | null = null;
      const maxAttempts = 12;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise((r) => setTimeout(r, 650));
        const pollRes = await fetch(`${baseUrl}/jobs/${encodeURIComponent(jobId)}`);
        if (pollRes.ok) {
          const resData: BackendJobResult = await pollRes.json();
          jobResult = resData;

          // If job has progressed to AWAITING_APPROVAL, DONE, or GUIDED, we can build the AppMap!
          if (
            resData.status === 'AWAITING_APPROVAL' ||
            resData.status === 'DONE' ||
            resData.status === 'GUIDED' ||
            resData.app_map
          ) {
            break;
          }
        }
      }

      if (!jobResult) {
        throw new Error(`Job '${jobId}' timed out during pipeline processing.`);
      }

      // 4. Transform Backend response to Frontend Unified Models
      const analysis = adaptBackendAppMapToAnalysis(jobResult, repoUrl);
      const setupRun = adaptBackendJobToSetupRun(jobResult);

      return {
        data: { analysis, setupRun },
        error: null,
        isDemo: false,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown network error';
      console.warn(`[VibePilot API] Live backend call failed (${message}). Falling back to Demo Mode.`);

      // Graceful fallback to verified demo telemetry so presentation flows smoothly
      const fallbackPreset = DEMO_PRESETS[0];
      const fallbackAnalysis = JSON.parse(JSON.stringify(fallbackPreset.analysisData));
      fallbackAnalysis.targetApp.url = appUrl;
      if (repoUrl) fallbackAnalysis.targetApp.repoUrl = repoUrl;

      return {
        data: {
          analysis: fallbackAnalysis,
          setupRun: JSON.parse(JSON.stringify(fallbackPreset.setupRunData)),
        },
        error: `Live Backend: ${message}. Active Demo Telemetry fallback loaded.`,
        isDemo: true,
      };
    }
  }

  /**
   * Subscribe to live execution trace updates via Server-Sent Events (SSE)
   * Contract: GET /jobs/:id/stream
   */
  public static streamJobUpdates(
    jobId: string,
    onMessage: (event: MessageEvent) => void,
    onError?: (err: Event) => void
  ): () => void {
    if (this.isDemoMode || typeof window === 'undefined') {
      return () => {};
    }

    try {
      const baseUrl = this.getBaseUrl();
      const streamUrl = `${baseUrl}/jobs/${encodeURIComponent(jobId)}/stream`;
      const eventSource = new EventSource(streamUrl);

      eventSource.onmessage = onMessage;
      if (onError) {
        eventSource.onerror = onError;
      }

      return () => {
        eventSource.close();
      };
    } catch (err) {
      console.warn('[VibePilot API] Failed to initialize SSE stream:', err);
      return () => {};
    }
  }

  /**
   * Fetch current setup run status and tasks
   * Contract: GET /jobs/:id
   */
  public static async getSetupRun(jobId: string): Promise<ApiResponse<SetupRun>> {
    if (this.isDemoMode) {
      const preset = DEMO_PRESETS.find((p) => p.setupRunData.runId === jobId) || DEMO_PRESETS[0];
      return {
        data: JSON.parse(JSON.stringify(preset.setupRunData)),
        error: null,
        isDemo: true,
      };
    }

    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/jobs/${encodeURIComponent(jobId)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch run: HTTP ${response.status}`);
      }
      const data: BackendJobResult = await response.json();
      return { data: adaptBackendJobToSetupRun(data), error: null, isDemo: false };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error';
      return {
        data: JSON.parse(JSON.stringify(DEMO_PRESETS[0].setupRunData)),
        error: `Backend unreachable (${message}). Using demo setup pipeline.`,
        isDemo: true,
      };
    }
  }

  /**
   * Submit an explicit approval for sensitive actions
   * Contract: POST /jobs/:id/approve
   */
  public static async submitApproval(
    jobId: string,
    gapId: string,
    approved: boolean
  ): Promise<ApiResponse<{ approvedCount: number; message: string }>> {
    if (this.isDemoMode) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        data: {
          approvedCount: approved ? 1 : 0,
          message: approved ? 'Step authorized via Demo Mode.' : 'Step rejected.',
        },
        error: null,
        isDemo: true,
      };
    }

    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/jobs/${encodeURIComponent(jobId)}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved_gap_ids: approved ? [gapId] : [],
          rejected_gap_ids: approved ? [] : [gapId],
          reject_all: !approved && !gapId,
          notes: approved ? 'Authorized by human operator in VibePilot 2.0' : 'Rejected by human operator',
        }),
      });

      if (!response.ok) {
        throw new Error(`Approval submission failed: HTTP ${response.status}`);
      }
      const data = await response.json();
      return { 
        data: { approvedCount: data.approved_count || 1, message: data.message || 'Approved' }, 
        error: null, 
        isDemo: false 
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error';
      return {
        data: { approvedCount: approved ? 1 : 0, message: 'Processed via local fallback' },
        error: `Live approval error (${message}). Processed in demo session.`,
        isDemo: true,
      };
    }
  }

  /**
   * Fetch the finalized Setup Receipt
   * Contract: GET /jobs/:id/receipt
   */
  public static async getSetupReceipt(jobId: string): Promise<ApiResponse<SetupReceipt>> {
    if (this.isDemoMode) {
      const preset = DEMO_PRESETS.find((p) => p.receiptData.runId === jobId || p.receiptData.receiptId === jobId) || DEMO_PRESETS[0];
      return {
        data: JSON.parse(JSON.stringify(preset.receiptData)),
        error: null,
        isDemo: true,
      };
    }

    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/jobs/${encodeURIComponent(jobId)}/receipt`);
      if (!response.ok) {
        throw new Error(`Failed to load receipt: HTTP ${response.status}`);
      }
      const data: BackendJobReceipt = await response.json();
      return { data: adaptBackendReceiptToFrontend(data), error: null, isDemo: false };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error';
      return {
        data: JSON.parse(JSON.stringify(DEMO_PRESETS[0].receiptData)),
        error: `Live backend error (${message}). Loaded demo verification receipt.`,
        isDemo: true,
      };
    }
  }
}
