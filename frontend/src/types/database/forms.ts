// src/types/database/forms.ts
import { BaseEntity, RequirementType, Environment, DeploymentStatus } from './common';

// ==================== CORE FORM CONFIGURATION ====================

export interface FormConfiguration extends BaseEntity {
  requirementType: RequirementType;
  workflowStepId?: string;
  name: string;
  description?: string;
  version: number;
  isActive: boolean;
  hasLightMode: boolean;
  
  // Extracted from ConfigurationData JSON
  fields: FormField[];
  sections: FormSection[];
  permissions?: FormPermissions;
  lightMode?: LightModeConfig;
  metadata?: FormMetadata;
}

// ==================== FORM FIELDS ====================

export interface FormField {
  id: string;
  type: FieldType;
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  required: boolean;
  lightModeVisible?: boolean;
  width: 'full' | 'half' | 'third' | 'quarter';
  section: string; // Section ID
  order: number;
  defaultValue?: any;
  options?: FieldOption[];
  validation?: ValidationRule[];
  permissions?: FieldPermissions;
  conditionalRules?: ConditionalRule[];
  workflowStepBinding?: string[]; // Which workflow steps use this field
}

export type FieldType = 
  | 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'url'
  | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'checkboxGroup'
  | 'date' | 'datetime' | 'time' | 'file' | 'divider' | 'heading';

export interface FieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface ConditionalRule {
  field: string; // Field name to check
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'notContains';
  value: any;
  action: 'show' | 'hide' | 'require' | 'disable';
}

// ==================== FORM SECTIONS ====================

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  collapsible: boolean;
  collapsed: boolean;
  order: number;
  permissions?: SectionPermissions;
}

// ==================== PERMISSIONS ====================

export interface FormPermissions {
  allowedRoles: string[];
  denyRoles: string[];
  adminRoles: string[];
}

export interface FieldPermissions {
  allowedRoles: string[];
  allowedUsers: string[];
  readOnlyRoles: string[];
  hideFromRoles: string[];
}

export interface SectionPermissions {
  allowedRoles: string[];
  allowedUsers: string[];
  readOnlyRoles: string[];
  hideFromRoles: string[];
}

// ==================== LIGHT MODE CONFIG ====================

export interface LightModeConfig {
  enabled: boolean;
  title: string;
  description: string;
  showOnlyRequired?: boolean;
}

// ==================== FORM METADATA ====================

export interface FormMetadata {
  version: string;
  createdBy: string;
  tags?: string[];
  category?: string;
  [key: string]: any;
}

// ==================== FORM DEPLOYMENT ====================

export interface FormDeployment extends BaseEntity {
  formConfigurationId: string;
  version: string;
  deploymentType: 'Draft' | 'Review' | 'Approved' | 'Live' | 'Archived';
  environment: Environment;
  reviewedBy?: string;
  approvedBy?: string;
  deployedBy?: string;
  reviewStatus: DeploymentStatus;
  reviewComments?: string;
  reviewDate?: string;
  approvalDate?: string;
  deploymentDate?: string;
  configurationSnapshot: string; // JSON string
  changesSummary?: string;
  affectedRequirements?: number;
  rollbackPlan?: string;
  deploymentNotes?: string;
  isActive: boolean;
  canRollback: boolean;
}

// ==================== FORM SUBMISSIONS ====================

export interface FormSubmission extends BaseEntity {
  requirementId: string;
  formConfigurationId: string;
  workflowStepId?: string;
  submissionData: Record<string, any>; // Parsed JSON
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  isLightMode: boolean;
  submittedAt?: string;
  submittedBy: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComments?: string;
}

// ==================== FORM TEMPLATES ====================

export interface FormTemplate extends BaseEntity {
  name: string;
  description?: string;
  requirementType: RequirementType;
  category: string;
  isSystemTemplate: boolean;
  templateData: FormConfiguration; // The actual form config
  tags?: string[];
  usageCount: number;
  lastUsed?: string;
}

export interface FieldTemplate {
  id: string;
  type: FieldType;
  title: string;
  description?: string;
  icon: string;
  color: string;
  category: string;
  isSystemTemplate: boolean;
  defaultConfig: Partial<FormField>;
  defaultPermissions?: FieldPermissions;
  defaultValidation?: ValidationRule[];
  usageCount: number;
}

// ==================== FORM ANALYTICS ====================

