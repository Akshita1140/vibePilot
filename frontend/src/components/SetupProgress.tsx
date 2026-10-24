'use client';

import React, { useState } from 'react';
import { SetupRun, SetupTask } from '@/lib/types';
import { TaskLogViewer } from './TaskLogViewer';
import { 
  Play, 
  RotateCcw, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  FastForward,
  Info,
  ChevronDown,
  ChevronUp,
  Terminal,
  Activity
} from 'lucide-react';

interface SetupProgressProps {
  setupRun: SetupRun;
  onOpenApproval: (task: SetupTask) => void;
  onRunNextTask: () => void;
  onRunAllTasks: () => void;
  onRetryTask: (taskId: string) => void;
  onProceedToVerification: () => void;
  isRunningAll: boolean;
}

export const SetupProgress: React.FC<SetupProgressProps> = ({
  setupRun,
  onOpenApproval,
  onRunNextTask,
  onRunAllTasks,
  onRetryTask,
  onProceedToVerification,
  isRunningAll,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    setupRun.currentTaskId || setupRun.tasks[0]?.id || ''
  );
  const [showLiveExplainer, setShowLiveExplainer] = useState<boolean>(true);

  const selectedTask = setupRun.tasks.find((t) => t.id === selectedTaskId) || setupRun.tasks[0];
  const pendingApprovalTask = setupRun.tasks.find((t) => t.status === 'awaiting_approval');
  const allCompleted = setupRun.tasks.every(
    (t) => t.status === 'completed' || t.status === 'requires_manual_action'
  );

  return (
    <div className="space-y-6">
      {/* Contextual Explainer Banner: Priority 4 */}
      <div className="bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-transparent border border-cyan-200/80 dark:border-cyan-900/50 rounded-2xl p-5 sm:p-6 transition-colors duration-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 shrink-0 mt-0.5">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Stage 5: Live Run Automation & Orchestration Pipeline
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300 font-mono font-semibold">
                  Live Execution
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                VibePilot executes environment setups, CLI commands, and database migrations in an ordered, dependency-aware pipeline. Each step streams stdout/stderr and pauses at sensitive security gates.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowLiveExplainer(!showLiveExplainer)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            aria-label={showLiveExplainer ? 'Collapse explanation' : 'Expand explanation'}
          >
            {showLiveExplainer ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {showLiveExplainer && (
          <div className="mt-4 pt-4 border-t border-cyan-200/60 dark:border-cyan-900/40 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
            <div className="bg-white/70 dark:bg-slate-950/50 p-3.5 rounded-xl border border-cyan-100 dark:border-cyan-900/30 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                1. Ordered Execution
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Tasks run sequentially. You can step through with &ldquo;Execute Next Task&rdquo; or auto-advance with &ldquo;Run Pipeline&rdquo;.
              </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-950/50 p-3.5 rounded-xl border border-cyan-100 dark:border-cyan-900/30 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                2. Approval Gate Safeguard
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                When a sensitive key rotation or migration is reached, execution pauses automatically until you review and authorize.
              </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-950/50 p-3.5 rounded-xl border border-cyan-100 dark:border-cyan-900/30 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                3. Verification Transition
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Once tasks conclude, proceed directly to &ldquo;Verify Application&rdquo; for synthetic health probes and receipt signing.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Run Header & Progress Bar */}
      <div className="bg-white border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-5 sm:p-6 transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-500 dark:bg-cyan-400" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Live Run: Orchestration Pipeline
              </h2>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                Run ID: {setupRun.runId}
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-mono uppercase font-bold border ${
                setupRun.overallStatus === 'completed'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                  : setupRun.overallStatus === 'paused_for_approval'
                  ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800'
                  : 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-800'
              }`}>
                {setupRun.overallStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Executing staged configuration tasks. Sensitive actions pause automatically for human authorization.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {pendingApprovalTask && (
              <button
                onClick={() => onOpenApproval(pendingApprovalTask)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/30 transition-all animate-pulse focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Review Approval Gate</span>
              </button>
            )}

            {!allCompleted && (
              <>
                <button
                  onClick={onRunNextTask}
                  disabled={isRunningAll || !!pendingApprovalTask}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold dark:border-slate-700 transition-colors disabled:opacity-40"
                  title="Run next pending task"
                >
                  <Play className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Execute Next Task</span>
                </button>

                <button
                  onClick={onRunAllTasks}
                  disabled={isRunningAll || !!pendingApprovalTask}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/25 transition-all disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  title="Run all automated tasks until completion or next approval"
                >
                  {isRunningAll ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Running Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <FastForward className="w-4 h-4" />
                      <span>Run Pipeline</span>
                    </>
                  )}
                </button>
              </>
            )}

            <button
              onClick={onProceedToVerification}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/25 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Application</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-5 space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-slate-600 dark:text-slate-400">
            <span>Overall Pipeline Completion</span>
            <span className="text-slate-900 dark:text-white font-bold">{setupRun.progressPercentage}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${setupRun.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Split: Task List (Left) and Task Logs (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Task Sequence Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs sm:text-sm font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
              Task Pipeline ({setupRun.tasks.length} Stages)
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Click any stage to inspect live stdout/stderr</span>
          </div>

          <div className="space-y-3">
            {setupRun.tasks.map((task) => {
              const isSelected = selectedTaskId === task.id;
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`cursor-pointer rounded-2xl p-4 sm:p-5 transition-all border text-left ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/30 shadow-md dark:bg-slate-900 dark:border-indigo-500 dark:ring-indigo-500/30'
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-900/70 dark:border-slate-800 dark:hover:bg-slate-900 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      {/* Status Icon */}
                      <div className="mt-0.5 shrink-0">
                        {task.status === 'completed' && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                        )}
                        {task.status === 'running' && (
                          <Loader2 className="w-5 h-5 text-cyan-500 dark:text-cyan-400 animate-spin" />
                        )}
                        {task.status === 'awaiting_approval' && (
                          <ShieldAlert className="w-5 h-5 text-amber-500 dark:text-amber-400 animate-pulse" />
                        )}
                        {task.status === 'requires_manual_action' && (
                          <AlertCircle className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                        )}
                        {task.status === 'failed' && (
                          <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                        )}
                        {task.status === 'pending' && (
                          <Clock className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                        )}
                      </div>

                      {/* Title & Description */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{task.title}</span>
                          <span className="px-2 py-0.5 rounded text-xs font-mono uppercase bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 font-semibold">
                            {task.category}
                          </span>
                          {task.isSensitive && (
                            <span className="px-2 py-0.5 rounded text-xs font-mono text-amber-900 bg-amber-50 border border-amber-300 dark:text-amber-300 dark:bg-amber-950/60 dark:border-amber-800 font-bold">
                              Human Gate
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{task.description}</p>
                      </div>
                    </div>

                    {/* Right Status Badge */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-mono uppercase font-bold border ${
                        task.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60'
                          : task.status === 'running'
                          ? 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-800/60'
                          : task.status === 'awaiting_approval'
                          ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/60'
                          : task.status === 'requires_manual_action'
                          ? 'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-800/60'
                          : task.status === 'failed'
                          ? 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/60'
                          : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                      }`}>
                        {task.status.replace(/_/g, ' ')}
                      </span>

                      {task.durationMs && (
                        <span className="text-xs font-mono text-slate-500">
                          {task.durationMs}ms
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Trigger Button inside card if Awaiting Approval or Failed */}
                  {task.status === 'awaiting_approval' && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
                        Requires human verification gate confirmation before applying changes.
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenApproval(task);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        Review & Authorize
                      </button>
                    </div>
                  )}

                  {task.status === 'failed' && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-medium text-rose-800 dark:text-rose-300">
                        Task encountered an unhandled exception during automation.
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRetryTask(task.id);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-semibold dark:border-transparent transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                        <span>Retry Task</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Log Viewer for Selected Task */}
        <div className="lg:col-span-5 sticky top-24">
          <TaskLogViewer task={selectedTask} />
        </div>
      </div>
    </div>
  );
};
