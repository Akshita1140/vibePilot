'use client';

import React, { useState } from 'react';
import { ChangePlan } from '@/lib/types';
import { 
  GitPullRequest, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ChevronLeft,
  Info,
  ChevronDown,
  ChevronUp,
  FileCode,
  Layers,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChangePlanViewProps {
  plan?: ChangePlan;
  appName: string;
  isDemoMode: boolean;
  onProceedToApproval: () => void;
  onBackToDiagnosis: () => void;
}

export const ChangePlanView: React.FC<ChangePlanViewProps> = ({
  plan,
  appName,
  isDemoMode,
  onProceedToApproval,
  onBackToDiagnosis,
}) => {
  const [showPlanExplainer, setShowPlanExplainer] = useState<boolean>(true);

  if (!plan) {
    return (
      <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 p-8 sm:p-12 text-center space-y-4 shadow-xl backdrop-blur-2xl">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center mx-auto text-slate-400">
          <GitPullRequest className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
          No Change Plan Available
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          No automated remediation plan was synthesized for <span className="font-semibold text-slate-800 dark:text-slate-200">{appName}</span>. All configuration keys are healthy.
        </p>
        <button
          onClick={onBackToDiagnosis}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-xs font-semibold transition-all cursor-pointer"
        >
          ← Return to Diagnosis
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Overview & Actions Banner */}
      <div className="rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 backdrop-blur-2xl shadow-xl transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
                Stage 3 of 7: Remediation Change Plan
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 font-display">
              Proposed Change Plan: {appName}
            </h2>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onBackToDiagnosis}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              ← Diagnosis
            </button>
            <button
              onClick={onProceedToApproval}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 active:scale-[0.98] text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/25 transition-all cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-slate-950" />
              <span>Stage 4: Proceed to Approval Gate</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </div>

        {/* UX Helper line */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04] flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>What&apos;s happening:</strong> Transparent config diff synthesized. <strong>What happens next:</strong> High-risk credentials require your explicit sign-off in the 120s human authorization gate.
          </span>
        </div>

        {/* 3 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-5">
          <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-3.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
              Planned Actions
            </span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">
              {plan.items.length} Operations Staged
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-3.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
              Estimated Duration
            </span>
            <div className="text-xl font-extrabold text-cyan-400 font-mono mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>~{Math.round(plan.estimatedDurationMs / 100) / 10}s total</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-3.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
              Governance Gate
            </span>
            <div className="text-xl font-extrabold text-amber-500 font-mono mt-1 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Human Approval Gate</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Itemized Planned Changes List */}
      <div className="space-y-4">
        <div className="px-1 flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="uppercase tracking-wider font-bold">
            Itemized Modifications Required
          </span>
          <span>{plan.items.length} operations</span>
        </div>

        <div className="space-y-3.5">
          {plan.items.map((item, idx) => {
            const riskColors = {
              low: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
              medium: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
              high: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
              critical: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
            }[item.riskLevel];

            return (
              <div
                key={item.id}
                className="rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 backdrop-blur-xl shadow-lg space-y-3"
              >
                {/* Item Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-200/80 dark:border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-xs font-mono font-bold text-cyan-400 shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">{item.configurationKey}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.06]">
                          {item.targetProvider}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.rationale}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border self-start sm:self-auto shrink-0 ${riskColors}`}>
                    {item.riskLevel} Risk
                  </span>
                </div>

                {/* Configuration Value Delta */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                    Configuration Value Delta:
                  </span>
                  <div className="bg-[#05070d] text-slate-200 border border-white/[0.08] rounded-xl p-3 font-mono text-xs space-y-1 overflow-x-auto shadow-inner">
                    {item.currentValue && (
                      <div className="text-rose-400 flex items-start gap-2">
                        <span className="text-rose-500 font-bold select-none">-</span>
                        <span className="break-all">{item.currentValue}</span>
                      </div>
                    )}
                    <div className="text-emerald-400 flex items-start gap-2 font-semibold">
                      <span className="text-emerald-500 font-bold select-none">+</span>
                      <span className="break-all">{item.proposedValue}</span>
                    </div>
                  </div>
                </div>

                {/* Verification Method Note */}
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Verification Method: {item.verificationMethod}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