export interface FormUsageStats extends BaseEntity {
  formConfigurationId: string;
  date: string; // YYYY-MM-DD
  submissionsCount: number;
  completionRate: number; // percentage
  averageCompletionTime: number; // in minutes
  lightModeUsage: number; // percentage
  abandonment: {
    rate: number; // percentage
    commonExitPoints: Array<{ fieldName: string; exitCount: number }>;
  };
  mostUsedFields: Array<{ fieldName: string; usageCount: number }>;
  errorsByField: Array<{ fieldName: string; errorCount: number; commonErrors: string[] }>;
  deviceStats: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  userTypeStats: {
    internal: number;
    external: number;
    anonymous: number;
  };
}

export interface FormFieldAnalytics extends BaseEntity {
  formConfigurationId: string;
  fieldId: string;
  fieldName: string;
  fieldType: FieldType;
  date: string; // YYYY-MM-DD
  
  // Usage metrics
  interactionsCount: number;
  completionRate: number; // percentage of users who filled this field
  skipRate: number; // percentage of users who skipped this field
  averageTimeSpent: number; // in seconds
  
  // Error metrics
  validationErrorsCount: number;
  commonValidationErrors: Array<{ error: string; count: number }>;
  
  // Value analysis
  mostCommonValues: Array<{ value: string; count: number }>;
  uniqueValuesCount: number;
  averageValueLength?: number; // for text fields
}

// ==================== FORM VALIDATION ====================

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

export interface ValidationError {
  type: 'field' | 'section' | 'form' | 'permission' | 'workflow';
  severity: 'error' | 'warning' | 'info';
  message: string;
  fieldId?: string;
  sectionId?: string;
  suggestion?: string;
}

export interface ValidationWarning {
  type: 'usability' | 'performance' | 'accessibility' | 'best-practice';
  message: string;
  recommendation: string;
  fieldId?: string;
  sectionId?: string;
}

export interface ValidationSuggestion {
  type: 'optimization' | 'enhancement' | 'alternative';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  fieldId?: string;
  sectionId?: string;
}

// ==================== FORM VERSIONING ====================

export interface FormVersion extends BaseEntity {
  formConfigurationId: string;
  versionNumber: string;
  versionType: 'major' | 'minor' | 'patch' | 'hotfix';
  changes: FormChange[];
  changesSummary: string;
  isActive: boolean;
  deploymentId?: string;
  previousVersionId?: string;
  migrationScript?: string; // SQL or instructions for data migration
  backwardCompatible: boolean;
}

export interface FormChange {
  type: 'field_added' | 'field_removed' | 'field_modified' | 'section_added' | 'section_removed' | 'section_modified' | 'permission_changed';
  description: string;
  elementId: string; // field or section ID
  elementName: string;
  oldValue?: any;
  newValue?: any;
  impact: 'breaking' | 'non-breaking' | 'data-migration-required';
}

// ==================== FORM COLLABORATION ====================

export interface FormCollaborator extends BaseEntity {
  formConfigurationId: string;
  userId: string;
  role: 'owner' | 'editor' | 'reviewer' | 'viewer';
  permissions: {
    canEdit: boolean;
    canDeploy: boolean;
    canManageCollaborators: boolean;
    canViewAnalytics: boolean;
  };
  invitedBy: string;
  acceptedAt?: string;
  lastActiveAt?: string;
}

export interface FormComment extends BaseEntity {
  formConfigurationId: string;
  fieldId?: string; // If comment is specific to a field
  sectionId?: string; // If comment is specific to a section
  content: string;
  commentType: 'general' | 'suggestion' | 'issue' | 'question';
  status: 'open' | 'resolved' | 'dismissed';
  parentCommentId?: string; // For threaded comments
  mentions: string[]; // User IDs mentioned in comment
  resolvedBy?: string;
  resolvedAt?: string;
}

// ==================== FORM AUDIT LOG ====================

export interface FormAuditLog extends BaseEntity {
  formConfigurationId: string;
  action: 'created' | 'updated' | 'deleted' | 'deployed' | 'rolled_back' | 'exported' | 'imported' | 'shared';
  entityType: 'form' | 'field' | 'section' | 'permission' | 'deployment';
  entityId?: string;
  oldValue?: any; // JSON
  newValue?: any; // JSON
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
  details?: Record<string, any>; // Additional context
}

// ==================== FORM IMPORT/EXPORT ====================

export interface FormExport extends BaseEntity {
  formConfigurationId: string;
  exportType: 'full' | 'config_only' | 'template' | 'data_schema';
  exportFormat: 'json' | 'xlsx' | 'xml' | 'pdf';
  fileName: string;
  fileSize: number;
  downloadCount: number;
  expiresAt?: string;
  includeData: boolean; // Include submission data
  includeAnalytics: boolean;
  exportSettings: {
    includePermissions: boolean;
    includeMetadata: boolean;
    anonymizeData: boolean;
    dateRange?: { from: string; to: string };
  };
}

