'use client';

import React, { useState } from 'react';
import { AppAnalysis } from '@/lib/types';
import { 
  Network, 
  Layers, 
  KeyRound, 
  CheckSquare, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Search,
  ExternalLink,
  Boxes
} from 'lucide-react';

interface AppMapProps {
  analysis: AppAnalysis;
  onProceedToSetup: () => void;
  isDemoData: boolean;
}

export const AppMap: React.FC<AppMapProps> = ({
  analysis,
  onProceedToSetup,
  isDemoData,
}) => {
  const [activeTab, setActiveTab] = useState<'routes' | 'integrations' | 'configs' | 'checklist'>('routes');
  const [routeSearch, setRouteSearch] = useState('');
  const [routeFilter, setRouteFilter] = useState<'all' | 'page' | 'api' | 'dynamic'>('all');

  const filteredRoutes = analysis.routes.filter((route) => {
    const matchesSearch = route.path.toLowerCase().includes(routeSearch.toLowerCase()) ||
      (route.description && route.description.toLowerCase().includes(routeSearch.toLowerCase()));
    const matchesType = routeFilter === 'all' || route.type === routeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Target Application Header & Metric Cards */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">{analysis.targetApp.name}</h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {analysis.targetApp.detectedFramework}
              </span>
              {isDemoData && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                  Sample Data
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400 font-mono">
              <a 
                href={analysis.targetApp.url} 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-indigo-400 flex items-center gap-1 transition-colors"
              >
                <span>{analysis.targetApp.url}</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              {analysis.targetApp.repoUrl && (
                <>
                  <span className="text-slate-600">•</span>
                  <a 
                    href={analysis.targetApp.repoUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="hover:text-indigo-400 flex items-center gap-1 transition-colors"
                  >
                    <span>{analysis.targetApp.repoUrl.replace('https://github.com/', '')}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </>
              )}
            </div>
          </div>

          <button
            onClick={onProceedToSetup}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all shrink-0"
          >
            <span>Initialize Setup Run</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Telemetry Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Total Routes</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-white font-mono">{analysis.metrics.totalRoutes}</span>
              <span className="text-[10px] text-slate-500">({analysis.metrics.dynamicRoutes} dynamic)</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">API Handlers</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-cyan-400 font-mono">{analysis.metrics.apiEndpoints}</span>
              <span className="text-[10px] text-slate-500">endpoints</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Integrations</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-indigo-400 font-mono">{analysis.metrics.detectedIntegrations}</span>
              <span className="text-[10px] text-slate-500">services</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Config Gaps</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-xl font-bold font-mono ${analysis.metrics.missingConfigsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {analysis.metrics.missingConfigsCount}
              </span>
              <span className="text-[10px] text-slate-500">missing keys</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabbed Inspector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 bg-slate-950/40">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('routes')}
              className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'routes'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>Discovered Routes</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono">
                {analysis.routes.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('integrations')}
              className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'integrations'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Integrations & Services</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono">
                {analysis.integrations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('configs')}
              className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'configs'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Missing Configs</span>
              {analysis.missingConfigs.length > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                  {analysis.missingConfigs.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'checklist'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Setup Plan</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono">
                {analysis.recommendedChecklist.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: Discovered Routes */}
        {activeTab === 'routes' && (
          <div className="p-4 space-y-4">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter paths..."
                  value={routeSearch}
                  onChange={(e) => setRouteSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1 self-start sm:self-auto">
                {(['all', 'page', 'api', 'dynamic'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setRouteFilter(type)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase transition-colors ${
                      routeFilter === type
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Routes List */}
            <div className="divide-y divide-slate-800/60 border border-slate-800 rounded-lg overflow-hidden bg-slate-950/40">
              {filteredRoutes.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 font-mono">
                  No routes match the selected filter.
                </div>
              ) : (
                filteredRoutes.map((route, i) => (
                  <div key={i} className="p-3 hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start sm:items-center gap-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase border ${
                        route.type === 'page'
                          ? 'bg-blue-950/60 text-blue-400 border-blue-800/50'
                          : route.type === 'api'
                          ? 'bg-purple-950/60 text-purple-400 border-purple-800/50'
                          : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                      }`}>
                        {route.type}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-slate-200">{route.path}</span>
                          {route.authRequired && (
                            <span className="flex items-center gap-0.5 text-[10px] font-mono text-amber-400/90 bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-800/40">
                              <Lock className="w-2.5 h-2.5" /> auth required
                            </span>
                          )}
                        </div>
                        {route.description && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{route.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                        route.status === 'verified'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}>
                        {route.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Integrations */}
        {activeTab === 'integrations' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.integrations.map((item, idx) => (
              <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Boxes className="w-4 h-4 text-indigo-400" />
                      <h4 className="font-semibold text-xs text-white">{item.name}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${
                      item.status === 'ready'
                        ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                        : item.status === 'missing_keys'
                        ? 'bg-amber-950/70 text-amber-300 border-amber-800/60'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">{item.details}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Required Secrets:</div>
                  <div className="flex flex-wrap gap-1">
                    {item.requiredEnvVars.map((env) => {
                      const isPresent = item.presentEnvVars.includes(env);
                      return (
                        <span
                          key={env}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 border ${
                            isPresent
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                              : 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                          }`}
                        >
                          {isPresent ? (
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                          )}
                          {env}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Missing Configs */}
        {activeTab === 'configs' && (
          <div className="p-4 space-y-3">
            <div className="text-xs text-slate-400">
              VibePilot detected the following missing environment variables referenced in code or package configurations:
            </div>

            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/60 divide-y divide-slate-800/70">
              {analysis.missingConfigs.length === 0 ? (
                <div className="p-6 text-center text-xs text-emerald-400 font-mono">
                  All required environment variables are present!
                </div>
              ) : (
                analysis.missingConfigs.map((cfg, idx) => (
                  <div key={idx} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-300">{cfg.key}</span>
                        {cfg.secret && (
                          <span className="text-[10px] font-mono text-rose-400 bg-rose-950/50 px-1.5 py-0.2 rounded border border-rose-900/60">
                            secret key
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{cfg.purpose}</p>
                    </div>

                    <div className="text-[11px] font-mono text-slate-500 self-start sm:self-auto">
                      Required by: <span className="text-slate-300">{cfg.requiredBy}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Recommended Checklist */}
        {activeTab === 'checklist' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Automated & manual setup plan generated for this application:
              </span>
              <button
                onClick={onProceedToSetup}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
              >
                <span>Launch in Setup Pipeline</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {analysis.recommendedChecklist.map((task, idx) => (
                <div
                  key={task.id}
                  className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded bg-slate-900 border border-slate-700/60 flex items-center justify-center text-xs font-mono text-slate-400 shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold text-white">{task.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${
                        task.priority === 'critical'
                          ? 'bg-rose-950/70 text-rose-300 border-rose-800/60'
                          : task.priority === 'high'
                          ? 'bg-amber-950/70 text-amber-300 border-amber-800/60'
                          : 'bg-indigo-950/70 text-indigo-300 border-indigo-800/60'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{task.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
