import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';

// Enhanced Types
type FieldType = 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'date' | 'datetime' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'checkboxGroup' | 'file' | 'currency' | 'percentage' | 'url' | 'divider' | 'heading';

interface FieldOption {
value: string;
label: string;
disabled?: boolean;
}

interface FieldPermissions {
allowedRoles: string[];
allowedUsers: string[];
readOnlyRoles: string[];
hideFromRoles: string[];
}

interface FormField {
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
order: number;
width: 'full' | 'half' | 'third' | 'quarter';
section?: string;
lightModeVisible?: boolean;
workflowStepBinding?: string[];
permissions?: FieldPermissions;
}

interface FormSection {
id: string;
title: string;
description?: string;
collapsible?: boolean;
collapsed?: boolean;
order: number;
permissions?: FieldPermissions;
workflowStepBinding?: string[];
}

interface FormConfiguration {
id: string;
name: string;
description?: string;
requirementType: string;
workflowStepId?: string;
sections: FormSection[];
fields: FormField[];
version: number;
isActive: boolean;
hasLightMode: boolean;
createdAt: string;
modifiedAt: string;
createdBy: string;
lightMode?: {
enabled: boolean;
title: string;
description: string;
};
}

// Enhanced Field Templates
const enhancedFieldTemplates = [
{
id: 'template-text',
type: 'text' as const,
icon: '📝',
title: 'Text',
description: 'Einzeiliges Textfeld',
color: '#3b82f6',
category: 'basic',
defaultPermissions: {
allowedRoles: ['Requester', 'Approver'],
allowedUsers: [],
readOnlyRoles: [],
hideFromRoles: ['External']
}
},
{
id: 'template-textarea',
type: 'textarea' as const,
icon: '📄',
title: 'Textarea',
description: 'Mehrzeiliges Textfeld',
color: '#6366f1',
category: 'basic'
},
{
id: 'template-currency',
type: 'currency' as const,
icon: '💰',
title: 'Währung',
description: 'Währungsfeld mit Euro-Symbol',
color: '#10b981',
category: 'financial',
defaultPermissions: {
allowedRoles: ['Requester', 'Manager', 'Approver'],
allowedUsers: [],
readOnlyRoles: ['Viewer'],
hideFromRoles: ['External']
}
},
{
id: 'template-select',
type: 'select' as const,
icon: '📋',
title: 'Dropdown',
description: 'Einfachauswahl Dropdown',
color: '#ef4444',
category: 'basic'
},
{
id: 'template-approval',
type: 'select' as const,
icon: '✅',
title: 'Genehmigung',
description: 'Genehmigungsfeld (nur für Approver)',
color: '#10b981',
category: 'workflow',
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
},
{
id: 'template-priority',
type: 'select' as const,
icon: '🔥',
title: 'Priorität',
description: 'Prioritätsstufe auswählen',
color: '#f59e0b',
category: 'workflow',
defaultOptions: [
{ value: 'low', label: 'Niedrig' },
{ value: 'medium', label: 'Mittel' },
{ value: 'high', label: 'Hoch' },
{ value: 'urgent', label: 'Dringend' }
]
},
{
id: 'template-date',
type: 'date' as const,
icon: '📅',
title: 'Datum',
description: 'Datum auswählen',
color: '#8b5cf6',
category: 'basic'
},
{
id: 'template-email',
type: 'email' as const,
icon: '📧',
title: 'E-Mail',
description: 'E-Mail Adresse',
color: '#06b6d4',
category: 'basic'
}
];

const availableRoles = [
{ value: 'Administrator', label: 'Administrator', color: '#ef4444' },
{ value: 'Manager', label: 'Manager', color: '#f59e0b' },
{ value: 'Approver', label: 'Genehmiger', color: '#10b981' },
{ value: 'Requester', label: 'Antragsteller', color: '#3b82f6' },
{ value: 'TechnicalLead', label: 'Technischer Leiter', color: '#8b5cf6' },
{ value: 'BusinessUser', label: 'Fachbenutzer', color: '#06b6d4' },
{ value: 'Viewer', label: 'Betrachter', color: '#6b7280' },
{ value: 'External', label: 'Extern', color: '#9ca3af' }
];

const FIELD_WIDTHS = {
'full': 'Vollbreite',
'half': 'Halbe Breite',
'third': 'Drittel',
'quarter': 'Viertel'
} as const;

const requirementTypes = [
'Kleinanforderung',
'Großanforderung',
'TIA-Anforderung',
'Supportleistung',
'Betriebsauftrag',
'SBBI-Lösung',
'AWG-Release',
'AWS-Release'
];

