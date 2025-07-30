// src/services/qwik-forms-api.ts
// API Service 

interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'date' | 'datetime' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'checkboxGroup' | 'file' | 'currency' | 'percentage' | 'url' | 'divider' | 'heading' | 'roleSearch' | 'budgetField' | 'referenceField' | 'userSearch' | 'requirementSearch';
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
  widget?: string; // Widget ID this field belongs to
  lightModeVisible?: boolean;
  workflowStepBinding?: string[];
  permissions?: {
    allowedRoles: string[];
    readOnlyRoles: string[];
    hideFromRoles: string[];
  };
}

interface FormWidget {
  id: string;
  type: 'terminGroup' | 'budgetGroup' | 'zustaendigkeitGroup' | 'pruefungGroup' | 'customGroup';
  title: string;
  description?: string;
  order: number;
  section?: string;
  fields: FormField[];
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
  widgets: FormWidget[];
  lightModeEnabled: boolean;
  createdAt: string;
  modifiedAt: string;
  version: string;
}

/**
 * Qwik Forms API Service
 */
export class FormsApiService {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://localhost:7100/api') {
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
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('[QwikAPI] Testing connection to:', this.baseUrl);
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      console.log('[QwikAPI] Health check response:', response.status);
      return response.ok;
    } catch (error) {
      console.error('[QwikAPI] Connection test failed:', error);
      return false;
    }
  }

  /**
   * Standard fetch headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json; charset=utf-8',
    };

    // Add API keys if available (Backend expects these)
    if (typeof window !== 'undefined') {
      const apiKey = localStorage.getItem('apiKey');
      const userApiKey = localStorage.getItem('userApiKey');
      
      if (apiKey) {
        headers['x-helaba-api-key'] = apiKey;
      }
      if (userApiKey) {
        headers['user-api-key'] = userApiKey;
      }
    }

    // Also add Bearer token if available
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

      if (apiResponse.isSuccess) {
        if (apiResponse.data) {
          return this.mapApiToFormConfiguration(apiResponse.data, workflowType);
        } else {
          // No configuration found is not an error - return null to create new
          console.log('[QwikAPI] No existing configuration found for', workflowType);
          return null;
        }
      } else {
        throw new Error(apiResponse.message || 'API returned error');
      }

    } catch (error) {
      console.warn('[QwikAPI] API call failed, checking local storage:', error);
      
      // Try to load from local storage first
      const localConfig = this.loadConfigurationLocally(workflowType);
      if (localConfig) {
        console.log('[QwikAPI] ✅ Using locally stored configuration');
        return localConfig;
      }
      
      console.log('[QwikAPI] ℹ️ No local config found, creating fallback configuration');
      const fallbackConfig = this.createFallbackConfiguration(workflowType);
      
      // Save the fallback config locally for future use
      this.saveConfigurationLocally(fallbackConfig);
      console.log('[QwikAPI] 💾 Fallback configuration saved locally for future use');
      
      return fallbackConfig;
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

      console.log('[QwikAPI] Request details:', {
        url,
        method,
        headers: this.getHeaders(),
        payload: apiPayload
      });

      const response = await fetch(url, {
        method,
        headers: this.getHeaders(),
        body: JSON.stringify(apiPayload),
      });

      console.log('[QwikAPI] Response status:', response.status, response.statusText);

      if (!response.ok) {
        // Try to get more details from the server response
        let errorDetails = response.statusText;
        let errorBody = null;
        
        try {
          const contentType = response.headers.get('content-type');
          console.log('[QwikAPI] Error response content-type:', contentType);
          
          if (contentType && contentType.includes('application/json')) {
            errorBody = await response.json();
            console.error('[QwikAPI] Server error JSON response:', errorBody);
            errorDetails = errorBody.message || errorBody.title || JSON.stringify(errorBody);
          } else {
            const errorText = await response.text();
            console.error('[QwikAPI] Server error text response:', errorText);
            errorDetails = errorText || response.statusText;
          }
        } catch (parseError) {
          console.warn('[QwikAPI] Could not parse error response:', parseError);
        }
        
        // More specific error handling
        if (response.status === 500) {
          console.error('[QwikAPI] Internal Server Error - Full details:', {
            status: response.status,
            statusText: response.statusText,
            errorDetails,
            errorBody,
            payload: apiPayload,
            url
          });
        }
        
        throw new Error(`HTTP ${response.status}: ${errorDetails}`);
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
      
      // If server fails, try to save locally as fallback
      if (error instanceof Error && error.message.includes('500')) {
        console.warn('[QwikAPI] Server error, attempting local fallback save...');
        try {
          this.saveConfigurationLocally(config);
          console.log('[QwikAPI] Configuration saved locally as fallback');
          
          // Return the config with a warning
          return {
            ...config,
            id: config.id?.startsWith('temp-') ? `local-${Date.now()}` : config.id,
            modifiedAt: new Date().toISOString()
          };
        } catch (localError) {
          console.error('[QwikAPI] Local fallback also failed:', localError);
        }
      }
      
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
    // Handle case where fields might be nested in sections or stored differently
    let fields = [];
    let widgets = [];
    
    if (apiData.fields && Array.isArray(apiData.fields)) {
      fields = apiData.fields;
    } else if (apiData.sections && Array.isArray(apiData.sections)) {
      // If fields are stored within sections, extract them
      console.log('[QwikAPI] Extracting fields from sections structure');
      fields = apiData.sections.flatMap((section: any) => section.fields || []);
    }
    
    // Handle widgets if they exist in the API response
    if (apiData.widgets && Array.isArray(apiData.widgets)) {
      widgets = this.mapApiWidgetsToFormWidgets(apiData.widgets);
    }
    
    return {
      id: apiData.id || `temp-${Date.now()}`,
      name: apiData.name || `${workflowType} Formular`,
      description: apiData.description || '',
      workflowType: apiData.requirementType || workflowType,
      fields: this.mapApiFieldsToFormFields(fields),
      widgets: widgets,
      lightModeEnabled: apiData.hasLightMode ?? false,
      createdAt: apiData.createdAt || new Date().toISOString(),
      modifiedAt: apiData.modifiedAt || new Date().toISOString(),
      version: apiData.version || '1.0.0'
    };
  }

  /**
   * Map API Fields to FormFields
   */
  private mapApiFieldsToFormFields(apiFields: any[]): FormField[] {
    if (!apiFields || !Array.isArray(apiFields)) {
      console.warn('[QwikAPI] No fields array in API response, returning empty array');
      return [];
    }
    
    return apiFields.map(field => ({
      id: field.id || `field-${Date.now()}-${Math.random()}`,
      type: this.mapApiFieldType(field.type),
      name: field.name,
      label: field.label,
      placeholder: field.placeholder || '',
      description: field.description || field.helpText || '',
      required: field.required ?? false,
      disabled: field.disabled || field.isReadonly || false,
      defaultValue: field.defaultValue,
      options: field.options?.map((opt: any) => ({
        value: opt.value || opt.Value,
        label: opt.label || opt.Label
      })) || [],
      order: field.order || 0,
      width: field.width as 'full' | 'half' | 'third' | 'quarter' || 'full',
      section: field.section || field.sectionId || 'default',
      lightModeVisible: field.lightModeVisible || this.isLightModeField(field),
      workflowStepBinding: field.workflowStepBinding || this.extractWorkflowStepBinding(field),
      permissions: field.permissions || {
        allowedRoles: ['Requester', 'Approver'],
        readOnlyRoles: [],
        hideFromRoles: []
      }
    }));
  }

  /**
   * Map API Widgets to FormWidgets
   */
  private mapApiWidgetsToFormWidgets(apiWidgets: any[]): FormWidget[] {
    if (!apiWidgets || !Array.isArray(apiWidgets)) {
      console.warn('[QwikAPI] No widgets array in API response, returning empty array');
      return [];
    }
    
    return apiWidgets.map(widget => ({
      id: widget.id || `widget-${Date.now()}-${Math.random()}`,
      type: widget.type || 'customGroup',
      title: widget.title || widget.name || 'Unnamed Widget',
      description: widget.description || '',
      order: widget.order || 0,
      section: widget.section || 'default',
      fields: this.mapApiFieldsToFormFields(widget.fields || []),
      workflowStepBinding: widget.workflowStepBinding || [],
      permissions: widget.permissions || {
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
      'url': 'url',
      'userSearch': 'userSearch',
      'requirementSearch': 'requirementSearch'
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
   * Create sections from fields (for backend compatibility)
   */
  private createSectionsFromFields(fields: FormField[]): any[] {
    // Group fields by section or create a default section
    const sectionMap = new Map<string, FormField[]>();
    
    fields.forEach(field => {
      const sectionId = field.section || 'default';
      if (!sectionMap.has(sectionId)) {
        sectionMap.set(sectionId, []);
      }
      sectionMap.get(sectionId)!.push(field);
    });

    // Create section objects
    const sections: any[] = [];
    let order = 1;
    
    sectionMap.forEach((sectionFields, sectionId) => {
      sections.push({
        id: sectionId,
        title: sectionId === 'default' ? 'Allgemeine Informationen' : sectionId,
        description: '',
        collapsible: false,
        collapsed: false,
        order: order++,
        permissions: {
          allowedRoles: [],
          allowedUsers: [],
          readOnlyRoles: [],
          hideFromRoles: []
        },
        workflowStepBinding: []
      });
    });

    return sections;
  }

  /**
   * Map FormConfiguration to API payload
   */
  private mapFormConfigurationToApi(config: FormConfiguration): any {
    // Backend expects sections AND fields structure
    const sections = this.createSectionsFromFields(config.fields);
    
    const payload = {
      name: config.name,
      description: config.description || '',
      requirementType: config.workflowType,
      isActive: true,
      hasLightMode: config.lightModeEnabled,
      // Backend requires both sections and fields
      sections: sections,
      fields: config.fields.map(field => ({
        id: field.id,
        type: field.type,
        name: field.name,
        label: field.label,
        placeholder: field.placeholder || '',
        description: field.description || '',
        required: field.required || false,
        disabled: field.disabled || false,
        defaultValue: field.defaultValue || null,
        options: field.options || [],
        order: field.order,
        width: field.width || 'full',
        section: field.section || 'default',
        widget: field.widget || null,
        lightModeVisible: field.lightModeVisible || false,
        workflowStepBinding: field.workflowStepBinding || [],
        permissions: field.permissions || {
          allowedRoles: [],
          allowedUsers: [],
          readOnlyRoles: [],
          hideFromRoles: []
        }
      })),
      // Add widgets to the payload
      widgets: config.widgets.map(widget => ({
        id: widget.id,
        type: widget.type,
        title: widget.title,
        description: widget.description || '',
        order: widget.order,
        section: widget.section || 'default',
        fields: widget.fields.map(field => ({
          id: field.id,
          type: field.type,
          name: field.name,
          label: field.label,
          placeholder: field.placeholder || '',
          description: field.description || '',
          required: field.required || false,
          disabled: field.disabled || false,
          defaultValue: field.defaultValue || null,
          options: field.options || [],
          order: field.order,
          width: field.width || 'full',
          lightModeVisible: field.lightModeVisible || false,
          workflowStepBinding: field.workflowStepBinding || [],
          permissions: field.permissions || {
            allowedRoles: [],
            allowedUsers: [],
            readOnlyRoles: [],
            hideFromRoles: []
          }
        })),
        workflowStepBinding: widget.workflowStepBinding || [],
        permissions: widget.permissions || {
          allowedRoles: [],
          allowedUsers: [],
          readOnlyRoles: [],
          hideFromRoles: []
        }
      })),
      permissions: {
        allowedRoles: [],
        allowedUsers: [],
        readOnlyRoles: [],
        hideFromRoles: [],
        denyRoles: [],
        adminRoles: []
      },
      lightMode: {
        enabled: config.lightModeEnabled,
        title: 'Light Mode',
        description: 'Vereinfachte Ansicht',
        showOnlyRequired: true
      }
    };

    // Only include id if it's not a temp ID
    if (config.id && !config.id.startsWith('temp-')) {
      (payload as any).id = config.id;
    }

    console.log('[QwikAPI] Mapped payload with widgets:', JSON.stringify(payload, null, 2));
    return payload;
  }

  /**
   * Save configuration locally as fallback
   */
  private saveConfigurationLocally(config: FormConfiguration): void {
    if (typeof window !== 'undefined') {
      const key = `form-config-${config.workflowType}`;
      localStorage.setItem(key, JSON.stringify(config));
      console.log(`[QwikAPI] Configuration saved locally with key: ${key}`);
    }
  }

  /**
   * Load configuration from local storage
   */
  private loadConfigurationLocally(workflowType: string): FormConfiguration | null {
    if (typeof window !== 'undefined') {
      const key = `form-config-${workflowType}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const config = JSON.parse(stored);
          console.log(`[QwikAPI] Configuration loaded from local storage: ${key}`);
          return config;
        } catch (error) {
          console.warn(`[QwikAPI] Failed to parse local config for ${key}:`, error);
          localStorage.removeItem(key); // Remove corrupted data
        }
      }
    }
    return null;
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
      widgets: [], // Empty widgets array for fallback
      lightModeEnabled: false,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      version: 'v1.0.0'
    };
  }
}

// ============================================================================
// EXPORT & SINGLETON
// ============================================================================

// Singleton instance
export const formBuilderApi = new FormsApiService();

// Export types for use in your FormBuilder
export type { FormField, FormWidget, WorkflowStep, FormConfiguration };

// Service functions that your FormBuilder can use directly
export const FormBuilderAPI = {
  /**
   * Test API connection
   */
  testConnection: () => 
    formBuilderApi.testConnection(),
    
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
