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
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

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

  const filteredReceipts = receipts.filter((r) => {
    if (!r) return false;
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

  const passCount = receipts.filter((r) => r?.status === 'ready_to_ship').length;
  const warnCount = receipts.filter((r) => r?.status === 'blocked_by_manual_action').length;
  const failCount = receipts.filter((r) => r?.status === 'verification_failed').length;

  return (
    <div className="space-y-6">
      {/* 1. Header Overview Banner */}
      <div className="rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 backdrop-blur-2xl shadow-xl transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
                Audit Archive & Ledger
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 font-display flex items-center gap-2">
              <FileCheck2 className="w-6 h-6 text-cyan-400" />
              <span>Certified Setup Receipts Archive</span>
            </h2>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {receipts.length > 0 && (
              <button
                type="button"
                onClick={onClearReceipts}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-white/[0.04] dark:hover:bg-rose-950/30 dark:hover:text-rose-400 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-white/[0.06] transition-colors cursor-pointer"
                title="Clear receipts archive cache"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Archive</span>
              </button>
            )}

            <button
              type="button"
              onClick={onNewAnalysis}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:brightness-110 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-violet-500/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Intake Analysis</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-5">
          <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-3.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">Total Certificates</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">
              {receipts.length}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-3.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">Ready to Ship</span>
            <div className="text-2xl font-extrabold text-emerald-500 font-mono mt-1">
              {passCount}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-3.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">Guided Manual</span>
            <div className="text-2xl font-extrabold text-amber-500 font-mono mt-1">
              {warnCount}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-3.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">Failed Runs</span>
            <div className={`text-2xl font-extrabold font-mono mt-1 ${failCount > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
              {failCount}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Receipts List with Filter Pills */}
      <div className="rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 backdrop-blur-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/[0.06]">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
            Archived Manifest Ledger
          </span>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', 'ready_to_ship', 'blocked_by_manual_action', 'verification_failed'] as const).map((f) => (
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
                {f.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Itemized Receipts */}
        {filteredReceipts.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-slate-400">
            No receipts match the selected filter.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReceipts.map((receipt) => {
              const isReady = receipt.status === 'ready_to_ship';
              const isGuided = receipt.status === 'blocked_by_manual_action';

              return (
                <div
                  key={receipt.receiptId}
                  onClick={() => onViewReceipt(receipt)}
                  className="rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100/80 dark:hover:bg-white/[0.04] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {receipt.targetApp.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.06]">
                        {receipt.targetApp.environment}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {receipt.receiptId}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                      <span>{new Date(receipt.generatedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="text-emerald-500 font-semibold">
                        {receipt.summary.passed}/{receipt.summary.totalChecks} Passed
                      </span>
                    </div>
                  </div>

                  {/* Actions & Status Pill */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleCopy(receipt, e)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-400 transition-colors"
                      title="Copy JSON"
                    >
                      {copiedId === receipt.receiptId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handlePrint(receipt, e)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-400 transition-colors"
                      title="Print receipt"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                      isReady
                        ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                        : isGuided
                        ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                    }`}>
                      {isReady ? 'READY TO SHIP' : isGuided ? 'GUIDED' : 'FAILED'}
                    </span>
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
