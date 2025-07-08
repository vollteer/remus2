import type { 
  BaseEntity, 
  VersionedEntity, 
  ValidationResult, 
  User,
  Priority,
  EntityStatus,
  ProcessingStatus 
} from './common';
import type { RequirementType, Requirement } from './requirements';

// ====================================
// CORE WORKFLOW TYPES
// ====================================

export interface WorkflowConfiguration extends VersionedEntity {
  requirementType: RequirementType;
  name: string;
  description?: string;
  configurationData: string; // JSON field containing complete workflow definition
  
  // Basic Configuration
  isDefault: boolean;
  tags: string[];
  
  // Business Rules
  maxConcurrentInstances?: number;
  timeoutHours?: number;
  escalationEnabled: boolean;
  
  // Permissions
  allowedRoles: string[];
  adminRoles: string[];
}

// The actual workflow definition stored in configurationData JSON
export interface WorkflowDefinition {
  steps: WorkflowStep[];
  transitions: WorkflowTransition[];
  rules: WorkflowRule[];
  permissions: WorkflowPermissions;
  notifications: WorkflowNotificationConfig[];
  escalations: EscalationConfig[];
  sla: WorkflowSLA;
  metadata: WorkflowMetadata;
}

// ====================================
// WORKFLOW STEPS
// ====================================

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  stepType: WorkflowStepType;
  order: number;
  
  // Step Configuration
  isRequired: boolean;
  allowSkip: boolean;
  allowGoBack: boolean;
  autoAdvance: boolean;
  
  // Time Management
  estimatedDurationHours?: number;
  maxDurationHours?: number;
  
  // Assignments & Permissions
  assignmentType: AssignmentType;
  assignedRoles: string[];
  assignedUsers: string[];
  requiredApprovers?: number; // For approval steps
  
  // Form Integration
  formConfigurationId?: string;
  formMode?: 'create' | 'edit' | 'view' | 'approve';
  requiredFields: string[];
  optionalFields: string[];
  readOnlyFields: string[];
  
  // Actions & Validations
  actions: StepAction[];
  validations: StepValidation[];
  conditions: StepCondition[];
  
  // UI Configuration
  displayConfig: StepDisplayConfig;
  
  // Integration
  externalIntegrations: ExternalIntegration[];
}

export type WorkflowStepType = 
  | 'start'
  | 'task'
  | 'approval'
  | 'review'
  | 'notification'
  | 'integration'
  | 'decision'
  | 'parallel'
  | 'merge'
  | 'end';

export type AssignmentType = 
  | 'role'
  | 'user'
  | 'group'
  | 'rule'
  | 'previous'
  | 'requester'
  | 'manager'
  | 'auto';

// ====================================
// WORKFLOW TRANSITIONS
// ====================================

export interface WorkflowTransition {
  id: string;
  name: string;
  fromStepId: string;
  toStepId: string;
  
  // Transition Rules
  conditions: TransitionCondition[];
  actions: TransitionAction[];
  
  // User Experience
  buttonText: string;
  buttonColor?: string;
  icon?: string;
  confirmationMessage?: string;
  requiresComment: boolean;
  
  // Permissions
  allowedRoles: string[];
  allowedUsers: string[];
  
  // Validation
  validations: TransitionValidation[];
  
  // Auto-transition
  isAutomatic: boolean;
  triggerEvents: string[];
  delayMinutes?: number;
}

export interface TransitionCondition {
  type: 'field' | 'role' | 'custom' | 'time' | 'data';
  field?: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'exists';
  value?: any;
  expression?: string; // For complex conditions
}

export interface TransitionAction {
  type: 'updateField' | 'sendNotification' | 'callWebhook' | 'runScript' | 'createTask';
  parameters: Record<string, any>;
  order: number;
}

export interface TransitionValidation {
  type: 'required' | 'custom' | 'approval' | 'business';
  message: string;
  expression?: string;
  severity: 'error' | 'warning';
}

// ====================================
// WORKFLOW RULES & CONDITIONS
// ====================================

export interface WorkflowRule {
  id: string;
  name: string;
  description?: string;
  ruleType: WorkflowRuleType;
  trigger: RuleTrigger;
  conditions: RuleCondition[];
  actions: RuleAction[];
  isActive: boolean;
  priority: number;
}

