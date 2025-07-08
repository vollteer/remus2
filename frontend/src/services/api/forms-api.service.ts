// src/services/api/forms-api.service.ts

import type {
  FormConfiguration,
  FormDeployment,
  FormSubmission,
  FormUsageStats,
  FormTemplate,
  FormValidationResult,
  CreateFormConfigurationRequest,
  UpdateFormConfigurationRequest,
  ApiResponse,
  PaginatedResponse,
  SearchRequest,
  RequirementType
} from '~/types/database';

// ====================================
// BASE API CLIENT CONFIGURATION
// ====================================

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  defaultHeaders: Record<string, string>;
}

class BaseApiClient {
  private config: ApiConfig;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl || '/api',
      timeout: config.timeout || 30000,
      defaultHeaders: {
        'Content-Type': 'application/json',
        ...config.defaultHeaders
      }
    };
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    // Get auth token (anpassen an dein Auth System)
    const authToken = this.getAuthToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.config.defaultHeaders,
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...options.headers
      },
      signal: AbortSignal.timeout(this.config.timeout)
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(
          response.status,
          errorData?.message || response.statusText,
          errorData
        );
      }

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new ApiError(
        0,
        error instanceof Error ? error.message : 'Unknown error occurred',
        { originalError: error }
      );
    }
  }

  private getAuthToken(): string | null {
    // Hier würdest du dein Auth Token holen
    // z.B. from localStorage, cookie, oder Context
    return localStorage.getItem('authToken');
  }

  protected async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  protected async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  protected async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  protected async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  protected async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    });
  }
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ====================================
// FORMS API SERVICE
// ====================================

class FormsApiService extends BaseApiClient {

  // ==================== CRUD OPERATIONS ====================

  /**
   * Get form configuration by requirement type
   */
  async getFormConfiguration(
    requirementType: RequirementType,
    userRoles?: string[]
  ): Promise<FormConfiguration | null> {
    try {
      const params = new URLSearchParams({ requirementType });
      if (userRoles?.length) {
        params.append('userRoles', userRoles.join(','));
      }

      const response = await this.get<FormConfiguration>(
        `/forms/configuration?${params.toString()}`
      );
      
      return response.data || null;
    } catch (error) {
      console.error('Error fetching form configuration:', error);
      if (error instanceof ApiError && error.status === 404) {
        return null; // No configuration found
      }
      throw error;
    }
  }

