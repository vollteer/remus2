import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { FormBuilderAPI, type FormConfiguration } from '~/services/api/forms-api-service';

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
  responsible: string;
}

export const ModernFormBuilder = component$(() => {
  // ✅ SCHRITT 1: ALLE useSignal() VARIABLES ZUERST
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

  // ✅ SCHRITT 2: STATISCHE DATEN
  const workflows = [
    { id: 'kleinanforderung', name: 'Kleinanforderung' },
    { id: 'grossanforderung', name: 'Großanforderung' },
    { id: 'tia-anforderung', name: 'TIA-Anforderung' }
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

  // ✅ SCHRITT 3: ALLE $() FUNCTIONS
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
        version: 1
      };

      // API Call
      const savedConfig = await FormBuilderAPI.saveFormConfiguration(configToSave);
      
      console.log('Configuration saved successfully:', savedConfig);
      
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      isSaving.value = false;
    }
  });

  // ✅ SCHRITT 4: useTask$() AM ENDE
  useTask$(async ({ track }) => {
    track(() => selectedWorkflow.value);

    if (selectedWorkflow.value) {
      isLoading.value = true;
      try {
        console.log('Loading configuration for:', selectedWorkflow.value);
        
        // API Calls
        const config = await FormBuilderAPI.loadFormConfiguration(selectedWorkflow.value);
        const steps = await FormBuilderAPI.getWorkflowSteps(selectedWorkflow.value);
        
        // Update signals
        formFields.value = config.fields;
        workflowSteps.value = steps;
        
      } catch (error) {
        console.error('Failed to load configuration:', error);
        
        // Fallback auf Mock
        const mockSteps = [
          { id: 'step-1', name: 'Antrag erstellen', responsible: 'AG' },
          { id: 'step-2', name: 'Prüfung', responsible: 'AN' },
          { id: 'step-3', name: 'Genehmigung', responsible: 'AG' },
          { id: 'step-4', name: 'Umsetzung', responsible: 'AN' }
        ];
        workflowSteps.value = mockSteps;
      } finally {
        isLoading.value = false;
      }
    }
  });

  // ✅ SCHRITT 5: JSX RETURN
  return (
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div class="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-40">
        <div class="container mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🎨 Form Builder
              </h1>
              <p class="text-slate-600 mt-1">Erstelle intelligente Formulare mit Workflow-Binding & Lightweight Mode</p>
            </div>
            <div class="flex gap-3">
              <button
                onClick$={() => lightMode.value = !lightMode.value}
                class={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:rotate-1 ${
                  lightMode.value 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg shadow-yellow-400/30 hover:shadow-xl hover:shadow-yellow-400/40' 
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 border border-gray-300 hover:border-gray-400'
                }`}
              > 
                ⚡ Light Mode
              </button>
              <button
                onClick$={() => previewMode.value = !previewMode.value}
                class={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:-rotate-1 ${
                  previewMode.value 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg shadow-green-400/30 hover:shadow-xl hover:shadow-green-400/40' 
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 border border-gray-300 hover:border-gray-400'
                }`}
              > 
                👁️ Preview
              </button>
              <button 
                onClick$={saveFormConfiguration}
                disabled={isSaving.value}
                class={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg ${
                  isSaving.value 
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-purple-500/30 hover:shadow-purple-500/40'
                }`}
              >
                {isSaving.value ? '💾 Saving...' : '💾 Save Form'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-6 py-6">
        <div class="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Configuration */}
          <div class="col-span-3 space-y-6">
            {/* Workflow Selection */}
            <div class="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200/60 shadow-lg">
              <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                🎯 Workflow Selection
              </h3>
              <select
                value={selectedWorkflow.value}
                onChange$={(e) => selectedWorkflow.value = (e.target as HTMLSelectElement).value}
                class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gradient-to-r from-white to-gray-50/50 hover:from-white hover:to-blue-50/30 text-gray-800 font-medium shadow-sm hover:shadow-md"
              >
                <option value="">Workflow wählen...</option>
                {workflows.map(workflow => (
                  <option key={workflow.id} value={workflow.id}>
                    {workflow.name}
                  </option>
                ))}
              </select>

              {workflowSteps.value.length > 0 && (
                <div class="mt-4">
                  <label class="block text-sm font-medium text-slate-700 mb-2">
                    Workflow Step
                  </label>
                  <select
                    value={selectedStep.value}
                    onChange$={(e) => selectedStep.value = (e.target as HTMLSelectElement).value}
                    class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gradient-to-r from-white to-gray-50/50 hover:from-white hover:to-blue-50/30 text-gray-800 font-medium shadow-sm hover:shadow-md"
                  >
                    <option value="">Alle Steps</option>
                    {workflowSteps.value.map(step => (
                      <option key={step.id} value={step.id}>
                        {step.name} ({step.responsible})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Field Templates */}
            <div class="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200/60 shadow-lg">
              <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                🧩 Field Templates
              </h3>
              <div class="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                {fieldTemplates.map(template => (
                  <button
                    key={template.type}
                    onClick$={() => addField(template)}
                    class="group relative p-4 rounded-xl border-2 border-transparent bg-gradient-to-br from-white to-gray-50/50 hover:from-white hover:to-blue-50/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 text-left shadow-md hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200/50"
                  >
                    <div class="flex items-center gap-4">
                      <div
                        class="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6"
                        style={`background: linear-gradient(135deg, ${template.color}dd, ${template.color}); box-shadow: 0 4px 20px ${template.color}30;`}
                      >
                        {template.icon}
                      </div>
                      <div class="flex-1">
                        <span class="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                          {template.label}
                        </span>
                        <div class="text-xs text-gray-500 mt-1 group-hover:text-gray-600">
                          Click to add field
                        </div>
                      </div>
                    </div>
                    <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Light Mode Configuration */}
            {lightMode.value && (
              <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200 shadow-lg">
                <h3 class="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                  ⚡ Light Mode Fields
                </h3>
                <p class="text-sm text-orange-700 mb-3">
                  Nur wichtigste Felder für Quick-Entry
                </p>
                <div class="space-y-2 max-h-32 overflow-y-auto">
                  {formFields.value.filter(field => field.lightModeVisible).length > 0 ?
                    formFields.value.filter(field => field.lightModeVisible).map(field => (
                      <div key={field.id} class="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
                        <span class="text-sm font-medium">{field.label}</span>
                        <span class="text-xs text-orange-600">({field.type})</span>
                      </div>
                    )) : (
                      <p class="text-sm text-orange-600 italic">Keine Light Mode Felder ausgewählt</p>
                    )
                  }
                </div>
              </div>
            )}
          </div>

          {/* Center - Form Builder */}
          <div class="col-span-6">
            <div class="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200/60 shadow-lg">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-slate-800">
                  {previewMode.value ? '👁️ Form Preview' : '🎨 Form Builder'}
                  {lightMode.value && <span class="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full">⚡ Light Mode</span>}
                </h3>
                {selectedStep.value && (
                  <div class="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                    Step: {workflowSteps.value.find(s => s.id === selectedStep.value)?.name}
                  </div>
                )}
              </div>

              {isLoading.value && (
                <div class="flex items-center justify-center py-12">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span class="ml-2 text-slate-600">Lade Konfiguration...</span>
                </div>
              )}

              {!isLoading.value && (
                <>
                  {previewMode.value ? (
                    /* Preview Mode */
                    <div class="space-y-6 max-h-96 overflow-y-auto">
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
                          <label class="block text-sm font-medium text-slate-700">
                            {field.label}
                            {field.required && <span class="text-red-500 ml-1">*</span>}
                          </label>
                          {field.type === 'textarea' ? (
                            <textarea
                              class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gradient-to-r from-white to-gray-50/50 hover:border-gray-300 resize-none"
                              placeholder={field.placeholder}
                              rows={3}
                            />
                          ) : field.type === 'select' ? (
                            <select class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gradient-to-r from-white to-gray-50/50 hover:border-gray-300 text-gray-800 font-medium">
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
                              class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gradient-to-r from-white to-gray-50/50 hover:border-gray-300"
                              placeholder={field.placeholder}
                            />
                          )}
                          {field.description && (
                            <p class="text-xs text-slate-500">{field.description}</p>
                          )}
                        </div>
                      ))}
                      
                      {formFields.value.length === 0 && (
                        <div class="text-center py-12 text-slate-500">
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
                                  class="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:shadow-lg transition-all"
                                  style={`background: linear-gradient(135deg, ${fieldTemplates.find(t => t.type === field.type)?.color}dd, ${fieldTemplates.find(t => t.type === field.type)?.color});`}
                                >
                                  {fieldTemplates.find(t => t.type === field.type)?.icon}
                                </div>
                                <div>
                                  <div class="font-semibold text-gray-800 flex items-center gap-2">
                                    {field.label}
                                    {field.required && <span class="text-red-500 text-sm">*</span>}
                                    {field.lightModeVisible && (
                                      <span class="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs rounded-full font-medium shadow-sm">
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
                        <div class="text-center py-12 text-slate-500">
                          <div class="text-6xl mb-4">📝</div>
                          <h3 class="text-lg font-medium mb-2">Noch keine Felder</h3>
                          <p>Wähle Feldtypen aus der linken Sidebar um zu starten</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Sidebar - Field Properties */}
          <div class="col-span-3">
            {selectedField.value ? (
              <div class="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200/60 shadow-lg">
                <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  ⚙️ Field Properties
                </h3>
                
                <div class="space-y-4 max-h-96 overflow-y-auto">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Label</label>
                    <input
                      type="text"
                      value={selectedField.value.label}
                      onInput$={(e) => updateField({ label: (e.target as HTMLInputElement).value })}
                      class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gradient-to-r from-white to-gray-50/50 hover:border-gray-300 font-medium"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Required</label>
                    <label class="group flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 cursor-pointer border-2 border-blue-100 hover:border-blue-200">
                      <input
                        type="checkbox"
                        checked={selectedField.value.required}
                        onChange$={(e) => updateField({ required: (e.target as HTMLInputElement).checked })}
                        class="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all"
                      />
                      <span class="text-sm font-semibold text-blue-900">Required Field</span>
                    </label>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Light Mode</label>
                    <label class="group flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl hover:from-yellow-100 hover:to-orange-100 transition-all duration-300 cursor-pointer border-2 border-yellow-100 hover:border-yellow-200">
                      <input
                        type="checkbox"
                        checked={selectedField.value.lightModeVisible}
                        onChange$={(e) => updateField({ lightModeVisible: (e.target as HTMLInputElement).checked })}
                        class="w-5 h-5 text-yellow-600 bg-white border-2 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2 transition-all"
                      />
                      <span class="text-sm font-semibold text-yellow-900">⚡ Light Mode Visible</span>
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div class="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200/60 shadow-lg text-center">
                <div class="text-6xl mb-4">👆</div>
                <h3 class="text-lg font-medium text-slate-700 mb-2">Feld auswählen</h3>
                <p class="text-slate-500">Klicke auf ein Feld um es zu konfigurieren</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
