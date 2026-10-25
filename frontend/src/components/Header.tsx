'use client';

import React, { useState } from 'react';
import { DemoPreset, Theme } from '@/lib/types';
import { DEMO_PRESETS } from '@/lib/demo-data';
import { UserProfile } from './UserLoginModal';
import { 
  Menu, 
  Sparkles, 
  ChevronDown, 
  Plus, 
  RotateCcw, 
  ExternalLink,
  ShieldAlert,
  Sun,
  Moon,
  Zap,
  Check,
  User,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  currentUser?: UserProfile | null;
  onOpenLoginModal?: () => void;
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
  currentUser,
  onOpenLoginModal,
}) => {
  const [isPresetOpen, setIsPresetOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-white/85 dark:bg-[#06080F]/85 border-b border-slate-200/80 dark:border-white/[0.08] px-3 sm:px-6 py-2.5 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Left Section: Hamburger + Logo + App Info */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          {/* Hamburger Menu Button */}
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 dark:bg-white/[0.04] dark:border-white/[0.08] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 shrink-0 cursor-pointer active:scale-95"
            aria-label="Toggle navigation drawer"
            title="Toggle navigation drawer"
          >
            <Menu className="w-4 h-4 text-slate-800 dark:text-slate-200" />
          </button>

          {/* VibePilot Brand */}
          <div className="flex items-center gap-2 shrink-0 select-none cursor-pointer" onClick={onNewAnalysis}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-400 p-[1px] shadow-sm shadow-violet-500/20">
              <div className="w-full h-full rounded-[11px] bg-slate-900 flex items-center justify-center">
                <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white font-display">
                VibePilot
              </span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/60 dark:text-cyan-400 dark:border-cyan-500/30">
                2.0
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block h-4 w-px bg-slate-200 dark:bg-white/[0.1] shrink-0" />

          {/* Target App Badge */}
          <div className="min-w-0 hidden md:flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px] lg:max-w-xs">
              {appName}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200 dark:bg-white/[0.04] dark:text-slate-400 dark:border-white/[0.06]">
              {detectedFramework}
            </span>
            {hasPendingApproval && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-600 border border-amber-500/30 dark:text-amber-400 animate-pulse font-semibold">
                <ShieldAlert className="w-3 h-3 text-amber-500" />
                Gate
              </span>
            )}
            <a
              href={appUrl}
              target="_blank"
              rel="noreferrer"
              className="text-violet-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 text-[11px] font-mono truncate max-w-[150px]"
              title={`Open target URL: ${appUrl}`}
            >
              <span>{appUrl.replace('https://', '').replace('http://', '')}</span>
              <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
            </a>
          </div>
        </div>

        {/* Right Section: Mode Badge + Preset Selector + Theme Toggle + User Auth + Action */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Persistent LIVE / DEMO Badge (Clickable to switch mode) */}
          <button
            type="button"
            onClick={onToggleDemoMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
              isDemoMode
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
            }`}
            title={isDemoMode ? 'Running in DEMO mode with deterministic fixtures. Click to switch to LIVE backend.' : 'Connected to LIVE backend (http://localhost:8000). Click to switch to DEMO fixtures.'}
          >
            <span className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="font-bold tracking-wider">{isDemoMode ? 'DEMO' : 'LIVE'}</span>
            <span className="text-[10px] opacity-75 hidden sm:inline">
              {isDemoMode ? '· fixture' : '· backend'}
            </span>
          </button>

          {/* Preset Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPresetOpen(!isPresetOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 dark:bg-white/[0.04] dark:border-white/[0.08] dark:hover:bg-white/[0.08] text-xs text-slate-800 dark:text-slate-200 font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 cursor-pointer"
              title="Select demonstration scenario for judges"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-cyan-400" />
              <span className="hidden sm:inline max-w-[110px] truncate">
                {selectedPreset.appName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isPresetOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsPresetOpen(false)} 
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#0c101d] border border-slate-200 dark:border-white/[0.1] shadow-2xl p-2 z-50 backdrop-blur-2xl"
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold border-b border-slate-100 dark:border-white/[0.06]">
                    Demo Judge Scenarios
                  </div>
                  <div className="mt-1 space-y-1">
                    {DEMO_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          onSelectPreset(preset);
                          setIsPresetOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs transition-all flex flex-col gap-0.5 cursor-pointer ${
                          selectedPreset.id === preset.id
                            ? 'bg-violet-50 text-violet-950 border border-violet-200 dark:bg-cyan-950/40 dark:text-cyan-200 dark:border-cyan-500/30'
                            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="font-semibold text-xs flex items-center justify-between">
                          <span>{preset.appName}</span>
                          {selectedPreset.id === preset.id && (
                            <span className="text-[10px] font-mono text-violet-600 dark:text-cyan-400 font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> ACTIVE
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {preset.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:border-white/[0.08] text-slate-700 dark:text-slate-300 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 cursor-pointer active:scale-95"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === 'dark' ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Sun className="w-4 h-4 text-amber-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Moon className="w-4 h-4 text-violet-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Reset Demo Button */}
          <button
            type="button"
            onClick={onResetDemo}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 cursor-pointer"
            title="Reset active scenario to initial state"
            aria-label="Reset active scenario to initial state"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* User Login / Profile Button */}
          {onOpenLoginModal && (
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:border-white/[0.08] text-xs font-medium text-slate-700 dark:text-slate-200 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              title={currentUser ? `Logged in as ${currentUser.name}` : 'Sign in to VibePilot'}
            >
              {currentUser ? (
                <>
                  <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-400 flex items-center justify-center text-[9px] font-bold text-white">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="hidden md:inline max-w-[80px] truncate font-semibold">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span className="hidden sm:inline">Sign In</span>
                </>
              )}
            </button>
          )}

          {/* Primary Action Button: New Analysis */}
          <button
            type="button"
            onClick={onNewAnalysis}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:brightness-110 active:scale-95 text-white text-xs font-semibold shadow-md shadow-violet-500/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 cursor-pointer"
            title="Start new analysis intake"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Analysis</span>
          </button>
        </div>
      </div>
    </header>
  );
};
