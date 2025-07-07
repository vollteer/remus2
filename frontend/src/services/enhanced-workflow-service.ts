export interface StepPermissions {
allowedRoles: string[];
allowedUsers: string[];
denyRoles?: string[];
requiresRole?: string; // Must have this specific role
requiresAllRoles?: string[]; // Must have ALL these roles
requiresAnyRoles?: string[]; // Must have ANY of these roles
}

export interface StepCondition {
field: string;
operator: 'equals' | 'notEquals' | 'contains' | 'isEmpty' | 'isNotEmpty' | 'greaterThan' | 'lessThan' | 'in' | 'notIn';
value?: string | number | boolean | string[];
action: 'show' | 'hide' | 'require' | 'skip' | 'branch';
}

export interface StepBranch {
condition: string; // e.g., 'approved', 'rejected', 'needsMoreInfo'
targetStepId: string;
label: string;
description?: string;
}

export interface WorkflowStep {
id: string;
title: string;
type: 'task' | 'decision' | 'approval' | 'notification' | 'wait' | 'parallel' | 'merge';
responsible: 'AG' | 'AN' | 'SYSTEM' | 'BOTH' | 'DYNAMIC'; // DYNAMIC = determined at runtime
description: string;
estimatedDays: number;
required: boolean;
conditions: StepCondition[];
order: number;

// NEW: Enhanced features
permissions: StepPermissions;
branches?: StepBranch[]; // For decision/approval steps
formBinding?: string; // ID of specific form for this step
parallelSteps?: string[]; // For parallel execution
autoAssign?: boolean; // Auto-assign based on role
escalation?: {
enabled: boolean;
afterDays: number;
escalateTo: string[]; // Roles or specific users
};
notifications?: {
onStart: boolean;
onComplete: boolean;
onOverdue: boolean;
recipients: string[]; // Roles or users
};
}

export interface WorkflowMetadata {
version: string;
createdBy: string;
totalEstimatedDays: number;
supportsBranching: boolean;
supportsParallel: boolean;
defaultAssignmentRules: Record<string, string[]>; // stepType -> roles
}

export interface WorkflowConfiguration {
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
metadata: WorkflowMetadata;
}

// Enhanced step templates with permissions
export const enhancedStepTemplates = [
{
id: 'template-task',
title: 'Aufgabe',
type: 'task' as const,
icon: '📋',
color: 'rgb(0, 158, 227)',
defaultPermissions: {
allowedRoles: ['Requester', 'TechnicalLead'],
allowedUsers: [],
denyRoles: ['External']
},
description: 'Standard Arbeitsschritt'
},
{
id: 'template-approval',
title: 'Genehmigung',
type: 'approval' as const,
icon: '✅',
color: '#10b981',
defaultPermissions: {
allowedRoles: ['Approver', 'Manager'],
allowedUsers: [],
requiresRole: 'Approver'
},
description: 'Genehmigungsschritt mit Verzweigung',
defaultBranches: [
{ condition: 'approved', targetStepId: 'next', label: 'Genehmigt' },
{ condition: 'rejected', targetStepId: 'end', label: 'Abgelehnt' },
{ condition: 'needsInfo', targetStepId: 'previous', label: 'Weitere Infos' }
]
},
{
id: 'template-decision',
title: 'Entscheidung',
type: 'decision' as const,
icon: '🔀',
color: '#f59e0b',
defaultPermissions: {
allowedRoles: ['Manager', 'TechnicalLead'],
allowedUsers: [],
requiresAnyRoles: ['Manager', 'TechnicalLead']
},
description: 'Entscheidungsschritt mit mehreren Pfaden',
defaultBranches: [
{ condition: 'path_a', targetStepId: 'step_a', label: 'Pfad A' },
{ condition: 'path_b', targetStepId: 'step_b', label: 'Pfad B' }
]
},
{
id: 'template-notification',
title: 'Benachrichtigung',
type: 'notification' as const,
icon: '📧',
color: '#8b5cf6',
defaultPermissions: {
allowedRoles: ['SYSTEM'],
allowedUsers: [],
denyRoles: []
},
description: 'Automatische Benachrichtigung'
},
{
id: 'template-parallel',
title: 'Parallele Schritte',
type: 'parallel' as const,
icon: '⚡',
color: '#06b6d4',
defaultPermissions: {
allowedRoles: ['Manager', 'TechnicalLead'],
allowedUsers: [],
requiresRole: 'Manager'
},
description: 'Startet mehrere parallele Schritte'
}
];

