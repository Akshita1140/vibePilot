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
  HelpCircle,
  Activity
} from 'lucide-react';

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
  const [showStatusLegend, setShowStatusLegend] = useState<boolean>(true);

  const filteredChecks = checks.filter((c) => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const passedCount = checks.filter((c) => c.status === 'passed').length;
  const failedCount = checks.filter((c) => c.status === 'failed').length;
  const manualCount = checks.filter((c) => c.status === 'manual_required').length;

  const toggleManualCheck = (id: string) => {
    setCompletedManualChecks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Contextual Explainer Banner: Priority 4 */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent border border-emerald-200/80 dark:border-emerald-900/50 rounded-2xl p-5 sm:p-6 transition-colors duration-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Stage 6: Automated Integrity Verification & Synthetic Probing
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 font-mono font-semibold">
                  Pre-Ship Gate
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                VibePilot dispatches real synthetic HTTP requests, validates OAuth redirect handshakes, and verifies database transaction consistency to prove your app is 100% ship-ready.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowStatusLegend(!showStatusLegend)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            aria-label={showStatusLegend ? 'Collapse explanation' : 'Expand explanation'}
          >
            {showStatusLegend ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {showStatusLegend && (
          <div className="mt-4 pt-4 border-t border-emerald-200/60 dark:border-emerald-900/40 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
            <div className="bg-white/70 dark:bg-slate-950/50 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Passed Status
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Endpoint returned 200 OK, latency was within budget, and payloads conformed to schema contracts.
              </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-950/50 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                Manual Action Required
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Requires human operator sign-off (e.g., confirming DNS propagation or granting team console permissions).
              </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-950/50 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                Failed Status & Remediation
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Detected runtime regression or timeout. Inspect evidence and apply the suggested remedy to retry.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Verification Header and Metrics */}
      <div className="bg-white border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-5 sm:p-6 transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Integrity Verification: {targetAppName}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Synthetic route probes, database read/writes, and authentication handshakes verified against active code.
            </p>
          </div>

          <button
            onClick={onProceedToReceipt}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Setup Receipt</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
          <div className="bg-slate-50 border-slate-200 dark:bg-slate-950/60 dark:border-slate-800 rounded-xl p-4">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-bold">Total Tests</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono">{checks.length}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">synthetics</span>
            </div>
          </div>

          <div className="bg-slate-50 border-slate-200 dark:bg-slate-950/60 dark:border-slate-800 rounded-xl p-4">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-bold">Passing Gates</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{passedCount}</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                {Math.round((passedCount / (checks.length || 1)) * 100)}%
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border-slate-200 dark:bg-slate-950/60 dark:border-slate-800 rounded-xl p-4">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-bold">Manual Pending</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400 font-mono">{manualCount}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">requires sign-off</span>
            </div>
          </div>

          <div className="bg-slate-50 border-slate-200 dark:bg-slate-950/60 dark:border-slate-800 rounded-xl p-4">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-bold">Failed Gates</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl sm:text-3xl font-bold font-mono ${failedCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {failedCount}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">regressions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Checks Grid with Filter */}
      <div className="bg-white border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-5 space-y-4 transition-colors">
        {/* Filter bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 dark:text-slate-400" />
            <span className="text-xs sm:text-sm font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">Filter Results:</span>
          </div>

          <div className="flex items-center gap-2">
            {(['all', 'passed', 'manual_required', 'failed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-semibold transition-colors ${
                  filter === status
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 dark:bg-slate-950 dark:text-slate-400 dark:hover:text-slate-200 dark:border-slate-800'
                }`}
              >
                {status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Check Cards */}
        <div className="space-y-4">
          {filteredChecks.map((check) => {
            const isManuallyChecked = completedManualChecks[check.id];
            return (
              <div
                key={check.id}
                className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    {check.status === 'passed' && (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    )}
                    {check.status === 'failed' && (
                      <XCircle className="w-6 h-6 text-rose-500 dark:text-rose-400 shrink-0" />
                    )}
                    {check.status === 'manual_required' && (
                      <AlertTriangle className="w-6 h-6 text-orange-500 dark:text-orange-400 shrink-0" />
                    )}

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{check.name}</h4>
                        <span className="px-2 py-0.5 rounded text-xs font-mono uppercase bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 font-semibold">
                          {check.category}
                        </span>
                      </div>
                      {check.endpointTested && (
                        <span className="font-mono text-xs sm:text-sm text-cyan-700 dark:text-cyan-400 font-medium block mt-0.5">
                          {check.endpointTested}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-auto">
                    {check.responseTimeMs && (
                      <span className="flex items-center gap-1.5 text-xs font-mono text-slate-600 bg-white border border-slate-200 dark:text-slate-300 dark:bg-slate-900 px-2.5 py-1 rounded-md dark:border-slate-800">
                        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        {check.responseTimeMs}ms
                      </span>
                    )}

                    <span className={`px-2.5 py-1 rounded-md text-xs font-mono uppercase font-bold border ${
                      check.status === 'passed'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                        : check.status === 'failed'
                        ? 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
                        : 'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-800'
                    }`}>
                      {check.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Evidence snippet */}
                <div className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3.5 font-mono text-xs sm:text-sm overflow-x-auto shadow-inner">
                  <span className="text-slate-400 select-none mr-2 font-bold">TELEMETRY EVIDENCE:</span>
                  <span className="text-emerald-400">{check.evidence}</span>
                </div>

                {/* Remedy guidance if failed */}
                {check.remedy && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-900 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-200">
                    <span className="font-bold text-rose-950 dark:text-rose-100">Suggested Remedy: </span>
                    {check.remedy}
                  </div>
                )}

                {/* Manual action instructions if required */}
                {check.manualInstructions && check.manualInstructions.length > 0 && (
                  <div className="p-4 rounded-xl bg-orange-50/90 border border-orange-200 dark:bg-orange-950/30 dark:border-orange-900/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-orange-900 dark:text-orange-300">
                        Manual Operator Verification Steps:
                      </span>
                      <button
                        onClick={() => toggleManualCheck(check.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-colors border ${
                          isManuallyChecked
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-700'
                            : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {isManuallyChecked ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Marked Verified</span>
                          </>
                        ) : (
                          <span>Sign off manually</span>
                        )}
                      </button>
                    </div>

                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 list-disc list-inside">
                      {check.manualInstructions.map((instruction, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {instruction}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
