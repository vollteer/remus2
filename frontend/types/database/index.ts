// ====================================
// MAIN EXPORTS - ALL DATABASE TYPES
// ====================================

// Common/Shared Types
export * from './common';

// Domain-Specific Types
export * from './forms';
export * from './requirements';
export * from './workflows';
export * from './config-management';

// ====================================
// CONVENIENCE RE-EXPORTS
// ====================================

// Most commonly used types for easy importing
export type {
  // Common Base Types
  BaseEntity,
  VersionedEntity,
  SoftDeleteEntity,
  ApiResponse,
  PaginatedResponse,
  ValidationResult,
  SearchRequest,
  User,
  UserRole,
  AuditLog,
  
  // Form Types
  FormConfiguration,
  FormField,
  FormSection,
  FormDeployment,
  FormSubmission,
  FieldType,
  FieldPermissions,
  FormPermissions,
  FormUsageStats,
  FormTemplate,
  
  // Requirement Types
  Requirement,
  RequirementType,
  RequirementStatus,
  RequirementComment,
  RequirementAttachment,
  RequirementTypeConfiguration,
  RequirementTemplate,
  RequirementMetrics,
  RequirementSearchCriteria,
  
  // Workflow Types
  WorkflowConfiguration,
  WorkflowDefinition,
  WorkflowStep,
  WorkflowTransition,
  WorkflowInstance,
  WorkflowStepInstance,
  WorkflowInstanceStatus,
  WorkflowStepType,
  WorkflowRule,
  WorkflowPermissions,
  WorkflowMetrics,
  
  // Config Management Types
  ConfigurationExport,
  ConfigurationImport,
  ImportMappingRule,
  ExportFormat,
  ImportResult,
  ValidationError,
  SystemBackup,
  
} from './common';

// ====================================
// TYPE GUARDS & UTILITIES
// ====================================

// Type Guards for Runtime Type Checking
export const isFormConfiguration = (obj: any): obj is import('./forms').FormConfiguration => {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' && 
         typeof obj.requirementType === 'string' && 
         Array.isArray(obj.fields) && 
         Array.isArray(obj.sections);
};

export const isRequirement = (obj: any): obj is import('./requirements').Requirement => {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' && 
         typeof obj.shortDescription === 'string' && 
         typeof obj.requirementType === 'string';
};

export const isWorkflowInstance = (obj: any): obj is import('./workflows').WorkflowInstance => {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' && 
         typeof obj.workflowConfigurationId === 'string' && 
         typeof obj.requirementId === 'string' && 
         typeof obj.currentStepId === 'string';
};

export const isApiResponse = <T>(obj: any): obj is import('./common').ApiResponse<T> => {
  return obj && typeof obj === 'object' && typeof obj.success === 'boolean';
};

// ====================================
// UTILITY TYPES FOR COMMON PATTERNS
// ====================================

// Create request types (without generated fields)
export type CreateFormConfigurationRequest = Omit<
  import('./forms').FormConfiguration, 
  'id' | 'createdAt' | 'modifiedAt' | 'version'
>;

export type CreateRequirementRequest = Omit<
  import('./requirements').Requirement, 
  'id' | 'createdAt' | 'modifiedAt' | 'status' | 'requester' | 'assignedTo' | 'technicalLead'
> & {
  requesterId: string;
  assignedToId?: string;
  technicalLeadId?: string;
};

export type CreateWorkflowInstanceRequest = Omit<
  import('./workflows').WorkflowInstance, 
  'id' | 'createdAt' | 'modifiedAt' | 'stepInstances' | 'history' | 'currentStep' | 'requirement' | 'currentAssignee'
>;

// Update request types (partial with some required fields)
export type UpdateFormConfigurationRequest = Partial<CreateFormConfigurationRequest> & {
  id: string;
  version: number;
};

export type UpdateRequirementRequest = Partial<
  Pick<import('./requirements').Requirement, 
    'shortDescription' | 'detailedDescription' | 'priority' | 'targetDate' | 'businessJustification' |
    'expectedBenefit' | 'estimatedCost' | 'assignedToId' | 'technicalLeadId' | 'tags' | 'customFields'
  >
> & {
  id: string;
};

export type UpdateWorkflowInstanceRequest = Partial<
  Pick<import('./workflows').WorkflowInstance,
    'currentStepId' | 'currentAssigneeId' | 'instanceData' | 'status'
  >
> & {
  id: string;
};

// ====================================
// SEARCH & FILTER TYPES
// ====================================

// Combined search type for global search across all entities
export interface GlobalSearchRequest extends import('./common').SearchRequest {
  entityTypes?: ('forms' | 'requirements' | 'workflows')[];
  requirementTypes?: import('./requirements').RequirementType[];
  formTypes?: string[];
  workflowStatuses?: import('./workflows').WorkflowInstanceStatus[];
}

export interface GlobalSearchResult {
  forms: import('./forms').FormConfiguration[];
  requirements: import('./requirements').Requirement[];
  workflows: import('./workflows').WorkflowInstance[];
  totalCount: number;
  facets: SearchFacet[];
}

export interface SearchFacet {
  field: string;
  values: FacetValue[];
}

export interface FacetValue {
  value: string;
  count: number;
  label?: string;
}

// ====================================
// DASHBOARD & ANALYTICS TYPES
// ====================================

export interface DashboardData {
  summary: DashboardSummary;
  recentActivity: RecentActivity[];
  metrics: DashboardMetrics;
  alerts: DashboardAlert[];
}

