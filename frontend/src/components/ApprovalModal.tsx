'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { ApprovalRequest } from '@/lib/types';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Terminal, 
  X, 
  Check, 
  HelpCircle, 
  ArrowRight, 
  Server, 
  FileCode, 
  CheckCircle2,
  Clock,
  Zap,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ApprovalModalProps {
  isOpen: boolean;
  request: ApprovalRequest | null;
  onClose: () => void;
  onAuthorize: (taskId: string) => void;
  onReject: (taskId: string) => void;
  isSubmitting?: boolean;
}

const TOTAL_TIMEOUT_SECONDS = 120;

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  request,
  onClose,
  onAuthorize,
  onReject,
  isSubmitting = false,
}) => {
  // 120-second visible countdown ring
  const [secondsRemaining, setSecondsRemaining] = useState<number>(TOTAL_TIMEOUT_SECONDS);
  const [confirmedAuthorized, setConfirmedAuthorized] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(TOTAL_TIMEOUT_SECONDS);
      setConfirmedAuthorized(false);
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Timeout reached: Reject to GUIDED mode safely
          if (request) onReject(request.taskId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, request, onReject]);

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
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !request) return null;

  const isHighRisk = request.riskLevel === 'high' || request.riskLevel === 'critical';

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

  // SVG countdown circle geometry
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = secondsRemaining / TOTAL_TIMEOUT_SECONDS;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const handleAuthorizeClick = () => {
    setConfirmedAuthorized(true);
    setTimeout(() => {
      onAuthorize(request.taskId);
    }, 450);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="approval-title"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl bg-white dark:bg-[#0c101d] border border-slate-200 dark:border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden transition-colors duration-200 flex flex-col max-h-[92vh]"
      >
        {/* Modal Header with 120s Countdown Timer Ring */}
        <div
          className={`p-5 sm:p-6 border-b flex items-center justify-between gap-4 ${
            isHighRisk
              ? 'bg-amber-500/10 border-amber-500/20'
              : 'bg-violet-500/10 border-violet-500/20'
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={`p-2.5 rounded-2xl shrink-0 ${
                isHighRisk
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                  : 'bg-violet-500/20 text-cyan-400 border border-violet-500/30'
              }`}
            >
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 id="approval-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight font-display">
                  Stage 4: Human Authorization Gate
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider border ${
                    isHighRisk
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-violet-500/20 text-cyan-300 border-violet-500/40'
                  }`}
                >
                  {request.riskLevel} Risk Gate
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                Sensitive operational change paused for explicit human review.
              </p>
            </div>
          </div>

          {/* 120s Timeout Circular Countdown Ring */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="3"
                />
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  fill="none"
                  stroke={secondsRemaining < 30 ? '#f43f5e' : '#f59e0b'}
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <span className="absolute font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                {secondsRemaining}s
              </span>
            </div>

            <button
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close approval dialog"
              className="text-slate-400 hover:text-slate-800 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-700 dark:text-slate-300">
          {/* 1. What will change */}
          <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>What Will Change</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">
              {request.actionTitle}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {request.description}
            </p>
          </div>

          {/* 2 & 3. Why It Is Required & Affected Provider */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Why It Is Required</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {whyRequired}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                <Server className="w-3.5 h-3.5" />
                <span>Impacted Provider / Target</span>
              </div>
              <div className="text-xs font-mono font-bold text-slate-900 dark:text-white break-words mt-1">
                {providerAffected}
              </div>
              <p className="text-[11px] text-slate-400">
                Verified configuration target.
              </p>
            </div>
          </div>

          {/* 4. Automation Command Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-1">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Execution Command Preview</span>
              </div>
              <span className="text-slate-500">non-interactive shell</span>
            </div>
            <div className="bg-[#05070d] border border-white/[0.08] rounded-xl p-3 font-mono text-xs text-emerald-400 overflow-x-auto shadow-inner">
              <code>{request.commandPreview}</code>
            </div>
          </div>

          {/* 5. Expected Effect & Risk Note */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-cyan-500/[0.05] border border-cyan-500/20">
              <div className="text-xs font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Expected Outcome</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {expectedEffect}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/[0.05] border border-amber-500/20">
              <div className="text-xs font-bold text-amber-500 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Risk &amp; Prerequisite</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {request.warningNote || manualPrerequisite}
              </p>
            </div>
          </div>

          {/* 6. What happens after approval */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-xs text-slate-500 dark:text-slate-400">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 dark:text-slate-200">What happens next: </strong>
              {afterApprovalEffect} Rejecting switches the job safely to Guided Mode.
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions and Satisfying Confirm Animation */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#070b14] border-t border-slate-200 dark:border-white/[0.08] flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onReject(request.taskId)}
            disabled={isSubmitting || confirmedAuthorized}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-white/[0.04] dark:hover:bg-rose-950/30 dark:hover:text-rose-400 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-white/[0.08] transition-colors disabled:opacity-50 cursor-pointer"
          >
            Reject All &amp; Switch to Guided Mode
          </button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            animate={confirmedAuthorized ? { scale: [1, 1.05, 1], filter: 'brightness(1.2)' } : {}}
            onClick={handleAuthorizeClick}
            disabled={isSubmitting || confirmedAuthorized}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 active:brightness-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting || confirmedAuthorized ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Executing Authorized Step...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Authorize &amp; Execute Step</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
