import type { 
  BaseEntity, 
  VersionedEntity, 
  SoftDeleteEntity, 
  ValidationResult, 
  Priority,
  EntityStatus,
  FileInfo,
  User,
  AuditLog 
} from './common';

// ====================================
// CORE REQUIREMENT TYPES
// ====================================

export interface Requirement extends BaseEntity {
  // Basic Information
  shortDescription: string;
  detailedDescription?: string;
  requirementType: RequirementType;
  priority: Priority;
  status: RequirementStatus;
  
  // Business Context
  businessJustification?: string;
  expectedBenefit?: string;
  riskAssessment?: string;
  
  // Financial Information
  estimatedCost?: number;
  actualCost?: number;
  budgetCode?: string;
  costCenter?: string;
  
  // Dates & Timeline
  requestedDate: string;
  targetDate?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  
  // Ownership & Assignment
  requesterId: string;
  requester: User;
  assignedToId?: string;
  assignedTo?: User;
  technicalLeadId?: string;
  technicalLead?: User;
  
  // Form & Workflow Integration
  formConfigurationId?: string;
  formData?: Record<string, any>; // JSON field - submitted form data
  workflowInstanceId?: string;
  currentWorkflowStepId?: string;
  
  // Dependencies & Relations
  parentRequirementId?: string;
  parentRequirement?: Requirement;
  childRequirements?: Requirement[];
  relatedRequirements?: RequirementRelation[];
  
  // Attachments & Documentation
  attachments: RequirementAttachment[];
  comments: RequirementComment[];
  
  // Compliance & Security
  complianceRelevant: boolean;
  securityRelevant: boolean;
  dataProtectionRelevant: boolean;
  complianceNotes?: string;
  
  // Quality & Testing
  acceptanceCriteria?: string;
  testCriteria?: string;
  qualityGatesPassed?: boolean;
  
  // External References
  externalSystemId?: string;
  externalTicketId?: string;
  sourceSystem?: string;
  
  // Metadata
  tags: string[];
  customFields?: Record<string, any>; // JSON field for extensibility
  lastStatusChange: string;
  lastAssignmentChange?: string;
}

export type RequirementType = 
  | 'Kleinanforderung'
  | 'Großanforderung' 
  | 'TIA-Anforderung'
  | 'Supportleistung'
  | 'Betriebsauftrag'
  | 'SBBI-Lösung'
  | 'AWG-Release'
  | 'AWS-Release';

export type RequirementStatus = 
  | 'draft'
  | 'submitted' 
  | 'inReview'
  | 'approved'
  | 'rejected'
  | 'inProgress'
  | 'testing'
  | 'completed'
  | 'closed'
  | 'cancelled'
  | 'onHold';

// ====================================
// REQUIREMENT RELATIONS & DEPENDENCIES
// ====================================

export interface RequirementRelation extends BaseEntity {
  sourceRequirementId: string;
  targetRequirementId: string;
  relationType: RequirementRelationType;
  description?: string;
  isActive: boolean;
}

export type RequirementRelationType = 
  | 'blocks'
  | 'blockedBy'
  | 'dependsOn'
  | 'prerequisiteFor'
  | 'duplicateOf'
  | 'relatedTo'
  | 'mergedInto'
  | 'splitFrom';

// ====================================
// ATTACHMENTS & DOCUMENTATION
// ====================================

export interface RequirementAttachment extends BaseEntity {
  requirementId: string;
  fileInfo: FileInfo;
  attachmentType: RequirementAttachmentType;
  description?: string;
  isPublic: boolean;
  order: number;
}

export type RequirementAttachmentType = 
  | 'specification'
  | 'mockup'
  | 'diagram'
  | 'contract'
  | 'documentation'
  | 'testPlan'
  | 'approval'
  | 'other';

// ====================================
// COMMENTS & COLLABORATION
// ====================================