export type WorkflowRuleType = 
  | 'validation'
  | 'automation'
  | 'notification'
  | 'escalation'
  | 'assignment'
  | 'security';

export interface RuleTrigger {
  event: 'stepEntered' | 'stepCompleted' | 'transitionExecuted' | 'fieldChanged' | 'timeout';
  stepIds?: string[];
  fieldNames?: string[];
}

export interface RuleCondition {
  type: 'field' | 'user' | 'time' | 'data' | 'external';
  expression: string;
  parameters: Record<string, any>;
}

export interface RuleAction {
  type: 'updateField' | 'sendNotification' | 'assignUser' | 'escalate' | 'integrate';
  parameters: Record<string, any>;
  delay?: number; // minutes
}

// ====================================
// WORKFLOW INSTANCES (RUNTIME)
// ====================================

export interface WorkflowInstance extends BaseEntity {
  workflowConfigurationId: string;
  requirementId: string;
  requirement?: Requirement;
  
  // Current State
  currentStepId: string;
  currentStep?: WorkflowStep;
  status: WorkflowInstanceStatus;
  
  // Progress Tracking
  stepInstances: WorkflowStepInstance[];
  completedSteps: string[];
  
  // Time Tracking
  startedAt: string;
  expectedCompletionAt?: string;
  actualCompletionAt?: string;
  lastActivityAt: string;
  
  // Assignments
  currentAssigneeId?: string;
  currentAssignee?: User;
  
  // Data & Context
  instanceData: Record<string, any>; // Runtime data specific to this instance
  contextData: Record<string, any>; // Additional context from requirement/form
  
  // SLA & Performance
  slaStatus: SLAStatus;
  escalationLevel: number;
  overdueAt?: string;
  
  // Audit & History
  history: WorkflowInstanceHistory[];
}

export type WorkflowInstanceStatus = 
  | 'notStarted'
  | 'running'
  | 'suspended'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'escalated';

export type SLAStatus = 
  | 'onTime'
  | 'atRisk'
  | 'overdue'
  | 'breached';

// ====================================
// WORKFLOW STEP INSTANCES (RUNTIME)
// ====================================

export interface WorkflowStepInstance extends BaseEntity {
  workflowInstanceId: string;
  stepId: string;
  step?: WorkflowStep;
  
  // Status & Progress
  status: StepInstanceStatus;
  startedAt?: string;
  completedAt?: string;
  assignedAt?: string;
  
  // Assignment
  assignedToId?: string;
  assignedTo?: User;
  assignmentReason?: string;
  
  // Data
  stepData: Record<string, any>; // Data specific to this step instance
  inputData: Record<string, any>; // Data received from previous step
  outputData: Record<string, any>; // Data to pass to next step
  
  // Form Integration
  formSubmissionId?: string;
  formData?: Record<string, any>;
  
  // Actions & Comments
  actions: StepInstanceAction[];
  comments: StepInstanceComment[];
  
  // Performance & SLA
  estimatedCompletionAt?: string;
  actualDurationMinutes?: number;
  slaBreached: boolean;
  
  // Retry & Error Handling
  attemptCount: number;
  lastError?: string;
  canRetry: boolean;
}

export type StepInstanceStatus = 
  | 'pending'
  | 'assigned'
  | 'inProgress'
  | 'completed'
  | 'skipped'
  | 'failed'
  | 'cancelled';

export interface StepInstanceAction {
  id: string;
  actionType: string;
  actionData: Record<string, any>;
  executedAt: string;
  executedBy: string;
  result?: any;
  errorMessage?: string;
}

export interface StepInstanceComment {
  id: string;
  content: string;
  commentType: 'note' | 'decision' | 'question' | 'escalation';
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  attachments?: string[];
}

// ====================================
// WORKFLOW HISTORY & AUDIT
// ====================================

export interface WorkflowInstanceHistory extends BaseEntity {
  workflowInstanceId: string;
  stepInstanceId?: string;
  
  // Change Information
  eventType: WorkflowEventType;
  fromStepId?: string;
  toStepId?: string;
  
  // User & Context
  performedBy: string;
  performedByUser?: User;
  reason?: string;
  comment?: string;
  
  // Data Changes
  dataChanges: WorkflowDataChange[];
  
