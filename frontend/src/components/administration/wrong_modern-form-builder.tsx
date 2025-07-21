// src/components/administration/form-builder.tsx
// Updated version mit echter API-Anbindung

import { component$, useSignal, useTask$, $, useVisibleTask$ } from '@builder.io/qwik';
import {
formBuilderService, // 👈 Echter Service statt Mock
fieldTemplates,
type FormField,
type FormConfiguration,
type FormSection,
type FieldType,
} from '~/services/form-builder-service'; // 👈 Updated import

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
const isValidating = useSignal(false); // 👈 Neu: Validation State
const isDirty = useSignal(false); // 👈 Neu: Dirty State Tracking
const lastSavedAt = useSignal<Date | null>(null); // 👈 Neu: Auto-save tracking
const draggedField = useSignal<number | null>(null);
const dragOverIndex = useSignal<number | null>(null);
const previewMode = useSignal(false);
const notification = useSignal<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
const validationResult = useSignal<any>(null); // 👈 Neu: Validation Results

// 👈 Neu: Auto-save timer
const autoSaveTimer = useSignal<number | null>(null);

// Helper function to show notifications
const showNotification = $((message: string, type: 'success' | 'error' | 'info' = 'info') => {
notification.value = { message, type };
setTimeout(() => {
notification.value = null;
}, 5000);
});

// 👈 Neu: Mark form as dirty when changes are made
const markDirty = $(() => {
isDirty.value = true;


// Clear existing timer
if (autoSaveTimer.value) {
  clearTimeout(autoSaveTimer.value);
}

// Set new auto-save timer (5 seconds)
autoSaveTimer.value = window.setTimeout(async () => {
  if (isDirty.value && currentConfig.value) {
    await autoSave();
  }
}, 5000);


});

// 👈 Neu: Auto-save functionality
const autoSave = $(async () => {
if (!currentConfig.value || !isDirty.value) return;


try {
  console.log('Auto-saving form configuration...');
  
  const updatedConfig = {
    ...currentConfig.value,
    fields: formFields.value,
    sections: formSections.value,
    modifiedAt: new Date().toISOString()
  };

  const savedConfig = await formBuilderService.saveFormConfiguration(updatedConfig);
  currentConfig.value = savedConfig;
  isDirty.value = false;
  lastSavedAt.value = new Date();
  
  showNotification('Automatisch gespeichert', 'info');
} catch (error) {
  console.error('Auto-save failed:', error);
  showNotification('Auto-save fehlgeschlagen', 'error');
}


});

const getFieldIcon = (type: FieldType) => {
const template = fieldTemplates.find(t => t.type === type);
return template?.icon || '📝';
};

const getFieldColor = (type: FieldType) => {
const template = fieldTemplates.find(t => t.type === type);
return template?.color || '#3b82f6';
};

const getFieldsBySection = (sectionId: string) => {
return formFields.value.filter(field => field.section === sectionId);
};

const addNewSection = $(async () => {
const newSection: FormSection = {
id: `section-${Date.now()}`,
title: 'Neue Sektion',
description: '',
collapsible: true,
collapsed: false,
order: formSections.value.length + 1
};


formSections.value = [...formSections.value, newSection];
markDirty(); // 👈 Mark as dirty


});

// 👈 Updated: Load form configuration mit echter API
const loadFormConfiguration = $(async (requirementType: string) => {
isLoading.value = true;
try {
console.log(`Loading form configuration for: ${requirementType}`);


  // 👈 Echter API Call statt Mock
  const config = await formBuilderService.getFormConfiguration(requirementType);
  
  currentConfig.value = config;
  formFields.value = config.fields;
  formSections.value = config.sections;
  isDirty.value = false; // 👈 Reset dirty state after loading
  
  showNotification(`Formular für ${requirementType} geladen`, 'success');
} catch (error) {
  console.error('Error loading form configuration:', error);
  showNotification('Fehler beim Laden der Formular-Konfiguration', 'error');
  
  // 👈 Fallback: Create basic configuration if loading fails
  const defaultConfig = await formBuilderService.getFormConfiguration(requirementType);
  currentConfig.value = defaultConfig;
  formFields.value = defaultConfig.fields;
  formSections.value = defaultConfig.sections;
} finally {
  isLoading.value = false;
}


});

