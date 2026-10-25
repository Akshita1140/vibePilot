'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  GitBranch, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  Compass,
  AlertOctagon,
  GitPullRequest,
  ShieldAlert,
  Terminal,
  ShieldCheck,
  FileCheck2,
  CheckCircle2,
  Zap,
  CornerDownLeft
} from 'lucide-react';
import { DEMO_PRESETS } from '@/lib/demo-data';
import { DemoPreset } from '@/lib/types';
import { motion, AnimatePresence } from 'motion/react';

interface AppInputProps {
  onAnalyze: (appUrl: string, repoUrl?: string) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
  onSelectPreset: (preset: DemoPreset) => void;
  currentAppUrl: string;
  currentRepoUrl: string;
}

const EXAMPLE_URLS = [
  'https://lovable-saas-preview.lovable.app',
  'https://bolt-storefront-checkout.bolt.new',
  'https://v0-analytics-dash.vercel.app',
  'https://internal-crm.replit.app',
];

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
  const [showRepoInput, setShowRepoInput] = useState(Boolean(currentRepoUrl));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [activePresetId, setActivePresetId] = useState<string>(DEMO_PRESETS[0].id);

  // Cycling placeholder text with smooth typing effect
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % EXAMPLE_URLS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const [prevAppUrl, setPrevAppUrl] = useState(currentAppUrl);
  if (prevAppUrl !== currentAppUrl) {
    setPrevAppUrl(currentAppUrl);
    setAppUrl(currentAppUrl);
    setRepoUrl(currentRepoUrl);
    if (currentRepoUrl) setShowRepoInput(true);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanAppUrl = appUrl.trim();
    if (!cleanAppUrl) {
      setValidationError('Please enter an application URL to inspect.');
      return;
    }

    try {
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

  const pipelineStages = [
    { num: '01', label: 'UNDERSTAND', icon: Compass, desc: 'Routes & Secrets' },
    { num: '02', label: 'DIAGNOSE', icon: AlertOctagon, desc: 'Root-Cause Error' },
    { num: '03', label: 'PLAN', icon: GitPullRequest, desc: 'Automated Fix Diff' },
    { num: '04', label: 'APPROVE', icon: ShieldAlert, desc: '120s Risk Gate' },
    { num: '05', label: 'ACT', icon: Terminal, desc: 'Live Execution' },
    { num: '06', label: 'VERIFY', icon: ShieldCheck, desc: 'Synthetic Probes' },
    { num: '07', label: 'RECEIPT', icon: FileCheck2, desc: 'Certified Audit' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* 1. Phenomenal Minimalist Hero Section */}
      <div className="text-center space-y-4 pt-2 sm:pt-6">
        {/* Eyebrow Pill */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-white/[0.04] border border-violet-200/80 dark:border-white/[0.08] text-violet-700 dark:text-cyan-300 text-xs font-mono font-medium"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>AUTONOMOUS PRODUCTION READINESS</span>
        </motion.div>

        {/* Confident Minimalist Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display leading-[1.12]"
        >
          AI writes the app.{' '}
          <span className="text-gradient-signature block sm:inline">
            VibePilot gets it ready to ship.
          </span>
        </motion.h1>

        {/* Clean Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
        >
          Autonomous readiness engine for Lovable, Bolt, v0, and Replit apps. Audits endpoints, diagnoses fatal blockers, stages human-governed fixes, and issues an audit-certified Setup Receipt.
        </motion.p>
      </div>

      {/* 2. Sleek Command Bar / URL Intake Form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="rounded-3xl p-3 sm:p-5 border border-slate-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-[#0c101d]/90 backdrop-blur-2xl shadow-xl dark:shadow-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative flex flex-col sm:flex-row items-center gap-2">
            {/* Primary URL Input Bar */}
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={appUrl}
                onChange={(e) => {
                  setAppUrl(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder={EXAMPLE_URLS[placeholderIndex]}
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-3.5 text-sm sm:text-base font-mono bg-slate-50/80 dark:bg-[#070b14] border border-slate-200 dark:border-white/[0.1] rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all shadow-inner"
              />
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:brightness-110 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-violet-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60 cursor-pointer shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Inspecting Application...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Application</span>
                  <CornerDownLeft className="w-4 h-4 opacity-75 hidden sm:inline" />
                </>
              )}
            </button>
          </div>

          {/* Secondary Git Repo Toggle */}
          <div className="flex items-center justify-between px-2 pt-1 text-xs">
            <button
              type="button"
              onClick={() => setShowRepoInput(!showRepoInput)}
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>{showRepoInput ? 'Hide GitHub Repository input' : '+ Attach GitHub Repository (optional AST scan)'}</span>
            </button>

            <span className="text-slate-400 dark:text-slate-500 font-mono hidden sm:inline">
              Safe &amp; Non-destructive scan
            </span>
          </div>

          {/* Optional GitHub Repo Input */}
          <AnimatePresence>
            {showRepoInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-1"
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/org/repo (Optional)"
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-mono bg-slate-50/80 dark:bg-[#070b14] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Validation or Error Message */}
          {(validationError || errorMessage) && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/50 dark:border-rose-900/50 dark:text-rose-300 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{validationError || errorMessage}</span>
            </motion.div>
          )}
        </form>
      </motion.div>

      {/* 3. The 4 Minimalist Presets (Judge 1-Click Verification) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-600 dark:text-cyan-400" />
            <h2 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold">
              Judge Demonstration Scenarios
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            1-Click instant test run (&lt;200ms)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DEMO_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setActivePresetId(preset.id);
                  onSelectPreset(preset);
                  setAppUrl(preset.appUrl);
                  setRepoUrl(preset.repoUrl);
                  setValidationError(null);
                }}
                className={`text-left rounded-2xl p-4 transition-all duration-200 border cursor-pointer relative group ${
                  isSelected
                    ? 'bg-violet-50/90 border-violet-400/80 dark:bg-white/[0.06] dark:border-cyan-400/80 shadow-md ring-1 ring-violet-400 dark:ring-cyan-400/40'
                    : 'bg-white/90 dark:bg-[#0c101d]/60 border-slate-200 dark:border-white/[0.08] hover:border-violet-300 dark:hover:border-white/[0.18] hover:translate-y-[-2px]'
                }`}
              >
                {/* Active Pill */}
                {isSelected && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-600 dark:bg-cyan-500 text-white dark:text-slate-950 text-[10px] font-mono font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>LOADED</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 pr-12">
                    <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-violet-600 dark:group-hover:text-cyan-400 transition-colors">
                      {preset.appName}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500 dark:text-slate-400">
                      {preset.analysisData.targetApp.detectedFramework}
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      {preset.analysisData.missingConfigs.length} gaps
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Minimalist 7-Stage Workflow Strip */}
      <div className="rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-[#0c101d]/50 backdrop-blur-xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-white/[0.06] px-1 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Autonomous 7-Stage Readiness Pipeline</span>
          </div>
          <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">
            Zero to Production Certified
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {pipelineStages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div 
                key={stage.label}
                className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] text-center space-y-1 hover:border-cyan-500/40 transition-colors"
              >
                <div className="w-7 h-7 mx-auto rounded-lg bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-slate-600 dark:text-cyan-400">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200">
                  {stage.num}. {stage.label}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                  {stage.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
