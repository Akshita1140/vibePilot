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
  Boxes,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

interface AppMapProps {
  analysis: AppAnalysis;
  onProceedToSetup: () => void;
  onProceedToDiagnosis?: () => void;
  isDemoData: boolean;
}

export const AppMap: React.FC<AppMapProps> = ({
  analysis,
  onProceedToSetup,
  onProceedToDiagnosis,
  isDemoData,
}) => {
  const [activeTab, setActiveTab] = useState<'routes' | 'integrations' | 'configs' | 'checklist'>('routes');
  const [routeSearch, setRouteSearch] = useState('');
  const [routeFilter, setRouteFilter] = useState<'all' | 'page' | 'api' | 'dynamic'>('all');
  const [expandedRouteIndex, setExpandedRouteIndex] = useState<number | null>(null);

  const filteredRoutes = analysis.routes.filter((route) => {
    const matchesSearch = route.path.toLowerCase().includes(routeSearch.toLowerCase()) ||
      (route.description && route.description.toLowerCase().includes(routeSearch.toLowerCase()));
    const matchesType = routeFilter === 'all' || route.type === routeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Target Application Header & Metric Cards */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {analysis.targetApp.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
                {analysis.targetApp.detectedFramework}
              </span>
              {isDemoData && (
                <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
                  VERIFIED DEMO SCENARIO
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono">
              <a 
                href={analysis.targetApp.url} 
                target="_blank" 
                rel="noreferrer" 
                className="text-indigo-600 dark:text-cyan-400 hover:underline flex items-center gap-1 transition-colors"
              >
                <span>{analysis.targetApp.url}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              </a>
              {analysis.targetApp.repoUrl && (
                <>
                  <span className="text-slate-400 dark:text-slate-600">•</span>
                  <a 
                    href={analysis.targetApp.repoUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-indigo-600 dark:text-cyan-400 hover:underline flex items-center gap-1 transition-colors"
                  >
                    <span>{analysis.targetApp.repoUrl.replace('https://github.com/', '')}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  </a>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onProceedToDiagnosis || onProceedToSetup}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition-all shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <span>{onProceedToDiagnosis ? 'Proceed to Diagnostics' : 'Initialize Setup Run'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Telemetry Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">
              Total Routes
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                {analysis.metrics.totalRoutes}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">({analysis.metrics.dynamicRoutes} dynamic)</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">
              API Endpoints
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-cyan-400 font-mono">
                {analysis.metrics.apiEndpoints}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">handlers</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">
              Integrations
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                {analysis.metrics.detectedIntegrations}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">services</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">
              Config Gaps
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${analysis.metrics.missingConfigsCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {analysis.metrics.missingConfigsCount}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">missing keys</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabbed Inspector */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl transition-colors duration-200">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 bg-slate-50 dark:bg-slate-950/50 overflow-x-auto scrollbar-none">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('routes')}
              className={`flex items-center gap-2.5 py-3.5 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap focus:outline-none ${
                activeTab === 'routes'
                  ? 'border-indigo-600 text-indigo-700 bg-white dark:bg-slate-900 dark:border-cyan-400 dark:text-cyan-300'
                  : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>Discovered Routes</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                {analysis.routes.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('integrations')}
              className={`flex items-center gap-2.5 py-3.5 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap focus:outline-none ${
                activeTab === 'integrations'
                  ? 'border-indigo-600 text-indigo-700 bg-white dark:bg-slate-900 dark:border-cyan-400 dark:text-cyan-300'
                  : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Integrations & Services</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                {analysis.integrations.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('configs')}
              className={`flex items-center gap-2.5 py-3.5 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap focus:outline-none ${
                activeTab === 'configs'
                  ? 'border-indigo-600 text-indigo-700 bg-white dark:bg-slate-900 dark:border-cyan-400 dark:text-cyan-300'
                  : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Missing Secrets & Config</span>
              {analysis.missingConfigs.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 text-xs font-mono font-bold border border-amber-300 dark:border-amber-500/30">
                  {analysis.missingConfigs.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center gap-2.5 py-3.5 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap focus:outline-none ${
                activeTab === 'checklist'
                  ? 'border-indigo-600 text-indigo-700 bg-white dark:bg-slate-900 dark:border-cyan-400 dark:text-cyan-300'
                  : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Setup Plan</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                {analysis.recommendedChecklist.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: Discovered Routes */}
        {activeTab === 'routes' && (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Contextual Description Banner */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-indigo-500 dark:text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>What routes and pages represent:</strong> Discovered HTTP endpoints, server actions, and protected page handlers audited for authentication and error handling. Click any route to inspect details.
              </span>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter paths or descriptions..."
                  value={routeSearch}
                  onChange={(e) => setRouteSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                {(['all', 'page', 'api', 'dynamic'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRouteFilter(type)}
                    className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-mono uppercase transition-colors ${
                      routeFilter === type
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200 border border-slate-300 dark:border-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Routes List with Expandable Details */}
            <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950/40">
              {filteredRoutes.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500 font-mono">
                  No routes match the selected filter.
                </div>
              ) : (
                filteredRoutes.map((route, i) => {
                  const isExpanded = expandedRouteIndex === i;
                  return (
                    <div 
                      key={i} 
                      onClick={() => setExpandedRouteIndex(isExpanded ? null : i)}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-start sm:items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-mono uppercase font-bold border ${
                            route.type === 'page'
                              ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800/50'
                              : route.type === 'api'
                              ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800/50'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/50'
                          }`}>
                            {route.type}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">{route.path}</span>
                              {route.authRequired && (
                                <span className="flex items-center gap-1 text-xs font-mono text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800/40 font-medium">
                                  <Lock className="w-3 h-3" /> auth required
                                </span>
                              )}
                            </div>
                            {route.description && (
                              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">{route.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-medium border ${
                            route.status === 'verified'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                          }`}>
                            {route.status}
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>

                      {/* Expandable Route Details */}
                      {isExpanded && (
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs sm:text-sm text-slate-600 dark:text-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg">
                          <div>
                            <span className="font-semibold block text-slate-700 dark:text-slate-200">Handler Type:</span>
                            <span>{route.type === 'page' ? 'Next.js App Router Page View' : route.type === 'api' ? 'Edge / Node Route Handler' : 'Dynamic Dynamic Slug [id]'}</span>
                          </div>
                          <div>
                            <span className="font-semibold block text-slate-700 dark:text-slate-200">Security Gate:</span>
                            <span>{route.authRequired ? 'Protected by JWT / Session Cookie Middleware' : 'Publicly accessible without authorization'}</span>
                          </div>
                          <div>
                            <span className="font-semibold block text-slate-700 dark:text-slate-200">Synthetic Status:</span>
                            <span>{route.status === 'verified' ? 'Synthetic HTTP 200 probe verified' : 'Queued for Step 6 integrity assertions'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Integrations */}
        {activeTab === 'integrations' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-indigo-500 dark:text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>What integrations represent:</strong> Third-party cloud services (Auth, Database, Payments, AI) detected from packages and source code. Shows secret configuration readiness.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.integrations.length === 0 ? (
                <div className="col-span-full p-8 text-center text-sm text-slate-500 font-mono border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                  No external services or third-party integrations detected.
                </div>
              ) : (
                analysis.integrations.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <Boxes className="w-5 h-5 text-indigo-600 dark:text-cyan-400 shrink-0" />
                          <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{item.name}</h4>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase border ${
                          item.status === 'ready'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60'
                            : item.status === 'missing_keys'
                            ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/60'
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{item.details}</p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Required Secrets:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.requiredEnvVars.map((env) => {
                          const isPresent = item.presentEnvVars.includes(env);
                          return (
                            <span
                              key={env}
                              className={`px-2 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 border ${
                                isPresent
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40'
                                  : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40'
                              }`}
                            >
                              {isPresent ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              )}
                              {env}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Missing Configs */}
        {activeTab === 'configs' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-indigo-500 dark:text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>What configuration gaps mean:</strong> Environment variables and secrets referenced in your application code that are absent from local or deployment environments. Missing secrets cause runtime exceptions during cloud deployment.
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950/60 divide-y divide-slate-200 dark:divide-slate-800">
              {analysis.missingConfigs.length === 0 ? (
                <div className="p-8 text-center text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                  All required environment variables are present and configured!
                </div>
              ) : (
                analysis.missingConfigs.map((cfg, idx) => (
                  <div key={idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-bold text-amber-700 dark:text-amber-300">{cfg.key}</span>
                        {cfg.secret && (
                          <span className="text-xs font-mono text-rose-800 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900/60 font-semibold">
                            secret key
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{cfg.purpose}</p>
                    </div>

                    <div className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 shrink-0 self-start sm:self-auto">
                      Required by: <span className="text-slate-800 dark:text-slate-200 font-bold">{cfg.requiredBy}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Recommended Checklist */}
        {activeTab === 'checklist' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <strong>Why each recommended action matters:</strong> Pre-flight remediation sequence required to pass deployment health probes:
              </span>
              <button
                type="button"
                onClick={onProceedToSetup}
                className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-500 dark:text-cyan-400 dark:hover:text-cyan-300 font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <span>Launch in Setup Pipeline</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {analysis.recommendedChecklist.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500 font-mono border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                  No automated setup steps recommended for this configuration.
                </div>
              ) : (
                analysis.recommendedChecklist.map((task, idx) => (
                  <div
                    key={task.id}
                    className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 flex items-start gap-3.5"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200 shrink-0 font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{task.title}</h4>
                        <span className={`px-2.5 py-0.5 rounded text-xs font-mono uppercase font-bold border ${
                          task.priority === 'critical'
                            ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/60'
                            : task.priority === 'high'
                            ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/60'
                            : 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800/60'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">{task.reason}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
