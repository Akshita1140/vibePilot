'use client';

import React, { useEffect, useCallback } from 'react';
import { ApprovalRequest } from '@/lib/types';
import { ShieldAlert, AlertTriangle, Terminal, X, Check, HelpCircle, ArrowRight, Server, FileCode, CheckCircle2 } from 'lucide-react';

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
  // Handle keyboard Escape to dismiss modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    },
    [isSubmitting, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Prevent body scrolling while modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !request) return null;

  const isHighRisk = request.riskLevel === 'high' || request.riskLevel === 'critical';

  // Derived contextual descriptions for Priority 4 requirements
  const whyRequired =
    request.whyRequired ||
    'Modifies critical production infrastructure or credentials. Human-in-the-loop explicit confirmation is mandatory by security policy before the agent executes changes.';

  const providerAffected = request.affectedProvider || request.resourceImpacted;

  const expectedEffect =
    request.expectedEffect ||
    'Configures required runtime secrets and services, eliminating fatal launch-blocking 500 errors and enabling seamless route execution.';

  const manualPrerequisite =
    request.manualPrerequisite ||
    'Ensure you hold administrative credentials for the target provider and that active sessions will not be interrupted.';

  const afterApprovalEffect =
    request.afterApprovalEffect ||
    'The automation will execute the command safely, stream stdout/stderr into the Live Run console, run synthetic verification probes, and issue an immutable Setup Receipt.';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="approval-title"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-colors duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div
          className={`p-5 sm:p-6 border-b flex items-start justify-between gap-4 ${
            isHighRisk
              ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'
              : 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                isHighRisk
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                  : 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30'
              }`}
            >
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 id="approval-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Explicit Authorization Required
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-mono uppercase font-bold tracking-wider border ${
                    isHighRisk
                      ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700'
                      : 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-700'
                  }`}
                >
                  {request.riskLevel} Risk Gate
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                Security-sensitive operation paused for human review before execution.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close approval dialog"
            className="text-slate-500 hover:text-slate-800 dark:hover:text-white p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-700 dark:text-slate-300">
          {/* 1. Proposed Change */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              <FileCode className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Proposed Change</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {request.actionTitle}
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
              {request.description}
            </p>
          </div>

          {/* 2 & 3. Why It Is Required & Affected Provider */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Why This Is Required</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {whyRequired}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                <Server className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Target Provider / Resource</span>
              </div>
              <div className="text-xs sm:text-sm font-mono font-semibold text-cyan-700 dark:text-cyan-300 break-words mt-1">
                {providerAffected}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Verified configuration target for this task.
              </p>
            </div>
          </div>

          {/* 4. Execution Command Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Automation Command Preview</span>
              </div>
              <span className="text-[11px] text-slate-400 lowercase">non-interactive shell</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs sm:text-sm text-emerald-400 overflow-x-auto shadow-inner">
              <code>{request.commandPreview}</code>
            </div>
          </div>

          {/* Diff preview if present */}
          {request.diffSummary && (
            <div className="space-y-1.5">
              <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Planned Configuration Diff
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-200 overflow-x-auto max-h-36 whitespace-pre">
                {request.diffSummary}
              </div>
            </div>
          )}

          {/* 5. Expected Effect & Prerequisites */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60">
              <div className="text-xs font-bold text-cyan-900 dark:text-cyan-300 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Expected Effect</span>
              </div>
              <p className="text-xs sm:text-sm text-cyan-950 dark:text-cyan-200/90 leading-relaxed">
                {expectedEffect}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
              <div className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Risk & Prerequisites</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-200/90 leading-relaxed">
                {request.warningNote || manualPrerequisite}
              </p>
            </div>
          </div>

          {/* 6. What happens after approval */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <ArrowRight className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800 dark:text-white">Upon authorization: </span>
              {afterApprovalEffect}
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onReject(request.taskId)}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            Reject & Abort Step
          </button>

          <button
            type="button"
            onClick={() => onAuthorize(request.taskId)}
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authorizing Execution...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Authorize & Execute Step</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
