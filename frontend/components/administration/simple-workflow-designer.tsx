// Simple Workflow Designer - Vereinfachte Version basierend auf dem alten System
import { component$, useSignal, useTask$, $, useStore } from '@builder.io/qwik';
import { WorkflowApiService } from '~/services/api/workflow-api-service';

// Vereinfachte Types
interface SimpleWorkflowStep {
  id: string;
  name: string;
  responsible: 'AG' | 'AN';
  order: number;
  description?: string;
  estimatedDays?: number;
}

interface SimpleWorkflow {
  id?: string;
  type: string;
  name: string;
  description: string;
  steps: SimpleWorkflowStep[];
  isActive: boolean;
}

// Vordefinierte Workflows
const PREDEFINED_WORKFLOWS = {
  'Kleinanforderung': [
    { name: 'Anforderung definieren', responsible: 'AG' as const },
    { name: 'Anforderung spezifizieren', responsible: 'AG' as const },
    { name: 'Anforderung prüfen', responsible: 'AG' as const },
    { name: 'Lösungsangebot erstellen', responsible: 'AN' as const },
    { name: 'Lösungsangebot entscheiden', responsible: 'AG' as const },
    { name: 'Umsetzung freigeben', responsible: 'AG' as const },
    { name: 'Umsetzung vorbereiten', responsible: 'AN' as const },
    { name: 'Umsetzung durchführen', responsible: 'AN' as const },
    { name: 'Fachliche Tests durchführen', responsible: 'AG' as const },
    { name: 'Fachliche Abnahme prüfen', responsible: 'AG' as const },
    { name: 'Technische Abnahme durchführen', responsible: 'AN' as const },
    { name: 'IT-Anforderung schließen', responsible: 'AG' as const }
  ],
  'Großanforderung': [
    { name: 'Anforderung definieren', responsible: 'AG' as const },
    { name: 'Grobanalyse durchführen', responsible: 'AN' as const },
    { name: 'Feinkonzept erstellen', responsible: 'AN' as const },
    { name: 'Konzept freigeben', responsible: 'AG' as const },
    { name: 'Implementierung durchführen', responsible: 'AN' as const },
    { name: 'Systemtest durchführen', responsible: 'AN' as const },
    { name: 'Abnahme durchführen', responsible: 'AG' as const },
    { name: 'IT-Anforderung schließen', responsible: 'AG' as const }
  ]
};