// 👈 Updated: Save form configuration mit echter API
const saveFormConfiguration = $(async () => {
if (!currentConfig.value) return;


isSaving.value = true;
try {
  console.log('Saving form configuration...');
  
  const configToSave = {
    ...currentConfig.value,
    fields: formFields.value,
    sections: formSections.value,
    modifiedAt: new Date().toISOString()
  };

  const savedConfig = await formBuilderService.saveFormConfiguration(configToSave);
  currentConfig.value = savedConfig;
  isDirty.value = false;
  lastSavedAt.value = new Date();
  
  showNotification('Formular erfolgreich gespeichert', 'success');
} catch (error) {
  console.error('Error saving form configuration:', error);
  showNotification('Fehler beim Speichern der Formular-Konfiguration', 'error');
} finally {
  isSaving.value = false;
}


});

// 👈 Neu: Validate form configuration
const validateConfiguration = $(async () => {
if (!currentConfig.value) return;


isValidating.value = true;
try {
  const configToValidate = {
    ...currentConfig.value,
    fields: formFields.value,
    sections: formSections.value
  };

  const result = await formBuilderService.validateFormConfiguration(configToValidate);
  validationResult.value = result;
  
  if (result.isValid) {
    showNotification('Formular-Konfiguration ist gültig', 'success');
  } else {
    showNotification(`${result.errors.length} Validierungsfehler gefunden`, 'error');
  }
} catch (error) {
  console.error('Error validating form configuration:', error);
  showNotification('Fehler bei der Validierung', 'error');
} finally {
  isValidating.value = false;
}


});

// 👈 Neu: Deploy form configuration (4-Eyes process)
const deployConfiguration = $(async () => {
if (!currentConfig.value) return;


try {
  // First validate
  await validateConfiguration();
  
  if (validationResult.value && !validationResult.value.isValid) {
    showNotification('Formular muss vor Deployment validiert werden', 'error');
    return;
  }
  
  // Then deploy
  await formBuilderService.deployFormConfiguration(
    currentConfig.value.id, 
    currentConfig.value.version.toString(),
    'production'
  );
  
  showNotification('Deployment erfolgreich gestartet (4-Augen-Prinzip)', 'success');
} catch (error) {
  console.error('Error deploying form configuration:', error);
  showNotification('Fehler beim Deployment', 'error');
}


});

const addField = $((type: FieldType) => {
const activeSectionId = formSections.value[0]?.id || 'section-1';


const newField: FormField = {
  id: `field-${Date.now()}`,
  type,
  name: `field_${type}_${Date.now()}`,
  label: `Neues ${type} Feld`,
  placeholder: `Geben Sie ${type} ein...`,
  required: false,
  order: formFields.value.length + 1,
  width: 'full',
  section: activeSectionId,
  lightModeVisible: true,
  permissions: {
    allowedRoles: ['Admin', 'User'],
    allowedUsers: [],
    readOnlyRoles: [],
    hideFromRoles: []
  }
};

formFields.value = [...formFields.value, newField];
selectedField.value = newField;
markDirty(); // 👈 Mark as dirty


});

const updateField = $((fieldId: string, updates: Partial<FormField>) => {
formFields.value = formFields.value.map(field =>
field.id === fieldId ? { ...field, ...updates } : field
);
markDirty(); // 👈 Mark as dirty
});

const deleteField = $((fieldId: string) => {
formFields.value = formFields.value.filter(field => field.id !== fieldId);
if (selectedField.value?.id === fieldId) {
selectedField.value = null;
}
markDirty(); // 👈 Mark as dirty
});

const updateSection = $((sectionId: string, updates: Partial<FormSection>) => {
formSections.value = formSections.value.map(section =>
section.id === sectionId ? { ...section, ...updates } : section
);
markDirty(); // 👈 Mark as dirty
});

const deleteSection = $((sectionId: string) => {
// Move fields from deleted section to first remaining section
const remainingSections = formSections.value.filter(s => s.id !== sectionId);
if (remainingSections.length > 0) {
const targetSectionId = remainingSections[0].id;
formFields.value = formFields.value.map(field =>
field.section === sectionId ? { ...field, section: targetSectionId } : field
);
} else {
// If no sections remain, remove all fields
formFields.value = [];
}


formSections.value = remainingSections;
markDirty(); // 👈 Mark as dirty


});

// Drag and drop functionality
const startDrag = $((index: number) => {
draggedField.value = index;
});

const allowDrop = $((event: DragEvent) => {
event.preventDefault();
});

const drop = $((event: DragEvent, dropIndex: number) => {
event.preventDefault();


if (draggedField.value !== null) {
  const fields = [...formFields.value];
  const draggedItem = fields[draggedField.value];
  
  fields.splice(draggedField.value, 1);
  fields.splice(dropIndex, 0, draggedItem);
  
  // Update order
  fields.forEach((field, index) => {
    field.order = index + 1;
  });
  
  formFields.value = fields;
  draggedField.value = null;
  dragOverIndex.value = null;
  markDirty(); // 👈 Mark as dirty
}


});

