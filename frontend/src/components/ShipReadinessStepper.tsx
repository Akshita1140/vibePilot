'use client';

import React from 'react';
import { WorkflowStage } from '@/lib/types';
import { 
  Compass, 
  AlertOctagon, 
  GitPullRequest, 
  ShieldAlert, 
  Terminal, 
  ShieldCheck, 
  FileCheck2,
  Check,
  Activity,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

interface ShipReadinessStepperProps {
  currentStage: WorkflowStage;
  completedStages: Partial<Record<WorkflowStage, boolean>>;
  onSelectStage: (stage: WorkflowStage) => void;
  hasPendingApproval?: boolean;
  jobStatus?: string;
}

export const ShipReadinessStepper: React.FC<ShipReadinessStepperProps> = ({
  currentStage,
  completedStages,
  onSelectStage,
  hasPendingApproval = false,
  jobStatus,
}) => {
  const steps: Array<{
    id: WorkflowStage;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'understand',
      label: 'Understand',
      sublabel: 'Routes & Secrets',
      icon: Compass,
    },
    {
      id: 'diagnose',
      label: 'Diagnose',
      sublabel: 'Root Cause Error',
      icon: AlertOctagon,
    },
    {
      id: 'plan',
      label: 'Plan',
      sublabel: 'Proposed Fix Diff',
      icon: GitPullRequest,
    },
    {
      id: 'approve',
      label: 'Approve',
      sublabel: '120s Risk Gate',
      icon: ShieldAlert,
    },
    {
      id: 'act',
      label: 'Act',
      sublabel: 'Live Execution',
      icon: Terminal,
    },
    {
      id: 'verify',
      label: 'Verify',
      sublabel: 'Synthetic Probes',
      icon: ShieldCheck,
    },
    {
      id: 'receipt',
      label: 'Receipt',
      sublabel: 'Certified Audit',
      icon: FileCheck2,
    },
  ];

  // Map active stage to current engine job status display pill
  const activeStatusText = React.useMemo(() => {
    if (jobStatus) return jobStatus;
    if (hasPendingApproval) return 'AWAITING_APPROVAL';
    switch (currentStage) {
      case 'understand': return 'ANALYZING';
      case 'diagnose': return 'DIAGNOSING';
      case 'plan': return 'PLANNING';
      case 'approve': return 'APPROVAL_GATE';
      case 'act': return 'EXECUTING';
      case 'verify': return 'VERIFYING';
      case 'receipt': return 'DONE';
      default: return 'ACTIVE';
    }
  }, [jobStatus, hasPendingApproval, currentStage]);

  return (
    <div className="w-full rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 backdrop-blur-xl shadow-lg dark:shadow-2xl transition-colors duration-200">
      {/* Header bar with title, status pill, and UX helper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200/80 dark:border-white/[0.06] px-1">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-slate-800 dark:text-slate-200 font-bold block">
              Ship Readiness Pipeline
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Interactive 7-stage autonomous journey
            </span>
          </div>
        </div>

        {/* Current Engine Status Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">Engine State:</span>
          <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border flex items-center gap-1.5 ${
            hasPendingApproval
              ? 'bg-amber-500/15 text-amber-500 border-amber-500/30 animate-pulse'
              : currentStage === 'receipt'
              ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
              : 'bg-violet-500/10 text-violet-700 dark:text-cyan-300 border-violet-500/20 dark:border-cyan-500/30'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              hasPendingApproval ? 'bg-amber-400 animate-ping' : 'bg-cyan-400'
            }`} />
            <span>{activeStatusText}</span>
          </div>
        </div>
      </div>

      {/* 7-Stage Horizontal Stepper with Flowing Connector Line */}
      <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-none">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStage === step.id;
          const isCompleted = !!completedStages[step.id];
          const isApprovalStep = step.id === 'approve' && hasPendingApproval;

          return (
            <React.Fragment key={step.id}>
              {idx > 0 && (
                <div className="h-[2px] flex-1 min-w-4 sm:min-w-6 relative overflow-hidden rounded-full">
                  <div 
                    className={`absolute inset-0 transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                        : isActive 
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 animate-pulse' 
                        : 'bg-slate-200 dark:bg-white/[0.08]'
                    }`} 
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => onSelectStage(step.id)}
                className={`group relative flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200 shrink-0 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 cursor-pointer ${
                  isActive
                    ? 'bg-violet-50/80 border border-violet-300 text-violet-950 dark:bg-white/[0.06] dark:border-cyan-400/80 dark:shadow-[0_0_16px_rgba(6,182,212,0.2)] dark:text-cyan-200'
                    : isApprovalStep
                    ? 'bg-amber-500/10 border border-amber-500/40 text-amber-500 animate-pulse'
                    : isCompleted
                    ? 'text-slate-800 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/[0.04] border border-transparent'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-white/[0.02] border border-transparent opacity-80'
                }`}
                title={`${step.label} — ${step.sublabel}`}
              >
                {/* Step Circle / Badge */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-400 text-white font-bold shadow-md shadow-violet-500/30'
                      : isCompleted
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 font-bold'
                      : isApprovalStep
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                      : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-white/[0.04] dark:text-slate-400 dark:border-white/[0.06]'
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-4 h-4 text-emerald-500 font-bold stroke-[3]" />
                  ) : (
                    <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  )}
                </div>

                {/* Step Labels */}
                <div className="flex flex-col items-center leading-tight">
                  <span className="text-[11px] sm:text-xs font-mono font-bold tracking-tight">
                    {step.label}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline max-w-[85px] truncate mt-0.5">
                    {step.sublabel}
                  </span>
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
