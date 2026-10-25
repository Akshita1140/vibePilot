'use client';

import React, { useState } from 'react';
import { 
  AppAnalysis, 
  SetupRun, 
  SetupReceipt, 
  WorkflowStage, 
  AppView, 
  SetupTask 
} from '@/lib/types';
import { ShipReadinessStepper } from './ShipReadinessStepper';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Terminal, 
  FileCheck2, 
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
  Compass,
  Cpu,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Zap,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';

interface OverviewWorkspaceProps {
  analysis: AppAnalysis;
  setupRun: SetupRun;
  receipt: SetupReceipt;
  currentWorkflowStage: WorkflowStage;
  completedStages: Partial<Record<WorkflowStage, boolean>>;
  onSelectWorkflowStage: (stage: WorkflowStage) => void;
  onNavigateView: (view: AppView) => void;
  onOpenApprovalModal: (task: SetupTask) => void;
  isDemoMode: boolean;
}

export const OverviewWorkspace: React.FC<OverviewWorkspaceProps> = ({
  analysis,
  setupRun,
  receipt,
  currentWorkflowStage,
  completedStages,
  onSelectWorkflowStage,
  onNavigateView,
  onOpenApprovalModal,
  isDemoMode,
}) => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const pendingApprovalTask = setupRun.tasks.find((t) => t.status === 'awaiting_approval');

  return (
    <div className="space-y-6">
      {/* 1. Cockpit Header & Tagline */}
      <div className="rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 backdrop-blur-2xl shadow-xl flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
              Mission Control &amp; Ship Readiness Cockpit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 font-display">
            Ship Readiness Cockpit
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
            AI generated the application code. VibePilot audits the endpoints, diagnoses fatal blockers, executes human-governed fixes, and verifies production readiness.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.06] transition-all shrink-0 cursor-pointer"
          aria-expanded={showHowItWorks}
        >
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>How VibePilot Works</span>
          {showHowItWorks ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>
      </div>

      {/* 2. "How VibePilot Works" Educational Guide */}
      {showHowItWorks && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-3xl p-6 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 backdrop-blur-2xl shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                The 4-Step Autonomous Journey to Production
              </h3>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 font-semibold">
              Tagline: &ldquo;AI writes the app. VibePilot gets it ready to ship.&rdquo;
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block font-mono">1. Enter Target URL</span>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Provide preview URL and Git repo. VibePilot maps routes, AST components, and missing environment variables.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block font-mono">2. Diagnose Root Cause</span>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Parse runtime stack traces and missing secrets, producing transparent root-cause diagnostics with confidence scoring.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block font-mono">3. Authorize Fixes</span>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Review proposed config diffs. High-risk cloud migrations pause for your 120s explicit human authorization gate.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block font-mono">4. Verify &amp; Certify</span>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Synthetic route probes test database queries, latency, and OAuth redirects, issuing an audit-certified Setup Receipt.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. Signature Stepper Bar */}
      <ShipReadinessStepper
        currentStage={currentWorkflowStage}
        completedStages={completedStages}
        onSelectStage={onSelectWorkflowStage}
        hasPendingApproval={!!pendingApprovalTask}
      />

      {/* 4. Active Action Stage Banner */}
      <div className="rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 backdrop-blur-2xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-colors">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-violet-500/10 text-violet-700 dark:text-cyan-300 border border-violet-500/20 dark:border-cyan-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Active Stage: {currentWorkflowStage.toUpperCase()}
            </span>
            {isDemoMode && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
                DEMO FIXTURE
              </span>
            )}
          </div>

          {currentWorkflowStage === 'understand' && (
            <>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
                Architecture &amp; Routes Discovered
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Scanned {analysis.metrics.totalRoutes} routes and {analysis.integrations.length} third-party services for {analysis.targetApp.name}. {analysis.missingConfigs.length} configuration gaps were identified.
              </p>
            </>
          )}

          {currentWorkflowStage === 'diagnose' && (
            <>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display flex items-center gap-2 flex-wrap">
                <span className="text-rose-500">Failure Diagnosed:</span> {analysis.diagnosis?.issueTitle || 'Runtime Issue Identified'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {analysis.diagnosis?.rootCause || 'Root cause mapped from synthetic telemetry and AST code inspections.'}
              </p>
            </>
          )}

          {currentWorkflowStage === 'plan' && (
            <>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display flex items-center gap-2 flex-wrap">
                <span className="text-cyan-400">Change Plan Staged:</span> {analysis.changePlan?.title || 'Remediation Actions Prepared'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {analysis.changePlan?.summary || 'Specific configuration values and IAM redirect origins ready for automated execution.'}
              </p>
            </>
          )}

          {currentWorkflowStage === 'approve' && (
            <>
              <h2 className="text-xl sm:text-2xl font-extrabold text-amber-500 tracking-tight font-display flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-amber-500 animate-pulse shrink-0" />
                <span>Human-in-the-Loop Authorization Gate</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                A sensitive infrastructure modification ({pendingApprovalTask?.title || 'Database Schema Migration'}) requires explicit confirmation before execution.
              </p>
            </>
          )}

          {currentWorkflowStage === 'act' && (
            <>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
                Orchestrating Live Setup Pipeline
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Executing staged configuration fixes with real-time telemetry streaming and automated error handling.
              </p>
            </>
          )}

          {currentWorkflowStage === 'verify' && (
            <>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
                Synthetic Verification Probes Running
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Asserting target app health, OAuth redirect verification, database latency, and token authentication.
              </p>
            </>
          )}

          {currentWorkflowStage === 'receipt' && (
            <>
              <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-500 tracking-tight font-display flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                <span>Ship Readiness Manifest Certified</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Receipt #{receipt.receiptId} generated with audit-grade cryptographic verification and configuration change records.
              </p>
            </>
          )}
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {currentWorkflowStage === 'understand' && (
            <button
              type="button"
              onClick={() => onSelectWorkflowStage('diagnose')}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:brightness-110 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-violet-500/25 transition-all cursor-pointer"
            >
              <span>Run Diagnostics</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {currentWorkflowStage === 'diagnose' && (
            <button
              type="button"
              onClick={() => onSelectWorkflowStage('plan')}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:brightness-110 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-violet-500/25 transition-all cursor-pointer"
            >
              <span>Review Remediation Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {currentWorkflowStage === 'plan' && (
            <button
              type="button"
              onClick={() => onSelectWorkflowStage('approve')}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 active:scale-[0.98] text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/25 transition-all cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-slate-950" />
              <span>Review Approval Gate</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          )}

          {currentWorkflowStage === 'approve' && (
            <button
              type="button"
              onClick={() => {
                if (pendingApprovalTask) {
                  onOpenApprovalModal(pendingApprovalTask);
                } else {
                  onSelectWorkflowStage('act');
                }
              }}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 active:scale-[0.98] text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/30 transition-all animate-pulse cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-slate-950" />
              <span>Authorize &amp; Execute Fix</span>
            </button>
          )}

          {currentWorkflowStage === 'act' && (
            <button
              type="button"
              onClick={() => onNavigateView('live-run')}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:brightness-110 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-violet-500/25 transition-all cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
              <span>Open Live Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {currentWorkflowStage === 'verify' && (
            <button
              type="button"
              onClick={() => onNavigateView('verify')}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <span>Inspect Verification Checks</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {currentWorkflowStage === 'receipt' && (
            <button
              type="button"
              onClick={() => onNavigateView('receipt')}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Inspect Setup Receipt</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 5. Telemetry Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Target Framework */}
        <div className="rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 backdrop-blur-xl shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Framework
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
              {analysis.targetApp.detectedFramework}
            </span>
          </div>
          <div className="font-bold text-slate-900 dark:text-white text-base truncate">
            {analysis.targetApp.name}
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-2">
            Inspected across AST components and runtime endpoints.
          </p>
        </div>

        {/* Card 2: Routes & APIs */}
        <div 
          onClick={() => onNavigateView('app-map')}
          className="rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 backdrop-blur-xl hover:border-cyan-400/50 shadow-lg space-y-2 cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" /> Routes &amp; APIs
            </span>
            <span className="text-cyan-400 group-hover:translate-x-1 transition-transform font-bold text-xs">→</span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-cyan-400">
            {analysis.metrics.totalRoutes}
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-2">
            {analysis.metrics.apiEndpoints} API handlers • {analysis.metrics.dynamicRoutes} dynamic paths.
          </p>
        </div>

        {/* Card 3: Config Gaps */}
        <div 
          onClick={() => onNavigateView('app-map')}
          className="rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 backdrop-blur-xl hover:border-amber-400/50 shadow-lg space-y-2 cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-500" /> Config Gaps
            </span>
            <span className="text-amber-500 group-hover:translate-x-1 transition-transform font-bold text-xs">→</span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-500">
            {analysis.missingConfigs.length} Missing
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-2">
            {analysis.missingConfigs.filter((c) => c.secret).length} missing secret keys required for deployment.
          </p>
        </div>

        {/* Card 4: Verification Readiness */}
        <div 
          onClick={() => onNavigateView('verify')}
          className="rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 backdrop-blur-xl hover:border-emerald-400/50 shadow-lg space-y-2 cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Audit Gates
            </span>
            <span className="text-emerald-500 group-hover:translate-x-1 transition-transform font-bold text-xs">→</span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-500">
            {receipt.summary.passed} / {receipt.summary.totalChecks}
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-2">
            {receipt.summary.manualRequired} manual sign-offs required before release.
          </p>
        </div>
      </div>
    </div>
  );
};