  // Additional Context
  metadata: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export type WorkflowEventType = 
  | 'started'
  | 'stepEntered'
  | 'stepCompleted'
  | 'stepSkipped'
  | 'transitioned'
  | 'assigned'
  | 'reassigned'
  | 'escalated'
  | 'suspended'
  | 'resumed'
  | 'cancelled'
  | 'completed'
  | 'failed'
  | 'dataUpdated';

export interface WorkflowDataChange {
  field: string;
  oldValue?: any;
  newValue?: any;
  changeType: 'created' | 'updated' | 'deleted';
}

// ====================================
// WORKFLOW PERMISSIONS & SECURITY
// ====================================

export interface WorkflowPermissions {
  defaultPermissions: StepPermissions;
  stepPermissions: Record<string, StepPermissions>;
  transitionPermissions: Record<string, TransitionPermissions>;
  dataPermissions: DataPermissions;
}

export interface StepPermissions {
  allowedRoles: string[];
  allowedUsers: string[];
  denyRoles: string[];
  requiresApproval: boolean;
  approverRoles: string[];
  delegationAllowed: boolean;
}

export interface TransitionPermissions {
  allowedRoles: string[];
  allowedUsers: string[];
  requiresElevation: boolean;
  elevatedRoles: string[];
}

export interface DataPermissions {
  readFields: Record<string, string[]>; // field -> roles
  writeFields: Record<string, string[]>; // field -> roles
  sensitiveFields: string[];
  encryptedFields: string[];
}

// ====================================
// WORKFLOW NOTIFICATIONS & ESCALATIONS
// ====================================

export interface WorkflowNotificationConfig {
  id: string;
  name: string;
  trigger: NotificationTrigger;
  recipients: NotificationRecipient[];
  template: NotificationTemplate;
  channels: NotificationChannel[];
  conditions: NotificationCondition[];
  isActive: boolean;
}

export interface NotificationTrigger {
  event: WorkflowEventType;
  stepIds?: string[];
  delay?: number; // minutes
  conditions?: string[];
}

export interface NotificationRecipient {
  type: 'role' | 'user' | 'step_assignee' | 'requester' | 'manager' | 'custom';
  value?: string;
  expression?: string; // For custom recipients
}

export interface NotificationTemplate {
  subject: string;
  body: string;
  bodyHtml?: string;
  variables: Record<string, string>;
}

export type NotificationChannel = 'email' | 'inApp' | 'sms' | 'teams' | 'slack' | 'webhook';

export interface NotificationCondition {
  field: string;
  operator: string;
  value: any;
}

export interface EscalationConfig {
  id: string;
  name: string;
  stepIds: string[];
  triggerAfterHours: number;
  escalationLevels: EscalationLevel[];
  isActive: boolean;
}

export interface EscalationLevel {
  level: number;
  delayHours: number;
  assignToRoles: string[];
  assignToUsers: string[];
  notificationTemplate: NotificationTemplate;
  actions: EscalationAction[];
}

export interface EscalationAction {
  type: 'reassign' | 'notify' | 'updatePriority' | 'custom';
  parameters: Record<string, any>;
}

// ====================================
// WORKFLOW SLA & PERFORMANCE
// ====================================

export interface WorkflowSLA {
  enabled: boolean;
  overallTimeoutHours: number;
  stepSLAs: Record<string, StepSLA>;
  businessHours: BusinessHours;
  holidays: Holiday[];
  escalationConfig: SLAEscalationConfig;
}

export interface StepSLA {
  stepId: string;
  estimatedHours: number;
  maxHours: number;
  warningHours: number;
  businessHoursOnly: boolean;
}

export interface BusinessHours {
  monday: TimeRange[];
  tuesday: TimeRange[];
  wednesday: TimeRange[];
  thursday: TimeRange[];
  friday: TimeRange[];
  saturday: TimeRange[];
  sunday: TimeRange[];
  timezone: string;
}

export interface TimeRange {
  start: string; // HH:mm format
  end: string;   // HH:mm format
}

export interface Holiday {
  date: string;
  name: string;
  isRecurring: boolean;
}

export interface SLAEscalationConfig {
  warningEnabled: boolean;
  warningBeforeHours: number;
  breachActions: EscalationAction[];
}

// ====================================
// WORKFLOW ANALYTICS & REPORTING
// ====================================

export interface WorkflowMetrics {
  configurationId: string;
  requirementType: RequirementType;
  
