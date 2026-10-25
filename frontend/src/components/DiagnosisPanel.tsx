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
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  FileCode,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  const [showWhyItMatters, setShowWhyItMatters] = useState<boolean>(true);
  const [copiedEvidence, setCopiedEvidence] = useState(false);

  const handleCopyEvidence = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEvidence(true);
    setTimeout(() => setCopiedEvidence(false), 2000);
  };

  if (!diagnosis) {
    return (
      <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 p-8 sm:p-12 text-center space-y-4 shadow-xl backdrop-blur-2xl">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center mx-auto text-slate-400">
          <AlertOctagon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
          No Failure Diagnostics Found
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          The intake analysis did not capture runtime exceptions or configuration breakages for <span className="font-semibold text-slate-800 dark:text-slate-200">{appName}</span>. All detected routes passed initial syntax and environment checks.
        </p>
        <button
          onClick={onBackToMap}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-xs font-semibold transition-all cursor-pointer"
        >
          ← Return to App Map
        </button>
      </div>
    );
  }

  // Severity config with Color + Icon + Text (Accessible, never color-only)
  const severityConfig = {
    critical: {
      badgeClass: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
      icon: ShieldAlert,
      label: 'CRITICAL SEVERITY',
      description: 'Fatal startup blocker. App will fail to boot or crash on user entry.',
    },
    high: {
      badgeClass: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
      icon: AlertTriangle,
      label: 'HIGH RISK',
      description: 'Major integration failure. Key functionality (e.g. OAuth or payments) is broken.',
    },
    medium: {
      badgeClass: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
      icon: AlertOctagon,
      label: 'MEDIUM RISK',
      description: 'Sub-optimal configuration or unoptimized cache setting.',
    },
    low: {
      badgeClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
      icon: CheckCircle2,
      label: 'LOW RISK',
      description: 'Minor lint or non-critical cosmetic warning.',
    },
  }[diagnosis.severity];

  const SeverityIcon = severityConfig.icon;

  return (
    <div className="space-y-6">
      {/* 1. Header & One-line UX Helper Banner */}
      <div className="rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 backdrop-blur-2xl shadow-xl transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
                Stage 2 of 7: Root Cause Diagnostics
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 font-display">
              Failure Diagnosis: {appName}
            </h2>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onBackToMap}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
            >
              ← App Map
            </button>
            <button
              type="button"
              onClick={onProceedToPlan}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:brightness-110 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-violet-500/25 transition-all cursor-pointer"
            >
              <span>Review Change Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* UX CLARITY: One-line helper */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04] flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>What&apos;s happening:</strong> VibePilot parsed runtime traces and missing secrets. <strong>What happens next:</strong> Review the proposed code and config fixes in Stage 3.
          </span>
        </div>
      </div>

      {/* 2. SIGNATURE MOMENT: Staggered Issue Card with Confidence Score */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 backdrop-blur-2xl shadow-xl space-y-6"
      >
        {/* Issue Title + Severity Chip + Confidence Score */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-white/[0.06]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Severity Chip (Icon + Color + Text) */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${severityConfig.badgeClass}`}>
                <SeverityIcon className="w-3.5 h-3.5" />
                <span>{severityConfig.label}</span>
              </span>

              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.06]">
                Component: {diagnosis.affectedComponent}
              </span>

              {/* Synthetic vs Live Indicator */}
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                {isDemoMode ? '[Synthetic Telemetry]' : '[Live AST Probe]'}
              </span>
            </div>

            <h3 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-display mt-2">
              {diagnosis.issueTitle}
            </h3>
          </div>

          {/* AI Confidence Score Gauge */}
          <div className="rounded-2xl p-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] text-right shrink-0">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
              Root Cause Confidence
            </span>
            <div className="flex items-baseline justify-end gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-black font-mono text-cyan-400">
                {Math.round(diagnosis.confidenceScore * 100)}%
              </span>
              <span className="text-[11px] text-slate-400 font-mono">match</span>
            </div>
          </div>
        </div>

        {/* 3. Root Cause Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-rose-500/[0.04] border border-rose-500/20 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-500 uppercase tracking-wider">
              <AlertOctagon className="w-4 h-4" />
              <span>Identified Root Cause</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {diagnosis.rootCause}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-500/[0.04] border border-cyan-500/20 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-cyan-400" />
              <span>Proposed Automated Remedy</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {diagnosis.proposedRemedy}
            </p>
          </div>
        </div>

        {/* 4. SIGNATURE MOMENT: "Why It Matters" Expandable Section */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden bg-slate-50/50 dark:bg-white/[0.02]">
          <button
            type="button"
            onClick={() => setShowWhyItMatters(!showWhyItMatters)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100/60 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Info className="w-4 h-4 text-violet-500 dark:text-cyan-400" />
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Why this failure blocks production deployment
              </span>
            </div>
            {showWhyItMatters ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          <AnimatePresence>
            {showWhyItMatters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2 border-t border-slate-200/60 dark:border-white/[0.04] pt-3"
              >
                <p>
                  Modern AI builders (Bolt, Lovable, v0) generate fast UI components and API route files, but leave third-party identity, database connection strings, and webhook signing secrets empty or misconfigured.
                </p>
                <p>
                  Without VibePilot&apos;s automated diagnosis and fix staging, users encounter silent 500 runtime errors or OAuth redirects pointing to localhost:3000 instead of production origins.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 5. SIGNATURE MOMENT: Evidence Snippet in Developer-Grade Mono Code Block */}
        {diagnosis.evidenceSnippet && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>Captured Exception Trace &amp; Telemetry Evidence</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyEvidence(diagnosis.evidenceSnippet || '')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-[11px] font-mono text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                {copiedEvidence ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedEvidence ? 'Copied' : 'Copy Trace'}</span>
              </button>
            </div>

            <div className="rounded-2xl p-4 bg-[#05070d] border border-white/[0.08] font-mono text-xs overflow-x-auto text-slate-300 leading-relaxed shadow-inner">
              <pre className="whitespace-pre-wrap select-all">
                {diagnosis.evidenceSnippet}
              </pre>
            </div>
          </div>
        )}

        {/* Action Button to Proceed to Plan */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onProceedToPlan}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:brightness-110 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-lg shadow-violet-500/25 transition-all cursor-pointer"
          >
            <span>Stage 3: Review Proposed Change Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
