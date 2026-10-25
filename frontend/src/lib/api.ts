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

export interface JobSubscriptionCallbacks {
  onUpdate?: (job: BackendJobResult) => void;
  onEvent?: (event: Record<string, unknown>) => void;
  onError?: (error: Error) => void;
  onTerminal?: (job: BackendJobResult) => void;
}

/**
 * Safe receipt storage helper with defensive validation, schema checking, and quota error handling
 */
export class SafeReceiptStore {
  private static readonly STORAGE_KEY = 'vibepilot_receipts_archive';

  /**
   * Safely load receipts from localStorage with schema validation
   */
  public static loadReceipts(): SetupReceipt[] {
    if (typeof window === 'undefined') {
      return DEMO_PRESETS.map((p) => JSON.parse(JSON.stringify(p.receiptData)));
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return DEMO_PRESETS.map((p) => JSON.parse(JSON.stringify(p.receiptData)));
      }

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        console.warn('[SafeReceiptStore] Malformed receipts in storage (not an array). Reverting to presets.');
        return DEMO_PRESETS.map((p) => JSON.parse(JSON.stringify(p.receiptData)));
      }

      // Filter and validate each receipt object defensively
      const validReceipts = parsed.filter((item): item is SetupReceipt => {
        return Boolean(
          item &&
          typeof item === 'object' &&
          typeof item.receiptId === 'string' &&
          item.receiptId.trim() !== '' &&
          item.targetApp &&
          typeof item.targetApp === 'object' &&
          typeof item.targetApp.name === 'string' &&
          typeof item.status === 'string' &&
          Array.isArray(item.checks)
        );
      });

      if (validReceipts.length === 0) {
        return DEMO_PRESETS.map((p) => JSON.parse(JSON.stringify(p.receiptData)));
      }

