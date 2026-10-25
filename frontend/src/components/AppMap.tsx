'use client';

import React, { useState } from 'react';
import { AppAnalysis, RouteItem, IntegrationItem } from '@/lib/types';
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
  Info,
  Sparkles,
  Zap,
  Globe,
  Database,
  Cpu,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AppMapProps {
  analysis: AppAnalysis;
  onProceedToSetup: () => void;
  onProceedToDiagnosis?: () => void;
  isDemoData: boolean;
}

interface GraphNode {
  id: string;
  label: string;
  sublabel: string;
  category: 'core' | 'route' | 'integration' | 'gap';
  status: 'healthy' | 'warning' | 'critical' | 'neutral';
  x: number;
  y: number;
  details: string;
  envKeys?: string[];
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

  // Filter routes
  const filteredRoutes = analysis.routes.filter((route) => {
    const matchesSearch = route.path.toLowerCase().includes(routeSearch.toLowerCase()) ||
      (route.description && route.description.toLowerCase().includes(routeSearch.toLowerCase()));
    const matchesType = routeFilter === 'all' || route.type === routeFilter;
    return matchesSearch && matchesType;
  });

  // Synthesize interactive SVG graph nodes based on analysis data
  const centerNode: GraphNode = {
    id: 'core-app',
    label: analysis.targetApp.name,
    sublabel: analysis.targetApp.detectedFramework,
    category: 'core',
    status: 'healthy',
    x: 400,
    y: 200,
    details: `Target framework: ${analysis.targetApp.detectedFramework} on ${analysis.targetApp.url}`,
  };

  // Generate orbit nodes
  const nodes: GraphNode[] = React.useMemo(() => {
    const list: GraphNode[] = [centerNode];

    // Routes (top left & bottom left)
    const topRoutes = analysis.routes.slice(0, 4);
    topRoutes.forEach((r, idx) => {
      const angle = Math.PI * (0.8 + idx * 0.28);
      const radius = 175;
      list.push({
        id: `route-${idx}`,
        label: r.path,
        sublabel: r.type.toUpperCase(),
        category: 'route',
        status: r.authRequired ? 'warning' : 'healthy',
        x: Math.round(400 + radius * Math.cos(angle)),
        y: Math.round(200 + radius * Math.sin(angle)),
        details: r.description || `Application endpoint: ${r.path} (${r.type})`,
      });
    });

    // Integrations (top right & bottom right)
    const topIntegrations = analysis.integrations.slice(0, 4);
    topIntegrations.forEach((intg, idx) => {
      const angle = Math.PI * (-0.25 + idx * 0.26);
      const radius = 185;
      list.push({
        id: `intg-${idx}`,
        label: intg.name,
        sublabel: intg.category.toUpperCase(),
        category: 'integration',
        status: intg.status === 'missing_keys' ? 'warning' : 'healthy',
        x: Math.round(400 + radius * Math.cos(angle)),
        y: Math.round(200 + radius * Math.sin(angle)),
        details: intg.details,
        envKeys: intg.requiredEnvVars,
      });
    });

    // Config Gaps (bottom center)
    const gaps = analysis.missingConfigs.slice(0, 3);
    gaps.forEach((gap, idx) => {
      const angle = Math.PI * (0.42 + idx * 0.16);
      const radius = 175;
      list.push({
        id: `gap-${idx}`,
        label: gap.key,
        sublabel: 'MISSING SECRET',
        category: 'gap',
        status: 'critical',
        x: Math.round(400 + radius * Math.cos(angle)),
        y: Math.round(200 + radius * Math.sin(angle)),
        details: `Required by: ${gap.requiredBy} — ${gap.purpose}`,
      });
    });

    return list;
  }, [analysis, centerNode]);

  // Selected node for interactive side panel
  const [selectedNode, setSelectedNode] = useState<GraphNode>(centerNode);

