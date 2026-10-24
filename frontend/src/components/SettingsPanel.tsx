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
  Info
} from 'lucide-react';
import { Theme } from '@/lib/types';

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
      {/* Contextual Explainer Banner: Priority 4 */}
      <div className="bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-transparent border border-cyan-200/80 dark:border-cyan-900/50 rounded-2xl p-5 sm:p-6 transition-colors duration-200">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              System Configuration & Integration Gateway
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              VibePilot acts as the bridge between your AI-generated code repository and cloud infrastructure. Configure how VibePilot interacts with real cluster endpoints or deterministic presentation telemetry.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Header & Body */}
      <div className="bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-5 sm:p-7 dark:shadow-xl transition-colors duration-200">
        <div className="flex items-center gap-3 pb-5 border-b border-slate-200 dark:border-slate-800">
          <Settings2 className="w-6 h-6 text-indigo-600 dark:text-cyan-400" />
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Settings & Preferences
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Configure connection parameters, interface theme, and audit cache.
            </p>
          </div>
        </div>

        {/* Section 1: Appearance & Theme Mode */}
        <div className="py-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Product Theme & Appearance</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Switch between high-contrast developer Dark Mode and soft clean Light Mode.
              </p>
            </div>

            {onToggleTheme && (
              <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (theme !== 'light') onToggleTheme();
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    theme === 'light'
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200 font-bold'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (theme !== 'dark') onToggleTheme();
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Dark Mode</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Operation Mode */}
        <div className="py-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Execution Telemetry Mode</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Toggle between deterministic sample data for presentations and real live backend orchestration.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs sm:text-sm font-mono font-bold ${isDemoMode ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {isDemoMode ? 'Verified Demo Telemetry' : 'Live Connected Backend'}
              </span>
              <button
                type="button"
                onClick={onToggleDemoMode}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  !isDemoMode ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-800 border border-slate-400 dark:border-slate-700'
                }`}
                aria-label="Toggle demo mode"
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                    !isDemoMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-slate-200 font-mono text-xs block">
              {isDemoMode ? 'DEMO TELEMETRY ACTIVE' : 'CONNECTED CLUSTER MODE ACTIVE'}
            </span>
            <p className="leading-relaxed">
              {isDemoMode
                ? 'Deterministic sample scenarios (Lovable OAuth, DocuPilot AI, AgentFleet Hub) are loaded. State transitions simulate execution with realistic diagnostic traces without requiring an external cluster.'
                : 'All actions (analysis, approvals, task execution, receipt generation) dispatch HTTP requests directly to your configured backend API endpoint.'}
            </p>
          </div>
        </div>

        {/* Section 3: Backend API Configuration */}
        <div className="py-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Backend Base URL</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Specify the target URL for your backend service orchestrator.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-600 dark:focus:border-cyan-500"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveApiUrl}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white dark:border-transparent text-xs sm:text-sm font-semibold transition-colors shrink-0"
              >
                Save URL
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isPinging}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition-colors shrink-0 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <Activity className={`w-4 h-4 ${isPinging ? 'animate-spin' : ''}`} />
                <span>{isPinging ? 'Pinging...' : 'Ping Test'}</span>
              </button>
            </div>

            {pingResult && (
              <div className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center gap-2.5 ${
                pingResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300'
              }`}>
                {pingResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <span className="leading-relaxed">{pingResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Local Storage & Cache Management */}
        <div className="pt-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Cache & Reset Controls</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Reset stored application receipts or restore demo presets to baseline.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onClearReceipts}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-700 dark:bg-slate-950 dark:hover:bg-rose-950/60 dark:border-slate-800 dark:hover:border-rose-800 dark:text-slate-300 dark:hover:text-rose-200 text-xs sm:text-sm font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              <span>Clear Stored Receipts</span>
            </button>

            <button
              type="button"
              onClick={onResetAllData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-950 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white text-xs sm:text-sm font-semibold transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
              <span>Reset All Scenarios to Baseline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