      return validReceipts;
    } catch (err) {
      console.warn('[SafeReceiptStore] Failed to read from localStorage:', err);
      return DEMO_PRESETS.map((p) => JSON.parse(JSON.stringify(p.receiptData)));
    }
  }

  /**
   * Safely save or update a receipt in localStorage
   */
  public static saveReceipt(newReceipt: SetupReceipt): SetupReceipt[] {
    if (!newReceipt || !newReceipt.receiptId) {
      console.warn('[SafeReceiptStore] Cannot save invalid receipt missing receiptId.');
      return this.loadReceipts();
    }

    const currentList = this.loadReceipts();
    const existingIndex = currentList.findIndex((r) => r.receiptId === newReceipt.receiptId);
    let updatedList: SetupReceipt[];

    if (existingIndex >= 0) {
      updatedList = [...currentList];
      updatedList[existingIndex] = newReceipt;
    } else {
      updatedList = [newReceipt, ...currentList];
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedList));
      } catch (err) {
        console.warn('[SafeReceiptStore] Failed to persist receipt to localStorage (e.g. storage full):', err);
      }
    }

    return updatedList;
  }

  /**
   * Safely clear receipts archive
   */
  public static clearReceipts(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch (err) {
        console.warn('[SafeReceiptStore] Failed to clear receipts from localStorage:', err);
      }
    }
  }
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
    // Fast & responsive resolution for Demo Mode (Priority 2)
    if (this.isDemoMode) {
      await new Promise((resolve) => setTimeout(resolve, 180));
      const cleanUrl = appUrl.trim().toLowerCase().replace(/\/$/, '');
      const preset = DEMO_PRESETS.find((p) => {
        const pUrl = p.appUrl.toLowerCase().replace(/\/$/, '');
        return pUrl === cleanUrl || p.id.toLowerCase() === cleanUrl || cleanUrl.includes(p.id.toLowerCase());
      }) || DEMO_PRESETS[0];

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

      // Graceful fallback to verified demo telemetry matched to entered URL
      const clean = appUrl.trim().toLowerCase().replace(/\/$/, '');
      const fallbackPreset = DEMO_PRESETS.find((p) => {
        const pUrl = p.appUrl.toLowerCase().replace(/\/$/, '');
        return pUrl === clean || clean.includes(p.id.toLowerCase());
      }) || DEMO_PRESETS[0];

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
   * Helper to fetch current job result from backend
   */
  public static async fetchJobResult(jobId: string): Promise<BackendJobResult | null> {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/jobs/${encodeURIComponent(jobId)}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Resilient subscription to job updates (Priority 1):
   * 1. Attempts Server-Sent Events (SSE) on GET /jobs/:id/stream
   * 2. If SSE disconnects or errors, seamlessly falls back to polling GET /jobs/:id
   * 3. Deduplicates updates and stops polling upon reaching terminal states (DONE, FAILED, GUIDED)
   * 4. Cleans up timers, connections, and abort controllers when unsubscribed or unmounted
   */
  public static subscribeToJobUpdates(
    jobId: string,
    callbacks: JobSubscriptionCallbacks
  ): () => void {
    if (this.isDemoMode || typeof window === 'undefined') {
      return () => {};
    }

    let isSubscribed = true;
    let isTerminal = false;
    let eventSource: EventSource | null = null;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let abortController: AbortController | null = null;
    let lastKey = '';

    const terminalStates = new Set(['DONE', 'FAILED', 'GUIDED']);

    const cleanup = () => {
      isSubscribed = false;
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      if (pollTimer) {
        clearTimeout(pollTimer);
        pollTimer = null;
      }
      if (abortController) {
        abortController.abort();
        abortController = null;
      }
    };

    const handleJobData = (data: BackendJobResult) => {
      if (!isSubscribed || isTerminal) return;

      const currentKey = `${data.status}:${data.updated_at || ''}:${data.pending_gaps?.length || 0}`;
      if (currentKey !== lastKey) {
        lastKey = currentKey;
        try {
          callbacks.onUpdate?.(data);
        } catch (e) {
          console.warn('[VibePilot API] onUpdate callback error:', e);
        }
      }

      if (terminalStates.has(data.status)) {
        isTerminal = true;
        cleanup();
        try {
          callbacks.onTerminal?.(data);
        } catch (e) {
          console.warn('[VibePilot API] onTerminal callback error:', e);
        }
      }
    };

    const startPollingFallback = () => {
      if (!isSubscribed || isTerminal) return;
      if (pollTimer) clearTimeout(pollTimer);

      const poll = async () => {
        if (!isSubscribed || isTerminal) return;

        try {
          abortController = new AbortController();
          const baseUrl = VibePilotApi.getBaseUrl();
          const res = await fetch(`${baseUrl}/jobs/${encodeURIComponent(jobId)}`, {
            signal: abortController.signal,
          });

          if (!res.ok) {
            if (res.status === 404) {
              const err = new Error(`Job '${jobId}' not found.`);
              callbacks.onError?.(err);
              cleanup();
              return;
            }
          } else {
            const data: BackendJobResult = await res.json();
            handleJobData(data);
          }
        } catch (err: unknown) {
          if (err instanceof Error && err.name === 'AbortError') {
            return;
          }
          console.warn('[VibePilot API] Polling fallback request failed:', err);
        }

        if (isSubscribed && !isTerminal) {
          pollTimer = setTimeout(poll, 1200);
        }
      };

      // Poll immediately on fallback
      poll();
    };

    try {
      const baseUrl = this.getBaseUrl();
      const streamUrl = `${baseUrl}/jobs/${encodeURIComponent(jobId)}/stream`;
      eventSource = new EventSource(streamUrl);

      const handleRawMessage = (rawData: string) => {
        if (!isSubscribed || isTerminal) return;
        try {
          const parsed = JSON.parse(rawData);
          callbacks.onEvent?.(parsed);
          if (parsed && typeof parsed === 'object') {
            if (
              parsed.event_type === 'state_change' || 
              parsed.event_type === 'done' || 
              parsed.event_type === 'awaiting_approval' ||
              parsed.event_type === 'result'
            ) {
              VibePilotApi.fetchJobResult(jobId).then((job) => {
                if (job && isSubscribed) handleJobData(job);
              }).catch(() => {});
            }
          }
        } catch {
          // Keep-alive comments or non-JSON message
        }
      };

      eventSource.onmessage = (e) => handleRawMessage(e.data);

      const namedEvents = ['state_change', 'done', 'awaiting_approval', 'result', 'log', 'page_fetched', 'llm_done'];
      namedEvents.forEach((type) => {
        eventSource?.addEventListener(type, ((e: MessageEvent) => {
          handleRawMessage(e.data);
        }) as EventListener);
      });

      eventSource.onerror = () => {
        if (!isSubscribed || isTerminal) return;
        console.warn('[VibePilot API] SSE stream disconnected or errored. Activating resilient polling fallback.');
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        startPollingFallback();
      };
    } catch (err) {
      console.warn('[VibePilot API] EventSource initialization failed, starting polling fallback:', err);
      startPollingFallback();
    }

    return cleanup;
  }

  /**
   * Subscribe to live execution trace updates via Server-Sent Events (SSE)
   * With automatic resilient fallback to polling if SSE drops.
   * Contract: GET /jobs/:id/stream -> fallback to GET /jobs/:id
   */
  public static streamJobUpdates(
    jobId: string,
    onMessage: (event: MessageEvent) => void,
    onError?: (err: Event) => void
  ): () => void {
    return this.subscribeToJobUpdates(jobId, {
      onEvent: (data) => {
        const synthetic = new MessageEvent('message', { data: JSON.stringify(data) });
        onMessage(synthetic);
      },
      onUpdate: (jobResult) => {
        const synthetic = new MessageEvent('message', {
          data: JSON.stringify({
            event_type: 'state_change',
            state: jobResult.status,
            job_id: jobResult.job_id,
            job_result: jobResult,
          }),
        });
        onMessage(synthetic);
      },
      onError: (err) => {
        if (onError) onError(new CustomEvent('error', { detail: err }));
      },
    });
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
