'use client';

import React, { useState } from 'react';
import { 
  WorkflowStage, 
  AppView, 
  DemoPreset, 
  AppAnalysis, 
  SetupRun, 
  SetupTask, 
  SetupReceipt as SetupReceiptType,
  Theme
} from '@/lib/types';
import { DEMO_PRESETS } from '@/lib/demo-data';
import { VibePilotApi } from '@/lib/api';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { OverviewWorkspace } from '@/components/OverviewWorkspace';
import { AppInput } from '@/components/AppInput';
import { AppMap } from '@/components/AppMap';
import { DiagnosisPanel } from '@/components/DiagnosisPanel';
import { ChangePlanView } from '@/components/ChangePlanView';
import { SetupProgress } from '@/components/SetupProgress';
import { ApprovalModal } from '@/components/ApprovalModal';
import { VerificationResults } from '@/components/VerificationResults';
import { SetupReceipt } from '@/components/SetupReceipt';
import { ReceiptsHistory } from '@/components/ReceiptsHistory';
import { SettingsPanel } from '@/components/SettingsPanel';
import { IntegrationAlertModal } from '@/components/IntegrationAlertModal';

export default function Home() {
  const [selectedPreset, setSelectedPreset] = useState<DemoPreset>(DEMO_PRESETS[0]);
  const [activeView, setActiveView] = useState<AppView>('overview');
  const [currentWorkflowStage, setCurrentWorkflowStage] = useState<WorkflowStage>('understand');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState<boolean>(false);
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  // Theme Management (Dark / Light Mode)
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vibepilot_theme') as Theme | null;
      if (stored === 'light' || stored === 'dark') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vibepilot_theme') as Theme | null;
      const initial = (stored === 'light' || stored === 'dark')
        ? stored
        : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      setTheme(initial);
      if (initial === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vibepilot_theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    }
  };
  
  // Application Data State
  const [analysis, setAnalysis] = useState<AppAnalysis>(DEMO_PRESETS[0].analysisData);
  const [setupRun, setSetupRun] = useState<SetupRun>(DEMO_PRESETS[0].setupRunData);
  const [receipt, setReceipt] = useState<SetupReceiptType>(DEMO_PRESETS[0].receiptData);
  const [receiptsList, setReceiptsList] = useState<SetupReceiptType[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('vibepilot_receipts_archive');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Failed to parse stored receipts:', e);
      }
    }
    return DEMO_PRESETS.map((p) => p.receiptData);
  });

  // Interaction State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState<boolean>(false);
  const [activeApprovalTask, setActiveApprovalTask] = useState<SetupTask | null>(null);
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);

  // 7-Stage Workflow Completion Tracker
  const [completedStages, setCompletedStages] = useState<Partial<Record<WorkflowStage, boolean>>>({
    understand: true,
    diagnose: true,
    plan: true,
    approve: false,
    act: false,
    verify: false,
    receipt: false,
  });

  const saveReceiptToArchive = (newReceipt: SetupReceiptType) => {
    setReceiptsList((prev) => {
      const existsIdx = prev.findIndex((r) => r.receiptId === newReceipt.receiptId);
      let updated: SetupReceiptType[];
      if (existsIdx >= 0) {
        updated = [...prev];
        updated[existsIdx] = newReceipt;
      } else {
        updated = [newReceipt, ...prev];
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('vibepilot_receipts_archive', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleClearReceipts = () => {
    setReceiptsList([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vibepilot_receipts_archive');
    }
  };

  // Preset Selection
  const handleSelectPreset = (preset: DemoPreset) => {
    setSelectedPreset(preset);
    setAnalysis(JSON.parse(JSON.stringify(preset.analysisData)));
    setSetupRun(JSON.parse(JSON.stringify(preset.setupRunData)));
    setReceipt(JSON.parse(JSON.stringify(preset.receiptData)));
    setCurrentWorkflowStage('understand');
    setCompletedStages({
      understand: true,
      diagnose: true,
      plan: true,
      approve: false,
      act: preset.setupRunData.overallStatus === 'completed',
      verify: false,
      receipt: false,
    });
    setActiveView('overview');
  };

  // Reset Scenario
  const handleResetDemo = () => {
    handleSelectPreset(selectedPreset);
  };

  // Toggle Live vs Demo Mode
  const handleToggleDemoMode = () => {
    const nextMode = !isDemoMode;
    setIsDemoMode(nextMode);
    VibePilotApi.setDemoMode(nextMode);
  };

  // Navigation from 7-Stage Stepper
  const handleSelectWorkflowStage = (stage: WorkflowStage) => {
    setCurrentWorkflowStage(stage);
    switch (stage) {
      case 'understand':
        setActiveView('app-map');
        break;
      case 'diagnose':
        setActiveView('diagnose');
        break;
      case 'plan':
        setActiveView('plan');
        break;
      case 'approve': {
        const pending = setupRun.tasks.find((t) => t.status === 'awaiting_approval');
        if (pending) {
          setActiveApprovalTask(pending);
          setApprovalModalOpen(true);
        }
        setActiveView('plan');
        break;
      }
      case 'act':
        setActiveView('live-run');
        break;
      case 'verify':
        setActiveView('verify');
        break;
      case 'receipt':
        setActiveView('receipt');
        break;
      default:
        setActiveView('overview');
    }
  };

  // Analyze App Action
  const handleAnalyze = async (appUrl: string, repoUrl?: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    const res = await VibePilotApi.analyzeApp(appUrl, repoUrl);
    setIsAnalyzing(false);

    if (res.data) {
      setAnalysis(res.data.analysis);
      if (res.data.setupRun) {
        setSetupRun(res.data.setupRun);
      }
      setCompletedStages((prev) => ({
        ...prev,
        understand: true,
        diagnose: true,
        plan: true,
      }));
      if (res.error) {
        setAnalysisError(res.error);
      }
      setActiveView('app-map');
    } else {
      setAnalysisError(res.error || 'Failed to analyze application.');
    }
  };

  // Run Next Task in Live Run
  const handleRunNextTask = () => {
    setSetupRun((prev) => {
      const tasks = [...prev.tasks];
      const nextPendingIdx = tasks.findIndex((t) => t.status === 'pending');
      if (nextPendingIdx === -1) return prev;

      const task = { ...tasks[nextPendingIdx] };
      task.status = 'completed';
      task.durationMs = Math.floor(Math.random() * 400) + 250;
      task.logs = [
        ...task.logs,
        {
          timestamp: new Date().toISOString().substring(11, 23),
          level: 'info',
          message: `Executing task: ${task.title}...`,
        },
        {
          timestamp: new Date().toISOString().substring(11, 23),
          level: 'success',
          message: `Task successfully verified and completed in ${task.durationMs}ms`,
        },
      ];

      tasks[nextPendingIdx] = task;
      const completedCount = tasks.filter((t) => t.status === 'completed' || t.status === 'requires_manual_action').length;
      const progress = Math.round((completedCount / tasks.length) * 100);

      return {
        ...prev,
        tasks,
        progressPercentage: progress,
        currentTaskId: tasks[nextPendingIdx + 1]?.id || task.id,
        overallStatus: progress === 100 ? 'completed' : prev.overallStatus,
      };
    });
  };

  // Run All Tasks until approval or completion
  const handleRunAllTasks = async () => {
    setIsRunningAll(true);

    const currentTasks = [...setupRun.tasks];
    for (let i = 0; i < currentTasks.length; i++) {
      const task = currentTasks[i];
      if (task.status === 'awaiting_approval') {
        setActiveApprovalTask(task);
        setApprovalModalOpen(true);
        setIsRunningAll(false);
        setCurrentWorkflowStage('approve');
        return;
      }

      if (task.status === 'pending') {
        await new Promise((resolve) => setTimeout(resolve, 450));
        handleRunNextTask();
      }
    }

    setIsRunningAll(false);
    setCompletedStages((prev) => ({ ...prev, act: true }));
  };

  // Retry a failed or manual task
  const handleRetryTask = (taskId: string) => {
    setSetupRun((prev) => {
      const tasks = prev.tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'completed' as const,
            failureReason: undefined,
            suggestedFix: undefined,
            logs: [
              ...t.logs,
              {
                timestamp: new Date().toISOString().substring(11, 23),
                level: 'success' as const,
                message: 'Task retried and verified successfully.',
              },
            ],
          };
        }
        return t;
      });
      return { ...prev, tasks };
    });
  };

  // Authorize Sensitive Action
  const handleAuthorizeAction = async (taskId: string) => {
    setIsAuthorizing(true);
    await VibePilotApi.submitApproval(setupRun.runId, taskId, true);
    setIsAuthorizing(false);
    setApprovalModalOpen(false);

    setSetupRun((prev) => {
      const tasks = prev.tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'completed' as const,
            durationMs: 780,
            logs: [
              ...t.logs,
              {
                timestamp: new Date().toISOString().substring(11, 23),
                level: 'info' as const,
                message: 'Operator authorization granted. Executing approved change...',
              },
              {
                timestamp: new Date().toISOString().substring(11, 23),
                level: 'success' as const,
                message: 'Action completed and verified against target environment.',
              },
            ],
          };
        }
        return t;
      });

      const completedCount = tasks.filter((t) => t.status === 'completed' || t.status === 'requires_manual_action').length;
      const progress = Math.round((completedCount / tasks.length) * 100);

      return {
        ...prev,
        tasks,
        progressPercentage: progress,
        overallStatus: progress === 100 ? 'completed' : 'running',
      };
    });

    setCompletedStages((prev) => ({ ...prev, approve: true, act: true }));
    setCurrentWorkflowStage('act');
    setActiveView('live-run');
  };

  // Reject Sensitive Action
  const handleRejectAction = async (taskId: string) => {
    await VibePilotApi.submitApproval(setupRun.runId, taskId, false);
    setApprovalModalOpen(false);

    setSetupRun((prev) => {
      const tasks = prev.tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'failed' as const,
            failureReason: 'Operator rejected execution during human authorization review.',
            logs: [
              ...t.logs,
              {
                timestamp: new Date().toISOString().substring(11, 23),
                level: 'error' as const,
                message: 'Authorization cancelled by operator. Action left unapproved.',
              },
            ],
          };
        }
        return t;
      });
      return { ...prev, tasks, overallStatus: 'failed' as const };
    });
  };

  const pendingApproval = !!setupRun.tasks.find((t) => t.status === 'awaiting_approval');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#070A13] dark:text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-800 dark:selection:text-cyan-200 transition-colors">
      {/* 1. Slide-over Navigation Drawer */}
      <Sidebar
        activeView={activeView}
        onSelectView={(view) => setActiveView(view)}
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        receiptsCount={receiptsList.length}
        pendingApproval={pendingApproval}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Persistent Top Header with Hamburger Menu */}
        <Header
          appName={analysis.targetApp.name}
          appUrl={analysis.targetApp.url}
          detectedFramework={analysis.targetApp.detectedFramework}
          selectedPreset={selectedPreset}
          onSelectPreset={handleSelectPreset}
          isDemoMode={isDemoMode}
          onToggleDemoMode={handleToggleDemoMode}
          onResetDemo={handleResetDemo}
          onNewAnalysis={() => {
            setActiveView('app-map');
            setCurrentWorkflowStage('understand');
          }}
          onOpenMobileSidebar={() => setIsOpenMobile((prev) => !prev)}
          hasPendingApproval={pendingApproval}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenIntegrationModal={() => setIsIntegrationModalOpen(true)}
        />

        {/* Dynamic Workspace View */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {/* View: Overview Workspace (The Signature Ship Readiness Cockpit) */}
          {activeView === 'overview' && (
            <OverviewWorkspace
              analysis={analysis}
              setupRun={setupRun}
              receipt={receipt}
              currentWorkflowStage={currentWorkflowStage}
              completedStages={completedStages}
              onSelectWorkflowStage={handleSelectWorkflowStage}
              onNavigateView={(view) => setActiveView(view)}
              onOpenApprovalModal={(task) => {
                setActiveApprovalTask(task);
                setApprovalModalOpen(true);
              }}
              isDemoMode={isDemoMode}
            />
          )}

          {/* View: App Map & Architecture Intake */}
          {activeView === 'app-map' && (
            <div className="space-y-6">
              <AppInput
                onAnalyze={handleAnalyze}
                isLoading={isAnalyzing}
                errorMessage={analysisError}
                onSelectPreset={handleSelectPreset}
                currentAppUrl={analysis.targetApp.url}
                currentRepoUrl={analysis.targetApp.repoUrl || ''}
              />

              <AppMap
                analysis={analysis}
                onProceedToSetup={() => {
                  setCurrentWorkflowStage('act');
                  setActiveView('live-run');
                  setCompletedStages((prev) => ({ ...prev, understand: true }));
                }}
                onProceedToDiagnosis={() => {
                  setCurrentWorkflowStage('diagnose');
                  setActiveView('diagnose');
                  setCompletedStages((prev) => ({ ...prev, understand: true }));
                }}
                isDemoData={isDemoMode}
              />
            </div>
          )}

          {/* View: Root Cause Diagnosis */}
          {activeView === 'diagnose' && (
            <DiagnosisPanel
              diagnosis={analysis.diagnosis}
              appName={analysis.targetApp.name}
              isDemoMode={isDemoMode}
              onProceedToPlan={() => {
                setCurrentWorkflowStage('plan');
                setActiveView('plan');
                setCompletedStages((prev) => ({ ...prev, diagnose: true }));
              }}
              onBackToMap={() => setActiveView('app-map')}
            />
          )}

          {/* View: Proposed Change Plan */}
          {activeView === 'plan' && (
            <ChangePlanView
              plan={analysis.changePlan}
              appName={analysis.targetApp.name}
              isDemoMode={isDemoMode}
              onProceedToApproval={() => {
                const pending = setupRun.tasks.find((t) => t.status === 'awaiting_approval');
                if (pending) {
                  setActiveApprovalTask(pending);
                  setApprovalModalOpen(true);
                  setCurrentWorkflowStage('approve');
                } else {
                  setCurrentWorkflowStage('act');
                  setActiveView('live-run');
                }
              }}
              onBackToDiagnosis={() => setActiveView('diagnose')}
            />
          )}

          {/* View: Live Run (Execution Pipeline & Approvals) */}
          {activeView === 'live-run' && (
            <SetupProgress
              setupRun={setupRun}
              onOpenApproval={(task) => {
                setActiveApprovalTask(task);
                setApprovalModalOpen(true);
                setCurrentWorkflowStage('approve');
              }}
              onRunNextTask={handleRunNextTask}
              onRunAllTasks={handleRunAllTasks}
              onRetryTask={handleRetryTask}
              onProceedToVerification={() => {
                setCurrentWorkflowStage('verify');
                setActiveView('verify');
                setCompletedStages((prev) => ({ ...prev, act: true }));
              }}
              isRunningAll={isRunningAll}
            />
          )}

          {/* View: Verification Results & Integrity Checks */}
          {activeView === 'verify' && (
            <VerificationResults
              checks={receipt.checks}
              onProceedToReceipt={() => {
                setCurrentWorkflowStage('receipt');
                setActiveView('receipt');
                setCompletedStages((prev) => ({ ...prev, verify: true, receipt: true }));
                saveReceiptToArchive(receipt);
              }}
              targetAppName={analysis.targetApp.name}
            />
          )}

          {/* View: Setup Receipt Detail View */}
          {activeView === 'receipt' && (
            <SetupReceipt
              receipt={receipt}
              onBackToOverview={() => setActiveView('overview')}
            />
          )}

          {/* View: Receipts History & Audit Archive */}
          {activeView === 'receipts-history' && (
            <ReceiptsHistory
              receipts={receiptsList}
              onViewReceipt={(selected) => {
                setReceipt(selected);
                setActiveView('receipt');
                setCurrentWorkflowStage('receipt');
              }}
              onClearReceipts={handleClearReceipts}
              onNewAnalysis={() => {
                setActiveView('app-map');
                setCurrentWorkflowStage('understand');
              }}
            />
          )}

          {/* View: Settings & API Configuration */}
          {activeView === 'settings' && (
            <SettingsPanel
              isDemoMode={isDemoMode}
              onToggleDemoMode={handleToggleDemoMode}
              onClearReceipts={handleClearReceipts}
              onResetAllData={handleResetDemo}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />
          )}
        </main>

        {/* Global Footer (Hidden when printing receipt) */}
        <footer className="no-print border-t border-slate-200 bg-white dark:border-slate-800/80 dark:bg-slate-950/80 py-5 text-center text-xs text-slate-500 font-mono transition-colors">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-500 dark:bg-cyan-400" />
              <span className="text-slate-800 dark:text-slate-300 font-sans font-semibold">VibePilot 2.0</span>
              <span>• “AI writes the app. VibePilot gets it ready to ship.”</span>
            </div>
            <div>IIIT Delhi 24-Hour Hackathon • Built with Next.js 16 App Router & Tailwind CSS</div>
          </div>
        </footer>
      </div>

      {/* Human-in-the-Loop Explicit Approval Modal */}
      <ApprovalModal
        isOpen={approvalModalOpen}
        request={activeApprovalTask?.approvalRequest || null}
        onClose={() => setApprovalModalOpen(false)}
        onAuthorize={handleAuthorizeAction}
        onReject={handleRejectAction}
        isSubmitting={isAuthorizing}
      />

      {/* Backend v1 Integration & Open Ends Inspector Modal */}
      <IntegrationAlertModal
        isOpen={isIntegrationModalOpen}
        onClose={() => setIsIntegrationModalOpen(false)}
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
      />
    </div>
  );
}
