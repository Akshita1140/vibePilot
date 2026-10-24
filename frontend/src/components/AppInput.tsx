'use client';

import React, { useState } from 'react';
import { Globe, GitBranch, ArrowRight, Loader2, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';
import { DEMO_PRESETS } from '@/lib/demo-data';
import { DemoPreset } from '@/lib/types';

interface AppInputProps {
  onAnalyze: (appUrl: string, repoUrl?: string) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
  onSelectPreset: (preset: DemoPreset) => void;
  currentAppUrl: string;
  currentRepoUrl: string;
}

export const AppInput: React.FC<AppInputProps> = ({
  onAnalyze,
  isLoading,
  errorMessage,
  onSelectPreset,
  currentAppUrl,
  currentRepoUrl,
}) => {
  const [appUrl, setAppUrl] = useState(currentAppUrl || '');
  const [repoUrl, setRepoUrl] = useState(currentRepoUrl || '');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const [prevAppUrl, setPrevAppUrl] = useState(currentAppUrl);
  if (prevAppUrl !== currentAppUrl) {
    setPrevAppUrl(currentAppUrl);
    setAppUrl(currentAppUrl);
    setRepoUrl(currentRepoUrl);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanAppUrl = appUrl.trim();
    if (!cleanAppUrl) {
      setValidationError('Please enter a valid application URL to analyze.');
      return;
    }

    try {
      // Basic URL format validation
      const parsed = new URL(cleanAppUrl.startsWith('http') ? cleanAppUrl : `https://${cleanAppUrl}`);
      if (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
        setValidationError('Please enter a valid domain (e.g. preview.app.com) or localhost:3000.');
        return;
      }
    } catch {
      setValidationError('Please enter a valid URL (e.g., https://my-app.vercel.app or http://localhost:3000)');
      return;
    }

    onAnalyze(cleanAppUrl, repoUrl.trim() || undefined);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm dark:shadow-xl backdrop-blur-sm transition-colors duration-200">
      {/* Header with Title & Preset Shortcut Chips */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-600 dark:bg-cyan-400" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Application Inspection & Architecture Intake
            </h2>
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
              title="Toggle explanation of this step"
              aria-label="Toggle explanation of this step"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            Provide an application preview URL or repository to map architecture, detect third-party integrations, and audit missing configurations.
          </p>
        </div>

        {/* Preset shortcut chips for judges */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" /> Demo Presets:
          </span>
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                onSelectPreset(preset);
                setAppUrl(preset.appUrl);
                setRepoUrl(preset.repoUrl);
                setValidationError(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 hover:text-slate-950 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700/80 dark:text-slate-200 dark:hover:text-white text-xs sm:text-sm font-medium transition-colors"
            >
              {preset.appName}
            </button>
          ))}
        </div>
      </div>

      {/* Contextual Explainer Dropdown / Callout (Priority 4) */}
      {showHelp && (
        <div className="mb-5 p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 dark:bg-slate-950 dark:border-indigo-900/50 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-2 animate-in fade-in duration-200">
          <div className="font-semibold text-indigo-900 dark:text-cyan-300 flex items-center gap-1.5">
            <span>ℹ️ What happens during Application Inspection:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 leading-relaxed">
            <li><strong>Entering an app URL</strong> allows VibePilot to probe synthetic routes, check HTTP responses, and detect client-side authentication redirects.</li>
            <li><strong>Clicking Analyze App</strong> triggers real-time AST structure parsing to discover backend routes, ORM models, third-party SDKs, and missing environment secrets.</li>
            <li><strong>After analysis</strong>, proceed to the App Map to inspect the architecture, review the diagnosis, and stage automated fixes.</li>
          </ul>
        </div>
      )}

      {/* Main Intake Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* App URL input */}
          <div className="md:col-span-7">
            <label className="block text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 font-medium">
              Target Application URL <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Globe className="w-5 h-5 text-indigo-500 dark:text-cyan-400" />
              </div>
              <input
                type="text"
                value={appUrl}
                onChange={(e) => {
                  setAppUrl(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="https://preview-app.vercel.app or http://localhost:3000"
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-cyan-500 dark:focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-950 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* Repo URL input (Optional) */}
          <div className="md:col-span-5">
            <label className="block text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 font-medium">
              GitHub Repository <span className="text-slate-400 dark:text-slate-500 font-sans text-xs lowercase font-normal">(optional deep AST scan)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <GitBranch className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/org/repo"
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-cyan-500 dark:focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-950 transition-colors disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Validation or API error notice */}
        {(validationError || errorMessage) && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/60 dark:text-rose-300 text-sm animate-in fade-in duration-150">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{validationError || errorMessage}</span>
          </div>
        )}

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Non-destructive synthetic route discovery & AST scanner ready</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Architecture...</span>
              </>
            ) : (
              <>
                <span>Analyze App</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
