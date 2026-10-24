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
  Layers
} from 'lucide-react';

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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
          <GitPullRequest className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Change Plan Available</h3>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          No automated remediation plan was synthesized for <span className="font-semibold text-slate-800 dark:text-slate-200">{appName}</span>. All configuration keys are healthy.
        </p>
        <button
          onClick={onBackToDiagnosis}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          ← Return to Diagnosis
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contextual Explainer Banner: Priority 4 */}
      <div className="bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-transparent border border-cyan-200/80 dark:border-cyan-900/50 rounded-2xl p-5 sm:p-6 transition-colors duration-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 shrink-0 mt-0.5">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Stage 3: Proposed Remediation & Execution Plan
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300 font-mono font-semibold">
                  Pre-Execution Gate
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Before making any system or provider changes, VibePilot synthesizes a transparent, atomic action plan. High-risk modifications pause for your explicit confirmation.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowPlanExplainer(!showPlanExplainer)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            aria-label={showPlanExplainer ? 'Collapse explanation' : 'Expand explanation'}
          >
            {showPlanExplainer ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {showPlanExplainer && (
          <div className="mt-4 pt-4 border-t border-cyan-200/60 dark:border-cyan-900/40 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
            <div className="bg-white/70 dark:bg-slate-950/50 p-3.5 rounded-xl border border-cyan-100 dark:border-cyan-900/30 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                1. What this plan covers
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Environment variables, API credential rotations, database migrations, and callback configurations.
              </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-950/50 p-3.5 rounded-xl border border-cyan-100 dark:border-cyan-900/30 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                2. Explicit Human Approval
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                No secret or sensitive provider setting is touched without human authorization in Stage 4.
              </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-950/50 p-3.5 rounded-xl border border-cyan-100 dark:border-cyan-900/30 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                3. Verification Guarantee
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Every applied item undergoes an automatic synthetic probe to guarantee the fix actually resolved the root cause.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Plan Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 dark:bg-cyan-400" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Proposed Change Plan: {appName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                Plan ID: {plan.planId}
              </span>
              {isDemoMode && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30 font-bold">
                  SIMULATED SCENARIO
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Inspect the planned configuration adjustments and infrastructure updates before requesting execution authorization.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onBackToDiagnosis}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-transparent text-xs sm:text-sm font-semibold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Diagnosis</span>
            </button>

            <button
              onClick={onProceedToApproval}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 shrink-0"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Proceed to Approval Gate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Plan Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest block font-bold">
              Planned Actions
            </span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">
              {plan.items.length} Operation{plan.items.length !== 1 ? 's' : ''} Staged
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest block font-bold">
              Estimated Duration
            </span>
            <div className="text-xl sm:text-2xl font-bold text-cyan-700 dark:text-cyan-300 font-mono mt-1 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span>~{Math.round(plan.estimatedDurationMs / 1000 * 10) / 10}s total</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest block font-bold">
              Governance Gate
            </span>
            <div className="text-xl sm:text-2xl font-bold text-amber-800 dark:text-amber-300 font-mono mt-1 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              <span>Explicit Human Gate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Planned Changes List */}
      <div className="space-y-4">
        <div className="px-1 flex items-center justify-between">
          <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold">
            Itemized Modifications Required
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {plan.items.length} operations staged for execution
          </span>
        </div>

        <div className="space-y-4">
          {plan.items.map((item, idx) => {
            const riskColors = {
              low: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60',
              medium: 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800/60',
              high: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/60',
              critical: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/60',
            }[item.riskLevel];

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                {/* Item Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-sm font-mono font-bold text-cyan-700 dark:text-cyan-400 shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white text-base">{item.configurationKey}</span>
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-mono uppercase bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800 font-semibold">
                          {item.targetProvider}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{item.rationale}</p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-md text-xs font-mono uppercase font-bold border self-start sm:self-auto shrink-0 ${riskColors}`}>
                    {item.riskLevel} Risk
                  </span>
                </div>

                {/* Configuration Value Delta */}
                <div className="space-y-2">
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold block">
                    Configuration Value Delta:
                  </span>
                  <div className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-4 font-mono text-xs sm:text-sm space-y-1.5 overflow-x-auto shadow-inner">
                    {item.currentValue && (
                      <div className="text-rose-400 flex items-start gap-2">
                        <span className="text-rose-500 select-none font-bold">-</span>
                        <span className="break-all">{item.currentValue}</span>
                      </div>
                    )}
                    <div className="text-emerald-400 flex items-start gap-2 font-semibold">
                      <span className="text-emerald-500 select-none font-bold">+</span>
                      <span className="break-all">{item.proposedValue}</span>
                    </div>
                  </div>
                </div>

                {/* Verification Strategy & Manual Step Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs sm:text-sm">
                  <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Automated Verification Strategy:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {item.verificationMethod}
                    </p>
                  </div>

                  {item.requiresManualStep ? (
                    <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 space-y-1.5">
                      <span className="text-xs font-mono text-amber-800 dark:text-amber-300 uppercase tracking-widest font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Manual Operator Step Required:
                      </span>
                      <p className="text-amber-950 dark:text-amber-200 leading-relaxed">
                        {item.manualStepGuide || 'Operator manual credential authorization required in provider dashboard.'}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/50 space-y-1.5">
                      <span className="text-xs font-mono text-emerald-800 dark:text-emerald-300 uppercase tracking-widest font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Execution Mode:
                      </span>
                      <p className="text-emerald-950 dark:text-emerald-200 leading-relaxed">
                        Fully automated execution via CLI and REST API with zero manual downtime.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
