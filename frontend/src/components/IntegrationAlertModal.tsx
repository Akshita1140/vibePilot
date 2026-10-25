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
  Globe,
  Sparkles
} from 'lucide-react';
import { BACKEND_V1_OPEN_ENDS, BackendOpenEnd } from '@/lib/backend-adapter';
import { VibePilotApi, BackendHealthStatus } from '@/lib/api';
import { motion, AnimatePresence } from 'motion/react';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="integration-modal-title"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-3xl bg-white dark:bg-[#0c101d] border border-slate-200 dark:border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/[0.08] flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 id="integration-modal-title" className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
                  Backend v1 Telemetry &amp; Open Ends Audit
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/30">
                  {BACKEND_V1_OPEN_ENDS.length} Identified Open Ends
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Real-time connection status to the backend bridge (http://localhost:8000) and failover workarounds.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close integration modal"
            className="text-slate-400 hover:text-slate-800 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Health Status Card */}
          <div className="rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${health?.isHealthy ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">
                  {health?.isHealthy ? 'FastAPI Backend Online' : isChecking ? 'Pinging cluster...' : 'Backend Unreachable'}
                </span>
                {health?.latencyMs !== undefined && (
                  <span className="text-xs font-mono text-cyan-400">
                    ({health.latencyMs}ms)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Endpoint: {health?.url || 'http://localhost:8000'}
              </p>
            </div>

            <button
              type="button"
              onClick={onToggleDemoMode}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-sm shrink-0 cursor-pointer ${
                isDemoMode
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              Switch to {isDemoMode ? 'Connected Mode' : 'Demo Mode'}
            </button>
          </div>

          {/* Identified Open Ends List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="uppercase tracking-wider font-bold">
                Identified Open Ends &amp; Workarounds
              </span>
              <span>All 4 mitigated</span>
            </div>

            <div className="space-y-3">
              {BACKEND_V1_OPEN_ENDS.map((openEnd) => {
                const isSelected = selectedEnd?.id === openEnd.id;
                return (
                  <div
                    key={openEnd.id}
                    className="rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          {openEnd.severity === 'warning' ? (
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                          ) : (
                            <Info className="w-5 h-5 text-cyan-400" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {openEnd.title}
                            </h4>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400">
                              {openEnd.component}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                              Mitigated
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            <strong className="text-slate-800 dark:text-slate-200">Impact: </strong>
                            {openEnd.impact}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedEnd(isSelected ? null : openEnd)}
                        className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.06] text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shrink-0 cursor-pointer"
                      >
                        {isSelected ? 'Hide Steps' : 'Remedy Steps'}
                      </button>
                    </div>

                    {/* Active Workaround Callout */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.04] flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-bold text-emerald-500 shrink-0 font-mono">
                        Active Workaround:
                      </span>
                      <span>{openEnd.workaround}</span>
                    </div>

                    {/* Expandable Remediation Steps */}
                    {isSelected && (
                      <div className="p-3 rounded-xl bg-[#05070d] border border-white/[0.08] space-y-1.5 animate-in fade-in duration-150">
                        <div className="text-xs font-bold text-white">
                          Steps to resolve:
                        </div>
                        <ol className="list-decimal list-inside space-y-1 text-xs text-slate-400 font-mono">
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
        <div className="p-4 sm:p-5 bg-slate-50/50 dark:bg-[#070b14] border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-mono">
            VibePilot 2.0 · Verified Engine
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:brightness-110 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-violet-500/25 transition-all cursor-pointer"
          >
            Acknowledge &amp; Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
