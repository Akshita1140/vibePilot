'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SetupTask, TaskLogEntry } from '@/lib/types';
import { 
  Copy, 
  Check, 
  Clock, 
  Terminal, 
  AlertTriangle, 
  ShieldAlert, 
  Wrench,
  Code2,
  Sparkles,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskLogViewerProps {
  task: SetupTask | null;
}

interface TimelineEvent {
  type: 'SYSTEM' | 'THOUGHT' | 'ACTION' | 'OBSERVE' | 'ERROR' | 'WARN' | 'INFO';
  timestamp: string;
  title: string;
  detail?: string;
  level: 'info' | 'warn' | 'error' | 'success';
  isSynthetic?: boolean;
}

function parseLogToTimelineEvent(log: TaskLogEntry, idx: number, total: number): TimelineEvent {
  const isSynthetic = 
    log.message.includes('[Synthetic') || 
    log.message.includes('[Simulated') || 
    Boolean(log.detail && (log.detail.includes('[Synthetic') || log.detail.includes('[Simulated')));

  if (log.type && log.detail) {
    return {
      type: log.type,
      timestamp: log.timestamp,
      title: log.message,
      detail: log.detail,
      level: log.level,
      isSynthetic,
    };
  }

  const raw = log.message.trim();
  let type: TimelineEvent['type'] = 'SYSTEM';
  let title = raw;
  let detail = log.commandSnippet;

  if (raw.includes(' | ')) {
    const parts = raw.split(' | ');
    title = parts[0].trim();
    detail = parts.slice(1).join(' | ').trim();
  }

  if (title.toUpperCase().startsWith('SYSTEM:')) {
    type = 'SYSTEM';
    title = title.substring(7).trim();
  } else if (title.toUpperCase().startsWith('THOUGHT:')) {
    type = 'THOUGHT';
    title = title.substring(8).trim();
  } else if (title.toUpperCase().startsWith('ACTION:')) {
    type = 'ACTION';
    title = title.substring(7).trim();
  } else if (title.toUpperCase().startsWith('OBSERVE:')) {
    type = 'OBSERVE';
    title = title.substring(8).trim();
  } else if (log.level === 'error' || title.toLowerCase().includes('error')) {
    type = 'ERROR';
  } else if (log.level === 'warn') {
    type = 'WARN';
  } else {
    const lower = title.toLowerCase();
    if (lower.startsWith('navigat') || lower.startsWith('goal') || lower.startsWith('locat') || lower.startsWith('evaluat') || lower.startsWith('check')) {
      type = 'THOUGHT';
    } else if (lower.startsWith('open') || lower.startsWith('click') || lower.startsWith('select') || lower.startsWith('add') || lower.startsWith('execut') || lower.startsWith('run')) {
      type = 'ACTION';
    } else if (lower.startsWith('edit') || lower.startsWith('load') || lower.startsWith('dom') || lower.startsWith('confirm') || lower.startsWith('verif') || lower.startsWith('return') || lower.startsWith('detect')) {
      type = 'OBSERVE';
    } else if (idx === 0) {
      type = 'SYSTEM';
    } else if (idx === total - 1 && log.level === 'success') {
      type = 'SYSTEM';
    }
  }

  return {
    type,
    timestamp: log.timestamp,
    title,
    detail,
    level: log.level,
    isSynthetic,
  };
}

export const TaskLogViewer: React.FC<TaskLogViewerProps> = ({ task }) => {
  const [copied, setCopied] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of log stream
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [task?.logs]);

  if (!task) {
    return (
      <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 p-8 text-center shadow-xl backdrop-blur-2xl">
        <Terminal className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Stage Selected</h4>
        <p className="text-xs text-slate-500 font-mono mt-1">
          Select a task in the pipeline to stream live execution events.
        </p>
      </div>
    );
  }

  const logs = task.logs || [];
  const timelineEvents: TimelineEvent[] = logs.map((log, idx) =>
    parseLogToTimelineEvent(log, idx, logs.length)
  );

  const handleCopy = () => {
    const text = timelineEvents
      .map((ev) => `[${ev.timestamp}] ${ev.type} | ${ev.title}${ev.detail ? ` (${ev.detail})` : ''}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const durationSeconds = task.durationMs ? Math.round(task.durationMs / 1000) : 14;
  const formattedDuration = `00:${durationSeconds < 10 ? `0${durationSeconds}` : durationSeconds}`;

  const statusSubtitle =
    task.status === 'completed'
      ? `Completed in ${task.durationMs || 910}ms`
      : task.status === 'awaiting_approval'
      ? 'Paused at Authorization Gate · 14s ago'
      : task.status === 'running'
      ? 'Live execution stream active'
      : task.status === 'failed'
      ? 'Execution stopped · Diagnostic exception'
      : 'Queued · Ready to execute';

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 shadow-xl backdrop-blur-2xl flex flex-col h-full overflow-hidden transition-colors">
      {/* 1. Terminal Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-slate-800 dark:text-slate-200 font-bold">
            Execution Log
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/[0.06]">
            {timelineEvents.length} events
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-xs font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.06] transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* 2. Active Stage Banner */}
      <div className="p-4 sm:p-5 bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-white/[0.08] flex items-center justify-center text-cyan-400 font-mono text-xs font-bold shrink-0">
            &gt;_
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              {task.title}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {statusSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-white/[0.04] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/[0.06] shrink-0">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{formattedDuration}</span>
        </div>
      </div>

      {/* 3. Terminal Log Stream with line fade-in and auto-scroll */}
      <div 
        ref={logContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 font-mono text-xs max-h-[460px] scrollbar-thin"
      >
        {timelineEvents.map((event, i) => {
          const badgeConfig = {
            SYSTEM: { label: 'text-violet-400 bg-violet-500/10 border-violet-500/30' },
            THOUGHT: { label: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
            ACTION: { label: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
            OBSERVE: { label: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
            ERROR: { label: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
            WARN: { label: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
            INFO: { label: 'text-slate-400 bg-slate-500/10 border-slate-500/30' },
          }[event.type];

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15, delay: Math.min(i * 0.03, 0.4) }}
              className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase border ${badgeConfig.label}`}>
                    {event.type}
                  </span>
                  {/* HARD RULE #4: Synthetic evidence tag */}
                  {event.isSynthetic && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
                      synthetic / fallback
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                  {event.timestamp}
                </span>
              </div>

              <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 font-sans leading-snug">
                {event.title}
              </div>

              {event.detail && (
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-[#05070d] p-2 rounded-lg border border-white/[0.06] overflow-x-auto">
                  {event.detail}
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Terminal Blinking Cursor */}
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 pt-2 px-1">
          <span>&gt;</span>
          <span className="w-2 h-4 bg-cyan-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
