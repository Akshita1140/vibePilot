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
  QrCode,
  FileCheck,
  Info,
  ChevronDown,
  ChevronUp,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface SetupReceiptProps {
  receipt: SetupReceiptType;
  onBackToOverview: () => void;
}

export const SetupReceipt: React.FC<SetupReceiptProps> = ({
  receipt,
  onBackToOverview,
}) => {
  const [copied, setCopied] = useState(false);
  const [showExplainer, setShowExplainer] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(receipt, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-5 sm:p-6 transition-colors duration-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Setup Receipt & Deployment Manifest</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            Audit-grade verification certificate generated for hackathon judging, security review, and production handoff.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold dark:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied JSON' : 'Export JSON'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Contextual Explainer Banner: Priority 4 (hidden on print) */}
      <div className="no-print bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-transparent border border-indigo-200/80 dark:border-indigo-900/50 rounded-2xl p-5 sm:p-6 transition-colors duration-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 shrink-0 mt-0.5">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Stage 7: Setup Receipt Breakdown & Verification Audit
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 font-mono font-semibold">
                  Final Output
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                The Setup Receipt serves as your immutable audit proof. It documents exactly what was changed, which checks were verified, and which manual operator steps remain.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowExplainer(!showExplainer)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            aria-label={showExplainer ? 'Collapse explanation' : 'Expand explanation'}
          >
            {showExplainer ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {showExplainer && (
          <div className="mt-4 pt-4 border-t border-indigo-200/60 dark:border-indigo-900/40 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
            <div className="bg-white/70 dark:bg-slate-950/50 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                1. What Changed
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Injected secrets, rotated tokens, schema migrations, and webhook subscriptions.
              </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-950/50 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                2. What Was Verified
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Active route latency, HTTP 200 OK responses, OAuth redirect validity, and database connectivity.
              </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-950/50 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                3. Outstanding Steps
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Identifies remaining manual steps (e.g., DNS propagation or billing activation) for human completion.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Printable Certificate / Receipt Container */}
      <div className="receipt-card max-w-4xl mx-auto bg-white border border-slate-200 shadow-xl dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 sm:p-10 dark:shadow-2xl relative overflow-hidden transition-colors">
        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold">
                  VIBEPILOT CERTIFIED RECEIPT
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Ship Readiness Manifest
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2.5 max-w-lg leading-relaxed">
              This manifest certifies that the application structure, dependencies, runtime configuration, and synthetic endpoints were audited.
            </p>
          </div>

          {/* Receipt Status Stamp */}
          <div className="flex flex-col items-start sm:items-end gap-2">
            <div className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold tracking-wider uppercase border flex items-center gap-2 ${
              receipt.status === 'ready_to_ship'
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-500/80'
                : receipt.status === 'blocked_by_manual_action'
                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-500/80'
                : 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-500/80'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${
                receipt.status === 'ready_to_ship'
                  ? 'bg-emerald-500 dark:bg-emerald-400'
                  : receipt.status === 'blocked_by_manual_action'
                  ? 'bg-amber-500 dark:bg-amber-400'
                  : 'bg-rose-500 dark:bg-rose-400'
              }`} />
              <span>
                {receipt.status === 'ready_to_ship'
                  ? 'PASS · READY TO SHIP'
                  : receipt.status === 'blocked_by_manual_action'
                  ? 'WARN · ACTION REQUIRED'
                  : 'FAIL · VERIFICATION FAILED'}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Receipt ID: <span className="text-slate-900 dark:text-white font-semibold">{receipt.receiptId}</span>
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Generated: {new Date(receipt.generatedAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Target Application & Environmental Telemetry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-b border-slate-200 dark:border-slate-800 text-xs sm:text-sm">
          <div>
            <span className="font-mono text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider font-bold">Target App</span>
            <div className="font-bold text-slate-900 dark:text-white mt-1 text-base">{receipt.targetApp.name}</div>
            <a 
              href={receipt.targetApp.url} 
              target="_blank" 
              rel="noreferrer" 
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-mono text-xs mt-1"
            >
              <span className="truncate max-w-[160px]">{receipt.targetApp.url}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            </a>
          </div>

          <div>
            <span className="font-mono text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider font-bold">Repository & Commit</span>
            <div className="font-mono text-slate-800 dark:text-slate-200 mt-1">
              Commit: <span className="text-cyan-600 dark:text-cyan-400 font-bold">{receipt.targetApp.commitHash || 'main@head'}</span>
            </div>
            {receipt.targetApp.repoUrl && (
              <span className="text-slate-500 dark:text-slate-400 text-xs truncate block mt-0.5">
                {receipt.targetApp.repoUrl.replace('https://github.com/', '')}
              </span>
            )}
          </div>

          <div>
            <span className="font-mono text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider font-bold">Environment Tier</span>
            <div className="mt-1">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono uppercase bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 font-bold">
                {receipt.targetApp.environment}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono">Run: {receipt.runId}</div>
          </div>

          <div>
            <span className="font-mono text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider font-bold">Audit Pass Rate</span>
            <div className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-lg mt-1">
              {receipt.summary.passed} / {receipt.summary.totalChecks} Gates Passed
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              {receipt.summary.manualRequired} Manual sign-offs pending
            </div>
          </div>
        </div>

        {/* Itemized Verification Matrix */}
        <div className="py-6 border-b border-slate-200 dark:border-slate-800 space-y-3.5">
          <h3 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold">
            Itemized Audit Verifications
          </h3>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800 bg-slate-50 dark:bg-slate-950/60">
            {receipt.checks.map((check) => (
              <div key={check.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{check.name}</span>
                    <span className="font-mono text-xs uppercase text-slate-500">[{check.category}]</span>
                  </div>
                  <div className="font-mono text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                    <span className="text-emerald-800 bg-emerald-100 border border-emerald-300 dark:text-emerald-300 dark:bg-emerald-950/80 px-1.5 py-0.2 rounded text-xs font-bold dark:border-emerald-800">
                      EVIDENCE
                    </span>
                    <span className="break-all">{check.evidence}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  {check.responseTimeMs && (
                    <span className="font-mono text-xs text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                      {check.responseTimeMs}ms
                    </span>
                  )}
                  <span className={`px-2.5 py-1 rounded-md text-xs font-mono uppercase font-bold border ${
                    check.status === 'passed'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                      : check.status === 'manual_required'
                      ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800'
                      : 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
                  }`}>
                    {check.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Changes Made */}
        {receipt.configChanges && receipt.configChanges.length > 0 && (
          <div className="py-6 border-b border-slate-200 dark:border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold">
                Configuration Changes Made & Audit Parameters
              </h3>
              <span className="text-xs font-mono text-slate-500">
                {receipt.configChanges.length} parameters managed
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800 bg-slate-50 dark:bg-slate-950/60">
              {receipt.configChanges.map((cfg, idx) => (
                <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{cfg.key}</span>
                      <span className="font-mono text-xs text-slate-500">({cfg.scope})</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{cfg.description}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-md text-xs font-mono uppercase font-bold border self-start sm:self-auto shrink-0 ${
                    cfg.action === 'injected'
                      ? 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800'
                      : cfg.action === 'migrated'
                      ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800'
                      : cfg.action === 'verified'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800'
                  }`}>
                    {cfg.action.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unresolved Manual Action Items if present */}
        {receipt.unresolvedActionItems.length > 0 && (
          <div className="py-6 border-b border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Outstanding Manual Items Prior to Public Release</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-800 bg-amber-50 border border-amber-200 dark:text-slate-200 dark:bg-amber-950/30 dark:border-amber-900/50 rounded-2xl p-4 sm:p-5">
              {receipt.unresolvedActionItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cryptographic Signature Footer */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <QrCode className="w-9 h-9 text-slate-400 dark:text-slate-500 shrink-0" />
            <div className="space-y-0.5">
              <span className="text-xs text-slate-500 uppercase tracking-widest block font-bold">Cryptographic Audit Signature</span>
              <span className="text-xs text-slate-700 dark:text-slate-300 break-all">{receipt.auditSignature}</span>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-500">
            <span className="font-bold text-slate-700 dark:text-slate-300">Verified by VibePilot 2.0 Engine</span>
            <div className="text-slate-500">IIIT Delhi Hackathon Edition</div>
          </div>
        </div>
      </div>

      {/* Return to Overview Button (hidden on print) */}
      <div className="no-print flex justify-center pt-2">
        <button
          onClick={onBackToOverview}
          className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 underline decoration-slate-400 dark:decoration-slate-600 transition-colors"
        >
          ← Return to App Map & Pipeline Overview
        </button>
      </div>
    </div>
  );
};