export interface DashboardSummary {
  totalRequirements: number;
  activeWorkflows: number;
  formsInUse: number;
  pendingApprovals: number;
  overdueItems: number;
}

export interface RecentActivity {
  id: string;
  type: 'requirement' | 'workflow' | 'form';
  action: string;
  description: string;
  entityId: string;
  entityName: string;
  userId: string;
  userName: string;
  timestamp: string;
  priority?: import('./common').Priority;
}

export interface DashboardMetrics {
  requirementMetrics: import('./requirements').RequirementMetrics;
  workflowMetrics: Record<string, import('./workflows').WorkflowMetrics>;
  formMetrics: Record<string, import('./forms').FormUsageStats>;
  performanceMetrics: PerformanceMetrics;
}

export interface PerformanceMetrics {
  averageRequirementResolutionDays: number;
  workflowCompletionRate: number;
  formSubmissionSuccessRate: number;
  userSatisfactionScore: number;
  systemUptime: number;
}

export interface DashboardAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  severity: import('./common').Priority;
  entityType: string;
  entityId: string;
  actionRequired: boolean;
  actionUrl?: string;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

// ====================================
// CONFIGURATION & SYSTEM TYPES
// ====================================

export interface SystemConfiguration {
  forms: FormSystemConfig;
  requirements: RequirementSystemConfig;
  workflows: WorkflowSystemConfig;
  security: SecurityConfig;
  integrations: IntegrationConfig;
  notifications: NotificationConfig;
}

export interface FormSystemConfig {
  maxFieldsPerForm: number;
  maxSectionsPerForm: number;
  enableVersioning: boolean;
  enableLightMode: boolean;
  autoSaveIntervalSeconds: number;
  validationEnabled: boolean;
  permissionsEnabled: boolean;
}

export interface RequirementSystemConfig {
  enableWorkflowIntegration: boolean;
  enableFormIntegration: boolean;
  defaultRequirementType: import('./requirements').RequirementType;
  enableSLATracking: boolean;
  enableCustomFields: boolean;
  maxAttachmentSizeMB: number;
  enableComments: boolean;
}

export interface WorkflowSystemConfig {
  enableParallelExecution: boolean;
  maxConcurrentInstances: number;
  defaultTimeoutHours: number;
  enableEscalation: boolean;
  enableSLAMonitoring: boolean;
  enableAnalytics: boolean;
  retentionDays: number;
}

export interface SecurityConfig {
  enableRoleBasedAccess: boolean;
  enableFieldLevelSecurity: boolean;
  enableAuditLogging: boolean;
  sessionTimeoutMinutes: number;
  passwordPolicy: PasswordPolicy;
  mfaEnabled: boolean;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number;
  preventReuse: number;
}

export interface IntegrationConfig {
  enableWebhooks: boolean;
  enableRestApi: boolean;
  enableFileImport: boolean;
  enableFileExport: boolean;
  externalSystemsEnabled: string[];
  rateLimitPerMinute: number;
}

export interface NotificationConfig {
  enableEmailNotifications: boolean;
  enableInAppNotifications: boolean;
  enableSmsNotifications: boolean;
  enableTeamsIntegration: boolean;
  enableSlackIntegration: boolean;
  defaultNotificationChannels: import('./common').NotificationType[];
}

// ====================================
// BULK OPERATIONS
// ====================================

export interface BulkOperation<T = any> {
  id: string;
  operationType: string;
  entityType: 'forms' | 'requirements' | 'workflows';
  entityIds: string[];
  parameters: Record<string, any>;
  status: import('./common').ProcessingStatus;
  progress: BulkOperationProgress;
  result?: BulkOperationResult<T>;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface BulkOperationProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  percentage: number;
  estimatedRemainingMinutes?: number;
}

export interface BulkOperationResult<T = any> {
  successfulItems: T[];
  failedItems: BulkOperationFailedItem[];
  summary: BulkOperationSummary;
}

export interface BulkOperationFailedItem {
  entityId: string;
  errorCode: string;
  errorMessage: string;
  originalData?: any;
}

export interface BulkOperationSummary {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  executionTimeMs: number;
  throughputPerSecond: number;
}

// ====================================
// EXTENSION POINTS
// ====================================

// Allow for custom extensions without breaking existing types
export interface CustomExtensions {
  customFormFields?: Record<string, any>;
  customRequirementFields?: Record<string, any>;
  customWorkflowSteps?: Record<string, any>;
  customValidations?: Record<string, any>;
  customIntegrations?: Record<string, any>;
}

// Plugin system types
export interface PluginDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  dependencies: string[];
  hooks: PluginHook[];
  configuration: Record<string, any>;
  isEnabled: boolean;
}

export interface PluginHook {
  hookName: string;
  hookType: 'before' | 'after' | 'replace';
  targetFunction: string;
  priority: number;
  condition?: string;
}

// ====================================
// VERSION COMPATIBILITY
// ====================================

export interface ApiVersion {
  version: string;
  releaseDate: string;
  deprecationDate?: string;
  supportedUntil?: string;
  breaking: boolean;
  features: string[];
  removedFeatures: string[];
  migrationGuide?: string;
}

export interface SchemaVersion {
  version: string;
  appliedAt: string;
  appliedBy: string;
  changes: SchemaChange[];
  rollbackScript?: string;
}

export interface SchemaChange {
  type: 'create' | 'alter' | 'drop' | 'data';
  entity: string;
  description: string;
  script: string;
  rollback?: string;
}