// src/services/form-builder-service.ts
// Ersetzt den MockFormBuilderService mit echter API-Anbindung

import type {
FormConfiguration,
FormField,
FormSection,
FieldType
} from './mock-form-builder-service';

// Import der API Types aus deiner neuen Types-Datei
import type {
FormConfigurationDto,
CreateFormConfigurationRequest,
UpdateFormConfigurationRequest,
DeployFormConfigurationRequest,
SubmitFormRequest,
ApiResponse,
FormValidationResultDto
} from '../types/database/forms';

/**

- Real Form Builder Service - connects to your backend API
- Ersetzt MockFormBuilderService für echte Datenbank-Anbindung
  */
  export class FormBuilderService {
  private baseUrl: string;
  private authToken: string | null = null;

constructor(baseUrl: string = '/api') {
this.baseUrl = baseUrl;
this.loadAuthToken();
}

private loadAuthToken() {
// Replace with your auth system
this.authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
}

private getHeaders(): HeadersInit {
const headers: HeadersInit = {
'Content-Type': 'application/json',
};


if (this.authToken) {
  headers['Authorization'] = `Bearer ${this.authToken}`;
}

return headers;


}

private async handleResponse<T>(response: Response): Promise<T> {
if (!response.ok) {
const errorData = await response.json().catch(() => ({}));
throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
}
return await response.json();
}

// ====================================
// MAIN FORM CONFIGURATION METHODS
// ====================================

/**

- Get form configuration by requirement type
- Equivalent to: MockFormBuilderService.getFormConfiguration()
  */
  async getFormConfiguration(
  requirementType: string,
  userRoles: string[] = []
  ): Promise<FormConfiguration> {
  try {
  const params = new URLSearchParams();
  params.append('requirementType', requirementType);
  if (userRoles.length > 0) {
  params.append('userRoles', userRoles.join(','));
  }
  
  const response = await fetch(
  `${this.baseUrl}/forms/configuration?${params.toString()}`,
  {
  method: 'GET',
  headers: this.getHeaders(),
  }
  );
  
  const apiResponse: ApiResponse<FormConfigurationDto> = await this.handleResponse(response);
  
  // Map API DTO to your existing FormConfiguration interface
  return this.mapDtoToFormConfiguration(apiResponse.data);
  } catch (error) {
  console.error('Error loading form configuration:', error);
  // Fallback to mock data if API fails (during development)
  return this.getDefaultFormConfiguration(requirementType);
  }
  }

/**

- Save form configuration
- Equivalent to: MockFormBuilderService.saveFormConfiguration()
  */
  async saveFormConfiguration(config: FormConfiguration): Promise<FormConfiguration> {
  try {
  const isNewForm = !config.id || config.id.startsWith('temp-');
  
  if (isNewForm) {
  // Create new form
  const createRequest: CreateFormConfigurationRequest = {
  name: config.name,
  description: config.description,
  requirementType: config.requirementType,
  workflowStepId: config.workflowStepId,
  sections: this.mapSectionsToDto(config.sections),
  fields: this.mapFieldsToDto(config.fields),
  isActive: config.isActive,
  hasLightMode: config.hasLightMode,
  permissions: {
  canView: ['Admin', 'User'],
  canEdit: ['Admin'],
  canSubmit: ['Admin', 'User'],
  canReview: ['Admin'],
  canApprove: ['Admin']
  },
  lightMode: {
  enabled: config.hasLightMode,
  requiredFields: config.fields.filter(f => f.lightModeVisible).map(f => f.id),
  hiddenSections: []
  }
  };
  
  const response = await fetch(`${this.baseUrl}/forms/configuration`, {
  method: 'POST',
  headers: this.getHeaders(),
  body: JSON.stringify(createRequest),
  });
  
  const apiResponse: ApiResponse<FormConfigurationDto> = await this.handleResponse(response);
  return this.mapDtoToFormConfiguration(apiResponse.data);
  } else {
  // Update existing form
  const updateRequest: UpdateFormConfigurationRequest = {
  id: config.id,
  name: config.name,
  description: config.description,
  workflowStepId: config.workflowStepId,
  hasLightMode: config.hasLightMode,
  sections: this.mapSectionsToDto(config.sections),
  fields: this.mapFieldsToDto(config.fields),
  version: config.version.toString()
  };
  
  const response = await fetch(`${this.baseUrl}/forms/configuration/${config.id}`, {
  method: 'PUT',
  headers: this.getHeaders(),
  body: JSON.stringify(updateRequest),
  });
  
  const apiResponse: ApiResponse<FormConfigurationDto> = await this.handleResponse(response);
  return this.mapDtoToFormConfiguration(apiResponse.data);
  }
  } catch (error) {
  console.error('Error saving form configuration:', error);
  throw error;
  }
  }

/**

- Validate form configuration before saving
  */
  async validateFormConfiguration(config: FormConfiguration): Promise<FormValidationResultDto> {
  try {
  const response = await fetch(`${this.baseUrl}/forms/configuration/validate`, {
  method: 'POST',
  headers: this.getHeaders(),
  body: JSON.stringify(config),
  });
  
  const apiResponse: ApiResponse<FormValidationResultDto> = await this.handleResponse(response);
  return apiResponse.data;
  } catch (error) {
  console.error('Error validating form configuration:', error);
  // Return basic validation if API fails
  return {
  isValid: config.fields.length > 0 && config.sections.length > 0,
  errors: [],
  warnings: [],
  suggestions: []
  };
  }
  }

/**

- Deploy form configuration (4-Eyes process)
  */
  async deployFormConfiguration(
  configId: string,
  version: string,
  targetEnvironment: string = 'production'
  ): Promise<void> {
  try {
  const deployRequest: DeployFormConfigurationRequest = {
  version,
  targetEnvironment,
  reviewComment: `Deployment to ${targetEnvironment}`
  };
  
  const response = await fetch(`${this.baseUrl}/forms/configuration/${configId}/deploy`, {
  method: 'POST',
  headers: this.getHeaders(),
  body: JSON.stringify(deployRequest),
  });
  
  await this.handleResponse(response);
  } catch (error) {
  console.error('Error deploying form configuration:', error);
  throw error;
  }
  }

/**

- Submit form data
  */
  async submitFormData(
  configId: string,
  requirementId: string,
  fieldValues: Record<string, any>,
  workflowStepId?: string,
  isLightMode: boolean = false
  ): Promise<void> {
  try {
  const submitRequest: SubmitFormRequest = {
  requirementId,
  workflowStepId,
  fieldValues,
  isLightMode
  };
  
  const response = await fetch(`${this.baseUrl}/forms/configuration/${configId}/submit`, {
  method: 'POST',
  headers: this.getHeaders(),
  body: JSON.stringify(submitRequest),
  });
  
  await this.handleResponse(response);
  } catch (error) {
  console.error('Error submitting form data:', error);
  throw error;
  }
  }

// ====================================
// MAPPING FUNCTIONS (DTO <-> FormConfiguration)
// ====================================

private mapDtoToFormConfiguration(dto: FormConfigurationDto): FormConfiguration {
return {
id: dto.id,
name: dto.name,
description: dto.description || '',
requirementType: dto.requirementType,
workflowStepId: dto.workflowStepId,
sections: dto.sections.map(s => ({
id: s.id,
title: s.title,
description: s.description,
collapsible: s.isCollapsible ?? true,
collapsed: s.isCollapsed ?? false,
order: s.order
})),
fields: dto.fields.map(f => ({
id: f.id,
type: f.type as FieldType,
name: f.name,
label: f.label,
placeholder: f.placeholder,
description: f.helpText,
required: f.required,
disabled: f.isReadonly ?? false,
defaultValue: f.defaultValue,
options: f.options?.map(o => ({ value: o.value, label: o.label })),
order: f.order,
width: f.width as 'full' | 'half' | 'third' | 'quarter' || 'full',
section: f.sectionId,
lightModeVisible: true, // TODO: Map from lightMode config
workflowStepBinding: [], // TODO: Map from conditions
permissions: {
allowedRoles: ['Admin', 'User'],
allowedUsers: [],
readOnlyRoles: [],
hideFromRoles: []
}
})),
version: parseInt(dto.version) || 1,
isActive: dto.isActive,
hasLightMode: dto.hasLightMode,
createdAt: dto.createdAt,
modifiedAt: dto.modifiedAt,
createdBy: dto.createdBy,
lightMode: {
enabled: dto.hasLightMode,
quickSubmitEnabled: true,
hiddenFields: [],
defaultValues: {}
}
};
}

private mapSectionsToDto(sections: FormSection[]) {
return sections.map(s => ({
id: s.id,
title: s.title,
description: s.description || '',
order: s.order,
isVisible: true,
isCollapsible: s.collapsible ?? true,
isCollapsed: s.collapsed ?? false
}));
}

private mapFieldsToDto(fields: FormField[]) {
return fields.map(f => ({
id: f.id,
sectionId: f.section || '',
name: f.name,
label: f.label,
type: f.type,
required: f.required ?? false,
order: f.order,
validationRules: {},
options: f.options || [],
defaultValue: f.defaultValue,
placeholder: f.placeholder,
helpText: f.description,
isVisible: true,
isReadonly: f.disabled ?? false,
conditions: [],
width: f.width || 'full'
}));
}

// ====================================
// FALLBACK & TEMPLATE METHODS
// ====================================

/**

- Fallback method that provides default configuration if API fails
  */
  private getDefaultFormConfiguration(requirementType: string): FormConfiguration {
  const defaultSection: FormSection = {
  id: 'section-1',
  title: 'Grunddaten',
  description: 'Grundlegende Informationen zur Anforderung',
  collapsible: true,
  collapsed: false,
  order: 1
  };


const defaultFields: FormField[] = [
  {
    id: 'field-title',
    type: 'text',
    name: 'title',
    label: 'Titel',
    placeholder: 'Titel der Anforderung',
    required: true,
    order: 1,
    width: 'full',
    section: 'section-1',
    lightModeVisible: true,
    permissions: {
      allowedRoles: ['Admin', 'User'],
      allowedUsers: [],
      readOnlyRoles: [],
      hideFromRoles: []
    }
  },
  {
    id: 'field-description',
    type: 'textarea',
    name: 'description',
    label: 'Beschreibung',
    placeholder: 'Detaillierte Beschreibung der Anforderung',
    required: true,
    order: 2,
    width: 'full',
    section: 'section-1',
    lightModeVisible: true,
    permissions: {
      allowedRoles: ['Admin', 'User'],
      allowedUsers: [],
      readOnlyRoles: [],
      hideFromRoles: []
    }
  }
];

return {
  id: `temp-${Date.now()}`,
  name: `${requirementType} Formular`,
  description: `Standardformular für ${requirementType}`,
  requirementType,
  sections: [defaultSection],
  fields: defaultFields,
  version: 1,
  isActive: true,
  hasLightMode: false,
  createdAt: new Date().toISOString(),
  modifiedAt: new Date().toISOString(),
  createdBy: 'system',
  lightMode: {
    enabled: false,
    quickSubmitEnabled: false,
    hiddenFields: [],
    defaultValues: {}
  }
};


}

/**

- Get list of available requirement types from API
  */
  async getRequirementTypes(): Promise<string[]> {
  try {
  // TODO: Implement API endpoint for requirement types
  // For now, return the static list from your component
  return [
  'Kleinanforderung',
  'Großanforderung',
  'TIA-Anforderung',
  'Supportleistung',
  'Betriebsauftrag',
  'SBBI-Lösung',
  'AWG-Release',
  'AWS-Release'
  ];
  } catch (error) {
  console.error('Error loading requirement types:', error);
  return [];
  }
  }

/**

- Get workflow steps for requirement type
  */
  async getWorkflowSteps(requirementType: string): Promise<Array<{id: string, title: string}>> {
  try {
  const response = await fetch(
  `${this.baseUrl}/workflows/requirement-type/${requirementType}/steps`,
  {
  method: 'GET',
  headers: this.getHeaders(),
  }
  );
  
  const apiResponse = await this.handleResponse(response);
  return apiResponse.data || [];
  } catch (error) {
  console.error('Error loading workflow steps:', error);
  return [];
  }
  }
  }