export default component$(() => {
  // State
  const selectedWorkflowType = useSignal<string>('');
  const currentWorkflow = useSignal<SimpleWorkflow | null>(null);
  const isLoading = useSignal(false);
  const isDirty = useSignal(false);
  const selectedStepIndex = useSignal<number | null>(null);

  // Load workflow when type changes
  useTask$(async ({ track }) => {
    track(() => selectedWorkflowType.value);
    if (!selectedWorkflowType.value) return;
    
    isLoading.value = true;
    try {
      const result = await WorkflowApiService.getWorkflowByType(selectedWorkflowType.value);
      
      if (result.isSuccess && result.data) {
        // Convert API data to simple format
        currentWorkflow.value = {
          id: result.data.id,
          type: result.data.type,
          name: result.data.name,
          description: result.data.description,
          isActive: result.data.isActive,
          steps: result.data.steps.map((step: any, index: number) => ({
            id: step.id || `step-${index}`,
            name: step.title || step.name,
            responsible: step.responsible || 'AG',
            order: step.order || index + 1,
            description: step.description,
            estimatedDays: step.estimatedDays || 1
          }))
        };
      } else {
        // Create new workflow from template
        const template = PREDEFINED_WORKFLOWS[selectedWorkflowType.value as keyof typeof PREDEFINED_WORKFLOWS];
        if (template) {
          currentWorkflow.value = {
            type: selectedWorkflowType.value,
            name: `Standard ${selectedWorkflowType.value} Workflow`,
            description: `Workflow für ${selectedWorkflowType.value}`,
            isActive: true,
            steps: template.map((step, index) => ({
              id: `step-${index + 1}`,
              name: step.name,
              responsible: step.responsible,
              order: index + 1,
              estimatedDays: 1
            }))
          };
          isDirty.value = true;
        }
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
    } finally {
      isLoading.value = false;
    }
  });

  // Save workflow
  const saveWorkflow = $(async () => {
    if (!currentWorkflow.value) return;
    
    isLoading.value = true;
    try {
      // Convert simple format back to API format
      const apiWorkflow = {
        id: currentWorkflow.value.id,
        type: currentWorkflow.value.type,
        name: currentWorkflow.value.name,
        description: currentWorkflow.value.description,
        isActive: currentWorkflow.value.isActive,
        steps: currentWorkflow.value.steps.map(step => ({
          id: step.id,
          title: step.name,
          type: 'task' as const,
          responsible: step.responsible,
          description: step.description || '',
          estimatedDays: step.estimatedDays || 1,
          required: true,
          conditions: [],
          order: step.order,
          permissions: {
            canRead: ['AG', 'AN'],
            canWrite: [step.responsible],
            canApprove: [step.responsible]
          }
        }))
      };

      const result = currentWorkflow.value.id 
        ? await WorkflowApiService.updateWorkflow(currentWorkflow.value.id, apiWorkflow)
        : await WorkflowApiService.createWorkflow(apiWorkflow);

      if (result.isSuccess) {
        currentWorkflow.value.id = result.data?.id || currentWorkflow.value.id;
        isDirty.value = false;
        alert('Workflow erfolgreich gespeichert!');
      } else {
        alert('Fehler beim Speichern: ' + result.message);
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Fehler beim Speichern des Workflows');
    } finally {
      isLoading.value = false;
    }
  });

  // Step management
  const addStep = $(() => {
    if (!currentWorkflow.value) return;
    
    const newStep: SimpleWorkflowStep = {
      id: `step-${Date.now()}`,
      name: 'Neuer Schritt',
      responsible: 'AG',
      order: currentWorkflow.value.steps.length + 1,
      estimatedDays: 1
    };
    
    currentWorkflow.value.steps.push(newStep);
    isDirty.value = true;
  });

  const removeStep = $((index: number) => {
    if (!currentWorkflow.value) return;
    
    currentWorkflow.value.steps.splice(index, 1);
    // Reorder remaining steps
    currentWorkflow.value.steps.forEach((step, i) => {
      step.order = i + 1;
    });
    
    if (selectedStepIndex.value === index) {
      selectedStepIndex.value = null;
    } else if (selectedStepIndex.value !== null && selectedStepIndex.value > index) {
      selectedStepIndex.value--;
    }
    
    isDirty.value = true;
  });

  const moveStep = $((fromIndex: number, toIndex: number) => {
    if (!currentWorkflow.value) return;
    
    const steps = currentWorkflow.value.steps;
    const [movedStep] = steps.splice(fromIndex, 1);
    steps.splice(toIndex, 0, movedStep);
    
    // Reorder all steps
    steps.forEach((step, index) => {
      step.order = index + 1;
    });
    
    isDirty.value = true;
  });

  const updateStep = $((index: number, field: keyof SimpleWorkflowStep, value: any) => {
    if (!currentWorkflow.value) return;
    
    (currentWorkflow.value.steps[index] as any)[field] = value;
    isDirty.value = true;
  });

  return (
    <div class="min-h-screen bg-gray-50">
      {/* Header */}
      <div class="bg-white border-b border-gray-200">
        <div class="px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Vereinfachter Workflow-Designer</h1>
              <p class="text-gray-600 mt-1">Erstellen und bearbeiten Sie einfache Workflows mit Schritten und Verantwortlichkeiten</p>
            </div>
            
            <div class="flex items-center gap-3">
              {isDirty.value && (
                <span class="text-amber-600 text-sm font-medium">
                  ● Ungespeicherte Änderungen
                </span>
              )}
              
              <button 
                class="btn btn-primary"
                onClick$={saveWorkflow}
                disabled={isLoading.value || !currentWorkflow.value}
              >
                {isLoading.value ? '💾 Speichert...' : '💾 Speichern'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex h-[calc(100vh-120px)]">
        {/* Sidebar - Workflow Selection */}
        <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold mb-4">Workflow-Typ wählen</h2>
            
            <select 
              class="form-select w-full"
              value={selectedWorkflowType.value}
              onChange$={(e) => {
                selectedWorkflowType.value = (e.target as HTMLSelectElement).value;
                selectedStepIndex.value = null;
              }}
            >
              <option value="">-- Workflow-Typ wählen --</option>
              <option value="Kleinanforderung">Kleinanforderung</option>
              <option value="Großanforderung">Großanforderung</option>
              <option value="TIA-Anforderung">TIA-Anforderung</option>
              <option value="Supportleistung">Supportleistung</option>
              <option value="Betriebsauftrag">Betriebsauftrag</option>
            </select>
          </div>

          {/* Workflow Info */}
          {currentWorkflow.value && (
            <div class="p-6 border-b border-gray-200">
              <div class="space-y-4">
                <div>
                  <label class="form-label">Workflow-Name</label>
                  <input 
                    type="text" 
                    class="form-input"
                    value={currentWorkflow.value.name}
                    onInput$={(e) => {
                      if (currentWorkflow.value) {
                        currentWorkflow.value.name = (e.target as HTMLInputElement).value;
                        isDirty.value = true;
                      }
                    }}
                  />
                </div>
                
                <div>
                  <label class="form-label">Beschreibung</label>
                  <textarea 
                    class="form-textarea"
                    rows={3}
                    value={currentWorkflow.value.description}
                    onInput$={(e) => {
                      if (currentWorkflow.value) {
                        currentWorkflow.value.description = (e.target as HTMLTextAreaElement).value;
                        isDirty.value = true;
                      }
                    }}
                  ></textarea>
                </div>
                
                <div class="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="isActive"
                    checked={currentWorkflow.value.isActive}
                    onChange$={(e) => {
                      if (currentWorkflow.value) {
                        currentWorkflow.value.isActive = (e.target as HTMLInputElement).checked;
                        isDirty.value = true;
                      }
                    }}
                  />
                  <label for="isActive" class="form-label">Workflow aktiv</label>
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div class="p-6">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">Legende</h3>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-blue-500 rounded"></div>
                <span class="text-sm text-gray-600">AG - Auftraggeber</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-green-500 rounded"></div>
                <span class="text-sm text-gray-600">AN - Auftragnehmer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div class="flex-1 flex">
          {/* Workflow Steps */}
          <div class="flex-1 p-6">
            {currentWorkflow.value ? (
              <div>
                <div class="flex items-center justify-between mb-6">
                  <h2 class="text-xl font-semibold">Workflow-Schritte</h2>
                  <button 
                    class="btn btn-secondary"
                    onClick$={addStep}
                  >
                    ➕ Schritt hinzufügen
                  </button>
                </div>

                {currentWorkflow.value.steps.length === 0 ? (
                  <div class="text-center py-12 text-gray-500">
                    <div class="text-4xl mb-4">📋</div>
                    <p>Noch keine Schritte definiert</p>
                    <button 
                      class="btn btn-primary mt-4"
                      onClick$={addStep}
                    >
                      Ersten Schritt hinzufügen
                    </button>
                  </div>
                ) : (
                  <div class="space-y-4">
                    {currentWorkflow.value.steps.map((step, index) => (
                      <div 
                        key={step.id}
                        class={`workflow-step-card ${selectedStepIndex.value === index ? 'selected' : ''}`}
                        onClick$={() => selectedStepIndex.value = index}
                      >
                        <div class="flex items-center gap-4">
                          {/* Step Number */}
                          <div class={`step-number ${step.responsible.toLowerCase()}`}>
                            {step.order}
                          </div>

                          {/* Step Content */}
                          <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                              <h3 class="font-semibold">{step.name}</h3>
                              <span class={`responsibility-badge ${step.responsible.toLowerCase()}`}>
                                {step.responsible}
                              </span>
                            </div>
                            {step.description && (
                              <p class="text-sm text-gray-600">{step.description}</p>
                            )}
                            {step.estimatedDays && (
                              <p class="text-xs text-gray-500 mt-1">
                                ⏱️ {step.estimatedDays} Tag{step.estimatedDays !== 1 ? 'e' : ''}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div class="flex items-center gap-2">
                            {index > 0 && (
                              <button 
                                class="btn-icon"
                                onClick$={(e) => {
                                  e.stopPropagation();
                                  moveStep(index, index - 1);
                                }}
                                title="Nach oben"
                              >
                                ⬆️
                              </button>
                            )}
                            {index < currentWorkflow.value!.steps.length - 1 && (
                              <button 
                                class="btn-icon"
                                onClick$={(e) => {
                                  e.stopPropagation();
                                  moveStep(index, index + 1);
                                }}
                                title="Nach unten"
                              >
                                ⬇️
                              </button>
                            )}
                            <button 
                              class="btn-icon text-red-600 hover:bg-red-50"
                              onClick$={(e) => {
                                e.stopPropagation();
                                if (confirm('Schritt wirklich löschen?')) {
                                  removeStep(index);
                                }
                              }}
                              title="Löschen"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        {/* Arrow to next step */}
                        {index < currentWorkflow.value.steps.length - 1 && (
                          <div class="step-arrow">
                            ⬇️
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Final state */}
                    <div class="workflow-step-card final-step">
                      <div class="flex items-center justify-center gap-2">
                        <div class="step-number final">✓</div>
                        <span class="font-semibold text-green-700">Abgeschlossen</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div class="flex items-center justify-center h-full text-gray-500">
                <div class="text-center">
                  <div class="text-6xl mb-4">🔧</div>
                  <h2 class="text-xl font-semibold mb-2">Workflow-Designer</h2>
                  <p>Wählen Sie einen Workflow-Typ aus, um zu beginnen</p>
                </div>
              </div>
            )}
          </div>

          {/* Step Details Panel */}
          {selectedStepIndex.value !== null && currentWorkflow.value && (
            <div class="w-80 bg-white border-l border-gray-200 p-6">
              <h3 class="text-lg font-semibold mb-4">Schritt bearbeiten</h3>
              
              {(() => {
                const step = currentWorkflow.value!.steps[selectedStepIndex.value!];
                return (
                  <div class="space-y-4">
                    <div>
                      <label class="form-label">Schritt-Name</label>
                      <input 
                        type="text" 
                        class="form-input"
                        value={step.name}
                        onInput$={(e) => {
                          updateStep(selectedStepIndex.value!, 'name', (e.target as HTMLInputElement).value);
                        }}
                      />
                    </div>

                    <div>
                      <label class="form-label">Verantwortlich</label>
                      <select 
                        class="form-select"
                        value={step.responsible}
                        onChange$={(e) => {
                          updateStep(selectedStepIndex.value!, 'responsible', (e.target as HTMLSelectElement).value);
                        }}
                      >
                        <option value="AG">AG - Auftraggeber</option>
                        <option value="AN">AN - Auftragnehmer</option>
                      </select>
                    </div>

                    <div>
                      <label class="form-label">Beschreibung</label>
                      <textarea 
                        class="form-textarea"
                        rows={3}
                        value={step.description || ''}
                        onInput$={(e) => {
                          updateStep(selectedStepIndex.value!, 'description', (e.target as HTMLTextAreaElement).value);
                        }}
                        placeholder="Optionale Beschreibung des Schritts..."
                      ></textarea>
                    </div>

                    <div>
                      <label class="form-label">Geschätzte Dauer (Tage)</label>
                      <input 
                        type="number" 
                        class="form-input"
                        min="1"
                        value={step.estimatedDays || 1}
                        onInput$={(e) => {
                          updateStep(selectedStepIndex.value!, 'estimatedDays', parseInt((e.target as HTMLInputElement).value) || 1);
                        }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .workflow-step-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .workflow-step-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .workflow-step-card.selected {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .workflow-step-card.final-step {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-color: #16a34a;
        }

        .step-number {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.125rem;
          color: white;
        }

        .step-number.ag {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        }

        .step-number.an {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
        }

        .step-number.final {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          font-size: 1.5rem;
        }

        .responsibility-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .responsibility-badge.ag {
          background: rgba(59, 130, 246, 0.1);
          color: #1d4ed8;
        }

        .responsibility-badge.an {
          background: rgba(22, 163, 74, 0.1);
          color: #15803d;
        }

        .step-arrow {
          position: absolute;
          bottom: -1.5rem;
          left: 50%;
          transform: translateX(-50%);
          font-size: 1.5rem;
          color: #6b7280;
        }

        .btn-icon {
          width: 2rem;
          height: 2rem;
          border-radius: 0.375rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e5e7eb;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.875rem;
        }

        .btn-icon:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }
      `}</style>
    </div>
  );
});