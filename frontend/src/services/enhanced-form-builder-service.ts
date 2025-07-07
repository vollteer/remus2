export type FieldType =
| 'text'
| 'textarea'
| 'number'
| 'email'
| 'phone'
| 'date'
| 'datetime'
| 'select'
| 'multiselect'
| 'radio'
| 'checkbox'
| 'checkboxGroup'
| 'file'
| 'currency'
| 'percentage'
| 'url'
| 'divider'
| 'heading';

export interface FieldOption {
value: string;
label: string;
disabled?: boolean;
}

export interface ValidationRule {
type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'email' | 'url';
value?: string | number;
message?: string;
}

export interface ConditionalRule {
field: string;
operator: 'equals' | 'notEquals' | 'contains' | 'isEmpty' | 'isNotEmpty' | 'greaterThan' | 'lessThan';
value?: string | number | boolean;
action: 'show' | 'hide' | 'require' | 'disable';
}

export interface FieldPermissions {
allowedRoles: string[];
allowedUsers: string[];
readOnlyRoles: string[];
hideFromRoles: string[];
denyRoles?: string[];
}

export interface SectionPermissions {
allowedRoles: string[];
allowedUsers: string[];
readOnlyRoles: string[];
hideFromRoles: string[];
}

export interface FormField {
id: string;
type: FieldType;
name: string;
label: string;
placeholder?: string;
description?: string;
required?: boolean;
disabled?: boolean;
defaultValue?: string | number | boolean | string[];
options?: FieldOption[];
validation?: ValidationRule[];
conditionalRules?: ConditionalRule[];
order: number;
width: 'full' | 'half' | 'third' | 'quarter';
section?: string;

// NEW: Enhanced features
lightModeVisible?: boolean; // Show in 'required fields only' mode
workflowStepBinding?: string[]; // Show only in specific workflow steps
permissions?: FieldPermissions; // Who can see/edit this field
}

export interface FormSection {
id: string;
title: string;
description?: string;
collapsible?: boolean;
collapsed?: boolean;
order: number;

// NEW: Enhanced features
permissions?: SectionPermissions;
workflowStepBinding?: string[]; // Show only in specific workflow steps
}

export interface LightModeConfig {
enabled: boolean;
title: string;
description: string;
showOnlyRequired?: boolean; // If false, show fields marked with lightModeVisible
}

export interface FormPermissions {
allowedRoles: string[];
denyRoles: string[];
adminRoles: string[]; // Full access regardless of field permissions
}

export interface FormConfiguration {
id: string;
name: string;
description?: string;
requirementType: string;
workflowStepId?: string; // Optional: Bind form to specific workflow step
sections: FormSection[];
fields: FormField[];
version: number;
isActive: boolean;
hasLightMode: boolean;
createdAt: string;
modifiedAt: string;
createdBy: string;

// NEW: Enhanced features
permissions?: FormPermissions;
lightMode?: LightModeConfig;
}

// Available user roles
export const availableRoles = [
{ value: 'Administrator', label: 'Administrator' },
{ value: 'Manager', label: 'Manager' },
{ value: 'Approver', label: 'Genehmiger' },
{ value: 'Requester', label: 'Antragsteller' },
{ value: 'TechnicalLead', label: 'Technischer Leiter' },
{ value: 'BusinessUser', label: 'Fachbenutzer' },
{ value: 'Viewer', label: 'Betrachter' },
{ value: 'External', label: 'Extern' }
];

// Mock workflow steps for binding
export const availableWorkflowSteps = [
{ value: 'step-1', label: 'Antrag erstellen' },
{ value: 'step-2', label: 'Prüfung' },
{ value: 'step-3', label: 'Genehmigung' },
{ value: 'step-4', label: 'Umsetzung' },
{ value: 'step-5', label: 'Test' },
{ value: 'step-6', label: 'Abnahme' }
];

