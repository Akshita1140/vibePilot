'use client';

import React, { useState } from 'react';
import { VerificationCheck } from '@/lib/types';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  Filter, 
  Check, 
  FileText, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Activity, 
  HelpCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

interface VerificationResultsProps {
  checks: VerificationCheck[];
  onProceedToReceipt: () => void;
  targetAppName: string;
}

export const VerificationResults: React.FC<VerificationResultsProps> = ({
  checks,
  onProceedToReceipt,
  targetAppName,
}) => {
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed' | 'manual_required'>('all');
  const [completedManualChecks, setCompletedManualChecks] = useState<Record<string, boolean>>({});

  const filteredChecks = checks.filter((c) => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const passedCount = checks.filter((c) => c.status === 'passed').length;
  const failedCount = checks.filter((c) => c.status === 'failed').length;
  const manualCount = checks.filter((c) => c.status === 'manual_required').length;
  const skippedCount = checks.filter((c) => c.status === 'skipped').length;

  const toggleManualCheck = (id: string) => {
    setCompletedManualChecks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Overview & Control Banner */}
      <div className="rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 backdrop-blur-2xl shadow-xl transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
                Stage 6 of 7: Integrity Verification
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 font-display">
              Synthetic Verification: {targetAppName}
            </h2>
          </div>

          <button
            onClick={onProceedToReceipt}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:brightness-110 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-violet-500/25 transition-all shrink-0 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Stage 7: Generate Setup Receipt</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* UX Helper line */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04] flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>What&apos;s happening:</strong> Synthetic probes tested routes, latency, and auth redirects. <strong>What happens next:</strong> Issue certified, immutable Setup Receipt in Stage 7.
          </span>
        </div>

        {/* 4 Status Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-5">
          <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-3.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
              Total Tests
            </span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">
              {checks.length}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-3.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
              Passed Checks
            </span>
            <div className="text-2xl font-extrabold text-emerald-500 font-mono mt-1">
              {passedCount}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-3.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
              Manual Required
            </span>
            <div className="text-2xl font-extrabold text-amber-500 font-mono mt-1">
              {manualCount}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-3.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
              Untested / Failed
            </span>
            <div className={`text-2xl font-extrabold font-mono mt-1 ${failedCount > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
              {failedCount + skippedCount}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Checks List with Filter Pills and Distinct States */}
      <div className="rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 backdrop-blur-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/[0.06]">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
            Automated Probes &amp; Telemetry Audits
          </span>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', 'passed', 'manual_required', 'failed'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-xl text-xs font-mono uppercase transition-colors cursor-pointer ${
                  filter === f
                    ? 'bg-violet-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Itemized Checks */}
        <div className="space-y-3">
          {filteredChecks.map((check) => {
            const isManualChecked = !!completedManualChecks[check.id];

            return (
              <motion.div
                key={check.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                  check.status === 'passed'
                    ? 'bg-emerald-500/[0.02] border-emerald-500/20'
                    : check.status === 'failed'
                    ? 'bg-rose-500/[0.04] border-rose-500/30'
                    : check.status === 'manual_required'
                    ? 'bg-amber-500/[0.04] border-amber-500/30'
                    : 'bg-slate-500/[0.02] border-slate-500/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Status Icon */}
                    <div className="mt-0.5 shrink-0">
                      {check.status === 'passed' && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      )}
                      {check.status === 'failed' && (
                        <XCircle className="w-5 h-5 text-rose-500" />
                      )}
                      {check.status === 'manual_required' && (
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      )}
                      {check.status === 'skipped' && (
                        <Clock className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {check.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.06]">
                          {check.category}
                        </span>

                        {check.responseTimeMs !== undefined && (
                          <span className="text-[11px] font-mono text-cyan-400">
                            {check.responseTimeMs}ms latency
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-[#05070d] p-2.5 rounded-xl border border-white/[0.06] mt-1.5 overflow-x-auto">
                        {check.evidence}
                      </div>

                      {/* Remediation note if failed */}
                      {check.remedy && (
                        <div className="text-xs text-rose-400 pt-1">
                          <strong>Remedy: </strong> {check.remedy}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Status Badge */}
                  <div className="self-start sm:self-auto shrink-0">
                    {check.status === 'passed' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                        VERIFIED 200 OK
                      </span>
                    )}
                    {check.status === 'failed' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">
                        FAILED
                      </span>
                    )}
                    {check.status === 'manual_required' && (
                      <button
                        type="button"
                        onClick={() => toggleManualCheck(check.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-medium border transition-colors cursor-pointer ${
                          isManualChecked
                            ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-500 border-amber-500/30 hover:bg-amber-500/25'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>{isManualChecked ? 'Operator Signed' : 'Sign Off'}</span>
                      </button>
                    )}
                    {check.status === 'skipped' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">
                        UNTESTED
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
