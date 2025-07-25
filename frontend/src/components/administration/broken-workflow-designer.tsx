// src/components/administration/workflow-designer.tsx

import { component$, useSignal, useTask$, $, useStore } from '@builder.io/qwik';

// Types (erweitert für parallele Steps)
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
  // NEU: Parallel Step Properties
  isParallel?: boolean;
  parallelGroup?: string;
  parallelPosition?: number;
  canRunInParallel?: boolean;
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

interface StepTemplate {
  id: string;
  title: string;
  type: WorkflowStep['type'];
  icon: string;
  color: string;
  description: string;
}

// NEU: Parallel Group Interface
interface ParallelGroup {
  id: string;
  name: string;
  steps: string[]; // Step IDs
  color: string;
  description?: string;
}

export default component$(() => {
  // Existing signals
  const selectedWorkflowType = useSignal('Kleinanforderung');
  const workflowSteps = useSignal<WorkflowStep[]>([]);
  const selectedStep = useSignal<WorkflowStep | null>(null);
  
  // NEU: Parallel Step Signals
  const selectedSteps = useSignal<string[]>([]);
  const parallelGroups = useSignal<ParallelGroup[]>([]);
  const showParallelMode = useSignal(false);
  const isSelectionMode = useSignal(false);
  
  // Existing drag & drop signals
  const draggedStep = useSignal<WorkflowStep | null>(null);
  const dragOverIndex = useSignal<number | null>(null);

  const workflowTypes = ['Kleinanforderung', 'Großanforderung', 'Änderungsanforderung', 'Notfallanforderung'];

  const stepTemplates: StepTemplate[] = [
    { id: 'task', title: 'Aufgabe', type: 'task', icon: '📋', color: '#3B82F6', description: 'Standard Arbeitsschritt' },
    { id: 'approval', title: 'Genehmigung', type: 'approval', icon: '✅', color: '#10B981', description: 'Freigabe erforderlich' },
    { id: 'decision', title: 'Entscheidung', type: 'decision', icon: '🤔', color: '#F59E0B', description: 'Verzweigung im Workflow' },
    { id: 'notification', title: 'Benachrichtigung', type: 'notification', icon: '📧', color: '#8B5CF6', description: 'Email oder System-Nachricht' },
    { id: 'wait', title: 'Wartezeit', type: 'wait', icon: '⏳', color: '#6B7280', description: 'Zeitverzögerung' },
    { id: 'parallel', title: 'Parallel Split', type: 'parallel', icon: '🔀', color: '#EF4444', description: 'Parallele Bearbeitung starten' },
    { id: 'merge', title: 'Parallel Join', type: 'merge', icon: '🔗', color: '#14B8A6', description: 'Parallele Pfade zusammenführen' }
  ];

  // NEU: Parallel Step Functions
  const toggleSelectionMode = $(() => {
    isSelectionMode.value = !isSelectionMode.value;
    if (!isSelectionMode.value) {
      selectedSteps.value = [];
    }
  });

  const toggleStepSelection = $((stepId: string) => {
    if (!isSelectionMode.value) return;
    
    const currentSelection = selectedSteps.value;
    if (currentSelection.includes(stepId)) {
      selectedSteps.value = currentSelection.filter(id => id !== stepId);
    } else {
      selectedSteps.value = [...currentSelection, stepId];
    }
  });

  const createParallelGroup = $(() => {
    if (selectedSteps.value.length < 2) {
      alert('Mindestens 2 Steps für parallele Gruppe auswählen!');
      return;
    }

    const groupId = `parallel-${Date.now()}`;
    const groupName = `Parallele Gruppe ${parallelGroups.value.length + 1}`;
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#14B8A6'];
    const groupColor = colors[parallelGroups.value.length % colors.length];

    // Neue Parallel Group erstellen
    const newGroup: ParallelGroup = {
      id: groupId,
      name: groupName,
      steps: selectedSteps.value,
      color: groupColor,
      description: `${selectedSteps.value.length} parallele Steps`
    };

    // Steps als parallel markieren
    workflowSteps.value = workflowSteps.value.map(step => {
      if (selectedSteps.value.includes(step.id)) {
        return {
          ...step,
          isParallel: true,
          parallelGroup: groupId,
          parallelPosition: selectedSteps.value.indexOf(step.id),
          canRunInParallel: true
        };
      }
      return step;
    });

    parallelGroups.value = [...parallelGroups.value, newGroup];
    selectedSteps.value = [];
    isSelectionMode.value = false;
    
    alert(`Parallele Gruppe "${groupName}" erstellt! 🔀`);
  });

  const removeParallelGroup = $((groupId: string) => {
    // Steps von parallel zurück zu sequential
    workflowSteps.value = workflowSteps.value.map(step => {
      if (step.parallelGroup === groupId) {
        const { isParallel, parallelGroup, parallelPosition, canRunInParallel, ...cleanStep } = step;
        return cleanStep;
      }
      return step;
    });

    parallelGroups.value = parallelGroups.value.filter(group => group.id !== groupId);
  });

  const getParallelGroupForStep = $((stepId: string) => {
    const step = workflowSteps.value.find(s => s.id === stepId);
    if (!step?.parallelGroup) return null;
    return parallelGroups.value.find(group => group.id === step.parallelGroup);
  });

  // Existing Functions (unchanged)
  const handleDragStart = $((step: WorkflowStep) => {
    draggedStep.value = step;
  });

  const handleDragOver = $((index: number) => {
    dragOverIndex.value = index;
  });

  const handleDrop = $((dropIndex: number) => {
    if (!draggedStep.value) return;

    const draggedStepData = draggedStep.value;
    const currentIndex = workflowSteps.value.findIndex(step => step.id === draggedStepData.id);
    
    if (currentIndex === -1) return;

    const newSteps = [...workflowSteps.value];
    newSteps.splice(currentIndex, 1);
    
    const finalDropIndex = currentIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newSteps.splice(finalDropIndex, 0, draggedStepData);

    workflowSteps.value = newSteps;
    draggedStep.value = null;
    dragOverIndex.value = null;
  });

  const addNewStep = $((template: StepTemplate) => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      title: `Neue ${template.title}`,
      type: template.type,
      responsible: 'AN',
      description: '',
      estimatedDays: 1,
      required: true,
      conditions: [],
      order: workflowSteps.value.length + 1
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
    if (selectedStep.value?.id === stepId) {
      selectedStep.value = null;
    }
  });

  const getStepIcon = (type: WorkflowStep['type']) => {
    const template = stepTemplates.find(t => t.type === type);
    return template?.icon || '📋';
  };

  const getStepColor = (type: WorkflowStep['type']) => {
    const template = stepTemplates.find(t => t.type === type);
    return template?.color || '#3B82F6';
  };

  const saveWorkflow = $(() => {
    const workflowConfig = {
      type: selectedWorkflowType.value,
      steps: workflowSteps.value,
      parallelGroups: parallelGroups.value,
      lastModified: new Date().toISOString()
    };

    console.log('Saving workflow:', workflowConfig);
    alert('Workflow mit parallelen Steps gespeichert! 🎉');
  });

  const duplicateStep = $((step: WorkflowStep) => {
    const stepCopy: WorkflowStep = {
      ...step,
      id: `step-${Date.now()}`,
      title: `${step.title} (Kopie)`,
      isParallel: false,
      parallelGroup: undefined,
      parallelPosition: undefined
    };
    workflowSteps.value = [...workflowSteps.value, stepCopy];
    selectedStep.value = stepCopy;
  });

  // NEU: Render Functions für Parallel Steps
  const renderSequentialStep = $((step: WorkflowStep, index: number) => {
    const isSelected = selectedSteps.value.includes(step.id);
    const isCurrentSelected = selectedStep.value?.id === step.id;
    
    return (
      <div key={step.id} class="workflow-step-container">
        <div
          class={`workflow-step group ${isCurrentSelected ? 'selected' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          onClick$={() => {
            if (isSelectionMode.value) {
              toggleStepSelection(step.id);
            } else {
              selectedStep.value = step;
            }
          }}
          draggable
          onDragStart$={() => handleDragStart(step)}
          onDragOver$={(e) => {
            e.preventDefault();
            handleDragOver(index);
          }}
          onDrop$={() => handleDrop(index)}
        >
          {/* Selection Checkbox */}
          {isSelectionMode.value && (
            <div class="absolute top-2 left-2 z-10">
              <input
                type="checkbox"
                checked={isSelected}
                class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                onChange$={() => toggleStepSelection(step.id)}
              />
            </div>
          )}

          <div class="workflow-step-header">
            <div 
              class="workflow-step-icon"
              style={`background-color: ${getStepColor(step.type)}`}
            >
              {getStepIcon(step.type)}
            </div>
            
            <div class="workflow-step-content">
              <h4 class="workflow-step-title">{step.title}</h4>
              <div class="workflow-step-meta">
                <span class={`badge ${step.responsible === 'AG' ? 'badge-blue' : step.responsible === 'AN' ? 'badge-green' : 'badge-gray'}`}>
                  {step.responsible}
                </span>
                <span class="badge badge-outline">
                  {step.estimatedDays} Tag{step.estimatedDays !== 1 ? 'e' : ''}
                </span>
              </div>
            </div>

            <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button 
                class="p-1 text-blue-600 hover:bg-blue-100 rounded"
                onClick$={() => selectedStep.value = step}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button 
                class="p-1 text-red-600 hover:bg-red-100 rounded"
                onClick$={() => deleteStep(step.id)}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  });

  const renderParallelGroup = $((group: ParallelGroup, groupIndex: number) => {
    const groupSteps = workflowSteps.value.filter(step => 
      group.steps.includes(step.id)
    ).sort((a, b) => (a.parallelPosition || 0) - (b.parallelPosition || 0));

    return (
      <div key={group.id} class="parallel-group-container mb-6">
        {/* Parallel Group Header */}
        <div class="parallel-group-header">
          <div class="flex items-center gap-3">
            <div 
              class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
              style={`background-color: ${group.color}`}
            >
              🔀
            </div>
            <div>
              <h4 class="font-semibold text-gray-900">{group.name}</h4>
              <p class="text-sm text-gray-600">{group.steps.length} parallele Steps</p>
            </div>
          </div>
          <button 
            class="text-red-600 hover:text-red-800"
            onClick$={() => removeParallelGroup(group.id)}
            title="Parallele Gruppe auflösen"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Parallel Steps Grid */}
        <div class="parallel-steps-grid">
          {groupSteps.map((step, stepIndex) => (
            <div key={step.id} class="parallel-step-wrapper">
              <div
                class={`workflow-step parallel-step group ${selectedStep.value?.id === step.id ? 'selected' : ''}`}
                onClick$={() => selectedStep.value = step}
                style={`border-left: 4px solid ${group.color}`}
              >
                <div class="workflow-step-header">
                  <div 
                    class="workflow-step-icon"
                    style={`background-color: ${getStepColor(step.type)}`}
                  >
                    {getStepIcon(step.type)}
                  </div>
                  
                  <div class="workflow-step-content">
                    <h4 class="workflow-step-title">{step.title}</h4>
                    <div class="workflow-step-meta">
                      <span class={`badge ${step.responsible === 'AG' ? 'badge-blue' : step.responsible === 'AN' ? 'badge-green' : 'badge-gray'}`}>
                        {step.responsible}
                      </span>
                      <span class="badge badge-outline">
                        {step.estimatedDays} Tag{step.estimatedDays !== 1 ? 'e' : ''}
                      </span>
                      <span class="badge badge-yellow">
                        Parallel
                      </span>
                    </div>
                  </div>

                  <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button 
                      class="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      onClick$={() => selectedStep.value = step}
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Merge Arrow */}
        <div class="parallel-merge-arrow">
          <div class="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white">
            🔗
          </div>
          <span class="text-sm text-gray-600 ml-2">Zusammenführung</span>
        </div>
      </div>
    );
  });

  return (
    <div class="min-h-screen bg-gray-50">
      {/* Header */}
      <div class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Workflow Designer</h1>
            <p class="text-gray-600 mt-1">Gestalte und konfiguriere Workflows mit parallelen Steps</p>
          </div>
          <div class="flex gap-3">
            <button 
              class={`btn ${isSelectionMode.value ? 'btn-primary' : 'btn-secondary'}`}
              onClick$={toggleSelectionMode}
            >
              {isSelectionMode.value ? '✅ Auswahl beenden' : '🔀 Parallel Steps auswählen'}
            </button>
            {selectedSteps.value.length >= 2 && (
              <button 
                class="btn btn-success"
                onClick$={createParallelGroup}
              >
                🔀 Parallele Gruppe erstellen ({selectedSteps.value.length})
              </button>
            )}
            <button class="btn btn-secondary">Vorschau</button>
            <button class="btn btn-primary" onClick$={saveWorkflow}>
              💾 Speichern
            </button>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 py-6">
        <div class="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Step Templates */}
          <div class="col-span-3">
            <div class="bg-white rounded-lg shadow p-6 mb-4">
              <h3 class="text-lg font-semibold mb-4">Workflow-Typ</h3>
              <select 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                bind:value={selectedWorkflowType}
              >
                {workflowTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div class="bg-white rounded-lg shadow p-6 mb-4">
              <h3 class="text-lg font-semibold mb-4">Schritt-Vorlagen</h3>
              <div class="space-y-2">
                {stepTemplates.map((template) => (
                  <button
                    key={template.id}
                    class="w-full flex items-center gap-3 p-3 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    onClick$={() => addNewStep(template)}
                  >
                    <div 
                      class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                      style={`background-color: ${template.color}`}
                    >
                      {template.icon}
                    </div>
                    <span class="font-medium text-gray-700 group-hover:text-blue-700">
                      {template.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* NEU: Parallel Groups Overview */}
            {parallelGroups.value.length > 0 && (
              <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-4">Parallele Gruppen</h3>
                <div class="space-y-2">
                  {parallelGroups.value.map(group => (
                    <div key={group.id} class="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <div 
                        class="w-6 h-6 rounded flex items-center justify-center text-white text-xs"
                        style={`background-color: ${group.color}`}
                      >
                        🔀
                      </div>
                      <div class="flex-1">
                        <div class="font-medium text-sm">{group.name}</div>
                        <div class="text-xs text-gray-600">{group.steps.length} Steps</div>
                      </div>
                      <button 
                        class="text-red-600 hover:text-red-800"
                        onClick$={() => removeParallelGroup(group.id)}
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Center - Workflow Canvas */}
          <div class="col-span-6">
            <div class="bg-white rounded-lg shadow">
              <div class="p-6 border-b">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-semibold">Workflow: {selectedWorkflowType.value}</h3>
                    <p class="text-sm text-gray-600 mt-1">
                      {workflowSteps.value.length} Schritte, {parallelGroups.value.length} parallele Gruppen
                    </p>
                  </div>
                  {isSelectionMode.value && (
                    <div class="bg-blue-50 px-3 py-1 rounded-full text-sm text-blue-700">
                      {selectedSteps.value.length} Steps ausgewählt
                    </div>
                  )}
                </div>
              </div>
              
              <div class="p-6 workflow-canvas">
                {workflowSteps.value.length === 0 ? (
                  <div class="text-center py-12 text-gray-500">
                    <div class="text-6xl mb-4">⚡</div>
                    <h3 class="text-lg font-semibold mb-2">Workflow ist leer</h3>
                    <p>Füge Steps aus der linken Sidebar hinzu um zu starten.</p>
                  </div>
                ) : (
                  <div class="workflow-steps">
                    {(() => {
                      const processedSteps = new Set<string>();
                      const elements: any[] = [];
                      
                      workflowSteps.value.forEach((step, index) => {
                        if (processedSteps.has(step.id)) return;
                        
                        if (step.isParallel && step.parallelGroup) {
                          const group = parallelGroups.value.find(g => g.id === step.parallelGroup);
                          if (group) {
                            // Alle Steps der Gruppe als verarbeitet markieren
                            group.steps.forEach(stepId => processedSteps.add(stepId));
                            
                            elements.push(renderParallelGroup(group, index));
                          }
                        } else {
                          processedSteps.add(step.id);
                          elements.push(renderSequentialStep(step, index));
                          
                          // Arrow to next step/group
                          if (index < workflowSteps.value.length - 1) {
                            elements.push(
                              <div key={`arrow-${step.id}`} class="flex justify-center mt-4 mb-4">
                                <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                  <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                  </svg>
                                </div>
                              </div>
                            );
                          }
                        }
                      });
                      
                      return elements;
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Step Editor */}
          <div class="col-span-3">
            {selectedStep.value ? (
              <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold">Step bearbeiten</h3>
                  <button 
                    class="text-gray-400 hover:text-gray-600"
                    onClick$={() => selectedStep.value = null}
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                    <input
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      bind:value={selectedStep.value.title}
                      onInput$={(e) => updateStep(selectedStep.value!.id, { title: (e.target as HTMLInputElement).value })}
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                    <textarea
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      bind:value={selectedStep.value.description}
                      onInput$={(e) => updateStep(selectedStep.value!.id, { description: (e.target as HTMLTextAreaElement).value })}
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Verantwortlich</label>
                    <select
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      bind:value={selectedStep.value.responsible}
                      onChange$={(e) => updateStep(selectedStep.value!.id, { responsible: (e.target as HTMLSelectElement).value as any })}
                    >
                      <option value="AG">Auftraggeber (AG)</option>
                      <option value="AN">Auftragnehmer (AN)</option>
                      <option value="SYSTEM">System</option>
                      <option value="BOTH">Beide</option>
                      <option value="DYNAMIC">Dynamisch</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Geschätzte Tage</label>
                    <input
                      type="number"
                      min="1"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      bind:value={selectedStep.value.estimatedDays}
                      onInput$={(e) => updateStep(selectedStep.value!.id, { estimatedDays: parseInt((e.target as HTMLInputElement).value) })}
                    />
                  </div>

                  {/* NEU: Parallel Options */}
                  {selectedStep.value.isParallel && (
                    <div class="bg-blue-50 p-3 rounded-lg">
                      <h4 class="font-medium text-blue-900 mb-2">🔀 Paralleler Step</h4>
                      <p class="text-sm text-blue-700">
                        Dieser Step läuft parallel in Gruppe: {
                          parallelGroups.value.find(g => g.id === selectedStep.value?.parallelGroup)?.name || 'Unbekannt'
                        }
                      </p>
                      <div class="mt-2">
                        <label class="flex items-center">
                          <input
                            type="checkbox"
                            class="mr-2"
                            checked={selectedStep.value.canRunInParallel}
                            onChange$={(e) => updateStep(selectedStep.value!.id, { canRunInParallel: (e.target as HTMLInputElement).checked })}
                          />
                          <span class="text-sm text-blue-700">Kann parallel ausgeführt werden</span>
                        </label>
                      </div>
                    </div>
                  )}

                  <div class="flex gap-2 pt-4">
                    <button 
                      class="flex-1 btn btn-secondary"
                      onClick$={() => duplicateStep(selectedStep.value!)}
                    >
                      📋 Duplizieren
                    </button>
                    <button 
                      class="flex-1 btn btn-danger"
                      onClick$={() => deleteStep(selectedStep.value!.id)}
                    >
                      🗑️ Löschen
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div class="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                <div class="text-4xl mb-4">👆</div>
                <p>Wähle einen Step aus um ihn zu bearbeiten</p>
                {isSelectionMode.value && (
                  <p class="text-sm mt-2 text-blue-600">
                    Oder wähle mehrere Steps für parallele Bearbeitung aus
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .workflow-step-container {
          margin-bottom: 1rem;
        }

        .workflow-step {
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .workflow-step:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .workflow-step.selected {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
          color: #111827;
        }

        .workflow-step-meta {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .badge-blue { background: #dbeafe; color: #1e40af; }
        .badge-green { background: #d1fae5; color: #065f46; }
        .badge-gray { background: #f3f4f6; color: #374151; }
        .badge-yellow { background: #fef3c7; color: #92400e; }
        .badge-outline { background: white; color: #6b7280; border: 1px solid #d1d5db; }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          border: 1px solid transparent;
          cursor: pointer;
        }

        .btn-primary { background: #3b82f6; color: white; }
        .btn-primary:hover { background: #2563eb; }
        .btn-secondary { background: #f3f4f6; color: #374151; }
        .btn-secondary:hover { background: #e5e7eb; }
        .btn-success { background: #10b981; color: white; }
        .btn-success:hover { background: #059669; }
        .btn-danger { background: #ef4444; color: white; }
        .btn-danger:hover { background: #dc2626; }

        /* NEU: Parallel Group Styles */
        .parallel-group-container {
          border: 2px solid #e5e7eb;
          border-radius: 1rem;
          background: #fafafa;
          margin-bottom: 2rem;
        }

        .parallel-group-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          background: white;
          border-radius: 1rem 1rem 0 0;
        }

        .parallel-steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
          padding: 1rem;
        }

        .parallel-step-wrapper {
          position: relative;
        }

        .parallel-step {
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .parallel-merge-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
          background: white;
          border-radius: 0 0 1rem 1rem;
        }

        .workflow-canvas {
          min-height: 400px;
        }
      `}</style>
    </div>
  );
});