export interface RequirementComment extends BaseEntity {
  requirementId: string;
  parentCommentId?: string; // For threaded comments
  content: string;
  commentType: RequirementCommentType;
  isInternal: boolean;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  mentions: string[]; // User IDs mentioned in comment
  reactions: CommentReaction[];
}

export type RequirementCommentType = 
  | 'general'
  | 'question'
  | 'suggestion'
  | 'issue'
  | 'approval'
  | 'rejection'
  | 'statusUpdate'
  | 'systemGenerated';

export interface CommentReaction {
  userId: string;
  reactionType: '👍' | '👎' | '❤️' | '😄' | '😢' | '😮' | '😡';
  createdAt: string;
}

// ====================================
// REQUIREMENT HISTORY & AUDIT
// ====================================

export interface RequirementHistory extends BaseEntity {
  requirementId: string;
  changeType: RequirementChangeType;
  fieldName?: string;
  oldValue?: any;
  newValue?: any;
  changeReason?: string;
  automaticChange: boolean;
  workflowStepId?: string;
}

export type RequirementChangeType = 
  | 'created'
  | 'updated'
  | 'statusChanged'
  | 'assigned'
  | 'unassigned'
  | 'priorityChanged'
  | 'commentAdded'
  | 'attachmentAdded'
  | 'attachmentRemoved'
  | 'workflowAdvanced'
  | 'formSubmitted'
  | 'approved'
  | 'rejected';

// ====================================
// REQUIREMENT TEMPLATES & TYPES
// ====================================

export interface RequirementTypeConfiguration extends VersionedEntity {
  requirementType: RequirementType;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  
  // Form Configuration
  formConfigurationId?: string;
  
  // Workflow Configuration  
  workflowConfigurationId?: string;
  
  // Default Values
  defaultPriority: Priority;
  defaultAssigneeId?: string;
  estimatedDurationDays?: number;
  
  // Field Configuration
  requiredFields: string[];
  optionalFields: string[];
  hiddenFields: string[];
  readOnlyFields: string[];
  
  // Business Rules
  requiresApproval: boolean;
  requiresTechnicalReview: boolean;
  requiresSecurityReview: boolean;
  requiresComplianceReview: boolean;
  maxBudgetWithoutApproval?: number;
  
  // SLAs
  responseSla?: number; // Hours to first response
  resolutionSla?: number; // Hours to resolution
  
  // Permissions
  allowedRequesterRoles: string[];
  allowedApproverRoles: string[];
  allowedAssigneeRoles: string[];
  
  // Integration
  externalSystemMappings?: Record<string, any>;
}

export interface RequirementTemplate extends VersionedEntity {
  name: string;
  description?: string;
  requirementType: RequirementType;
  category: string;
  
  // Template Data
  templateData: Partial<Requirement>;
  predefinedFields: TemplateField[];
  
  // Usage & Analytics
  usageCount: number;
  lastUsedAt?: string;
  
  // Permissions
  isPublic: boolean;
  allowedRoles: string[];
  allowedUsers: string[];
}

export interface TemplateField {
  fieldName: string;
  label: string;
  defaultValue?: any;
  isRequired: boolean;
  isEditable: boolean;
  fieldType: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean';
  options?: { value: string; label: string }[];
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'range';
  value?: any;
  message: string;
}

// ====================================
// SEARCH & FILTERING
// ====================================

export interface RequirementSearchCriteria {
  query?: string;
  requirementTypes?: RequirementType[];
  statuses?: RequirementStatus[];
  priorities?: Priority[];
  requestedDateFrom?: string;
  requestedDateTo?: string;
  targetDateFrom?: string;
  targetDateTo?: string;
  requesterIds?: string[];
  assigneeIds?: string[];
  technicalLeadIds?: string[];
  tags?: string[];
  complianceRelevant?: boolean;
  securityRelevant?: boolean;
  budgetMin?: number;
  budgetMax?: number;
  customFilters?: Record<string, any>;
}