// Mock Services
const mockLoadFormConfiguration = async (requirementType: string): Promise<FormConfiguration> => {
await new Promise(resolve => setTimeout(resolve, 300));

return {
id: `form-${requirementType.toLowerCase()}-001`,
name: `${requirementType} Formular (Enhanced)`,
description: 'Enhanced Form mit Smart Permissions und Workflow-Binding',
requirementType,
version: 1,
isActive: true,
hasLightMode: true,
createdAt: new Date().toISOString(),
modifiedAt: new Date().toISOString(),
createdBy: 'System',
lightMode: {
enabled: true,
title: 'Schnellerstellung',
description: 'Nur die wichtigsten Felder'
},
sections: [
{
id: 'section-1',
title: 'Grunddaten',
description: 'Grundlegende Informationen',
collapsible: false,
collapsed: false,
order: 1,
permissions: {
allowedRoles: ['Requester', 'Approver', 'Manager'],
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
placeholder: 'Kurze Beschreibung...',
required: true,
lightModeVisible: true,
width: 'full',
section: 'section-1',
order: 1,
workflowStepBinding: ['step-1'],
permissions: {
allowedRoles: ['Requester', 'Approver', 'Manager'],
allowedUsers: [],
readOnlyRoles: [],
hideFromRoles: ['External']
}
},
{
id: 'field-2',
type: 'currency',
name: 'budget',
label: 'Budget (€)',
placeholder: '0,00',
required: true,
lightModeVisible: true,
width: 'half',
section: 'section-1',
order: 2,
workflowStepBinding: ['step-1'],
permissions: {
allowedRoles: ['Requester', 'Manager', 'Approver'],
allowedUsers: [],
readOnlyRoles: ['Viewer'],
hideFromRoles: ['External']
}
},
{
id: 'field-3',
type: 'select',
name: 'approvalStatus',
label: 'Genehmigungsstatus',
required: false,
lightModeVisible: false,
width: 'full',
section: 'section-2',
order: 3,
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
]
}
]
};
};

const mockSaveFormConfiguration = async (config: FormConfiguration): Promise<FormConfiguration> => {
await new Promise(resolve => setTimeout(resolve, 500));
return {
...config,
modifiedAt: new Date().toISOString(),
version: config.version + 1
};
};

const mockGetWorkflowSteps = async (requirementType: string) => {
await new Promise(resolve => setTimeout(resolve, 100));

const workflowSteps: Record<string, { value: string; label: string; description?: string }[]> = {
'Kleinanforderung': [
{ value: 'step-1', label: 'Antrag erstellen', description: 'Benutzer erstellt Anforderung' },
{ value: 'step-2', label: 'Prüfung', description: 'Fachliche Prüfung' },
{ value: 'step-3', label: 'Genehmigung', description: 'Manager-Genehmigung' },
{ value: 'step-4', label: 'Umsetzung', description: 'Technische Umsetzung' },
{ value: 'step-5', label: 'Abnahme', description: 'Finale Abnahme' }
],
'Großanforderung': [
{ value: 'step-1', label: 'Antrag erstellen', description: 'Detaillierter Antrag' },
{ value: 'step-2', label: 'Grobanalyse', description: 'Erste technische Bewertung' },
{ value: 'step-3', label: 'Feinkonzept', description: 'Detaillierte Spezifikation' },
{ value: 'step-4', label: 'Freigabe', description: 'Geschäftsführung-Freigabe' },
{ value: 'step-5', label: 'Umsetzung', description: 'Entwicklung' },
{ value: 'step-6', label: 'Test', description: 'Qualitätssicherung' },
{ value: 'step-7', label: 'Abnahme', description: 'Kunde nimmt ab' }
]
};

return workflowSteps[requirementType] || workflowSteps['Kleinanforderung'];
};

