'use client';

import React, { useState } from 'react';
import { Stage, DemoPreset, AppAnalysis, SetupRun, SetupTask, SetupReceipt as SetupReceiptType } from '@/lib/types';
import { DEMO_PRESETS } from '@/lib/demo-data';
import { VibePilotApi } from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { AppInput } from '@/components/AppInput';
import { AppMap } from '@/components/AppMap';
import { SetupProgress } from '@/components/SetupProgress';
import { ApprovalModal } from '@/components/ApprovalModal';
import { VerificationResults } from '@/components/VerificationResults';
import { SetupReceipt } from '@/components/SetupReceipt';

export default function Home() {
  const [selectedPreset, setSelectedPreset] = useState<DemoPreset>(DEMO_PRESETS[0]);
  const [currentStage, setCurrentStage] = useState<Stage>('understand');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  
  // Application Data State
  const [analysis, setAnalysis] = useState<AppAnalysis>(DEMO_PRESETS[0].analysisData);
  const [setupRun, setSetupRun] = useState<SetupRun>(DEMO_PRESETS[0].setupRunData);
  const [receipt, setReceipt] = useState<SetupReceiptType>(DEMO_PRESETS[0].receiptData);

  // Interaction State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState<boolean>(false);
  const [activeApprovalTask, setActiveApprovalTask] = useState<SetupTask | null>(null);
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);

  // Stage completion tracker for the top stepper
  const [completedStages, setCompletedStages] = useState<Record<Stage, boolean>>({
    understand: true,
    setup: false,
    verify: false,
    receipt: false,
  });

  // Handle Preset Selection
  const handleSelectPreset = (preset: DemoPreset) => {
    setSelectedPreset(preset);
    setAnalysis(JSON.parse(JSON.stringify(preset.analysisData)));
    setSetupRun(JSON.parse(JSON.stringify(preset.setupRunData)));
    setReceipt(JSON.parse(JSON.stringify(preset.receiptData)));
    setCurrentStage('understand');
    setCompletedStages({
      understand: true,
      setup: preset.setupRunData.overallStatus === 'completed',
      verify: false,
      receipt: false,
    });
  };

  // Reset Demo State
  const handleResetDemo = () => {
    handleSelectPreset(selectedPreset);
  };

  // Toggle Live vs Demo Mode
  const handleToggleDemoMode = () => {
    const nextMode = !isDemoMode;
    setIsDemoMode(nextMode);
    VibePilotApi.setDemoMode(nextMode);
  };

  // Step 1: Analyze App Action
  const handleAnalyze = async (appUrl: string, repoUrl?: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    const res = await VibePilotApi.analyzeApp(appUrl, repoUrl);
    setIsAnalyzing(false);

    if (res.data) {
      setAnalysis(res.data);
      setCompletedStages((prev) => ({ ...prev, understand: true }));
      if (res.error) {
        setAnalysisError(res.error);
      }
    } else {
      setAnalysisError(res.error || 'Failed to analyze application.');
    }
  };

  // Step 2: Run Next Pending Task
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

  // Step 2: Run All Tasks until approval or completion
  const handleRunAllTasks = async () => {
    setIsRunningAll(true);

    const currentTasks = [...setupRun.tasks];
    for (let i = 0; i < currentTasks.length; i++) {
      const task = currentTasks[i];
      if (task.status === 'awaiting_approval') {
        // Stop and open approval modal
        setActiveApprovalTask(task);
        setApprovalModalOpen(true);
        setIsRunningAll(false);
        return;
      }

      if (task.status === 'pending') {
        // Simulate execution latency
        await new Promise((resolve) => setTimeout(resolve, 500));
        handleRunNextTask();
      }
    }

    setIsRunningAll(false);
    setCompletedStages((prev) => ({ ...prev, setup: true }));
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

  // Step 2: Open Approval Modal
  const handleOpenApproval = (task: SetupTask) => {
    setActiveApprovalTask(task);
    setApprovalModalOpen(true);
  };

  // Authorize Sensitive Action
  const handleAuthorizeAction = async (taskId: string) => {
    setIsAuthorizing(true);
    await VibePilotApi.submitApproval(setupRun.runId, taskId, true);
    setIsAuthorizing(false);
    setApprovalModalOpen(false);

    // Update task to completed
    setSetupRun((prev) => {
      const tasks = prev.tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'completed' as const,
            durationMs: 720,
            logs: [
              ...t.logs,
              {
                timestamp: new Date().toISOString().substring(11, 23),
                level: 'info' as const,
                message: 'Human authorization granted. Executing approved migration script...',
              },
              {
                timestamp: new Date().toISOString().substring(11, 23),
                level: 'success' as const,
                message: 'Table public.documents and hnsw vector index created successfully.',
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
        overallStatus: 'running' as const,
      };
    });
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
            failureReason: 'User rejected DDL execution during human-in-the-loop review.',
            logs: [
              ...t.logs,
              {
                timestamp: new Date().toISOString().substring(11, 23),
                level: 'error' as const,
                message: 'Authorization rejected by operator. Aborted execution.',
              },
            ],
          };
        }
        return t;
      });
      return { ...prev, tasks, overallStatus: 'failed' as const };
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] text-slate-100">
      {/* Top Navigation */}
      <Navigation
        currentStage={currentStage}
        onSelectStage={(stage) => setCurrentStage(stage)}
        selectedPreset={selectedPreset}
        onSelectPreset={handleSelectPreset}
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
        onResetDemo={handleResetDemo}
        completedStages={completedStages}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stage 1: UNDERSTAND (App Input & App Map) */}
        {currentStage === 'understand' && (
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
                setCurrentStage('setup');
                setCompletedStages((prev) => ({ ...prev, understand: true }));
              }}
              isDemoData={isDemoMode}
            />
          </div>
        )}

        {/* Stage 2: SET UP (Pipeline, Logs & Approvals) */}
        {currentStage === 'setup' && (
          <div className="space-y-6">
            <SetupProgress
              setupRun={setupRun}
              onOpenApproval={handleOpenApproval}
              onRunNextTask={handleRunNextTask}
              onRunAllTasks={handleRunAllTasks}
              onRetryTask={handleRetryTask}
              onProceedToVerification={() => {
                setCurrentStage('verify');
                setCompletedStages((prev) => ({ ...prev, setup: true }));
              }}
              isRunningAll={isRunningAll}
            />
          </div>
        )}

        {/* Stage 3: VERIFY (Smoke Tests & Diagnostics) */}
        {currentStage === 'verify' && (
          <div className="space-y-6">
            <VerificationResults
              checks={receipt.checks}
              onProceedToReceipt={() => {
                setCurrentStage('receipt');
                setCompletedStages((prev) => ({ ...prev, verify: true, receipt: true }));
              }}
              targetAppName={analysis.targetApp.name}
            />
          </div>
        )}

        {/* Stage 4: SETUP RECEIPT (Printable Manifest) */}
        {currentStage === 'receipt' && (
          <div className="space-y-6">
            <SetupReceipt
              receipt={receipt}
              onBackToOverview={() => setCurrentStage('understand')}
            />
          </div>
        )}
      </main>

      {/* Approval Modal Gate */}
      <ApprovalModal
        isOpen={approvalModalOpen}
        request={activeApprovalTask?.approvalRequest || null}
        onClose={() => setApprovalModalOpen(false)}
        onAuthorize={handleAuthorizeAction}
        onReject={handleRejectAction}
        isSubmitting={isAuthorizing}
      />

      {/* Global Footer */}
      <footer className="no-print border-t border-slate-800/80 bg-slate-950/70 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span className="text-slate-400 font-sans font-semibold">VibePilot</span>
            <span>· “AI Built Your App. VibePilot Gets It Ready to Ship.”</span>
          </div>
          <div>IIIT Delhi 24-Hour Hackathon · Built with Next.js 16 App Router & Tailwind CSS</div>
        </div>
      </footer>
    </div>
  );
}