// Enhanced default workflow configurations
const enhancedDefaultWorkflows: Record<string, WorkflowConfiguration> = {
'Kleinanforderung': {
id: 'wf-klein-enhanced-001',
type: 'Kleinanforderung',
name: 'Enhanced Kleinanforderung Workflow',
description: 'Workflow mit Berechtigungen und Verzweigungen',
isActive: true,
version: 1,
createdAt: '2025-01-01T00:00:00Z',
modifiedAt: '2025-01-01T00:00:00Z',
createdBy: 'System',
metadata: {
version: '2.0',
createdBy: 'System',
totalEstimatedDays: 11,
supportsBranching: true,
supportsParallel: false,
defaultAssignmentRules: {
'task': ['Requester', 'TechnicalLead'],
'approval': ['Approver', 'Manager'],
'decision': ['Manager']
}
},
steps: [
{
id: 'step-1',
title: 'Antrag erstellen',
type: 'task',
responsible: 'AG',
description: 'Benutzer erstellt neue Anforderung',
estimatedDays: 1,
required: true,
conditions: [],
order: 1,
permissions: {
allowedRoles: ['Requester'],
allowedUsers: [],
denyRoles: ['External']
},
formBinding: 'form-klein-enhanced-001',
autoAssign: true,
notifications: {
onStart: true,
onComplete: true,
onOverdue: false,
recipients: ['Requester']
}
},
{
id: 'step-2',
title: 'Budget-Prüfung',
type: 'decision',
responsible: 'AN',
description: 'Automatische Budget-Prüfung basierend auf Anforderungsart',
estimatedDays: 0,
required: true,
conditions: [
{
field: 'budget',
operator: 'greaterThan',
value: 5000,
action: 'branch'
}
],
order: 2,
permissions: {
allowedRoles: ['SYSTEM'],
allowedUsers: [],
denyRoles: []
},
branches: [
{
condition: 'budget_high',
targetStepId: 'step-3',
label: 'Budget > 5000€ → Manager-Genehmigung',
description: 'Hoher Budget-Betrag erfordert Manager-Genehmigung'
},
{
condition: 'budget_low',
targetStepId: 'step-4',
label: 'Budget ≤ 5000€ → Direkt zur Umsetzung',
description: 'Niedriger Budget-Betrag kann direkt umgesetzt werden'
}
]
},
{
id: 'step-3',
title: 'Manager-Genehmigung',
type: 'approval',
responsible: 'AN',
description: 'Genehmigung durch Manager bei höherem Budget',
estimatedDays: 2,
required: true,
conditions: [],
order: 3,
permissions: {
allowedRoles: ['Manager', 'Approver'],
allowedUsers: [],
requiresRole: 'Manager'
},
branches: [
{
condition: 'approved',
targetStepId: 'step-4',
label: 'Genehmigt → Umsetzung',
description: 'Anforderung wurde genehmigt'
},
{
condition: 'rejected',
targetStepId: 'step-end',
label: 'Abgelehnt → Workflow beenden',
description: 'Anforderung wurde abgelehnt'
},
{
condition: 'needsInfo',
targetStepId: 'step-1',
label: 'Weitere Infos → Zurück zum Antrag',
description: 'Weitere Informationen erforderlich'
}
],
escalation: {
enabled: true,
afterDays: 3,
escalateTo: ['Administrator']
},
notifications: {
onStart: true,
onComplete: true,
onOverdue: true,
recipients: ['Manager', 'Requester']
}
},
{
id: 'step-4',
title: 'Technische Umsetzung',
type: 'task',
responsible: 'AN',
description: 'Implementierung der Anforderung',
estimatedDays: 5,
required: true,
conditions: [],
order: 4,
permissions: {
allowedRoles: ['TechnicalLead', 'Developer'],
allowedUsers: [],
requiresAnyRoles: ['TechnicalLead', 'Developer']
},
autoAssign: true,
notifications: {
onStart: true,
onComplete: true,
onOverdue: true,
recipients: ['TechnicalLead', 'Requester']
}
},
{
id: 'step-5',
title: 'Abnahme',
type: 'approval',
responsible: 'AG',
description: 'Finale Abnahme durch Auftraggeber',
estimatedDays: 2,
required: true,
conditions: [],
order: 5,
permissions: {
allowedRoles: ['Requester', 'BusinessUser'],
allowedUsers: [],
requiresAnyRoles: ['Requester', 'BusinessUser']
},
branches: [
{
condition: 'accepted',
targetStepId: 'step-end',
label: 'Abgenommen → Workflow abgeschlossen',
description: 'Anforderung erfolgreich abgenommen'
},
{
condition: 'rejected',
targetStepId: 'step-4',
label: 'Nachbesserung → Zurück zur Umsetzung',
description: 'Nachbesserungen erforderlich'
}
],
notifications: {
onStart: true,
onComplete: true,
onOverdue: true,
recipients: ['Requester', 'TechnicalLead']
}
}
]
},

'Großanforderung': {
id: 'wf-gross-enhanced-001',
type: 'Großanforderung',
name: 'Enhanced Großanforderung Workflow',
description: 'Komplexer Workflow mit parallelen Schritten',
isActive: true,
version: 1,
createdAt: '2025-01-01T00:00:00Z',
modifiedAt: '2025-01-01T00:00:00Z',
createdBy: 'System',
metadata: {
version: '2.0',
createdBy: 'System',
totalEstimatedDays: 35,
supportsBranching: true,
supportsParallel: true,
defaultAssignmentRules: {
'task': ['TechnicalLead', 'BusinessUser'],
'approval': ['Manager', 'Approver'],
'decision': ['Manager', 'TechnicalLead'],
'parallel': ['Manager']
}
},
steps: [
{
id: 'step-1',
title: 'Antrag erstellen',
type: 'task',
responsible: 'AG',
description: 'Detaillierter Antrag für Großanforderung',
estimatedDays: 2,
required: true,
conditions: [],
order: 1,
permissions: {
allowedRoles: ['Requester', 'BusinessUser'],
allowedUsers: [],
denyRoles: ['External']
},
formBinding: 'form-gross-enhanced-001',
autoAssign: true
},
{
id: 'step-2',
title: 'Parallel: Analyse & Budget-Check',
type: 'parallel',
responsible: 'AN',
description: 'Parallel laufende Grobanalyse und Budget-Prüfung',
estimatedDays: 5,
required: true,
conditions: [],
order: 2,
permissions: {
allowedRoles: ['Manager', 'TechnicalLead'],
allowedUsers: [],
requiresRole: 'Manager'
},
parallelSteps: ['step-2a', 'step-2b']
},
{
id: 'step-2a',
title: 'Grobanalyse',
type: 'task',
responsible: 'AN',
description: 'Technische Grobanalyse der Anforderungen',
estimatedDays: 5,
required: true,
conditions: [],
order: 2,
permissions: {
allowedRoles: ['TechnicalLead', 'Architect'],
allowedUsers: [],
requiresRole: 'TechnicalLead'
}
},
{
id: 'step-2b',
title: 'Budget-Analyse',
type: 'task',
responsible: 'AN',
description: 'Detaillierte Budget- und ROI-Analyse',
estimatedDays: 3,
required: true,
conditions: [],
order: 2,
permissions: {
allowedRoles: ['Manager', 'Controller'],
allowedUsers: [],
requiresAnyRoles: ['Manager', 'Controller']
}
},
{
id: 'step-3',
title: 'Go/No-Go Entscheidung',
type: 'decision',
responsible: 'AN',
description: 'Entscheidung über Projektfortsetzung',
estimatedDays: 2,
required: true,
conditions: [],
order: 3,
permissions: {
allowedRoles: ['Manager', 'Executive'],
allowedUsers: [],
requiresRole: 'Manager'
},
branches: [
{
condition: 'go',
targetStepId: 'step-4',
label: 'GO → Feinkonzept erstellen',
description: 'Projekt wird fortgesetzt'
},
{
condition: 'no_go',
targetStepId: 'step-end',
label: 'NO-GO → Projekt beenden',
description: 'Projekt wird nicht fortgesetzt'
},
{
condition: 'conditional',
targetStepId: 'step-1',
label: 'Bedingtes GO → Überarbeitung',
description: 'Projekt mit Auflagen überarbeiten'
}
]
}
]
}
};

