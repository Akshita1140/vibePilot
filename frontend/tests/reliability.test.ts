import test from 'node:test';
import assert from 'node:assert/strict';
import { SafeReceiptStore, VibePilotApi } from '../src/lib/api';
import { DEMO_PRESETS } from '../src/lib/demo-data';
import { SetupReceipt } from '../src/lib/types';

// In-memory mock localStorage for Node testing environment
class MockLocalStorage {
  private store: Map<string, string> = new Map();
  public shouldThrowOnSet: boolean = false;

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.shouldThrowOnSet) {
      throw new Error('QuotaExceededError: Storage quota reached.');
    }
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

const mockStorage = new MockLocalStorage();
(globalThis as unknown as { window: unknown }).window = globalThis;
(globalThis as unknown as { localStorage: MockLocalStorage }).localStorage = mockStorage;

test('SafeReceiptStore: loads default demo receipts when storage is empty', () => {
  mockStorage.clear();
  const receipts = SafeReceiptStore.loadReceipts();
  assert.equal(receipts.length, DEMO_PRESETS.length);
  assert.equal(receipts[0].receiptId, DEMO_PRESETS[0].receiptData.receiptId);
});

test('SafeReceiptStore: gracefully handles corrupted JSON string without throwing', () => {
  mockStorage.setItem('vibepilot_receipts_archive', '{ malformed json [[[');
  const receipts = SafeReceiptStore.loadReceipts();
  assert.ok(Array.isArray(receipts));
  assert.equal(receipts.length, DEMO_PRESETS.length);
});

test('SafeReceiptStore: rejects non-array stored data and falls back safely', () => {
  mockStorage.setItem('vibepilot_receipts_archive', JSON.stringify({ notAnArray: true }));
  const receipts = SafeReceiptStore.loadReceipts();
  assert.ok(Array.isArray(receipts));
  assert.equal(receipts.length, DEMO_PRESETS.length);
});

test('SafeReceiptStore: filters out corrupted receipt items missing required fields', () => {
  const corruptedItems = [
    { invalid: true },
    null,
    { receiptId: '', targetApp: { name: 'Broken' }, status: 'ready_to_ship' },
    { receiptId: 'VP-REC-VALID-1', targetApp: { name: 'Valid App', environment: 'production' }, status: 'ready_to_ship', checks: [] },
  ];
  mockStorage.setItem('vibepilot_receipts_archive', JSON.stringify(corruptedItems));
  const receipts = SafeReceiptStore.loadReceipts();
  assert.equal(receipts.length, 1);
  assert.equal(receipts[0].receiptId, 'VP-REC-VALID-1');
});

test('SafeReceiptStore: saves new receipt and updates existing receipt in place', () => {
  mockStorage.clear();
  const sampleReceipt: SetupReceipt = {
    receiptId: 'VP-REC-TEST-999',
    runId: 'run-test-999',
    generatedAt: new Date().toISOString(),
    targetApp: {
      name: 'Test Store',
      url: 'https://test-store.vercel.app',
      environment: 'production',
    },
    auditSignature: 'sha256:mock_hash_999',
    status: 'ready_to_ship',
    summary: { totalChecks: 2, passed: 2, failed: 0, manualRequired: 0 },
    checks: [
      {
        id: 'chk-1',
        name: 'Database Ping',
        category: 'database',
        status: 'passed',
        evidence: '[Synthetic Probe] Latency 14ms',
      },
    ],
    unresolvedActionItems: [],
  };

  const savedList = SafeReceiptStore.saveReceipt(sampleReceipt);
  assert.ok(savedList.some((r) => r.receiptId === 'VP-REC-TEST-999'));

  // Update receipt status
  const updatedReceipt: SetupReceipt = {
    ...sampleReceipt,
    status: 'verification_failed',
  };
  const listAfterUpdate = SafeReceiptStore.saveReceipt(updatedReceipt);
  const found = listAfterUpdate.find((r) => r.receiptId === 'VP-REC-TEST-999');
  assert.equal(found?.status, 'verification_failed');
});

