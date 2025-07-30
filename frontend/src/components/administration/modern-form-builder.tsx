import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { FormBuilderAPI, type FormConfiguration } from '~/services/api/forms-api-service';
import { WorkflowApiService } from '~/services/api/workflow-api-service';

// Types
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
  title: string;
  type: string;
  responsible: string;
  order: number;
  required: boolean;
  estimatedDays: number;
  parallelGroup?: string;
  isParallel?: boolean;
  description?: string;
}

export const ModernFormBuilder = component$(() => {
  // State Management
  const selectedWorkflow = useSignal('');
  const workflowSteps = useSignal<WorkflowStep[]>([]);
  const selectedStep = useSignal('');
  const formFields = useSignal<FormField[]>([]);
  const selectedField = useSignal<FormField | null>(null);
  const lightMode = useSignal(false);
  const previewMode = useSignal(false);
  const draggedIndex = useSignal<number | null>(null);
  const isSaving = useSignal(false);
  const isLoading = useSignal(false);
  const saveMessage = useSignal<{type: 'success' | 'error' | 'info', text: string} | null>(null);

  // Available Workflows
  const availableWorkflows = useSignal<Array<{id: string, name: string}>>([]);
  
  const WORKFLOW_TYPES = [
    'Kleinanforderung',
    'Großanforderung', 
    'TIA-Anforderung',
    'Supportleistung',
    'Betriebsauftrag',
    'SBBI-Lösung',
    'AWG-Release',
    'AWS-Release'
  ];

  const fieldTemplates = [
    { type: 'text' as const, icon: '📝', label: 'Text Input', color: '#3b82f6' },
    { type: 'textarea' as const, icon: '📄', label: 'Textarea', color: '#8b5cf6' },
    { type: 'number' as const, icon: '🔢', label: 'Number', color: '#10b981' },
    { type: 'email' as const, icon: '📧', label: 'Email', color: '#f59e0b' },
    { type: 'phone' as const, icon: '📞', label: 'Phone', color: '#ef4444' },
    { type: 'date' as const, icon: '📅', label: 'Date', color: '#06b6d4' },
    { type: 'select' as const, icon: '📋', label: 'Select', color: '#84cc16' },
    { type: 'multiselect' as const, icon: '☑️', label: 'Multi Select', color: '#f97316' },
    { type: 'radio' as const, icon: '⚪', label: 'Radio Group', color: '#ec4899' },
    { type: 'checkboxGroup' as const, icon: '☑️', label: 'Checkbox Group', color: '#6366f1' },
    { type: 'file' as const, icon: '📎', label: 'File Upload', color: '#64748b' },
    { type: 'currency' as const, icon: '💰', label: 'Currency', color: '#059669' },
    { type: 'roleSearch' as const, icon: '👤', label: 'Role Search', color: '#7c3aed' },
    { type: 'budgetField' as const, icon: '💵', label: 'Budget Field', color: '#dc2626' },
    { type: 'referenceField' as const, icon: '🔗', label: 'Reference Field', color: '#0891b2' }
  ];

  // Functions
  const addField = $((template: any) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: template.type,
      name: `field_${Date.now()}`,
      label: template.label,
      order: formFields.value.length + 1,
      width: 'full',
      required: false,
      lightModeVisible: false,
      workflowStepBinding: selectedStep.value ? [selectedStep.value] : [],
      permissions: {
        allowedRoles: ['Requester', 'Approver'],
        readOnlyRoles: [],
        hideFromRoles: []
      }
    };

    if (['select', 'multiselect', 'radio', 'checkboxGroup'].includes(template.type)) {
      newField.options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ];
    }

    formFields.value = [...formFields.value, newField];
    selectedField.value = newField;
  });

  const updateField = $((updates: Partial<FormField>) => {
    if (!selectedField.value) return;

    const updatedField = { ...selectedField.value, ...updates };
    formFields.value = formFields.value.map(f => f.id === selectedField.value?.id ? updatedField : f);
    selectedField.value = updatedField;
  });

  const deleteField = $((fieldId: string) => {
    formFields.value = formFields.value.filter(f => f.id !== fieldId);
    if (selectedField.value?.id === fieldId) {
      selectedField.value = null;
    }
  });

  const moveField = $((fromIndex: number, toIndex: number) => {
    const items = [...formFields.value];
    const [reorderedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, reorderedItem);

    // Update order
    items.forEach((item, index) => {
      item.order = index + 1;
    });

    formFields.value = items;
  });

  const saveFormConfiguration = $(async () => {
    if (!selectedWorkflow.value || formFields.value.length === 0) {
      console.warn('Keine Konfiguration zum Speichern');
      
      // Show validation error message
      saveMessage.value = {
        type: 'error',
        text: 'Bitte wählen Sie einen Workflow und fügen Sie mindestens ein Feld hinzu.'
      };
      
      setTimeout(() => {
        saveMessage.value = null;
      }, 5000);
      
      return;
    }

    isSaving.value = true;
    try {
      console.log('Saving form configuration...');
      
      // Build FormConfiguration object
      const configToSave: FormConfiguration = {
        id: `temp-${Date.now()}`,
        name: `${selectedWorkflow.value} Formular`,
        description: `Formular für ${selectedWorkflow.value}`,
        workflowType: selectedWorkflow.value,
        fields: formFields.value,
        lightModeEnabled: lightMode.value,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        version: 'v1.0.0'
      };

      // API Call
      const savedConfig = await FormBuilderAPI.saveFormConfiguration(configToSave);
      
      console.log('Configuration saved successfully:', savedConfig);
      
      // Show success message to user
      saveMessage.value = {
        type: 'success',
        text: `Erfolgreich gespeichert! Formularkonfiguration für "${selectedWorkflow.value}" ist jetzt verfügbar.`
      };
      
      // Clear message after 5 seconds
      setTimeout(() => {
        saveMessage.value = null;
      }, 5000);
      
      // Force reload the configuration to ensure it's properly applied
      try {
        const reloadedConfig = await FormBuilderAPI.loadFormConfiguration(selectedWorkflow.value);
        if (reloadedConfig && reloadedConfig.fields) {
          formFields.value = reloadedConfig.fields;
          console.log('✅ Configuration reloaded after save:', reloadedConfig);
        }
      } catch (reloadError) {
        console.warn('Could not reload configuration after save:', reloadError);
      }
      
    } catch (error) {
      console.error('Failed to save configuration:', error);
      
      // Check if this was actually a successful fallback save
      if (error instanceof Error && error.message.includes('Configuration saved locally')) {
        saveMessage.value = {
          type: 'info',
          text: `Server nicht verfügbar - Konfiguration wurde lokal gespeichert. Die Einstellungen sind trotzdem verfügbar.`
        };
        
        setTimeout(() => {
          saveMessage.value = null;
        }, 6000);
        return; // Don't treat this as an error
      }
      
      // Show error message to user
      let errorMessage = 'Unbekannter Fehler beim Speichern.';
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          errorMessage = 'API-Endpunkt nicht gefunden. Prüfen Sie die Server-Konfiguration.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server-Fehler beim Speichern. Konfiguration wurde lokal gespeichert.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Verbindung zum Server fehlgeschlagen. Konfiguration wurde lokal gespeichert.';
        } else {
          errorMessage = error.message;
        }
      }
      
      saveMessage.value = {
        type: 'error',
        text: `Speichern fehlgeschlagen: ${errorMessage}`
      };
      
      // Clear error message after 8 seconds
      setTimeout(() => {
        saveMessage.value = null;
      }, 8000);
    } finally {
      isSaving.value = false;
    }
  });

  // Load available workflows on init
  useTask$(async () => {
    try {
      // Test API connection first
      const isConnected = await FormBuilderAPI.testConnection();
      if (!isConnected) {
        console.warn('[FormBuilder] API connection test failed - will use local storage fallback');
        saveMessage.value = {
          type: 'info',
          text: 'Server nicht erreichbar - Lokaler Modus aktiv. Ihre Änderungen werden lokal gespeichert.'
        };
      } else {
        console.log('[FormBuilder] API connection successful');
      }
      
      // Load available workflow types
      availableWorkflows.value = WORKFLOW_TYPES.map(type => ({
        id: type,
        name: type
      }));
    } catch (error) {
      console.error('Failed to load workflow types:', error);
    }
  });

  // Load workflow steps when workflow selected
  useTask$(async ({ track }) => {
    track(() => selectedWorkflow.value);

    if (selectedWorkflow.value) {
      isLoading.value = true;
      try {
        console.log('🔄 Loading workflow steps for:', selectedWorkflow.value);
        
        // ECHTE API CALLS!
        const workflowConfig = await WorkflowApiService.getWorkflowByType(selectedWorkflow.value);
        
        if (workflowConfig && workflowConfig.steps) {
          console.log('✅ Workflow steps loaded:', workflowConfig.steps);
          
          // Convert Backend-Steps to Form Builder format
          const convertedSteps: WorkflowStep[] = workflowConfig.steps.map(step => ({
            id: step.id,
            name: step.title,
            title: step.title,
            type: step.type,
            responsible: step.responsible,
            order: step.order,
            required: step.required,
            estimatedDays: step.estimatedDays || 1,
            parallelGroup: step.parallelGroup,
            isParallel: step.isParallel || false,
            description: step.description
          }));
          
          workflowSteps.value = convertedSteps;
          
          // Try to load existing form configuration
          try {
            const config = await FormBuilderAPI.loadFormConfiguration(selectedWorkflow.value);
            if (config && config.fields && config.fields.length > 0) {
              formFields.value = config.fields;
              lightMode.value = config.lightModeEnabled;
              console.log('✅ Form configuration loaded');
              
              // Show info message that configuration was loaded
              saveMessage.value = {
                type: 'info',
                text: `Vorhandene Konfiguration für "${selectedWorkflow.value}" geladen.`
              };
              
              setTimeout(() => {
                saveMessage.value = null;
              }, 3000);
            } else {
              console.log('ℹ️ No existing form configuration found - starting fresh');
              formFields.value = [];
              lightMode.value = false;
            }
          } catch (configError) {
            console.log('ℹ️ Error loading configuration - starting fresh:', configError);
            formFields.value = [];
            lightMode.value = false;
          }
          
        } else {
          console.warn('⚠️ No workflow steps found for:', selectedWorkflow.value);
          workflowSteps.value = [];
        }
        
      } catch (error) {
        console.error('💥 Failed to load workflow steps:', error);
        workflowSteps.value = [];
      } finally {
        isLoading.value = false;
      }
    } else {
      // Reset when no workflow selected
      workflowSteps.value = [];
      formFields.value = [];
    }
  });

  return (
    <div class="min-h-screen bg-gray-50 flex flex-col">
      {/* Clean Header - matching Workflow Designer */}
      <div class="bg-white border-b border-gray-200">
        <div class="px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-8 h-8 bg-purple-600 flex items-center justify-center">
                <span class="text-white text-sm font-semibold">F</span>
              </div>
              <div>
                <h1 class="text-xl font-semibold text-gray-900">Form Builder</h1>
                <p class="text-sm text-gray-600">Intelligente Formulare mit Workflow-Binding</p>
              </div>
            </div>
            
            <div class="flex items-center space-x-3">
              <select
                value={selectedWorkflow.value}
                onChange$={(e) => selectedWorkflow.value = (e.target as HTMLSelectElement).value}
                class="px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
              >
                <option value="">Workflow wählen...</option>
                {WORKFLOW_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <button
                onClick$={() => lightMode.value = !lightMode.value}
                class={`px-4 py-2 text-sm font-medium transition-colors ${
                  lightMode.value 
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              > 
                ⚡ Light Mode
              </button>

              <button 
                onClick$={saveFormConfiguration}
                disabled={isSaving.value}
                class="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2 text-sm font-medium transition-colors"
              >
                <span>{isSaving.value ? '⏳' : '💾'}</span>
                <span>{isSaving.value ? 'Speichere...' : 'Speichern'}</span>
              </button>

              {selectedWorkflow.value && (
                <a
                  href="/requirements/new"
                  target="_blank"
                  class="px-4 py-2 bg-green-600 text-white hover:bg-green-700 flex items-center space-x-2 text-sm font-medium transition-colors"
                  title="Öffnet die Requirements-Seite zum Testen der gespeicherten Konfiguration"
                >
                  <span>🚀</span>
                  <span>Testen</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Message Toast */}
      {saveMessage.value && (
        <div class={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg border-l-4 ${
          saveMessage.value.type === 'success' 
            ? 'bg-green-50 border-green-400 text-green-800' 
            : saveMessage.value.type === 'error'
            ? 'bg-red-50 border-red-400 text-red-800'
            : 'bg-blue-50 border-blue-400 text-blue-800'
        }`}>
          <div class="flex items-center gap-3">
            <span class="text-lg">
              {saveMessage.value.type === 'success' ? '✅' : saveMessage.value.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <div>
              <p class="font-medium">
                {saveMessage.value.type === 'success' ? 'Erfolg!' : saveMessage.value.type === 'error' ? 'Fehler!' : 'Info'}
              </p>
              <p class="text-sm">{saveMessage.value.text}</p>
            </div>
            <button
              onClick$={() => saveMessage.value = null}
              class="ml-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div class="flex-1 flex">
        {/* Sidebar - Field Templates */}
        <div class="w-64 bg-white border-r border-gray-200 p-4">
          <div class="space-y-4">
            {/* Workflow Step Selection */}
            {workflowSteps.value.length > 0 && (
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Workflow Step
                </label>
                <select
                  value={selectedStep.value}
                  onChange$={(e) => selectedStep.value = (e.target as HTMLSelectElement).value}
                  class="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
                >
                  <option value="">Alle Steps</option>
                  {workflowSteps.value.map(step => (
                    <option key={step.id} value={step.id}>
                      {step.isParallel ? '⚡ ' : ''}
                      {step.order}. {step.name} ({step.responsible})
                      {step.parallelGroup ? ` - ${step.parallelGroup}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Field Templates */}
            <div>
              <h3 class="text-sm font-medium text-gray-900 mb-3">Formular-Felder</h3>
              <div class="space-y-2">
                {fieldTemplates.map(template => (
                  <button
                    key={template.type}
                    onClick$={() => addField(template)}
                    class="w-full flex items-center gap-3 p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors text-left"
                  >
                    <div 
                      class="w-8 h-8 flex items-center justify-center text-white text-sm font-bold rounded-lg shadow-sm"
                      style={`background: ${template.color};`}
                    >
                      {template.icon}
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{template.label}</div>
                      <div class="text-xs text-gray-500">{template.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div class="flex-1 flex">
          {/* Form Builder Area */}
          <div class="flex-1 p-6 bg-gray-50">
            <div class="bg-white rounded-lg border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900">
                  {previewMode.value ? '👁️ Formular Vorschau' : '🎨 Formular Builder'}
                  {lightMode.value && <span class="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full">⚡ Light Mode</span>}
                </h3>
                {selectedStep.value && (
                  <div class="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium">
                    Step: {workflowSteps.value.find(s => s.id === selectedStep.value)?.name}
                  </div>
                )}
              </div>

              {previewMode.value ? (
                /* Preview Mode */
                <div class="space-y-4">
                  {(selectedStep.value ?
                    formFields.value.filter(field =>
                      !field.workflowStepBinding?.length ||
                      field.workflowStepBinding.includes(selectedStep.value)
                    ) :
                    formFields.value
                  )
                    .filter(field => !lightMode.value || field.lightModeVisible)
                    .map(field => (
                    <div key={field.id} class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700">
                        {field.label}
                        {field.required && <span class="text-red-500 ml-1">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          class="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white hover:border-gray-400 transition-colors resize-none"
                          placeholder={field.placeholder}
                          rows={3}
                        />
                      ) : field.type === 'select' ? (
                        <select class="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white hover:border-gray-400 transition-colors">
                          <option>Auswählen...</option>
                          {field.options?.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          class="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white hover:border-gray-400 transition-colors"
                          placeholder={field.placeholder}
                        />
                      )}
                      {field.description && (
                        <p class="text-xs text-gray-500">{field.description}</p>
                      )}
                    </div>
                  ))}
                  
                  {formFields.value.length === 0 && (
                    <div class="text-center py-12 text-gray-500">
                      <div class="text-6xl mb-4">📋</div>
                      <h3 class="text-lg font-medium mb-2">Keine Felder zum Anzeigen</h3>
                      <p>Noch keine Felder hinzugefügt</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Builder Mode */
                <div class="space-y-4 min-h-32 max-h-96 overflow-y-auto">
                  {formFields.value.map((field, index) => (
                    <div
                      key={field.id}
                      draggable
                      onDragStart$={() => {
                        draggedIndex.value = index;
                      }}
                      onDragOver$={(e) => {
                        e.preventDefault();
                      }}
                      onDrop$={(e) => {
                        e.preventDefault();
                        if (draggedIndex.value !== null && draggedIndex.value !== index) {
                          moveField(draggedIndex.value, index);
                        }
                        draggedIndex.value = null;
                      }}
                      class="group relative p-4 rounded-xl border-2 transition-all duration-200 cursor-move border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:bg-gray-50/50"
                      onClick$={() => selectedField.value = field}
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                          <div class="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                            ⋮⋮
                          </div>
                          <div class="flex items-center gap-3">
                            <div
                              class="w-10 h-10 flex items-center justify-center text-white text-sm font-bold shadow-sm"
                              style={`background: ${fieldTemplates.find(t => t.type === field.type)?.color};`}
                            >
                              {fieldTemplates.find(t => t.type === field.type)?.icon}
                            </div>
                            <div>
                              <div class="font-semibold text-gray-800 flex items-center gap-2">
                                {field.label}
                                {field.required && <span class="text-red-500 text-sm">*</span>}
                                {field.lightModeVisible && (
                                  <span class="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full font-medium">
                                    ⚡ Light
                                  </span>
                                )}
                              </div>
                              <div class="text-sm text-gray-500 flex items-center gap-2">
                                <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                                  {field.type}
                                </span>
                                <span class="text-gray-400">•</span>
                                <span>{field.width}</span>
                                {field.workflowStepBinding && field.workflowStepBinding.length > 0 && (
                                  <>
                                    <span class="text-gray-400">•</span>
                                    <div class="flex items-center gap-1">
                                      {field.workflowStepBinding.map(stepId => {
                                        const step = workflowSteps.value.find(s => s.id === stepId);
                                        return step ? (
                                          <span key={stepId} class="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium flex items-center gap-1">
                                            {step.isParallel && <span>⚡</span>}
                                            {step.name}
                                          </span>
                                        ) : null;
                                      })}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick$={(e) => {
                            e.stopPropagation();
                            deleteField(field.id);
                          }}
                          class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {formFields.value.length === 0 && (
                    <div class="text-center py-12 text-gray-500">
                      <div class="text-6xl mb-4">📝</div>
                      <h3 class="text-lg font-medium mb-2">Noch keine Felder</h3>
                      <p>Wähle Feldtypen aus der linken Sidebar um zu starten</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Field Properties */}
          <div class="w-80 bg-white border-l border-gray-200 p-4">
            {selectedField.value ? (
              <div>
                <h3 class="text-sm font-medium text-gray-900 mb-4">⚙️ Feld Eigenschaften</h3>
                
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Label</label>
                    <input
                      type="text"
                      value={selectedField.value.label}
                      onInput$={(e) => updateField({ label: (e.target as HTMLInputElement).value })}
                      class="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
                    />
                  </div>

                  <div>
                    <label class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedField.value.required}
                        onChange$={(e) => updateField({ required: (e.target as HTMLInputElement).checked })}
                        class="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                      />
                      <span class="text-sm font-medium text-gray-700">Pflichtfeld</span>
                    </label>
                  </div>

                  <div>
                    <label class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedField.value.lightModeVisible}
                        onChange$={(e) => updateField({ lightModeVisible: (e.target as HTMLInputElement).checked })}
                        class="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
                      />
                      <span class="text-sm font-medium text-gray-700">⚡ Light Mode</span>
                    </label>
                  </div>

                  {/* Workflow Step Binding */}
                  {workflowSteps.value.length > 0 && (
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        🎯 Workflow Steps
                      </label>
                      <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p class="text-xs text-gray-600 mb-3">
                          Wähle die Steps, in denen dieses Feld sichtbar sein soll:
                        </p>
                        <div class="space-y-2 max-h-32 overflow-y-auto">
                          {workflowSteps.value
                            .sort((a, b) => a.order - b.order)
                            .map(step => (
                            <label 
                              key={step.id} 
                              class="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={selectedField.value.workflowStepBinding?.includes(step.id) || false}
                                onChange$={(e) => {
                                  const checked = (e.target as HTMLInputElement).checked;
                                  const currentBindings = selectedField.value.workflowStepBinding || [];
                                  let newBindings;
                                  
                                  if (checked) {
                                    newBindings = [...currentBindings, step.id];
                                  } else {
                                    newBindings = currentBindings.filter(id => id !== step.id);
                                  }
                                  
                                  updateField({ workflowStepBinding: newBindings });
                                }}
                                class="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                              />
                              <div class="flex items-center gap-2 flex-1">
                                <span class="text-xs font-medium text-gray-600">{step.order}.</span>
                                {step.isParallel && <span class="text-orange-500" title="Parallel">⚡</span>}
                                <span class="text-sm text-gray-800">{step.name}</span>
                                <span class={`px-2 py-0.5 text-xs rounded ${
                                  step.responsible === 'AG' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {step.responsible}
                                </span>
                                {step.parallelGroup && (
                                  <span class="text-xs text-orange-600 bg-orange-100 px-1 rounded">
                                    {step.parallelGroup}
                                  </span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                        
                        {/* Quick Actions */}
                        <div class="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                          <button
                            onClick$={() => {
                              const allStepIds = workflowSteps.value.map(s => s.id);
                              updateField({ workflowStepBinding: allStepIds });
                            }}
                            class="px-3 py-1 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 rounded transition-colors"
                          >
                            Alle auswählen
                          </button>
                          <button
                            onClick$={() => {
                              updateField({ workflowStepBinding: [] });
                            }}
                            class="px-3 py-1 text-xs bg-gray-200 text-gray-700 hover:bg-gray-300 rounded transition-colors"
                          >
                            Alle abwählen
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-3">👆</div>
                <h3 class="text-sm font-medium text-gray-700 mb-2">Feld auswählen</h3>
                <p class="text-xs text-gray-500">Klicke auf ein Feld um es zu konfigurieren</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});