// Simulate API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class EnhancedWorkflowService {

// Get workflow configuration with permission filtering
static async getWorkflowConfiguration(
workflowType: string,
userRoles: string[] = []
): Promise<WorkflowConfiguration | null> {
await delay(200);


const stored = localStorage.getItem(`enhanced-workflow-config-${workflowType}`);
let config: WorkflowConfiguration;

if (stored) {
  try {
    config = JSON.parse(stored);
  } catch {
    config = enhancedDefaultWorkflows[workflowType];
  }
} else {
  config = enhancedDefaultWorkflows[workflowType];
}

if (!config) return null;

// Filter steps based on user permissions
return this.filterWorkflowByPermissions(config, userRoles);


}

// Filter workflow steps based on user permissions
static filterWorkflowByPermissions(
config: WorkflowConfiguration,
userRoles: string[] = []
): WorkflowConfiguration {


// Admin check
if (userRoles.includes("Administrator")) {
  return config; // Admin sees everything
}

// Filter steps based on permissions
const filteredSteps = config.steps.map(step => {
  // Check if user can see this step
  const canView = this.checkStepPermissions(step.permissions, userRoles);
  
  if (!canView) {
    // Hide step details but keep structure for workflow visualization
    return {
      ...step,
      title: "Eingeschränkter Zugriff",
      description: "Sie haben keine Berechtigung für diesen Schritt",
      permissions: step.permissions
    };
  }
  
  return step;
});

return {
  ...config,
  steps: filteredSteps
};


}