// Enhanced field templates with permissions
export const enhancedFieldTemplates = [
{
id: 'template-text',
type: 'text' as FieldType,
icon: '📝',
title: 'Text',
description: 'Einzeiliges Textfeld',
color: '#3b82f6',
defaultPermissions: {
allowedRoles: ['Requester', 'Approver'],
allowedUsers: [],
readOnlyRoles: [],
hideFromRoles: ['External']
}
},
{
id: 'template-textarea',
type: 'textarea' as FieldType,
icon: '📄',
title: 'Textarea',
description: 'Mehrzeiliges Textfeld',
color: '#6366f1',
defaultPermissions: {
allowedRoles: ['Requester', 'Approver'],
allowedUsers: [],
readOnlyRoles: [],
hideFromRoles: ['External']
}
},
{
id: 'template-currency',
type: 'currency' as FieldType,
icon: '💰',
title: 'Währung',
description: 'Währungsfeld mit Euro-Symbol',
color: '#10b981',
defaultPermissions: {
allowedRoles: ['Requester', 'Manager', 'Approver'],
allowedUsers: [],
readOnlyRoles: ['Viewer'],
hideFromRoles: ['External']
}
},
{
id: 'template-select',
type: 'select' as FieldType,
icon: '📋',
title: 'Dropdown',
description: 'Einfachauswahl Dropdown',
color: '#ef4444',
defaultPermissions: {
allowedRoles: ['Requester', 'Approver'],
allowedUsers: [],
readOnlyRoles: [],
hideFromRoles: []
}
},
{
id: 'template-approval',
type: 'select' as FieldType,
icon: '✅',
title: 'Genehmigung',
description: 'Genehmigungsfeld (nur für Approver)',
color: '#10b981',
defaultPermissions: {
allowedRoles: ['Approver', 'Manager'],
allowedUsers: [],
readOnlyRoles: ['Requester', 'Viewer'],
hideFromRoles: ['External']
},
defaultOptions: [
{ value: 'pending', label: 'Ausstehend' },
{ value: 'approved', label: 'Genehmigt' },
{ value: 'rejected', label: 'Abgelehnt' },
{ value: 'needsInfo', label: 'Weitere Informationen erforderlich' }
]
}
];