  /**
   * Get form configuration by ID
   */
  async getFormConfigurationById(id: string): Promise<FormConfiguration | null> {
    try {
      const response = await this.get<FormConfiguration>(`/forms/configuration/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Error fetching form configuration by ID:', error);
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create new form configuration
   */
  async createFormConfiguration(
    formData: CreateFormConfigurationRequest
  ): Promise<FormConfiguration> {
    try {
      const response = await this.post<FormConfiguration>('/forms/configuration', formData);
      
                    if (!response.isSuccess || !response.data) {
        throw new Error(response.message || 'Failed to create form configuration');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating form configuration:', error);
      throw error;
    }
  }

  /**
   * Update existing form configuration
   */
  async updateFormConfiguration(
    formData: UpdateFormConfigurationRequest
  ): Promise<FormConfiguration> {
    try {
      const response = await this.put<FormConfiguration>(
        `/forms/configuration/${formData.id}`, 
        formData
      );
      
                    if (!response.isSuccess || !response.data) {
        throw new Error(response.message || 'Failed to update form configuration');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating form configuration:', error);
      throw error;
    }
  }

  /**
   * Delete form configuration
   */
  async deleteFormConfiguration(id: string): Promise<void> {
    try {
      const response = await this.delete<void>(`/forms/configuration/${id}`);
      
                    if (!response.isSuccess) {
        throw new Error(response.message || 'Failed to delete form configuration');
      }
    } catch (error) {
      console.error('Error deleting form configuration:', error);
      throw error;
    }
  }

  // ==================== DEPLOYMENT OPERATIONS ====================

  /**
   * Deploy form configuration (4-Eyes Principle)
   */
  async deployFormConfiguration(
    configurationId: string,
    deploymentData: {
      version: number;
      reviewComment?: string;
      targetEnvironment?: 'staging' | 'production';
    }
  ): Promise<FormDeployment> {
    try {
      const response = await this.post<FormDeployment>(
        `/forms/configuration/${configurationId}/deploy`,
        deploymentData
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to deploy form configuration');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error deploying form configuration:', error);
      throw error;
    }
  }

  /**
   * Review deployment (for 4-Eyes process)
   */
  async reviewDeployment(
    deploymentId: string,
    reviewData: {
      approved: boolean;
      comment?: string;
    }
  ): Promise<FormDeployment> {
    try {
      const response = await this.patch<FormDeployment>(
        `/forms/deployment/${deploymentId}/review`,
        reviewData
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to review deployment');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error reviewing deployment:', error);
      throw error;
    }
  }

  /**
   * Get deployment history for a form configuration
   */
  async getDeploymentHistory(configurationId: string): Promise<FormDeployment[]> {
    try {
      const response = await this.get<FormDeployment[]>(
        `/forms/configuration/${configurationId}/deployments`
      );
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching deployment history:', error);
      throw error;
    }
  }

  // ==================== FORM SUBMISSIONS ====================

  /**
   * Submit form data
   */
  async submitForm(
    configurationId: string,
    requirementId: string,
    submissionData: {
      fieldValues: Record<string, any>;
      isLightMode?: boolean;
      workflowStepId?: string;
    }
  ): Promise<FormSubmission> {
    try {
      const response = await this.post<FormSubmission>(
        `/forms/configuration/${configurationId}/submit`,
        {
          requirementId,
          ...submissionData
        }
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to submit form');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  }

  /**
   * Get form submission by ID
   */
  async getFormSubmission(submissionId: string): Promise<FormSubmission | null> {
    try {
      const response = await this.get<FormSubmission>(`/forms/submission/${submissionId}`);
      return response.data || null;
    } catch (error) {
      console.error('Error fetching form submission:', error);
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get form submissions for a requirement
   */
  async getFormSubmissionsByRequirement(requirementId: string): Promise<FormSubmission[]> {
    try {
      const response = await this.get<FormSubmission[]>(
        `/forms/submissions/requirement/${requirementId}`
      );
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching form submissions by requirement:', error);
      throw error;
    }
  }

  // ==================== VALIDATION ====================

  /**
   * Validate form configuration
   */
  async validateFormConfiguration(
    formData: Partial<FormConfiguration>
  ): Promise<FormValidationResult> {
    try {
      const response = await this.post<FormValidationResult>(
        '/forms/configuration/validate',
        formData
      );
      
      return response.data || { isValid: false, errors: [], warnings: [], suggestions: [] };
    } catch (error) {
      console.error('Error validating form configuration:', error);
      throw error;
    }
  }

  /**
   * Validate form submission data
   */
  async validateFormSubmission(
    configurationId: string,
    submissionData: Record<string, any>
  ): Promise<FormValidationResult> {
    try {
      const response = await this.post<FormValidationResult>(
        `/forms/configuration/${configurationId}/validate-submission`,
        submissionData
      );
      
      return response.data || { isValid: false, errors: [], warnings: [], suggestions: [] };
    } catch (error) {
      console.error('Error validating form submission:', error);
      throw error;
    }
  }

  // ==================== SEARCH & LISTING ====================

  /**
   * Search form configurations
   */
  async searchFormConfigurations(
    searchRequest: SearchRequest & {
      requirementTypes?: RequirementType[];
      includeInactive?: boolean;
    }
  ): Promise<PaginatedResponse<FormConfiguration>> {
    try {
      const response = await this.post<FormConfiguration[]>(
        '/forms/configuration/search',
        searchRequest
      );
      
      return response as PaginatedResponse<FormConfiguration>;
    } catch (error) {
      console.error('Error searching form configurations:', error);
      throw error;
    }
  }

  /**
   * Get all active form configurations
   */
  async getAllFormConfigurations(): Promise<FormConfiguration[]> {
    try {
      const response = await this.get<FormConfiguration[]>('/forms/configuration');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching all form configurations:', error);
      throw error;
    }
  }

  // ==================== TEMPLATES ====================

  /**
   * Get form templates
   */
  async getFormTemplates(category?: string): Promise<FormTemplate[]> {
    try {
      const params = category ? `?category=${encodeURIComponent(category)}` : '';
      const response = await this.get<FormTemplate[]>(`/forms/templates${params}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching form templates:', error);
      throw error;
    }
  }

  /**
   * Create form from template
   */
  async createFormFromTemplate(
    templateId: string,
    customizations: {
      name: string;
      requirementType: RequirementType;
      fieldMappings?: Record<string, any>;
    }
  ): Promise<FormConfiguration> {
    try {
      const response = await this.post<FormConfiguration>(
        `/forms/templates/${templateId}/create-form`,
        customizations
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create form from template');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating form from template:', error);
      throw error;
    }
  }

  // ==================== ANALYTICS & USAGE ====================

  /**
   * Get form usage statistics
   */
  async getFormUsageStats(
    configurationId: string,
    dateRange?: { start: string; end: string }
  ): Promise<FormUsageStats> {
    try {
      const params = new URLSearchParams();
      if (dateRange) {
        params.append('startDate', dateRange.start);
        params.append('endDate', dateRange.end);
      }
      
      const response = await this.get<FormUsageStats>(
        `/forms/configuration/${configurationId}/usage-stats?${params.toString()}`
      );
      
      return response.data || {
        formConfigurationId: configurationId,
        totalSubmissions: 0,
        uniqueUsers: 0,
        averageCompletionTime: 0,
        abandonmentRate: 0,
        fieldAnalytics: [],
        conversionRate: 0,
        mostUsedFields: [],
        leastUsedFields: [],
        errorFrequency: [],
        usageTrend: [],
        deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
        browserBreakdown: {},
        lightModeUsage: 0
      };
    } catch (error) {
      console.error('Error fetching form usage stats:', error);
      throw error;
    }
  }

  // ==================== IMPORT/EXPORT ====================

  /**
   * Export form configuration
   */
  async exportFormConfiguration(
    configurationId: string,
    format: 'json' | 'excel' = 'json'
  ): Promise<Blob> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/forms/configuration/${configurationId}/export?format=${format}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error exporting form configuration:', error);
      throw error;
    }
  }

  /**
   * Import form configuration
   */
  async importFormConfiguration(
    file: File,
    options: {
      overwriteExisting?: boolean;
      validateOnly?: boolean;
    } = {}
  ): Promise<{ success: boolean; importedForms: FormConfiguration[]; errors: string[] }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify(options));
      
      const response = await fetch(
        `${this.config.baseUrl}/forms/configuration/import`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: formData
        }
      );
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Import failed');
      }
      
      return result;
    } catch (error) {
      console.error('Error importing form configuration:', error);
      throw error;
    }
  }

  // ==================== WORKFLOW INTEGRATION ====================

  /**
   * Get workflow steps for requirement type
   */
  async getWorkflowSteps(requirementType: RequirementType): Promise<{ value: string; label: string }[]> {
    try {
      const response = await this.get<{ id: string; name: string }[]>(
        `/workflows/requirement-type/${requirementType}/steps`
      );
      
      return (response.data || []).map(step => ({
        value: step.id,
        label: step.name
      }));
    } catch (error) {
      console.error('Error fetching workflow steps:', error);
      return [];
    }
  }

  // ==================== PERMISSIONS & SECURITY ====================

  /**
   * Get current user permissions for form
   */
  async getFormPermissions(configurationId: string): Promise<{
    canView: boolean;
    canEdit: boolean;
    canDeploy: boolean;
    canDelete: boolean;
    restrictedFields: string[];
  }> {
    try {
      const response = await this.get<any>(`/forms/configuration/${configurationId}/permissions`);
      
      return response.data || {
        canView: false,
        canEdit: false,
        canDeploy: false,
        canDelete: false,
        restrictedFields: []
      };
    } catch (error) {
      console.error('Error fetching form permissions:', error);
      throw error;
    }
  }
}

