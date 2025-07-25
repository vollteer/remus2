// src/components/administration/workflow-designer.tsx

import { component$, useSignal, useTask$, $, useStore, useComputed$ } from '@builder.io/qwik';
import { WorkflowApiService } from '~/services/api/workflow-api-service';

// Types (deine bestehenden + validation interfaces)
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
  // 🆕 MINIMAL Parallel Extensions
  isParallel?: boolean;
  parallelGroup?: string;
  parallelPosition?: number;
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

// 🆕 VALIDATION INTERFACES
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface ParallelValidationResult {
  isValid: boolean;
  errors: string[];
  incompleteGroups: string[];
}

interface ParallelGroup {
  id: string;
  name: string;
  steps: string[];
  color: string;
}

export const WorkflowDesigner = component$(() => {

  // DEINE ursprünglichen Signals (unverändert)
  const selectedWorkflowType = useSignal('Kleinanforderung');
  const workflowSteps = useSignal<WorkflowStep[]>([]);
  const selectedStep = useSignal<WorkflowStep | null>(null);
  const currentConfig = useSignal<WorkflowConfiguration | null>(null);
  const isLoading = useSignal(false);
  const isSaving = useSignal(false);
  const activeTab = useSignal<'designer' | 'properties' | 'preview' | 'export'>('designer');
  
  // DEINE ursprünglichen Drag & Drop Signals (erweitert)
  const draggedStep = useSignal<number | null>(null);
  const dragOverIndex = useSignal<number | null>(null);
  const dragOverParallelGroup = useSignal<string | null>(null); // 🆕 Für parallel group drop zones
  
  // 🆕 ENHANCED Parallel Signals
  const selectedSteps = useSignal<string[]>([]);
  const parallelGroups = useSignal<ParallelGroup[]>([]);
  const isSelectionMode = useSignal(false);

  // 🆕 COMPUTED für reactive UI
  const selectionCount = useComputed$(() => selectedSteps.value.length);

  // ===== 🆕 PREVIEW FUNCTIONALITY =====
  const showPreview = useSignal(false);

  const generateWorkflowPreview = $(() => {
    const workflow = workflowSteps.value;
    const parallelGroups_val = parallelGroups.value;
    
    // Group steps: normal vs parallel
    const normalSteps = workflow.filter(step => !step.isParallel);
    const parallelStepsGrouped = parallelGroups_val.map(group => ({
      ...group,
      steps: group.steps.map(stepId => workflow.find(s => s.id === stepId)).filter(Boolean)
    }));
    
    // Create combined timeline
    const timeline: Array<{type: 'step' | 'parallel', content: any, order: number}> = [];
    
    // Add normal steps
    normalSteps.forEach(step => {
      timeline.push({
        type: 'step',
        content: step,
        order: step.order
      });
    });
    
    // Add parallel groups
    parallelStepsGrouped.forEach(group => {
      if (group.steps.length > 0) {
        const minOrder = Math.min(...group.steps.map(s => s?.order || 0));
        timeline.push({
          type: 'parallel',
          content: group,
          order: minOrder
        });
      }
    });
    
    return timeline.sort((a, b) => a.order - b.order);
  });

  // DEINE ursprünglichen Arrays (erweitert um 2 parallel templates)
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
        { condition: 'rejected', targetStepId: 'end', label: 'Abgelehnt', description: 'Anforderung wurde abgelehnt' }
      ]
    },
    {
      id: 'template-decision',
      title: 'Entscheidung',
      type: 'decision',
      icon: '🤔',
      color: '#f59e0b',
      description: 'Entscheidungspunkt mit mehreren Verzweigungen'
    },
    {
      id: 'template-notification',
      title: 'Benachrichtigung',
      type: 'notification',
      icon: '📧',
      color: '#8b5cf6',
      description: 'Automatische Benachrichtigung per E-Mail oder System'
    },
    {
      id: 'template-wait',
      title: 'Wartezeit',
      type: 'wait',
      icon: '⏳',
      color: '#6b7280',
      description: 'Wartezeit oder Timer'
    }
    // ✅ Parallel Split/Join Templates entfernt - Button reicht aus!
  ];

// ===== 🆕 VALIDATION FUNCTIONS as QRLs (for async usage) =====

