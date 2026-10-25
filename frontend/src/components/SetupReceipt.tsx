'use client';

import React, { useState } from 'react';
import { SetupReceipt as SetupReceiptType } from '@/lib/types';
import { 
  Printer, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink, 
  Download, 
  FileCheck2, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Lock,
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';

interface SetupReceiptProps {
  receipt: SetupReceiptType;
  onBackToOverview: () => void;
}

export const SetupReceipt: React.FC<SetupReceiptProps> = ({
  receipt,
  onBackToOverview,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(receipt, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(receipt, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vibepilot-receipt-${receipt.receiptId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const isReadyToShip = receipt.status === 'ready_to_ship';
  const isGuided = receipt.status === 'blocked_by_manual_action';
  const isFailed = receipt.status === 'verification_failed';

  return (
    <div className="space-y-6">
      {/* 1. Top Action Toolbar (Hidden in print) */}
      <div className="no-print rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 backdrop-blur-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
              Stage 7 of 7: Immutable Deployment Manifest
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 font-display flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-cyan-400" />
            <span>Setup Receipt &amp; Proof of Readiness</span>
          </h2>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={onBackToOverview}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-white/[0.06] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cockpit</span>
          </button>

          <button
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-mono border border-slate-200 dark:border-white/[0.06] transition-colors cursor-pointer"
            title="Copy audit JSON to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-mono border border-slate-200 dark:border-white/[0.06] transition-colors cursor-pointer"
            title="Download audit JSON file"
          >
            {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
            <span>Export</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:brightness-110 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-violet-500/25 transition-all cursor-pointer"
            title="Print clean 1-page report or save as PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* 2. SIGNATURE MOMENT: Slide-Down Printable Receipt Card with Animated Stamp */}
      <motion.div 
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="receipt-card max-w-4xl mx-auto rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-white/[0.1] bg-white dark:bg-[#0c101d] shadow-2xl relative overflow-hidden transition-colors"
      >
        {/* Certificate Header Row with Status Stamp */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/[0.08] relative">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-violet-500/25">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-violet-600 dark:text-cyan-400 font-bold block">
                  VIBEPILOT CERTIFIED AUDIT
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-display">
                  Ship Readiness Manifest
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
              This cryptographic manifest certifies that the application architecture, dependencies, runtime configuration, and synthetic integrity checks were audited before ship.
            </p>
          </div>

          {/* SIGNATURE MOMENT: Subtle Stamp Animation for DONE / GUIDED / FAILED */}
          <motion.div 
            initial={{ scale: 1.8, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: -4 }}
            transition={{ delay: 0.25, type: 'spring', damping: 14 }}
            className={`px-4 py-2.5 rounded-2xl border-2 text-center select-none shadow-md shrink-0 ${
              isReadyToShip
                ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10'
                : isGuided
                ? 'border-amber-500 text-amber-500 bg-amber-500/10'
                : 'border-rose-500 text-rose-500 bg-rose-500/10'
            }`}
          >
            <div className="text-[10px] font-mono tracking-widest uppercase font-bold">
              {isReadyToShip ? 'AUDIT VERIFIED' : isGuided ? 'OPERATOR GUIDED' : 'AUDIT FAILED'}
            </div>
            <div className="text-sm font-black font-mono tracking-wider mt-0.5">
              {isReadyToShip ? 'READY TO SHIP' : isGuided ? 'MANUAL REVIEW' : 'BLOCKING ERROR'}
            </div>
          </motion.div>
        </div>

        {/* Target App & Run Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-200 dark:border-white/[0.08] text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Target Application</span>
            <div className="font-bold text-slate-900 dark:text-white mt-1 text-sm font-sans">{receipt.targetApp.name}</div>
            <a 
              href={receipt.targetApp.url} 
              target="_blank" 
              rel="noreferrer" 
              className="text-violet-600 dark:text-cyan-400 hover:underline flex items-center gap-1 text-[11px] mt-0.5 truncate"
            >
              <span className="truncate">{receipt.targetApp.url}</span>
              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
            </a>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Repository &amp; Commit</span>
            <div className="text-slate-800 dark:text-slate-200 mt-1 font-bold">
              {receipt.targetApp.commitHash || 'main@head'}
            </div>
            {receipt.targetApp.repoUrl && (
              <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                {receipt.targetApp.repoUrl.replace('https://github.com/', '')}
              </span>
            )}
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Environment Tier</span>
            <div className="mt-1">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 dark:bg-white/[0.04] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08]">
                {receipt.targetApp.environment}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Run: {receipt.runId}</div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Integrity Score</span>
            <div className="text-emerald-500 font-bold text-base mt-1">
              {receipt.summary.passed} / {receipt.summary.totalChecks} Passed
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {receipt.summary.manualRequired} Manual sign-offs
            </div>
          </div>
        </div>

        {/* Itemized Audit Checks Matrix */}
        <div className="py-6 border-b border-slate-200 dark:border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="uppercase tracking-wider font-bold">Verified Audit Checks</span>
            <span>{receipt.checks.length} checkpoints</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/[0.06] border border-slate-200 dark:border-white/[0.08] rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-white/[0.02]">
            {receipt.checks.map((check) => (
              <div key={check.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{check.name}</span>
                    <span className="font-mono text-[10px] uppercase text-slate-400">[{check.category}]</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20">
                      EVIDENCE
                    </span>
                    <span className="break-all">{check.evidence}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto font-mono text-xs">
                  {check.responseTimeMs && (
                    <span className="text-slate-400 bg-white dark:bg-white/[0.04] px-2 py-0.5 rounded border border-slate-200 dark:border-white/[0.06]">
                      {check.responseTimeMs}ms
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                    check.status === 'passed'
                      ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                      : check.status === 'manual_required'
                      ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                  }`}>
                    {check.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Changes Record */}
        {receipt.configChanges && receipt.configChanges.length > 0 && (
          <div className="py-6 border-b border-slate-200 dark:border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="uppercase tracking-wider font-bold">Configuration Changes Made</span>
              <span>{receipt.configChanges.length} parameters</span>
            </div>

            <div className="border border-slate-200 dark:border-white/[0.08] rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02]">
              {receipt.configChanges.map((cfg, i) => (
                <div key={i} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{cfg.key}</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{cfg.description}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 self-start sm:self-auto">
                    {cfg.action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unresolved Manual Action Items */}
        {receipt.unresolvedActionItems && receipt.unresolvedActionItems.length > 0 && (
          <div className="py-6 border-b border-slate-200 dark:border-white/[0.08] space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-500 font-bold block">
              Remaining Human Operator Steps
            </span>
            <div className="space-y-2">
              {receipt.unresolvedActionItems.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-amber-500/[0.05] border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cryptographic Manifest Audit Signature Footer */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-500">Cryptographic Signature</span>
            <span className="text-slate-600 dark:text-slate-300 font-mono text-[11px] break-all select-all">
              {receipt.auditSignature}
            </span>
          </div>

          <div className="text-right sm:self-end text-[11px]">
            <span>VibePilot v2.0 · Verified Engine</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
