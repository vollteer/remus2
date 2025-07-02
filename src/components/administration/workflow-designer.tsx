// src/components/administration/workflow-designer.tsx
import { component$, useSignal, useTask$, $, useStore } from '@builder.io/qwik';

// Types (nutze deine bestehenden Types)
interface WorkflowStep {
  id: string;
  title: string;
  type: 'task' | 'approval' | 'decision' | 'notification' | 'wait' | 'parallel' | 'merge';
  responsible: 'AG' | 'AN' | 'SYSTEM' | 'BOTH' | 'DYNAMIC';
  description: string;
  estimatedDays: number;
  required: boolean;
  conditions: StepCondition[];
  order: number;
  permissions?: StepPermissions;
  branches?: StepBranch[];
  formBinding?: string;
  autoAssign?: boolean;
  escalation?: {
    enabled: boolean;
    afterDays: number;
    escalateTo: string[];
  };
  notifications?: {
    onStart: boolean;
    onComplete: boolean;
    onOverdue: boolean;
    recipients: string[];
  };
}

interface StepCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'isEmpty' | 'isNotEmpty' | 'greaterThan' | 'lessThan' | 'in' | 'notIn';
  value?: string | number | boolean | string[];
  action: 'show' | 'hide' | 'require' | 'skip' | 'branch';
}

interface StepBranch {
  condition: string;
  targetStepId: string;
  label: string;
  description?: string;
}

interface StepPermissions {
  allowedRoles: string[];
  allowedUsers: string[];
  denyRoles?: string[];
  requiresRole?: string;
  requiresAllRoles?: string[];
  requiresAnyRoles?: string[];
}

interface WorkflowConfiguration {
  id: string;
  type: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  isActive: boolean;
  version: number;
  createdAt: string;
  modifiedAt: string;
  createdBy: string;
}

interface StepTemplate {
  id: string;
  title: string;
  type: WorkflowStep['type'];
  icon: string;
  color: string;
  description: string;
  defaultPermissions?: StepPermissions;
  defaultBranches?: StepBranch[];
}

