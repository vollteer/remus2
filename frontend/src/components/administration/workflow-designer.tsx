// src/components/administration/workflow-designer.tsx
// Modern Workflow Designer with Advanced Parallelization

import { component$, useSignal, useTask$, $, useStore } from '@builder.io/qwik';
import { WorkflowApiService } from '~/services/api/workflow-api-service';

// Types
interface WorkflowStep {
  id: string;
  title: string;
  type: 'start' | 'task' | 'approval' | 'decision' | 'notification' | 'wait' | 'end';
  responsible: 'AG' | 'AN' | 'system' | 'both';
  description: string;
  estimatedDays: number;
  required: boolean;
  conditions: string[];
  order: number;
  branches?: DecisionBranch[];
  isParallel?: boolean;
  parallelGroup?: string;
  color?: string;
  icon?: string;
}

interface DecisionBranch {
  id: string;
  condition: string;
  label: string;
  targetStepId: string;
  description?: string;
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

interface StepTemplate {
  type: WorkflowStep['type'];
  title: string;
  icon: string;
  color: string;
  description: string;
}

interface DragState {
  isDragging: boolean;
  draggedStep: WorkflowStep | null;
  dragOverStep: string | null;
  dragOverParallelGroup: string | null;
}

// Modern Step Templates with refined icons
const STEP_TEMPLATES: StepTemplate[] = [
  { 
    type: 'start', 
    title: 'Start', 
    icon: '▶', 
    color: 'green', 
    description: 'Workflow-Start'
  },
  { 
    type: 'task', 
    title: 'Aufgabe', 
    icon: '●', 
    color: 'blue', 
    description: 'Arbeitsaufgabe'
  },
  { 
    type: 'approval', 
    title: 'Genehmigung', 
    icon: '✓', 
    color: 'emerald', 
    description: 'Genehmigungsschritt'
  },
  { 
    type: 'decision', 
    title: 'Entscheidung', 
    icon: '◆', 
    color: 'amber', 
    description: 'Verzweigung'
  },
  { 
    type: 'notification', 
    title: 'Benachrichtigung', 
    icon: '✉', 
    color: 'purple', 
    description: 'Nachricht senden'
  },
  { 
    type: 'wait', 
    title: 'Warten', 
    icon: '◐', 
    color: 'gray', 
    description: 'Wartezeit'
  },
  { 
    type: 'end', 
    title: 'Ende', 
    icon: '◼', 
    color: 'slate', 
    description: 'Workflow-Ende'
  }
];

const REQUIREMENT_TYPES = [
  'Kleinanforderung',
  'Großanforderung', 
  'TIA-Anforderung',
  'Supportleistung',
  'Change-Request',
  'Bug-Fix'
];

export const WorkflowDesigner = component$(() => {
  // State Management
  const selectedWorkflowType = useSignal<string>('Kleinanforderung');
  const currentConfig = useSignal<WorkflowConfiguration | null>(null);
  const workflowSteps = useSignal<WorkflowStep[]>([]);
  const selectedStep = useSignal<WorkflowStep | null>(null);
  const selectedSteps = useSignal<string[]>([]);
  const isLoading = useSignal(false);
  const isSaving = useSignal(false);
  const showProperties = useSignal(false);
  const parallelGroups = useSignal<string[]>([]);
  const showParallelMode = useSignal(false);
  
  // Drag and Drop State
  const dragState = useStore<DragState>({
    isDragging: false,
    draggedStep: null,
    dragOverStep: null,
    dragOverParallelGroup: null
  });
  
  // UI State
  const message = useSignal<{ text: string; type: 'success' | 'error' | 'warning' | 'info' }>({ text: '', type: 'info' });
  const sidebarCollapsed = useSignal(false);

  // Load workflow function
  const loadWorkflow = $(async () => {
    isLoading.value = true;
    message.value = { text: '', type: 'info' };
    
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('API Timeout')), 10000);
      });
      
      const config = await Promise.race([
        WorkflowApiService.getWorkflowByType(selectedWorkflowType.value),
        timeoutPromise
      ]);
      
