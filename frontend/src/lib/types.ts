export type Stage = 'understand' | 'setup' | 'verify' | 'receipt';

export type TaskStatus =
  | 'pending'
  | 'running'
  | 'awaiting_approval'
  | 'completed'
  | 'failed'
  | 'requires_manual_action';

export interface RouteItem {
  path: string;
  type: 'page' | 'api' | 'dynamic' | 'server_action';
  authRequired: boolean;
  status: 'detected' | 'verified' | 'unverified';
  description?: string;
}

export interface IntegrationItem {
  name: string;
  category: 'auth' | 'database' | 'ai' | 'payments' | 'storage' | 'analytics';
  status: 'configured' | 'missing_keys' | 'untested' | 'ready';
  details: string;
  requiredEnvVars: string[];
  presentEnvVars: string[];
}

export interface RecommendedTaskItem {
  id: string;
  title: string;
  category: 'config' | 'security' | 'database' | 'smoke_test';
  priority: 'critical' | 'high' | 'recommended';
  reason: string;
}

export interface AppAnalysis {
  analysisId: string;
  timestamp: string;
  targetApp: {
    name: string;
    url: string;
    repoUrl?: string;
    detectedFramework: string;
    nodeVersion?: string;
    buildTool?: string;
  };
  metrics: {
    totalRoutes: number;
    dynamicRoutes: number;
    apiEndpoints: number;
    detectedIntegrations: number;
    missingConfigsCount: number;
  };
  routes: RouteItem[];
  integrations: IntegrationItem[];
  missingConfigs: Array<{
    key: string;
    purpose: string;
    requiredBy: string;
    secret: boolean;
  }>;
  recommendedChecklist: RecommendedTaskItem[];
}

export interface TaskLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  commandSnippet?: string;
}

export interface ApprovalRequest {
  taskId: string;
  actionTitle: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  resourceImpacted: string;
  commandPreview: string;
  diffSummary?: string;
  warningNote: string;
}

export interface SetupTask {
  id: string;
  order: number;
  title: string;
  description: string;
  category: 'env' | 'database' | 'auth' | 'webhooks' | 'build' | 'config' | 'smoke_test';
  status: TaskStatus;
  isSensitive: boolean;
  durationMs?: number;
  approvalRequest?: ApprovalRequest;
  logs: TaskLogEntry[];
  failureReason?: string;
  suggestedFix?: string;
}

export interface SetupRun {
  runId: string;
  analysisId: string;
  startedAt: string;
  completedAt?: string;
  overallStatus: 'idle' | 'running' | 'paused_for_approval' | 'completed' | 'failed';
  currentTaskId?: string;
  progressPercentage: number;
  tasks: SetupTask[];
}

export interface VerificationCheck {
  id: string;
  name: string;
  category: 'health' | 'auth' | 'database' | 'webhooks' | 'performance';
  status: 'passed' | 'failed' | 'manual_required' | 'skipped';
  endpointTested?: string;
  responseTimeMs?: number;
  statusCode?: number;
  evidence: string;
  remedy?: string;
  manualInstructions?: string[];
}

export interface SetupReceipt {
  receiptId: string;
  runId: string;
  generatedAt: string;
  targetApp: {
    name: string;
    url: string;
    repoUrl?: string;
    commitHash?: string;
    environment: 'staging' | 'preview' | 'production';
  };
  auditSignature: string;
  status: 'ready_to_ship' | 'blocked_by_manual_action' | 'verification_failed';
  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
    manualRequired: number;
  };
  checks: VerificationCheck[];
  unresolvedActionItems: string[];
}

export interface DemoPreset {
  id: string;
  label: string;
  appName: string;
  appUrl: string;
  repoUrl: string;
  description: string;
  analysisData: AppAnalysis;
  setupRunData: SetupRun;
  receiptData: SetupReceipt;
}
