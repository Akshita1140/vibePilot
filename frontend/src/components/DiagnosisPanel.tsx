'use client';

import React, { useState } from 'react';
import { Diagnosis } from '@/lib/types';
import { 
  AlertOctagon, 
  ExternalLink, 
  ArrowRight, 
  Lightbulb, 
  ShieldAlert, 
  Terminal,
  Activity,
  Info,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

interface DiagnosisPanelProps {
  diagnosis?: Diagnosis;
  appName: string;
  isDemoMode: boolean;
  onProceedToPlan: () => void;
  onBackToMap: () => void;
}

export const DiagnosisPanel: React.FC<DiagnosisPanelProps> = ({
  diagnosis,
  appName,
  isDemoMode,
  onProceedToPlan,
  onBackToMap,
}) => {
  const [showStageExplainer, setShowStageExplainer] = useState<boolean>(true);

  if (!diagnosis) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
          <AlertOctagon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Failure Diagnostics Found</h3>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          The intake analysis did not capture runtime exceptions or configuration breakages for <span className="font-semibold text-slate-800 dark:text-slate-200">{appName}</span>. All detected routes passed initial syntax and environment checks.
        </p>
        <button
          onClick={onBackToMap}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          ← Return to App Map
        </button>
      </div>
    );
  }

  const severityColors = {
    critical: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/80',
    high: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/80',
    medium: 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800/80',
    low: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  }[diagnosis.severity];

  return (
    <div className="space-y-6">
      {/* Contextual Explainer Card: Priority 4 */}
      <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-transparent border border-rose-200/80 dark:border-rose-900/50 rounded-2xl p-5 sm:p-6 transition-colors duration-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30 shrink-0 mt-0.5">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Stage 2: Root Cause Diagnosis & Error Identification
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 font-mono font-semibold">
                  Active Stage
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                VibePilot inspects runtime traces, missing environment keys, and synthetic route response payloads to diagnose fatal deployment blockers before you ship.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowStageExplainer(!showStageExplainer)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            aria-label={showStageExplainer ? 'Collapse explanation' : 'Expand explanation'}
          >
            {showStageExplainer ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {showStageExplainer && (
          <div className="mt-4 pt-4 border-t border-rose-200/60 dark:border-rose-900/40 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
            <div className="bg-white/70 dark:bg-slate-950/50 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                1. What this error indicates
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                A critical missing secret, invalid callback URI, or unprovisioned database table preventing application startup.
              </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-950/50 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                2. Why a fix is proposed
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                VibePilot synthesizes the exact configuration delta and commands required so you don&apos;t have to hunt through provider docs.
              </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-950/50 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                3. What happens next
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Review the Change Plan in Stage 3, authorize sensitive execution via the human gate, and let VibePilot verify health.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Diagnosis Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Failure Diagnosis: {appName}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-mono uppercase font-bold border ${severityColors}`}>
                {diagnosis.severity} Severity
              </span>
              {isDemoMode && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30 font-bold">
                  SIMULATED SCENARIO
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Correlated from runtime HTTP response codes, process stdout logs, and static dependency AST inspection.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onBackToMap}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-colors"
            >
              ← App Map
            </button>

            <button
              onClick={onProceedToPlan}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-cyan-600/30 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <span>Inspect Proposed Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Issue Overview Panel */}
        <div className="pt-6 space-y-5">
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <span className="text-xs font-mono text-rose-700 dark:text-rose-400 uppercase tracking-wider block font-bold">
                  Fatal Runtime Failure
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {diagnosis.issueTitle}
                </h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono shrink-0 shadow-sm">
                <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-slate-500 dark:text-slate-400">Diagnostic Confidence:</span>
                <span className="font-bold text-cyan-700 dark:text-cyan-300">{diagnosis.confidenceScore}%</span>
              </div>
            </div>

            {/* Error Message Snippet */}
            <div className="bg-rose-50/90 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-xl p-4 font-mono text-xs sm:text-sm text-rose-900 dark:text-rose-300 space-y-1.5 overflow-x-auto shadow-inner">
              <div className="text-xs text-rose-600 dark:text-slate-400 select-none uppercase tracking-wider font-bold">
                Captured Exception / Error Payload:
              </div>
              <p className="leading-relaxed whitespace-pre-wrap">{diagnosis.errorText}</p>
            </div>

            {/* URL if available */}
            {diagnosis.errorUrl && (
              <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-slate-600 dark:text-slate-400 pt-1">
                <span className="text-slate-500 shrink-0 font-sans">Endpoint Involved:</span>
                <a
                  href={diagnosis.errorUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-700 dark:text-cyan-400 hover:underline flex items-center gap-1.5 truncate max-w-xl font-medium"
                >
                  <span className="truncate">{diagnosis.errorUrl}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            )}
          </div>

          {/* Root Cause & Remediation Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Root Cause */}
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300 uppercase font-mono tracking-wider">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Root-Cause Explanation</span>
              </div>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                {diagnosis.rootCause}
              </p>
            </div>

            {/* Proposed Remediation */}
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-400 uppercase font-mono tracking-wider">
                <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Proposed Remediation</span>
              </div>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                {diagnosis.proposedRemedy}
              </p>
            </div>
          </div>

          {/* Evidence Snippet if present */}
          {diagnosis.evidenceSnippet && (
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-2">
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-500" />
                <span>Verification & Telemetry Evidence</span>
              </div>
              <div className="font-mono text-xs sm:text-sm text-slate-200 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto shadow-inner">
                {diagnosis.evidenceSnippet}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