  // Instance Metrics
  totalInstances: number;
  activeInstances: number;
  completedInstances: number;
  averageCompletionTimeHours: number;
  
  // Step Performance
  stepMetrics: Record<string, StepMetrics>;
  bottleneckSteps: string[];
  
  // SLA Performance
  slaCompliance: number; // percentage
  averageOverdueHours: number;
  escalationRate: number; // percentage
  
  // User Performance
  userMetrics: Record<string, UserWorkflowMetrics>;
  
  // Trends
  completionTrend: TrendData[];
  volumeTrend: TrendData[];
  
  // Quality Metrics
  reworkRate: number; // percentage
  firstPassYield: number; // percentage
  customerSatisfaction?: number;
}

export interface StepMetrics {
  stepId: string;
  totalExecutions: number;
  averageDurationHours: number;
  completionRate: number;
  escalationRate: number;
  skipRate: number;
  errorRate: number;
}

export interface UserWorkflowMetrics {
  userId: string;
  assignedTasks: number;
  completedTasks: number;
  averageCompletionTime: number;
  slaCompliance: number;
  escalationCount: number;
}

export interface TrendData {
  date: string;
  value: number;
  label?: string;
}

// ====================================
// STEP DISPLAY & UI CONFIGURATION
// ====================================

export interface StepDisplayConfig {
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  
  // Layout
  layout: 'default' | 'compact' | 'detailed' | 'wizard';
  showProgress: boolean;
  showTimer: boolean;
  showComments: boolean;
  showHistory: boolean;
  
  // Actions
  primaryAction?: ActionConfig;
  secondaryActions?: ActionConfig[];
  
  // Help & Guidance
  helpText?: string;
  helpUrl?: string;
  examples?: string[];
}

export interface ActionConfig {
  label: string;
  icon?: string;
  color?: string;
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  requiresConfirmation: boolean;
  confirmationMessage?: string;
}

// ====================================
// STEP ACTIONS & VALIDATIONS
// ====================================

export interface StepAction {
  id: string;
  name: string;
  actionType: StepActionType;
  trigger: ActionTrigger;
  configuration: Record<string, any>;
  isRequired: boolean;
  order: number;
  conditions: ActionCondition[];
}

export type StepActionType = 
  | 'updateData'
  | 'sendNotification'
  | 'callWebservice'
  | 'generateDocument'
  | 'sendEmail'
  | 'createTask'
  | 'updateExternal'
  | 'runScript';

export interface ActionTrigger {
  event: 'onEnter' | 'onComplete' | 'onSkip' | 'onTimeout' | 'onCancel';
}

export interface ActionCondition {
  field: string;
  operator: string;
  value: any;
}

export interface StepValidation {
  id: string;
  name: string;
  validationType: StepValidationType;
  expression: string;
  errorMessage: string;
  severity: 'error' | 'warning' | 'info';
  isRequired: boolean;
}

export type StepValidationType = 
  | 'fieldRequired'
  | 'fieldFormat'
  | 'businessRule'
  | 'external'
  | 'custom';

export interface StepCondition {
  id: string;
  name: string;
  expression: string;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require';
  targets: string[]; // field names or step elements
}

// ====================================
// EXTERNAL INTEGRATIONS
// ====================================

export interface ExternalIntegration {
  id: string;
  name: string;
  integrationType: 'webhook' | 'api' | 'queue' | 'file' | 'database';
  endpoint: string;
  method?: string;
  headers?: Record<string, string>;
  authentication?: IntegrationAuth;
  dataMapping: DataMapping[];
  timeout: number;
  retryCount: number;
  isActive: boolean;
}

export interface IntegrationAuth {
  type: 'none' | 'basic' | 'bearer' | 'apiKey' | 'oauth';
  credentials: Record<string, string>;
}

export interface DataMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
  defaultValue?: any;
}

// ====================================
// WORKFLOW METADATA
// ====================================

export interface WorkflowMetadata {
  category: string;
  tags: string[];
  documentation?: string;
  changeLog: ChangeLogEntry[];
  testScenarios: TestScenario[];
  dependencies: string[];
  compatibilityVersion: string;
}

export interface ChangeLogEntry {
  version: string;
  date: string;
  author: string;
  changes: string[];
  breaking: boolean;
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  testData: Record<string, any>;
  expectedOutcome: string;
  lastTested?: string;
  testResult?: 'passed' | 'failed' | 'pending';
}
