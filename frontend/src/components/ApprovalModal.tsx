'use client';

import React from 'react';
import { ApprovalRequest } from '@/lib/types';
import { ShieldAlert, AlertTriangle, Terminal, X, Check } from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  request: ApprovalRequest | null;
  onClose: () => void;
  onAuthorize: (taskId: string) => void;
  onReject: (taskId: string) => void;
  isSubmitting?: boolean;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  request,
  onClose,
  onAuthorize,
  onReject,
  isSubmitting = false,
}) => {
  if (!isOpen || !request) return null;

  const isHighRisk = request.riskLevel === 'high' || request.riskLevel === 'critical';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isHighRisk 
            ? 'bg-amber-950/30 border-amber-800/50' 
            : 'bg-indigo-950/30 border-indigo-800/50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${
              isHighRisk ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">Explicit Authorization Required</h3>
                <span className={`px-2 py-0.2 rounded text-[10px] font-mono uppercase font-semibold border ${
                  isHighRisk 
                    ? 'bg-amber-950 text-amber-300 border-amber-700' 
                    : 'bg-indigo-950 text-indigo-300 border-indigo-700'
                }`}>
                  {request.riskLevel} Risk
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Human-in-the-loop verification gate for sensitive automation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-white">{request.actionTitle}</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{request.description}</p>
          </div>

          {/* Impacted Resource */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Target Resource:</div>
            <div className="font-mono text-cyan-300 font-medium mt-0.5">{request.resourceImpacted}</div>
          </div>

          {/* Command Preview */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              <Terminal className="w-3 h-3 text-slate-500" />
              <span>Execution Command Preview:</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-emerald-400 overflow-x-auto">
              <code>{request.commandPreview}</code>
            </div>
          </div>

          {/* Diff Preview if present */}
          {request.diffSummary && (
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Planned Changes / Diff:
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-x-auto max-h-36 whitespace-pre">
                {request.diffSummary}
              </div>
            </div>
          )}

          {/* Explicit Warning Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              <span className="font-semibold text-amber-300">Caution: </span>
              {request.warningNote}
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onReject(request.taskId)}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50"
          >
            Reject & Abort Step
          </button>

          <button
            type="button"
            onClick={() => onAuthorize(request.taskId)}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-xs shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Authorizing...' : 'Authorize Execution'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