export const WorkflowDesigner = component$(() => {
  // State
  const selectedWorkflowType = useSignal('Kleinanforderung');
  const workflowSteps = useSignal<WorkflowStep[]>([]);
  const selectedStep = useSignal<WorkflowStep | null>(null);
  const currentConfig = useSignal<WorkflowConfiguration | null>(null);
  const isLoading = useSignal(false);
  const isSaving = useSignal(false);
  const activeTab = useSignal<'designer' | 'properties' | 'preview' | 'export'>('designer');
  
  // Drag & Drop state
  const draggedStep = useSignal<number | null>(null);
  const dragOverIndex = useSignal<number | null>(null);

  // Workflow Types
  const workflowTypes = [
    'Kleinanforderung', 'Großanforderung', 'TIA-Anforderung', 
    'Supportleistung', 'Betriebsauftrag', 'SBBI-Lösung', 
    'AWG-Release', 'AWS-Release'
  ];

  // Step Templates
  const stepTemplates: StepTemplate[] = [
    {
      id: 'template-task',
      title: 'Aufgabe',
      type: 'task',
      icon: '📋',
      color: 'rgb(0, 158, 227)',
      description: 'Standard Arbeitsschritt',
      defaultPermissions: {
        allowedRoles: ['Requester', 'TechnicalLead'],
        allowedUsers: [],
        denyRoles: ['External']
      }
    },
    {
      id: 'template-approval',
      title: 'Genehmigung',
      type: 'approval',
      icon: '✅',
      color: '#10b981',
      description: 'Genehmigungsschritt mit Verzweigung',
      defaultPermissions: {
        allowedRoles: ['Approver', 'Manager'],
        allowedUsers: [],
        requiresRole: 'Approver'
      },
      defaultBranches: [
        { condition: 'approved', targetStepId: 'next', label: 'Genehmigt', description: 'Anforderung wurde genehmigt' },
        { condition: 'rejected', targetStepId: 'end', label: 'Abgelehnt', description: 'Anforderung wurde abgelehnt' },
        { condition: 'needsInfo', targetStepId: 'previous', label: 'Weitere Infos', description: 'Weitere Informationen erforderlich' }
      ]
    },
    {
      id: 'template-decision',
      title: 'Entscheidung',
      type: 'decision',
      icon: '🔀',
      color: '#f59e0b',
      description: 'Entscheidungsschritt mit mehreren Pfaden',
      defaultPermissions: {
        allowedRoles: ['Manager', 'TechnicalLead'],
        allowedUsers: [],
        requiresAnyRoles: ['Manager', 'TechnicalLead']
      },
      defaultBranches: [
        { condition: 'path_a', targetStepId: 'step_a', label: 'Pfad A', description: 'Standard Pfad' },
        { condition: 'path_b', targetStepId: 'step_b', label: 'Pfad B', description: 'Alternativer Pfad' }
      ]
    },
    {
      id: 'template-notification',
      title: 'Benachrichtigung',
      type: 'notification',
      icon: '📧',
      color: '#8b5cf6',
      description: 'Automatische Benachrichtigung',
      defaultPermissions: {
        allowedRoles: ['SYSTEM'],
        allowedUsers: [],
        denyRoles: []
      }
    },
    {
      id: 'template-parallel',
      title: 'Parallele Schritte',
      type: 'parallel',
      icon: '⚡',
      color: '#06b6d4',
      description: 'Startet mehrere parallele Schritte',
      defaultPermissions: {
        allowedRoles: ['Manager', 'TechnicalLead'],
        allowedUsers: [],
        requiresRole: 'Manager'
      }
    }
  ];

  // Mock API service calls (ersetze durch deine echten Services)
  const loadWorkflow = $(async (workflowType: string) => {
    isLoading.value = true;
    try {
      // Simulate API call - ersetze durch MockWorkflowService.getWorkflowConfiguration(workflowType)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data - ersetze durch echte API Antwort
      const mockConfig: WorkflowConfiguration = {
        id: `workflow-${workflowType.toLowerCase()}`,
        type: workflowType,
        name: `Workflow für ${workflowType}`,
        description: `Standard-Workflow für ${workflowType}`,
        steps: [],
        isActive: true,
        version: 1,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        createdBy: 'system'
      };
      
      currentConfig.value = mockConfig;
      workflowSteps.value = [...mockConfig.steps];
      selectedStep.value = null;
    } catch (error) {
      console.error('Error loading workflow:', error);
      alert('Fehler beim Laden des Workflows');
    } finally {
      isLoading.value = false;
    }
  });

  // Load workflow when type changes
  useTask$(async ({ track }) => {
    track(() => selectedWorkflowType.value);
    await loadWorkflow(selectedWorkflowType.value);
  });

  // Drag and Drop handlers
  const handleDragStart = $((event: DragEvent, stepIndex: number) => {
    draggedStep.value = stepIndex;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  });

  const handleDragOver = $((event: DragEvent, index: number) => {
    event.preventDefault();
    dragOverIndex.value = index;
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  });

  const handleDragLeave = $(() => {
    dragOverIndex.value = null;
  });

  const handleDrop = $((event: DragEvent, dropIndex: number) => {
    event.preventDefault();
    if (draggedStep.value === null) return;

    const newSteps = [...workflowSteps.value];
    const draggedStepData = newSteps[draggedStep.value];

    // Remove dragged step
    newSteps.splice(draggedStep.value, 1);

    // Insert at new position
    const finalDropIndex = draggedStep.value < dropIndex ? dropIndex - 1 : dropIndex;
    newSteps.splice(finalDropIndex, 0, draggedStepData);

    // Update order
    newSteps.forEach((step, index) => {
      step.order = index + 1;
    });

    workflowSteps.value = newSteps;
    draggedStep.value = null;
    dragOverIndex.value = null;
  });

  // Step management
  const addNewStep = $((template: StepTemplate) => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      title: `Neue ${template.title}`,
      type: template.type,
      responsible: 'AN',
      description: template.description,
      estimatedDays: 1,
      required: true,
      conditions: [],
      order: workflowSteps.value.length + 1,
      permissions: template.defaultPermissions,
      branches: template.defaultBranches,
      autoAssign: false,
      notifications: {
        onStart: false,
        onComplete: false,
        onOverdue: false,
        recipients: []
      }
    };

    workflowSteps.value = [...workflowSteps.value, newStep];
    selectedStep.value = newStep;
  });

  const updateStep = $((stepId: string, updates: Partial<WorkflowStep>) => {
    workflowSteps.value = workflowSteps.value.map(step =>
      step.id === stepId ? { ...step, ...updates } : step
    );

    if (selectedStep.value?.id === stepId) {
      selectedStep.value = { ...selectedStep.value, ...updates };
    }
  });

  const deleteStep = $((stepId: string) => {
    workflowSteps.value = workflowSteps.value.filter(step => step.id !== stepId);
    // Reorder remaining steps
    workflowSteps.value.forEach((step, index) => {
      step.order = index + 1;
    });

    if (selectedStep.value?.id === stepId) {
      selectedStep.value = null;
    }
  });

  const duplicateStep = $((step: WorkflowStep) => {
    const stepCopy: WorkflowStep = {
      ...step,
      id: `step-${Date.now()}`,
      title: `${step.title} (Kopie)`,
      order: workflowSteps.value.length + 1
    };
    workflowSteps.value = [...workflowSteps.value, stepCopy];
    selectedStep.value = stepCopy;
  });

  // Workflow actions
  const saveWorkflow = $(async () => {
    if (!currentConfig.value) return;

    isSaving.value = true;
    try {
      const configToSave: WorkflowConfiguration = {
        ...currentConfig.value,
        steps: workflowSteps.value,
        modifiedAt: new Date().toISOString()
      };
      
      // Simulate API call - ersetze durch MockWorkflowService.saveWorkflowConfiguration(configToSave)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      currentConfig.value = configToSave;
      alert(`Workflow "${selectedWorkflowType.value}" erfolgreich gespeichert! 🎉`);
    } catch (error) {
      console.error("Error saving workflow:", error);
      alert("Fehler beim Speichern des Workflows");
    } finally {
      isSaving.value = false;
    }
  });

  const validateWorkflow = $(async () => {
    if (!currentConfig.value) return;

    try {
      // Simulate validation - ersetze durch MockWorkflowService.validateWorkflow
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const errors: string[] = [];
      
      // Basic validation
      if (workflowSteps.value.length === 0) {
        errors.push("Workflow muss mindestens einen Schritt haben");
      }
      
      // Check for duplicate step IDs
      const stepIds = workflowSteps.value.map(s => s.id);
      if (new Set(stepIds).size !== stepIds.length) {
        errors.push("Doppelte Schritt-IDs gefunden");
      }

      // Check required fields
      workflowSteps.value.forEach((step, index) => {
        if (!step.title.trim()) {
          errors.push(`Schritt ${index + 1}: Titel ist erforderlich`);
        }
        if (!step.description.trim()) {
          errors.push(`Schritt ${index + 1}: Beschreibung ist erforderlich`);
        }
        if (step.estimatedDays <= 0) {
          errors.push(`Schritt ${index + 1}: Geschätzte Tage muss größer als 0 sein`);
        }
      });
      
      if (errors.length === 0) {
        alert("✅ Workflow ist valid!");
      } else {
        alert(`❌ Workflow Validierungsfehler:\n\n${errors.join("\n")}`);
      }
    } catch (error) {
      console.error("Error validating workflow:", error);
      alert("Fehler bei der Validierung");
    }
  });

  const exportWorkflow = $(async () => {
    if (!currentConfig.value) return;

    try {
      const exportData = {
        ...currentConfig.value,
        steps: workflowSteps.value,
        exportedAt: new Date().toISOString(),
        exportedBy: 'current.user@company.com'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `workflow-${selectedWorkflowType.value}-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert("Workflow erfolgreich exportiert!");
    } catch (error) {
      console.error("Error exporting workflow:", error);
      alert("Fehler beim Exportieren");
    }
  });

  const importWorkflow = $(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const imported = JSON.parse(text) as WorkflowConfiguration;
        
        currentConfig.value = imported;
        workflowSteps.value = [...imported.steps];
        selectedStep.value = null;
        alert(`Workflow "${imported.name}" erfolgreich importiert!`);
      } catch (error) {
        console.error("Error importing workflow:", error);
        alert("Fehler beim Importieren der Datei");
      }
    };

    input.click();
  });

  const resetWorkflow = $(async () => {
    if (confirm('Workflow zurücksetzen? Alle Änderungen gehen verloren!')) {
      try {
        // Simulate reset - ersetze durch MockWorkflowService.resetWorkflowToDefault
        await new Promise(resolve => setTimeout(resolve, 500));
        
        currentConfig.value = {
          ...currentConfig.value!,
          steps: []
        };
        workflowSteps.value = [];
        selectedStep.value = null;
        alert('Workflow wurde zurückgesetzt!');
      } catch (error) {
        console.error('Error resetting workflow:', error);
        alert('Fehler beim Zurücksetzen des Workflows');
      }
    }
  });

  // Helper functions
  const getStepIcon = (type: WorkflowStep['type']) => {
    const template = stepTemplates.find(t => t.type === type);
    return template?.icon || '📋';
  };

  const getStepColor = (type: WorkflowStep['type']) => {
    const template = stepTemplates.find(t => t.type === type);
    return template?.color || 'rgb(0, 158, 227)';
  };

  const formatDuration = (days: number) => {
    if (days === 1) return '1 Tag';
    if (days < 7) return `${days} Tage`;
    if (days === 7) return '1 Woche';
    if (days < 30) return `${Math.round(days / 7)} Wochen`;
    return `${Math.round(days / 30)} Monate`;
  };

  return (
    <div class="animate-fade-in">
      {/* Header - matching your dashboard style */}
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-primary mb-2">Workflow Designer</h1>
          <p class="text-secondary">Gestalte und konfiguriere Workflows für verschiedene Anforderungsarten</p>
          {currentConfig.value && (
            <p class="text-sm text-secondary mt-1">
              Version {currentConfig.value.version} • Zuletzt geändert: {new Date(currentConfig.value.modifiedAt).toLocaleDateString('de-DE')}
            </p>
          )}
        </div>
        
        <div class="flex gap-3">
          <button class="btn btn-secondary" onClick$={validateWorkflow} disabled={isLoading.value}>
            ✅ Validieren
          </button>
          <button class="btn btn-secondary" onClick$={resetWorkflow} disabled={isLoading.value}>
            🔄 Zurücksetzen
          </button>
          <button class="btn btn-primary" onClick$={saveWorkflow} disabled={isLoading.value || isSaving.value}>
            {isSaving.value ? '💾 Speichert...' : '💾 Speichern'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div class="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Step Templates */}
        <div class="col-span-3">
          <div class="card mb-4">
            <div class="card-header">
              <h3>Workflow-Typ</h3>
            </div>
            <div class="card-content">
              <select 
                class="form-input"
                value={selectedWorkflowType.value}
                onChange$={(e) => {
                  selectedWorkflowType.value = (e.target as HTMLSelectElement).value;
                }}
              >
                {workflowTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3>Schritt-Vorlagen</h3>
            </div>
            <div class="card-content">
              <div class="space-y-3">
                {stepTemplates.map(template => (
                  <div 
                    key={template.id}
                    class="template-item"
                    onClick$={() => addNewStep(template)}
                  >
                    <div 
                      class="template-icon"
                      style={`background: ${template.color};`}
                    >
                      {template.icon}
                    </div>
                    <div class="template-content">
                      <h4 class="template-title">{template.title}</h4>
                      <p class="template-description">{template.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div class="card mt-4">
            <div class="card-header">
              <h3>Aktionen</h3>
            </div>
            <div class="card-content">
              <div class="space-y-2">
                <button class="btn btn-secondary w-full" onClick$={exportWorkflow}>
                  📤 Exportieren
                </button>
                <button class="btn btn-secondary w-full" onClick$={importWorkflow}>
                  📥 Importieren
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Designer Area */}
        <div class="col-span-6">
          <div class="card">
            <div class="card-header">
              <h3>Workflow: {selectedWorkflowType.value}</h3>
              <div class="flex gap-2">
                <span class="text-sm text-secondary">
                  {workflowSteps.value.length} Schritte • 
                  {workflowSteps.value.reduce((sum, step) => sum + step.estimatedDays, 0)} Tage geschätzt
                </span>
              </div>
            </div>
            
            <div class="card-content">
              {isLoading.value ? (
                <div class="text-center py-12">
                  <div class="text-4xl mb-4">⏳</div>
                  <p class="text-lg font-medium">Workflow wird geladen...</p>
                </div>
              ) : (
                <div class="workflow-canvas">
                  {workflowSteps.value.map((step, index) => (
                    <div key={step.id} class="workflow-step-container">
                      <div 
                        class={`workflow-step group ${selectedStep.value?.id === step.id ? 'selected' : ''} ${
                          dragOverIndex.value === index ? 'drag-over' : ''
                        }`}
                        draggable
                        onDragStart$={(e) => handleDragStart(e, index)}
                        onDragOver$={(e) => handleDragOver(e, index)}
                        onDragLeave$={handleDragLeave}
                        onDrop$={(e) => handleDrop(e, index)}
                        onClick$={() => selectedStep.value = step}
                      >
                        <div class="workflow-step-header">
                          <div 
                            class="workflow-step-icon"
                            style={`background: ${getStepColor(step.type)};`}
                          >
                            {getStepIcon(step.type)}
                          </div>
                          
                          <div class="workflow-step-content">
                            <h4 class="workflow-step-title">{step.title}</h4>
                            <p class="workflow-step-meta">
                              {step.responsible} • {formatDuration(step.estimatedDays)}
                              {step.required && <span class="required-badge">*</span>}
                            </p>
                            {step.description && (
                              <p class="workflow-step-description">{step.description}</p>
                            )}
                          </div>

                          {/* Actions */}
                          <div class="workflow-step-actions">
                            <button 
                              class="action-btn edit"
                              onClick$={(e) => {
                                e.stopPropagation();
                                selectedStep.value = step;
                                activeTab.value = 'properties';
                              }}
                            >
                              ✏️
                            </button>
                            <button 
                              class="action-btn duplicate"
                              onClick$={(e) => {
                                e.stopPropagation();
                                duplicateStep(step);
                              }}
                            >
                              📋
                            </button>
                            <button 
                              class="action-btn delete"
                              onClick$={(e) => {
                                e.stopPropagation();
                                if (confirm(`Schritt "${step.title}" löschen?`)) {
                                  deleteStep(step.id);
                                }
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        {/* Additional Info */}
                        {(step.branches?.length || step.permissions || step.escalation) && (
                          <div class="workflow-step-details">
                            {step.branches && step.branches.length > 0 && (
                              <div class="detail-item">
                                <span class="detail-icon">🔀</span>
                                <span class="detail-text">{step.branches.length} Verzweigungen</span>
                              </div>
                            )}
                            {step.permissions && (
                              <div class="detail-item">
                                <span class="detail-icon">🔒</span>
                                <span class="detail-text">Berechtigungen konfiguriert</span>
                              </div>
                            )}
                            {step.escalation?.enabled && (
                              <div class="detail-item">
                                <span class="detail-icon">⚠️</span>
                                <span class="detail-text">Eskalation nach {step.escalation.afterDays} Tagen</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Arrow to next step */}
                      {index < workflowSteps.value.length - 1 && (
                        <div class="workflow-arrow">
                          <div class="arrow-line"></div>
                          <div class="arrow-head">↓</div>
                        </div>
                      )}
                    </div>
                  ))}

                  {workflowSteps.value.length === 0 && (
                    <div class="empty-state">
                      <div class="text-4xl mb-4">🎯</div>
                      <h3 class="text-lg font-semibold mb-2">Workflow ist leer</h3>
                      <p class="text-secondary mb-4">
                        Füge Schritte aus den Vorlagen hinzu, um deinen Workflow zu erstellen.
                      </p>
                      <button 
                        class="btn btn-primary"
                        onClick$={() => addNewStep(stepTemplates[0])}
                      >
                        + Ersten Schritt hinzufügen
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div class="col-span-3">
          {selectedStep.value ? (
            <div class="card">
              <div class="card-header">
                <h3>Schritt bearbeiten</h3>
                <button 
                  class="btn btn-sm btn-secondary"
                  onClick$={() => selectedStep.value = null}
                >
                  ✕
                </button>
              </div>
              
              <div class="card-content">
                <div class="form-group">
                  <label class="form-label">Titel</label>
                  <input 
                    type="text" 
                    class="form-input" 
                    value={selectedStep.value.title}
                    onInput$={(e) => {
                      const value = (e.target as HTMLInputElement).value;
                      updateStep(selectedStep.value!.id, { title: value });
                    }}
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Beschreibung</label>
                  <textarea 
                    class="form-input" 
                    rows={3}
                    value={selectedStep.value.description}
                    onInput$={(e) => {
                      const value = (e.target as HTMLTextAreaElement).value;
                      updateStep(selectedStep.value!.id, { description: value });
                    }}
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Typ</label>
                  <select 
                    class="form-input"
                    value={selectedStep.value.type}
                    onChange$={(e) => {
                      const value = (e.target as HTMLSelectElement).value as WorkflowStep['type'];
                      updateStep(selectedStep.value!.id, { type: value });
                    }}
                  >
                    <option value="task">Aufgabe</option>
                    <option value="approval">Genehmigung</option>
                    <option value="decision">Entscheidung</option>
                    <option value="notification">Benachrichtigung</option>
                    <option value="wait">Wartezeit</option>
                    <option value="parallel">Parallel</option>
                    <option value="merge">Zusammenführung</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Verantwortlich</label>
                  <select 
                    class="form-input"
                    value={selectedStep.value.responsible}
                    onChange$={(e) => {
                      const value = (e.target as HTMLSelectElement).value as WorkflowStep['responsible'];
                      updateStep(selectedStep.value!.id, { responsible: value });
                    }}
                  >
                    <option value="AG">Auftraggeber (AG)</option>
                    <option value="AN">Auftragnehmer (AN)</option>
                    <option value="SYSTEM">System</option>
                    <option value="BOTH">Beide</option>
                    <option value="DYNAMIC">Dynamisch</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Geschätzte Dauer (Tage)</label>
                  <input 
                    type="number" 
                    class="form-input" 
                    min="0"
                    step="0.5"
                    value={selectedStep.value.estimatedDays}
                    onInput$={(e) => {
                      const value = parseFloat((e.target as HTMLInputElement).value) || 0;
                      updateStep(selectedStep.value!.id, { estimatedDays: value });
                    }}
                  />
                </div>

                <div class="form-group">
                  <div class="checkbox-group">
                    <input 
                      type="checkbox" 
                      id="required"
                      checked={selectedStep.value.required}
                      onChange$={(e) => {
                        const checked = (e.target as HTMLInputElement).checked;
                        updateStep(selectedStep.value!.id, { required: checked });
                      }}
                    />
                    <label for="required">Erforderlicher Schritt</label>
                  </div>
                </div>

                <div class="form-group">
                  <div class="checkbox-group">
                    <input 
                      type="checkbox" 
                      id="autoAssign"
                      checked={selectedStep.value.autoAssign || false}
                      onChange$={(e) => {
                        const checked = (e.target as HTMLInputElement).checked;
                        updateStep(selectedStep.value!.id, { autoAssign: checked });
                      }}
                    />
                    <label for="autoAssign">Automatische Zuweisung</label>
                  </div>
                </div>

                {/* Permissions Section */}
                {selectedStep.value.permissions && (
                  <div class="form-section">
                    <h4 class="form-section-title">Berechtigungen</h4>
                    <div class="form-group">
                      <label class="form-label">Erlaubte Rollen</label>
                      <input 
                        type="text" 
                        class="form-input" 
                        placeholder="Manager, Approver, TechnicalLead"
                        value={selectedStep.value.permissions.allowedRoles.join(', ')}
                        onInput$={(e) => {
                          const value = (e.target as HTMLInputElement).value;
                          const roles = value.split(',').map(r => r.trim()).filter(r => r);
                          updateStep(selectedStep.value!.id, { 
                            permissions: { 
                              ...selectedStep.value!.permissions!, 
                              allowedRoles: roles 
                            }
                          });
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Branches Section */}
                {selectedStep.value.branches && selectedStep.value.branches.length > 0 && (
                  <div class="form-section">
                    <h4 class="form-section-title">Verzweigungen</h4>
                    {selectedStep.value.branches.map((branch, index) => (
                      <div key={index} class="branch-item">
                        <div class="form-group">
                          <label class="form-label">Bedingung</label>
                          <input 
                            type="text" 
                            class="form-input form-input-sm" 
                            value={branch.condition}
                            readOnly
                          />
                        </div>
                        <div class="form-group">
                          <label class="form-label">Label</label>
                          <input 
                            type="text" 
                            class="form-input form-input-sm" 
                            value={branch.label}
                            readOnly
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Notifications Section */}
                {selectedStep.value.notifications && (
                  <div class="form-section">
                    <h4 class="form-section-title">Benachrichtigungen</h4>
                    <div class="checkbox-group">
                      <input 
                        type="checkbox" 
                        id="notifyStart"
                        checked={selectedStep.value.notifications.onStart}
                        onChange$={(e) => {
                          const checked = (e.target as HTMLInputElement).checked;
                          updateStep(selectedStep.value!.id, { 
                            notifications: { 
                              ...selectedStep.value!.notifications!, 
                              onStart: checked 
                            }
                          });
                        }}
                      />
                      <label for="notifyStart">Bei Start</label>
                    </div>
                    <div class="checkbox-group">
                      <input 
                        type="checkbox" 
                        id="notifyComplete"
                        checked={selectedStep.value.notifications.onComplete}
                        onChange$={(e) => {
                          const checked = (e.target as HTMLInputElement).checked;
                          updateStep(selectedStep.value!.id, { 
                            notifications: { 
                              ...selectedStep.value!.notifications!, 
                              onComplete: checked 
                            }
                          });
                        }}
                      />
                      <label for="notifyComplete">Bei Abschluss</label>
                    </div>
                    <div class="checkbox-group">
                      <input 
                        type="checkbox" 
                        id="notifyOverdue"
                        checked={selectedStep.value.notifications.onOverdue}
                        onChange$={(e) => {
                          const checked = (e.target as HTMLInputElement).checked;
                          updateStep(selectedStep.value!.id, { 
                            notifications: { 
                              ...selectedStep.value!.notifications!, 
                              onOverdue: checked 
                            }
                          });
                        }}
                      />
                      <label for="notifyOverdue">Bei Überschreitung</label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div class="card">
              <div class="card-content text-center py-12">
                <div class="text-4xl mb-4">👆</div>
                <h3 class="text-lg font-semibold mb-2">Schritt auswählen</h3>
                <p class="text-secondary">
                  Klicke auf einen Schritt im Workflow, um ihn zu bearbeiten.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS Styles */}
      <style>{`
        .template-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .template-item:hover {
          background: var(--background-color);
          border-color: var(--primary-color);
        }
        
        .template-icon {
          width: 40px;
          height: 40px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          color: white;
          flex-shrink: 0;
        }
        
        .template-content {
          flex: 1;
          min-width: 0;
        }
        
        .template-title {
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          color: var(--text-color);
        }
        
        .template-description {
          font-size: 0.875rem;
          color: var(--secondary-color);
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .workflow-canvas {
          min-height: 400px;
          padding: 1rem;
        }
        
        .workflow-step-container {
          margin-bottom: 2rem;
        }
        
        .workflow-step {
          border: 2px solid var(--border-color);
          border-radius: 0.75rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .workflow-step:hover {
          border-color: var(--primary-color);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .workflow-step.selected {
          border-color: var(--primary-color);
          background: rgba(59, 130, 246, 0.05);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .workflow-step.drag-over {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }
        
        .workflow-step-header {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
        }
        
        .workflow-step-icon {
          width: 48px;
          height: 48px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .workflow-step-content {
          flex: 1;
          min-width: 0;
        }
        
        .workflow-step-title {
          font-weight: 600;
          font-size: 1.125rem;
          margin: 0 0 0.25rem 0;
          color: var(--text-color);
        }
        
        .workflow-step-meta {
          font-size: 0.875rem;
          color: var(--secondary-color);
          margin: 0 0 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .required-badge {
          color: #ef4444;
          font-weight: 600;
        }
        
        .workflow-step-description {
          font-size: 0.875rem;
          color: var(--text-color);
          margin: 0;
          line-height: 1.4;
        }
        
        .workflow-step-actions {
          opacity: 0;
          display: flex;
          gap: 0.25rem;
          transition: opacity 0.2s ease;
        }
        
        .workflow-step:hover .workflow-step-actions {
          opacity: 1;
        }
        
        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 0.375rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease;
          font-size: 0.875rem;
        }
        
        .action-btn.edit:hover {
          background: rgba(59, 130, 246, 0.1);
        }
        
        .action-btn.duplicate:hover {
          background: rgba(16, 185, 129, 0.1);
        }
        
        .action-btn.delete:hover {
          background: rgba(239, 68, 68, 0.1);
        }
        
        .workflow-step-details {
          border-top: 1px solid var(--border-color);
          padding: 0.75rem 1rem;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--secondary-color);
        }
        
        .detail-icon {
          font-size: 0.875rem;
        }
        
        .workflow-arrow {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 0.5rem 0;
        }
        
        .arrow-line {
          width: 2px;
          height: 20px;
          background: var(--border-color);
        }
        
        .arrow-head {
          color: var(--secondary-color);
          font-size: 1.25rem;
          margin-top: -4px;
        }
        
        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--secondary-color);
        }
        
        .form-section {
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
          margin-top: 1rem;
        }
        
        .form-section-title {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-color);
          margin: 0 0 0.75rem 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .branch-item {
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        
        .checkbox-group input[type="checkbox"] {
          margin: 0;
        }
        
        .checkbox-group label {
          margin: 0;
          font-size: 0.875rem;
          cursor: pointer;
        }
        
        .form-input-sm {
          font-size: 0.875rem;
          padding: 0.5rem;
        }
        
        .space-y-3 > * + * {
          margin-top: 0.75rem;
        }
        
        .space-y-2 > * + * {
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
});