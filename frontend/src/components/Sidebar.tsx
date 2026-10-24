'use client';

import React, { useEffect } from 'react';
import { AppView } from '@/lib/types';
import { 
  LayoutDashboard, 
  Compass, 
  Sparkles, 
  Terminal, 
  ShieldCheck, 
  FileCheck2, 
  Settings2, 
  X,
  Zap,
  Activity,
  ArrowRight
} from 'lucide-react';

interface SidebarProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  receiptsCount: number;
  pendingApproval: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  isDemoMode,
  onToggleDemoMode,
  isOpenMobile,
  onCloseMobile,
  receiptsCount,
  pendingApproval,
}) => {
  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpenMobile) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpenMobile, onCloseMobile]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpenMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpenMobile]);

  // 5 Core navigation destinations per Priority 1 requirements
  const primaryNavItems: Array<{
    id: AppView;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    {
      id: 'overview',
      label: 'Overview',
      description: 'Ship readiness dashboard & activity',
      icon: LayoutDashboard,
    },
    {
      id: 'app-map',
      label: 'App Map',
      description: 'Routes, features, integrations & secrets',
      icon: Compass,
    },
    {
      id: 'live-run',
      label: 'Live Run',
      description: 'Execution timeline & approval gates',
      icon: Terminal,
      badge: pendingApproval ? 'Action Required' : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-500 animate-pulse font-semibold',
    },
    {
      id: 'receipts-history',
      label: 'Setup Receipts',
      description: 'Audit history & certified manifests',
      icon: FileCheck2,
      badge: receiptsCount > 0 ? `${receiptsCount} Run${receiptsCount > 1 ? 's' : ''}` : undefined,
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-slate-800 dark:text-cyan-300 dark:border-slate-700 font-mono font-medium',
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Theme, backend bridge & local cache',
      icon: Settings2,
    },
  ];

  // Secondary sub-destinations for quick access within the workflow
  const subNavItems: Array<{
    id: AppView;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'diagnose',
      label: 'Diagnose & Plan',
      description: 'Issue root-cause & automated fix diff',
      icon: Sparkles,
    },
    {
      id: 'verify',
      label: 'Synthetic Verification',
      description: 'Route probes & latency tests',
      icon: ShieldCheck,
    },
  ];

  return (
    <>
      {/* Backdrop overlay */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 transition-opacity animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Navigation Drawer Panel */}
      <nav
        aria-label="Main Navigation Drawer"
        className={`fixed inset-y-0 left-0 w-80 sm:w-96 max-w-[90vw] z-50 flex flex-col bg-white dark:bg-[#070B14] border-r border-slate-200 dark:border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out select-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header with Brand & Close Button */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div 
            onClick={() => {
              onSelectView('overview');
              onCloseMobile();
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all shrink-0">
              <Zap className="w-5 h-5 fill-slate-950 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-cyan-300 transition-colors">
                  VibePilot
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-cyan-950/80 dark:text-cyan-400 dark:border-cyan-800/60">
                  2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Ready-to-Ship Engine
              </p>
            </div>
          </div>

          {/* Accessible Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
            aria-label="Close navigation menu"
            title="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Tagline Banner */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-300 font-sans flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 shrink-0" />
          <span className="italic leading-tight font-medium">“AI writes the app. VibePilot gets it ready to ship.”</span>
        </div>

        {/* Navigation Links (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-6 scrollbar-thin">
          {/* Primary Navigation Sections */}
          <div className="space-y-1.5">
            <div className="px-3 pb-1 text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
              Primary Destinations
            </div>

            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id || 
                (item.id === 'receipts-history' && activeView === 'receipt');

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectView(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isActive
                      ? 'bg-indigo-50/80 border border-indigo-200 text-indigo-950 font-semibold shadow-sm dark:bg-indigo-950/60 dark:border-indigo-700/60 dark:text-white dark:shadow-md'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`p-2 rounded-lg transition-colors shrink-0 ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:group-hover:text-slate-200'
                    }`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm sm:text-base font-semibold tracking-tight truncate">
                        {item.label}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded text-xs font-mono border ml-2 shrink-0 ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Workflow Sub-Stages */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="px-3 pb-1 text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
              Pipeline Sub-Stages
            </div>

            {subNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id || 
                (item.id === 'diagnose' && activeView === 'plan');

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectView(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isActive
                      ? 'bg-cyan-50/80 border border-cyan-200 text-cyan-950 font-semibold dark:bg-cyan-950/40 dark:border-cyan-800/60 dark:text-cyan-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold truncate">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Telemetry Status Widget in Drawer Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Mode:
            </span>
            <span className={`font-semibold ${isDemoMode ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {isDemoMode ? 'Demo Telemetry' : 'Live Connected'}
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleDemoMode}
            className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-700 dark:text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Switch to {isDemoMode ? 'Connected Mode' : 'Demo Mode'}</span>
          </button>
        </div>
      </nav>
    </>
  );
};
