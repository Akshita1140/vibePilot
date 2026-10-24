'use client';

import React, { useState } from 'react';
import { Globe, GitBranch, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react';
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
      if (!parsed.hostname.includes('.')) {
        setValidationError('Please enter a fully-qualified domain name (e.g. app.example.com).');
        return;
      }
    } catch {
      setValidationError('Please enter a well-formatted URL (e.g., https://my-app.vercel.app)');
      return;
    }

    onAnalyze(cleanAppUrl, repoUrl.trim() || undefined);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500" />
            <h2 className="text-base font-semibold text-white tracking-tight">Step 1: Application Inspection</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Provide an application staging/preview URL and optional GitHub repository to map architecture, detect integrations, and audit missing configurations.
          </p>
        </div>

        {/* Preset shortcut chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Presets:
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
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white text-[11px] transition-colors"
            >
              {preset.appName}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* App URL input */}
          <div className="md:col-span-7">
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Target Application URL <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Globe className="w-4 h-4 text-slate-400" />
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
                className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* Repo URL input (Optional) */}
          <div className="md:col-span-5">
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              GitHub Repository <span className="text-slate-500 text-[10px] normal-case font-sans">(Optional for deep AST audit)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <GitBranch className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/org/repo"
                disabled={isLoading}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Validation or API error notice */}
        {(validationError || errorMessage) && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{validationError || errorMessage}</span>
          </div>
        )}

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Non-destructive AST scanner & route probe ready</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing Architecture...</span>
              </>
            ) : (
              <>
                <span>Analyze App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