export interface FormImport extends BaseEntity {
  sourceType: 'file' | 'url' | 'template' | 'copy';
  importType: 'full' | 'merge' | 'fields_only' | 'structure_only';
  fileName?: string;
  sourceUrl?: string;
  sourceFormId?: string;
  importStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'partially_completed';
  importErrors: ImportError[];
  importWarnings: ImportWarning[];
  createdFormId?: string;
  conflictResolution: 'skip' | 'overwrite' | 'rename' | 'merge';
  importSettings: {
    preserveIds: boolean;
    updateExisting: boolean;
    validateOnImport: boolean;
    createBackup: boolean;
  };
  importResult?: {
    fieldsCreated: number;
    fieldsUpdated: number;
    fieldsSkipped: number;
    sectionsCreated: number;
    sectionsUpdated: number;
    sectionsSkipped: number;
  };
}

export interface ImportError {
  type: 'validation' | 'conflict' | 'permission' | 'format' | 'reference';
  message: string;
  elementId?: string;
  elementName?: string;
  line?: number; // For file imports
  column?: number;
  resolution?: string;
}

export interface ImportWarning {
  type: 'data_loss' | 'format_change' | 'reference_missing' | 'permission_change';
  message: string;
  recommendation: string;
  elementId?: string;
  elementName?: string;
}

// ==================== FORM PERFORMANCE ====================

export interface FormPerformanceMetrics extends BaseEntity {
  formConfigurationId: string;
  date: string; // YYYY-MM-DD
  
  // Load performance
  averageLoadTime: number; // in milliseconds
  averageRenderTime: number; // in milliseconds
  averageValidationTime: number; // in milliseconds
  
  // User experience
  averageCompletionTime: number; // in minutes
  averageFieldInteractionTime: number; // in seconds
  bounceRate: number; // percentage
  conversionRate: number; // percentage
  
  // Technical metrics
  errorRate: number; // percentage
  apiCallsPerSubmission: number;
  averagePayloadSize: number; // in bytes
  cacheHitRate: number; // percentage
  
  // Device performance
  desktopPerformance: DevicePerformanceMetrics;
  mobilePerformance: DevicePerformanceMetrics;
  tabletPerformance: DevicePerformanceMetrics;
}

export interface DevicePerformanceMetrics {
  averageLoadTime: number;
  averageRenderTime: number;
  memoryUsage: number; // in MB
  cpuUsage: number; // percentage
  batteryImpact: 'low' | 'medium' | 'high';
}

// ==================== UTILITY TYPES ====================

// Request/Response types for API
export interface CreateFormConfigurationRequest {
  requirementType: RequirementType;
  workflowStepId?: string;
  name: string;
  description?: string;
  fields: FormField[];
  sections: FormSection[];
  permissions?: FormPermissions;
  lightMode?: LightModeConfig;
  metadata?: FormMetadata;
}

export interface UpdateFormConfigurationRequest extends Partial<CreateFormConfigurationRequest> {
  version?: number;
}

export interface CreateFormDeploymentRequest {
  formConfigurationId: string;
  deploymentType: 'Draft' | 'Review' | 'Approved' | 'Live' | 'Archived';
  environment: Environment;
  changesSummary?: string;
  deploymentNotes?: string;
}

export interface ReviewDeploymentRequest {
  reviewStatus: DeploymentStatus;
  reviewComments?: string;
}

export interface SubmitFormRequest {
  requirementType: RequirementType;
  formData: Record<string, any>;
  isLightMode?: boolean;
  workflowStepId?: string;
  saveAsDraft?: boolean;
}

export interface UpdateFormSubmissionRequest {
  submissionData?: Record<string, any>;
  status?: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  reviewComments?: string;
}

// Search and filter types
export interface FormSearchFilters {
  requirementType?: RequirementType;
  isActive?: boolean;
  hasLightMode?: boolean;
  createdBy?: string;
  tags?: string[];
  dateRange?: { from: string; to: string };
  textSearch?: string;
}

export interface FormSubmissionFilters {
  formConfigurationId?: string;
  requirementId?: string;
  status?: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  submittedBy?: string;
  isLightMode?: boolean;
  dateRange?: { from: string; to: string };
}

// Sorting options
export type FormSortOption = 
  | 'name_asc' | 'name_desc'
  | 'created_asc' | 'created_desc'
  | 'modified_asc' | 'modified_desc'
  | 'usage_asc' | 'usage_desc'
  | 'version_asc' | 'version_desc';

export type FormSubmissionSortOption = 
  | 'submitted_asc' | 'submitted_desc'
  | 'status_asc' | 'status_desc'
  | 'requirement_asc' | 'requirement_desc';
