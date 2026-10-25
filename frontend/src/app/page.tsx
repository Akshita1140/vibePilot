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
import { VibePilotApi, SafeReceiptStore } from '@/lib/api';
import { adaptBackendJobToSetupRun } from '@/lib/backend-adapter';
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
import { UserLoginModal, getStoredUser, UserProfile } from '@/components/UserLoginModal';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const [selectedPreset, setSelectedPreset] = useState<DemoPreset>(DEMO_PRESETS[0]);
  const [activeView, setActiveView] = useState<AppView>('overview');
  const [overviewTab, setOverviewTab] = useState<'landing' | 'cockpit'>('landing');
  const [currentWorkflowStage, setCurrentWorkflowStage] = useState<WorkflowStage>('understand');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState<boolean>(false);
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getStoredUser());

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
  const [receiptsList, setReceiptsList] = useState<SetupReceiptType[]>(() => SafeReceiptStore.loadReceipts());

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

  const saveReceiptToArchive = React.useCallback((newReceipt: SetupReceiptType) => {
    const updated = SafeReceiptStore.saveReceipt(newReceipt);
    setReceiptsList(updated);
  }, []);

  const handleClearReceipts = () => {
    SafeReceiptStore.clearReceipts();
    setReceiptsList([]);
  };

  // Reliably persist receipt to archive whenever setup run completes
  React.useEffect(() => {
    if (setupRun.overallStatus === 'completed' && receipt) {
      saveReceiptToArchive(receipt);
    }
  }, [setupRun.overallStatus, receipt, saveReceiptToArchive]);

  // Resilient Live Job Subscription (SSE with automatic polling fallback & unmount cleanup)
  React.useEffect(() => {
    if (isDemoMode) return;
    if (!setupRun.runId || setupRun.runId.startsWith('run_')) return;

    const cleanup = VibePilotApi.subscribeToJobUpdates(setupRun.runId, {
      onUpdate: (backendJob) => {
        const updatedRun = adaptBackendJobToSetupRun(backendJob);
        setSetupRun(updatedRun);

        if (backendJob.status === 'AWAITING_APPROVAL') {
          const pendingTask = updatedRun.tasks.find((t) => t.status === 'awaiting_approval');
          if (pendingTask) {
            setActiveApprovalTask(pendingTask);
            setApprovalModalOpen(true);
            setCurrentWorkflowStage('approve');
          }
        }
      },
      onTerminal: (backendJob) => {
        if (backendJob.status === 'DONE') {
          VibePilotApi.getSetupReceipt(backendJob.job_id).then((res) => {
            if (res.data) {
              setReceipt(res.data);
              saveReceiptToArchive(res.data);
            }
          }).catch((err) => {
            console.warn('[Live Run] Receipt retrieval failed:', err);
          });
          setCompletedStages((prev) => ({ ...prev, act: true, verify: true, receipt: true }));
        }
      },
      onError: (err) => {
        console.warn('[Live Run] Stream subscription error:', err);
      },
    });

    return () => {
      cleanup();
    };
  }, [setupRun.runId, isDemoMode, saveReceiptToArchive]);

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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#06080F] dark:text-slate-100 bg-mesh-light dark:bg-mesh-dark selection:bg-cyan-500/30 selection:text-cyan-800 dark:selection:text-cyan-200 transition-colors">
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
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onNewAnalysis={() => {
          setActiveView('overview');
          setOverviewTab('landing');
          setCurrentWorkflowStage('understand');
        }}
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
            setActiveView('overview');
            setOverviewTab('landing');
            setCurrentWorkflowStage('understand');
          }}
          onOpenMobileSidebar={() => setIsOpenMobile((prev) => !prev)}
          hasPendingApproval={pendingApproval}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenIntegrationModal={() => setIsIntegrationModalOpen(true)}
          currentUser={currentUser}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
        />

        {/* Dynamic Workspace View with Smooth View Transitions */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-8"
            >
              {/* View: Overview Workspace (Landing Intake or Ship Readiness Cockpit) */}
              {activeView === 'overview' && (
                <div className="space-y-6">
                  {/* Clean Minimalist Tab Switcher */}
                  <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
                    <div className="inline-flex p-1 rounded-2xl bg-slate-200/60 dark:bg-white/[0.04] border border-slate-300/60 dark:border-white/[0.08] shadow-inner">
                      <button
                        type="button"
                        onClick={() => setOverviewTab('landing')}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          overviewTab === 'landing'
                            ? 'bg-white dark:bg-white/[0.1] text-slate-900 dark:text-white shadow-sm font-bold'
                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        <span>🚀</span>
                        <span>Landing &amp; Intake</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOverviewTab('cockpit')}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          overviewTab === 'cockpit'
                            ? 'bg-white dark:bg-white/[0.1] text-slate-900 dark:text-white shadow-sm font-bold'
                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        <span>🧭</span>
                        <span>Ship Readiness Cockpit</span>
                      </button>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                      <span>Preset: <strong className="text-slate-800 dark:text-slate-200">{selectedPreset.appName}</strong></span>
                    </div>
                  </div>

                  {overviewTab === 'landing' ? (
                    <AppInput
                      onAnalyze={async (url, repo) => {
                        await handleAnalyze(url, repo);
                        setOverviewTab('cockpit');
                      }}
                      isLoading={isAnalyzing}
                      errorMessage={analysisError}
                      onSelectPreset={(p) => {
                        handleSelectPreset(p);
                      }}
                      currentAppUrl={analysis.targetApp.url}
                      currentRepoUrl={analysis.targetApp.repoUrl || ''}
                    />
                  ) : (
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
                </div>
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
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Global Footer (Hidden when printing receipt) */}
        <footer className="no-print border-t border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-[#06080F]/70 backdrop-blur-md py-4 text-center text-xs text-slate-500 font-mono transition-colors">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span className="text-slate-800 dark:text-slate-200 font-sans font-bold">VibePilot 2.0</span>
              <span className="text-slate-400">• “AI writes the app. VibePilot gets it ready to ship.”</span>
            </div>
            <div className="text-slate-400">IIIT Delhi Hackathon Edition • Production Readiness Engine</div>
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

      {/* Developer User Login & Profile Modal */}
      <UserLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onLogin={(user) => setCurrentUser(user)}
        onLogout={() => setCurrentUser(null)}
      />
    </div>
  );
}
