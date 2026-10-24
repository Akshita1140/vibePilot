'use client';

import React, { useState } from 'react';
import { SetupTask } from '@/lib/types';
import { Terminal, Copy, Check, Filter, AlertTriangle, ShieldAlert, Wrench } from 'lucide-react';

interface TaskLogViewerProps {
  task: SetupTask | null;
}

export const TaskLogViewer: React.FC<TaskLogViewerProps> = ({ task }) => {
  const [copied, setCopied] = useState(false);
  const [levelFilter, setLevelFilter] = useState<'all' | 'error' | 'warn'>('all');

  if (!task) {
    return (
      <div className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm">
        <Terminal className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
        <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">No Task Selected</h4>
        <p className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 mt-1">Select a task in the pipeline to stream stdout/stderr execution logs.</p>
      </div>
    );
  }

  const logs = task.logs || [];
  const filteredLogs = logs.filter((log) => {
    if (levelFilter === 'all') return true;
    return log.level === levelFilter;
  });

  const handleCopy = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 rounded-2xl overflow-hidden dark:shadow-xl flex flex-col h-full min-h-[440px] transition-colors border">
      {/* Log Header */}
      <div className="bg-slate-50 px-4 sm:px-5 py-3.5 border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-slate-100 truncate max-w-[200px] sm:max-w-xs">
            Logs: {task.title}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs font-mono uppercase font-bold border ${
            task.status === 'completed'
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
              : task.status === 'running'
              ? 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-400 dark:border-cyan-800'
              : task.status === 'awaiting_approval'
              ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800'
              : task.status === 'requires_manual_action'
              ? 'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800'
              : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
          }`}>
            {task.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Level Filter */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-mono">
            <Filter className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            <button
              onClick={() => setLevelFilter('all')}
              className={`px-1.5 py-0.5 rounded transition-colors ${levelFilter === 'all' ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/50' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              All
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              onClick={() => setLevelFilter('warn')}
              className={`px-1.5 py-0.5 rounded transition-colors ${levelFilter === 'warn' ? 'text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/50' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              Warn
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              onClick={() => setLevelFilter('error')}
              className={`px-1.5 py-0.5 rounded transition-colors ${levelFilter === 'error' ? 'text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/50' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              Error
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white text-xs font-mono font-medium transition-colors border border-slate-200 dark:border-slate-700"
            title="Copy logs to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Log Terminal Window */}
      <div className="p-4 font-mono text-xs sm:text-sm leading-relaxed overflow-y-auto flex-1 space-y-2 select-text bg-[#090d16] text-slate-200">
        {filteredLogs.length === 0 ? (
          <div className="text-slate-500 italic py-12 text-center text-xs sm:text-sm">
            {task.status === 'pending'
              ? 'Task queued. Real-time stdout/stderr will stream here once execution begins.'
              : 'No log output matching the selected filter.'}
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2.5 group hover:bg-slate-900/80 px-2 py-1 rounded">
              <span className="text-slate-500 select-none shrink-0 font-mono text-xs">
                {log.timestamp}
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[11px] font-bold uppercase shrink-0 font-mono ${
                log.level === 'info'
                  ? 'bg-blue-950/80 text-blue-300 border border-blue-900/60'
                  : log.level === 'warn'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-900/60'
                  : log.level === 'error'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-900/60'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-900/60'
              }`}>
                {log.level}
              </span>
              <span className={`break-all ${
                log.level === 'error'
                  ? 'text-rose-300'
                  : log.level === 'warn'
                  ? 'text-amber-200'
                  : log.level === 'success'
                  ? 'text-emerald-300'
                  : 'text-slate-300'
              }`}>
                {log.message}
              </span>
            </div>
          ))
        )}

        {/* Diagnosed Error Callout if present */}
        {task.failureReason && (
          <div className="mt-4 p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 space-y-2">
            <div className="font-bold text-xs sm:text-sm text-rose-200 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Diagnosed Runtime Exception:</span>
            </div>
            <div className="text-xs sm:text-sm leading-relaxed">{task.failureReason}</div>
            {task.suggestedFix && (
              <div className="text-xs sm:text-sm text-slate-200 mt-2 font-sans bg-slate-950 p-3 rounded-lg border border-rose-900/60">
                <span className="font-semibold text-amber-300">Automated Fix: </span>
                {task.suggestedFix}
              </div>
            )}
          </div>
        )}

        {/* Guided Manual Action callout */}
        {task.status === 'requires_manual_action' && !task.failureReason && (
          <div className="mt-4 p-4 rounded-xl bg-orange-950/80 border border-orange-800 text-orange-200 space-y-2">
            <div className="font-bold text-xs sm:text-sm text-orange-300 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-orange-400" />
              <span>Guided Manual Operator Step:</span>
            </div>
            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">{task.description}</div>
            {task.suggestedFix && (
              <div className="text-xs sm:text-sm text-amber-200 mt-2 font-sans bg-slate-950 p-3 rounded-lg border border-orange-900/60">
                <span className="font-semibold text-amber-300">Action Guide: </span>
                {task.suggestedFix}
              </div>
            )}
          </div>
        )}

        {/* Sensitive Approval Gate callout */}
        {task.status === 'awaiting_approval' && task.approvalRequest && (
          <div className="mt-4 p-4 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-200 space-y-2">
            <div className="font-bold text-xs sm:text-sm text-amber-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Sensitive Step Paused for Authorization
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-900 text-amber-200 uppercase font-bold">
                {task.approvalRequest.riskLevel} Risk
              </span>
            </div>
            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">{task.approvalRequest.description}</div>
            <div className="font-mono text-xs sm:text-sm text-emerald-400 bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto shadow-inner">
              <code>{task.approvalRequest.commandPreview}</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
