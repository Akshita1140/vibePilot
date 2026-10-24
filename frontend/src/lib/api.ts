import { AppAnalysis, SetupRun, SetupReceipt } from './types';
import { DEMO_PRESETS } from './demo-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isDemo: boolean;
}

export class VibePilotApi {
  private static isDemoMode: boolean = !API_BASE_URL;

  public static setDemoMode(enabled: boolean) {
    this.isDemoMode = enabled;
  }

  public static getIsDemoMode(): boolean {
    return this.isDemoMode;
  }

  public static getBaseUrl(): string {
    return API_BASE_URL;
  }

  /**
   * Analyze an application by URL and optional GitHub repository
   * Proposed contract: POST /api/analyze
   */
  public static async analyzeApp(appUrl: string, repoUrl?: string): Promise<ApiResponse<AppAnalysis>> {
    // If demo mode or no backend configured, resolve with deterministic realistic data
    if (this.isDemoMode || !API_BASE_URL) {
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate realistic analysis latency
      const preset = DEMO_PRESETS.find((p) => p.appUrl.toLowerCase() === appUrl.trim().toLowerCase()) || DEMO_PRESETS[0];
      
      // Clone and adapt with entered URL/repo
      const analysis: AppAnalysis = JSON.parse(JSON.stringify(preset.analysisData));
      analysis.targetApp.url = appUrl.trim();
      if (repoUrl?.trim()) {
        analysis.targetApp.repoUrl = repoUrl.trim();
      }
      return {
        data: analysis,
        error: null,
        isDemo: true,
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appUrl, repoUrl }),
      });

      if (!response.ok) {
        throw new Error(`Backend responded with HTTP ${response.status}: ${response.statusText}`);
      }

      const data: AppAnalysis = await response.json();
      return { data, error: null, isDemo: false };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown network error';
      console.warn(`[VibePilot API] Live analyze failed (${message}). Falling back to Demo Mode.`);
      // Deterministic fallback so the demo never fails
      const fallback = JSON.parse(JSON.stringify(DEMO_PRESETS[0].analysisData));
      fallback.targetApp.url = appUrl;
      return {
        data: fallback,
        error: `Live backend unreachable (${message}). Displaying verified demo telemetry.`,
        isDemo: true,
      };
    }
  }

  /**
   * Fetch current setup run status and tasks
   * Proposed contract: GET /api/runs/:runId
   */
  public static async getSetupRun(runId: string): Promise<ApiResponse<SetupRun>> {
    if (this.isDemoMode || !API_BASE_URL) {
      const preset = DEMO_PRESETS.find((p) => p.setupRunData.runId === runId) || DEMO_PRESETS[0];
      return {
        data: JSON.parse(JSON.stringify(preset.setupRunData)),
        error: null,
        isDemo: true,
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/runs/${encodeURIComponent(runId)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch run: HTTP ${response.status}`);
      }
      const data: SetupRun = await response.json();
      return { data, error: null, isDemo: false };
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
   * Proposed contract: POST /api/runs/:runId/tasks/:taskId/approval
   */
  public static async submitApproval(
    runId: string,
    taskId: string,
    approved: boolean
  ): Promise<ApiResponse<{ taskId: string; approved: boolean; newStatus: string }>> {
    if (this.isDemoMode || !API_BASE_URL) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        data: {
          taskId,
          approved,
          newStatus: approved ? 'running' : 'failed',
        },
        error: null,
        isDemo: true,
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/runs/${encodeURIComponent(runId)}/tasks/${encodeURIComponent(taskId)}/approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });
      if (!response.ok) {
        throw new Error(`Approval submission failed: HTTP ${response.status}`);
      }
      const data = await response.json();
      return { data, error: null, isDemo: false };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error';
      return {
        data: { taskId, approved, newStatus: approved ? 'running' : 'failed' },
        error: `Live approval endpoint error (${message}). Processed in demo session.`,
        isDemo: true,
      };
    }
  }

  /**
   * Fetch the finalized Setup Receipt
   * Proposed contract: GET /api/receipts/:receiptId
   */
  public static async getSetupReceipt(receiptId: string): Promise<ApiResponse<SetupReceipt>> {
    if (this.isDemoMode || !API_BASE_URL) {
      const preset = DEMO_PRESETS.find((p) => p.receiptData.receiptId === receiptId) || DEMO_PRESETS[0];
      return {
        data: JSON.parse(JSON.stringify(preset.receiptData)),
        error: null,
        isDemo: true,
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/receipts/${encodeURIComponent(receiptId)}`);
      if (!response.ok) {
        throw new Error(`Failed to load receipt: HTTP ${response.status}`);
      }
      const data: SetupReceipt = await response.json();
      return { data, error: null, isDemo: false };
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
