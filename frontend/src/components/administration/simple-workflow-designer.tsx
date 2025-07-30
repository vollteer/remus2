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

export const SimpleWorkflowDesigner = component$(() => {
  // State
  const selectedWorkflowType = useSignal<string>('');
  const currentWorkflow = useSignal<SimpleWorkflow | null>(null);
  const isLoading = useSignal(false);
  const isDirty = useSignal(false);
  const selectedStepIndex = useSignal<number | null>(null);
  const viewMode = useSignal<'list' | 'flowchart'>('list');

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
    <div class="workflow-designer">
      {/* Modern Header */}
      <header class="workflow-header">
        <div class="header-content">
          <div class="header-info">
            <h1>Simple Workflow Designer</h1>
            <p>Erstellen und verwalten Sie Workflows mit klaren Schritten und Verantwortlichkeiten</p>
          </div>
          
          <div class="header-actions">
            {isDirty.value && (
              <div class="status-indicator">
                <div class="status-dot"></div>
                <span>Ungespeichert</span>
              </div>
            )}
            
            <button 
              class={`save-btn ${isLoading.value ? 'loading' : ''}`}
              onClick$={saveWorkflow}
              disabled={isLoading.value || !currentWorkflow.value}
            >
              <span class="btn-icon">💾</span>
              <span>{isLoading.value ? 'Speichert...' : 'Speichern'}</span>
            </button>
          </div>
        </div>
      </header>

      <div class="workflow-layout">
        {/* Modern Sidebar */}
        <aside class="sidebar">
          <div class="sidebar-section">
            <h2>Workflow-Typ</h2>
            
            <select 
              class="modern-select"
              value={selectedWorkflowType.value}
              onChange$={(e) => {
                selectedWorkflowType.value = (e.target as HTMLSelectElement).value;
                selectedStepIndex.value = null;
              }}
            >
              <option value="">Typ wählen...</option>
              <option value="Kleinanforderung">Kleinanforderung</option>
              <option value="Großanforderung">Großanforderung</option>
              <option value="TIA-Anforderung">TIA-Anforderung</option>
              <option value="Supportleistung">Supportleistung</option>
              <option value="Betriebsauftrag">Betriebsauftrag</option>
            </select>
          </div>

          {/* Workflow Configuration */}
          {currentWorkflow.value && (
            <div class="sidebar-section">
              <h3>Konfiguration</h3>
              
              <div class="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  class="modern-input"
                  value={currentWorkflow.value.name}
                  onInput$={(e) => {
                    if (currentWorkflow.value) {
                      currentWorkflow.value.name = (e.target as HTMLInputElement).value;
                      isDirty.value = true;
                    }
                  }}
                />
              </div>
              
              <div class="form-group">
                <label>Beschreibung</label>
                <textarea 
                  class="modern-textarea"
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
              
              <div class="checkbox-group">
                <input 
                  type="checkbox" 
                  id="isActive"
                  class="modern-checkbox"
                  checked={currentWorkflow.value.isActive}
                  onChange$={(e) => {
                    if (currentWorkflow.value) {
                      currentWorkflow.value.isActive = (e.target as HTMLInputElement).checked;
                      isDirty.value = true;
                    }
                  }}
                />
                <label for="isActive">Workflow aktiv</label>
              </div>
            </div>
          )}

          {/* Legend */}
          <div class="sidebar-section legend">
            <h3>Verantwortlichkeiten</h3>
            <div class="legend-items">
              <div class="legend-item">
                <div class="legend-color ag"></div>
                <span>Auftraggeber (AG)</span>
              </div>
              <div class="legend-item">
                <div class="legend-color an"></div>
                <span>Auftragnehmer (AN)</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main class="main-content">
          {currentWorkflow.value ? (
            <div class="steps-container">
              <div class="steps-header">
                <h2>Workflow-Schritte</h2>
                <div class="header-controls">
                  <div class="view-switcher">
                    <button 
                      class={`view-btn ${viewMode.value === 'list' ? 'active' : ''}`}
                      onClick$={() => viewMode.value = 'list'}
                      title="Listen-Ansicht"
                    >
                      <span class="btn-icon">☰</span>
                      <span>Liste</span>
                    </button>
                    <button 
                      class={`view-btn ${viewMode.value === 'flowchart' ? 'active' : ''}`}
                      onClick$={() => viewMode.value = 'flowchart'}
                      title="Flussdiagramm-Ansicht"
                    >
                      <span class="btn-icon">⚡</span>
                      <span>Fluss</span>
                    </button>
                  </div>
                  <button 
                    class="add-step-btn"
                    onClick$={addStep}
                  >
                    <span class="btn-icon">+</span>
                    <span>Schritt hinzufügen</span>
                  </button>
                </div>
              </div>

              {currentWorkflow.value.steps.length === 0 ? (
                <div class="empty-state">
                  <div class="empty-icon">📋</div>
                  <h3>Noch keine Schritte definiert</h3>
                  <p>Fügen Sie den ersten Schritt hinzu, um zu beginnen</p>
                  <button 
                    class="add-step-btn primary"
                    onClick$={addStep}
                  >
                    <span class="btn-icon">+</span>
                    <span>Ersten Schritt hinzufügen</span>
                  </button>
                </div>
              ) : viewMode.value === 'list' ? (
                <div class="steps-list">
                  {currentWorkflow.value.steps.map((step, index) => (
                    <div 
                      key={step.id}
                      class={`step-card ${selectedStepIndex.value === index ? 'selected' : ''}`}
                      onClick$={() => selectedStepIndex.value = index}
                    >
                      <div class="step-content">
                        <div class={`step-indicator ${step.responsible.toLowerCase()}`}>
                          <span class="step-number">{step.order}</span>
                        </div>

                        <div class="step-info">
                          <div class="step-header">
                            <h3 class="step-title">{step.name}</h3>
                            <div class={`responsibility-tag ${step.responsible.toLowerCase()}`}>
                              {step.responsible}
                            </div>
                          </div>
                          
                          {step.description && (
                            <p class="step-description">{step.description}</p>
                          )}
                          
                          {step.estimatedDays && (
                            <div class="step-meta">
                              <span class="meta-item">
                                <span class="meta-icon">⏱</span>
                                {step.estimatedDays} Tag{step.estimatedDays !== 1 ? 'e' : ''}
                              </span>
                            </div>
                          )}
                        </div>

                        <div class="step-actions">
                          {index > 0 && (
                            <button 
                              class="action-btn"
                              onClick$={(e) => {
                                e.stopPropagation();
                                moveStep(index, index - 1);
                              }}
                              title="Nach oben"
                            >
                              ↑
                            </button>
                          )}
                          {index < currentWorkflow.value!.steps.length - 1 && (
                            <button 
                              class="action-btn"
                              onClick$={(e) => {
                                e.stopPropagation();
                                moveStep(index, index + 1);
                              }}
                              title="Nach unten"
                            >
                              ↓
                            </button>
                          )}
                          <button 
                            class="action-btn danger"
                            onClick$={(e) => {
                              e.stopPropagation();
                              if (confirm('Schritt wirklich löschen?')) {
                                removeStep(index);
                              }
                            }}
                            title="Löschen"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      {index < currentWorkflow.value.steps.length - 1 && (
                        <div class="step-connector">
                          <div class="connector-line"></div>
                          <div class="connector-arrow">↓</div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div class="final-step">
                    <div class="step-indicator final">
                      <span class="step-number">✓</span>
                    </div>
                    <div class="step-info">
                      <h3 class="step-title">Abgeschlossen</h3>
                      <p class="step-description">Workflow erfolgreich durchgeführt</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Flowchart View */
                <div class="flowchart-container">
                  <div class="flowchart-positioned">
                    {/* AG Lane */}
                    <div class="flowchart-lane ag-lane">
                      <div class="lane-header">
                        <div class="lane-title">
                          <div class="lane-icon ag">👤</div>
                          <h3>Auftraggeber (AG)</h3>
                        </div>
                      </div>
                      <div class="lane-content">
                        {currentWorkflow.value.steps.map((step, index) => (
                          step.responsible === 'AG' ? (
                            <div 
                              key={step.id}
                              class={`flowchart-step ag positioned ${selectedStepIndex.value === index ? 'selected' : ''}`}
                              style={`top: ${index * 140 + 20}px;`}
                              onClick$={() => selectedStepIndex.value = index}
                            >
                              <div class="flowchart-step-header">
                                <div class="step-number">{step.order}</div>
                                <div class="step-actions">
                                  <button 
                                    class="action-btn danger"
                                    onClick$={(e) => {
                                      e.stopPropagation();
                                      if (confirm('Schritt wirklich löschen?')) {
                                        removeStep(index);
                                      }
                                    }}
                                    title="Löschen"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                              <div class="flowchart-step-content">
                                <h4 class="step-title">{step.name}</h4>
                                {step.description && (
                                  <p class="step-description">{step.description}</p>
                                )}
                                {step.estimatedDays && (
                                  <div class="step-meta">
                                    <span class="meta-item">
                                      <span class="meta-icon">⏱</span>
                                      {step.estimatedDays} Tag{step.estimatedDays !== 1 ? 'e' : ''}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div 
                              key={`spacer-${index}`}
                              class="flowchart-spacer"
                              style={`top: ${index * 140 + 20}px;`}
                            ></div>
                          )
                        ))}
                      </div>
                    </div>

                    {/* Flow Connections */}
                    <div class="flowchart-connections">
                      <svg class="connection-svg">
                        {currentWorkflow.value.steps.map((step, index) => {
                          if (index === currentWorkflow.value!.steps.length - 1) return null;
                          
                          const nextStep = currentWorkflow.value!.steps[index + 1];
                          const currentStepY = index * 140 + 70; // Center of step box
                          const nextStepY = (index + 1) * 140 + 70;
                          
                          if (step.responsible === nextStep.responsible) {
                            // Same side - no connecting line needed (within same lane)
                            return null;
                          } else {
                            // Cross-lane connection
                            const startX = step.responsible === 'AG' ? 0 : 100;  // Edge of connection area
                            const endX = nextStep.responsible === 'AG' ? 0 : 100; // Edge of connection area
                            
                            return (
                              <g key={`${step.id}-${nextStep.id}`}>
                                <path
                                  d={`M ${startX} ${currentStepY} 
                                      L 50 ${currentStepY}
                                      L 50 ${nextStepY}
                                      L ${endX} ${nextStepY}`}
                                  stroke="#0052cc"
                                  stroke-width="2"
                                  fill="none"
                                  marker-end="url(#arrowhead-blue)"
                                />
                              </g>
                            );
                          }
                        })}
                        
                        {/* Arrow markers */}
                        <defs>
                          <marker id="arrowhead-blue" markerWidth="8" markerHeight="6" 
                                  refX="7" refY="3" orient="auto">
                            <polygon points="0 0, 8 3, 0 6" fill="#0052cc" />
                          </marker>
                        </defs>
                      </svg>
                    </div>

                    {/* AN Lane */}
                    <div class="flowchart-lane an-lane">
                      <div class="lane-header">
                        <div class="lane-title">
                          <div class="lane-icon an">🔧</div>
                          <h3>Auftragnehmer (AN)</h3>
                        </div>
                      </div>
                      <div class="lane-content">
                        {currentWorkflow.value.steps.map((step, index) => (
                          step.responsible === 'AN' ? (
                            <div 
                              key={step.id}
                              class={`flowchart-step an positioned ${selectedStepIndex.value === index ? 'selected' : ''}`}
                              style={`top: ${index * 140 + 20}px;`}
                              onClick$={() => selectedStepIndex.value = index}
                            >
                              <div class="flowchart-step-header">
                                <div class="step-number">{step.order}</div>
                                <div class="step-actions">
                                  <button 
                                    class="action-btn danger"
                                    onClick$={(e) => {
                                      e.stopPropagation();
                                      if (confirm('Schritt wirklich löschen?')) {
                                        removeStep(index);
                                      }
                                    }}
                                    title="Löschen"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                              <div class="flowchart-step-content">
                                <h4 class="step-title">{step.name}</h4>
                                {step.description && (
                                  <p class="step-description">{step.description}</p>
                                )}
                                {step.estimatedDays && (
                                  <div class="step-meta">
                                    <span class="meta-item">
                                      <span class="meta-icon">⏱</span>
                                      {step.estimatedDays} Tag{step.estimatedDays !== 1 ? 'e' : ''}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div 
                              key={`spacer-${index}`}
                              class="flowchart-spacer"
                              style={`top: ${index * 140 + 20}px;`}
                            ></div>
                          )
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Final Step in Flowchart */}
                  <div class="flowchart-final" style={`margin-top: ${currentWorkflow.value.steps.length * 140 + 60}px;`}>
                    <div class="final-step-flowchart">
                      <div class="step-indicator final">
                        <span class="step-number">✓</span>
                      </div>
                      <h3 class="step-title">Workflow abgeschlossen</h3>
                    </div>
                  </div>
                </div>
              )}
              </div>
          ) : (
            <div class="welcome-state">
              <div class="welcome-icon">🔧</div>
              <h2>Workflow-Designer</h2>
              <p>Wählen Sie einen Workflow-Typ aus der Seitenleiste, um zu beginnen</p>
            </div>
          )}
        </main>

        {/* Step Details Panel */}
        {selectedStepIndex.value !== null && currentWorkflow.value && (
          <aside class="details-panel">
            <div class="details-header">
              <h3>Schritt bearbeiten</h3>
              <button 
                class="close-btn"
                onClick$={() => selectedStepIndex.value = null}
              >
                ×
              </button>
            </div>
            
            {(() => {
              const step = currentWorkflow.value!.steps[selectedStepIndex.value!];
              return (
                <div class="details-content">
                  <div class="form-group">
                    <label>Schritt-Name</label>
                    <input 
                      type="text" 
                      class="modern-input"
                      value={step.name}
                      onInput$={(e) => {
                        updateStep(selectedStepIndex.value!, 'name', (e.target as HTMLInputElement).value);
                      }}
                    />
                  </div>

                  <div class="form-group">
                    <label>Verantwortlich</label>
                    <select 
                      class="modern-select"
                      value={step.responsible}
                      onChange$={(e) => {
                        updateStep(selectedStepIndex.value!, 'responsible', (e.target as HTMLSelectElement).value);
                      }}
                    >
                      <option value="AG">Auftraggeber (AG)</option>
                      <option value="AN">Auftragnehmer (AN)</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Beschreibung</label>
                    <textarea 
                      class="modern-textarea"
                      rows={3}
                      value={step.description || ''}
                      onInput$={(e) => {
                        updateStep(selectedStepIndex.value!, 'description', (e.target as HTMLTextAreaElement).value);
                      }}
                      placeholder="Optionale Beschreibung des Schritts..."
                    ></textarea>
                  </div>

                  <div class="form-group">
                    <label>Geschätzte Dauer</label>
                    <div class="input-with-unit">
                      <input 
                        type="number" 
                        class="modern-input"
                        min="1"
                        value={step.estimatedDays || 1}
                        onInput$={(e) => {
                          updateStep(selectedStepIndex.value!, 'estimatedDays', parseInt((e.target as HTMLInputElement).value) || 1);
                        }}
                      />
                      <span class="input-unit">Tage</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </aside>
        )}
      </div>

      <style>{`
        /* Modern Design System */
        .workflow-designer {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #fafbfc;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        /* Header */
        .workflow-header {
          background: white;
          border-bottom: 1px solid #e1e5e9;
          padding: 16px 24px;
          z-index: 10;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 100%;
        }

        .header-info h1 {
          font-size: 20px;
          font-weight: 600;
          color: #172b4d;
          margin: 0 0 4px 0;
        }

        .header-info p {
          font-size: 14px;
          color: #6b778c;
          margin: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #f57c00;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #f57c00;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .save-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #0052cc;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .save-btn:hover:not(:disabled) {
          background: #0747a6;
          transform: translateY(-1px);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .save-btn.loading .btn-icon {
          animation: spin 1s linear infinite;
        }

        /* Layout */
        .workflow-layout {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        /* Sidebar */
        .sidebar {
          width: 320px;
          background: white;
          border-right: 1px solid #e1e5e9;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .sidebar-section {
          padding: 20px;
          border-bottom: 1px solid #f4f5f7;
        }

        .sidebar-section:last-child {
          border-bottom: none;
        }

        .sidebar-section h2 {
          font-size: 16px;
          font-weight: 600;
          color: #172b4d;
          margin: 0 0 12px 0;
        }

        .sidebar-section h3 {
          font-size: 14px;
          font-weight: 600;
          color: #172b4d;
          margin: 0 0 12px 0;
        }

        /* Form Elements */
        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #5e6c84;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .modern-input,
        .modern-textarea,
        .modern-select {
          width: 100%;
          padding: 8px 12px;
          border: 2px solid #dfe1e6;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          transition: border-color 0.15s ease;
        }

        .modern-input:focus,
        .modern-textarea:focus,
        .modern-select:focus {
          outline: none;
          border-color: #4c9aff;
          box-shadow: 0 0 0 2px rgba(76, 154, 255, 0.2);
        }

        .modern-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modern-checkbox {
          width: 16px;
          height: 16px;
          accent-color: #0052cc;
        }

        .input-with-unit {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .input-unit {
          font-size: 13px;
          color: #6b778c;
          font-weight: 500;
        }

        /* Legend */
        .legend-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }

        .legend-color.ag {
          background: #0052cc;
        }

        .legend-color.an {
          background: #00875a;
        }

        .legend-item span {
          font-size: 13px;
          color: #5e6c84;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
        }

        .steps-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .steps-header h2 {
          font-size: 18px;
          font-weight: 600;
          color: #172b4d;
          margin: 0;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* View Switcher */
        .view-switcher {
          display: flex;
          background: #f4f5f7;
          border-radius: 6px;
          padding: 2px;
        }

        .view-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          border-radius: 4px;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 500;
          color: #6b778c;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .view-btn:hover {
          background: #e4e6ea;
        }

        .view-btn.active {
          background: white;
          color: #172b4d;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .view-btn .btn-icon {
          font-size: 14px;
        }

        .add-step-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 2px solid #dfe1e6;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          color: #42526e;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .add-step-btn:hover {
          border-color: #b3d4ff;
          background: #f4f8ff;
        }

        .add-step-btn.primary {
          background: #0052cc;
          border-color: #0052cc;
          color: white;
        }

        .add-step-btn.primary:hover {
          background: #0747a6;
          border-color: #0747a6;
        }

        .btn-icon {
          font-size: 16px;
          line-height: 1;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 16px;
          font-weight: 600;
          color: #172b4d;
          margin: 0 0 8px 0;
        }

        .empty-state p {
          font-size: 14px;
          color: #6b778c;
          margin: 0 0 24px 0;
        }

        /* Welcome State */
        .welcome-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
        }

        .welcome-icon {
          font-size: 64px;
          margin-bottom: 20px;
          opacity: 0.6;
        }

        .welcome-state h2 {
          font-size: 20px;
          font-weight: 600;
          color: #172b4d;
          margin: 0 0 8px 0;
        }

        .welcome-state p {
          font-size: 14px;
          color: #6b778c;
          margin: 0;
        }

        /* Steps List */
        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .step-card {
          background: white;
          border: 2px solid #dfe1e6;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
        }

        .step-card:hover {
          border-color: #b3d4ff;
          box-shadow: 0 4px 12px rgba(23, 43, 77, 0.1);
        }

        .step-card.selected {
          border-color: #4c9aff;
          box-shadow: 0 0 0 2px rgba(76, 154, 255, 0.2);
        }

        .step-content {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
        }

        .step-indicator {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .step-indicator.ag {
          background: linear-gradient(135deg, #0052cc 0%, #0747a6 100%);
        }

        .step-indicator.an {
          background: linear-gradient(135deg, #00875a 0%, #006644 100%);
        }

        .step-indicator.final {
          background: linear-gradient(135deg, #00875a 0%, #006644 100%);
        }

        .step-number {
          color: white;
          font-size: 14px;
          font-weight: 600;
        }

        .step-info {
          flex: 1;
          min-width: 0;
        }

        .step-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 4px;
        }

        .step-title {
          font-size: 15px;
          font-weight: 600;
          color: #172b4d;
          margin: 0;
        }

        .responsibility-tag {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .responsibility-tag.ag {
          background: rgba(0, 82, 204, 0.1);
          color: #0052cc;
        }

        .responsibility-tag.an {
          background: rgba(0, 135, 90, 0.1);
          color: #00875a;
        }

        .step-description {
          font-size: 13px;
          color: #6b778c;
          margin: 4px 0 0 0;
          line-height: 1.4;
        }

        .step-meta {
          margin-top: 6px;
        }

        .meta-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #6b778c;
        }

        .meta-icon {
          font-size: 14px;
        }

        .step-actions {
          display: flex;
          gap: 4px;
        }

        .action-btn {
          width: 28px;
          height: 28px;
          border: 1px solid #dfe1e6;
          background: white;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.15s ease;
          color: #6b778c;
        }

        .action-btn:hover {
          background: #f4f5f7;
          border-color: #b3bac5;
        }

        .action-btn.danger {
          color: #de350b;
        }

        .action-btn.danger:hover {
          background: #ffebe6;
          border-color: #ff8f73;
        }

        /* Step Connector */
        .step-connector {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 24px;
          position: relative;
        }

        .connector-line {
          width: 2px;
          height: 16px;
          background: #dfe1e6;
          margin-top: 4px;
        }

        .connector-arrow {
          font-size: 12px;
          color: #6b778c;
          position: absolute;
          bottom: 0;
        }

        /* Final Step */
        .final-step {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: linear-gradient(135deg, #e3fcef 0%, #d3f5e0 100%);
          border: 2px solid #79f2c0;
          border-radius: 8px;
        }

        /* Details Panel */
        .details-panel {
          width: 320px;
          background: white;
          border-left: 1px solid #e1e5e9;
          display: flex;
          flex-direction: column;
        }

        .details-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid #f4f5f7;
        }

        .details-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: #172b4d;
          margin: 0;
        }

        .close-btn {
          width: 28px;
          height: 28px;
          border: 1px solid #dfe1e6;
          background: white;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          color: #6b778c;
          transition: all 0.15s ease;
        }

        .close-btn:hover {
          background: #f4f5f7;
          border-color: #b3bac5;
        }

        .details-content {
          padding: 20px;
          overflow-y: auto;
        }

        /* Flowchart Styles */
        .flowchart-container {
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .flowchart-positioned {
          display: grid;
          grid-template-columns: 1fr 100px 1fr;
          min-height: 100%;
          gap: 0;
          position: relative;
        }

        .flowchart-lane {
          display: flex;
          flex-direction: column;
          overflow: visible;
        }

        .ag-lane {
          background: linear-gradient(135deg, rgba(0, 82, 204, 0.02) 0%, rgba(0, 82, 204, 0.05) 100%);
          border-right: 2px solid rgba(0, 82, 204, 0.1);
        }

        .an-lane {
          background: linear-gradient(135deg, rgba(0, 135, 90, 0.02) 0%, rgba(0, 135, 90, 0.05) 100%);
          border-left: 2px solid rgba(0, 135, 90, 0.1);
        }

        .lane-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
        }

        .lane-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .lane-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .lane-icon.ag {
          background: linear-gradient(135deg, #0052cc 0%, #0747a6 100%);
          color: white;
        }

        .lane-icon.an {
          background: linear-gradient(135deg, #00875a 0%, #006644 100%);
          color: white;
        }

        .lane-title h3 {
          font-size: 14px;
          font-weight: 600;
          color: #172b4d;
          margin: 0;
        }

        .lane-content {
          flex: 1;
          padding: 20px;
          position: relative;
          min-height: calc(100% - 60px);
        }

        .flowchart-step {
          background: white;
          border: 2px solid #dfe1e6;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
          min-height: 100px;
          width: calc(100% - 40px);
          margin: 0 20px;
        }

        .flowchart-step.positioned {
          position: absolute;
          width: calc(100% - 40px);
          left: 20px;
          right: 20px;
        }

        .flowchart-spacer {
          position: absolute;
          width: 100%;
          height: 120px;
          pointer-events: none;
        }

        .flowchart-step:hover {
          border-color: #b3d4ff;
          box-shadow: 0 4px 12px rgba(23, 43, 77, 0.1);
        }

        .flowchart-step.selected {
          border-color: #4c9aff;
          box-shadow: 0 0 0 2px rgba(76, 154, 255, 0.2);
        }

        .flowchart-step.ag {
          border-left: 4px solid #0052cc;
        }

        .flowchart-step.an {
          border-left: 4px solid #00875a;
        }

        .flowchart-step-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px 8px 16px;
          border-bottom: 1px solid #f4f5f7;
        }

        .flowchart-step-header .step-number {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          background: #f4f5f7;
          color: #172b4d;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .flowchart-step.ag .flowchart-step-header .step-number {
          background: rgba(0, 82, 204, 0.1);
          color: #0052cc;
        }

        .flowchart-step.an .flowchart-step-header .step-number {
          background: rgba(0, 135, 90, 0.1);
          color: #00875a;
        }

        .flowchart-step-content {
          padding: 8px 16px 16px 16px;
        }

        .flowchart-step-content .step-title {
          font-size: 14px;
          font-weight: 600;
          color: #172b4d;
          margin: 0 0 6px 0;
          line-height: 1.3;
        }

        .flowchart-step-content .step-description {
          font-size: 12px;
          color: #6b778c;
          margin: 0 0 8px 0;
          line-height: 1.4;
        }

        .flowchart-step-content .step-meta {
          margin-top: 8px;
        }

        .flowchart-step-content .meta-item {
          font-size: 11px;
          color: #6b778c;
        }

        /* Flow Connections */
        .flowchart-connections {
          position: relative;
          background: linear-gradient(to right, 
            rgba(0, 82, 204, 0.05) 0%, 
            transparent 20%, 
            transparent 80%, 
            rgba(0, 135, 90, 0.05) 100%);
        }

        .connection-svg {
          width: 100px;
          height: 100%;
          position: absolute;
          top: 60px; /* Account for header height */
          left: 0;
          overflow: visible;
        }

        /* Final Step in Flowchart */
        .flowchart-final {
          margin-top: 40px;
          display: flex;
          justify-content: center;
        }

        .final-step-flowchart {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 20px;
          background: linear-gradient(135deg, #e3fcef 0%, #d3f5e0 100%);
          border: 2px solid #79f2c0;
          border-radius: 8px;
          min-width: 200px;
        }

        .final-step-flowchart .step-indicator {
          width: 48px;
          height: 48px;
          border-radius: 8px;
        }

        .final-step-flowchart .step-title {
          font-size: 16px;
          font-weight: 600;
          color: #00875a;
          margin: 0;
          text-align: center;
        }

        /* Animations */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .sidebar {
            width: 280px;
          }
          
          .details-panel {
            width: 280px;
          }
        }

        @media (max-width: 768px) {
          .workflow-layout {
            flex-direction: column;
          }
          
          .sidebar,
          .details-panel {
            width: 100%;
            max-height: 300px;
          }
          
          .main-content {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
});