// ====================================
// SINGLETON INSTANCE & CONFIGURATION
// ====================================

// Create singleton instance
const formsApiService = new FormsApiService({
  // Diese Config würdest du aus deinen App Settings holen
  baseUrl: process.env.API_BASE_URL || '/api',
  timeout: 30000,
  defaultHeaders: {
    'Content-Type': 'application/json',
    'X-Client-Version': '1.0.0'
  }
});

// Export instance and class
export { formsApiService as FormsApiService, ApiError };
export type { ApiConfig };

// ====================================
// USAGE EXAMPLES (für deine Referenz)
// ====================================

/*
// In deinem Component:
import { FormsApiService } from '~/services/api/forms-api.service';

// Get form configuration
const formConfig = await FormsApiService.getFormConfiguration('Kleinanforderung', ['Requester']);

// Save form configuration  
const savedConfig = await FormsApiService.updateFormConfiguration({
  id: 'form-123',
  version: 2,
  name: 'Updated Form Name',
  fields: [...updatedFields]
});

// Submit form
const submission = await FormsApiService.submitForm('form-123', 'req-456', {
  fieldValues: { name: 'Test', priority: 'high' },
  isLightMode: false
});

// Error handling
try {
  const config = await FormsApiService.getFormConfiguration('NonExistent');
} catch (error) {
  if (error instanceof ApiError) {
    console.log(`API Error ${error.status}: ${error.message}`);
  }
}
*/
