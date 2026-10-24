'use client';

import React, { useState } from 'react';
import { SetupTask } from '@/lib/types';
import { Terminal, Copy, Check, Filter } from 'lucide-react';

interface TaskLogViewerProps {
  task: SetupTask | null;
}

export const TaskLogViewer: React.FC<TaskLogViewerProps> = ({ task }) => {
  const [copied, setCopied] = useState(false);
  const [levelFilter, setLevelFilter] = useState<'all' | 'error' | 'warn'>('all');

  if (!task) {
    return (
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-6 text-center">
        <Terminal className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-xs font-mono text-slate-400">Select a setup task to view detailed execution logs.</p>
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
    <div className="bg-slate-950/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full min-h-[380px]">
      {/* Log Header */}
      <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-semibold text-slate-200 truncate max-w-[220px] sm:max-w-xs">
            Logs: {task.title}
          </span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase border ${
            task.status === 'completed'
              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
              : task.status === 'running'
              ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
              : task.status === 'awaiting_approval'
              ? 'bg-amber-950 text-amber-400 border-amber-800'
              : task.status === 'requires_manual_action'
              ? 'bg-orange-950 text-orange-400 border-orange-800'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {task.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Level Filter */}
          <div className="flex items-center gap-1 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-[10px] font-mono">
            <Filter className="w-3 h-3 text-slate-500" />
            <button
              onClick={() => setLevelFilter('all')}
              className={`px-1 rounded ${levelFilter === 'all' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              All
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => setLevelFilter('warn')}
              className={`px-1 rounded ${levelFilter === 'warn' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Warn
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => setLevelFilter('error')}
              className={`px-1 rounded ${levelFilter === 'error' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Error
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono transition-colors"
            title="Copy logs to clipboard"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Log Terminal Window */}
      <div className="p-3 font-mono text-[11px] leading-relaxed overflow-y-auto flex-1 space-y-1.5 select-text bg-[#070B12]">
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 italic py-8 text-center">
            {task.status === 'pending'
              ? 'Task queued. Logs will stream here once execution begins.'
              : 'No log output matching the active filter.'}
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2 group hover:bg-slate-900/40 px-1 py-0.5 rounded">
              <span className="text-slate-600 select-none shrink-0 font-mono text-[10px]">
                {log.timestamp}
              </span>
              <span className={`px-1 rounded text-[9px] font-bold uppercase shrink-0 ${
                log.level === 'info'
                  ? 'bg-blue-950/60 text-blue-400'
                  : log.level === 'warn'
                  ? 'bg-amber-950/70 text-amber-300'
                  : log.level === 'error'
                  ? 'bg-rose-950/70 text-rose-300'
                  : 'bg-emerald-950/60 text-emerald-300'
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

        {/* Failure reason callout if present */}
        {task.failureReason && (
          <div className="mt-3 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 space-y-1">
            <div className="font-semibold text-xs text-rose-200">Execution Blocked / Action Required:</div>
            <div>{task.failureReason}</div>
            {task.suggestedFix && (
              <div className="text-[10px] text-slate-300 mt-1 font-sans">
                <span className="font-semibold text-amber-300">Suggested Action: </span>
                {task.suggestedFix}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
