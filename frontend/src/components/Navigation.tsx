'use client';

import React from 'react';
import { Stage, DemoPreset } from '@/lib/types';
import { DEMO_PRESETS } from '@/lib/demo-data';
import { 
  Compass, 
  Terminal, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  Activity, 
  RefreshCw,
  ChevronDown
} from 'lucide-react';

interface NavigationProps {
  currentStage: Stage;
  onSelectStage: (stage: Stage) => void;
  selectedPreset: DemoPreset;
  onSelectPreset: (preset: DemoPreset) => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onResetDemo: () => void;
  completedStages: Record<Stage, boolean>;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentStage,
  onSelectStage,
  selectedPreset,
  onSelectPreset,
  isDemoMode,
  onToggleDemoMode,
  onResetDemo,
  completedStages,
}) => {
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = React.useState(false);

  const navItems: Array<{ id: Stage; label: string; icon: React.ReactNode; subtitle: string }> = [
    {
      id: 'understand',
      label: 'App Map',
      subtitle: 'Routes & Features',
      icon: <Compass className="w-4 h-4" />,
    },
    {
      id: 'setup',
      label: 'Live Run',
      subtitle: 'Execution & Approvals',
      icon: <Terminal className="w-4 h-4" />,
    },
    {
      id: 'verify',
      label: 'Verification',
      subtitle: 'Smoke Tests',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: 'receipt',
      label: 'Setup Receipt',
      subtitle: 'Audit Manifest',
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090D16]/90 backdrop-blur-md">
      {/* Top Banner / Telemetry Notice */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/60 border-b border-slate-800/50 px-4 py-1.5 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-slate-300 font-medium">VibePilot Core Engine:</span>
          <span>AI writes the app. VibePilot gets it ready to ship.</span>
          <span className="hidden md:inline-block text-slate-600">•</span>
          <span className="hidden md:inline-block px-1.5 py-0.5 rounded bg-indigo-950/70 text-indigo-300 font-mono text-[10px] border border-indigo-800/50">
            IIIT Delhi 24h Hackathon
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/60 rounded-md px-2 py-0.5 text-[11px]">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-400">Mode:</span>
            <span className="font-semibold text-cyan-300">
              {isDemoMode ? 'Verified Demo Telemetry' : 'Live API Mode'}
            </span>
          </div>

          <button
            onClick={onToggleDemoMode}
            className="text-[11px] text-slate-400 hover:text-slate-200 underline decoration-slate-600 hover:decoration-slate-400 transition-colors"
            title="Toggle between Live API and deterministic Demo mode"
          >
            {isDemoMode ? 'Switch to Live API' : 'Switch to Demo Telemetry'}
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Preset Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectStage('understand')}>
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white">VibePilot</span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none hidden sm:block">AI-App Verification & Setup Engine</p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* Quick Preset Selector for Demo Scenarios */}
          <div className="relative">
            <button
              onClick={() => setIsPresetDropdownOpen(!isPresetDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-200 transition-all text-left"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="max-w-[130px] sm:max-w-[200px] truncate font-medium">
                {selectedPreset.appName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {isPresetDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsPresetDropdownOpen(false)} 
                />
                <div className="absolute left-0 mt-2 w-72 rounded-lg bg-slate-900/95 border border-slate-700 shadow-2xl p-1.5 z-50 backdrop-blur-xl">
                  <div className="px-2 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Demo Scenarios for Judges
                  </div>
                  {DEMO_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        onSelectPreset(preset);
                        setIsPresetDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-md text-xs transition-colors flex flex-col gap-0.5 ${
                        selectedPreset.id === preset.id
                          ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30'
                          : 'text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="font-semibold flex items-center justify-between">
                        <span>{preset.appName}</span>
                        {selectedPreset.id === preset.id && (
                          <span className="text-[10px] text-indigo-400 font-mono">active</span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 4 Stage Steppers */}
        <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/80 border border-slate-800 rounded-lg p-1">
          {navItems.map((item, idx) => {
            const isActive = currentStage === item.id;
            const isCompleted = completedStages[item.id];

            return (
              <button
                key={item.id}
                onClick={() => onSelectStage(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className={`flex items-center justify-center ${isActive ? 'text-white' : 'text-slate-400'}`}>
                  {item.icon}
                </div>
                <span>
                  <span className="opacity-60 mr-1 font-mono">{idx + 1}.</span>
                  {item.label}
                </span>
                {isCompleted && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action: Reset Demo */}
        <div className="flex items-center gap-2">
          <button
            onClick={onResetDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 transition-colors"
            title="Reset demo scenario to initial state"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Mobile Stage Steppers */}
      <div className="lg:hidden flex items-center justify-between border-t border-slate-800/80 px-2 py-1.5 bg-slate-900/70 overflow-x-auto gap-1">
        {navItems.map((item, idx) => {
          const isActive = currentStage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectStage(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{idx + 1}. {item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
