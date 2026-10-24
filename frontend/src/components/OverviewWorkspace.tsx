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
  Sparkles
} from 'lucide-react';

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
    <div className="space-y-8">
      {/* 1. Page Header & Introduction */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
              Mission Control & Readiness Overview
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Ship Readiness Cockpit
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
            AI generated the application code. VibePilot audits the routes, automates missing configurations, executes human-governed fixes, and verifies production readiness.
          </p>
        </div>

        {/* How VibePilot Works Toggle Button */}
        <button
          type="button"
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-cyan-400 shadow-sm transition-all shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-expanded={showHowItWorks}
        >
          <Info className="w-4 h-4 text-indigo-500 dark:text-cyan-400" />
          <span>How VibePilot Works</span>
          {showHowItWorks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. Priority 4: Contextual "How VibePilot Works" Educational Guide */}
      {showHowItWorks && (
        <div className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-[#090E1B] dark:to-slate-900 border border-indigo-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm dark:shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                The 4-Step Journey to Production Deployment
              </h3>
            </div>
            <span className="text-xs font-mono text-indigo-700 dark:text-cyan-400 font-semibold">
              Tagline: “AI writes the app. VibePilot gets it ready to ship.”
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center font-mono text-xs font-bold">1</span>
                <span>Enter Target URL</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Provide your staging preview URL and Git repo. VibePilot runs non-destructive route probing and AST structure parsing.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 flex items-center justify-center font-mono text-xs font-bold">2</span>
                <span>Click Analyze App</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                VibePilot maps endpoints, detects 3rd-party integrations (Supabase, Stripe, OpenAI), and audits missing environment variables.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center font-mono text-xs font-bold">3</span>
                <span>Authorize Fixes</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Inspect root-cause diagnostics and proposed config diffs. High-risk cloud migrations pause for your explicit approval gate.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-mono text-xs font-bold">4</span>
                <span>Verify & Certify</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Automated synthetic probes test database queries, latency, and auth redirects, issuing an audit-certified Setup Receipt.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Signature Stepper: Ship Readiness Workspace */}
      <ShipReadinessStepper
        currentStage={currentWorkflowStage}
        completedStages={completedStages}
        onSelectStage={onSelectWorkflowStage}
        hasPendingApproval={!!pendingApprovalTask}
      />

      {/* 4. Prominent Current-Action Panel */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-100 via-indigo-50/40 to-slate-100 dark:from-slate-900 dark:via-[#0B132B] dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-2xl transition-colors duration-200">
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-mono uppercase font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse" />
                Current Action Stage: {currentWorkflowStage.toUpperCase()}
              </span>
              {isDemoMode && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30 font-bold">
                  VERIFIED DEMO SCENARIO
                </span>
              )}
            </div>

            {currentWorkflowStage === 'understand' && (
              <>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Architecture & Routes Discovered
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Scanned {analysis.metrics.totalRoutes} routes and {analysis.integrations.length} third-party integrations for {analysis.targetApp.name}. {analysis.missingConfigs.length} configuration gaps were identified.
                </p>
              </>
            )}

            {currentWorkflowStage === 'diagnose' && (
              <>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
                  <span className="text-rose-600 dark:text-rose-400">Failure Diagnosed:</span> {analysis.diagnosis?.issueTitle || 'Runtime Issue Identified'}
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {analysis.diagnosis?.rootCause || 'Root cause mapped from synthetic telemetry and AST code inspections.'}
                </p>
              </>
            )}

            {currentWorkflowStage === 'plan' && (
              <>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
                  <span className="text-indigo-700 dark:text-cyan-400">Change Plan Staged:</span> {analysis.changePlan?.title || 'Remediation Actions Prepared'}
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {analysis.changePlan?.summary || 'Specific configuration values and IAM redirect origins ready for automated execution.'}
                </p>
              </>
            )}

            {currentWorkflowStage === 'approve' && (
              <>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-amber-800 dark:text-amber-300 tracking-tight flex items-center gap-2">
                  <ShieldAlert className="w-7 h-7 text-amber-500 dark:text-amber-400 shrink-0 animate-pulse" />
                  <span>Human-in-the-Loop Authorization Gate</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed">
                  A sensitive infrastructure modification ({pendingApprovalTask?.title || 'Database Schema Migration'}) requires explicit operator confirmation before execution.
                </p>
              </>
            )}

            {currentWorkflowStage === 'act' && (
              <>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Orchestrating Live Setup Pipeline
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Executing staged configuration fixes with real-time telemetry streaming and automated error handling.
                </p>
              </>
            )}

            {currentWorkflowStage === 'verify' && (
              <>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Synthetic Verification Probes Running
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Asserting target app health, OAuth redirect verification, database latency, and token authentication.
                </p>
              </>
            )}

            {currentWorkflowStage === 'receipt' && (
              <>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight flex items-center gap-2">
                  <CheckCircle2 className="w-7 h-7 shrink-0" />
                  <span>Ship Readiness Manifest Certified</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Receipt #{receipt.receiptId} generated with audit-grade cryptographic verification and configuration change records.
                </p>
              </>
            )}
          </div>

          {/* Action CTAs (Comfortable, Prominent Buttons) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {currentWorkflowStage === 'understand' && (
              <button
                type="button"
                onClick={() => onSelectWorkflowStage('diagnose')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm sm:text-base shadow-md shadow-indigo-600/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <span>Run Diagnostics</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentWorkflowStage === 'diagnose' && (
              <button
                type="button"
                onClick={() => onSelectWorkflowStage('plan')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm sm:text-base shadow-md shadow-indigo-600/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <span>Review Remediation Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentWorkflowStage === 'plan' && (
              <button
                type="button"
                onClick={() => onSelectWorkflowStage('approve')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm sm:text-base shadow-md shadow-amber-500/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Review Approval Gate</span>
                <ArrowRight className="w-4 h-4" />
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
                className="flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-amber-500/40 transition-all animate-pulse focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <ShieldAlert className="w-5 h-5" />
                <span>Authorize & Execute Fix</span>
              </button>
            )}

            {currentWorkflowStage === 'act' && (
              <button
                type="button"
                onClick={() => onNavigateView('live-run')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base shadow-md shadow-indigo-600/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
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
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-md shadow-emerald-600/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <span>Inspect Verification Checks</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentWorkflowStage === 'receipt' && (
              <button
                type="button"
                onClick={() => onNavigateView('receipt')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-md shadow-emerald-600/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Inspect Setup Receipt</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Configuration Health & Observability Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: App Identity */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-2.5 shadow-sm transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-400" /> Target Framework
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800">
              {analysis.targetApp.detectedFramework}
            </span>
          </div>
          <div className="font-bold text-slate-900 dark:text-white text-lg truncate">
            {analysis.targetApp.name}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
            Staging environment inspected across AST components and runtime endpoints.
          </p>
        </div>

        {/* Card 2: Discovered Routes */}
        <div 
          onClick={() => onNavigateView('app-map')}
          className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-cyan-700 rounded-2xl p-5 sm:p-6 space-y-2.5 cursor-pointer group shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-400" /> Routes & APIs
            </span>
            <span className="text-indigo-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform font-bold">→</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-indigo-600 dark:text-cyan-300">
            {analysis.metrics.totalRoutes}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
            {analysis.metrics.apiEndpoints} API endpoints • {analysis.metrics.dynamicRoutes} dynamic paths audited.
          </p>
        </div>

        {/* Card 3: Configuration Gaps */}
        <div 
          onClick={() => onNavigateView('app-map')}
          className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 rounded-2xl p-5 sm:p-6 space-y-2.5 cursor-pointer group shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-500" /> Config Gaps
            </span>
            <span className="text-amber-500 group-hover:translate-x-1 transition-transform font-bold">→</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-300">
            {analysis.missingConfigs.length} Missing
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
            {analysis.missingConfigs.filter((c) => c.secret).length} missing secret keys required for deployment.
          </p>
        </div>

        {/* Card 4: Verification Readiness */}
        <div 
          onClick={() => onNavigateView('verify')}
          className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 rounded-2xl p-5 sm:p-6 space-y-2.5 cursor-pointer group shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Audit Gates
            </span>
            <span className="text-emerald-500 group-hover:translate-x-1 transition-transform font-bold">→</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
            {receipt.summary.passed} / {receipt.summary.totalChecks}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
            {receipt.summary.manualRequired} manual sign-off required before public release.
          </p>
        </div>
      </div>

      {/* 6. Live Execution Timeline & Task Pipeline Preview */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm dark:shadow-xl space-y-5 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
              <span>Live Run Execution Trace Preview</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Sequential orchestration tasks and human-in-the-loop authorization gates.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateView('live-run')}
            className="text-xs sm:text-sm font-mono text-indigo-600 dark:text-cyan-400 hover:underline flex items-center gap-1.5 font-bold self-start sm:self-auto"
          >
            <span>Full Execution Trace</span>
            <span>→</span>
          </button>
        </div>

        {/* Task Steps Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {setupRun.tasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              onClick={() => onNavigateView('live-run')}
              className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition-colors">
                  {task.title}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-mono uppercase border shrink-0 ${
                  task.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                    : task.status === 'awaiting_approval'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-500 animate-pulse font-semibold'
                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                }`}>
                  {task.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{task.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
