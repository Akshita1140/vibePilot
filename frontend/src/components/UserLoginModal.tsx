'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  LogOut, 
  ShieldCheck, 
  ExternalLink,
  Sparkles,
  Laptop,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'github' | 'google' | 'guest';
  workspace: string;
  role: string;
}

const DEFAULT_GUEST_USER: UserProfile = {
  id: 'usr_guest_demo',
  name: 'Developer (Demo Mode)',
  email: 'dev@vibepilot.local',
  provider: 'guest',
  workspace: 'Production (vibe-prod-01)',
  role: 'Staff Platform Engineer',
};

export const getStoredUser = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('vibepilot_user');
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
};

export const saveStoredUser = (user: UserProfile | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (!user) {
      localStorage.removeItem('vibepilot_user');
    } else {
      localStorage.setItem('vibepilot_user', JSON.stringify(user));
    }
  } catch (err) {
    console.warn('[UserAuth] Failed to persist user session:', err);
  }
};

interface UserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
}

export const UserLoginModal: React.FC<UserLoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const [activeWorkspace, setActiveWorkspace] = useState(
    currentUser?.workspace || 'Production (vibe-prod-01)'
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleOAuthLogin = (provider: 'github' | 'google' | 'guest') => {
    let user: UserProfile;
    if (provider === 'github') {
      user = {
        id: 'usr_gh_' + Math.random().toString(36).substring(2, 8),
        name: 'Divya · Lead Engineer',
        email: 'divya@vibepilot.dev',
        provider: 'github',
        workspace: activeWorkspace,
        role: 'Tech Lead / Deploy Admin',
      };
    } else if (provider === 'google') {
      user = {
        id: 'usr_goog_' + Math.random().toString(36).substring(2, 8),
        name: 'Divya (Google Cloud)',
        email: 'divya@gcp.corp',
        provider: 'google',
        workspace: activeWorkspace,
        role: 'Cloud Architect',
      };
    } else {
      user = {
        ...DEFAULT_GUEST_USER,
        workspace: activeWorkspace,
      };
    }

    saveStoredUser(user);
    onLogin(user);
    onClose();
  };

  const handleSignOut = () => {
    saveStoredUser(null);
    onLogout();
    onClose();
  };

  const workspaces = [
    { id: 'ws_prod', name: 'Production (vibe-prod-01)', env: 'Production · Live' },
    { id: 'ws_stg', name: 'Preview Sandbox (vibe-preview)', env: 'Staging · Automated' },
    { id: 'ws_dev', name: 'Local Dev Bench (localhost:3000)', env: 'Development · Testing' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0C101D] border border-slate-200 dark:border-white/[0.1] shadow-2xl overflow-hidden p-6 text-slate-900 dark:text-white"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {currentUser ? (
              /* Signed In Profile State */
              <div className="space-y-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-sm">
                    <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center text-white font-bold text-base">
                      {currentUser.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {currentUser.name}
                      </h3>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {currentUser.email}
                    </p>
                    <span className="inline-block mt-0.5 text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold uppercase">
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                {/* Workspace Switcher */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
                    Active Deployment Workspace
                  </label>
                  <div className="space-y-1.5">
                    {workspaces.map((ws) => {
                      const isSelected = activeWorkspace === ws.name;
                      return (
                        <button
                          key={ws.id}
                          type="button"
                          onClick={() => {
                            setActiveWorkspace(ws.name);
                            if (currentUser) {
                              const updated = { ...currentUser, workspace: ws.name };
                              saveStoredUser(updated);
                              onLogin(updated);
                            }
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between border transition-all ${
                            isSelected
                              ? 'bg-violet-50 text-violet-900 border-violet-300 dark:bg-cyan-950/40 dark:text-cyan-200 dark:border-cyan-500/40'
                              : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-white/[0.02] dark:text-slate-300 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{ws.name}</div>
                            <div className="text-[11px] text-slate-400 dark:text-slate-500">{ws.env}</div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-violet-600 dark:text-cyan-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Account Details & Sign Out */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Auth: {currentUser.provider.toUpperCase()}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Signed Out Login State */
              <div className="space-y-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-cyan-300 border border-violet-200 dark:border-violet-500/30 mb-2">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    DEVELOPER ACCESS
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-display">
                    Sign in to VibePilot
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Connect your developer identity to deploy, approve changes, and certify production readiness.
                  </p>
                </div>

                {/* OAuth Provider Buttons */}
                <div className="space-y-2.5">
                  {/* GitHub Sign In */}
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('github')}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      <span>Continue with GitHub</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">1-click</span>
                  </button>

                  {/* Google Sign In */}
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('google')}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-white/[0.08] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continue with Google</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">OAuth</span>
                  </button>

                  {/* Guest / Demo Developer */}
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('guest')}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-violet-50/80 hover:bg-violet-100/80 dark:bg-cyan-950/30 dark:hover:bg-cyan-950/50 text-violet-800 dark:text-cyan-300 text-xs font-semibold border border-violet-200 dark:border-cyan-500/30 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Laptop className="w-4 h-4 text-violet-600 dark:text-cyan-400" />
                      <span>Continue as Guest Developer</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-violet-600 dark:text-cyan-400">INSTANT</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] text-center text-[11px] text-slate-400">
                  Zero telemetry tracking. Secrets are never stored in your browser session.
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