      if (config && config.steps) {
        currentConfig.value = config;
        workflowSteps.value = config.steps.sort((a, b) => a.order - b.order);
        
        const groups = new Set<string>();
        workflowSteps.value.forEach(step => {
          if (step.parallelGroup) groups.add(step.parallelGroup);
        });
        parallelGroups.value = Array.from(groups);
        
        message.value = { text: `${selectedWorkflowType.value} erfolgreich geladen`, type: 'success' };
      } else {
        const startStep: WorkflowStep = {
          id: 'start-1',
          title: 'Start',
          type: 'start',
          responsible: 'system',
          description: 'Workflow-Beginn',
          estimatedDays: 0,
          required: true,
          conditions: [],
          order: 1
        };

        const endStep: WorkflowStep = {
          id: 'end-1',
          title: 'Ende',
          type: 'end',
          responsible: 'system',
          description: 'Workflow-Ende',
          estimatedDays: 0,
          required: true,
          conditions: [],
          order: 999
        };
        
        const emptyConfig: WorkflowConfiguration = {
          id: '',
          type: selectedWorkflowType.value,
          name: `${selectedWorkflowType.value} Workflow`,
          description: '',
          steps: [startStep, endStep],
          isActive: true,
          version: 'v1.0.0'
        };
        
        currentConfig.value = emptyConfig;
        workflowSteps.value = [startStep, endStep];
        parallelGroups.value = [];
        message.value = { text: 'Neuer Workflow erstellt', type: 'info' };
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
      
      const fallbackConfig: WorkflowConfiguration = {
        id: '',
        type: selectedWorkflowType.value,
        name: `${selectedWorkflowType.value} (Offline)`,
        description: 'API nicht verfügbar',
        steps: [],
        isActive: true,
        version: 'v1.0.0'
      };
      
      currentConfig.value = fallbackConfig;
      workflowSteps.value = [];
      parallelGroups.value = [];
      message.value = { text: 'API nicht verfügbar - Offline-Modus', type: 'warning' };
    } finally {
      isLoading.value = false;
    }
  });

  // Load workflow on type change
  useTask$(async ({ track }) => {
    track(() => selectedWorkflowType.value);
    if (isLoading.value) return;
    await loadWorkflow();
  });

  // Save workflow
  const saveWorkflow = $(async () => {
    if (!currentConfig.value) return;
    
    isSaving.value = true;
    try {
      const updatedConfig = {
        ...currentConfig.value,
        steps: workflowSteps.value
      };
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Save Timeout')), 15000);
      });
      
      const saved = await Promise.race([
        WorkflowApiService.saveWorkflowConfiguration(updatedConfig),
        timeoutPromise
      ]);
      
      currentConfig.value = saved;
      message.value = { text: 'Workflow erfolgreich gespeichert', type: 'success' };
    } catch (error) {
      console.error('Error saving workflow:', error);
      
      const updatedConfig = {
        ...currentConfig.value,
        steps: workflowSteps.value,
        modifiedAt: new Date().toISOString()
      };
      currentConfig.value = updatedConfig;
      
      message.value = { text: 'API nicht verfügbar - Lokal gespeichert', type: 'warning' };
    } finally {
      isSaving.value = false;
    }
  });

  // Add step
  const addStep = $((template: StepTemplate) => {
    const existingSteps = workflowSteps.value.length;
    const newStep: WorkflowStep = {
      id: `${template.type}-${Date.now()}`,
      title: template.title,
      type: template.type,
      responsible: template.type === 'start' || template.type === 'end' ? 'system' : 'AG',
      description: template.description,
      estimatedDays: template.type === 'start' || template.type === 'end' ? 0 : 1,
      required: true,
      conditions: [],
      order: existingSteps + 1,
      color: template.color,
      icon: template.icon
    };
    
    workflowSteps.value = [...workflowSteps.value, newStep].sort((a, b) => a.order - b.order);
    selectedStep.value = newStep;
    showProperties.value = true;
  });

  // Update step
  const updateStep = $((updatedStep: WorkflowStep) => {
    workflowSteps.value = workflowSteps.value.map(step =>
      step.id === updatedStep.id ? updatedStep : step
    ).sort((a, b) => a.order - b.order);
    selectedStep.value = updatedStep;
  });

  // Delete step
  const deleteStep = $((stepId: string) => {
    workflowSteps.value = workflowSteps.value.filter(s => s.id !== stepId);
    if (selectedStep.value?.id === stepId) {
      selectedStep.value = null;
      showProperties.value = false;
    }
    selectedSteps.value = selectedSteps.value.filter(id => id !== stepId);
    message.value = { text: 'Schritt gelöscht', type: 'info' };
  });

  // Move step up/down
  const moveStep = $((stepId: string, direction: 'up' | 'down') => {
    const step = workflowSteps.value.find(s => s.id === stepId);
    if (!step) return;

    const newOrder = direction === 'up' ? step.order - 1.5 : step.order + 1.5;
    const updatedStep = { ...step, order: newOrder };
    updateStep(updatedStep);
  });

  // Toggle step selection for parallelization
  const toggleStepSelection = $((stepId: string) => {
    if (selectedSteps.value.includes(stepId)) {
      selectedSteps.value = selectedSteps.value.filter(id => id !== stepId);
    } else {
      selectedSteps.value = [...selectedSteps.value, stepId];
    }
  });

  // Create parallel group
  const createParallelGroup = $(() => {
    const groupNumber = parallelGroups.value.length + 1;
    const groupName = `Gruppe ${groupNumber}`;
    parallelGroups.value = [...parallelGroups.value, groupName];
    
    if (selectedSteps.value.length > 0) {
      workflowSteps.value = workflowSteps.value.map(step => 
        selectedSteps.value.includes(step.id) 
          ? { ...step, parallelGroup: groupName, isParallel: true }
          : step
      );
      selectedSteps.value = [];
      showParallelMode.value = false;
      message.value = { text: `Parallele Gruppe "${groupName}" erstellt mit ${selectedSteps.value.length} Schritten`, type: 'success' };
    } else {
      message.value = { text: 'Parallele Gruppe erstellt - Wähle Schritte und setze die Gruppe', type: 'info' };
    }
  });

  // Assign steps to parallel group
  const assignToParallelGroup = $((groupName: string) => {
    if (selectedSteps.value.length === 0) {
      message.value = { text: 'Keine Schritte ausgewählt', type: 'warning' };
      return;
    }

    workflowSteps.value = workflowSteps.value.map(step => 
      selectedSteps.value.includes(step.id) 
        ? { ...step, parallelGroup: groupName, isParallel: true }
        : step
    );
    
    const count = selectedSteps.value.length;
    selectedSteps.value = [];
    showParallelMode.value = false;
    message.value = { text: `${count} Schritte zu "${groupName}" hinzugefügt`, type: 'success' };
  });

  // Remove from parallel group
  const removeFromParallelGroup = $((stepId: string) => {
    const step = workflowSteps.value.find(s => s.id === stepId);
    if (step) {
      const updatedStep = { ...step, parallelGroup: undefined, isParallel: false };
      updateStep(updatedStep);
      message.value = { text: 'Schritt aus paralleler Gruppe entfernt', type: 'info' };
    }
  });

  // Drag and drop handlers
  const handleDragStart = $((step: WorkflowStep, e: DragEvent) => {
    dragState.isDragging = true;
    dragState.draggedStep = step;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', step.id);
    }
  });

  const handleDragOver = $((e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  });

  const handleDragEnterStep = $((stepId: string) => {
    dragState.dragOverStep = stepId;
    dragState.dragOverParallelGroup = null;
  });

  const handleDragEnterParallelGroup = $((groupName: string) => {
    dragState.dragOverParallelGroup = groupName;
    dragState.dragOverStep = null;
  });

  const handleDragLeave = $(() => {
    dragState.dragOverStep = null;
    dragState.dragOverParallelGroup = null;
  });

  const handleDrop = $((e: DragEvent) => {
    e.preventDefault();
    
    if (!dragState.draggedStep) return;
    
    if (dragState.dragOverParallelGroup) {
      // Drop on parallel group
      const updatedStep = {
        ...dragState.draggedStep,
        parallelGroup: dragState.dragOverParallelGroup,
        isParallel: true
      };
      updateStep(updatedStep);
      message.value = { text: `Schritt zu "${dragState.dragOverParallelGroup}" hinzugefügt`, type: 'success' };
    }
    
    // Reset drag state
    dragState.isDragging = false;
    dragState.draggedStep = null;
    dragState.dragOverStep = null;
    dragState.dragOverParallelGroup = null;
  });

  // Get step colors - simplified and subtle
  const getStepColors = (step: WorkflowStep) => {
    const template = STEP_TEMPLATES.find(t => t.type === step.type);
    const isSelected = selectedStep.value?.id === step.id;
    const isMultiSelected = selectedSteps.value.includes(step.id);
    
    const colorMap = {
      green: isSelected ? 'bg-green-500 text-white' : isMultiSelected ? 'bg-green-100 border-green-300' : 'bg-white hover:bg-green-50 border-green-200',
      blue: isSelected ? 'bg-blue-500 text-white' : isMultiSelected ? 'bg-blue-100 border-blue-300' : 'bg-white hover:bg-blue-50 border-blue-200',
      emerald: isSelected ? 'bg-emerald-500 text-white' : isMultiSelected ? 'bg-emerald-100 border-emerald-300' : 'bg-white hover:bg-emerald-50 border-emerald-200',
      amber: isSelected ? 'bg-amber-500 text-white' : isMultiSelected ? 'bg-amber-100 border-amber-300' : 'bg-white hover:bg-amber-50 border-amber-200',
      purple: isSelected ? 'bg-purple-500 text-white' : isMultiSelected ? 'bg-purple-100 border-purple-300' : 'bg-white hover:bg-purple-50 border-purple-200',
      gray: isSelected ? 'bg-gray-500 text-white' : isMultiSelected ? 'bg-gray-100 border-gray-300' : 'bg-white hover:bg-gray-50 border-gray-200',
      slate: isSelected ? 'bg-slate-500 text-white' : isMultiSelected ? 'bg-slate-100 border-slate-300' : 'bg-white hover:bg-slate-50 border-slate-200'
    };
    
    const colorClass = colorMap[template?.color as keyof typeof colorMap] || colorMap.gray;
    return `${colorClass} shadow-sm hover:shadow-md transition-all duration-200 border`;
  };

  const getIconColors = (template: StepTemplate, isSelected?: boolean) => {
    const colorMap = {
      green: isSelected ? 'text-white' : 'text-green-600 bg-green-100',
      blue: isSelected ? 'text-white' : 'text-blue-600 bg-blue-100',
      emerald: isSelected ? 'text-white' : 'text-emerald-600 bg-emerald-100',
      amber: isSelected ? 'text-white' : 'text-amber-600 bg-amber-100',
      purple: isSelected ? 'text-white' : 'text-purple-600 bg-purple-100',
      gray: isSelected ? 'text-white' : 'text-gray-600 bg-gray-100',
      slate: isSelected ? 'text-white' : 'text-slate-600 bg-slate-100'
    };
    
    return colorMap[template?.color as keyof typeof colorMap] || colorMap.gray;
  };

  return (
    <div class="min-h-screen bg-gray-50 flex flex-col">
      {/* Clean Header */}
      <div class="bg-white border-b border-gray-200">
        <div class="px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-8 h-8 bg-blue-600 flex items-center justify-center">
                <span class="text-white text-sm font-semibold">W</span>
              </div>
              <div>
                <h1 class="text-xl font-semibold text-gray-900">Workflow Designer</h1>
                <p class="text-sm text-gray-600">Moderne Workflow-Erstellung</p>
              </div>
            </div>
            
            <div class="flex items-center space-x-3">
              <select
                value={selectedWorkflowType.value}
                onChange$={(e) => selectedWorkflowType.value = (e.target as HTMLSelectElement).value}
                class="px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
              >
                {REQUIREMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>


              <button
                onClick$={saveWorkflow}
                disabled={isSaving.value}
                class="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 text-sm font-medium transition-colors"
              >
                <span>{isSaving.value ? '⏳' : '💾'}</span>
                <span>{isSaving.value ? 'Speichere...' : 'Speichern'}</span>
              </button>
            </div>
          </div>
          
          {/* Parallel Mode Info */}
          {showParallelMode.value && (
            <div class="mt-3 p-3 bg-indigo-50 text-indigo-800 border border-indigo-200 text-sm">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span>⚡</span>
                  <span>Parallelisierungs-Modus: Klicke auf Schritte um sie auszuwählen</span>
                  {selectedSteps.value.length > 0 && (
                    <span class="bg-indigo-200 text-indigo-800 px-2 py-1 text-xs font-medium">
                      {selectedSteps.value.length} ausgewählt
                    </span>
                  )}
                </div>
                <button
                  onClick$={() => selectedSteps.value = []}
                  class="text-indigo-600 hover:text-indigo-800 text-xs"
                >
                  Auswahl löschen
                </button>
              </div>
            </div>
          )}
          
          {/* Subtle Status Message */}
          {message.value.text && (
            <div class={`mt-3 p-3 text-sm ${
              message.value.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              message.value.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              message.value.type === 'warning' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              <div class="flex items-center space-x-2">
                <span class="text-xs">
                  {message.value.type === 'success' ? '✓' : 
                   message.value.type === 'error' ? '✗' : 
                   message.value.type === 'warning' ? '⚠' : 'ℹ'}
                </span>
                <span>{message.value.text}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div class="flex-1 flex overflow-hidden">
        {/* Simplified Sidebar */}
        <div class={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarCollapsed.value ? 'w-16' : 'w-80'
        }`}>
          <div class="p-4 h-full overflow-y-auto">
            <div class="flex items-center justify-between mb-6">
              <h3 class={`font-medium text-gray-900 transition-all duration-300 ${
                sidebarCollapsed.value ? 'opacity-0 w-0' : 'opacity-100'
              }`}>
                Elemente
              </h3>
              <button
                onClick$={() => sidebarCollapsed.value = !sidebarCollapsed.value}
                class="w-8 h-8 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <span class={`text-sm transition-transform duration-300 ${sidebarCollapsed.value ? 'rotate-180' : ''}`}>
                  {sidebarCollapsed.value ? '▶' : '◀'}
                </span>
              </button>
            </div>
            
            {!sidebarCollapsed.value && (
              <>
                {/* Clean Step Templates */}
                <div class="space-y-2 mb-6">
                  {STEP_TEMPLATES.map(template => (
                    <button
                      key={template.type}
                      onClick$={() => addStep(template)}
                      class="w-full p-3 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 bg-white group"
                    >
                      <div class="flex items-center gap-6">
                        <div class={`w-8 h-8 flex items-center justify-center text-sm ${getIconColors(template)}`}>
                          {template.icon}
                        </div>
                        <div class="text-left flex-1">
                          <h4 class="font-medium text-gray-900 text-sm">{template.title}</h4>
                          <p class="text-xs text-gray-500">{template.description}</p>
                        </div>
                        <div class="text-gray-400 group-hover:text-gray-600 text-sm">+</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Parallel Groups Management */}
                <div class="border-t border-gray-200 pt-4">
                  <h4 class="font-medium text-gray-900 mb-3 text-sm flex items-center space-x-2">
                    <span>⚡</span>
                    <span>Parallelisierung</span>
                  </h4>
                  
                  <button
                    onClick$={() => {
                      if (!showParallelMode.value) {
                        showParallelMode.value = true;
                        selectedSteps.value = [];
                      } else {
                        // If already in parallel mode, create group with selected steps
                        if (selectedSteps.value.length > 0) {
                          createParallelGroup();
                        } else {
                          showParallelMode.value = false;
                        }
                      }
                    }}
                    class={`w-full p-3 text-sm font-medium transition-colors mb-4 ${
                      showParallelMode.value 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    <div class="flex items-center justify-center space-x-2">
                      <span>⚡</span>
                      <span>
                        {showParallelMode.value && selectedSteps.value.length > 0 
                          ? `Gruppe erstellen (${selectedSteps.value.length})` 
                          : showParallelMode.value 
                            ? 'Parallelisierung beenden' 
                            : 'Parallelisierung starten'
                        }
                      </span>
                    </div>
                  </button>
                  
                  {parallelGroups.value.length > 0 && (
                    <div class="space-y-2">
                      <p class="text-xs text-gray-600 mb-2">Gruppen:</p>
                      {parallelGroups.value.map(group => {
                        const stepsInGroup = workflowSteps.value.filter(s => s.parallelGroup === group);
                        return (
                          <div 
                            key={group} 
                            class={`p-3 border-2 border-dashed border-indigo-300 bg-indigo-50 text-indigo-700 text-xs transition-all duration-200 cursor-pointer hover:bg-indigo-100 hover:border-indigo-400 ${
                              dragState.dragOverParallelGroup === group ? 'bg-indigo-200 border-indigo-500 shadow-md' : ''
                            }`}
                            onDragOver$={handleDragOver}
                            onDragEnter$={() => handleDragEnterParallelGroup(group)}
                            onDragLeave$={handleDragLeave}
                            onDrop$={handleDrop}
                            onClick$={() => {
                              if (!showParallelMode.value) {
                                showParallelMode.value = true;
                                selectedSteps.value = [];
                              }
                            }}
                          >
                            <div class="flex items-center justify-between mb-2">
                              <div class="flex items-center space-x-2">
                                <span class="text-lg">📁</span>
                                <span class="font-medium text-sm">{group}</span>
                              </div>
                              <span class="bg-indigo-200 text-indigo-800 px-2 py-1 text-xs font-medium rounded">
                                {stepsInGroup.length}
                              </span>
                            </div>
                            <div class="text-xs text-indigo-600 mb-2">
                              {dragState.isDragging ? '🎯 Hier ablegen' : '👆 Klicken oder Schritte hierher ziehen'}
                            </div>
                            {selectedSteps.value.length > 0 && (
                              <button
                                onClick$={() => assignToParallelGroup(group)}
                                class="w-full text-xs bg-indigo-600 text-white px-2 py-1 hover:bg-indigo-700 transition-colors"
                              >
                                {selectedSteps.value.length} Schritte hinzufügen
                              </button>
                            )}
                            {stepsInGroup.length > 0 && (
                              <div class="mt-1 space-y-1">
                                {stepsInGroup.map(step => (
                                  <div key={step.id} class="flex items-center justify-between text-xs">
                                    <span>{step.title}</span>
                                    <button
                                      onClick$={() => removeFromParallelGroup(step.id)}
                                      class="text-indigo-500 hover:text-red-600 transition-colors"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Clean Workflow Info */}
                {currentConfig.value && (
                  <div class="mt-6 p-4 bg-gray-50 border border-gray-200">
                    <h4 class="font-medium text-gray-900 mb-3 text-sm">Workflow-Info</h4>
                    <div class="space-y-2 text-xs">
                      <div class="flex justify-between">
                        <span class="text-gray-600">Name:</span>
                        <span class="text-gray-900 font-medium">{currentConfig.value.name}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Schritte:</span>
                        <span class="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium">{workflowSteps.value.length}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Status:</span>
                        <span class={`px-2 py-1 text-xs font-medium ${
                          currentConfig.value.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {currentConfig.value.isActive ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Compact Flowchart Area */}
        <div class="flex-1 relative overflow-auto bg-gray-50">
          {isLoading.value ? (
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div class="w-8 h-8 border-2 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4"></div>
                <p class="text-gray-600 text-sm">Lade Workflow...</p>
              </div>
            </div>
          ) : (
            <div class="p-6">
              {workflowSteps.value.length === 0 ? (
                <div class="flex items-center justify-center h-96">
                  <div class="text-center">
                    <div class="text-4xl mb-4 text-gray-400">📋</div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Workflow Designer</h3>
                    <p class="text-gray-600 text-sm max-w-sm">Wähle Workflow-Elemente aus der Seitenleiste, um deinen Workflow zu erstellen.</p>
                  </div>
                </div>
              ) : (
                <div class="max-w-2xl mx-auto space-y-3">
                  {workflowSteps.value.map((step, index) => {
                    const template = STEP_TEMPLATES.find(t => t.type === step.type);
                    const stepColors = getStepColors(step);
                    const isLast = index === workflowSteps.value.length - 1;
                    const isSelected = selectedStep.value?.id === step.id;
                    const isMultiSelected = selectedSteps.value.includes(step.id);
                    
                    return (
                      <div key={step.id} class="space-y-2">
                        {/* Compact Step Card */}
                        <div class="flex items-center justify-center">
                          <div
                            class={`w-full p-3 cursor-pointer transition-all duration-200 ${stepColors} ${
                              dragState.dragOverStep === step.id ? 'ring-2 ring-blue-400' : ''
                            }`}
                            draggable={!showParallelMode.value}
                            onClick$={() => {
                              if (showParallelMode.value) {
                                toggleStepSelection(step.id);
                              } else {
                                selectedStep.value = step;
                                showProperties.value = true;
                              }
                            }}
                            onDragStart$={(e) => handleDragStart(step, e)}
                            onDragOver$={handleDragOver}
                            onDragEnter$={() => handleDragEnterStep(step.id)}
                            onDragLeave$={handleDragLeave}
                            onDrop$={handleDrop}
                          >
                            <div class="flex items-center gap-6">
                              {showParallelMode.value && (
                                <input
                                  type="checkbox"
                                  checked={isMultiSelected}
                                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                              )}
                              
                              <div class="flex-shrink-0">
                                <div class={`w-8 h-8 flex items-center justify-center text-sm ${getIconColors(template!, isSelected)}`}>
                                  {template?.icon || '●'}
                                </div>
                              </div>
                              
                              <div class="flex-1 min-w-0">
                                <h3 class="font-medium text-sm mb-1">{step.title}</h3>
                                <div class="flex items-center gap-4 text-xs text-gray-600">
                                  <span>👤 {step.responsible}</span>
                                  {step.estimatedDays > 0 && (
                                    <span>⏱ {step.estimatedDays}d</span>
                                  )}
                                  {step.required && (
                                    <span class="px-1 py-0.5 bg-red-100 text-red-700 text-xs">Pflicht</span>
                                  )}
                                  {step.parallelGroup && (
                                    <span class="px-1 py-0.5 bg-indigo-100 text-indigo-700 text-xs">⚡ {step.parallelGroup}</span>
                                  )}
                                </div>
                              </div>
                              
                              {!showParallelMode.value && (
                                <div class="flex items-center space-x-1">
                                  <button
                                    onClick$={(e) => {
                                      e.stopPropagation();
                                      moveStep(step.id, 'up');
                                    }}
                                    class="w-6 h-6 hover:bg-gray-100 flex items-center justify-center text-xs transition-colors"
                                    disabled={index === 0}
                                  >
                                    ↑
                                  </button>
                                  <button
                                    onClick$={(e) => {
                                      e.stopPropagation();
                                      moveStep(step.id, 'down');
                                    }}
                                    class="w-6 h-6 hover:bg-gray-100 flex items-center justify-center text-xs transition-colors"
                                    disabled={isLast}
                                  >
                                    ↓
                                  </button>
                                  <button
                                    onClick$={(e) => {
                                      e.stopPropagation();
                                      deleteStep(step.id);
                                    }}
                                    class="w-6 h-6 hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-xs transition-colors"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Simple Flow Arrow */}
                        {!isLast && (
                          <div class="flex justify-center">
                            <div class="w-0.5 h-4 bg-gray-300"></div>
                            <div class="absolute w-0 h-0 border-l-2 border-r-2 border-t-3 border-l-transparent border-r-transparent border-t-gray-400 mt-2"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Parallel Group Panel */}
        {showParallelMode.value && (
          <div class="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div class="p-4">
              <div class="flex items-center justify-between mb-6">
                <h3 class="font-medium text-gray-900">Parallelisierung</h3>
                <button 
                  onClick$={() => {
                    showParallelMode.value = false;
                    selectedSteps.value = [];
                  }}
                  class="w-8 h-8 hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              <div class="space-y-4">
                {/* Selected Steps Overview */}
                <div>
                  <h4 class="font-medium text-gray-900 mb-3 text-sm">Ausgewählte Schritte ({selectedSteps.value.length})</h4>
                  {selectedSteps.value.length === 0 ? (
                    <div class="p-4 border-2 border-dashed border-gray-300 text-center text-gray-500 text-sm">
                      Klicke auf Schritte im Workflow um sie auszuwählen
                    </div>
                  ) : (
                    <div class="space-y-2">
                      {selectedSteps.value.map(stepId => {
                        const step = workflowSteps.value.find(s => s.id === stepId);
                        if (!step) return null;
                        const template = STEP_TEMPLATES.find(t => t.type === step.type);
                        
                        return (
                          <div key={step.id} class="flex items-center gap-3 p-2 bg-blue-50 border border-blue-200">
                            <div class={`w-6 h-6 flex items-center justify-center text-xs ${getIconColors(template!)}`}>
                              {template?.icon || '●'}
                            </div>
                            <span class="flex-1 text-sm font-medium">{step.title}</span>
                            <button
                              onClick$={() => toggleStepSelection(step.id)}
                              class="w-6 h-6 hover:bg-blue-200 flex items-center justify-center text-xs transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {selectedSteps.value.length > 0 && (
                  <div class="space-y-2">
                    <button
                      onClick$={createParallelGroup}
                      class="w-full p-3 bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <div class="flex items-center justify-center space-x-2">
                        <span>💾</span>
                        <span>Neue Gruppe erstellen</span>
                      </div>
                    </button>
                    
                    {parallelGroups.value.length > 0 && (
                      <div>
                        <p class="text-xs text-gray-600 mb-2">Oder zu bestehender Gruppe hinzufügen:</p>
                        {parallelGroups.value.map(group => (
                          <button
                            key={group}
                            onClick$={() => assignToParallelGroup(group)}
                            class="w-full p-2 mb-1 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors text-sm border border-indigo-300"
                          >
                            <div class="flex items-center justify-between">
                              <span>+ zu "{group}"</span>
                              <span class="bg-indigo-200 text-indigo-800 px-2 py-1 text-xs">
                                {workflowSteps.value.filter(s => s.parallelGroup === group).length}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Existing Groups */}
                {parallelGroups.value.length > 0 && (
                  <div class="border-t border-gray-200 pt-4">
                    <h4 class="font-medium text-gray-900 mb-3 text-sm">Bestehende Gruppen</h4>
                    <div class="space-y-2">
                      {parallelGroups.value.map(group => {
                        const stepsInGroup = workflowSteps.value.filter(s => s.parallelGroup === group);
                        return (
                          <div key={group} class="p-3 border border-indigo-200 bg-indigo-50">
                            <div class="flex items-center justify-between mb-2">
                              <span class="font-medium text-indigo-800 text-sm">{group}</span>
                              <span class="bg-indigo-200 text-indigo-800 px-2 py-1 text-xs">
                                {stepsInGroup.length} Schritte
                              </span>
                            </div>
                            <div class="space-y-1">
                              {stepsInGroup.map(step => (
                                <div key={step.id} class="flex items-center justify-between text-xs">
                                  <span class="text-indigo-700">{step.title}</span>
                                  <button
                                    onClick$={() => removeFromParallelGroup(step.id)}
                                    class="text-indigo-500 hover:text-red-600 transition-colors"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Clean Properties Panel */}
        {showProperties.value && selectedStep.value && !showParallelMode.value && (
          <div class="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div class="p-4">
              <div class="flex items-center justify-between mb-6">
                <h3 class="font-medium text-gray-900">Eigenschaften</h3>
                <button 
                  onClick$={() => showProperties.value = false}
                  class="w-8 h-8 hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Titel</label>
                  <input
                    type="text"
                    value={selectedStep.value.title}
                    onInput$={(e) => {
                      const updated = { ...selectedStep.value!, title: (e.target as HTMLInputElement).value };
                      updateStep(updated);
                    }}
                    class="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Schritt-Titel..."
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Typ</label>
                  <select
                    value={selectedStep.value.type}
                    onChange$={(e) => {
                      const updated = { ...selectedStep.value!, type: (e.target as HTMLSelectElement).value as any };
                      updateStep(updated);
                    }}
                    class="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {STEP_TEMPLATES.map(template => (
                      <option key={template.type} value={template.type}>
                        {template.icon} {template.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Verantwortlich</label>
                  <select
                    value={selectedStep.value.responsible}
                    onChange$={(e) => {
                      const updated = { ...selectedStep.value!, responsible: (e.target as HTMLSelectElement).value as any };
                      updateStep(updated);
                    }}
                    class="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="AG">Auftraggeber</option>
                    <option value="AN">Auftragnehmer</option>
                    <option value="system">System</option>
                    <option value="both">Beide</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Beschreibung</label>
                  <textarea
                    value={selectedStep.value.description}
                    onInput$={(e) => {
                      const updated = { ...selectedStep.value!, description: (e.target as HTMLTextAreaElement).value };
                      updateStep(updated);
                    }}
                    rows={3}
                    class="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Beschreibung..."
                  />
                </div>

                {selectedStep.value.type !== 'start' && selectedStep.value.type !== 'end' && (
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Aufwand (Tage)</label>
                    <input
                      type="number"
                      min="0"
                      value={selectedStep.value.estimatedDays}
                      onInput$={(e) => {
                        const updated = { ...selectedStep.value!, estimatedDays: parseInt((e.target as HTMLInputElement).value) || 0 };
                        updateStep(updated);
                      }}
                      class="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div class="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="required"
                    checked={selectedStep.value.required}
                    onChange$={(e) => {
                      const updated = { ...selectedStep.value!, required: (e.target as HTMLInputElement).checked };
                      updateStep(updated);
                    }}
                    class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label for="required" class="text-sm text-gray-700">
                    Pflichtschritt
                  </label>
                </div>

                {/* Parallelization */}
                <div class="border-t border-gray-200 pt-4">
                  <h4 class="font-medium text-gray-900 mb-3 text-sm">Parallelverarbeitung</h4>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Parallel-Gruppe</label>
                    <select
                      value={selectedStep.value.parallelGroup || ''}
                      onChange$={(e) => {
                        const updated = { 
                          ...selectedStep.value!, 
                          parallelGroup: (e.target as HTMLSelectElement).value || undefined,
                          isParallel: !!(e.target as HTMLSelectElement).value
                        };
                        updateStep(updated);
                      }}
                      class="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Keine Parallelisierung</option>
                      {parallelGroups.value.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Decision Branches */}
                {selectedStep.value.type === 'decision' && (
                  <div class="border-t border-gray-200 pt-4">
                    <h4 class="font-medium text-gray-900 mb-3 text-sm">Entscheidungszweige</h4>
                    
                    <div class="space-y-3">
                      {(selectedStep.value.branches || []).map((branch, index) => (
                        <div key={branch.id} class="p-3 border border-gray-200 bg-gray-50">
                          <input
                            type="text"
                            value={branch.label}
                            placeholder="Zweig-Label"
                            class="w-full px-2 py-1 text-sm border border-gray-300 mb-2 bg-white"
                          />
                          <input
                            type="text"
                            value={branch.condition}
                            placeholder="Bedingung"
                            class="w-full px-2 py-1 text-sm border border-gray-300 bg-white"
                          />
                        </div>
                      ))}
                      
                      <button
                        onClick$={() => {
                          const newBranch: DecisionBranch = {
                            id: `branch-${Date.now()}`,
                            condition: '',
                            label: 'Neuer Zweig',
                            targetStepId: '',
                            description: ''
                          };
                          
                          const updated = {
                            ...selectedStep.value!,
                            branches: [...(selectedStep.value!.branches || []), newBranch]
                          };
                          updateStep(updated);
                        }}
                        class="w-full px-3 py-2 text-sm border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors bg-white"
                      >
                        + Zweig hinzufügen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});