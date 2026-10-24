'use client';

import React, { useState } from 'react';
import { SetupReceipt } from '@/lib/types';
import { 
  FileCheck2, 
  Printer, 
  Copy, 
  Check, 
  Filter, 
  Trash2, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle,
  Eye,
  Plus,
  Info,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';

interface ReceiptsHistoryProps {
  receipts: SetupReceipt[];
  onViewReceipt: (receipt: SetupReceipt) => void;
  onClearReceipts: () => void;
  onNewAnalysis: () => void;
}

export const ReceiptsHistory: React.FC<ReceiptsHistoryProps> = ({
  receipts,
  onViewReceipt,
  onClearReceipts,
  onNewAnalysis,
}) => {
  const [filter, setFilter] = useState<'all' | 'ready_to_ship' | 'blocked_by_manual_action' | 'verification_failed'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showArchiveExplainer, setShowArchiveExplainer] = useState(true);

  const filteredReceipts = receipts.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const handleCopy = (r: SetupReceipt, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(r, null, 2));
    setCopiedId(r.receiptId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = (r: SetupReceipt, e: React.MouseEvent) => {
    e.stopPropagation();
    onViewReceipt(r);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const passCount = receipts.filter((r) => r.status === 'ready_to_ship').length;
  const warnCount = receipts.filter((r) => r.status === 'blocked_by_manual_action').length;
  const failCount = receipts.filter((r) => r.status === 'verification_failed').length;

  return (
    <div className="space-y-6">
      {/* Contextual Explainer Banner: Priority 4 */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-transparent border border-indigo-200/80 dark:border-indigo-900/50 rounded-2xl p-5 sm:p-6 transition-colors duration-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-700 dark:text-cyan-400 border border-indigo-500/30 shrink-0 mt-0.5">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Receipts Archive & Verification Ledger
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 font-mono font-semibold">
                  Historical Records
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Every completed verification run generates an immutable certificate with an audit signature, pass rates, and configuration deltas stored locally.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowArchiveExplainer(!showArchiveExplainer)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            aria-label={showArchiveExplainer ? 'Collapse explanation' : 'Expand explanation'}
          >
            {showArchiveExplainer ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {showArchiveExplainer && (
          <div className="mt-4 pt-4 border-t border-indigo-200/60 dark:border-indigo-900/40 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
            <div className="bg-white/70 dark:bg-slate-950/50 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Proof of Readiness
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Export cryptographic receipts to show judges, stakeholders, or compliance officers that the app actually works.
              </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-950/50 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                PDF & JSON Export
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Print clean certificates directly or copy machine-readable JSON schemas for your deployment pipeline.
              </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-950/50 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Audit Trail
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Filter between ready-to-ship runs and those blocked by unresolved manual provider steps.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Header & Metrics */}
      <div className="bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-5 sm:p-6 dark:shadow-xl transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <FileCheck2 className="w-6 h-6 text-indigo-600 dark:text-cyan-400" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Setup Receipts History & Audit Archive
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Cryptographically signed deployment certificates generated across verified application runs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {receipts.length > 0 && (
              <button
                onClick={onClearReceipts}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-300 hover:border-rose-300 text-slate-700 hover:text-rose-700 dark:bg-slate-950 dark:hover:bg-rose-950/60 dark:border-slate-800 dark:hover:border-rose-800 dark:text-slate-300 dark:hover:text-rose-300 text-xs sm:text-sm font-semibold transition-colors"
                title="Clear local receipt history"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear History</span>
              </button>
            )}

            <button
              onClick={onNewAnalysis}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <Plus className="w-4 h-4" />
              <span>New Analysis Run</span>
            </button>
          </div>
        </div>

        {/* 4 Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
          <div className="bg-slate-50 border border-slate-200 dark:bg-slate-950/60 dark:border-slate-800 rounded-xl p-4">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest block font-bold">
              Total Receipts
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono mt-1">
              {receipts.length}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 dark:bg-slate-950/60 dark:border-slate-800 rounded-xl p-4">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest block font-bold">
              Ready to Ship
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
              {passCount}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 dark:bg-slate-950/60 dark:border-slate-800 rounded-xl p-4">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest block font-bold">
              Action Required
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1">
              {warnCount}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 dark:bg-slate-950/60 dark:border-slate-800 rounded-xl p-4">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest block font-bold">
              Failures / Blocked
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400 font-mono mt-1">
              {failCount}
            </div>
          </div>
        </div>
      </div>

      {/* Receipts Table & Filters */}
      <div className="bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 rounded-2xl overflow-hidden dark:shadow-xl p-5 space-y-4 transition-colors">
        {/* Filter bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 dark:text-slate-400" />
            <span className="text-xs sm:text-sm font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
              Filter Receipts:
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {(
              [
                { id: 'all', label: 'All Receipts' },
                { id: 'ready_to_ship', label: 'Ready to Ship' },
                { id: 'blocked_by_manual_action', label: 'Action Required' },
                { id: 'verification_failed', label: 'Failed' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-semibold transition-colors ${
                  filter === item.id
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 dark:bg-slate-950 dark:text-slate-400 dark:hover:text-slate-200 dark:border-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {filteredReceipts.length === 0 ? (
          <div className="p-12 text-center space-y-3 font-mono text-xs sm:text-sm text-slate-500">
            <p>No receipts match the selected criteria.</p>
            <button
              onClick={onNewAnalysis}
              className="text-indigo-600 dark:text-cyan-400 hover:underline font-semibold"
            >
              Analyze an application to generate a receipt →
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredReceipts.map((r) => {
              const statusConfig = {
                ready_to_ship: {
                  label: 'PASS · READY TO SHIP',
                  badge: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-500/80',
                  icon: ShieldCheck,
                },
                blocked_by_manual_action: {
                  label: 'WARN · ACTION REQUIRED',
                  badge: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-500/80',
                  icon: AlertTriangle,
                },
                verification_failed: {
                  label: 'FAIL · VERIFICATION FAILED',
                  badge: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-500/80',
                  icon: XCircle,
                },
              }[r.status] || {
                label: r.status,
                badge: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
                icon: ShieldCheck,
              };

              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={r.receiptId}
                  onClick={() => onViewReceipt(r)}
                  className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer group hover:bg-slate-100/80 dark:bg-slate-950/70 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-cyan-300 transition-colors">
                        {r.receiptId}
                      </span>
                      <span className="text-slate-400 dark:text-slate-600">•</span>
                      <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-200">
                        {r.targetApp.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-mono uppercase bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 font-semibold">
                        {r.targetApp.environment}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400 flex-wrap">
                      <span>Commit: {r.targetApp.commitHash || 'main@head'}</span>
                      <span>•</span>
                      <span>{r.summary.passed} / {r.summary.totalChecks} Gates Passed</span>
                      <span>•</span>
                      <span>{new Date(r.generatedAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                    <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase border flex items-center gap-1.5 ${statusConfig.badge}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span>{statusConfig.label}</span>
                    </span>

                    <button
                      onClick={(e) => handleCopy(r, e)}
                      className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                      title="Copy receipt JSON"
                      aria-label="Copy receipt JSON"
                    >
                      {copiedId === r.receiptId ? (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={(e) => handlePrint(r, e)}
                      className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                      title="Print receipt"
                      aria-label="Print receipt"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onViewReceipt(r)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-cyan-600/20 dark:hover:bg-cyan-600/30 dark:text-cyan-300 dark:border-cyan-500/30 text-xs sm:text-sm font-semibold transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