  return (
    <div className="space-y-6">
      {/* 1. Header Overview & Metrics Banner */}
      <div className="rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 backdrop-blur-2xl shadow-xl transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
                {analysis.targetApp.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/60 dark:text-cyan-400 dark:border-cyan-500/30">
                {analysis.targetApp.detectedFramework}
              </span>
              {isDemoData && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  VERIFIED DEMO SCENARIO
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono">
              <a 
                href={analysis.targetApp.url} 
                target="_blank" 
                rel="noreferrer" 
                className="text-violet-600 dark:text-cyan-400 hover:underline flex items-center gap-1 transition-colors"
              >
                <span>{analysis.targetApp.url}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
              {analysis.targetApp.repoUrl && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <a 
                    href={analysis.targetApp.repoUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-violet-600 dark:text-cyan-400 hover:underline flex items-center gap-1 transition-colors"
                  >
                    <span>{analysis.targetApp.repoUrl.replace('https://github.com/', '')}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onProceedToDiagnosis || onProceedToSetup}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:brightness-110 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-violet-500/25 transition-all shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            <span>{onProceedToDiagnosis ? 'Proceed to Diagnostics' : 'Initialize Setup Run'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Telemetry Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-5">
          <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-3.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
              Total Routes
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                {analysis.metrics.totalRoutes}
              </span>
              <span className="text-[11px] text-slate-400">({analysis.metrics.dynamicRoutes} dynamic)</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-3.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
              API Endpoints
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-violet-600 dark:text-cyan-400 font-mono">
                {analysis.metrics.apiEndpoints}
              </span>
              <span className="text-[11px] text-slate-400">handlers</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-3.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
              Integrations
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                {analysis.metrics.detectedIntegrations}
              </span>
              <span className="text-[11px] text-slate-400">services</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-3.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
              Config Gaps
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className={`text-2xl font-extrabold font-mono ${analysis.metrics.missingConfigsCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {analysis.metrics.missingConfigsCount}
              </span>
              <span className="text-[11px] text-slate-400">missing keys</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SIGNATURE MOMENT: Self-Building SVG Node-and-Edge Architecture Graph */}
      <div className="rounded-3xl p-6 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 backdrop-blur-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-800 dark:text-slate-200 font-bold">
              Interactive Architecture Graph
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Routes
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-400" /> Services
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Config Gaps
            </span>
          </div>
        </div>

        {/* Graph Canvas & Side Inspector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* SVG Canvas Area */}
          <div className="lg:col-span-8 relative bg-slate-900/40 rounded-2xl border border-slate-200/40 dark:border-white/[0.06] overflow-hidden p-2">
            <svg 
              viewBox="0 0 800 400" 
              className="w-full h-auto max-h-[380px] select-none"
            >
              <defs>
                <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="gapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Connecting Edges with Drawing Stroke Animation */}
              {nodes.filter(n => n.id !== 'core-app').map((node, i) => {
                const isGap = node.category === 'gap';
                return (
                  <motion.line
                    key={`edge-${node.id}`}
                    x1={centerNode.x}
                    y1={centerNode.y}
                    x2={node.x}
                    y2={node.y}
                    stroke={isGap ? 'url(#gapGradient)' : 'url(#edgeGradient)'}
                    strokeWidth={isGap ? 1.5 : 1}
                    strokeDasharray={isGap ? '4 3' : 'none'}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: i * 0.08 }}
                  />
                );
              })}

              {/* Central Core Application Node */}
              <g 
                onClick={() => setSelectedNode(centerNode)} 
                className="cursor-pointer group"
              >
                <circle
                  cx={centerNode.x}
                  cy={centerNode.y}
                  r="34"
                  fill="#0c101d"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                  className="filter drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                />
                <circle
                  cx={centerNode.x}
                  cy={centerNode.y}
                  r="40"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                  className="animate-ping"
                  style={{ transformOrigin: `${centerNode.x}px ${centerNode.y}px` }}
                />
                <text
                  x={centerNode.x}
                  y={centerNode.y + 3}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  APP CORE
                </text>
              </g>

              {/* Orbiting Child Nodes */}
              {nodes.filter(n => n.id !== 'core-app').map((node, i) => {
                const isSelected = selectedNode.id === node.id;
                const isGap = node.category === 'gap';
                const isIntegration = node.category === 'integration';

                let fillColor = '#0c101d';
                let strokeColor = '#06b6d4';
                if (isGap) strokeColor = '#f43f5e';
                else if (isIntegration) strokeColor = '#a855f7';

                return (
                  <motion.g
                    key={node.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer"
                  >
                    {/* Pulsing ring for gaps */}
                    {isGap && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="20"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="1.5"
                        strokeOpacity="0.5"
                        className="animate-ping"
                        style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                      />
                    )}

                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? "17" : "14"}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? "2.5" : "1.5"}
                      className="transition-all"
                    />

                    {/* Node label under node */}
                    <text
                      x={node.x}
                      y={node.y + 24}
                      textAnchor="middle"
                      fill={isGap ? '#f43f5e' : '#cbd5e1'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {node.label.length > 14 ? node.label.substring(0, 12) + '…' : node.label}
                    </text>
                  </motion.g>
                );
              })}
            </svg>
          </div>

          {/* Side Node Detail Inspector Card */}
          <div className="lg:col-span-4 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-white/[0.06]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                Node Inspector
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                selectedNode.status === 'critical' 
                  ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                  : selectedNode.status === 'warning'
                  ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
              }`}>
                {selectedNode.sublabel}
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white font-mono break-all">
                {selectedNode.label}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {selectedNode.details}
              </p>
            </div>

            {selectedNode.envKeys && selectedNode.envKeys.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-white/[0.06]">
                <span className="text-[11px] font-mono text-slate-400 block font-semibold">
                  Required Environment Keys:
                </span>
                <div className="space-y-1">
                  {selectedNode.envKeys.map((k) => (
                    <div key={k} className="text-[11px] font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 text-cyan-400 border border-slate-200 dark:border-white/[0.06]">
                      {k}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 text-[11px] text-slate-400 font-mono">
              Click any node in the graph to inspect its route handlers, security requirements, and environment keys.
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tabbed Audit Breakdowns (Routes, Integrations, Configs, Setup Plan) */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c101d]/75 backdrop-blur-2xl shadow-xl overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200/80 dark:border-white/[0.08] px-4 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('routes')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'routes'
                ? 'border-cyan-400 text-violet-700 dark:text-cyan-300'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Discovered Routes ({analysis.routes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'integrations'
                ? 'border-cyan-400 text-violet-700 dark:text-cyan-300'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Detected Integrations ({analysis.integrations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('configs')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'configs'
                ? 'border-cyan-400 text-violet-700 dark:text-cyan-300'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Missing Configs ({analysis.missingConfigs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'checklist'
                ? 'border-cyan-400 text-violet-700 dark:text-cyan-300'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Checklist ({analysis.recommendedChecklist.length})</span>
          </button>
        </div>

        {/* Tab 1: Routes */}
        {activeTab === 'routes' && (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter endpoints..."
                  value={routeSearch}
                  onChange={(e) => setRouteSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                {(['all', 'page', 'api', 'dynamic'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRouteFilter(type)}
                    className={`px-3 py-1 rounded-xl text-xs font-mono uppercase transition-colors ${
                      routeFilter === type
                        ? 'bg-violet-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/[0.06] border border-slate-200/80 dark:border-white/[0.06] rounded-xl overflow-hidden">
              {filteredRoutes.map((route, i) => {
                const isExpanded = expandedRouteIndex === i;
                return (
                  <div
                    key={i}
                    onClick={() => setExpandedRouteIndex(isExpanded ? null : i)}
                    className="p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                          route.type === 'page'
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            : route.type === 'api'
                            ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {route.type}
                        </span>
                        <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                          {route.path}
                        </span>
                        {route.authRequired && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-semibold">
                            <Lock className="w-2.5 h-2.5" /> auth required
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className="text-[11px] font-mono text-emerald-500">
                          {route.status}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    {isExpanded && route.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 pl-2 border-l-2 border-violet-500">
                        {route.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Integrations */}
        {activeTab === 'integrations' && (
          <div className="p-5 sm:p-6 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {analysis.integrations.map((intg, i) => (
                <div 
                  key={i}
                  className="p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                      {intg.name}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      intg.status === 'configured'
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                    }`}>
                      {intg.status === 'configured' ? 'CONFIGURED' : 'KEYS REQUIRED'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {intg.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Missing Configs */}
        {activeTab === 'configs' && (
          <div className="p-5 sm:p-6 space-y-3">
            <div className="space-y-2">
              {analysis.missingConfigs.map((cfg, i) => (
                <div 
                  key={i}
                  className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-amber-500" />
                      <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {cfg.key}
                      </span>
                      {cfg.secret && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold">
                          SECRET
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {cfg.purpose} · Required by <span className="font-semibold text-slate-700 dark:text-slate-300">{cfg.requiredBy}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Checklist */}
        {activeTab === 'checklist' && (
          <div className="p-5 sm:p-6 space-y-3">
            <div className="space-y-2">
              {analysis.recommendedChecklist.map((task) => (
                <div 
                  key={task.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white block">
                        {task.title}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{task.reason}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                    task.priority === 'critical'
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 font-bold'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