// Default form configurations with enhanced features
const enhancedDefaultFormConfigurations: Record<string, FormConfiguration> = {
'Kleinanforderung': {
id: 'form-klein-enhanced-001',
name: 'Kleinanforderung Formular (Enhanced)',
description: 'Erweiterte Form mit Berechtigungen und Light Mode',
requirementType: 'Kleinanforderung',
version: 1,
isActive: true,
hasLightMode: true,
createdAt: '2025-01-01T00:00:00Z',
modifiedAt: '2025-01-01T00:00:00Z',
createdBy: 'System',
permissions: {
allowedRoles: ['Requester', 'Approver', 'Manager'],
denyRoles: ['External'],
adminRoles: ['Administrator']
},
lightMode: {
enabled: true,
title: 'Schnellerstellung',
description: 'Nur die wichtigsten Pflichtfelder',
showOnlyRequired: false
},
sections: [
{
id: 'section-1',
title: 'Grunddaten',
description: 'Grundlegende Informationen zur Anforderung',
collapsible: false,
collapsed: false,
order: 1,
permissions: {
allowedRoles: ['Requester', 'Approver'],
allowedUsers: [],
readOnlyRoles: [],
hideFromRoles: ['External']
},
workflowStepBinding: ['step-1', 'step-2']
},
{
id: 'section-2',
title: 'Genehmigung',
description: 'Genehmigungsrelevante Felder',
collapsible: true,
collapsed: false,
order: 2,
permissions: {
allowedRoles: ['Approver', 'Manager'],
allowedUsers: [],
readOnlyRoles: ['Requester'],
hideFromRoles: ['External']
},
workflowStepBinding: ['step-2', 'step-3']
}
],
fields: [
{
id: 'field-1',
type: 'text',
name: 'shortDescription',
label: 'Kurzbezeichnung',
placeholder: 'Kurze Beschreibung der Anforderung',
required: true,
lightModeVisible: true,
width: 'full',
section: 'section-1',
order: 1,
workflowStepBinding: ['step-1'],
permissions: {
allowedRoles: ['Requester', 'Approver'],
allowedUsers: [],
readOnlyRoles: [],
hideFromRoles: ['External']
},
validation: [
{ type: 'required', message: 'Kurzbezeichnung ist erforderlich' },
{ type: 'minLength', value: 5, message: 'Mindestens 5 Zeichen' },
{ type: 'maxLength', value: 100, message: 'Maximal 100 Zeichen' }
]
},
{
id: 'field-2',
type: 'select',
name: 'priority',
label: 'Priorität',
required: false,
lightModeVisible: false,
width: 'half',
section: 'section-1',
order: 2,
workflowStepBinding: ['step-1', 'step-2'],
permissions: {
allowedRoles: ['Requester', 'Approver'],
allowedUsers: [],
readOnlyRoles: [],
hideFromRoles: []
},
options: [
{ value: 'low', label: 'Niedrig' },
{ value: 'medium', label: 'Mittel' },
{ value: 'high', label: 'Hoch' },
{ value: 'urgent', label: 'Dringend' }
],
defaultValue: 'medium'
},
{
id: 'field-3',
type: 'currency',
name: 'budget',
label: 'Budget (€)',
placeholder: '0,00',
required: true,
lightModeVisible: true,
width: 'half',
section: 'section-1',
order: 3,
workflowStepBinding: ['step-1'],
permissions: {
allowedRoles: ['Requester', 'Manager', 'Approver'],
allowedUsers: [],
readOnlyRoles: ['Viewer'],
hideFromRoles: ['External']
},
validation: [
{ type: 'required', message: 'Budget ist erforderlich' },
{ type: 'min', value: 0, message: 'Budget muss positiv sein' }
]
},
{
id: 'field-4',
type: 'select',
name: 'approvalStatus',
label: 'Genehmigungsstatus',
required: false,
lightModeVisible: false,
width: 'full',
section: 'section-2',
order: 4,
workflowStepBinding: ['step-2', 'step-3'],
permissions: {
allowedRoles: ['Approver', 'Manager'],
allowedUsers: [],
readOnlyRoles: ['Requester', 'Viewer'],
hideFromRoles: ['External']
},
options: [
{ value: 'pending', label: 'Ausstehend' },
{ value: 'approved', label: 'Genehmigt' },
{ value: 'rejected', label: 'Abgelehnt' },
{ value: 'needsInfo', label: 'Weitere Informationen erforderlich' }
],
defaultValue: 'pending'
},
{
id: 'field-5',
type: 'textarea',
name: 'approvalComments',
label: 'Genehmigungskommentare',
placeholder: 'Kommentare zur Genehmigung…',
required: false,
lightModeVisible: false,
width: 'full',
section: 'section-2',
order: 5,
workflowStepBinding: ['step-2', 'step-3'],
permissions: {
allowedRoles: ['Approver', 'Manager'],
allowedUsers: [],
readOnlyRoles: ['Requester'],
hideFromRoles: ['External']
},
conditionalRules: [
{
field: 'approvalStatus',
operator: 'equals',
value: 'rejected',
action: 'require'
}
]
}
]
}
};

// Simulate API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class EnhancedFormBuilderService {

// Get form configuration with role filtering
static async getFormConfiguration(
requirementType: string,
userRoles: string[] = [],
workflowStep?: string
): Promise<FormConfiguration | null> {
await delay(200);


const stored = localStorage.getItem(`enhanced-form-config-${requirementType}`);
let config: FormConfiguration;

if (stored) {
  try {
    config = JSON.parse(stored);
  } catch {
    config = enhancedDefaultFormConfigurations[requirementType];
  }
} else {
  config = enhancedDefaultFormConfigurations[requirementType];
}

if (!config) return null;

// Filter based on user roles and workflow step
return this.filterConfigurationByPermissions(config, userRoles, workflowStep);


}

// Filter configuration based on user permissions and workflow step
static filterConfigurationByPermissions(
config: FormConfiguration,
userRoles: string[] = [],
workflowStep?: string
): FormConfiguration {


// Check if user has admin access
const hasAdminAccess = config.permissions?.adminRoles?.some(role => userRoles.includes(role));

if (hasAdminAccess) {
  return config; // Admin sees everything
}

// Filter sections
const filteredSections = config.sections.filter(section => {
  // Filter by workflow step
  if (workflowStep && section.workflowStepBinding && !section.workflowStepBinding.includes(workflowStep)) {
    return false;
  }
  
  // Filter by permissions
  if (section.permissions) {
    const hasAccess = this.checkPermissions(section.permissions, userRoles);
    return hasAccess;
  }
  
  return true;
});

// Filter fields
const filteredFields = config.fields.filter(field => {
  // Filter by workflow step
  if (workflowStep && field.workflowStepBinding && !field.workflowStepBinding.includes(workflowStep)) {
    return false;
  }
  
  // Filter by permissions
  if (field.permissions) {
    const hasAccess = this.checkPermissions(field.permissions, userRoles);
    return hasAccess;
  }
  
  return true;
}).map(field => {
  // Set read-only based on permissions
  if (field.permissions?.readOnlyRoles?.some(role => userRoles.includes(role))) {
    return { ...field, disabled: true };
  }
  return field;
});

return {
  ...config,
  sections: filteredSections,
  fields: filteredFields
};


}