// Singleton instance for use in your Qwik components
export const formBuilderService = new FormBuilderService();

// Export field templates (from your existing mock service)
export const fieldTemplates = [
{ type: 'text', label: 'Text', icon: '📝', color: '#3b82f6' },
{ type: 'textarea', label: 'Textbereich', icon: '📄', color: '#6366f1' },
{ type: 'number', label: 'Zahl', icon: '🔢', color: '#8b5cf6' },
{ type: 'email', label: 'E-Mail', icon: '📧', color: '#06b6d4' },
{ type: 'phone', label: 'Telefon', icon: '📞', color: '#14b8a6' },
{ type: 'date', label: 'Datum', icon: '📅', color: '#10b981' },
{ type: 'datetime', label: 'Datum/Zeit', icon: '🕒', color: '#84cc16' },
{ type: 'select', label: 'Auswahl', icon: '📋', color: '#eab308' },
{ type: 'multiselect', label: 'Mehrfachauswahl', icon: '☑️', color: '#f59e0b' },
{ type: 'radio', label: 'Option', icon: '🔘', color: '#ef4444' },
{ type: 'checkbox', label: 'Checkbox', icon: '☑️', color: '#ec4899' },
{ type: 'file', label: 'Datei', icon: '📎', color: '#64748b' },
{ type: 'currency', label: 'Währung', icon: '💰', color: '#059669' },
{ type: 'percentage', label: 'Prozent', icon: '%', color: '#0891b2' },
{ type: 'url', label: 'URL', icon: '🔗', color: '#7c3aed' },
{ type: 'divider', label: 'Trennlinie', icon: '➖', color: '#6b7280' },
{ type: 'heading', label: 'Überschrift', icon: '📌', color: '#374151' }
] as const;

// Re-export types for compatibility
export type { FormConfiguration, FormField, FormSection, FieldType } from './mock-form-builder-service';