export const EnhancedFormBuilder = component$(() => {
// State management
const selectedRequirementType = useSignal('Kleinanforderung');
const formFields = useSignal<FormField[]>([]);
const formSections = useSignal<FormSection[]>([]);
const selectedField = useSignal<FormField | null>(null);
const currentConfig = useSignal<FormConfiguration | null>(null);
const isLoading = useSignal(false);
const isSaving = useSignal(false);
const previewMode = useSignal(false);
const lightModePreview = useSignal(false);
const notification = useSignal<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

// Enhanced State
const currentUserRoles = useSignal<string[]>(['Requester', 'Approver']);
const previewAsRole = useSignal<string>('Requester');
const availableWorkflowSteps = useSignal<{ value: string; label: string; description?: string }[]>([]);
const showPermissionsEditor = useSignal(false);
const showWorkflowBindingEditor = useSignal(false);
const showLightModeConfig = useSignal(false);
const showRolePreview = useSignal(false);
const selectedTemplateCategory = useSignal<string>('all');

// Helper functions
const showNotification = $((message: string, type: 'success' | 'error' | 'info' = 'info') => {
notification.value = { message, type };
setTimeout(() => {
notification.value = null;
}, 5000);
});

const getFieldIcon = (type: FieldType) => {
const template = enhancedFieldTemplates.find(t => t.type === type);
return template?.icon || '📝';
};

const getFieldColor = (type: FieldType) => {
const template = enhancedFieldTemplates.find(t => t.type === type);
return template?.color || '#3b82f6';
};

const getFieldsBySection = (sectionId: string) => {
return formFields.value.filter(field => field.section === sectionId);
};

// Permission filtering
const checkFieldPermissions = (field: FormField, userRoles: string[]) => {
if (!field.permissions) return { canView: true, canEdit: true };


const canView = !field.permissions.hideFromRoles?.some(role => userRoles.includes(role)) &&
               (field.permissions.allowedRoles?.length === 0 || 
                field.permissions.allowedRoles?.some(role => userRoles.includes(role)));

const canEdit = canView && !field.permissions.readOnlyRoles?.some(role => userRoles.includes(role));

return { canView, canEdit };


};

const getFilteredFields = (userRoles: string[] = currentUserRoles.value) => {
return formFields.value.filter(field => {
const { canView } = checkFieldPermissions(field, userRoles);
return canView;
}).map(field => {
const { canEdit } = checkFieldPermissions(field, userRoles);
return { ...field, disabled: !canEdit };
});
};

const getFilteredTemplates = () => {
if (selectedTemplateCategory.value === 'all') return enhancedFieldTemplates;
return enhancedFieldTemplates.filter(t => t.category === selectedTemplateCategory.value);
};

// Load form configuration
useTask$(async ({ track }) => {
track(() => selectedRequirementType.value);
isLoading.value = true;


try {
  const config = await mockLoadFormConfiguration(selectedRequirementType.value);
  currentConfig.value = config;
  formFields.value = [...config.fields].sort((a, b) => a.order - b.order);
  formSections.value = [...config.sections].sort((a, b) => a.order - b.order);
  
  const steps = await mockGetWorkflowSteps(selectedRequirementType.value);
  availableWorkflowSteps.value = steps;
  
  selectedField.value = null;
} catch (error) {
  console.error("Error loading form configuration:", error);
  showNotification("Fehler beim Laden der Formular-Konfiguration", "error");
} finally {
  isLoading.value = false;
}


});

const addNewField = $((template: typeof enhancedFieldTemplates[0]) => {
const newField: FormField = {
id: `field-${Date.now()}`,
type: template.type,
name: `field_${Date.now()}`,
label: `Neues ${template.title}`,
placeholder: template.type === 'text' ? 'Platzhalter Text...' : undefined,
required: false,
lightModeVisible: false,
width: 'full',
section: formSections.value[0]?.id || 'section-1',
order: formFields.value.length + 1,
permissions: template.defaultPermissions || {
allowedRoles: ['Requester'],
allowedUsers: [],
readOnlyRoles: [],
hideFromRoles: []
},
workflowStepBinding: [],
options: ['select', 'multiselect', 'radio', 'checkboxGroup'].includes(template.type)
? (template as any).defaultOptions || [
{ value: 'option1', label: 'Option 1' },
{ value: 'option2', label: 'Option 2' }
]
: undefined
};


formFields.value = [...formFields.value, newField];
selectedField.value = newField;


});

const updateField = $((fieldId: string, updates: Partial<FormField>) => {
formFields.value = formFields.value.map(field =>
field.id === fieldId ? { ...field, ...updates } : field
);


if (selectedField.value?.id === fieldId) {
  selectedField.value = { ...selectedField.value, ...updates };
}


});

const deleteField = $((fieldId: string) => {
formFields.value = formFields.value.filter(field => field.id !== fieldId);
formFields.value.forEach((field, index) => {
field.order = index + 1;
});


if (selectedField.value?.id === fieldId) {
  selectedField.value = null;
}


});

const duplicateField = $((field: FormField) => {
const fieldCopy: FormField = {
...field,
id: `field-${Date.now()}`,
name: `${field.name}_copy`,
label: `${field.label} (Kopie)`,
order: formFields.value.length + 1
};
formFields.value = [...formFields.value, fieldCopy];
selectedField.value = fieldCopy;
});

const saveFormConfiguration = $(async () => {
if (!currentConfig.value) return;


isSaving.value = true;
try {
  const configToSave: FormConfiguration = {
    ...currentConfig.value,
    fields: formFields.value,
    sections: formSections.value
  };
  
  const savedConfig = await mockSaveFormConfiguration(configToSave);
  currentConfig.value = savedConfig;
  
  showNotification(`Formular-Konfiguration für "${selectedRequirementType.value}" gespeichert! 🎉`, "success");
} catch (error) {
  console.error("Error saving form configuration:", error);
  showNotification("Fehler beim Speichern der Formular-Konfiguration", "error");
} finally {
  isSaving.value = false;
}


});

const addNewSection = $(() => {
const newSection: FormSection = {
id: `section-${Date.now()}`,
title: 'Neue Sektion',
description: '',
collapsible: true,
collapsed: false,
order: formSections.value.length + 1,
permissions: {
allowedRoles: ['Requester', 'Approver'],
allowedUsers: [],
readOnlyRoles: [],
hideFromRoles: []
}
};


formSections.value = [...formSections.value, newSection];


});

const updateFieldPermissions = $((fieldId: string, permissions: FieldPermissions) => {
updateField(fieldId, { permissions });
});

const updateWorkflowBinding = $((fieldId: string, steps: string[]) => {
updateField(fieldId, { workflowStepBinding: steps });
});

// Toggle preview mode for different roles
const toggleRolePreview = $((role: string) => {
previewAsRole.value = role;
showRolePreview.value = !showRolePreview.value;
});

return (
<div class="min-h-screen bg-white">
{/* Notification */}
{notification.value && (
<div class={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${ notification.value.type === "success" ? "bg-green-500 text-white" :  notification.value.type === "error" ? "bg-red-500 text-white" :  "bg-blue-500 text-white" }`}>
{notification.value.message}
</div>
)}


  {/* Enhanced Header */}
  <div class="card mb-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Enhanced Form Builder 🚀</h1>
        <p class="text-gray-600 mt-1">Intelligente Formulare mit Smart Permissions, Workflow-Binding und Light Mode</p>
        {currentConfig.value && (
          <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>Version {currentConfig.value.version}</span>
            <span>•</span>
            <span>{formFields.value.length} Felder</span>
            <span>•</span>
            <span>{formSections.value.length} Sektionen</span>
            {currentConfig.value.lightMode?.enabled && (
              <>
                <span>•</span>
                <span class="text-green-600">Light Mode verfügbar</span>
              </>
            )}
          </div>
        )}
      </div>
      <div class="flex gap-3">
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">Vorschau als:</label>
          <select 
            class="form-input text-sm"
            value={previewAsRole.value}
            onChange$={(e) => previewAsRole.value = (e.target as HTMLSelectElement).value}
          >
            {availableRoles.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
          <button 
            class="btn btn-secondary text-sm"
            onClick$={() => showRolePreview.value = !showRolePreview.value}
          >
            {showRolePreview.value ? "🔒 Normal" : "👁️ Role Preview"}
          </button>
        </div>
        <button 
          class="btn btn-secondary"
          onClick$={() => previewMode.value = !previewMode.value}
        >
          {previewMode.value ? "🛠️ Editor" : "👁️ Vorschau"}
        </button>
        <button 
          class="btn btn-primary"
          onClick$={saveFormConfiguration}
          disabled={isLoading.value || isSaving.value}
        >
          {isSaving.value ? "⏳ Speichere..." : "💾 Speichern"}
        </button>
      </div>
    </div>
  </div>

  {isLoading.value ? (
    <div class="card text-center py-12">
      <div class="text-4xl mb-4">⏳</div>
      <p class="text-lg font-medium">Enhanced Form Builder wird geladen...</p>
      <p class="text-sm text-gray-500 mt-2">Lade Smart Permissions und Workflow-Bindings...</p>
    </div>
  ) : (
    <div class="grid grid-cols-12 gap-6">
      {/* Left Sidebar - Enhanced Templates */}
      <div class="col-span-3">
        <div class="card mb-4">
          <h3 class="text-lg font-semibold mb-4">Anforderungsart</h3>
          <select 
            class="form-input"
            value={selectedRequirementType.value}
            onChange$={(e) => {
              selectedRequirementType.value = (e.target as HTMLSelectElement).value;
            }}
          >
            {requirementTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Your Roles */}
        <div class="card mb-4">
          <h3 class="text-lg font-semibold mb-2">Ihre Rollen</h3>
          <div class="flex flex-wrap gap-1">
            {currentUserRoles.value.map(role => {
              const roleInfo = availableRoles.find(r => r.value === role);
              return (
                <span 
                  key={role} 
                  class="text-xs px-2 py-1 rounded-full text-white"
                  style={`background-color: ${roleInfo?.color || '#6b7280'}`}
                >
                  {roleInfo?.label || role}
                </span>
              );
            })}
          </div>
        </div>

        {/* Template Categories */}
        <div class="card mb-4">
          <h3 class="text-lg font-semibold mb-4">Feld-Kategorien</h3>
          <div class="flex flex-wrap gap-2 mb-4">
            <button 
              class={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedTemplateCategory.value === "all" 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick$={() => selectedTemplateCategory.value = "all"}
            >
              Alle
            </button>
            <button 
              class={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedTemplateCategory.value === "basic" 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick$={() => selectedTemplateCategory.value = "basic"}
            >
              Basic
            </button>
            <button 
              class={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedTemplateCategory.value === "financial" 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick$={() => selectedTemplateCategory.value = "financial"}
            >
              Financial
            </button>
            <button 
              class={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedTemplateCategory.value === "workflow" 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick$={() => selectedTemplateCategory.value = "workflow"}
            >
              Workflow
            </button>
          </div>

          {/* Enhanced Templates */}
          <div class="space-y-2 max-h-96 overflow-y-auto">
            {getFilteredTemplates().map((template) => (
              <button
                key={template.id}
                class="w-full flex items-center gap-3 p-3 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group text-left"
                onClick$={() => addNewField(template)}
              >
                <div 
                  class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0"
                  style={`background-color: ${template.color}`}
                >
                  {template.icon}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-gray-700 group-hover:text-blue-700 text-sm">
                    {template.title}
                  </div>
                  <div class="text-xs text-gray-500 truncate">
                    {template.description}
                  </div>
                  {template.defaultPermissions && (
                    <div class="text-xs text-blue-600 mt-1">
                      🔐 Smart Permissions
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Actions */}
        <div class="card">
          <h4 class="text-lg font-semibold mb-4">Smart Actions</h4>
          <div class="space-y-2">
            <button 
              class="btn btn-secondary w-full text-sm"
              onClick$={addNewSection}
            >
              📂 Sektion hinzufügen
            </button>
            <button 
              class="btn btn-secondary w-full text-sm"
              onClick$={() => showPermissionsEditor.value = !showPermissionsEditor.value}
            >
              🔐 Permissions Editor
            </button>
            <button 
              class="btn btn-secondary w-full text-sm"
              onClick$={() => showWorkflowBindingEditor.value = !showWorkflowBindingEditor.value}
            >
              🎯 Workflow Binding
            </button>
            <button 
              class="btn btn-secondary w-full text-sm"
              onClick$={() => showLightModeConfig.value = !showLightModeConfig.value}
            >
              ⚡ Light Mode Config
            </button>
          </div>
        </div>
      </div>

      {/* Center - Enhanced Form Canvas */}
      <div class="col-span-6">
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">
              Formular: {selectedRequirementType.value}
              {lightModePreview.value && <span class="text-yellow-600 ml-2">(⚡ Light Mode)</span>}
              {showRolePreview.value && (
                <span class="text-purple-600 ml-2">(👁️ als {availableRoles.find(r => r.value === previewAsRole.value)?.label})</span>
              )}
            </h3>
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-500">
                {showRolePreview.value ? getFilteredFields([previewAsRole.value]).length : formFields.value.length} Felder
              </span>
              {showRolePreview.value && (
                <span 
                  class="text-xs px-2 py-1 rounded-full text-white"
                  style={`background-color: ${availableRoles.find(r => r.value === previewAsRole.value)?.color || '#6b7280'}`}
                >
                  {availableRoles.find(r => r.value === previewAsRole.value)?.label}
                </span>
              )}
            </div>
          </div>

          <div class="min-h-96 space-y-4">
            {formSections.value.map(section => {
              const fieldsToShow = showRolePreview.value 
                ? getFilteredFields([previewAsRole.value]).filter(f => f.section === section.id)
                : getFieldsBySection(section.id);
              
              // Check if section should be visible for preview role
              if (showRolePreview.value && section.permissions) {
                const canViewSection = !section.permissions.hideFromRoles?.includes(previewAsRole.value) &&
                                     (section.permissions.allowedRoles?.length === 0 || 
                                      section.permissions.allowedRoles?.includes(previewAsRole.value));
                if (!canViewSection) return null;
              }
              
              return (
                <div key={section.id} class="border rounded-lg p-4 bg-gray-50">
                  <div class="flex items-center justify-between mb-2">
                    <div>
                      <h4 class="font-medium text-gray-900">{section.title}</h4>
                      {section.description && (
                        <p class="text-sm text-gray-600">{section.description}</p>
                      )}
                    </div>
                    {section.workflowStepBinding && section.workflowStepBinding.length > 0 && (
                      <div class="flex gap-1">
                        {section.workflowStepBinding.slice(0, 2).map(stepId => (
                          <span key={stepId} class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            {availableWorkflowSteps.value.find(s => s.value === stepId)?.label || stepId}
                          </span>
                        ))}
                        {section.workflowStepBinding.length > 2 && (
                          <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            +{section.workflowStepBinding.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div class="space-y-3 min-h-20 p-4 rounded-lg border-2 border-dashed border-gray-200 bg-white">
                    {fieldsToShow.map((field) => (
                      <div key={field.id} class="relative">
                        <div 
                          class={`
                            group p-3 bg-white border rounded-lg cursor-pointer transition-all hover:shadow-md
                            ${selectedField.value?.id === field.id ? "border-blue-500 shadow-lg" : "border-gray-200 hover:border-gray-300"}
                            ${field.disabled && showRolePreview.value ? "bg-gray-50 opacity-75" : ""}
                          `}
                          onClick$={() => !showRolePreview.value && (selectedField.value = field)}
                        >
                          <div class="flex items-center gap-3">
                            {/* Field Icon */}
                            <div 
                              class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                              style={`background-color: ${getFieldColor(field.type)}`}
                            >
                              {getFieldIcon(field.type)}
                            </div>

                            {/* Enhanced Field Info */}
                            <div class="flex-1">
                              <div class="flex items-center gap-2 flex-wrap">
                                <h4 class="font-medium text-gray-900">{field.label}</h4>
                                {field.required && (
                                  <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                    Pflicht
                                  </span>
                                )}
                                {field.lightModeVisible && (
                                  <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                    ⚡ Light Mode
                                  </span>
                                )}
                                {field.disabled && showRolePreview.value && (
                                  <span class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                    🔒 Read-Only
                                  </span>
                                )}
                              </div>
                              <div class="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <span>{field.type}</span>
                                <span>{FIELD_WIDTHS[field.width]}</span>
                                <span>({field.name})</span>
                              </div>
                              
                              {/* Workflow Step Binding */}
                              {field.workflowStepBinding && field.workflowStepBinding.length > 0 && (
                                <div class="flex gap-1 mt-1">
                                  {field.workflowStepBinding.slice(0, 2).map(stepId => (
                                    <span key={stepId} class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                      {availableWorkflowSteps.value.find(s => s.value === stepId)?.label || stepId}
                                    </span>
                                  ))}
                                  {field.workflowStepBinding.length > 2 && (
                                    <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                      +{field.workflowStepBinding.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              {/* Permissions Preview */}
                              {field.permissions && !showRolePreview.value && (
                                <div class="flex gap-1 mt-1">
                                  <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    🔐 {field.permissions.allowedRoles.length} Rollen
                                  </span>
                                  {field.permissions.readOnlyRoles && field.permissions.readOnlyRoles.length > 0 && (
                                    <span class="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                      👁️ {field.permissions.readOnlyRoles.length} Read-Only
                                    </span>
                                  )}
                                  {field.permissions.hideFromRoles && field.permissions.hideFromRoles.length > 0 && (
                                    <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                      🚫 {field.permissions.hideFromRoles.length} versteckt
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            {!showRolePreview.value && (
                              <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button 
                                  class="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                  onClick$={(e) => {
                                    e.stopPropagation();
                                    selectedField.value = field;
                                  }}
                                >
                                  ✏️
                                </button>
                                <button 
                                  class="p-1 text-green-600 hover:bg-green-100 rounded"
                                  onClick$={(e) => {
                                    e.stopPropagation();
                                    duplicateField(field);
                                  }}
                                >
                                  📋
                                </button>
                                <button 
                                  class="p-1 text-red-600 hover:bg-red-100 rounded"
                                  onClick$={(e) => {
                                    e.stopPropagation();
                                    deleteField(field.id);
                                  }}
                                >
                                  🗑️
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {fieldsToShow.length === 0 && (
                      <div class="text-center py-8 text-gray-500">
                        <div class="text-2xl mb-2">
                          {showRolePreview.value ? "🚫" : "📝"}
                        </div>
                        <p class="text-sm">
                          {showRolePreview.value 
                            ? `Keine Felder für Rolle "${availableRoles.find(r => r.value === previewAsRole.value)?.label}" sichtbar`
                            : "Ziehe Felder hier hinein"
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {formSections.value.length === 0 && (
              <div class="text-center py-12 text-gray-500">
                <div class="text-4xl mb-4">📋</div>
                <p class="text-lg font-medium">Keine Sektionen vorhanden</p>
                <p class="text-sm">Erstelle eine Sektion, um Felder hinzuzufügen</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Enhanced Properties */}
      <div class="col-span-3">
        {selectedField.value && !showRolePreview.value ? (
          <div class="space-y-4">
            {/* Basic Field Properties */}
            <div class="card">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold">Feld bearbeiten</h3>
                <button 
                  class="text-gray-400 hover:text-gray-600"
                  onClick$={() => selectedField.value = null}
                >
                  ✖️
                </button>
              </div>

              <div class="space-y-4">
                {/* Label */}
                <div class="form-group">
                  <label class="form-label">Label</label>
                  <input
                    type="text"
                    class="form-input"
                    value={selectedField.value.label}
                    onInput$={(e) => updateField(selectedField.value!.id, { label: (e.target as HTMLInputElement).value })}
                  />
                </div>

                {/* Field Name */}
                <div class="form-group">
                  <label class="form-label">Feldname (technisch)</label>
                  <input
                    type="text"
                    class="form-input"
                    value={selectedField.value.name}
                    onInput$={(e) => updateField(selectedField.value!.id, { name: (e.target as HTMLInputElement).value })}
                  />
                </div>

                {/* Width */}
                <div class="form-group">
                  <label class="form-label">Breite</label>
                  <select
                    class="form-input"
                    value={selectedField.value.width}
                    onChange$={(e) => updateField(selectedField.value!.id, { width: (e.target as HTMLSelectElement).value as any })}
                  >
                    {Object.entries(FIELD_WIDTHS).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                {/* Section */}
                <div class="form-group">
                  <label class="form-label">Sektion</label>
                  <select
                    class="form-input"
                    value={selectedField.value.section}
                    onChange$={(e) => updateField(selectedField.value!.id, { section: (e.target as HTMLSelectElement).value })}
                  >
                    {formSections.value.map((section) => (
                      <option key={section.id} value={section.id}>{section.title}</option>
                    ))}
                  </select>
                </div>

                {/* Required & Light Mode */}
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="required"
                      class="w-4 h-4"
                      checked={selectedField.value.required}
                      onChange$={(e) => updateField(selectedField.value!.id, { required: (e.target as HTMLInputElement).checked })}
                    />
                    <label for="required" class="text-sm font-medium text-gray-700">
                      Pflichtfeld
                    </label>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="lightMode"
                      class="w-4 h-4"
                      checked={selectedField.value.lightModeVisible || false}
                      onChange$={(e) => updateField(selectedField.value!.id, { lightModeVisible: (e.target as HTMLInputElement).checked })}
                    />
                    <label for="lightMode" class="text-sm font-medium text-gray-700">
                      ⚡ In Light Mode anzeigen
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Permissions Editor */}
            <div class="card">
              <h4 class="text-lg font-semibold mb-4">🔐 Smart Permissions</h4>
              
              <div class="space-y-4">
                {/* Allowed Roles */}
                <div class="form-group">
                  <label class="form-label">Erlaubte Rollen</label>
                  <div class="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                    {availableRoles.map(role => (
                      <div key={role.value} class="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`allowed-${role.value}`}
                          class="w-4 h-4"
                          checked={selectedField.value?.permissions?.allowedRoles?.includes(role.value) || false}
                          onChange$={(e) => {
                            const currentPermissions = selectedField.value?.permissions || {
                              allowedRoles: [],
                              allowedUsers: [],
                              readOnlyRoles: [],
                              hideFromRoles: []
                            };
                            const isChecked = (e.target as HTMLInputElement).checked;
                            const newAllowedRoles = isChecked 
                              ? [...(currentPermissions.allowedRoles || []), role.value]
                              : (currentPermissions.allowedRoles || []).filter(r => r !== role.value);
                            
                            updateFieldPermissions(selectedField.value!.id, {
                              ...currentPermissions,
                              allowedRoles: newAllowedRoles
                            });
                          }}
                        />
                        <span 
                          class="w-3 h-3 rounded-full"
                          style={`background-color: ${role.color}`}
                        ></span>
                        <label for={`allowed-${role.value}`} class="text-sm text-gray-700 flex-1">
                          {role.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Read Only Roles */}
                <div class="form-group">
                  <label class="form-label">👁️ Nur-Lesen Rollen</label>
                  <div class="space-y-2 max-h-24 overflow-y-auto border rounded p-2">
                    {availableRoles.filter(role => 
                      selectedField.value?.permissions?.allowedRoles?.includes(role.value)
                    ).map(role => (
                      <div key={role.value} class="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`readonly-${role.value}`}
                          class="w-4 h-4"
                          checked={selectedField.value?.permissions?.readOnlyRoles?.includes(role.value) || false}
                          onChange$={(e) => {
                            const currentPermissions = selectedField.value?.permissions!;
                            const isChecked = (e.target as HTMLInputElement).checked;
                            const newReadOnlyRoles = isChecked 
                              ? [...(currentPermissions.readOnlyRoles || []), role.value]
                              : (currentPermissions.readOnlyRoles || []).filter(r => r !== role.value);
                            
                            updateFieldPermissions(selectedField.value!.id, {
                              ...currentPermissions,
                              readOnlyRoles: newReadOnlyRoles
                            });
                          }}
                        />
                        <span 
                          class="w-3 h-3 rounded-full"
                          style={`background-color: ${role.color}`}
                        ></span>
                        <label for={`readonly-${role.value}`} class="text-sm text-gray-700">
                          {role.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hide From Roles */}
                <div class="form-group">
                  <label class="form-label">🚫 Verstecken vor Rollen</label>
                  <div class="space-y-2 max-h-24 overflow-y-auto border rounded p-2">
                    {availableRoles.map(role => (
                      <div key={role.value} class="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`hide-${role.value}`}
                          class="w-4 h-4"
                          checked={selectedField.value?.permissions?.hideFromRoles?.includes(role.value) || false}
                          onChange$={(e) => {
                            const currentPermissions = selectedField.value?.permissions || {
                              allowedRoles: [],
                              allowedUsers: [],
                              readOnlyRoles: [],
                              hideFromRoles: []
                            };
                            const isChecked = (e.target as HTMLInputElement).checked;
                            const newHideFromRoles = isChecked 
                              ? [...(currentPermissions.hideFromRoles || []), role.value]
                              : (currentPermissions.hideFromRoles || []).filter(r => r !== role.value);
                            
                            updateFieldPermissions(selectedField.value!.id, {
                              ...currentPermissions,
                              hideFromRoles: newHideFromRoles
                            });
                          }}
                        />
                        <span 
                          class="w-3 h-3 rounded-full"
                          style={`background-color: ${role.color}`}
                        ></span>
                        <label for={`hide-${role.value}`} class="text-sm text-gray-700">
                          {role.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Workflow Step Binding */}
            <div class="card">
              <h4 class="text-lg font-semibold mb-4">🎯 Workflow-Binding</h4>
              
              <div class="form-group">
                <label class="form-label">Anzeigen in Schritten</label>
                <div class="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                  {availableWorkflowSteps.value.map(step => (
                    <div key={step.value} class="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id={`step-${step.value}`}
                        class="w-4 h-4 mt-0.5"
                        checked={selectedField.value?.workflowStepBinding?.includes(step.value) || false}
                        onChange$={(e) => {
                          const currentBinding = selectedField.value?.workflowStepBinding || [];
                          const isChecked = (e.target as HTMLInputElement).checked;
                          const newBinding = isChecked 
                            ? [...currentBinding, step.value]
                            : currentBinding.filter(s => s !== step.value);
                          
                          updateWorkflowBinding(selectedField.value!.id, newBinding);
                        }}
                      />
                      <div class="flex-1">
                        <label for={`step-${step.value}`} class="text-sm text-gray-700 font-medium block">
                          {step.label}
                        </label>
                        {step.description && (
                          <p class="text-xs text-gray-500">{step.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p class="text-xs text-gray-500 mt-2">
                  💡 Leer = in allen Schritten anzeigen
                </p>
              </div>
            </div>

            {/* Actions */}
            <div class="card">
              <h4 class="font-semibold mb-3">Aktionen</h4>
              <div class="space-y-2">
                <button 
                  class="btn btn-primary w-full"
                  onClick$={() => duplicateField(selectedField.value!)}
                >
                  📋 Feld duplizieren
                </button>
                <button 
                  class="btn w-full text-white"
                  style="background-color: #ef4444;"
                  onClick$={() => deleteField(selectedField.value!.id)}
                >
                  🗑️ Feld löschen
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div class="card text-center py-8">
            <div class="text-4xl mb-4">
              {showRolePreview.value ? "👁️" : "📝"}
            </div>
            <h3 class="font-medium text-gray-900 mb-2">
              {showRolePreview.value 
                ? `Role Preview: ${availableRoles.find(r => r.value === previewAsRole.value)?.label}`
                : "Kein Feld ausgewählt"
              }
            </h3>
            <p class="text-sm text-gray-500">
              {showRolePreview.value 
                ? "Formular wird angezeigt wie diese Rolle es sehen würde"
                : "Klicke auf ein Feld im Formular, um es zu bearbeiten"
              }
            </p>
            {showRolePreview.value && (
              <div class="mt-4">
                <span 
                  class="inline-block px-3 py-1 rounded-full text-white text-sm"
                  style={`background-color: ${availableRoles.find(r => r.value === previewAsRole.value)?.color || '#6b7280'}`}
                >
                  {availableRoles.find(r => r.value === previewAsRole.value)?.label}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )}
</div>


);
});
