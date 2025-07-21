// src/services/qwik-forms-api.ts
// API Service 

interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'date' | 'datetime' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'checkboxGroup' | 'file' | 'currency' | 'percentage' | 'url' | 'divider' | 'heading' | 'roleSearch' | 'budgetField' | 'referenceField';
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: any;
  options?: Array<{ value: string; label: string }>;
  order: number;
  width: 'full' | 'half' | 'third' | 'quarter';
  section?: string;
  lightModeVisible?: boolean;
  workflowStepBinding?: string[];
  permissions?: {
    allowedRoles: string[];
    readOnlyRoles: string[];
    hideFromRoles: string[];
  };
}

interface WorkflowStep {
  id: string;
  name: string;
  responsible: string;
}

interface FormConfiguration {
  id: string;
  name: string;
  description?: string;
  workflowType: string;
  fields: FormField[];
  lightModeEnabled: boolean;
  createdAt: string;
  modifiedAt: string;
  version: number;
}

/**
 * Qwik Forms API Service
 */
export class FormsApiService {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://localhost:7068/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get auth token (SSR-safe für Qwik)
   */
  private getAuthToken(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken') || '';
    }
    return '';
  }

  /**
   * Standard fetch headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // ============================================================================
  // FORM CONFIGURATION METHODS
  // ============================================================================

  /**
   * Load Form Configuration für Workflow Type
   */
  async loadFormConfiguration(workflowType: string): Promise<FormConfiguration> {
    try {
      console.log(`[QwikAPI] Loading form configuration for workflow: ${workflowType}`);

      const response = await fetch(
        `${this.baseUrl}/forms/configuration?requirementType=${encodeURIComponent(workflowType)}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();
      console.log('[QwikAPI] API Response:', apiResponse);

      if (apiResponse.isSuccess && apiResponse.data) {
        return this.mapApiToFormConfiguration(apiResponse.data, workflowType);
      } else {
        throw new Error(apiResponse.message || 'API returned no data');
      }

    } catch (error) {
      console.warn('[QwikAPI] API call failed, creating fallback:', error);
      return this.createFallbackConfiguration(workflowType);
    }
  }

  /**
   * Save Form Configuration
   */
  async saveFormConfiguration(config: FormConfiguration): Promise<FormConfiguration> {
    try {
      console.log('[QwikAPI] Saving form configuration:', config.name);

      const isNewForm = !config.id || config.id.startsWith('temp-');
      const url = isNewForm 
        ? `${this.baseUrl}/forms/configuration`
        : `${this.baseUrl}/forms/configuration/${config.id}`;
      
      const method = isNewForm ? 'POST' : 'PUT';
      const apiPayload = this.mapFormConfigurationToApi(config);

      const response = await fetch(url, {
        method,
        headers: this.getHeaders(),
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();
      console.log('[QwikAPI] Save response:', apiResponse);

      if (apiResponse.isSuccess && apiResponse.data) {
        return this.mapApiToFormConfiguration(apiResponse.data, config.workflowType);
      } else {
        throw new Error(apiResponse.message || 'Save failed');
      }

    } catch (error) {
      console.error('[QwikAPI] Save failed:', error);
      throw error;
    }
  }

  /**
   * Get Workflow Steps für Workflow Type
   */
  async getWorkflowSteps(workflowType: string): Promise<WorkflowStep[]> {
    try {
      console.log(`[QwikAPI] Loading workflow steps for: ${workflowType}`);

      const response = await fetch(
        `${this.baseUrl}/workflows/requirement-type/${encodeURIComponent(workflowType)}/steps`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();
      
      if (apiResponse.isSuccess && apiResponse.data) {
        return apiResponse.data.map((step: any) => ({
          id: step.id,
          name: step.title || step.name,
          responsible: step.responsible || 'System'
        }));
      }

      throw new Error('No workflow steps found');

    } catch (error) {
      console.warn('[QwikAPI] Workflow steps API failed, using fallback:', error);
      
      // Fallback workflow steps
      return [
        { id: 'step-1', name: 'Antrag erstellen', responsible: 'AG' },
        { id: 'step-2', name: 'Prüfung', responsible: 'AN' },
        { id: 'step-3', name: 'Genehmigung', responsible: 'AG' },
        { id: 'step-4', name: 'Umsetzung', responsible: 'AN' }
      ];
    }
  }

  /**
   * Validate Form Configuration
   */
  async validateFormConfiguration(config: FormConfiguration): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/forms/configuration/validate`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(this.mapFormConfigurationToApi(config)),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();
      
      if (apiResponse.isSuccess && apiResponse.data) {
        return {
          isValid: apiResponse.data.isValid,
          errors: apiResponse.data.errors?.map((e: any) => e.message) || [],
          warnings: apiResponse.data.warnings?.map((w: any) => w.message) || []
        };
      }

      return { isValid: false, errors: ['Validation failed'], warnings: [] };

    } catch (error) {
      console.warn('[QwikAPI] Validation failed, using basic validation:', error);
      
      // Basic client-side validation
      const errors: string[] = [];
      if (!config.name?.trim()) errors.push('Name ist erforderlich');
      if (config.fields.length === 0) errors.push('Mindestens ein Feld ist erforderlich');

      return {
        isValid: errors.length === 0,
        errors,
        warnings: []
      };
    }
  }

  // ============================================================================
  // MAPPING FUNCTIONS
  // ============================================================================

  /**
   * Map API Response to FormConfiguration
   */
  private mapApiToFormConfiguration(apiData: any, workflowType: string): FormConfiguration {
    return {
      id: apiData.id || `temp-${Date.now()}`,
      name: apiData.name || `${workflowType} Formular`,
      description: apiData.description || '',
      workflowType: apiData.requirementType || workflowType,
      fields: this.mapApiFieldsToFormFields(apiData.fields || []),
      lightModeEnabled: apiData.hasLightMode ?? false,
      createdAt: apiData.createdAt || new Date().toISOString(),
      modifiedAt: apiData.modifiedAt || new Date().toISOString(),
      version: parseInt(apiData.version) || 1
    };
  }

  /**
   * Map API Fields to FormFields
   */
  private mapApiFieldsToFormFields(apiFields: any[]): FormField[] {
    return apiFields.map(field => ({
      id: field.id,
      type: this.mapApiFieldType(field.type),
      name: field.name,
      label: field.label,
      placeholder: field.placeholder || '',
      description: field.helpText || '',
      required: field.required ?? false,
      disabled: field.isReadonly ?? false,
      defaultValue: field.defaultValue,
      options: field.options?.map((opt: any) => ({
        value: opt.value,
        label: opt.label
      })) || [],
      order: field.order,
      width: field.width as 'full' | 'half' | 'third' | 'quarter' || 'full',
      section: field.sectionId || '',
      lightModeVisible: this.isLightModeField(field),
      workflowStepBinding: this.extractWorkflowStepBinding(field),
      permissions: {
        allowedRoles: ['Requester', 'Approver'],
        readOnlyRoles: [],
        hideFromRoles: []
      }
    }));
  }

  /**
   * Map API field type to your field types
   */
  private mapApiFieldType(apiType: string): FormField['type'] {
    const typeMap: Record<string, FormField['type']> = {
      'text': 'text',
      'textarea': 'textarea',
      'number': 'number',
      'email': 'email',
      'phone': 'phone',
      'date': 'date',
      'datetime-local': 'datetime',
      'select': 'select',
      'multiselect': 'multiselect',
      'radio': 'radio',
      'checkbox': 'checkbox',
      'checkboxGroup': 'checkboxGroup',
      'file': 'file',
      'currency': 'currency',
      'percentage': 'percentage',
      'url': 'url'
    };

    return typeMap[apiType] || 'text';
  }

  /**
   * Check if field should be visible in light mode
   */
  private isLightModeField(field: any): boolean {
    // Logic to determine if field is light mode visible
    // Could be based on field properties, metadata, etc.
    return field.lightModeVisible ?? false;
  }

  /**
   * Extract workflow step binding from field
   */
  private extractWorkflowStepBinding(field: any): string[] {
    // Extract workflow step binding from field conditions or metadata
    return field.workflowStepBinding || [];
  }

  /**
   * Map FormConfiguration to API payload
   */
  private mapFormConfigurationToApi(config: FormConfiguration): any {
    return {
      id: config.id?.startsWith('temp-') ? undefined : config.id,
      name: config.name,
      description: config.description,
      requirementType: config.workflowType,
      sections: [
        {
          id: 'main-section',
          title: 'Hauptsektion',
          description: 'Hauptsektion des Formulars',
          order: 1,
          isVisible: true,
          isCollapsible: false,
          isCollapsed: false
        }
      ],
      fields: config.fields.map(field => ({
        id: field.id,
        sectionId: 'main-section',
        name: field.name,
        label: field.label,
        type: field.type,
        required: field.required,
        order: field.order,
        validationRules: {},
        options: field.options || [],
        defaultValue: field.defaultValue,
        placeholder: field.placeholder,
        helpText: field.description,
        isVisible: true,
        isReadonly: field.disabled,
        conditions: [],
        width: field.width
      })),
      isActive: true,
      hasLightMode: config.lightModeEnabled,
      permissions: {
        canView: ['Admin', 'User'],
        canEdit: ['Admin'],
        canSubmit: ['Admin', 'User'],
        canReview: ['Admin'],
        canApprove: ['Admin']
      },
      lightMode: {
        enabled: config.lightModeEnabled,
        requiredFields: config.fields.filter(f => f.lightModeVisible).map(f => f.id),
        hiddenSections: []
      }
    };
  }

  /**
   * Create fallback configuration when API fails
   */
  private createFallbackConfiguration(workflowType: string): FormConfiguration {
    return {
      id: `temp-${Date.now()}`,
      name: `${workflowType} Formular`,
      description: `Standardformular für ${workflowType}`,
      workflowType,
      fields: [
        {
          id: 'field-title',
          type: 'text',
          name: 'title',
          label: 'Titel',
          placeholder: 'Titel der Anforderung',
          required: true,
          order: 1,
          width: 'full',
          lightModeVisible: true,
          workflowStepBinding: [],
          permissions: {
            allowedRoles: ['Requester', 'Approver'],
            readOnlyRoles: [],
            hideFromRoles: []
          }
        },
        {
          id: 'field-description',
          type: 'textarea',
          name: 'description',
          label: 'Beschreibung',
          placeholder: 'Beschreibung der Anforderung',
          required: true,
          order: 2,
          width: 'full',
          lightModeVisible: true,
          workflowStepBinding: [],
          permissions: {
            allowedRoles: ['Requester', 'Approver'],
            readOnlyRoles: [],
            hideFromRoles: []
          }
        }
      ],
      lightModeEnabled: false,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      version: 1
    };
  }
}

// ============================================================================
// EXPORT & SINGLETON
// ============================================================================

// Singleton instance
export const formBuilderApi = new FormsApiService();

// Export types for use in your FormBuilder
export type { FormField, WorkflowStep, FormConfiguration };

// Service functions that your FormBuilder can use directly
export const FormBuilderAPI = {
  /**
   * Load form configuration for workflow
   */
  loadFormConfiguration: (workflowType: string) => 
    formBuilderApi.loadFormConfiguration(workflowType),

  /**
   * Save form configuration
   */
  saveFormConfiguration: (config: FormConfiguration) => 
    formBuilderApi.saveFormConfiguration(config),

  /**
   * Get workflow steps
   */
  getWorkflowSteps: (workflowType: string) => 
    formBuilderApi.getWorkflowSteps(workflowType),

  /**
   * Validate configuration
   */
  validateConfiguration: (config: FormConfiguration) =>
    formBuilderApi.validateFormConfiguration(config)
};