// Check if user has permission based on roles
static checkPermissions(permissions: FieldPermissions | SectionPermissions, userRoles: string[]): boolean {
// Check deny roles first
if ('denyRoles' in permissions && permissions.denyRoles?.some(role => userRoles.includes(role))) {
return false;
}


// Check hide from roles
if (permissions.hideFromRoles?.some(role => userRoles.includes(role))) {
  return false;
}

// Check allowed roles
if (permissions.allowedRoles?.length > 0) {
  return permissions.allowedRoles.some(role => userRoles.includes(role));
}

return true; // Default allow if no specific restrictions


}

// Get light mode configuration
static async getLightModeConfiguration(
requirementType: string,
userRoles: string[] = []
): Promise<FormConfiguration | null> {
const config = await this.getFormConfiguration(requirementType, userRoles);


if (!config?.lightMode?.enabled) {
  return null;
}

// Filter to only required fields or fields marked for light mode
const lightModeFields = config.fields.filter(field => {
  if (config.lightMode?.showOnlyRequired) {
    return field.required;
  } else {
    return field.lightModeVisible || field.required;
  }
});

return {
  ...config,
  fields: lightModeFields
};


}

// Save enhanced form configuration
static async saveFormConfiguration(config: FormConfiguration): Promise<FormConfiguration> {
await delay(400);


const savedConfig: FormConfiguration = {
  ...config,
  modifiedAt: new Date().toISOString(),
  version: config.version + 1
};

localStorage.setItem(`enhanced-form-config-${config.requirementType}`, JSON.stringify(savedConfig));
return savedConfig;


}

// Get available users (mock)
static async getAvailableUsers(): Promise<{ value: string; label: string }[]> {
await delay(100);
return [
{ value: 'user1@company.com', label: 'Max Mustermann' },
{ value: 'user2@company.com', label: 'Anna Schmidt' },
{ value: 'user3@company.com', label: 'Thomas Wagner' },
{ value: 'user4@company.com', label: 'Lisa Müller' }
];
}

// Validate field permissions
static async validateFieldPermissions(field: FormField): Promise<{ isValid: boolean; errors: string[] }> {
await delay(50);


const errors: string[] = [];

if (!field.permissions?.allowedRoles || field.permissions.allowedRoles.length === 0) {
  errors.push("Mindestens eine erlaubte Rolle muss definiert sein");
}

// Check for conflicting permissions
const hasConflict = field.permissions?.allowedRoles?.some(role => 
  field.permissions?.hideFromRoles?.includes(role)
);

if (hasConflict) {
  errors.push("Rollen können nicht gleichzeitig erlaubt und versteckt sein");
}

return {
  isValid: errors.length === 0,
  errors
};


}

// Get workflow steps for binding
static async getWorkflowSteps(requirementType: string): Promise<{ value: string; label: string }[]> {
await delay(100);


// Mock: In reality, this would fetch from WorkflowConfigurations table
const workflowSteps: Record<string, { value: string; label: string }[]> = {
  "Kleinanforderung": [
    { value: "step-1", label: "Antrag erstellen" },
    { value: "step-2", label: "Prüfung" },
    { value: "step-3", label: "Umsetzung" },
    { value: "step-4", label: "Abnahme" }
  ],
  "Großanforderung": [
    { value: "step-1", label: "Antrag erstellen" },
    { value: "step-2", label: "Grobanalyse" },
    { value: "step-3", label: "Feinkonzept" },
    { value: "step-4", label: "Freigabe" },
    { value: "step-5", label: "Umsetzung" },
    { value: "step-6", label: "Test" },
    { value: "step-7", label: "Abnahme" }
  ]
};

return workflowSteps[requirementType] || availableWorkflowSteps;


}
}

