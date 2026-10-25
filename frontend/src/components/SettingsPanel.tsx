'use client';

import React, { useState } from 'react';
import { 
  Settings2, 
  Activity, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Globe,
  Sun,
  Moon,
  Info,
  AlertTriangle,
  Server,
  Zap,
  RotateCcw
} from 'lucide-react';
import { Theme } from '@/lib/types';
import { BACKEND_V1_OPEN_ENDS } from '@/lib/backend-adapter';

interface SettingsPanelProps {
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onClearReceipts: () => void;
  onResetAllData: () => void;
  theme?: Theme;
  onToggleTheme?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isDemoMode,
  onToggleDemoMode,
  onClearReceipts,
  onResetAllData,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [apiUrl, setApiUrl] = useState(
    typeof window !== 'undefined' 
      ? localStorage.getItem('vibepilot_api_url') || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      : 'http://localhost:8000'
  );
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSaveApiUrl = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vibepilot_api_url', apiUrl.trim());
    }
    setPingResult({ success: true, message: 'API Base URL successfully saved to local session storage.' });
    setTimeout(() => setPingResult(null), 3000);
  };

  const handleTestConnection = async () => {
    setIsPinging(true);
    setPingResult(null);

    const startTime = Date.now();
    try {
      const target = apiUrl.trim().replace(/\/$/, '');
      const response = await fetch(`${target}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      }).catch(() => fetch(`${target}/api/health`));

      const duration = Date.now() - startTime;
      if (response && response.ok) {
        setPingResult({
          success: true,
          message: `Connected successfully! HTTP ${response.status} (${duration}ms ping latency)`,
        });
      } else {
        setPingResult({
          success: false,
          message: `Host reachable but responded with HTTP ${response?.status || 'Unknown'} (${duration}ms)`,
        });
      }
    } catch (err: unknown) {
      const duration = Date.now() - startTime;
      const msg = err instanceof Error ? err.message : 'Connection refused';
      setPingResult({
        success: false,
        message: `Connection failed after ${duration}ms: ${msg}. If external backend is offline, active Demo Mode ensures full verification fidelity for presentations.`,
      });
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header Overview Banner */}
      <div className="rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 backdrop-blur-2xl shadow-xl transition-colors duration-200">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200/80 dark:border-white/[0.06]">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
            <Settings2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
              Settings &amp; Telemetry Gateway
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Configure backend bridge, presentation telemetry, and local cache.
            </p>
          </div>
        </div>

        {/* Section 1: Appearance & Theme */}
        <div className="py-5 border-b border-slate-200/80 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Interface Theme</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Switch between deep space dark mode and clean daylight slate.
            </p>
          </div>

          {onToggleTheme && (
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => {
                  if (theme !== 'light') onToggleTheme();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-violet-700 shadow-sm border border-slate-200 font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (theme !== 'dark') onToggleTheme();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-900 text-cyan-300 shadow-sm border border-white/[0.1] font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-violet-400" />
                <span>Dark</span>
              </button>
            </div>
          )}
        </div>

        {/* Section 2: Mode Toggle */}
        <div className="py-5 border-b border-slate-200/80 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Engine Execution Mode</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Switch between offline deterministic fixtures and real connected backend.
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleDemoMode}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer ${
              isDemoMode
                ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
            }`}
          >
            {isDemoMode ? 'SWITCH TO LIVE BACKEND' : 'SWITCH TO DEMO FIXTURES'}
          </button>
        </div>

        {/* Section 3: Backend Bridge API Base URL */}
        <div className="py-5 border-b border-slate-200/80 dark:border-white/[0.06] space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Backend Orchestrator Base URL</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Specify the target URL for your backend server.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:8000"
              className="flex-1 px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              type="button"
              onClick={handleSaveApiUrl}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-white/[0.06] transition-colors cursor-pointer"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isPinging}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPinging ? 'Pinging...' : 'Test Ping'}
            </button>
          </div>

          {pingResult && (
            <div className={`p-3 rounded-xl text-xs font-mono border ${
              pingResult.success ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
            }`}>
              {pingResult.message}
            </div>
          )}
        </div>

        {/* Section 4: Local Storage Cache Management */}
        <div className="pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Local Cache Management</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Reset stored certificates, theme preferences, and demo states.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClearReceipts}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-white/[0.06] transition-colors cursor-pointer"
            >
              Clear Receipts
            </button>
            <button
              type="button"
              onClick={onResetAllData}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 text-xs font-medium border border-rose-500/30 transition-colors cursor-pointer"
            >
              Reset All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
