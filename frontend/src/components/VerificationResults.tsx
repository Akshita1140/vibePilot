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
  FileText
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
      {/* Verification Header and Metrics */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
              <h2 className="text-base font-bold text-white tracking-tight">Step 3: Verification & Integrity Checks</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automated synthetic route probes, database read/writes, and authentication handshakes for <span className="text-slate-200 font-semibold">{targetAppName}</span>.
            </p>
          </div>

          <button
            onClick={onProceedToReceipt}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all shrink-0"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Setup Receipt</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Total Tests</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-white font-mono">{checks.length}</span>
              <span className="text-[10px] text-slate-500">synthetics</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Passing Gates</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-emerald-400 font-mono">{passedCount}</span>
              <span className="text-[10px] text-emerald-500/70 font-mono">
                {Math.round((passedCount / (checks.length || 1)) * 100)}%
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Manual Pending</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-orange-400 font-mono">{manualCount}</span>
              <span className="text-[10px] text-slate-500">needs human sign-off</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Failed Gates</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-xl font-bold font-mono ${failedCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {failedCount}
              </span>
              <span className="text-[10px] text-slate-500">zero regressions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Checks Grid with Filter */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-4 space-y-4">
        {/* Filter bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Filter Results:</span>
          </div>

          <div className="flex items-center gap-1.5">
            {(['all', 'passed', 'manual_required', 'failed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  filter === status
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Check Cards */}
        <div className="space-y-3">
          {filteredChecks.map((check) => {
            const isManuallyChecked = completedManualChecks[check.id];
            return (
              <div
                key={check.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700/80 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start sm:items-center gap-2.5">
                    {check.status === 'passed' && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {check.status === 'failed' && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    {check.status === 'manual_required' && (
                      <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />
                    )}

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-semibold text-white">{check.name}</h4>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-slate-800 text-slate-400 border border-slate-700">
                          {check.category}
                        </span>
                      </div>
                      {check.endpointTested && (
                        <span className="font-mono text-[11px] text-cyan-400/90">{check.endpointTested}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {check.responseTimeMs && (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {check.responseTimeMs}ms
                      </span>
                    )}

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${
                      check.status === 'passed'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                        : check.status === 'failed'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                        : 'bg-orange-950/80 text-orange-300 border-orange-800/60'
                    }`}>
                      {check.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Evidence snippet */}
                <div className="bg-[#070B12] border border-slate-800/90 rounded-lg p-2.5 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  <span className="text-slate-500 select-none mr-2">EVIDENCE:</span>
                  <span>{check.evidence}</span>
                </div>

                {/* Remedy guidance if failed */}
                {check.remedy && (
                  <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/50 text-xs text-rose-300">
                    <span className="font-semibold text-rose-200">Suggested Remedy: </span>
                    {check.remedy}
                  </div>
                )}

                {/* Manual action instructions if required */}
                {check.manualInstructions && check.manualInstructions.length > 0 && (
                  <div className="p-3 rounded-lg bg-orange-950/20 border border-orange-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-orange-300">Manual Verification Steps:</span>
                      <button
                        onClick={() => toggleManualCheck(check.id)}
                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono transition-colors border ${
                          isManuallyChecked
                            ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        {isManuallyChecked ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Marked Verified</span>
                          </>
                        ) : (
                          <span>Sign off manually</span>
                        )}
                      </button>
                    </div>

                    <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
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
