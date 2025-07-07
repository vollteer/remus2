import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import {
MockFormBuilderService,
type FormField,
type FormConfiguration,
type FormSection,
type FieldType,
fieldTemplates
} from '~/services/mock-form-builder-service';

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

export const FormBuilder = component$(() => {
const selectedRequirementType = useSignal('Kleinanforderung');
const formFields = useSignal<FormField[]>([]);
const formSections = useSignal<FormSection[]>([]);
const selectedField = useSignal<FormField | null>(null);
const currentConfig = useSignal<FormConfiguration | null>(null);
const isLoading = useSignal(false);
const isSaving = useSignal(false);
const draggedField = useSignal<number | null>(null);
const dragOverIndex = useSignal<number | null>(null);
const previewMode = useSignal(false);
const notification = useSignal<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

// Helper function to show notifications instead of alert
const showNotification = $((message: string, type: 'success' | 'error' | 'info' = 'info') => {
notification.value = { message, type };
setTimeout(() => {
notification.value = null;
}, 5000);
});

// Helper function to show confirm dialog - removed showConfirm as it causes QRL issues

const getFieldIcon = (type: FieldType) => {
const template = fieldTemplates.find(t => t.type === type);
return template?.icon || '📝';
};

const getFieldColor = (type: FieldType) => {
const template = fieldTemplates.find(t => t.type === type);
return template?.color || '#3b82f6';
};

const addNewSection = $(() => {
const newSection: FormSection = {
id: `section-${Date.now()}`,
title: 'Neue Sektion',
description: '',
collapsible: true,
collapsed: false,
order: formSections.value.length + 1
};


formSections.value = [...formSections.value, newSection];


});



const loadFormConfiguration = $(async (requirementType: string) => {
isLoading.value = true;
try {
const config = await MockFormBuilderService.getFormConfiguration(requirementType);
if (config) {
currentConfig.value = config;
formFields.value = [...config.fields].sort((a, b) => a.order - b.order);
formSections.value = [...config.sections].sort((a, b) => a.order - b.order);
} else {
const newConfig = await MockFormBuilderService.createFormConfiguration(
requirementType,
`${requirementType} Formular`
);
currentConfig.value = newConfig;
formFields.value = [];
formSections.value = newConfig.sections;
}
selectedField.value = null;
} catch (error) {
console.error('Error loading form configuration:', error);
showNotification('Fehler beim Laden der Formular-Konfiguration', 'error');
} finally {
isLoading.value = false;
}
});

// Load form configuration when component mounts or type changes
useTask$(async ({ track }) => {
track(() => selectedRequirementType.value);
await loadFormConfiguration(selectedRequirementType.value);
});

const addNewField = $((template: typeof fieldTemplates[0]) => {
const newField: FormField = {
id: `field-${Date.now()}`,
type: template.type,
name: `field_${Date.now()}`,
label: `Neues ${template.title}`,
placeholder: template.type === 'text' ? 'Platzhalter Text...' : undefined,
required: false,
width: 'full',
section: formSections.value[0]?.id || 'section-1',
order: formFields.value.length + 1,
options: ['select', 'multiselect', 'radio', 'checkboxGroup'].includes(template.type)
? [
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
// Reorder remaining fields
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

// Drag and Drop handlers
const handleDragStart = $((fieldIndex: number) => {
draggedField.value = fieldIndex;
});

const handleDragOver = $((index: number) => {
dragOverIndex.value = index;
});

const handleDragLeave = $(() => {
dragOverIndex.value = null;
});

const handleDrop = $((dropIndex: number) => {
if (draggedField.value === null) return;


const newFields = [...formFields.value];
const draggedFieldData = newFields[draggedField.value];

// Remove dragged field
newFields.splice(draggedField.value, 1);

// Insert at new position
const finalDropIndex = draggedField.value < dropIndex ? dropIndex - 1 : dropIndex;
newFields.splice(finalDropIndex, 0, draggedFieldData);

// Update order
newFields.forEach((field, index) => {
  field.order = index + 1;
});

formFields.value = newFields;
draggedField.value = null;
dragOverIndex.value = null;


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
  
  const savedConfig = await MockFormBuilderService.saveFormConfiguration(configToSave);
  currentConfig.value = savedConfig;
  
  console.log("Form configuration saved:", savedConfig);
  showNotification(`Formular-Konfiguration für "${selectedRequirementType.value}" gespeichert! 🎉`, "success");
} catch (error) {
  console.error("Error saving form configuration:", error);
  showNotification("Fehler beim Speichern der Formular-Konfiguration", "error");
} finally {
  isSaving.value = false;
}


});

const validateForm = $(async () => {
if (!currentConfig.value) return;


try {
  const validation = await MockFormBuilderService.validateFormConfiguration({
    ...currentConfig.value,
    fields: formFields.value,
    sections: formSections.value
  });
  
  if (validation.isValid) {
    showNotification("✅ Formular-Konfiguration ist valid!", "success");
  } else {
    showNotification(`❌ Validierungsfehler: ${validation.errors.join(", ")}`, "error");
  }
} catch (error) {
  console.error("Error validating form:", error);
  showNotification("Fehler bei der Validierung", "error");
}


});

const resetForm = $(async () => {
// Inline confirm check to avoid QRL serialization issues
const shouldReset = typeof window !== 'undefined' && confirm('Formular zurücksetzen? Alle Änderungen gehen verloren!');


if (shouldReset) {
  try {
    const resetConfig = await MockFormBuilderService.resetFormToDefault(selectedRequirementType.value);
    currentConfig.value = resetConfig;
    formFields.value = [...resetConfig.fields].sort((a, b) => a.order - b.order);
    formSections.value = [...resetConfig.sections].sort((a, b) => a.order - b.order);
    selectedField.value = null;
    showNotification("Formular wurde zurückgesetzt!", "success");
  } catch (error) {
    console.error("Error resetting form:", error);
    showNotification("Fehler beim Zurücksetzen des Formulars", "error");
  }
}


});




const getFieldsBySection = (sectionId: string) => {
return formFields.value.filter(field => field.section === sectionId);
};

const addFieldOption = $((fieldId: string) => {
const field = formFields.value.find(f => f.id === fieldId);
if (!field || !field.options) return;


const newOption = {
  value: `option_${Date.now()}`,
  label: `Option ${field.options.length + 1}`
};

updateField(fieldId, {
  options: [...field.options, newOption]
});


});

const removeFieldOption = $((fieldId: string, optionIndex: number) => {
const field = formFields.value.find(f => f.id === fieldId);
if (!field || !field.options) return;


const newOptions = [...field.options];
newOptions.splice(optionIndex, 1);

updateField(fieldId, { options: newOptions });


});

return (
<div class="min-h-screen bg-white">
{/* Notification */}
{notification.value && (
<div class={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${ notification.value.type === "success" ? "bg-green-500 text-white" : notification.value.type === "error" ? "bg-red-500 text-white" : "bg-blue-500 text-white" }`}>
{notification.value.message}
</div>
)}


  {/* Header */}
  <div class="card mb-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Form Builder</h1>
        <p class="text-gray-600 mt-1">Erstelle und konfiguriere Formulare für verschiedene Anforderungsarten</p>
        {currentConfig.value && (
          <p class="text-sm text-gray-500 mt-1">
            Version {currentConfig.value.version} • {formFields.value.length} Felder
          </p>
        )}
      </div>
      <div class="flex gap-3">
        <button 
          class="btn btn-secondary"
          onClick$={() => previewMode.value = !previewMode.value}
        >
          {previewMode.value ? "🛠️ Editor" : "👁️ Vorschau"}
        </button>
        <button 
          class="btn btn-secondary"
          onClick$={validateForm}
          disabled={isLoading.value}
        >
          ✅ Validieren
        </button>
        <button 
          class="btn btn-secondary"
          onClick$={resetForm}
          disabled={isLoading.value}
        >
          Zurücksetzen
        </button>
        <button 
          class="btn btn-primary"
          onClick$={saveFormConfiguration}
          disabled={isLoading.value || isSaving.value}
        >
          {isSaving.value ? "Speichere..." : "Speichern"}
        </button>
      </div>
    </div>
  </div>

  {isLoading.value ? (
    <div class="card text-center py-12">
      <div class="text-4xl mb-4">⏳</div>
      <p class="text-lg font-medium">Formular wird geladen...</p>
    </div>
  ) : previewMode.value ? (
    // Preview Mode
    <div class="card">
      <h3 class="text-xl font-semibold mb-6">Formular Vorschau: {selectedRequirementType.value}</h3>
      
      {formSections.value.map(section => {
        const sectionFields = getFieldsBySection(section.id);
        if (sectionFields.length === 0) return null;
        
        return (
          <div key={section.id} class="mb-8">
            <h4 class="text-lg font-medium text-gray-900 mb-2">{section.title}</h4>
            {section.description && (
              <p class="text-sm text-gray-600 mb-4">{section.description}</p>
            )}
            
            <div class="grid grid-cols-12 gap-4">
              {sectionFields.map(field => (
                <div 
                  key={field.id} 
                  class={`
                    ${field.width === "full" ? "col-span-12" : ""}
                    ${field.width === "half" ? "col-span-6" : ""}
                    ${field.width === "third" ? "col-span-4" : ""}
                    ${field.width === "quarter" ? "col-span-3" : ""}
                  `}
                >
                  <div class="form-group">
                    <label class="form-label">
                      {field.label}
                      {field.required && <span class="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === "text" && (
                      <input 
                        type="text" 
                        class="form-input" 
                        placeholder={field.placeholder}
                        disabled 
                      />
                    )}
                    
                    {field.type === "textarea" && (
                      <textarea 
                        class="form-input" 
                        rows={3}
                        placeholder={field.placeholder}
                        disabled 
                      />
                    )}
                    
                    {field.type === "number" && (
                      <input 
                        type="number" 
                        class="form-input" 
                        placeholder={field.placeholder}
                        disabled 
                      />
                    )}
                    
                    {field.type === "email" && (
                      <input 
                        type="email" 
                        class="form-input" 
                        placeholder={field.placeholder}
                        disabled 
                      />
                    )}
                    
                    {field.type === "date" && (
                      <input 
                        type="date" 
                        class="form-input" 
                        disabled 
                      />
                    )}
                    
                    {field.type === "select" && (
                      <select class="form-input" disabled>
                        <option value="">Bitte wählen...</option>
                        {field.options?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {field.type === "checkbox" && (
                      <div class="flex items-center gap-2">
                        <input type="checkbox" disabled class="w-4 h-4" />
                        <span class="text-sm">{field.label}</span>
                      </div>
                    )}
                    
                    {field.type === "checkboxGroup" && field.options && (
                      <div class="space-y-2">
                        {field.options.map(option => (
                          <div key={option.value} class="flex items-center gap-2">
                            <input type="checkbox" disabled class="w-4 h-4" />
                            <span class="text-sm">{option.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {field.description && (
                      <p class="text-xs text-gray-500 mt-1">{field.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    // Editor Mode
    <div class="grid grid-cols-12 gap-6">
      {/* Left Sidebar - Field Templates */}
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

        <div class="card mb-4">
          <h3 class="text-lg font-semibold mb-4">Feld-Vorlagen</h3>
          <div class="space-y-2 max-h-96 overflow-y-auto">
            {fieldTemplates.map((template) => (
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
                </div>
              </button>
            ))}
          </div>
        </div>

        <div class="card">
          <h4 class="text-lg font-semibold mb-4">Aktionen</h4>
          <div class="space-y-2">
            <button 
              class="btn btn-secondary w-full text-sm"
              onClick$={addNewSection}
            >
              📂 Sektion hinzufügen
            </button>
            <button 
              class="btn btn-secondary w-full text-sm"
              onClick$={async () => {
                try {
                  const blob = await MockFormBuilderService.exportFormConfiguration(selectedRequirementType.value);
                  if (typeof window !== "undefined") {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `form-${selectedRequirementType.value}-${new Date().toISOString().split("T")[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    showNotification("Formular exportiert!", "success");
                  }
                } catch (error) {
                  showNotification("Fehler beim Export", "error");
                }
              }}
            >
              📥 Exportieren
            </button>
          </div>
        </div>
      </div>

      {/* Center - Form Canvas */}
      <div class="col-span-6">
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Formular: {selectedRequirementType.value}</h3>
            <span class="text-sm text-gray-500">{formFields.value.length} Felder</span>
          </div>

          <div class="min-h-96 space-y-4">
            {formSections.value.map(section => {
              const sectionFields = getFieldsBySection(section.id);
              
              return (
                <div key={section.id} class="border rounded-lg p-4 bg-gray-50">
                  <h4 class="font-medium text-gray-900 mb-2">{section.title}</h4>
                  
                  <div class="space-y-3 min-h-20 p-4 rounded-lg border-2 border-dashed border-gray-200 bg-white">
                    {sectionFields.map((field, index) => (
                      <div key={field.id} class="relative">
                        <div 
                          draggable
                          onDragStart$={() => handleDragStart(index)}
                          onDragOver$={(e) => {
                            e.preventDefault();
                            handleDragOver(index);
                          }}
                          onDragLeave$={handleDragLeave}
                          onDrop$={(e) => {
                            e.preventDefault();
                            handleDrop(index);
                          }}
                          class={`
                            group p-3 bg-white border rounded-lg cursor-move transition-all hover:shadow-md
                            ${selectedField.value?.id === field.id ? "border-blue-500 shadow-lg" : "border-gray-200 hover:border-gray-300"}
                            ${dragOverIndex.value === index ? "border-blue-400 bg-blue-50" : ""}
                            ${draggedField.value === index ? "opacity-50" : ""}
                          `}
                          onClick$={() => selectedField.value = field}
                        >
                          <div class="flex items-center gap-3">
                            {/* Drag Handle */}
                            <div class="text-gray-400 hover:text-gray-600 cursor-grab">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                              </svg>
                            </div>

                            {/* Field Icon */}
                            <div 
                              class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                              style={`background-color: ${getFieldColor(field.type)}`}
                            >
                              {getFieldIcon(field.type)}
                            </div>

                            {/* Field Info */}
                            <div class="flex-1">
                              <div class="flex items-center gap-2">
                                <h4 class="font-medium text-gray-900">{field.label}</h4>
                                {field.required && (
                                  <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                    Pflicht
                                  </span>
                                )}
                              </div>
                              <div class="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <span>{field.type}</span>
                                <span>{FIELD_WIDTHS[field.width]}</span>
                                <span>({field.name})</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                              <button 
                                class="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                onClick$={(e) => {
                                  e.stopPropagation();
                                  selectedField.value = field;
                                }}
                              >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button 
                                class="p-1 text-red-600 hover:bg-red-100 rounded"
                                onClick$={(e) => {
                                  e.stopPropagation();
                                  deleteField(field.id);
                                }}
                              >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {sectionFields.length === 0 && (
                      <div class="text-center py-8 text-gray-500">
                        <div class="text-2xl mb-2">📝</div>
                        <p class="text-sm">Ziehe Felder hier hinein</p>
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

      {/* Right Sidebar - Field Properties */}
      <div class="col-span-3">
        {selectedField.value ? (
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold">Feld bearbeiten</h3>
              <button 
                class="text-gray-400 hover:text-gray-600"
                onClick$={() => selectedField.value = null}
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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

              {/* Type */}
              <div class="form-group">
                <label class="form-label">Feldtyp</label>
                <select
                  class="form-input"
                  value={selectedField.value.type}
                  onChange$={(e) => updateField(selectedField.value!.id, { type: (e.target as HTMLSelectElement).value as FieldType })}
                >
                  {fieldTemplates.map((template) => (
                    <option key={template.type} value={template.type}>
                      {template.icon} {template.title}
                    </option>
                  ))}
                </select>
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

              {/* Placeholder */}
              {["text", "textarea", "number", "email", "phone", "url"].includes(selectedField.value.type) && (
                <div class="form-group">
                  <label class="form-label">Platzhalter</label>
                  <input
                    type="text"
                    class="form-input"
                    value={selectedField.value.placeholder || ""}
                    onInput$={(e) => updateField(selectedField.value!.id, { placeholder: (e.target as HTMLInputElement).value })}
                  />
                </div>
              )}

              {/* Description */}
              <div class="form-group">
                <label class="form-label">Beschreibung</label>
                <textarea
                  class="form-input"
                  rows={2}
                  value={selectedField.value.description || ""}
                  onInput$={(e) => updateField(selectedField.value!.id, { description: (e.target as HTMLTextAreaElement).value })}
                  placeholder="Hilfetext für das Feld..."
                />
              </div>

              {/* Required */}
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

              {/* Options for select/radio/checkbox fields */}
              {["select", "multiselect", "radio", "checkboxGroup"].includes(selectedField.value.type) && (
                <div class="form-group">
                  <label class="form-label">Optionen</label>
                  <div class="space-y-2">
                    {selectedField.value.options?.map((option, index) => (
                      <div key={index} class="flex gap-2">
                        <input
                          type="text"
                          class="form-input flex-1"
                          value={option.label}
                          onInput$={(e) => {
                            const newOptions = [...(selectedField.value!.options || [])];
                            newOptions[index] = { ...option, label: (e.target as HTMLInputElement).value };
                            updateField(selectedField.value!.id, { options: newOptions });
                          }}
                          placeholder="Option Label"
                        />
                        <button
                          class="btn text-red-600 hover:bg-red-100 px-2"
                          onClick$={() => removeFieldOption(selectedField.value!.id, index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      class="btn btn-secondary w-full text-sm"
                      onClick$={() => addFieldOption(selectedField.value!.id)}
                    >
                      + Option hinzufügen
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div class="mt-6 pt-4 border-t space-y-2">
              <button 
                class="btn btn-primary w-full"
                onClick$={() => duplicateField(selectedField.value!)}
              >
                Feld duplizieren
              </button>
              <button 
                class="btn w-full text-white"
                style="background-color: #ef4444;"
                onClick$={() => deleteField(selectedField.value!.id)}
              >
                Feld löschen
              </button>
            </div>
          </div>
        ) : (
          <div class="card text-center py-8">
            <div class="text-4xl mb-4">📝</div>
            <h3 class="font-medium text-gray-900 mb-2">Kein Feld ausgewählt</h3>
            <p class="text-sm text-gray-500">
              Klicke auf ein Feld im Formular, um es zu bearbeiten
            </p>
          </div>
        )}
      </div>
    </div>
  )}
</div>


);
});
