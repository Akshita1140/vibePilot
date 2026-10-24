'use client';

import React, { useState } from 'react';
import { DemoPreset, Theme } from '@/lib/types';
import { DEMO_PRESETS } from '@/lib/demo-data';
import { 
  Menu, 
  Sparkles, 
  ChevronDown, 
  Plus, 
  RotateCcw, 
  ExternalLink,
  ShieldAlert,
  Sun,
  Moon
} from 'lucide-react';

interface HeaderProps {
  appName: string;
  appUrl: string;
  detectedFramework: string;
  selectedPreset: DemoPreset;
  onSelectPreset: (preset: DemoPreset) => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onResetDemo: () => void;
  onNewAnalysis: () => void;
  onOpenMobileSidebar: () => void;
  hasPendingApproval?: boolean;
  theme: Theme;
  onToggleTheme: () => void;
  onOpenIntegrationModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  appName,
  appUrl,
  detectedFramework,
  selectedPreset,
  onSelectPreset,
  isDemoMode,
  onToggleDemoMode,
  onResetDemo,
  onNewAnalysis,
  onOpenMobileSidebar,
  hasPendingApproval = false,
  theme,
  onToggleTheme,
  onOpenIntegrationModal,
}) => {
  const [isPresetOpen, setIsPresetOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-[#070B14]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Hamburger Menu Button + VibePilot Brand + Target App Info */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* Priority 1: Prominent Hamburger Menu Button */}
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shrink-0"
            aria-label="Open navigation menu"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5 sm:w-5 sm:h-5 text-slate-800 dark:text-slate-200" />
          </button>

          {/* VibePilot Product Identity (Readable text label) */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
              VibePilot
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-cyan-950/80 dark:text-cyan-400 dark:border-cyan-800/60">
              2.0
            </span>
          </div>

          {/* Vertical Divider */}
          <div className="hidden sm:block h-5 w-px bg-slate-300 dark:bg-slate-800 shrink-0" />

          {/* Active Target App Info */}
          <div className="min-w-0 hidden md:block">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight truncate max-w-[200px] lg:max-w-xs">
                {appName}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 font-medium">
                {detectedFramework}
              </span>
              {hasPendingApproval && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-500/70 animate-pulse font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  Approval Required
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
              <span>Target:</span>
              <a
                href={appUrl}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 dark:text-cyan-400 hover:underline flex items-center gap-1 truncate max-w-[220px]"
              >
                <span>{appUrl}</span>
                <ExternalLink className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Actions: Scenario Dropdown, Theme Toggle, New Analysis, Reset, Mode Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Preset Scenario Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPresetOpen(!isPresetOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 dark:bg-slate-900 dark:border-slate-700/80 dark:hover:border-slate-600 text-xs sm:text-sm text-slate-800 dark:text-slate-200 transition-all font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="Select demonstration scenario for judges"
              aria-label="Select demonstration scenario"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
              <span className="hidden sm:inline max-w-[140px] truncate">
                {selectedPreset.appName}
              </span>
              <span className="sm:hidden text-xs">Scenario</span>
              <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </button>

            {isPresetOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsPresetOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-2.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold border-b border-slate-200 dark:border-slate-800">
                    Judge Demo Scenarios
                  </div>
                  <div className="mt-1.5 space-y-1">
                    {DEMO_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          onSelectPreset(preset);
                          setIsPresetOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl text-xs transition-colors flex flex-col gap-1 ${
                          selectedPreset.id === preset.id
                            ? 'bg-indigo-50 text-indigo-950 border border-indigo-200 dark:bg-cyan-950/80 dark:text-cyan-200 dark:border-cyan-500/40'
                            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="font-semibold text-sm flex items-center justify-between">
                          <span>{preset.appName}</span>
                          {selectedPreset.id === preset.id && (
                            <span className="text-xs font-mono text-indigo-600 dark:text-cyan-400 font-bold">ACTIVE</span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{preset.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* New Analysis Button */}
          <button
            type="button"
            onClick={onNewAnalysis}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Start new analysis intake"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Analysis</span>
          </button>

          {/* Reset Demo Button */}
          <button
            type="button"
            onClick={onResetDemo}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Reset active scenario to initial state"
            aria-label="Reset active scenario to initial state"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Backend v1 Integration & Open Ends Inspector Button */}
          {onOpenIntegrationModal && (
            <button
              type="button"
              onClick={onOpenIntegrationModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700 text-xs font-mono transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
              title="Click to view Backend v1 integration details and active open ends"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${isDemoMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="font-bold text-slate-800 dark:text-slate-200 hidden md:inline">
                {isDemoMode ? 'Demo Telemetry' : 'Backend v1 Active'}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-[10px] font-bold border border-amber-300 dark:border-amber-700">
                4 Open Ends
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
