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
  FileCheck
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

  const handlePrint = () => {
    window.print();
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(receipt, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isReadyToShip = receipt.status === 'ready_to_ship';

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-400" />
            <span>Setup Receipt & Deployment Manifest</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit-grade verification certificate generated for hackathon review and production handoff.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied JSON' : 'Export JSON'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/30 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* The Printable Certificate / Receipt Container */}
      <div className="receipt-card max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle background security pattern */}
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-indigo-400 font-bold">
                  VIBEPILOT CERTIFIED RECEIPT
                </span>
                <h1 className="text-2xl font-black text-white tracking-tight">Ship Readiness Manifest</h1>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2 max-w-md">
              This manifest certifies that the AI-generated application structure, dependencies, configuration parameters, and synthetic endpoints were audited.
            </p>
          </div>

          {/* Receipt Status Stamp */}
          <div className="flex flex-col items-start sm:items-end gap-1.5">
            <div className={`px-3 py-1 rounded-md text-xs font-mono font-bold tracking-wider uppercase border ${
              isReadyToShip
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/80'
                : 'bg-amber-950/80 text-amber-300 border-amber-500/80'
            }`}>
              {isReadyToShip ? 'STATUS: READY TO SHIP' : 'STATUS: ACTION REQUIRED'}
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Receipt ID: <span className="text-white font-semibold">{receipt.receiptId}</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Generated: {new Date(receipt.generatedAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Target Application & Environmental Telemetry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-b border-slate-800 text-xs">
          <div>
            <span className="font-mono text-[10px] uppercase text-slate-400 tracking-wider">Application</span>
            <div className="font-semibold text-white mt-1 text-sm">{receipt.targetApp.name}</div>
            <a 
              href={receipt.targetApp.url} 
              target="_blank" 
              rel="noreferrer" 
              className="text-indigo-400 hover:underline flex items-center gap-1 font-mono text-[11px] mt-0.5"
            >
              <span className="truncate max-w-[160px]">{receipt.targetApp.url}</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase text-slate-400 tracking-wider">Repository & Commit</span>
            <div className="font-mono text-slate-200 mt-1">
              Commit: <span className="text-cyan-400 font-bold">{receipt.targetApp.commitHash || 'main@head'}</span>
            </div>
            {receipt.targetApp.repoUrl && (
              <span className="text-slate-400 text-[11px] truncate block">
                {receipt.targetApp.repoUrl.replace('https://github.com/', '')}
              </span>
            )}
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase text-slate-400 tracking-wider">Environment Tier</span>
            <div className="mt-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-slate-800 text-slate-200 border border-slate-700">
                {receipt.targetApp.environment}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">Run: {receipt.runId}</div>
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase text-slate-400 tracking-wider">Audit Pass Rate</span>
            <div className="text-emerald-400 font-mono font-bold text-base mt-1">
              {receipt.summary.passed} / {receipt.summary.totalChecks} Gates Passed
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              {receipt.summary.manualRequired} Manual sign-offs pending
            </div>
          </div>
        </div>

        {/* Itemized Verification Matrix */}
        <div className="py-6 border-b border-slate-800 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Itemized Audit Verifications
          </h3>

          <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80 bg-slate-950/60">
            {receipt.checks.map((check) => (
              <div key={check.id} className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{check.name}</span>
                    <span className="font-mono text-[10px] uppercase text-slate-500">[{check.category}]</span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-400 truncate max-w-lg">{check.evidence}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  {check.responseTimeMs && (
                    <span className="font-mono text-[11px] text-slate-500">{check.responseTimeMs}ms</span>
                  )}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${
                    check.status === 'passed'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                      : check.status === 'manual_required'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                      : 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                  }`}>
                    {check.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unresolved Manual Action Items if present */}
        {receipt.unresolvedActionItems.length > 0 && (
          <div className="py-6 border-b border-slate-800 space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Outstanding Manual Items Prior to Public Release</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300 bg-amber-950/20 border border-amber-900/40 rounded-xl p-3.5">
              {receipt.unresolvedActionItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cryptographic Signature Footer */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <QrCode className="w-8 h-8 text-slate-500 shrink-0" />
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Audit Signature</span>
              <span className="text-[11px] text-slate-300 break-all">{receipt.auditSignature}</span>
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-500">
            <span>Verified by VibePilot Engine</span>
            <div className="text-slate-400">IIIT Delhi Hackathon Edition</div>
          </div>
        </div>
      </div>

      {/* Return to Overview Button (hidden on print) */}
      <div className="no-print flex justify-center pt-2">
        <button
          onClick={onBackToOverview}
          className="text-xs text-slate-400 hover:text-slate-200 underline decoration-slate-600 transition-colors"
        >
          ← Return to App Map & Pipeline Overview
        </button>
      </div>
    </div>
  );
};
