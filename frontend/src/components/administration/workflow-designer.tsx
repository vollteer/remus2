// =======================================================
// src/components/administration/workflow-designer.tsx
// 🎨 Moderner Workflow Designer - Saubere JSX Syntax
// =======================================================

import { component$, useSignal, useTask$, $, useComputed$ } from '@builder.io/qwik';
import { RealWorkflowApiService } from '~/services/api/workflow-api-service';

// ================ INTERFACES ================

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

interface WorkflowStep {
  id: string;
  title: string;
  type: 'task' | 'approval' | 'decision' | 'notification' | 'wait';
  responsible: 'AG' | 'AN' | 'SYSTEM' | 'BOTH';
  description: string;
  estimatedDays: number;
  required: boolean;
  conditions: any[];
  order: number;
  permissions?: any;
  branches?: any[];
  formBinding?: string;
  autoAssign?: boolean;
  escalation?: any;
  notifications?: any;
  isParallel?: boolean;
  parallelGroup?: string;
  parallelPosition?: number;
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

interface ParallelGroup {
  id: string;
  name: string;
  steps: string[];
  color: string;
}

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: number;
}

// ================ MAIN COMPONENT ================

export const WorkflowDesigner = component$(() => {
  
  // ================ STATE ================
  
  const selectedWorkflowType = useSignal('Kleinanforderung');
  const workflowSteps = useSignal<WorkflowStep[]>([]);
  const selectedStep = useSignal<WorkflowStep | null>(null);
  const currentConfig = useSignal<WorkflowConfiguration | null>(null);
  const isLoading = useSignal(false);
  const isSaving = useSignal(false);
  const activeTab = useSignal<'designer' | 'properties' | 'preview' | 'export'>('designer');
  
  const draggedStep = useSignal<number | null>(null);
  const dragOverIndex = useSignal<number | null>(null);
  const dragOverParallelGroup = useSignal<string | null>(null);
  
  const selectedSteps = useSignal<string[]>([]);
  const parallelGroups = useSignal<ParallelGroup[]>([]);
  const isSelectionMode = useSignal(false);
  
  const toastMessages = useSignal<ToastMessage[]>([]);

  const selectionCount = useComputed$(() => selectedSteps.value.length);

  // ================ CONFIGURATION ================
  
  const workflowTypes = [
    'Kleinanforderung', 'Großanforderung', 'TIA-Anforderung',
    'Supportleistung', 'Betriebsauftrag', 'SBBI-Lösung',
    'AWG-Release', 'AWS-Release'
  ];

  const stepTemplates: StepTemplate[] = [
    {
      id: 'template-task',
      title: 'Aufgabe',
      type: 'task',
      icon: '📋',
      color: '#3b82f6',
      description: 'Standard Arbeitsschritt'
    },
    {
      id: 'template-approval',
      title: 'Genehmigung',
      type: 'approval',
      icon: '✅',
      color: '#10b981',
      description: 'Genehmigungsschritt'
    },
    {
      id: 'template-decision',
      title: 'Entscheidung',
      type: 'decision',
      icon: '❓',
      color: '#f59e0b',
      description: 'Entscheidungsknoten'
    },
    {
      id: 'template-notification',
      title: 'Benachrichtigung',
      type: 'notification',
      icon: '📧',
      color: '#8b5cf6',
      description: 'Automatische Benachrichtigung'
    },
    {
      id: 'template-wait',
      title: 'Wartezeit',
      type: 'wait',
      icon: '⏰',
      color: '#6b7280',
      description: 'Warteschritt mit Timer'
    }
  ];

  // ================ TOAST FUNCTIONS ================

  const showToastMessage = $((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastMessage = {
      id,
      message,
      type,
      timestamp: Date.now()
    };

    toastMessages.value = [...toastMessages.value, newToast];

    const duration = type === 'error' ? 6000 : 4000;
    setTimeout(() => {
      toastMessages.value = toastMessages.value.filter(t => t.id !== id);
    }, duration);
  });

  const removeToast = $((toastId: string) => {
    toastMessages.value = toastMessages.value.filter(t => t.id !== toastId);
  });

  // ================ API FUNCTIONS ================

  const loadWorkflow = $(async (workflowType: string) => {
    isLoading.value = true;
    try {
      console.log(`🔄 Loading workflow: ${workflowType}`);
      
      const config = await RealWorkflowApiService.getWorkflowByType(workflowType);
      
      if (config) {
        console.log('✅ Loaded config from API:', config);
        currentConfig.value = config;
        workflowSteps.value = [...config.steps];
        console.log(`Workflow "${workflowType}" geladen mit ${config.steps.length} Steps`);
      } else {
        console.log(`ℹ️ Kein Workflow für "${workflowType}" gefunden, erstelle leeren`);
        const emptyConfig: WorkflowConfiguration = {
          id: '',
          type: workflowType,
          name: `Workflow für ${workflowType}`,
          description: `Standard-Workflow für ${workflowType}`,
          steps: [],
          isActive: true,
          version: 1,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          createdBy: 'System'
        };
        currentConfig.value = emptyConfig;
        workflowSteps.value = [];
      }
    } catch (error) {
      console.error('💥 Error loading workflow:', error);
      currentConfig.value = {
        id: '',
        type: workflowType,
        name: `Workflow für ${workflowType}`,
        description: `Standard-Workflow für ${workflowType}`,
        steps: [],
        isActive: true,
        version: 1,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        createdBy: 'System'
      };
      workflowSteps.value = [];
      showToastMessage(`Fehler beim Laden: ${error.message}`, 'error');
    } finally {
      isLoading.value = false;
    }
  });

  const saveWorkflow = $(async () => {
    if (workflowSteps.value.length === 0) {
      showToastMessage('Kein Workflow zum Speichern vorhanden!', 'error');
      return;
    }

    isSaving.value = true;
    try {
      console.log('🚀 Starting save process...');
      
      const stepsWithValidIds = workflowSteps.value.map(step => ({
        ...step,
        id: step.id || `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));

      const workflowConfig: WorkflowConfiguration = {
        id: currentConfig.value?.id || '',
        type: selectedWorkflowType.value,
        name: `${selectedWorkflowType.value} Workflow`,
        description: `Workflow für ${selectedWorkflowType.value}`,
        steps: stepsWithValidIds,
        isActive: true,
        version: (currentConfig.value?.version || 0) + 1,
        createdAt: currentConfig.value?.createdAt || new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        createdBy: currentConfig.value?.createdBy || 'System'
      };

      console.log('💾 Saving workflow config:', workflowConfig);

      const savedConfig = await RealWorkflowApiService.saveWorkflowConfiguration(workflowConfig);
      
      currentConfig.value = savedConfig;
      workflowSteps.value = savedConfig.steps;
      
      console.log('🎉 Workflow saved successfully!');
      showToastMessage('Workflow erfolgreich gespeichert!', 'success');

    } catch (error) {
      console.error('💥 Save error:', error);
      showToastMessage(`Fehler beim Speichern: ${error.message}`, 'error');
    } finally {
      isSaving.value = false;
    }
  });

  const validateWorkflow = $(async () => {
    if (!currentConfig.value) return;

    try {
      const validation = await RealWorkflowApiService.validateWorkflow(currentConfig.value);
      
      if (validation.isValid) {
        showToastMessage('Workflow ist valid!', 'success');
      } else {
        const errorMessage = `Validierungsfehler: ${validation.errors.join(', ')}`;
        showToastMessage(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error validating workflow:', error);
      showToastMessage(`Validierungsfehler: ${error.message}`, 'error');
    }
  });

  const resetWorkflow = $(async () => {
    if (typeof window !== 'undefined' && !window.confirm('Workflow zurücksetzen? Alle Änderungen gehen verloren!')) return;

    try {
      const resetConfig = await RealWorkflowApiService.resetWorkflowToDefault(selectedWorkflowType.value);
      
      if (resetConfig) {
        currentConfig.value = resetConfig;
        workflowSteps.value = [...resetConfig.steps];
        selectedStep.value = null;
        showToastMessage('Workflow wurde auf Standard zurückgesetzt!', 'success');
      } else {
        await loadWorkflow(selectedWorkflowType.value);
        showToastMessage('Kein Standard-Template gefunden. Leerer Workflow erstellt.', 'info');
      }
    } catch (error) {
      console.error('Error resetting workflow:', error);
      showToastMessage(`Fehler beim Zurücksetzen: ${error.message}`, 'error');
    }
  });

  // ================ STEP MANAGEMENT ================

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

  // ================ PARALLEL PROCESSING ================

  const createParallelGroup = $(() => {
    const selectedIds = selectedSteps.value;
    
    if (selectedIds.length < 2) {
      showToastMessage('Mindestens 2 Steps für parallele Gruppe auswählen!', 'warning');
      return;
    }

    const selectedSteps_actual = workflowSteps.value.filter(step => 
      selectedIds.includes(step.id) && !step.isParallel
    );

    if (selectedSteps_actual.length < 2) {
      showToastMessage('Bereits parallele Steps können nicht nochmal parallelisiert werden!', 'error');
      return;
    }

    const groupId = `group-${Date.now()}`;
    const groupName = `Parallele Gruppe ${parallelGroups.value.length + 1}`;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const groupColor = colors[parallelGroups.value.length % colors.length];

    workflowSteps.value = workflowSteps.value.map(step => {
      if (selectedIds.includes(step.id)) {
        return {
          ...step,
          isParallel: true,
          parallelGroup: groupId,
          parallelPosition: selectedIds.indexOf(step.id)
        };
      }
      return step;
    });

    const newGroup: ParallelGroup = {
      id: groupId,
      name: groupName,
      steps: selectedIds,
      color: groupColor
    };

    parallelGroups.value = [...parallelGroups.value, newGroup];
    selectedSteps.value = [];
    isSelectionMode.value = false;

    console.log('🔀 Created parallel group:', newGroup);
    showToastMessage(`Parallele Gruppe "${groupName}" erstellt!`, 'success');
  });

  const removeFromParallelGroup = $((stepId: string) => {
    const step = workflowSteps.value.find(s => s.id === stepId);
    if (!step?.isParallel) return;

    console.log('🔀 Removing step from parallel group:', stepId);

    const updatedSteps = workflowSteps.value.map(s => {
      if (s.id === stepId) {
        return {
          ...s,
          isParallel: false,
          parallelGroup: undefined,
          parallelPosition: undefined
        };
      }
      return s;
    });

    const updatedGroups = parallelGroups.value.map(group => {
      if (group.steps.includes(stepId)) {
        return {
          ...group,
          steps: group.steps.filter(id => id !== stepId)
        };
      }
      return group;
    }).filter(group => group.steps.length > 0);

    workflowSteps.value = updatedSteps;
    parallelGroups.value = updatedGroups;
    
    console.log('🔀 Step removed from parallel group successfully');
  });

  // ================ DRAG & DROP ================

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
    dragOverParallelGroup.value = null;
  });

  const handleDrop = $((event: DragEvent, dropIndex: number) => {
    event.preventDefault();
    if (draggedStep.value === null) return;

    const newSteps = [...workflowSteps.value];
    const draggedStepData = newSteps[draggedStep.value];

    newSteps.splice(draggedStep.value, 1);
    const finalDropIndex = draggedStep.value < dropIndex ? dropIndex - 1 : dropIndex;
    newSteps.splice(finalDropIndex, 0, draggedStepData);

    newSteps.forEach((step, index) => {
      step.order = index + 1;
    });

    workflowSteps.value = newSteps;
    draggedStep.value = null;
    dragOverIndex.value = null;
  });

  // ================ HELPER FUNCTIONS ================

  const getStepIcon = (type: WorkflowStep['type']) => {
    const template = stepTemplates.find(t => t.type === type);
    return template?.icon || '📋';
  };

  const getStepColor = (type: WorkflowStep['type']) => {
    const template = stepTemplates.find(t => t.type === type);
    return template?.color || '#3b82f6';
  };

  const formatDuration = (days: number) => {
    if (days === 1) return '1 Tag';
    if (days < 7) return `${days} Tage`;
    if (days === 7) return '1 Woche';
    if (days < 30) return `${Math.round(days / 7)} Wochen`;
    return `${Math.round(days / 30)} Monate`;
  };

  // ================ LIFECYCLE ================

  useTask$(async ({ track }) => {
    track(() => selectedWorkflowType.value);
    await loadWorkflow(selectedWorkflowType.value);
  });

  // ================ TOAST COMPONENTS ================

  const renderToasts = () => {
    return toastMessages.value.map(toast => {
      const bgColors = {
        success: 'from-emerald-500 to-emerald-600',
        error: 'from-red-500 to-red-600',
        warning: 'from-amber-500 to-amber-600',
        info: 'from-blue-500 to-blue-600'
      };

      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      };

      return (
        <div
          key={toast.id}
          class={`bg-gradient-to-r ${bgColors[toast.type]} text-white px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm max-w-sm transform transition-all duration-500 border border-white/20`}
        >
          <div class="flex items-center">
            <div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3 text-sm font-bold">
              {icons[toast.type]}
            </div>
            <span class="text-sm font-medium flex-1">{toast.message}</span>
            <button
              class="ml-3 w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              onClick$={() => removeToast(toast.id)}
            >
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>
      );
    });
  };

  // ================ STEP COMPONENTS ================

  const renderStepCard = (step: WorkflowStep, index: number) => {
    const group = step.isParallel ? parallelGroups.value.find(g => g.id === step.parallelGroup) : null;
    const borderColor = group ? group.color : '';
    
    const baseClasses = "group relative p-5 rounded-2xl transition-all duration-200 cursor-pointer";
    const selectedClasses = selectedStep.value?.id === step.id ? 'bg-blue-50/80 border-2 border-blue-300 shadow-lg transform scale-102' : '';
    const parallelClasses = step.isParallel ? 'bg-white/80 border-2 border-gray-200/60' : 'bg-white/60 border-2 border-gray-200/40 hover:bg-white/80 hover:border-gray-300 hover:shadow-lg';
    const dragClasses = dragOverIndex.value === index ? 'border-blue-500 bg-blue-100/60 shadow-xl transform scale-105' : '';
    const selectionClasses = isSelectionMode.value && !step.isParallel 
      ? selectedSteps.value.includes(step.id)
        ? 'ring-4 ring-blue-300/50 bg-blue-100/60 transform scale-102'
        : 'hover:ring-4 hover:ring-blue-200/30'
      : '';

    const cardStyle = step.isParallel 
      ? `border-left: 6px solid ${borderColor}; background: linear-gradient(135deg, ${borderColor}08, transparent)` 
      : '';

    return (
      <div
        key={step.id}
        class={`${baseClasses} ${selectedClasses || parallelClasses} ${dragClasses} ${selectionClasses}`}
        style={cardStyle}
        draggable={!isSelectionMode.value}
        onDragStart$={(e) => handleDragStart(e, index)}
        onDragOver$={(e) => handleDragOver(e, index)}
        onDragLeave$={handleDragLeave}
        onDrop$={(e) => handleDrop(e, index)}
        onClick$={() => {
          if (isSelectionMode.value && !step.isParallel) {
            const isSelected = selectedSteps.value.includes(step.id);
            if (isSelected) {
              selectedSteps.value = selectedSteps.value.filter(id => id !== step.id);
            } else {
              selectedSteps.value = [...selectedSteps.value, step.id];
            }
          } else {
            selectedStep.value = step;
          }
        }}
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center text-sm font-bold text-gray-700 group-hover:from-blue-100 group-hover:to-blue-200 group-hover:text-blue-700 transition-all duration-200">
              {step.order}
            </div>
            <div class="flex items-center space-x-3">
              <div 
                class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" 
                style={`background: linear-gradient(135deg, ${getStepColor(step.type)}20, ${getStepColor(step.type)}10); color: ${getStepColor(step.type)}`}
              >
                {getStepIcon(step.type)}
              </div>
              <div>
                <h4 class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {step.title}
                </h4>
                <p class="text-sm text-gray-500 flex items-center space-x-2">
                  <span class="inline-flex items-center space-x-1">
                    <div class="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span>{step.responsible}</span>
                  </span>
                  <span>•</span>
                  <span class="inline-flex items-center space-x-1">
                    <div class="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    <span>{formatDuration(step.estimatedDays)}</span>
                  </span>
                </p>
              </div>
            </div>
          </div>
          
          <div class="flex items-center space-x-3">
            {step.isParallel && (
              <div class="flex items-center space-x-2">
                <span 
                  class="inline-flex items-center px-3 py-1.5 text-white text-xs font-medium rounded-xl shadow-sm"
                  style={`background: linear-gradient(135deg, ${group?.color || '#8b5cf6'}, ${group?.color || '#8b5cf6'}dd)`}
                >
                  <span class="mr-1.5">🔀</span>
                  {group?.name || 'Parallele Gruppe'}
                </span>
                <button
                  class="w-8 h-8 bg-white/80 hover:bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-purple-600 transition-all duration-200 hover:shadow-md"
                  onClick$={(e) => {
                    e.stopPropagation();
                    removeFromParallelGroup(step.id);
                  }}
                  title="Aus paralleler Gruppe entfernen"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M7 16l3-3m0 0l3 3m-3-3v6m0-6V4" />
                  </svg>
                </button>
              </div>
            )}
            
            {isSelectionMode.value && !step.isParallel && (
              <div class={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                selectedSteps.value.includes(step.id)
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300 bg-white'
              }`}>
                {selectedSteps.value.includes(step.id) && (
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
            
            <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <button
                class="w-8 h-8 bg-white/80 hover:bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-blue-600 transition-all duration-200 hover:shadow-md"
                onClick$={(e) => {
                  e.stopPropagation();
                  duplicateStep(step);
                }}
                title="Step duplizieren"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                class="w-8 h-8 bg-white/80 hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-lg flex items-center justify-center text-gray-600 hover:text-red-600 transition-all duration-200 hover:shadow-md"
                onClick$={(e) => {
                  e.stopPropagation();
                  deleteStep(step.id);
                }}
                title="Step löschen"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {step.description && (
          <div class="mt-4 ml-16">
            <p class="text-sm text-gray-600 bg-gray-50/60 rounded-xl px-4 py-2">
              {step.description}
            </p>
          </div>
        )}
      </div>
    );
  };

  // ================ RENDER ================

  return (
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* TOAST CONTAINER */}
      <div class="fixed top-6 right-6 z-50 space-y-3">
        {renderToasts()}
      </div>

      <div class="max-w-7xl mx-auto p-6">
        {/* HEADER */}
        <div class="flex justify-between items-start mb-8">
          <div class="space-y-2">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                🔄
              </div>
              <div>
                <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Workflow Designer
                </h1>
                <p class="text-gray-600">Moderne Workflows für alle Anforderungsarten</p>
              </div>
            </div>
            {currentConfig.value && (
              <div class="flex items-center space-x-4 text-sm text-gray-500">
                <span class="inline-flex items-center space-x-1">
                  <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Version {currentConfig.value.version}</span>
                </span>
                <span>•</span>
                <span>Zuletzt geändert: {new Date(currentConfig.value.modifiedAt).toLocaleDateString('de-DE')}</span>
              </div>
            )}
          </div>
          
          <div class="flex items-center space-x-3">
            <button 
              class="inline-flex items-center px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick$={validateWorkflow} 
              disabled={isLoading.value}
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Validieren
            </button>
            <button 
              class="inline-flex items-center px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick$={resetWorkflow} 
              disabled={isLoading.value}
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
            <button 
              class="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              onClick$={saveWorkflow} 
              disabled={isLoading.value || isSaving.value}
            >
              {isSaving.value ? (
                <>
                  <svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Speichere...
                </>
              ) : (
                <>
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Speichern
                </>
              )}
            </button>
          </div>
        </div>

        {/* WORKFLOW TYPE SELECTION */}
        <div class="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-6 mb-8">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                T
              </div>
              <h2 class="text-xl font-semibold text-gray-900">Workflow Typ</h2>
            </div>
            {isLoading.value && (
              <div class="w-6 h-6">
                <svg class="animate-spin w-full h-full text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            {workflowTypes.map(type => {
              const isSelected = selectedWorkflowType.value === type;
              const emoji = type.includes('Klein') ? '📋' : 
                           type.includes('Groß') ? '📊' : 
                           type.includes('TIA') ? '⚡' : 
                           type.includes('Support') ? '🛠️' : 
                           type.includes('Betrieb') ? '⚙️' : 
                           type.includes('SBBI') ? '🏗️' : 
                           type.includes('AWG') ? '🚀' : '☁️';

              return (
                <button
                  key={type}
                  class={`group p-4 rounded-2xl text-sm font-medium transition-all duration-200 border-2 ${
                    isSelected
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white border-transparent shadow-lg transform scale-105'
                      : 'bg-white/60 text-gray-700 border-gray-200/60 hover:bg-white hover:border-blue-300 hover:shadow-lg hover:transform hover:scale-102'
                  }`}
                  onClick$={() => selectedWorkflowType.value = type}
                  disabled={isLoading.value}
                >
                  <div class="text-center">
                    <div class={`text-lg mb-1 ${isSelected ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                      {emoji}
                    </div>
                    {type}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div class="flex space-x-1 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl mb-8 border border-white/20 shadow-lg">
          {[
            { key: 'designer', label: 'Designer', icon: '🎨' },
            { key: 'properties', label: 'Eigenschaften', icon: '⚙️' },
            { key: 'preview', label: 'Vorschau', icon: '👁️' },
            { key: 'export', label: 'Export/Import', icon: '📁' }
          ].map(tab => (
            <button
              key={tab.key}
              class={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab.value === tab.key
                  ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
              onClick$={() => activeTab.value = tab.key as any}
            >
              <span class="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div class="tab-content">
          
          {/* DESIGNER TAB */}
          {activeTab.value === 'designer' && (
            <div class="grid grid-cols-12 gap-8">
              
              {/* LEFT SIDEBAR - TEMPLATES */}
              <div class="col-span-3">
                <div class="space-y-6">
                  
                  {/* Step Templates */}
                  <div class="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-6">
                    <div class="flex items-center space-x-3 mb-6">
                      <div class="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        T
                      </div>
                      <h3 class="text-lg font-semibold text-gray-900">Step Templates</h3>
                    </div>
                    
                    <div class="space-y-3">
                      {stepTemplates.map(template => (
                        <button
                          key={template.id}
                          class="group w-full p-4 text-left rounded-2xl border-2 border-gray-100 hover:border-blue-300 bg-white/60 hover:bg-white transition-all duration-200 hover:shadow-lg hover:transform hover:scale-102"
                          onClick$={() => addNewStep(template)}
                        >
                          <div class="flex items-center mb-2">
                            <div 
                              class="w-10 h-10 rounded-xl flex items-center justify-center text-xl mr-3" 
                              style={`background: linear-gradient(135deg, ${template.color}20, ${template.color}10); color: ${template.color}`}
                            >
                              {template.icon}
                            </div>
                            <div class="flex-1">
                              <div class="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                {template.title}
                              </div>
                              <p class="text-xs text-gray-500 mt-1">{template.description}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PARALLEL CONTROLS */}
                  <div class="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-6">
                    <div class="flex items-center space-x-3 mb-6">
                      <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        🔀
                      </div>
                      <h4 class="text-lg font-semibold text-gray-900">Parallel Processing</h4>
                    </div>
                    
                    <button
                      class={`w-full p-4 rounded-2xl text-sm font-medium transition-all duration-200 border-2 mb-4 ${
                        isSelectionMode.value 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-lg' 
                          : 'bg-white/60 text-gray-700 border-gray-200 hover:bg-white hover:border-purple-300 hover:shadow-lg'
                      }`}
                      onClick$={() => {
                        isSelectionMode.value = !isSelectionMode.value;
                        if (!isSelectionMode.value) {
                          selectedSteps.value = [];
                        }
                      }}
                      disabled={workflowSteps.value.length === 0}
                    >
                      <div class="flex items-center justify-center space-x-2">
                        <span class="text-base">
                          {isSelectionMode.value ? '❌' : '🔀'}
                        </span>
                        <span>
                          {isSelectionMode.value ? 'Auswahl beenden' : 'Steps parallel schalten'}
                        </span>
                      </div>
                    </button>

                    {isSelectionMode.value && (
                      <div class="space-y-4">
                        <button
                          class="w-full p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          onClick$={createParallelGroup}
                          disabled={selectionCount.value < 2}
                        >
                          <div class="flex items-center justify-center space-x-2">
                            <span class="text-base">✨</span>
                            <span class="font-medium">Parallele Gruppe erstellen</span>
                          </div>
                        </button>
                        
                        <div class="bg-blue-50/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-200/50">
                          <div class="text-center">
                            <div class="text-2xl font-bold text-blue-600 mb-1">
                              {selectionCount.value}
                            </div>
                            <div class="text-sm text-blue-700 font-medium mb-2">
                              Steps ausgewählt
                            </div>
                            <p class="text-xs text-blue-600">
                              Wähle 2+ Steps um sie parallel zu schalten
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CENTER - WORKFLOW STEPS */}
              <div class="col-span-6">
                <div class="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-6">
                  <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        W
                      </div>
                      <h3 class="text-lg font-semibold text-gray-900">Workflow Steps</h3>
                    </div>
                    <div class="flex items-center space-x-4 text-sm text-gray-500">
                      <div class="flex items-center space-x-2">
                        <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>{workflowSteps.value.length} Steps</span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>{workflowSteps.value.reduce((sum, step) => sum + step.estimatedDays, 0)} Tage</span>
                      </div>
                    </div>
                  </div>

                  {workflowSteps.value.length === 0 ? (
                    <div class="text-center py-16">
                      <div class="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center text-4xl mb-6 mx-auto">
                        📋
                      </div>
                      <h4 class="text-xl font-semibold text-gray-900 mb-2">Kein Workflow definiert</h4>
                      <p class="text-gray-600 mb-6">Wähle ein Template aus der Sidebar um zu starten</p>
                      <div class="inline-flex items-center text-sm text-blue-600">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Templates verwenden
                      </div>
                    </div>
                  ) : (
                    <div class="space-y-4">
                      {workflowSteps.value.map((step, index) => renderStepCard(step, index))}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT SIDEBAR - PROPERTIES */}
              <div class="col-span-3">
                <div class="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-6">
                  <div class="flex items-center space-x-3 mb-6">
                    <div class="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      ⚙
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900">Step Eigenschaften</h3>
                  </div>
                  
                  {selectedStep.value ? (
                    <div class="space-y-6">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-3">Titel</label>
                        <input
                          type="text"
                          class="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                          value={selectedStep.value.title}
                          onInput$={(e) => updateStep(selectedStep.value!.id, { 
                            title: (e.target as HTMLInputElement).value 
                          })}
                          placeholder="Step-Titel eingeben..."
                        />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-3">Beschreibung</label>
                        <textarea
                          class="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none"
                          value={selectedStep.value.description}
                          onInput$={(e) => updateStep(selectedStep.value!.id, { 
                            description: (e.target as HTMLTextAreaElement).value 
                          })}
                          rows={4}
                          placeholder="Detaillierte Beschreibung..."
                        />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-3">Verantwortlicher</label>
                        <div class="relative">
                          <select
                            class="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 appearance-none cursor-pointer"
                            value={selectedStep.value.responsible}
                            onChange$={(e) => updateStep(selectedStep.value!.id, { 
                              responsible: (e.target as HTMLSelectElement).value as any
                            })}
                          >
                            <option value="AG">👤 Auftraggeber (AG)</option>
                            <option value="AN">🏢 Auftragnehmer (AN)</option>
                            <option value="SYSTEM">🤖 System</option>
                            <option value="BOTH">👥 Beide</option>
                          </select>
                          <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-3">Geschätzte Tage</label>
                        <div class="relative">
                          <input
                            type="number"
                            min="1"
                            class="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                            value={selectedStep.value.estimatedDays}
                            onInput$={(e) => updateStep(selectedStep.value!.id, { 
                              estimatedDays: parseInt((e.target as HTMLInputElement).value) || 1
                            })}
                            placeholder="1"
                          />
                          <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <span class="text-sm text-gray-500">Tage</span>
                          </div>
                        </div>
                      </div>
                      
                      <div class="flex items-center justify-between p-4 bg-gray-50/60 rounded-2xl border border-gray-200/50">
                        <div class="flex items-center space-x-3">
                          <div class="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <div class="font-medium text-gray-900">Pflichtschritt</div>
                            <div class="text-xs text-gray-500">Muss abgeschlossen werden</div>
                          </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            class="sr-only peer"
                            checked={selectedStep.value.required}
                            onChange$={(e) => updateStep(selectedStep.value!.id, { 
                              required: (e.target as HTMLInputElement).checked
                            })}
                          />
                          <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div class="text-center py-16">
                      <div class="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center text-3xl mb-4 mx-auto">
                        ⚙️
                      </div>
                      <h4 class="text-lg font-semibold text-gray-900 mb-2">Kein Step ausgewählt</h4>
                      <p class="text-gray-600 text-sm">Wähle einen Step aus um Eigenschaften zu bearbeiten</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PLACEHOLDER TABS */}
          {activeTab.value === 'properties' && (
            <div class="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-8 text-center">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">Properties Tab</h2>
              <p class="text-gray-600">Coming soon...</p>
            </div>
          )}

          {activeTab.value === 'preview' && (
            <div class="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-8 text-center">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">Preview Tab</h2>
              <p class="text-gray-600">Coming soon...</p>
            </div>
          )}

          {activeTab.value === 'export' && (
            <div class="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-8 text-center">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">Export/Import Tab</h2>
              <p class="text-gray-600">Coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
