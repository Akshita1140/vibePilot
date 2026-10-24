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
  Check
} from 'lucide-react';

interface ShipReadinessStepperProps {
  currentStage: WorkflowStage;
  completedStages: Partial<Record<WorkflowStage, boolean>>;
  onSelectStage: (stage: WorkflowStage) => void;
  hasPendingApproval?: boolean;
}

export const ShipReadinessStepper: React.FC<ShipReadinessStepperProps> = ({
  currentStage,
  completedStages,
  onSelectStage,
  hasPendingApproval = false,
}) => {
  const steps: Array<{
    id: WorkflowStage;
    label: string;
    shortLabel: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'understand',
      label: 'Understand',
      shortLabel: '1. Map',
      sublabel: 'Routes & Secrets',
      icon: Compass,
    },
    {
      id: 'diagnose',
      label: 'Diagnose',
      shortLabel: '2. Root Cause',
      sublabel: 'Failure Analysis',
      icon: AlertOctagon,
    },
    {
      id: 'plan',
      label: 'Plan',
      shortLabel: '3. Plan',
      sublabel: 'Proposed Fix',
      icon: GitPullRequest,
    },
    {
      id: 'approve',
      label: 'Approve',
      shortLabel: '4. Gate',
      sublabel: 'Human Authorization',
      icon: ShieldAlert,
    },
    {
      id: 'act',
      label: 'Act',
      shortLabel: '5. Run',
      sublabel: 'Live Pipeline',
      icon: Terminal,
    },
    {
      id: 'verify',
      label: 'Verify',
      shortLabel: '6. Check',
      sublabel: 'Synthetics & Probes',
      icon: ShieldCheck,
    },
    {
      id: 'receipt',
      label: 'Receipt',
      shortLabel: '7. Receipt',
      sublabel: 'Certified Audit',
      icon: FileCheck2,
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-[#080D1A] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-xl backdrop-blur-md transition-colors duration-200">
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-200 dark:border-slate-800/80 px-1">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse" />
          <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-slate-800 dark:text-slate-200 font-bold">
            Ship Readiness Pipeline
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
          <span className="hidden sm:inline">Active Stage:</span>
          <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-cyan-950/80 dark:text-cyan-300 font-bold border border-indigo-200 dark:border-cyan-800/60 uppercase">
            {currentStage}
          </span>
        </div>
      </div>

      {/* Stepper Bar */}
      <div className="flex items-center justify-between gap-1 sm:gap-3 overflow-x-auto pb-1 scrollbar-none">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStage === step.id;
          const isCompleted = !!completedStages[step.id];
          const isApprovalStep = step.id === 'approve' && hasPendingApproval;

          return (
            <React.Fragment key={step.id}>
              {idx > 0 && (
                <div 
                  className={`h-[2px] flex-1 min-w-5 sm:min-w-8 transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                      : isActive 
                      ? 'bg-gradient-to-r from-emerald-500 to-indigo-500 dark:to-cyan-500' 
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`} 
                />
              )}

              <button
                type="button"
                onClick={() => onSelectStage(step.id)}
                className={`group relative flex flex-col items-center gap-2 p-2 sm:p-2.5 rounded-xl transition-all duration-200 shrink-0 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isActive
                    ? 'bg-indigo-50/80 border border-indigo-300 text-indigo-950 ring-1 ring-indigo-400/40 shadow-sm dark:bg-slate-900 dark:border-cyan-500/60 dark:shadow-[0_0_15px_rgba(6,182,212,0.25)] dark:ring-cyan-500/40'
                    : isApprovalStep
                    ? 'bg-amber-50 border border-amber-300 dark:bg-amber-950/40 dark:border-amber-500/60 animate-pulse'
                    : isCompleted
                    ? 'hover:bg-slate-100 text-slate-800 dark:hover:bg-slate-900/60 dark:text-slate-200 border border-transparent'
                    : 'opacity-70 hover:opacity-100 hover:bg-slate-100 text-slate-600 dark:hover:bg-slate-900/40 dark:text-slate-400 border border-transparent'
                }`}
                title={`${step.label} — ${step.sublabel}`}
              >
                {/* Step Circle Icon */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-indigo-600 dark:bg-cyan-500 text-white dark:text-slate-950 font-bold shadow-md shadow-indigo-600/30'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-500/50'
                      : isApprovalStep
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800'
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 font-bold" />
                  ) : (
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>

                {/* Text Label */}
                <div className="flex flex-col items-center leading-tight">
                  <span
                    className={`text-xs sm:text-sm font-semibold tracking-tight transition-colors ${
                      isActive
                        ? 'text-indigo-700 dark:text-cyan-300 font-bold'
                        : isCompleted
                        ? 'text-slate-800 dark:text-slate-200'
                        : isApprovalStep
                        ? 'text-amber-800 dark:text-amber-300'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="hidden sm:inline">{step.label}</span>
                    <span className="sm:hidden">{step.shortLabel}</span>
                  </span>
                  <span className="hidden md:block text-xs font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                    {step.sublabel}
                  </span>
                </div>

                {/* Top Glowing Indicator dot if active */}
                {isActive && (
                  <span className="absolute -top-1 w-2 h-2 rounded-full bg-indigo-500 dark:bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