// Check step permissions
static checkStepPermissions(permissions: StepPermissions, userRoles: string[]): boolean {
// Check deny roles first
if (permissions.denyRoles?.some(role => userRoles.includes(role))) {
return false;
}


// Check required specific role
if (permissions.requiresRole && !userRoles.includes(permissions.requiresRole)) {
  return false;
}

// Check requires ALL roles
if (permissions.requiresAllRoles && !permissions.requiresAllRoles.every(role => userRoles.includes(role))) {
  return false;
}

// Check requires ANY roles
if (permissions.requiresAnyRoles && !permissions.requiresAnyRoles.some(role => userRoles.includes(role))) {
  return false;
}

// Check allowed roles
if (permissions.allowedRoles?.length > 0) {
  return permissions.allowedRoles.some(role => userRoles.includes(role));
}

return true; // Default allow


}

// Save enhanced workflow configuration
static async saveWorkflowConfiguration(config: WorkflowConfiguration): Promise<WorkflowConfiguration> {
await delay(400);


const savedConfig: WorkflowConfiguration = {
  ...config,
  modifiedAt: new Date().toISOString(),
  version: config.version + 1,
  metadata: {
    ...config.metadata,
    totalEstimatedDays: config.steps.reduce((sum, step) => sum + step.estimatedDays, 0)
  }
};

localStorage.setItem(`enhanced-workflow-config-${config.type}`, JSON.stringify(savedConfig));
return savedConfig;


}

