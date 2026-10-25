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
  Activity,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';

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
      {/* 1. Header Overview & Control Banner */}
      <div className="rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 backdrop-blur-2xl shadow-xl transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
                Stage 5 of 7: Live Pipeline Execution
              </span>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap mt-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
                Execution Pipeline
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.06]">
                Run ID: {setupRun.runId}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                setupRun.overallStatus === 'completed'
                  ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                  : setupRun.overallStatus === 'paused_for_approval'
                  ? 'bg-amber-500/15 text-amber-500 border-amber-500/30 animate-pulse'
                  : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
              }`}>
                {setupRun.overallStatus.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {pendingApprovalTask && (
              <button
                onClick={() => onOpenApproval(pendingApprovalTask)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/25 transition-all animate-pulse cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-slate-950" />
                <span>Review Approval Gate</span>
              </button>
            )}

            {!allCompleted && (
              <>
                <button
                  onClick={onRunNextTask}
                  disabled={isRunningAll || !!pendingApprovalTask}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-white/[0.06] transition-colors disabled:opacity-40 cursor-pointer"
                  title="Run next pending task"
                >
                  <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                  <span>Execute Next</span>
                </button>

                <button
                  onClick={onRunAllTasks}
                  disabled={isRunningAll || !!pendingApprovalTask}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-violet-500/20 transition-all disabled:opacity-40 cursor-pointer"
                  title="Run all automated tasks until completion or next approval"
                >
                  {isRunningAll ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing...</span>
                    </>
                  ) : (
                    <>
                      <FastForward className="w-3.5 h-3.5" />
                      <span>Run Pipeline</span>
                    </>
                  )}
                </button>
              </>
            )}

            <button
              onClick={onProceedToVerification}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Stage 6: Verify App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pipeline Progress Bar */}
        <div className="pt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Overall Pipeline Completion</span>
            <span className="text-slate-900 dark:text-white font-bold">{setupRun.progressPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-[#070b14] rounded-full overflow-hidden border border-slate-200 dark:border-white/[0.08]">
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${setupRun.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Main Split: Task List (Left) and Task Logs (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Task Sequence Cards */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between px-1 text-xs font-mono text-slate-400">
            <span className="uppercase tracking-wider font-bold">
              Task Sequence ({setupRun.tasks.length} Stages)
            </span>
            <span>Click to stream logs</span>
          </div>

          <div className="space-y-2.5">
            {setupRun.tasks.map((task) => {
              const isSelected = selectedTaskId === task.id;
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border text-left ${
                    isSelected
                      ? 'bg-violet-50/80 border-violet-400/80 dark:bg-white/[0.06] dark:border-cyan-400/80 shadow-lg dark:shadow-[0_0_16px_rgba(6,182,212,0.15)] ring-1 ring-violet-400 dark:ring-cyan-400/40'
                      : 'bg-white/80 dark:bg-[#0c101d]/60 border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12] hover:translate-y-[-1px]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {task.status === 'completed' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        )}
                        {task.status === 'running' && (
                          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                        )}
                        {task.status === 'awaiting_approval' && (
                          <ShieldAlert className="w-4 h-4 text-amber-500 animate-pulse" />
                        )}
                        {task.status === 'requires_manual_action' && (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                        {task.status === 'failed' && (
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                        )}
                        {task.status === 'pending' && (
                          <Clock className="w-4 h-4 text-slate-400" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{task.title}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.06]">
                            {task.category}
                          </span>
                          {task.isSensitive && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 font-bold">
                              Human Gate
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-mono uppercase font-bold block ${
                        task.status === 'completed' ? 'text-emerald-500' :
                        task.status === 'running' ? 'text-cyan-400' :
                        task.status === 'awaiting_approval' ? 'text-amber-500' :
                        task.status === 'failed' ? 'text-rose-500' : 'text-slate-400'
                      }`}>
                        {task.status.replace(/_/g, ' ')}
                      </span>
                      {task.durationMs && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {task.durationMs}ms
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Terminal Execution Log Timeline */}
        <div className="lg:col-span-6">
          <TaskLogViewer task={selectedTask} />
        </div>
      </div>
    </div>
  );
};