export interface RequirementSearchResult {
  requirement: Requirement;
  highlights?: Record<string, string[]>;
  score?: number;
  matchedFields?: string[];
}

// ====================================
// ANALYTICS & REPORTING
// ====================================

export interface RequirementMetrics {
  totalCount: number;
  statusDistribution: Record<RequirementStatus, number>;
  typeDistribution: Record<RequirementType, number>;
  priorityDistribution: Record<Priority, number>;
  
  // Time Metrics
  averageResolutionTime: number; // in hours
  averageResponseTime: number; // in hours
  overdueCount: number;
  
  // Financial Metrics
  totalEstimatedCost: number;
  totalActualCost: number;
  averageCostByType: Record<RequirementType, number>;
  
  // Performance Metrics
  onTimeDeliveryRate: number; // percentage
  customerSatisfactionScore?: number;
  reopenRate: number; // percentage
  
  // Trend Data
  creationTrend: TrendData[];
  completionTrend: TrendData[];
  backlogSize: number;
}

export interface TrendData {
  date: string;
  value: number;
  label?: string;
}

export interface RequirementReport {
  id: string;
  name: string;
  description?: string;
  reportType: RequirementReportType;
  parameters: Record<string, any>;
  schedule?: ReportSchedule;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  recipients: string[];
  isActive: boolean;
  lastGeneratedAt?: string;
  nextGenerationAt?: string;
  createdBy: string;
  createdAt: string;
}

export type RequirementReportType = 
  | 'status'
  | 'performance'
  | 'financial'
  | 'compliance'
  | 'sla'
  | 'custom';

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number; // 0 = Sunday
  dayOfMonth?: number;
  hour: number;
  timezone: string;
}

// ====================================
// BULK OPERATIONS
// ====================================

export interface BulkRequirementOperation {
  operationType: BulkOperationType;
  requirementIds: string[];
  parameters: Record<string, any>;
  userId: string;
  requestedAt: string;
}

export type BulkOperationType = 
  | 'updateStatus'
  | 'assign'
  | 'updatePriority'
  | 'addTags'
  | 'removeTags'
  | 'export'
  | 'delete'
  | 'archive';

export interface BulkOperationResult {
  operationId: string;
  totalCount: number;
  successCount: number;
  failureCount: number;
  failures: BulkOperationFailure[];
  completedAt: string;
}

export interface BulkOperationFailure {
  requirementId: string;
  errorMessage: string;
  errorCode?: string;
}

// ====================================
// NOTIFICATIONS & SUBSCRIPTIONS
// ====================================

export interface RequirementSubscription extends BaseEntity {
  userId: string;
  requirementId?: string; // null for global subscriptions
  requirementType?: RequirementType;
  eventTypes: RequirementEventType[];
  isActive: boolean;
  notificationChannels: NotificationChannel[];
}

export type RequirementEventType = 
  | 'created'
  | 'updated'
  | 'statusChanged'
  | 'assigned'
  | 'commented'
  | 'attachmentAdded'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'overdue';

export type NotificationChannel = 'email' | 'inApp' | 'sms' | 'teams' | 'slack';

// ====================================
// EXPORT/IMPORT
// ====================================

export interface RequirementExportRequest {
  criteria: RequirementSearchCriteria;
  format: 'excel' | 'csv' | 'pdf' | 'json';
  includeAttachments: boolean;
  includeComments: boolean;
  includeHistory: boolean;
  fields: string[];
}

export interface RequirementImportRequest {
  fileId: string;
  mappings: FieldMapping[];
  updateExisting: boolean;
  validateOnly: boolean;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
  defaultValue?: any;
}

export interface ImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  warnings: ImportWarning[];
  errors: ImportError[];
  createdRequirements: string[];
  updatedRequirements: string[];
}

export interface ImportWarning {
  row: number;
  field: string;
  message: string;
  suggestedValue?: any;
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  errorCode: string;
}
