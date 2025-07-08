// ====================================
// BASE ENTITIES & SHARED TYPES
// ====================================

export interface BaseEntity {
  id: string;
  createdAt: string;
  modifiedAt: string;
  createdBy: string;
  modifiedBy?: string;
}

export interface SoftDeleteEntity extends BaseEntity {
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface VersionedEntity extends BaseEntity {
  version: number;
  isActive: boolean;
}

// ====================================
// API RESPONSE TYPES
// ====================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  metadata?: ResponseMetadata;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ResponseMetadata {
  requestId: string;
  timestamp: string;
  version: string;
  processingTimeMs: number;
}

// ====================================
// VALIDATION & ERROR HANDLING
// ====================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: ValidationError[];
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
  field?: string;
  stackTrace?: string;
}

// ====================================
// SEARCH & FILTERING
// ====================================

export interface SearchRequest {
  query?: string;
  filters?: SearchFilter[];
  sorting?: SortOption[];
  pagination?: PaginationRequest;
  includeDeleted?: boolean;
}

export interface SearchFilter {
  field: string;
  operator: FilterOperator;
  value: any;
  dataType?: 'string' | 'number' | 'date' | 'boolean';
}

export type FilterOperator = 
  | 'equals' 
  | 'notEquals' 
  | 'contains' 
  | 'startsWith' 
  | 'endsWith'
  | 'greaterThan' 
  | 'lessThan' 
  | 'greaterOrEqual' 
  | 'lessOrEqual'
  | 'between' 
  | 'in' 
  | 'notIn'
  | 'isEmpty' 
  | 'isNotEmpty'
  | 'isNull' 
  | 'isNotNull';

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationRequest {
  page: number;
  pageSize: number;
}

// ====================================
// USER & ROLES
// ====================================

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  roles: UserRole[];
  permissions: Permission[];
  profileImageUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  modifiedAt: string;
}

export interface UserRole {
  id: string;
  roleName: string;
  description?: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

// ====================================
// AUDIT & LOGGING
// ====================================

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changes: AuditChange[];
  userId: string;
  username: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export type AuditAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'view' 
  | 'export' 
  | 'import' 
  | 'deploy' 
  | 'approve' 
  | 'reject';

export interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'updated' | 'removed';
}

// ====================================
// CONFIGURATION & SETTINGS
// ====================================

export interface SystemConfiguration {
  id: string;
  key: string;
  value: string;
  dataType: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description?: string;
  isEditable: boolean;
  requiresRestart: boolean;
  modifiedAt: string;
  modifiedBy: string;
}

export interface Feature {
  id: string;
  name: string;
  key: string;
  enabled: boolean;
  description?: string;
  configuration?: Record<string, any>;
  dependencies?: string[];
  version: string;
}

// ====================================
// NOTIFICATIONS & MESSAGING
// ====================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  severity: NotificationSeverity;
  userId?: string;
  roleNames?: string[];
  isRead: boolean;
  readAt?: string;
  expiresAt?: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export type NotificationType = 
  | 'system' 
  | 'workflow' 
  | 'form' 
  | 'requirement' 
  | 'approval' 
  | 'deployment';

export type NotificationSeverity = 
  | 'info' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'critical';

// ====================================
// FILE & DOCUMENT MANAGEMENT
// ====================================

export interface FileInfo {
  id: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  extension: string;
  path: string;
  url?: string;
  thumbnailUrl?: string;
  checksum: string;
  uploadedBy: string;
  uploadedAt: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  templateType: string;
  fileInfo: FileInfo;
  variables: TemplateVariable[];
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  description?: string;
  defaultValue?: any;
  required: boolean;
}

// ====================================
// INTEGRATION & EXTERNAL SYSTEMS
// ====================================

export interface ExternalSystem {
  id: string;
  name: string;
  systemType: string;
  baseUrl: string;
  apiVersion?: string;
  isActive: boolean;
  configuration: Record<string, any>;
  credentials?: SystemCredentials;
  lastSyncAt?: string;
  lastHealthCheck?: string;
  healthStatus: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
}

export interface SystemCredentials {
  authType: 'apiKey' | 'oauth' | 'basic' | 'certificate';
  credentials: Record<string, any>;
  expiresAt?: string;
}

// ====================================
// ANALYTICS & METRICS
// ====================================

export interface AnalyticsEvent {
  id: string;
  eventType: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  userId?: string;
  sessionId: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface Metric {
  name: string;
  value: number;
  unit?: string;
  timestamp: string;
  tags?: Record<string, string>;
  dimensions?: Record<string, string>;
}

export interface PerformanceMetric {
  operation: string;
  duration: number;
  success: boolean;
  errorMessage?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// ====================================
// UTILITY TYPES
// ====================================

export type EntityStatus = 'draft' | 'active' | 'inactive' | 'archived' | 'deleted';

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  address?: Address;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface KeyValuePair<T = string> {
  key: string;
  value: T;
  label?: string;
  description?: string;
}

// ====================================
// API CLIENT CONFIGURATION
// ====================================

export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  defaultHeaders: Record<string, string>;
  authToken?: string;
  apiKey?: string;
}

export interface RequestOptions {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

// ====================================
// EXPORT HELPERS
// ====================================

// Re-export common utilities that are used everywhere
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export type Required<T> = {
  [P in keyof T]-?: T[P];
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Utility type for making certain fields optional
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Utility type for making certain fields required
export type MakeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;
