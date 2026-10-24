'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  X, 
  Activity, 
  Server, 
  Key, 
  ExternalLink,
  ChevronRight,
  Database,
  Globe
} from 'lucide-react';
import { BACKEND_V1_OPEN_ENDS, BackendOpenEnd } from '@/lib/backend-adapter';
import { VibePilotApi, BackendHealthStatus } from '@/lib/api';

interface IntegrationAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
}

export const IntegrationAlertModal: React.FC<IntegrationAlertModalProps> = ({
  isOpen,
  onClose,
  isDemoMode,
  onToggleDemoMode,
}) => {
  const [health, setHealth] = useState<BackendHealthStatus | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [selectedEnd, setSelectedEnd] = useState<BackendOpenEnd | null>(null);

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    const result = await VibePilotApi.checkBackendHealth();
    setHealth(result);
    setIsChecking(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      checkHealth();
    }
  }, [isOpen, checkHealth]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="integration-modal-title"
    >
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50 dark:bg-slate-950/80">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-700 dark:text-cyan-400 border border-indigo-500/30 shrink-0">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 id="integration-modal-title" className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Backend v1 Integration & Open Ends Audit
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700">
                  {BACKEND_V1_OPEN_ENDS.length} Identified Open Ends
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Real-time status of the FastAPI backend bridge (`http://localhost:8000`) and active failover workarounds.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close integration modal"
            className="text-slate-400 hover:text-slate-800 dark:hover:text-white p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300">
          {/* Live Backend Connection Status Banner */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`w-3 h-3 rounded-full shrink-0 ${
                  health?.isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`} />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  FastAPI Backend Server:
                </span>
                <a
                  href={VibePilotApi.getBaseUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-indigo-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold"
                  title="Open backend root page"
                >
                  {VibePilotApi.getBaseUrl()}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase font-bold border ${
                  health?.isHealthy
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700'
                    : 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700'
                }`}>
                  {health?.isHealthy ? `CONNECTED (HTTP 200 · ${health.latencyMs}ms)` : 'OFFLINE / UNREACHABLE'}
                </span>

                <button
                  type="button"
                  onClick={checkHealth}
                  disabled={isChecking}
                  className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-mono transition-colors flex items-center gap-1.5"
                >
                  <Activity className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>Re-check</span>
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {health?.isHealthy ? (
                <span>
                  🟢 The Next.js frontend is actively paired with Python FastAPI (app.main:app). Live endpoint probes (/health, /api/analyze, /jobs/:id/stream, /jobs/:id/receipt) are operational.
                </span>
              ) : (
                <span>
                  ⚠️ FastAPI backend is not responding on `{VibePilotApi.getBaseUrl()}`. Start it with `python -m uvicorn app.main:app --port 8000`. The frontend will automatically use verified demo telemetry in the meantime.
                </span>
              )}
            </div>

            {/* Quick Link Buttons */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <a
                href={`${VibePilotApi.getBaseUrl()}/docs`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 dark:text-indigo-300 dark:border-indigo-800 text-xs font-mono font-semibold transition-all flex items-center gap-1.5 hover:shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-400" />
                <span>Open Swagger Docs (/docs)</span>
              </a>
              <a
                href={`${VibePilotApi.getBaseUrl()}/health`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:text-slate-300 dark:border-slate-700 text-xs font-mono font-semibold transition-all flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>View Health (/health)</span>
              </a>
            </div>
          </div>

          {/* Mode Switch Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60">
            <div>
              <div className="text-sm font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Execution Mode: {isDemoMode ? 'Demo Telemetry' : 'Live Connected Backend'}</span>
              </div>
              <p className="text-xs text-indigo-900/80 dark:text-indigo-300/80 mt-0.5">
                Toggle between sending HTTP requests to the local backend or using deterministic fixtures for hackathon presentations.
              </p>
            </div>

            <button
              type="button"
              onClick={onToggleDemoMode}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm shrink-0 ${
                isDemoMode
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold'
              }`}
            >
              Switch to {isDemoMode ? 'Connected Mode' : 'Demo Mode'}
            </button>
          </div>

          {/* Identified Open Ends Alert List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                Open Ends & Gaps Left in Backend v1:
              </span>
              <span className="text-xs text-slate-500">
                All 4 gaps have active workarounds in place
              </span>
            </div>

            <div className="space-y-3">
              {BACKEND_V1_OPEN_ENDS.map((openEnd) => {
                const isSelected = selectedEnd?.id === openEnd.id;
                return (
                  <div
                    key={openEnd.id}
                    className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                      openEnd.severity === 'critical'
                        ? 'bg-rose-50/70 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50'
                        : openEnd.severity === 'warning'
                        ? 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50'
                        : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          {openEnd.severity === 'warning' ? (
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          ) : (
                            <Info className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                              {openEnd.title}
                            </h4>
                            <span className="px-2 py-0.5 rounded text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                              {openEnd.component}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-mono uppercase font-bold border ${
                              openEnd.status === 'mitigated'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                                : 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {openEnd.status === 'mitigated' ? 'Mitigated with Workaround' : 'Open End'}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                            <strong className="text-slate-800 dark:text-slate-200">Impact: </strong>
                            {openEnd.impact}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedEnd(isSelected ? null : openEnd)}
                        className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:border-slate-400 transition-colors shrink-0"
                      >
                        {isSelected ? 'Hide Fix Steps' : 'View Fix Steps'}
                      </button>
                    </div>

                    {/* Active Workaround Callout */}
                    <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 shrink-0 font-mono">
                        Active Workaround:
                      </span>
                      <span>{openEnd.workaround}</span>
                    </div>

                    {/* Expandable Remediation Steps */}
                    {isSelected && (
                      <div className="mt-3 p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2 animate-in fade-in duration-150">
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          Steps to resolve this open end:
                        </div>
                        <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 dark:text-slate-300 font-mono">
                          {openEnd.remediationSteps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-mono">
            VibePilot v1.0 • IIIT Delhi Hackathon Edition
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
