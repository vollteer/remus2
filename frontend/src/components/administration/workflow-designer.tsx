// src/components/administration/workflow-designer.tsx
// Moderner, minimalistischer Workflow Designer - MIT ECHTER API!

import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { WorkflowApiService } from '~/services/api/workflow-api-service';

// Types
interface WorkflowStep {
  id: string;
  title: string;
  type: 'task' | 'approval' | 'decision' | 'notification' | 'wait';
  responsible: 'AG' | 'AN' | 'system' | 'both';
  description: string;
  estimatedDays: number;
  required: boolean;
  conditions: string[];
  order: number;
}

interface WorkflowConfiguration {
  id?: string;
  type: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  isActive: boolean;
  version: string;
  createdAt?: string;
  modifiedAt?: string;
  createdBy?: string;
}

export const WorkflowDesigner = component$(() => {
  // State
  const selectedWorkflowType = useSignal<string>('Kleinanforderung');
  const currentConfig = useSignal<WorkflowConfiguration | null>(null);
  const workflowSteps = useSignal<WorkflowStep[]>([]);
  const selectedStep = useSignal<WorkflowStep | null>(null);
  const showProperties = useSignal(false);
  const isLoading = useSignal(false);
  const isSaving = useSignal(false);

  // Toast State
  const toastMessage = useSignal<string>('');
  const toastType = useSignal<'success' | 'error' | 'info' | 'warning'>('info');
  const showToast = useSignal(false);

  // Toast Functions
  const showToastMessage = $((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    toastMessage.value = message;
    toastType.value = type;
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 4000);
  });

  const hideToast = $(() => {
    showToast.value = false;
  });

  // Load workflow function (ECHTE API!)
  const loadWorkflow = $(async () => {
    isLoading.value = true;
    try {
      console.log('Loading workflow for type:', selectedWorkflowType.value);
      
      const config = await WorkflowApiService.getWorkflowByType(selectedWorkflowType.value);
      
      if (config) {
        currentConfig.value = config;
        workflowSteps.value = [...config.steps];
        showToastMessage(`${selectedWorkflowType.value} geladen`, 'success');
      } else {
        // Fallback: Leerer Workflow wenn nichts in DB
        const emptyConfig: WorkflowConfiguration = {
          id: '',
          type: selectedWorkflowType.value,
          name: `Neuer ${selectedWorkflowType.value} Workflow`,
          description: '',
          steps: [],
          isActive: true,
          version: 'v1.0.0',
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          createdBy: 'system'
        };
        
        currentConfig.value = emptyConfig;
        workflowSteps.value = [];
        showToastMessage('Kein Workflow gefunden - neuer erstellt', 'info');
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
      showToastMessage(`Fehler beim Laden: ${error.message}`, 'error');
    } finally {
      isLoading.value = false;
    }
  });

  // Load workflow on type change
  useTask$(({ track }) => {
    track(() => selectedWorkflowType.value);
    loadWorkflow();
  });

  // Save workflow function (ECHTE API!)
  const saveWorkflow = $(async () => {
    if (!currentConfig.value) return;
    
    isSaving.value = true;
    try {
      const updatedConfig = {
        ...currentConfig.value,
        steps: workflowSteps.value
      };
      
      const saved = await WorkflowApiService.saveWorkflowConfiguration(updatedConfig);
      currentConfig.value = saved;
      showToastMessage('Workflow erfolgreich gespeichert', 'success');
    } catch (error) {
      console.error('Error saving workflow:', error);
      showToastMessage(`Fehler beim Speichern: ${error.message}`, 'error');
    } finally {
      isSaving.value = false;
    }
  });

  const addStep = $(() => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      title: 'Neuer Schritt',
      type: 'task',
      responsible: 'AG',
      description: '',
      estimatedDays: 1,
      required: true,
      conditions: [],
      order: workflowSteps.value.length + 1
    };
    
    workflowSteps.value = [...workflowSteps.value, newStep];
    selectedStep.value = newStep;
    showProperties.value = true;
  });

  const deleteStep = $((stepId: string) => {
    if (typeof window !== 'undefined' && !confirm('Schritt löschen?')) return;
    
    workflowSteps.value = workflowSteps.value.filter(s => s.id !== stepId);
    if (selectedStep.value?.id === stepId) {
      selectedStep.value = null;
      showProperties.value = false;
    }
    showToastMessage('Schritt gelöscht', 'info');
  });

  const updateStep = $((updatedStep: WorkflowStep) => {
    workflowSteps.value = workflowSteps.value.map(step =>
      step.id === updatedStep.id ? updatedStep : step
    );
  });

  const selectStep = $((step: WorkflowStep) => {
    selectedStep.value = step;
    showProperties.value = true;
  });

  // Step type configurations
  const getStepConfig = (type: string) => {
    const configs = {
      task: { icon: '📋', color: 'bg-blue-500', label: 'Aufgabe' },
      approval: { icon: '✅', color: 'bg-green-500', label: 'Genehmigung' },
      decision: { icon: '🔄', color: 'bg-orange-500', label: 'Entscheidung' },
      notification: { icon: '📧', color: 'bg-purple-500', label: 'Benachrichtigung' },
      wait: { icon: '⏱️', color: 'bg-gray-500', label: 'Warten' }
    };
    return configs[type as keyof typeof configs] || configs.task;
  };

  const getResponsibleLabel = (responsible: string) => {
    const labels = {
      AG: 'Auftraggeber',
      AN: 'Auftragnehmer', 
      system: 'System',
      both: 'Beide'
    };
    return labels[responsible as keyof typeof labels] || responsible;
  };

  return (
    <div class="min-h-screen bg-gray-50">
      {/* Toast - VOLLSTÄNDIG INLINE */}
      {showToast.value && (
        <div class={`fixed top-4 right-4 z-50 max-w-sm w-full border rounded-lg p-4 shadow-lg transition-all duration-300 ${
          toastType.value === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          toastType.value === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          toastType.value === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="text-lg">
                {toastType.value === 'success' ? '✅' :
                 toastType.value === 'error' ? '❌' :
                 toastType.value === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              <span class="font-medium">{toastMessage.value}</span>
            </div>
            <button onClick$={hideToast} class="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <span class="text-white text-xl">⚡</span>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Workflow Designer</h1>
                <p class="text-sm text-gray-500">Mit echter DB-Verbindung</p>
              </div>
            </div>

            <div class="flex items-center space-x-3">
              <select
                value={selectedWorkflowType.value}
                onChange$={(e) => selectedWorkflowType.value = (e.target as HTMLSelectElement).value}
                class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Kleinanforderung">Kleinanforderung</option>
                <option value="Großanforderung">Großanforderung</option>
                <option value="TIA-Anforderung">TIA-Anforderung</option>
                <option value="Supportleistung">Supportleistung</option>
              </select>

              <button
                onClick$={addStep}
                class="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center space-x-2"
              >
                <span>+</span>
                <span>Schritt</span>
              </button>

              <button
                onClick$={saveWorkflow}
                disabled={isSaving.value}
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSaving.value ? '💾 Speichere...' : '💾 Speichern'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div class="max-w-7xl mx-auto p-6">
        {isLoading.value ? (
          <div class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p class="text-gray-500">Workflow wird aus DB geladen...</p>
            </div>
          </div>
        ) : (
          <div class="space-y-6">
            {/* Workflow Info */}
            {currentConfig.value && (
              <div class="bg-white rounded-lg border border-gray-200 p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="text-xl font-semibold text-gray-900">{currentConfig.value.name}</h2>
                    {currentConfig.value.description && (
                      <p class="text-gray-600 mt-1">{currentConfig.value.description}</p>
                    )}
                  </div>
                  <div class="flex items-center space-x-4 text-sm text-gray-500">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      v{currentConfig.value.version}
                    </span>
                    <span>{workflowSteps.value.length} Schritte</span>
                  </div>
                </div>
              </div>
            )}

            {/* Workflow Steps */}
            <div class="space-y-4">
              {workflowSteps.value.map((step, index) => {
                const config = getStepConfig(step.type);
                
                return (
                  <div key={step.id}>
                    <div 
                      class={`bg-white rounded-lg border-2 cursor-pointer transition-all duration-200 hover:border-gray-300 ${
                        selectedStep.value?.id === step.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
                      }`}
                      onClick$={() => selectStep(step)}
                    >
                      <div class="p-6">
                        <div class="flex items-start space-x-4">
                          <div class={`w-12 h-12 ${config.color} rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0`}>
                            {config.icon}
                          </div>
                          
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between">
                              <h3 class="text-lg font-medium text-gray-900">{step.title}</h3>
                              <div class="flex items-center space-x-2">
                                {step.required && (
                                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Pflicht
                                  </span>
                                )}
                                <button
                                  onClick$={(e) => {
                                    e.stopPropagation();
                                    deleteStep(step.id);
                                  }}
                                  class="text-gray-400 hover:text-red-600 transition-colors"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                            
                            <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span class="flex items-center space-x-1">
                                <span>👤</span>
                                <span>{getResponsibleLabel(step.responsible)}</span>
                              </span>
                              <span class="flex items-center space-x-1">
                                <span>⏱️</span>
                                <span>{step.estimatedDays} Tag{step.estimatedDays !== 1 ? 'e' : ''}</span>
                              </span>
                              <span class="flex items-center space-x-1">
                                <span>🏷️</span>
                                <span>{config.label}</span>
                              </span>
                            </div>

                            {step.description && (
                              <p class="mt-3 text-gray-600 text-sm bg-gray-50 rounded-md p-3">
                                {step.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Arrow between steps */}
                    {index < workflowSteps.value.length - 1 && (
                      <div class="flex justify-center py-2">
                        <div class="w-0.5 h-6 bg-gray-300"></div>
                        <div class="absolute w-3 h-3 bg-gray-300 rounded-full -mt-1.5 flex items-center justify-center">
                          <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {workflowSteps.value.length === 0 && (
                <div class="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                  <div class="text-6xl mb-4">📋</div>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Noch keine Schritte</h3>
                  <p class="text-gray-500 mb-4">Füge deinen ersten Workflow-Schritt hinzu</p>
                  <button
                    onClick$={addStep}
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    + Ersten Schritt hinzufügen
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Properties Panel - VOLLSTÄNDIG INLINE */}
      {showProperties.value && selectedStep.value && (
        <div class="fixed inset-y-0 right-0 w-80 bg-white border-l border-gray-200 shadow-xl z-40 overflow-y-auto">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Schritt bearbeiten</h3>
              <button 
                onClick$={() => showProperties.value = false}
                class="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Titel
                </label>
                <input
                  type="text"
                  value={selectedStep.value.title}
                  onInput$={(e) => {
                    const updated = { ...selectedStep.value!, title: (e.target as HTMLInputElement).value };
                    selectedStep.value = updated;
                    updateStep(updated);
                  }}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Typ
                </label>
                <select
                  value={selectedStep.value.type}
                  onChange$={(e) => {
                    const updated = { ...selectedStep.value!, type: (e.target as HTMLSelectElement).value as any };
                    selectedStep.value = updated;
                    updateStep(updated);
                  }}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="task">📋 Aufgabe</option>
                  <option value="approval">✅ Genehmigung</option>
                  <option value="decision">🔄 Entscheidung</option>
                  <option value="notification">📧 Benachrichtigung</option>
                  <option value="wait">⏱️ Warten</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Verantwortlich
                </label>
                <select
                  value={selectedStep.value.responsible}
                  onChange$={(e) => {
                    const updated = { ...selectedStep.value!, responsible: (e.target as HTMLSelectElement).value as any };
                    selectedStep.value = updated;
                    updateStep(updated);
                  }}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="AG">Auftraggeber</option>
                  <option value="AN">Auftragnehmer</option>
                  <option value="system">System</option>
                  <option value="both">Beide</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Beschreibung
                </label>
                <textarea
                  value={selectedStep.value.description}
                  onInput$={(e) => {
                    const updated = { ...selectedStep.value!, description: (e.target as HTMLTextAreaElement).value };
                    selectedStep.value = updated;
                    updateStep(updated);
                  }}
                  rows={3}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Beschreibung des Schritts..."
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Geschätzter Aufwand (Tage)
                </label>
                <input
                  type="number"
                  min="1"
                  value={selectedStep.value.estimatedDays}
                  onInput$={(e) => {
                    const updated = { ...selectedStep.value!, estimatedDays: parseInt((e.target as HTMLInputElement).value) };
                    selectedStep.value = updated;
                    updateStep(updated);
                  }}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div class="flex items-center">
                <input
                  type="checkbox"
                  id="required"
                  checked={selectedStep.value.required}
                  onChange$={(e) => {
                    const updated = { ...selectedStep.value!, required: (e.target as HTMLInputElement).checked };
                    selectedStep.value = updated;
                    updateStep(updated);
                  }}
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label for="required" class="ml-2 text-sm text-gray-700">
                  Pflichtschritt
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for properties panel */}
      {showProperties.value && (
        <div 
          class="fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick$={() => showProperties.value = false}
        ></div>
      )}
    </div>
  );
});