test('SafeReceiptStore: handles storage quota errors gracefully', () => {
  mockStorage.shouldThrowOnSet = true;
  const sampleReceipt: SetupReceipt = {
    receiptId: 'VP-REC-QUOTA-TEST',
    runId: 'run-quota',
    generatedAt: new Date().toISOString(),
    targetApp: { name: 'Quota App', url: 'https://quota.app', environment: 'staging' },
    auditSignature: 'sha256:quota',
    status: 'ready_to_ship',
    summary: { totalChecks: 1, passed: 1, failed: 0, manualRequired: 0 },
    checks: [],
    unresolvedActionItems: [],
  };

  // Must not throw despite localStorage setItem throwing
  assert.doesNotThrow(() => {
    SafeReceiptStore.saveReceipt(sampleReceipt);
  });
  mockStorage.shouldThrowOnSet = false;
});

test('Fast Demo Presets: all four presets exist with explicit synthetic indicators', () => {
  assert.equal(DEMO_PRESETS.length, 4);

  const presetIds = DEMO_PRESETS.map((p) => p.id);
  assert.deepEqual(presetIds, [
    'lovable-oauth',
    'docupilot-ai',
    'agentfleet-hub',
    'bolt-storefront',
  ]);

  for (const preset of DEMO_PRESETS) {
    assert.ok(preset.appName.length > 0);
    assert.ok(preset.appUrl.startsWith('http'));
    assert.ok(preset.analysisData.routes.length > 0);
    assert.ok(preset.setupRunData.tasks.length > 0);
    assert.ok(preset.receiptData.checks.length > 0);

    // Verify synthetic evidence is labeled and not disguised as live production
    const checksWithSyntheticEvidence = preset.receiptData.checks.filter(
      (c) => c.evidence.includes('[Synthetic') || c.evidence.includes('[Simulated') || c.evidence.includes('Simulation')
    );
    assert.ok(
      checksWithSyntheticEvidence.length > 0,
      `Preset ${preset.id} must explicitly declare synthetic/simulated evidence`
    );
  }
});

test('Fast Demo Presets: demo analysis resolves promptly under 250ms', async () => {
  VibePilotApi.setDemoMode(true);
  const startTime = Date.now();
  const res = await VibePilotApi.analyzeApp('https://bolt-storefront.vercel.app');
  const duration = Date.now() - startTime;

  assert.equal(res.isDemo, true);
  assert.ok(res.data?.analysis);
  assert.equal(res.data?.analysis.targetApp.name, 'Bolt Storefront AI');
  assert.ok(duration < 250, `Expected demo analysis to complete under 250ms, took ${duration}ms`);
});

test('SSE Resilience: subscribeToJobUpdates falls back to polling when SSE errors and cleans up on terminal', async () => {
  VibePilotApi.setDemoMode(false);

  // Mock global EventSource to simulate immediate connection failure
  class MockFailingEventSource {
    public onerror: (() => void) | null = null;
    public onmessage: ((e: { data: string }) => void) | null = null;
    public closed = false;

    constructor(_url: string) {
      setTimeout(() => {
        if (this.onerror && !this.closed) {
          this.onerror();
        }
      }, 10);
    }

    addEventListener() {}
    close() {
      this.closed = true;
    }
  }

  (globalThis as unknown as { EventSource: unknown }).EventSource = MockFailingEventSource;

  // Mock fetch for polling
  let pollCount = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url: string | URL | Request) => {
    const urlStr = url.toString();
    if (urlStr.includes('/jobs/test-job-resilience')) {
      pollCount++;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          job_id: 'test-job-resilience',
          status: pollCount >= 2 ? 'DONE' : 'EXECUTING',
          updated_at: new Date().toISOString(),
          pending_gaps: [],
        }),
      } as unknown as Response;
    }
    return originalFetch(url);
  };

  let updateCount = 0;
  let terminalReached = false;

  const cleanup = VibePilotApi.subscribeToJobUpdates('test-job-resilience', {
    onUpdate: () => {
      updateCount++;
    },
    onTerminal: (job) => {
      terminalReached = true;
      assert.equal(job.status, 'DONE');
    },
  });

  // Wait for polling fallback to trigger and reach terminal DONE
  await new Promise((r) => setTimeout(r, 1600));

  assert.ok(pollCount >= 1, 'Expected polling fallback to execute when SSE errored');
  assert.ok(terminalReached, 'Expected onTerminal to be triggered when job status became DONE');
  assert.ok(updateCount >= 1, 'Expected onUpdate to receive updates');

  cleanup();
  globalThis.fetch = originalFetch;
});