// Load initial configuration when component mounts
useTask$(async ({ track }) => {
track(() => selectedRequirementType.value);
await loadFormConfiguration(selectedRequirementType.value);
});

// 👈 Neu: Cleanup auto-save timer on unmount
useVisibleTask$(({ cleanup }) => {
cleanup(() => {
if (autoSaveTimer.value) {
clearTimeout(autoSaveTimer.value);
}
});
});

return (
<div class="min-h-screen bg-gray-50 p-6">
{/* Header */}
<div class="mb-6">
<div class="flex justify-between items-center mb-4">
<div>
<h1 class="text-3xl font-bold text-gray-900">Formular Builder</h1>
<p class="text-gray-600 mt-1">
Erstellen und bearbeiten Sie Formulare für verschiedene Anforderungstypen
</p>
</div>


      {/* 👈 Neu: Status indicators */}
      <div class="flex items-center gap-4">
        {isDirty.value && (
          <span class="text-orange-600 text-sm font-medium">
            • Ungespeicherte Änderungen
          </span>
        )}
        {lastSavedAt.value && (
          <span class="text-green-600 text-sm">
            Zuletzt gespeichert: {lastSavedAt.value.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>

    {/* Requirement Type Selector */}
    <div class="flex items-center gap-4">
      <div class="form-group">
        <label class="form-label">Anforderungstyp</label>
        <select
          class="form-input"
          value={selectedRequirementType.value}
          onChange$={(event) => {
            selectedRequirementType.value = (event.target as HTMLSelectElement).value;
          }}
        >
          {requirementTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* 👈 Updated: Action buttons mit neuen Features */}
      <div class="flex gap-2 mt-6">
        <button
          type="button"
          class="btn btn-primary"
          onClick$={saveFormConfiguration}
          disabled={isSaving.value || isLoading.value}
        >
          {isSaving.value ? 'Speichert...' : 'Speichern'}
        </button>

        <button
          type="button"
          class="btn btn-secondary"
          onClick$={validateConfiguration}
          disabled={isValidating.value || isLoading.value}
        >
          {isValidating.value ? 'Validiert...' : 'Validieren'}
        </button>

        <button
          type="button"
          class="btn btn-success"
          onClick$={deployConfiguration}
          disabled={isLoading.value || !currentConfig.value}
        >
          Deploy
        </button>

        <button
          type="button"
          class={`btn ${previewMode.value ? 'btn-primary' : 'btn-secondary'}`}
          onClick$={() => previewMode.value = !previewMode.value}
        >
          {previewMode.value ? 'Editor' : 'Vorschau'}
        </button>
      </div>
    </div>
  </div>

  {/* 👈 Neu: Validation Results */}
  {validationResult.value && !validationResult.value.isValid && (
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <h3 class="text-red-800 font-semibold mb-2">Validierungsfehler:</h3>
      <ul class="text-red-700 text-sm space-y-1">
        {validationResult.value.errors.map((error: any, index: number) => (
          <li key={index}>• {error.message}</li>
        ))}
      </ul>
    </div>
  )}

  {/* Loading State */}
  {isLoading.value && (
    <div class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Lade Formular-Konfiguration...</p>
      </div>
    </div>
  )}

  {/* Main Content */}
  {!isLoading.value && (
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Field Templates Panel */}
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 class="text-lg font-semibold mb-4">Feldtypen</h3>
          <div class="space-y-2">
            {fieldTemplates.map(template => (
              <button
                key={template.type}
                type="button"
                class="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                onClick$={() => addField(template.type)}
                style={`border-left: 4px solid ${template.color}`}
              >
                <div class="flex items-center gap-3">
                  <span class="text-lg">{template.icon}</span>
                  <div>
                    <div class="font-medium text-sm">{template.label}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* 👈 Neu: Section Management */}
          <div class="mt-6 pt-4 border-t border-gray-200">
            <h4 class="font-semibold mb-3">Sektionen</h4>
            <button
              type="button"
              class="btn btn-secondary w-full text-sm"
              onClick$={addNewSection}
            >
              + Neue Sektion
            </button>
          </div>
        </div>
      </div>

      {/* Form Builder Area */}
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="p-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold">
              {currentConfig.value?.name || 'Formular-Editor'}
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              {formFields.value.length} Felder in {formSections.value.length} Sektionen
            </p>
          </div>

          <div class="p-6">
            {formSections.value.map(section => (
              <div key={section.id} class="mb-6">
                {/* Section Header */}
                <div class="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                  <div class="flex-1">
                    <input
                      type="text"
                      value={section.title}
                      class="font-semibold bg-transparent border-0 focus:ring-0 p-0"
                      onInput$={(event) => updateSection(section.id, {
                        title: (event.target as HTMLInputElement).value
                      })}
                    />
                    <input
                      type="text"
                      value={section.description || ''}
                      placeholder="Beschreibung der Sektion..."
                      class="text-sm text-gray-600 bg-transparent border-0 focus:ring-0 p-0 w-full mt-1"
                      onInput$={(event) => updateSection(section.id, {
                        description: (event.target as HTMLInputElement).value
                      })}
                    />
                  </div>
                  <button
                    type="button"
                    class="text-red-600 hover:text-red-800 ml-4"
                    onClick$={() => deleteSection(section.id)}
                  >
                    🗑️
                  </button>
                </div>

                {/* Section Fields */}
                <div class="space-y-3">
                  {getFieldsBySection(section.id).map((field, index) => (
                    <div
                      key={field.id}
                      class={`
                        p-4 border border-gray-200 rounded-lg cursor-pointer transition-colors
                        ${selectedField.value?.id === field.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}
                      `}
                      draggable
                      onDragStart$={() => startDrag(index)}
                      onDragOver$={allowDrop}
                      onDrop$={(event) => drop(event, index)}
                      onClick$={() => selectedField.value = field}
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                          <span style={`color: ${getFieldColor(field.type)}`}>
                            {getFieldIcon(field.type)}
                          </span>
                          <div>
                            <div class="font-medium">{field.label}</div>
                            <div class="text-sm text-gray-600">{field.type}</div>
                          </div>
                          {field.required && (
                            <span class="text-red-500 text-sm">*</span>
                          )}
                        </div>
                        <button
                          type="button"
                          class="text-red-600 hover:text-red-800"
                          onClick$={(event) => {
                            event.stopPropagation();
                            deleteField(field.id);
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {formFields.value.length === 0 && (
              <div class="text-center py-12 text-gray-500">
                <p>Noch keine Felder hinzugefügt.</p>
                <p class="text-sm mt-1">Wählen Sie einen Feldtyp aus der linken Spalte.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Field Properties Panel */}
      <div class="lg:col-span-1">
        {selectedField.value ? (
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 class="text-lg font-semibold mb-4">Feldeigenschaften</h3>
            
            <div class="space-y-4">
              <div class="form-group">
                <label class="form-label">Label</label>
                <input
                  type="text"
                  class="form-input"
                  value={selectedField.value.label}
                  onInput$={(event) => updateField(selectedField.value!.id, {
                    label: (event.target as HTMLInputElement).value
                  })}
                />
              </div>

              <div class="form-group">
                <label class="form-label">Name</label>
                <input
                  type="text"
                  class="form-input"
                  value={selectedField.value.name}
                  onInput$={(event) => updateField(selectedField.value!.id, {
                    name: (event.target as HTMLInputElement).value
                  })}
                />
              </div>

              <div class="form-group">
                <label class="form-label">Platzhalter</label>
                <input
                  type="text"
                  class="form-input"
                  value={selectedField.value.placeholder || ''}
                  onInput$={(event) => updateField(selectedField.value!.id, {
                    placeholder: (event.target as HTMLInputElement).value
                  })}
                />
              </div>

              <div class="form-group">
                <label class="form-label">Breite</label>
                <select
                  class="form-input"
                  value={selectedField.value.width}
                  onChange$={(event) => updateField(selectedField.value!.id, {
                    width: (event.target as HTMLSelectElement).value as any
                  })}
                >
                  {Object.entries(FIELD_WIDTHS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div class="form-group">
                <label class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedField.value.required}
                    onChange$={(event) => updateField(selectedField.value!.id, {
                      required: (event.target as HTMLInputElement).checked
                    })}
                  />
                  <span>Pflichtfeld</span>
                </label>
              </div>

              <div class="form-group">
                <label class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedField.value.lightModeVisible}
                    onChange$={(event) => updateField(selectedField.value!.id, {
                      lightModeVisible: (event.target as HTMLInputElement).checked
                    })}
                  />
                  <span>Im Light Mode sichtbar</span>
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 class="text-lg font-semibold mb-4">Feldeigenschaften</h3>
            <p class="text-gray-500 text-center py-8">
              Wählen Sie ein Feld aus, um dessen Eigenschaften zu bearbeiten.
            </p>
          </div>
        )}
      </div>
    </div>
  )}

  {/* Notification */}
  {notification.value && (
    <div class={`
      fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-md
      ${notification.value.type === 'success' ? 'bg-green-500 text-white' : ''}
      ${notification.value.type === 'error' ? 'bg-red-500 text-white' : ''}
      ${notification.value.type === 'info' ? 'bg-blue-500 text-white' : ''}
    `}>
      {notification.value.message}
    </div>
  )}
</div>


);
});
