'use client';

import React, { useEffect } from 'react';
import { AppView } from '@/lib/types';
import { UserProfile } from './UserLoginModal';
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
  ArrowRight,
  ShieldAlert,
  User,
  Radio,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  receiptsCount: number;
  pendingApproval: boolean;
  currentUser?: UserProfile | null;
  onOpenLoginModal?: () => void;
  onNewAnalysis?: () => void;
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
  currentUser,
  onOpenLoginModal,
  onNewAnalysis,
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

  const navItems: Array<{
    id: AppView;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    {
      id: 'overview',
      label: 'Readiness Cockpit',
      description: 'Ship readiness dashboard & activity',
      icon: LayoutDashboard,
    },
    {
      id: 'app-map',
      label: 'App Map & Architecture',
      description: 'Routes, dependencies & secrets scan',
      icon: Compass,
    },
    {
      id: 'diagnose',
      label: 'Diagnose & Issues',
      description: 'Root-cause analysis & confidence scores',
      icon: Sparkles,
    },
    {
      id: 'plan',
      label: 'Change Plan',
      description: 'Proposed diffs & migration recipes',
      icon: ShieldAlert,
    },
    {
      id: 'live-run',
      label: 'Live Execution Run',
      description: 'Terminal stream & 120s human gate',
      icon: Terminal,
      badge: pendingApproval ? 'Action Required' : undefined,
      badgeColor: 'bg-amber-500/10 text-amber-500 border border-amber-500/30 animate-pulse font-semibold',
    },
    {
      id: 'verify',
      label: 'Synthetic Verification',
      description: 'Route probes, latency & OAuth checks',
      icon: ShieldCheck,
    },
    {
      id: 'receipts-history',
      label: 'Setup Receipts',
      description: 'Audit history & certified receipts',
      icon: FileCheck2,
      badge: receiptsCount > 0 ? `${receiptsCount}` : undefined,
      badgeColor: 'bg-violet-500/10 text-violet-600 dark:text-cyan-300 border border-violet-500/20 font-mono font-medium',
    },
    {
      id: 'settings',
      label: 'Settings & Telemetry',
      description: 'Theme, backend bridge & diagnostics',
      icon: Settings2,
    },
  ];

  return (
    <>
      {/* Backdrop overlay */}
      <AnimatePresence>
        {isOpenMobile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 transition-opacity"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Navigation Drawer */}
      <nav
        aria-label="Navigation Drawer"
        className={`fixed inset-y-0 left-0 w-80 sm:w-96 max-w-[90vw] z-50 flex flex-col bg-white dark:bg-[#070b14] border-r border-slate-200 dark:border-white/[0.08] shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-in-out select-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between gap-3">
          <div 
            onClick={() => {
              onSelectView('overview');
              onCloseMobile();
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-400 p-[1px] shadow-sm shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all shrink-0">
              <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center">
                <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white font-display">
                  VibePilot
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/60 dark:text-cyan-400 dark:border-cyan-500/30">
                  2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                AI App Production Readiness
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">
            Workspace Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectView(item.id);
                  onCloseMobile();
                }}
                className={`w-full text-left p-2.5 rounded-xl transition-all duration-150 flex items-center justify-between gap-3 group relative cursor-pointer ${
                  isActive
                    ? 'bg-violet-50 text-violet-950 border border-violet-200/80 dark:bg-white/[0.06] dark:text-white dark:border-white/[0.1] shadow-sm font-semibold'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                    isActive 
                      ? 'bg-violet-600 text-white dark:bg-cyan-500 dark:text-slate-950' 
                      : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold tracking-tight truncate">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                      {item.description}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span className={`px-2 py-0.5 rounded text-[10px] shrink-0 ${item.badgeColor || 'bg-slate-200 text-slate-800'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Drawer Bottom: User Profile & Mode Indicator */}
        <div className="p-4 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.01] space-y-3">
          {/* User Profile Card */}
          <div 
            onClick={() => {
              if (onOpenLoginModal) {
                onOpenLoginModal();
                onCloseMobile();
              }
            }}
            className="p-2.5 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] flex items-center justify-between gap-3 cursor-pointer hover:border-violet-300 dark:hover:border-white/[0.15] transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 p-[1px] shrink-0">
                <div className="w-full h-full rounded-[7px] bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
                  {currentUser ? currentUser.name.charAt(0) : <User className="w-4 h-4 text-slate-400" />}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {currentUser ? currentUser.name : 'Sign In'}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  {currentUser ? currentUser.workspace : 'Click to connect profile'}
                </div>
              </div>
            </div>

            <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold shrink-0">
              {currentUser ? 'PROFILE' : 'LOGIN'}
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">Engine Mode:</span>
            <button
              type="button"
              onClick={onToggleDemoMode}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                isDemoMode
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isDemoMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span>{isDemoMode ? 'DEMO FIXTURE' : 'LIVE BACKEND'}</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};