const validateWorkflowSteps = $((steps: WorkflowStep[]): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  console.log('🔍 Validating workflow with steps:', steps.length);

  // Check if we have steps
  if (!steps || steps.length === 0) {
    result.errors.push('Workflow muss mindestens einen Schritt haben');
    result.isValid = false;
    return result;
  }

  // Check sequential order (1, 2, 3, ...)
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  for (let i = 0; i < sortedSteps.length; i++) {
    const expectedOrder = i + 1;
    if (sortedSteps[i].order !== expectedOrder) {
      result.errors.push(`Step-Reihenfolge falsch: Erwartet ${expectedOrder}, gefunden ${sortedSteps[i].order} für "${sortedSteps[i].title}"`);
      result.isValid = false;
    }
  }

  // Check estimated days > 0
  const zeroDaySteps = steps.filter(step => step.estimatedDays <= 0);
  if (zeroDaySteps.length > 0) {
    result.errors.push(`Diese Steps haben 0 Tage: ${zeroDaySteps.map(s => s.title).join(', ')}`);
    result.isValid = false;
  }

  // Check for duplicate orders
  const orderCounts = steps.reduce((acc, step) => {
    acc[step.order] = (acc[step.order] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  Object.entries(orderCounts).forEach(([order, count]) => {
    if (count > 1) {
      result.errors.push(`Duplicate order ${order} found in ${count} steps`);
      result.isValid = false;
    }
  });

  // Warnings
  if (steps.length > 10) {
    result.warnings.push('Workflow hat sehr viele Steps (>10) - Performance beachten');
  }

  const totalDays = steps.reduce((sum, step) => sum + step.estimatedDays, 0);
  if (totalDays > 30) {
    result.warnings.push(`Workflow dauert ${totalDays} Tage - sehr lang!`);
  }

  console.log('✅ Validation result:', result);
  return result;
});

const validateParallelGroups = $((parallelGroups: ParallelGroup[]): ParallelValidationResult => {
  const result: ParallelValidationResult = {
    isValid: true,
    errors: [],
    incompleteGroups: []
  };

  parallelGroups.forEach(group => {
    if (!group.steps || group.steps.length < 2) {
      result.errors.push(`Parallel Group "${group.id}" hat weniger als 2 Steps`);
      result.incompleteGroups.push(group.id);
      result.isValid = false;
    }
  });

  return result;
});

  // ===== 🆕 ENHANCED PARALLEL FUNCTIONS =====
  const toggleSelectionMode = $(() => {
    console.log('🔀 Toggling selection mode, current:', isSelectionMode.value);
    
    if (isSelectionMode.value) {
      // Selection Mode beenden
      isSelectionMode.value = false;
      selectedSteps.value = [];
      console.log('✅ Selection mode ended, cleared selections');
    } else {
      // Selection Mode starten
      isSelectionMode.value = true;
      selectedSteps.value = [];
      console.log('✅ Selection mode started');
    }
  });

  const toggleStepSelection = $((stepId: string) => {
    const currentSelections = [...selectedSteps.value];
    const step = workflowSteps.value.find(s => s.id === stepId);
    
    // ✅ Prevent selection of already parallel steps
    if (step) {
      if (step.isParallel) {
        console.warn('❌ Already parallel steps cannot be selected again');
        if (typeof window !== 'undefined') {
          alert('❌ Dieser Step ist bereits parallel!\nEntferne zuerst die parallele Gruppe um ihn neu zu verwenden.');
        }
        return;
      }
    }
    
    const isSelected = currentSelections.includes(stepId);
    
    if (isSelected) {
      // Remove from selection
      selectedSteps.value = currentSelections.filter(id => id !== stepId);
      console.log(`➖ Removed step ${stepId} from selection`);
    } else {
      // Add to selection
      selectedSteps.value = [...currentSelections, stepId];
      console.log(`➕ Added step ${stepId} to selection`);
    }
    
    console.log(`🔢 Current selection count: ${selectedSteps.value.length}`);
  });

  // 🆕 ADD STEP TO EXISTING PARALLEL GROUP
  const addStepToParallelGroup = $((stepId: string, groupId: string) => {
    console.log(`🔀 Adding step ${stepId} to parallel group ${groupId}`);
    
    const step = workflowSteps.value.find(s => s.id === stepId);
    const group = parallelGroups.value.find(g => g.id === groupId);
    
    if (!step || !group) {
      console.error('❌ Step or group not found');
      return;
    }
    
    // Check if step can be parallelized
    if (step.isParallel) {
      if (typeof window !== 'undefined') {
        alert('❌ Step ist bereits parallel! Entferne ihn zuerst aus seiner aktuellen Gruppe.');
      }
      return;
    }
    
    // Get the order of the parallel group (same as its first step)
    const firstParallelStep = workflowSteps.value.find(s => 
      s.parallelGroup === groupId && s.parallelPosition === 0
    );
    const groupOrder = firstParallelStep?.order || step.order;
    
    // Update the parallel group to include the new step
    const updatedGroups = parallelGroups.value.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          steps: [...g.steps, stepId]
        };
      }
      return g;
    });
    parallelGroups.value = updatedGroups;
    
    // Mark the step as parallel
    const updatedSteps = workflowSteps.value.map(s => {
      if (s.id === stepId) {
        return {
          ...s,
          isParallel: true,
          parallelGroup: groupId,
          parallelPosition: group.steps.length, // Add at the end
          order: groupOrder // Same order as other parallel steps
        };
      }
      return s;
    });
    
    // Normalize all step orders
    const normalizedSteps = updatedSteps
      .sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.id.localeCompare(b.id);
      })
      .map((step, index) => ({
        ...step,
        order: index + 1,
        estimatedDays: Math.max(step.estimatedDays, 1)
      }));
    
    workflowSteps.value = normalizedSteps;
    
    console.log(`✅ Step ${stepId} added to parallel group ${groupId}`);
    if (typeof window !== 'undefined') {
      alert(`✅ Step zu paralleler Gruppe hinzugefügt! 🔀`);
    }
  });

  const createParallelGroup = $(() => {
    const selectedIds = selectedSteps.value;
    console.log('🔀 Creating parallel group with steps:', selectedIds);

    if (selectedIds.length < 2) {
      console.warn('❌ Need at least 2 steps for parallel group');
      if (typeof window !== 'undefined') {
        alert('Mindestens 2 Steps für parallele Gruppe auswählen!');
      }
      return;
    }

    // Find selected steps in current workflow
    const selectedSteps_actual = workflowSteps.value.filter(step => 
      selectedIds.includes(step.id)
    );

    if (selectedSteps_actual.length !== selectedIds.length) {
      console.error('❌ Some selected steps not found in workflow!');
      console.log('Selected IDs:', selectedIds);
      console.log('Found steps:', selectedSteps_actual.map(s => s.id));
      return;
    }

    // Filter out already parallel steps
    const validSteps = selectedSteps_actual.filter(step => !step.isParallel);

    if (validSteps.length < 2) {
      if (typeof window !== 'undefined') {
        alert('❌ Bereits parallele Steps können nicht nochmal parallelisiert werden!\nWähle normale Steps aus.');
      }
      return;
    }

    if (validSteps.length !== selectedSteps_actual.length) {
      console.warn('⚠️ Einige ausgewählte Steps wurden gefiltert (bereits parallel)');
    }

    // Create parallel group metadata
    const groupId = `parallel-${Date.now()}`;
    const groupName = `Parallele Gruppe ${parallelGroups.value.length + 1}`;
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#14B8A6'];
    const groupColor = colors[parallelGroups.value.length % colors.length];
    const minOrder = Math.min(...validSteps.map(s => s.order));

    const newGroup: ParallelGroup = {
      id: groupId,
      name: groupName,
      steps: validSteps.map(s => s.id), // Only valid step IDs
      color: groupColor
    };

    console.log('✅ Created parallel group:', newGroup);

    // Update parallel groups
    parallelGroups.value = [...parallelGroups.value, newGroup];

    // ✅ Mark ONLY the valid steps as parallel (they run side-by-side)
    const updatedSteps = workflowSteps.value.map(step => {
      if (validSteps.some(validStep => validStep.id === step.id)) {
        console.log(`🔧 Marking step as parallel: ID="${step.id}", Title="${step.title}"`);
        
        return {
          ...step,
          isParallel: true,
          parallelGroup: groupId,
          parallelPosition: validSteps.findIndex(validStep => validStep.id === step.id),
          order: minOrder // ✅ All parallel steps get same order
        };
      }
      return step;
    });

    // ✅ Inline normalization (consistent with other functions)
    const normalizedSteps = updatedSteps
      .sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.id.localeCompare(b.id);
      })
      .map((step, index) => ({
        ...step,
        order: index + 1,
        estimatedDays: Math.max(step.estimatedDays, 1)
      }));

    workflowSteps.value = normalizedSteps;

    // Clear selection and exit selection mode
    selectedSteps.value = [];
    isSelectionMode.value = false;

    console.log('🎯 Parallel group created successfully!');
    console.log(`✅ ${validSteps.length} steps are now running in parallel`);
    console.log('Updated workflow steps:', workflowSteps.value.length);
    console.log('Parallel groups:', parallelGroups.value.length);

    if (typeof window !== 'undefined') {
      alert(`✅ Parallel Steps erstellt!\n${validSteps.length} Steps laufen jetzt gleichzeitig nebeneinander. 🔀`);
    }
  });

  const removeParallelGroup = $((groupId: string) => {
    const cleanedSteps = workflowSteps.value.map(step => {
      if (step.parallelGroup === groupId) {
        const { isParallel, parallelGroup, parallelPosition, ...cleanStep } = step;
        return cleanStep;
      }
      return step;
    });

    parallelGroups.value = parallelGroups.value.filter(group => group.id !== groupId);
    
    // ✅ Inline normalization (consistent with other functions)
    const normalizedSteps = cleanedSteps
      .sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.id.localeCompare(b.id);
      })
      .map((step, index) => ({
        ...step,
        order: index + 1,
        estimatedDays: Math.max(step.estimatedDays, 1)
      }));

    workflowSteps.value = normalizedSteps;
  });

  // 🆕 REMOVE STEP FROM PARALLEL GROUP
  const removeStepFromParallelGroup = $((stepId: string) => {
    console.log(`🔀 Removing step ${stepId} from parallel group`);
    
    const step = workflowSteps.value.find(s => s.id === stepId);
    if (!step || !step.isParallel || !step.parallelGroup) {
      console.error('❌ Step not found or not parallel');
      return;
    }
    
    const groupId = step.parallelGroup;
    const group = parallelGroups.value.find(g => g.id === groupId);
    
    if (!group) {
      console.error('❌ Parallel group not found');
      return;
    }
    
    // If this is the last step in the group, remove the entire group
    if (group.steps.length <= 1) {
      removeParallelGroup(groupId);
      if (typeof window !== 'undefined') {
        alert('✅ Letzter Step entfernt - parallele Gruppe wurde aufgelöst!');
      }
      return;
    }
    
    // Remove step from group
    const updatedGroups = parallelGroups.value.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          steps: g.steps.filter(id => id !== stepId)
        };
      }
      return g;
    });
    parallelGroups.value = updatedGroups;
    
    // Update step to be non-parallel
    const updatedSteps = workflowSteps.value.map(s => {
      if (s.id === stepId) {
        const { isParallel, parallelGroup, parallelPosition, ...cleanStep } = s;
        return cleanStep;
      }
      return s;
    });
    
    // Normalize all step orders
    const normalizedSteps = updatedSteps
      .sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.id.localeCompare(b.id);
      })
      .map((step, index) => ({
        ...step,
        order: index + 1,
        estimatedDays: Math.max(step.estimatedDays, 1)
      }));
    
    workflowSteps.value = normalizedSteps;
    
    console.log(`✅ Step ${stepId} removed from parallel group`);
    if (typeof window !== 'undefined') {
      alert('✅ Step aus paralleler Gruppe entfernt!');
    }
  });

  // ===== 🆕 UTILITY FUNCTIONS =====
  const autoFixAllSteps = $(() => {
    console.log('🔧 Auto-fixing all steps...');
    
    // Inline normalization to keep it synchronous
    const steps = workflowSteps.value;
    const fixedSteps = steps
      .sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.id.localeCompare(b.id);
      })
      .map((step, index) => ({
        ...step,
        order: index + 1,
        estimatedDays: Math.max(step.estimatedDays, 1)
      }));
    
    workflowSteps.value = fixedSteps;
    
    console.log('✅ All steps auto-fixed!');
    console.log('Fixed steps:', fixedSteps.map(s => `${s.title} - Order: ${s.order}, Days: ${s.estimatedDays}`));
    
    if (typeof window !== 'undefined') {
      alert(`🔧 Auto-Fix applied to ${fixedSteps.length} steps!\nAll orders normalized and days set to min 1.`);
    }
  });

  const validateCurrentWorkflow = $(async () => {
    console.log('🔍 Validating current workflow...');
    
    // Use QRL functions
    const validation = await validateWorkflowSteps(workflowSteps.value);
    const parallelValidation = await validateParallelGroups(parallelGroups.value);
    
    let message = '📊 VALIDATION RESULTS:\n\n';
    
    // Steps validation
    message += `Steps: ${validation.isValid ? '✅ VALID' : '❌ INVALID'}\n`;
    if (validation.errors.length > 0) {
      message += `Errors: ${validation.errors.join(', ')}\n`;
    }
    if (validation.warnings.length > 0) {
      message += `Warnings: ${validation.warnings.join(', ')}\n`;
    }
    
    // Parallel validation
    message += `\nParallel Groups: ${parallelValidation.isValid ? '✅ VALID' : '❌ INVALID'}\n`;
    if (parallelValidation.errors.length > 0) {
      message += `Errors: ${parallelValidation.errors.join(', ')}\n`;
    }
    
    // Summary
    const totalSteps = workflowSteps.value.length;
    const totalDays = workflowSteps.value.reduce((sum, step) => sum + step.estimatedDays, 0);
    const totalParallelGroups = parallelGroups.value.length;
    
    message += `\n📈 STATISTICS:\n`;
    message += `Total Steps: ${totalSteps}\n`;
    message += `Total Days: ${totalDays}\n`;
    message += `Parallel Groups: ${totalParallelGroups}\n`;
    message += `Selection Mode: ${isSelectionMode.value ? 'ON' : 'OFF'}\n`;
    message += `Selected Steps: ${selectedSteps.value.length}`;
    
    console.log(message);
    if (typeof window !== 'undefined') {
      alert(message);
    }
  });

  // DEINE ursprüngliche loadWorkflow Funktion (unverändert)
  const loadWorkflow = $(async (workflowType: string) => {
    isLoading.value = true;
    try {
      console.log(`Loading workflow: ${workflowType}`);
      const config = await WorkflowApiService.getWorkflowByType(workflowType);
      if (config) {
        console.log('Loaded config from DB:', config);
        currentConfig.value = config;
        workflowSteps.value = [...config.steps];
        console.log(`Workflow "${workflowType}" geladen mit ${config.steps.length} Steps`);
      } else {
        console.log(`Kein Workflow für "${workflowType}" gefunden, erstelle leeren`);
        workflowSteps.value = [];
        currentConfig.value = null;
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
      workflowSteps.value = [];
      currentConfig.value = null;
    } finally {
      isLoading.value = false;
    }
  });

  // DEINE ursprüngliche useTask für Auto-Loading
  useTask$(async ({ track }) => {
    track(() => selectedWorkflowType.value);
    await loadWorkflow(selectedWorkflowType.value);
  });

  // DEINE ursprünglichen Drag & Drop Functions (erweitert)
  const handleDragStart = $((e: DragEvent, index: number) => {
    draggedStep.value = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  });

  const handleDragOver = $((e: DragEvent, index: number) => {
    e.preventDefault();
    dragOverIndex.value = index;
    dragOverParallelGroup.value = null; // Clear parallel group hover when over normal step
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  });

  // 🆕 PARALLEL GROUP DRAG HANDLERS
  const handleParallelGroupDragOver = $((e: DragEvent, groupId: string) => {
    e.preventDefault();
    e.stopPropagation();
    dragOverParallelGroup.value = groupId;
    dragOverIndex.value = null; // Clear normal step hover when over parallel group
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'; // Visual indicator that it's adding, not moving
    }
  });

  const handleParallelGroupDrop = $((e: DragEvent, groupId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedStep.value === null) return;
    
    const dragIndex = draggedStep.value;
    const draggedStepData = workflowSteps.value[dragIndex];
    
    if (!draggedStepData) {
      console.error('❌ Dragged step not found');
      return;
    }
    
    console.log(`🔀 Dropping step "${draggedStepData.title}" onto parallel group ${groupId}`);
    
    // Add step to parallel group
    addStepToParallelGroup(draggedStepData.id, groupId);
    
    // Clear drag state
    draggedStep.value = null;
    dragOverIndex.value = null;
    dragOverParallelGroup.value = null;
  });

  const handleDrop = $((e: DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedStep.value === null) return;

    const dragIndex = draggedStep.value;
    if (dragIndex === dropIndex) return;

    const newSteps = [...workflowSteps.value];
    const [removed] = newSteps.splice(dragIndex, 1);
    const finalDropIndex = dragIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newSteps.splice(finalDropIndex, 0, removed);

    // ✅ Inline normalization to keep it synchronous
    const normalizedSteps = newSteps
      .sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.id.localeCompare(b.id);
      })
      .map((step, index) => ({
        ...step,
        order: index + 1,
        estimatedDays: Math.max(step.estimatedDays, 1)
      }));

    workflowSteps.value = normalizedSteps;

    draggedStep.value = null;
    dragOverIndex.value = null;
    dragOverParallelGroup.value = null; // 🆕 Clear parallel group hover
  });

  // ===== 🆕 ENHANCED STEP FUNCTIONS =====
  const addNewStep = $((template: StepTemplate) => {
    const stepId = `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const maxOrder = workflowSteps.value.length > 0 ? Math.max(...workflowSteps.value.map(s => s.order)) : 0;
    
    const newStep: WorkflowStep = {
      id: stepId,
      title: `Neue ${template.title}`,
      type: template.type,
      responsible: 'AN',
      description: template.description || '',
      estimatedDays: 1, // ✅ Always >= 1
      required: true,
      conditions: [],
      order: maxOrder + 1, // ✅ Sequential order
      permissions: template.defaultPermissions ? { ...template.defaultPermissions } : undefined,
      branches: template.defaultBranches ? [...template.defaultBranches] : undefined
    };

    console.log('➕ Creating new step with ID:', stepId, newStep);
    workflowSteps.value = [...workflowSteps.value, newStep];
    selectedStep.value = newStep;
  });

  const updateStep = $((stepId: string, updates: Partial<WorkflowStep>) => {
    // Ensure estimatedDays is always >= 1
    if (updates.estimatedDays !== undefined) {
      updates.estimatedDays = Math.max(updates.estimatedDays, 1);
    }

    workflowSteps.value = workflowSteps.value.map(step =>
      step.id === stepId ? { ...step, ...updates } : step
    );

    if (selectedStep.value?.id === stepId) {
      selectedStep.value = { ...selectedStep.value, ...updates };
    }

    console.log(`📝 Updated step ${stepId}:`, updates);
  });

  const deleteStep = $((stepId: string) => {
    if (typeof window !== 'undefined') {
      if (!confirm('Sind Sie sicher, dass Sie diesen Schritt löschen möchten?')) {
        return;
      }
    }

    const filteredSteps = workflowSteps.value.filter(step => step.id !== stepId);
    
    // ✅ Inline normalization (consistent with other functions)
    const normalizedSteps = filteredSteps
      .sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.id.localeCompare(b.id);
      })
      .map((step, index) => ({
        ...step,
        order: index + 1,
        estimatedDays: Math.max(step.estimatedDays, 1)
      }));

    workflowSteps.value = normalizedSteps;

    if (selectedStep.value?.id === stepId) {
      selectedStep.value = null;
    }
  });

  const duplicateStep = $((step: WorkflowStep) => {
    const newStepId = `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const maxOrder = workflowSteps.value.length > 0 ? Math.max(...workflowSteps.value.map(s => s.order)) : 0;
    
    const stepCopy: WorkflowStep = {
      ...step,
      id: newStepId,
      title: `${step.title} (Kopie)`,
      order: maxOrder + 1, // ✅ Sequential order
      isParallel: false,
      parallelGroup: undefined,
      parallelPosition: undefined
    };

    console.log('📋 Duplicating step with new ID:', newStepId, stepCopy);
    workflowSteps.value = [...workflowSteps.value, stepCopy];
    selectedStep.value = stepCopy;
  });

  // ===== 🆕 ENHANCED SAVE WITH VALIDATION =====
  const saveWorkflow = $(async () => {
    console.log('💾 Starting workflow save process...');
    isSaving.value = true;

    try {
      // 1. Normalize step order BEFORE validation (inline to keep it sync)
      const steps = workflowSteps.value;
      const normalizedSteps = steps
        .sort((a, b) => {
          if (a.order !== b.order) return a.order - b.order;
          return a.id.localeCompare(b.id);
        })
        .map((step, index) => ({
          ...step,
          order: index + 1,
          estimatedDays: Math.max(step.estimatedDays, 1)
        }));

      workflowSteps.value = normalizedSteps;

      console.log('✅ Steps normalized:', normalizedSteps.map(s => `${s.title} (order: ${s.order}, days: ${s.estimatedDays})`));

      // 2. Frontend validation using QRL functions
      const validation = await validateWorkflowSteps(normalizedSteps);
      const parallelValidation = await validateParallelGroups(parallelGroups.value);

      // Show warnings
      if (validation.warnings.length > 0) {
        console.warn('⚠️ Validation warnings:', validation.warnings);
      }

      // Stop if validation fails
      if (!validation.isValid) {
        console.error('❌ Frontend validation failed:', validation.errors);
        if (typeof window !== 'undefined') {
          alert(`Validation Fehler:\n${validation.errors.join('\n')}`);
        }
        return;
      }

      if (!parallelValidation.isValid) {
        console.error('❌ Parallel validation failed:', parallelValidation.errors);
        if (typeof window !== 'undefined') {
          alert(`Parallel Groups Fehler:\n${parallelValidation.errors.join('\n')}`);
        }
        return;
      }

      console.log('✅ Frontend validation passed!');

      // 3. Validate all Step IDs vor dem Speichern
      const stepsWithValidIds = normalizedSteps.map((step, index) => {
        if (!step.id || step.id.trim() === '') {
          const newId = `step-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
          console.log(`🔧 FIX: Step ohne ID gefunden, generiere neue ID: ${newId}`, step);
          return { ...step, id: newId };
        }
        return step;
      });

      // 4. Prepare workflow for backend
      const workflowConfig: WorkflowConfiguration = {
        id: currentConfig.value?.id || `config-${Date.now()}`,
        type: selectedWorkflowType.value,
        name: `${selectedWorkflowType.value} Workflow`,
        description: `Workflow für ${selectedWorkflowType.value}`,
        steps: stepsWithValidIds,
        isActive: true,
        version: (currentConfig.value?.version || 0) + 1,
        createdAt: currentConfig.value?.createdAt || new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        createdBy: 'Current User'
      };

      console.log('📤 Sending to backend:', JSON.stringify(workflowConfig, null, 2));

      // 5. Save to backend
      const savedConfig = await WorkflowApiService.saveWorkflowConfiguration(workflowConfig);
      
      if (savedConfig) {
        currentConfig.value = savedConfig;
        workflowSteps.value = stepsWithValidIds;
        console.log('🎉 Workflow saved successfully!');
        if (typeof window !== 'undefined') {
          alert('✅ Workflow erfolgreich gespeichert!');
        }
      } else {
        throw new Error('Fehler beim Speichern - keine Response vom Server');
      }

    } catch (error) {
      console.error('💥 Save error:', error);
      if (typeof window !== 'undefined') {
        alert(`❌ Fehler beim Speichern: ${error}`);
      }
    } finally {
      isSaving.value = false;
    }
  });

  const getStepIcon = (type: WorkflowStep['type']): string => {
    const template = stepTemplates.find(t => t.type === type);
    return template?.icon || '📋';
  };

  const getStepColor = (type: WorkflowStep['type']): string => {
    const template = stepTemplates.find(t => t.type === type);
    return template?.color || 'rgb(0, 158, 227)';
  };

  return (
    <div class="animate-fade-in">
      {/* 🆕 DEBUG SECTION (temporär zum Testen) */}
      <div class="flex gap-2 mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <button 
          class="btn btn-sm btn-info" 
          onClick$={validateCurrentWorkflow}
        >
          🔍 Workflow validieren
        </button>
        <button 
          class="btn btn-sm btn-warning" 
          onClick$={autoFixAllSteps}
        >
          🔧 Auto-Fix alle Steps
        </button>
        <div class="ml-4 text-sm text-gray-600">
          Steps: {workflowSteps.value.length} | 
          Selection Mode: {isSelectionMode.value ? 'AN' : 'AUS'} | 
          Ausgewählt: {selectionCount.value} |
          Parallel Groups: {parallelGroups.value.length}
          {draggedStep.value !== null && (
            <span class="text-orange-600 font-medium ml-2">🔀 Dragging Step...</span>
          )}
        </div>
        {draggedStep.value !== null && (
          <div class="ml-4 text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded">
            💡 Ziehe auf eine parallele Gruppe um den Step hinzuzufügen!
          </div>
        )}
      </div>

      {/* Header - erweitert um Enhanced Parallel Buttons */}
      <div class="card mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Workflow Designer</h1>
            <p class="text-gray-600 mt-1">
              Gestalte und konfiguriere Workflows für verschiedene Anforderungsarten
              {parallelGroups.value.length > 0 && (
                <span class="text-blue-600"> • {parallelGroups.value.length} parallele Gruppen</span>
              )}
              <br />
              <span class="text-sm text-gray-500">
                💡 Tipp: Wähle 2+ Tasks aus um sie parallel zu schalten oder ziehe Steps in bestehende parallele Gruppen
              </span>
            </p>
          </div>
          <div class="flex gap-3">
            {/* 🆕 Enhanced Parallel Selection Button */}
            <button
              class={`btn ${isSelectionMode.value ? 'btn-success' : 'btn-secondary'} ${isSelectionMode.value ? 'animate-pulse' : ''}`}
              onClick$={toggleSelectionMode}
            >
              {isSelectionMode.value ? (
                <>✅ Auswahl beenden ({selectionCount.value})</>
              ) : (
                <>🔀 Steps parallel schalten</>
              )}
            </button>

            {/* 🆕 Dynamic Create Parallel Group Button */}
            {isSelectionMode.value && selectionCount.value >= 2 && (
              <button
                class="btn btn-accent animate-pulse"
                onClick$={createParallelGroup}
              >
                🔀 Parallel schalten ({selectionCount.value} Steps)
              </button>
            )}

            <button 
              class="btn btn-secondary"
              onClick$={() => showPreview.value = true}
            >
              👁️ Vorschau
            </button>
            <button
              class={`btn btn-primary ${isSaving.value ? 'opacity-50' : ''}`}
              onClick$={saveWorkflow}
              disabled={isSaving.value}
            >
              {isSaving.value ? '💾 Speichert...' : '💾 Speichern'}
            </button>
          </div>
        </div>

        {/* 🆕 Selection Mode Info Bar */}
        {isSelectionMode.value && (
          <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                  🔀
                </div>
                <div>
                  <h4 class="font-medium text-blue-900">Parallel-Auswahl aktiv</h4>
                  <p class="text-sm text-blue-700">
                    Wähle 2+ normale Tasks/Approvals aus um sie parallel zu schalten.
                  </p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-blue-900">{selectionCount.value}</div>
                <div class="text-sm text-blue-600">ausgewählt</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div class="grid grid-cols-12 gap-6">
        {/* Left Sidebar - DEINE ursprüngliche + Enhanced Parallel Groups */}
        <div class="col-span-3">
          <div class="card mb-4">
            <h3 class="text-lg font-semibold mb-4">Workflow-Typ</h3>
            <select
              class="form-input"
              bind:value={selectedWorkflowType}
            >
              {workflowTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div class="card mb-4">
            <h3 class="text-lg font-semibold mb-4">Schritt-Vorlagen</h3>
            <div class="space-y-2">
              {stepTemplates.map((template) => (
                <button
                  key={template.id}
                  class="w-full flex items-center gap-3 p-3 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
                  onClick$={() => addNewStep(template)}
                >
                  <div
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                    style={`background-color: ${template.color}`}
                  >
                    {template.icon}
                  </div>
                  <div class="text-left">
                    <div class="font-medium text-gray-700 group-hover:text-blue-700">
                      {template.title}
                    </div>
                    <div class="text-xs text-gray-500 group-hover:text-blue-600">
                      {template.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 🆕 Enhanced Parallel Groups Overview */}
          {parallelGroups.value.length > 0 && (
            <div class="card">
              <h3 class="text-lg font-semibold mb-4">🔀 Parallele Steps</h3>
              <div class="space-y-2">
                {parallelGroups.value.map(group => (
                  <div key={group.id} class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div
                      class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                      style={`background-color: ${group.color}`}
                    >
                      🔀
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="font-medium text-sm text-gray-900 truncate">{group.name}</div>
                      <div class="text-xs text-gray-600">{group.steps.length} Steps gleichzeitig</div>
                    </div>
                    <button
                      class="text-red-600 hover:text-red-800 p-1 hover:bg-red-100 rounded transition-colors"
                      onClick$={() => removeParallelGroup(group.id)}
                    >
                      ❌
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center - DEINE ursprüngliche Workflow Canvas + Enhanced Parallel Visuals */}
        <div class="col-span-6">
          <div class="card">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-lg font-semibold">Workflow: {selectedWorkflowType.value}</h3>
                <p class="text-sm text-gray-600 mt-1">
                  {isLoading.value ? 'Lädt...' : `${workflowSteps.value.length} Schritte definiert`}
                  {isSelectionMode.value && selectionCount.value > 0 && (
                    <span class="text-blue-600"> • {selectionCount.value} ausgewählt</span>
                  )}
                </p>
              </div>
            </div>

            {isLoading.value ? (
              <div class="text-center py-12">
                <div class="text-4xl mb-4">⏳</div>
                <p class="text-gray-600">Workflow wird geladen...</p>
              </div>
            ) : workflowSteps.value.length === 0 ? (
              <div class="text-center py-12 text-gray-500">
                <div class="text-6xl mb-4">⚡</div>
                <h3 class="text-lg font-semibold mb-2">Workflow ist leer</h3>
                <p>Füge Schritte aus der linken Sidebar hinzu um zu starten.</p>
              </div>
            ) : (
              <div class="workflow-canvas">
                <div class="space-y-4">
                  {workflowSteps.value.map((step, index) => {
                    const isSelected = selectedSteps.value.includes(step.id);
                    const isCurrentSelected = selectedStep.value?.id === step.id;
                    const parallelGroup = parallelGroups.value.find(g => g.id === step.parallelGroup);
                    const isDragOver = dragOverIndex.value === index;

                    return (
                      <div key={step.id}>
                        {/* ✅ Parallel Group: Render side-by-side when parallel position is 0 */}
                        {step.isParallel && parallelGroup && step.parallelPosition === 0 && (
                          <div class="parallel-group-container mb-6">
                            {/* Parallel Group Header mit Drop Zone */}
                            <div 
                              class={`parallel-group-header mb-3 p-4 border-2 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 transition-all ${
                                dragOverParallelGroup.value === parallelGroup.id ? 'border-green-400 bg-green-50 scale-105' : ''
                              }`}
                              onDragOver$={(e) => handleParallelGroupDragOver(e, parallelGroup.id)}
                              onDrop$={(e) => handleParallelGroupDrop(e, parallelGroup.id)}
                              onDragLeave$={() => {
                                dragOverParallelGroup.value = null;
                              }}
                            >
                              <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                  <div
                                    class="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-medium shadow-md"
                                    style={`background-color: ${parallelGroup.color}`}
                                  >
                                    🔀
                                  </div>
                                  <div>
                                    <h4 class="font-semibold text-gray-900">{parallelGroup.name}</h4>
                                    <p class="text-sm text-gray-600">
                                      {parallelGroup.steps.length} parallele Steps
                                      {dragOverParallelGroup.value === parallelGroup.id && (
                                        <span class="text-green-600 font-medium ml-2">📥 Hier ablegen zum Hinzufügen!</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div class="flex items-center gap-2">
                                  {/* 🆕 Drop Zone Indicator */}
                                  {draggedStep.value !== null && dragOverParallelGroup.value !== parallelGroup.id && (
                                    <div class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                      📥 Drop Zone
                                    </div>
                                  )}
                                  {dragOverParallelGroup.value === parallelGroup.id && (
                                    <div class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded font-medium animate-pulse">
                                      ✅ Hier ablegen!
                                    </div>
                                  )}
                                  <button
                                    class="text-red-600 hover:text-red-800 p-2 hover:bg-red-100 rounded-lg transition-colors"
                                    onClick$={() => removeParallelGroup(parallelGroup.id)}
                                  >
                                    ❌
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* ✅ Parallel Steps Side-by-Side */}
                            <div class={`parallel-steps-container grid gap-4 ${parallelGroup.steps.length > 3 ? 'has-many-steps' : parallelGroup.steps.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                              {parallelGroup.steps.map(stepId => {
                                const parallelStep = workflowSteps.value.find(s => s.id === stepId);
                                if (!parallelStep) return null;
                                
                                const isSelected = selectedSteps.value.includes(parallelStep.id);
                                const isCurrentSelected = selectedStep.value?.id === parallelStep.id;

                                return (
                                  <div key={parallelStep.id} class="parallel-step-wrapper">
                                    {/* Enhanced Step Card for Parallel */}
                                    <div
                                      class={`
                                        workflow-step group parallel-step-card
                                        ${isCurrentSelected ? 'selected' : ''}
                                        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                                        ${isSelectionMode.value ? 'cursor-pointer hover:bg-gray-50' : ''}
                                        ${isSelectionMode.value && parallelStep.isParallel ? 'opacity-60 cursor-not-allowed' : ''}
                                      `}
                                      onClick$={() => {
                                        if (isSelectionMode.value) {
                                          // Only allow selection of normal steps (not already parallel steps)
                                          if (!parallelStep.isParallel) {
                                            toggleStepSelection(parallelStep.id);
                                          }
                                        } else {
                                          selectedStep.value = parallelStep;
                                        }
                                      }}
                                      style={`border-left: 4px solid ${parallelGroup.color}`}
                                    >
                                      {/* Selection Checkbox */}
                                      {isSelectionMode.value && (
                                        <div class="absolute top-3 left-3 z-10">
                                          <input
                                            type="checkbox"
                                            checked={isSelected}
                                            disabled={parallelStep.isParallel}
                                            class={`w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ${
                                              parallelStep.isParallel ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                            onChange$={() => toggleStepSelection(parallelStep.id)}
                                          />
                                        </div>
                                      )}

                                      <div class="workflow-step-header">
                                        <div
                                          class="workflow-step-icon"
                                          style={`background-color: ${getStepColor(parallelStep.type)}`}
                                        >
                                          {getStepIcon(parallelStep.type)}
                                        </div>
                                        <div class="workflow-step-content">
                                          <h4 class="workflow-step-title">{parallelStep.title}</h4>
                                          <div class="workflow-step-meta">
                                            <span class={`badge ${
                                              parallelStep.responsible === 'AG' ? 'badge-blue' :
                                              parallelStep.responsible === 'AN' ? 'badge-green' :
                                              parallelStep.responsible === 'SYSTEM' ? 'badge-purple' :
                                              'badge-gray'
                                            }`}>
                                              {parallelStep.responsible}
                                            </span>
                                            <span class="badge badge-outline">
                                              {parallelStep.estimatedDays} Tag{parallelStep.estimatedDays !== 1 ? 'e' : ''}
                                            </span>
                                            {parallelStep.required && (
                                              <span class="badge badge-red">Erforderlich</span>
                                            )}
                                            <span class="badge badge-yellow">🔀 Parallel</span>
                                            <span class="badge badge-gray text-xs">#{parallelStep.order}</span>
                                          </div>
                                        </div>
                                        <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                          <button
                                            class="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                            onClick$={() => selectedStep.value = parallelStep}
                                          >
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                          </button>
                                          <button
                                            class="p-1 text-green-600 hover:bg-green-100 rounded"
                                            onClick$={() => duplicateStep(parallelStep)}
                                          >
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                          </button>
                                          <button
                                            class="p-1 text-red-600 hover:bg-red-100 rounded"
                                            onClick$={() => deleteStep(parallelStep.id)}
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
                              })}
                            </div>

                            {/* ✅ Enhanced Parallel Merge Arrow after all parallel steps */}
                            <div class="parallel-merge-arrow mt-6 mb-6">
                              <div class="flex items-center justify-center">
                                <div class="flex items-center gap-3 bg-gradient-to-r from-teal-50 to-teal-100 px-6 py-3 rounded-full shadow-md border border-teal-200">
                                  <div class="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-lg shadow-sm">
                                    🔗
                                  </div>
                                  <span class="text-sm text-teal-700 font-semibold">Parallele Pfade zusammenführen</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ✅ Normal Step (not parallel or first parallel already rendered above) */}
                        {(!step.isParallel || !parallelGroup || step.parallelPosition !== 0) && (
                          <>
                            {/* Only render if not parallel OR not the first parallel step (since we render all parallel steps together above) */}
                            {!step.isParallel && (
                              <>
                                {/* Enhanced Step Card for Normal Steps */}
                                <div
                                  class={`
                                    workflow-step group
                                    ${isCurrentSelected ? 'selected' : ''}
                                    ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                                    ${isDragOver ? 'drag-over' : ''}
                                    ${isSelectionMode.value ? 'cursor-pointer hover:bg-gray-50' : ''}
                                    ${isSelectionMode.value && step.isParallel ? 'opacity-60 cursor-not-allowed' : ''}
                                    ${draggedStep.value !== null && !step.isParallel ? 'hover:ring-2 hover:ring-green-400 hover:bg-green-50' : ''}
                                  `}
                                  onClick$={() => {
                                    if (isSelectionMode.value) {
                                      // Only allow selection of normal steps (not already parallel steps)
                                      if (!step.isParallel) {
                                        toggleStepSelection(step.id);
                                      }
                                    } else {
                                      selectedStep.value = step;
                                    }
                                  }}
                                  draggable={!step.isParallel} // ✅ Parallel steps can't be dragged out directly
                                  onDragStart$={(e) => handleDragStart(e, index)}
                                  onDragOver$={(e) => handleDragOver(e, index)}
                                  onDrop$={(e) => handleDrop(e, index)}
                                  onDragLeave$={() => {
                                    dragOverIndex.value = null;
                                    dragOverParallelGroup.value = null;
                                  }}
                                >
                                  {/* 🆕 Drag hint for droppable steps */}
                                  {draggedStep.value !== null && !step.isParallel && (
                                    <div class="absolute top-2 right-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded animate-bounce">
                                      📥 Droppable
                                    </div>
                                  )}
                                >
                                  {/* Selection Checkbox */}
                                  {isSelectionMode.value && (
                                    <div class="absolute top-3 left-3 z-10">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        disabled={step.isParallel}
                                        class={`w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ${
                                          step.isParallel ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
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
                                        <span class={`badge ${
                                          step.responsible === 'AG' ? 'badge-blue' :
                                          step.responsible === 'AN' ? 'badge-green' :
                                          step.responsible === 'SYSTEM' ? 'badge-purple' :
                                          'badge-gray'
                                        }`}>
                                          {step.responsible}
                                        </span>
                                        <span class="badge badge-outline">
                                          {step.estimatedDays} Tag{step.estimatedDays !== 1 ? 'e' : ''}
                                        </span>
                                        {step.required && (
                                          <span class="badge badge-red">Erforderlich</span>
                                        )}
                                        <span class="badge badge-gray text-xs">#{step.order}</span>
                                      </div>
                                    </div>
                                    <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                      <button
                                        class="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                        onClick$={() => selectedStep.value = step}
                                      >
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                      </button>
                                      <button
                                        class="p-1 text-green-600 hover:bg-green-100 rounded"
                                        onClick$={() => duplicateStep(step)}
                                      >
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
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

                                {/* Arrow to next step */}
                                {index < workflowSteps.value.length - 1 && (
                                  <div class="flex justify-center mt-4 mb-4">
                                    <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors">
                                      <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - DEINE ursprüngliche + Enhanced Parallel Info */}
        <div class="col-span-3">
          {selectedStep.value ? (
            <div class="card">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold">Schritt bearbeiten</h3>
                <button
                  class="text-gray-400 hover:text-gray-600"
                  onClick$={() => selectedStep.value = null}
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 🆕 Enhanced Parallel Step Info */}
              {selectedStep.value.isParallel && (
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-4 border border-blue-200">
                  <h4 class="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    🔀 Paralleler Step
                  </h4>
                  <p class="text-sm text-blue-700 mb-2">
                    Läuft parallel mit anderen Steps in: <strong>
                      {parallelGroups.value.find(g => g.id === selectedStep.value?.parallelGroup)?.name || 'Unbekannte Gruppe'}
                    </strong>
                  </p>
                  <div class="flex justify-between text-xs text-blue-600">
                    <span>Position: {(selectedStep.value.parallelPosition || 0) + 1}</span>
                    <span>Order: {selectedStep.value.order}</span>
                  </div>
                  <p class="text-xs text-blue-500 mt-2 italic">
                    ✨ Dieser Step wird gleichzeitig mit anderen ausgeführt
                  </p>
                </div>
              )}

              <div class="space-y-4">
                <div>
                  <label class="form-label">Titel</label>
                  <input
                    type="text"
                    class="form-input"
                    bind:value={selectedStep.value.title}
                    onInput$={(e) => updateStep(selectedStep.value!.id, { title: (e.target as HTMLInputElement).value })}
                  />
                </div>

                <div>
                  <label class="form-label">Beschreibung</label>
                  <textarea
                    class="form-input"
                    rows={3}
                    bind:value={selectedStep.value.description}
                    onInput$={(e) => updateStep(selectedStep.value!.id, { description: (e.target as HTMLTextAreaElement).value })}
                  />
                </div>

                <div>
                  <label class="form-label">Verantwortlich</label>
                  <select
                    class="form-input"
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
                  <label class="form-label">Geschätzte Tage</label>
                  <input
                    type="number"
                    min="1"
                    class="form-input"
                    bind:value={selectedStep.value.estimatedDays}
                    onInput$={(e) => updateStep(selectedStep.value!.id, { estimatedDays: parseInt((e.target as HTMLInputElement).value) })}
                  />
                </div>

                <div>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      class="mr-2"
                      checked={selectedStep.value.required}
                      onChange$={(e) => updateStep(selectedStep.value!.id, { required: (e.target as HTMLInputElement).checked })}
                    />
                    <span class="form-label mb-0">Erforderlicher Schritt</span>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div class="card text-center text-gray-500">
              <div class="text-4xl mb-4">👆</div>
              <p class="mb-2">Wähle einen Schritt aus um ihn zu bearbeiten</p>
              {isSelectionMode.value && (
                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg mt-4 border border-blue-200">
                  <div class="text-2xl mb-2">🔀</div>
                  <p class="text-sm text-blue-700 font-medium">Auswahl-Modus aktiv</p>
                  <p class="text-xs text-blue-600 mt-1">
                    Wähle 2+ normale Tasks/Approvals aus um sie parallel zu schalten
                  </p>
                  <div class="mt-3 text-lg font-bold text-blue-900">
                    {selectionCount.value} ausgewählt
                  </div>
                  <div class="mt-2 text-xs text-gray-600">
                    ⚠️ Bereits parallele Steps können nicht ausgewählt werden
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 🆕 WORKFLOW PREVIEW MODAL */}
      {showPreview.value && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
            {/* Preview Header */}
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Workflow Vorschau</h2>
                <p class="text-gray-600">{selectedWorkflowType.value} - {workflowSteps.value.length} Schritte</p>
              </div>
              <button
                class="text-gray-400 hover:text-gray-600 p-2"
                onClick$={() => showPreview.value = false}
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview Content */}
            <div class="p-6 overflow-y-auto max-h-[70vh]">
              {workflowSteps.value.length === 0 ? (
                <div class="text-center py-12 text-gray-500">
                  <div class="text-6xl mb-4">📋</div>
                  <h3 class="text-lg font-semibold mb-2">Kein Workflow definiert</h3>
                  <p>Füge Schritte hinzu um eine Vorschau zu sehen.</p>
                </div>
              ) : (
                <div class="workflow-preview-content">
                  {/* Workflow Summary */}
                  <div class="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 class="font-semibold text-gray-900 mb-2">📊 Workflow Übersicht</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span class="text-gray-600">Typ:</span>
                        <div class="font-medium">{selectedWorkflowType.value}</div>
                      </div>
                      <div>
                        <span class="text-gray-600">Schritte:</span>
                        <div class="font-medium">{workflowSteps.value.length}</div>
                      </div>
                      <div>
                        <span class="text-gray-600">Geschätzte Dauer:</span>
                        <div class="font-medium">
                          {workflowSteps.value.reduce((sum, step) => sum + step.estimatedDays, 0)} Tage
                        </div>
                      </div>
                      <div>
                        <span class="text-gray-600">Parallel Gruppen:</span>
                        <div class="font-medium">{parallelGroups.value.length}</div>
                      </div>
                    </div>
                  </div>

                  {/* Steps Timeline */}
                  <div class="space-y-4">
                    {(() => {
                      // Inline timeline generation for preview
                      const workflow = workflowSteps.value;
                      const parallelGroups_val = parallelGroups.value;
                      
                      // Group steps: normal vs parallel
                      const normalSteps = workflow.filter(step => !step.isParallel);
                      const parallelStepsGrouped = parallelGroups_val.map(group => ({
                        ...group,
                        steps: group.steps.map(stepId => workflow.find(s => s.id === stepId)).filter(Boolean)
                      }));
                      
                      // Create combined timeline
                      const timeline: Array<{type: 'step' | 'parallel', content: any, order: number}> = [];
                      
                      // Add normal steps
                      normalSteps.forEach(step => {
                        timeline.push({
                          type: 'step',
                          content: step,
                          order: step.order
                        });
                      });
                      
                      // Add parallel groups
                      parallelStepsGrouped.forEach(group => {
                        if (group.steps.length > 0) {
                          const minOrder = Math.min(...group.steps.map(s => s?.order || 0));
                          timeline.push({
                            type: 'parallel',
                            content: group,
                            order: minOrder
                          });
                        }
                      });
                      
                      const sortedTimeline = timeline.sort((a, b) => a.order - b.order);
                      
                      return sortedTimeline.map((item, index) => (
                        <div key={`preview-${index}`}>
                          {item.type === 'step' ? (
                            // Normal Step Preview
                            <div class="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg preview-step-card">
                              <div class="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {item.order}
                              </div>
                              <div class="flex-1">
                                <div class="flex items-center gap-3 mb-2">
                                  <h4 class="font-semibold text-gray-900">{item.content.title}</h4>
                                  <span class="text-2xl">{getStepIcon(item.content.type)}</span>
                                  <span class={`badge ${
                                    item.content.responsible === 'AG' ? 'badge-blue' :
                                    item.content.responsible === 'AN' ? 'badge-green' :
                                    item.content.responsible === 'SYSTEM' ? 'badge-purple' :
                                    'badge-gray'
                                  }`}>
                                    {item.content.responsible}
                                  </span>
                                  <span class="badge badge-outline">
                                    {item.content.estimatedDays} Tag{item.content.estimatedDays !== 1 ? 'e' : ''}
                                  </span>
                                  {item.content.required && (
                                    <span class="badge badge-red">Erforderlich</span>
                                  )}
                                </div>
                                {item.content.description && (
                                  <p class="text-gray-600 text-sm">{item.content.description}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            // Parallel Group Preview
                            <div class="border-2 border-dashed border-blue-300 rounded-lg p-4 preview-parallel-group" style={`border-color: ${item.content.color}`}>
                              <div class="flex items-center gap-3 mb-4">
                                <div 
                                  class="w-8 h-8 rounded-full flex items-center justify-center text-white text-lg font-bold"
                                  style={`background-color: ${item.content.color}`}
                                >
                                  🔀
                                </div>
                                <h4 class="font-semibold text-gray-900">{item.content.name}</h4>
                                <span class="badge badge-yellow">Parallel</span>
                              </div>
                              
                              {/* Parallel Steps Side by Side */}
                              <div class={`grid gap-3 ${item.content.steps.length === 2 ? 'grid-cols-2' : item.content.steps.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                                {item.content.steps.map((parallelStep: any, pIndex: number) => (
                                  <div key={parallelStep.id} class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div class="flex items-center gap-2 mb-2">
                                      <span class="text-lg">{getStepIcon(parallelStep.type)}</span>
                                      <div class="font-medium text-sm">{parallelStep.title}</div>
                                    </div>
                                    <div class="flex gap-2 text-xs">
                                      <span class={`badge ${
                                        parallelStep.responsible === 'AG' ? 'badge-blue' :
                                        parallelStep.responsible === 'AN' ? 'badge-green' :
                                        parallelStep.responsible === 'SYSTEM' ? 'badge-purple' :
                                        'badge-gray'
                                      }`}>
                                        {parallelStep.responsible}
                                      </span>
                                      <span class="badge badge-outline">
                                        {parallelStep.estimatedDays} Tag{parallelStep.estimatedDays !== 1 ? 'e' : ''}
                                      </span>
                                    </div>
                                    {parallelStep.description && (
                                      <p class="text-gray-600 text-xs mt-2">{parallelStep.description}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                              
                              <div class="mt-3 text-center">
                                <span class="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                  🔗 Alle parallelen Schritte werden gleichzeitig ausgeführt
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Arrow to next step */}
                          {index < sortedTimeline.length - 1 && (
                            <div class="flex justify-center my-3">
                              <div class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                <svg class="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Workflow Summary Footer */}
                  <div class="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 class="font-semibold text-green-900 mb-2">✅ Workflow Zusammenfassung</h4>
                    <div class="text-sm text-green-800">
                      <p>• <strong>{workflowSteps.value.length} Schritte</strong> insgesamt definiert</p>
                      <p>• <strong>{workflowSteps.value.reduce((sum, step) => sum + step.estimatedDays, 0)} Tage</strong> geschätzte Gesamtdauer</p>
                      {parallelGroups.value.length > 0 && (
                        <p>• <strong>{parallelGroups.value.length} parallele Gruppen</strong> für gleichzeitige Bearbeitung</p>
                      )}
                      <p>• <strong>{workflowSteps.value.filter(s => s.required).length}</strong> erforderliche Schritte</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Footer */}
            <div class="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div class="text-sm text-gray-600">
                📅 Erstellt: {new Date().toLocaleDateString('de-DE')} | 
                Version: {(currentConfig.value?.version || 0) + 1}
              </div>
              <div class="flex gap-3">
                <button
                  class="btn btn-secondary"
                  onClick$={() => showPreview.value = false}
                >
                  Schließen
                </button>
                <button
                  class="btn btn-primary"
                  onClick$={() => {
                    showPreview.value = false;
                    saveWorkflow();
                  }}
                >
                  💾 Speichern & Schließen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔧 Enhanced CSS */}
      <style>{`
        .workflow-step-container {
          margin-bottom: 1rem;
        }

        .workflow-step {
          border: 2px solid var(--border-color, #e5e7eb);
          border-radius: 0.75rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .workflow-step:hover {
          border-color: var(--primary-color, #3b82f6);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .workflow-step.selected {
          border-color: var(--primary-color, #3b82f6);
          background: rgba(59, 130, 246, 0.05);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .workflow-step.drag-over {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
          transform: scale(1.02);
        }

        /* 🆕 ENHANCED DRAG & DROP STYLING */
        .workflow-step:hover.droppable {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
          transform: translateY(-2px);
        }
        
        .parallel-group-header.drag-over {
          border-color: #10b981 !important;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%) !important;
          transform: scale(1.02);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.2);
        }
        
        .workflow-step[draggable="false"] {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .drag-hint {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          font-size: 0.75rem;
          animation: bounce 1s infinite;
        }

        /* 🆕 ENHANCED PARALLEL STEP STYLING */
        .parallel-group-container {
          margin-bottom: 2rem;
        }
        
        .parallel-steps-container {
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          max-width: 100%;
        }
        
        /* Handle more than 2 parallel steps */
        .parallel-steps-container.has-many-steps {
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }
        
        .parallel-step-wrapper {
          display: flex;
          flex-direction: column;
          min-width: 0; /* Allow shrinking */
        }
        
        .parallel-step-card {
          position: relative;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          background: white;
          transition: all 0.2s ease;
          min-height: 120px; /* Consistent height */
        }
        
        .parallel-step-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        
        .parallel-step-card.selected {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .parallel-step {
          position: relative;
          margin-left: 3rem !important;
          margin-right: 1rem !important;
        }

        .parallel-step::before {
          content: '';
          position: absolute;
          left: -2.5rem;
          top: 50%;
          width: 1.5rem;
          height: 3px;
          background: linear-gradient(90deg, var(--primary-color, #3b82f6), rgba(59, 130, 246, 0.5));
          border-radius: 2px;
          opacity: 0.7;
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
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .workflow-step-content {
          flex: 1;
          min-width: 0;
        }

        .workflow-step-title {
          font-weight: 600;
          font-size: 1.125rem;
          margin: 0 0 0.25rem 0;
          color: var(--text-color, #111827);
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
          white-space: nowrap;
        }

        .badge-blue { background: #dbeafe; color: #1e40af; }
        .badge-green { background: #d1fae5; color: #065f46; }
        .badge-purple { background: #e9d5ff; color: #7c3aed; }
        .badge-gray { background: #f3f4f6; color: #374151; }
        .badge-red { background: #fee2e2; color: #dc2626; }
        .badge-yellow { background: #fef3c7; color: #92400e; }
        .badge-outline {
          background: white;
          color: #6b7280;
          border: 1px solid #d1d5db;
        }

        .badge-info { background: #e0f2fe; color: #0277bd; }
        .badge-warning { background: #fff3cd; color: #856404; }

        .workflow-canvas {
          min-height: 400px;
          padding: 1rem;
        }

        /* 🆕 ENHANCED PARALLEL GROUP HEADER */
        .parallel-group-header {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 2px solid #e2e8f0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .parallel-merge-arrow {
          display: flex;
          justify-content: center;
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Form Styles */
        .card {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
        }

        .btn, .btn-sm {
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

        .btn-sm {
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
        }

        .btn-primary { background: #3b82f6; color: white; }
        .btn-primary:hover { background: #2563eb; transform: translateY(-1px); }
        .btn-secondary { background: #f3f4f6; color: #374151; }
        .btn-secondary:hover { background: #e5e7eb; }
        .btn-success { background: #10b981; color: white; }
        .btn-success:hover { background: #059669; transform: translateY(-1px); }
        .btn-accent { background: #f59e0b; color: white; }
        .btn-accent:hover { background: #d97706; transform: translateY(-1px); }
        .btn-info { background: #0ea5e9; color: white; }
        .btn-info:hover { background: #0284c7; }
        .btn-warning { background: #f59e0b; color: white; }
        .btn-warning:hover { background: #d97706; }

        .form-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          transition: border-color 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.25rem;
        }

        /* 🆕 ANIMATIONS */
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }

        /* 🆕 PREVIEW MODAL STYLING */
        .workflow-preview-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .workflow-preview-content .badge {
          font-size: 0.625rem;
          padding: 0.125rem 0.375rem;
        }
        
        .preview-modal {
          backdrop-filter: blur(4px);
        }
        
        .preview-step-card {
          transition: all 0.2s ease;
        }
        
        .preview-step-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .preview-parallel-group {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

      `}</style>
    </div>
  );
});
