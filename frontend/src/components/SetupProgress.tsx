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
  FastForward
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

  const selectedTask = setupRun.tasks.find((t) => t.id === selectedTaskId) || setupRun.tasks[0];
  const pendingApprovalTask = setupRun.tasks.find((t) => t.status === 'awaiting_approval');
  const allCompleted = setupRun.tasks.every(
    (t) => t.status === 'completed' || t.status === 'requires_manual_action'
  );

  return (
    <div className="space-y-6">
      {/* Run Header & Progress Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-tight">Step 2: Execution & Setup Pipeline</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                Run: {setupRun.runId}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${
                setupRun.overallStatus === 'completed'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  : setupRun.overallStatus === 'paused_for_approval'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                  : 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
              }`}>
                {setupRun.overallStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Executing staged orchestration tasks. Sensitive actions pause automatically for human authorization.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {pendingApprovalTask && (
              <button
                onClick={() => onOpenApproval(pendingApprovalTask)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-md shadow-amber-600/30 transition-all animate-pulse"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Review Approval Gate</span>
              </button>
            )}

            {!allCompleted && (
              <>
                <button
                  onClick={onRunNextTask}
                  disabled={isRunningAll || !!pendingApprovalTask}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-40"
                  title="Run next pending task"
                >
                  <Play className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Execute Next Task</span>
                </button>

                <button
                  onClick={onRunAllTasks}
                  disabled={isRunningAll || !!pendingApprovalTask}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20 transition-all disabled:opacity-40"
                  title="Run all automated tasks until completion or next approval"
                >
                  {isRunningAll ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Running Pipeline...</span>
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
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-md shadow-emerald-600/20 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify Application</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Overall Pipeline Progress</span>
            <span className="text-white font-bold">{setupRun.progressPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
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
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Task Pipeline ({setupRun.tasks.length} Stages)
            </span>
            <span className="text-[11px] text-slate-500">Click a task to inspect logs</span>
          </div>

          <div className="space-y-2.5">
            {setupRun.tasks.map((task) => {
              const isSelected = selectedTaskId === task.id;
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`cursor-pointer rounded-xl p-3.5 transition-all border text-left ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500/80 ring-1 ring-indigo-500/30 shadow-md shadow-indigo-950/50'
                      : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Status Icon */}
                      <div className="mt-0.5 shrink-0">
                        {task.status === 'completed' && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        )}
                        {task.status === 'running' && (
                          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                        )}
                        {task.status === 'awaiting_approval' && (
                          <ShieldAlert className="w-5 h-5 text-amber-400 animate-pulse" />
                        )}
                        {task.status === 'requires_manual_action' && (
                          <AlertCircle className="w-5 h-5 text-orange-400" />
                        )}
                        {task.status === 'failed' && (
                          <AlertCircle className="w-5 h-5 text-rose-400" />
                        )}
                        {task.status === 'pending' && (
                          <Clock className="w-5 h-5 text-slate-600" />
                        )}
                      </div>

                      {/* Title & Description */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-white">{task.title}</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-slate-800 text-slate-400 border border-slate-700">
                            {task.category}
                          </span>
                          {task.isSensitive && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono text-amber-400 bg-amber-950/50 border border-amber-800/60">
                              Sensitive Action
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{task.description}</p>
                      </div>
                    </div>

                    {/* Right Status Badge */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${
                        task.status === 'completed'
                          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                          : task.status === 'running'
                          ? 'bg-cyan-950/70 text-cyan-300 border-cyan-800/60'
                          : task.status === 'awaiting_approval'
                          ? 'bg-amber-950/70 text-amber-300 border-amber-800/60'
                          : task.status === 'requires_manual_action'
                          ? 'bg-orange-950/70 text-orange-300 border-orange-800/60'
                          : task.status === 'failed'
                          ? 'bg-rose-950/70 text-rose-300 border-rose-800/60'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}>
                        {task.status.replace(/_/g, ' ')}
                      </span>

                      {task.durationMs && (
                        <span className="text-[10px] font-mono text-slate-500">
                          {task.durationMs}ms
                        </span>
                      )}
                    </div>
                  </div>

                    {/* Quick Trigger Button inside card if Awaiting Approval or Failed */}
                    {task.status === 'awaiting_approval' && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-amber-300">
                          Pending confirmation before executing DDL migration.
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenApproval(task);
                          }}
                          className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-medium transition-colors"
                        >
                          Review & Authorize
                        </button>
                      </div>
                    )}

                    {task.status === 'failed' && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-rose-300">
                          Execution encountered an error.
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRetryTask(task.id);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                        >
                          <RotateCcw className="w-3 h-3 text-cyan-400" />
                          <span>Retry</span>
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