// Validate workflow with branching logic
static async validateWorkflow(config: WorkflowConfiguration): Promise<{ isValid: boolean; errors: string[] }> {
await delay(150);


const errors: string[] = [];

if (!config.name || config.name.trim().length === 0) {
  errors.push("Workflow-Name ist erforderlich");
}

if (config.steps.length === 0) {
  errors.push("Mindestens ein Schritt ist erforderlich");
}

// Validate step permissions
config.steps.forEach((step, index) => {
  if (!step.permissions?.allowedRoles || step.permissions.allowedRoles.length === 0) {
    errors.push(`Schritt ${index + 1}: Keine Berechtigungen definiert`);
  }
  
  // Validate branches
  if (step.branches) {
    step.branches.forEach((branch, branchIndex) => {
      if (!branch.targetStepId || branch.targetStepId.trim().length === 0) {
        errors.push(`Schritt ${index + 1}, Verzweigung ${branchIndex + 1}: Ziel-Schritt fehlt`);
      }
    });
  }
});

// Check for orphaned steps (steps that can't be reached)
const reachableSteps = new Set<string>();
const findReachableSteps = (stepId: string) => {
  if (reachableSteps.has(stepId)) return;
  reachableSteps.add(stepId);
  
  const step = config.steps.find(s => s.id === stepId);
  if (step?.branches) {
    step.branches.forEach(branch => {
      if (branch.targetStepId !== "step-end") {
        findReachableSteps(branch.targetStepId);
      }
    });
  }
};

if (config.steps.length > 0) {
  findReachableSteps(config.steps[0].id);
}

const orphanedSteps = config.steps.filter(step => !reachableSteps.has(step.id));
if (orphanedSteps.length > 0) {
  errors.push(`Nicht erreichbare Schritte gefunden: ${orphanedSteps.map(s => s.title).join(", ")}`);
}

return {
  isValid: errors.length === 0,
  errors
};


}

// Get next possible steps based on current step and conditions
static async getNextSteps(
workflowType: string,
currentStepId: string,
formData: Record<string, any> = {}
): Promise<{ stepId: string; condition: string; label: string }[]> {
await delay(100);


const config = await this.getWorkflowConfiguration(workflowType);
if (!config) return [];

const currentStep = config.steps.find(step => step.id === currentStepId);
if (!currentStep?.branches) {
  // No branches, find next step by order
  const nextStep = config.steps.find(step => step.order === currentStep.order + 1);
  return nextStep ? [{ stepId: nextStep.id, condition: "next", label: nextStep.title }] : [];
}

// Evaluate conditions for branches
const possibleSteps: { stepId: string; condition: string; label: string }[] = [];

for (const branch of currentStep.branches) {
  // Evaluate conditions here (simplified)
  const conditionMet = this.evaluateBranchCondition(branch.condition, formData);
  
  if (conditionMet || branch.condition === "default") {
    possibleSteps.push({
      stepId: branch.targetStepId,
      condition: branch.condition,
      label: branch.label
    });
  }
}

return possibleSteps;


}

// Evaluate branch conditions (simplified)
private static evaluateBranchCondition(condition: string, formData: Record<string, any>): boolean {
// This is a simplified evaluation - in reality, this would be more complex
switch (condition) {
case 'budget_high':
return (formData.budget || 0) > 5000;
case 'budget_low':
return (formData.budget || 0) <= 5000;
case 'approved':
return formData.approvalStatus === 'approved';
case 'rejected':
return formData.approvalStatus === 'rejected';
case 'needsInfo':
return formData.approvalStatus === 'needsInfo';
default:
return false;
}
}

// Get step templates with enhanced features
static async getStepTemplates() {
await delay(100);
return enhancedStepTemplates;
}

// Get available roles for permission assignment
static async getAvailableRoles(): Promise<{ value: string; label: string; description: string }[]> {
await delay(100);
return [
{ value: 'Administrator', label: 'Administrator', description: 'Vollzugriff auf alle Funktionen' },
{ value: 'Manager', label: 'Manager', description: 'Genehmigungen und Workflow-Management' },
{ value: 'Approver', label: 'Genehmiger', description: 'Kann Anforderungen genehmigen' },
{ value: 'Requester', label: 'Antragsteller', description: 'Kann Anforderungen erstellen' },
{ value: 'TechnicalLead', label: 'Technischer Leiter', description: 'Technische Bewertung und Umsetzung' },
{ value: 'BusinessUser', label: 'Fachbenutzer', description: 'Fachliche Expertise' },
{ value: 'Developer', label: 'Entwickler', description: 'Technische Umsetzung' },
{ value: 'Architect', label: 'Architekt', description: 'System-Architektur' },
{ value: 'Controller', label: 'Controller', description: 'Budget und Controlling' },
{ value: 'Executive', label: 'Geschäftsführung', description: 'Strategische Entscheidungen' },
{ value: 'Viewer', label: 'Betrachter', description: 'Nur Lesezugriff' },
{ value: 'External', label: 'Extern', description: 'Externer Benutzer' }
];
}
}

