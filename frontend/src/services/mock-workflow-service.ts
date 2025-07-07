export interface WorkflowStep {
id: string;
title: string;
type: 'TASK' | 'DECISION' | 'APPROVAL' | 'NOTIFICATION' | 'WAIT';
responsible: 'AG' | 'AN' | 'SYSTEM' | 'BOTH';
description: string;
estimatedDays: number;
required: boolean;
conditions: string[];
order: number;
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
}

// Mock data store
const mockWorkflows: Record<string, WorkflowConfiguration> = {
'Kleinanforderung': {
id: 'wf-klein-001',
type: 'Kleinanforderung',
name: 'Standard Kleinanforderung Workflow',
description: 'Standardprozess für kleine Anforderungen',
isActive: true,
version: 1,
createdAt: '2025-01-01T00:00:00Z',
modifiedAt: '2025-01-01T00:00:00Z',
createdBy: 'System',
steps: [
{
id: 'step-1',
title: 'Antrag erstellen',
type: 'TASK',
responsible: 'AG',
description: 'Benutzer erstellt neue Anforderung',
estimatedDays: 1,
required: true,
conditions: [],
order: 1
},
{
id: 'step-2',
title: 'Fachliche Prüfung',
type: 'APPROVAL',
responsible: 'AN',
description: 'Prüfung der fachlichen Anforderungen',
estimatedDays: 3,
required: true,
conditions: [],
order: 2
},
{
id: 'step-3',
title: 'Technische Umsetzung',
type: 'TASK',
responsible: 'AN',
description: 'Implementierung der Anforderung',
estimatedDays: 5,
required: true,
conditions: [],
order: 3
},
{
id: 'step-4',
title: 'Abnahme',
type: 'APPROVAL',
responsible: 'AG',
description: 'Finale Abnahme durch Auftraggeber',
estimatedDays: 2,
required: true,
conditions: [],
order: 4
}
]
},
'Großanforderung': {
id: 'wf-gross-001',
type: 'Großanforderung',
name: 'Standard Großanforderung Workflow',
description: 'Standardprozess für große Anforderungen',
isActive: true,
version: 1,
createdAt: '2025-01-01T00:00:00Z',
modifiedAt: '2025-01-01T00:00:00Z',
createdBy: 'System',
steps: [
{
id: 'step-1',
title: 'Antrag erstellen',
type: 'TASK',
responsible: 'AG',
description: 'Benutzer erstellt neue Anforderung',
estimatedDays: 1,
required: true,
conditions: [],
order: 1
},
{
id: 'step-2',
title: 'Grobanalyse',
type: 'TASK',
responsible: 'AN',
description: 'Grobe Analyse der Anforderungen und Aufwandsschätzung',
estimatedDays: 5,
required: true,
conditions: [],
order: 2
},
{
id: 'step-3',
title: 'Genehmigung Grobanalyse',
type: 'APPROVAL',
responsible: 'AG',
description: 'Genehmigung der Grobanalyse und Budgetfreigabe',
estimatedDays: 3,
required: true,
conditions: [],
order: 3
},
{
id: 'step-4',
title: 'Feinkonzept',
type: 'TASK',
responsible: 'AN',
description: 'Detailliertes Konzept und Architektur',
estimatedDays: 10,
required: true,
conditions: [],
order: 4
},
{
id: 'step-5',
title: 'Freigabe Feinkonzept',
type: 'APPROVAL',
responsible: 'AG',
description: 'Freigabe des detaillierten Konzepts',
estimatedDays: 3,
required: true,
conditions: [],
order: 5
},
{
id: 'step-6',
title: 'Umsetzung',
type: 'TASK',
responsible: 'AN',
description: 'Technische Umsetzung nach Feinkonzept',
estimatedDays: 20,
required: true,
conditions: [],
order: 6
},
{
id: 'step-7',
title: 'Systemtest',
type: 'TASK',
responsible: 'AN',
description: 'Umfassende Tests der Implementierung',
estimatedDays: 5,
required: true,
conditions: [],
order: 7
},
{
id: 'step-8',
title: 'Benutzerakzeptanztest',
type: 'TASK',
responsible: 'AG',
description: 'Test durch die Endbenutzer',
estimatedDays: 3,
required: true,
conditions: [],
order: 8
},
{
id: 'step-9',
title: 'Finale Abnahme',
type: 'APPROVAL',
responsible: 'AG',
description: 'Offizielle Abnahme und Go-Live',
estimatedDays: 2,
required: true,
conditions: [],
order: 9
}
]
},
'TIA-Anforderung': {
id: 'wf-tia-001',
type: 'TIA-Anforderung',
name: 'TIA Anforderung Workflow',
description: 'Workflow für Technik-Infrastruktur-Anpassungen',
isActive: true,
version: 1,
createdAt: '2025-01-01T00:00:00Z',
modifiedAt: '2025-01-01T00:00:00Z',
createdBy: 'System',
steps: [
{
id: 'step-1',
title: 'TIA-Antrag stellen',
type: 'TASK',
responsible: 'AG',
description: 'Antrag für Technik-Infrastruktur-Anpassung',
estimatedDays: 1,
required: true,
conditions: [],
order: 1
},
{
id: 'step-2',
title: 'Infrastruktur-Assessment',
type: 'TASK',
responsible: 'AN',
description: 'Bewertung der aktuellen Infrastruktur',
estimatedDays: 3,
required: true,
conditions: [],
order: 2
},
{
id: 'step-3',
title: 'Sicherheitsprüfung',
type: 'TASK',
responsible: 'SYSTEM',
description: 'Automatische Sicherheits- und Compliance-Prüfung',
estimatedDays: 1,
required: true,
conditions: [],
order: 3
},
{
id: 'step-4',
title: 'Genehmigung TIA',
type: 'APPROVAL',
responsible: 'AG',
description: 'Genehmigung der Infrastruktur-Änderungen',
estimatedDays: 2,
required: true,
conditions: [],
order: 4
},
{
id: 'step-5',
title: 'Umsetzung',
type: 'TASK',
responsible: 'AN',
description: 'Durchführung der Infrastruktur-Anpassungen',
estimatedDays: 7,
required: true,
conditions: [],
order: 5
},
{
id: 'step-6',
title: 'Monitoring Setup',
type: 'TASK',
responsible: 'AN',
description: 'Einrichtung des Monitorings für neue Infrastruktur',
estimatedDays: 2,
required: true,
conditions: [],
order: 6
}
]
}
};

// Simulate API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockWorkflowService {

// Get all workflow configurations
static async getWorkflowConfigurations(): Promise<WorkflowConfiguration[]> {
await delay(300); // Simulate network delay


// Load from localStorage if available, otherwise use defaults
const allConfigs: WorkflowConfiguration[] = [];

for (const [type, defaultConfig] of Object.entries(mockWorkflows)) {
  const stored = localStorage.getItem(`workflow-config-${type}`);
  if (stored) {
    try {
      allConfigs.push(JSON.parse(stored));
    } catch {
      allConfigs.push(defaultConfig);
    }
  } else {
    allConfigs.push(defaultConfig);
  }
}

return allConfigs;


}

// Get workflow configuration by type
static async getWorkflowByType(workflowType: string): Promise<WorkflowConfiguration | null> {
await delay(200);


// Try to load from localStorage first
const stored = localStorage.getItem(`workflow-config-${workflowType}`);
if (stored) {
  try {
    return JSON.parse(stored);
  } catch {
    // Fall back to default if parsing fails
  }
}

// Return default workflow or null
return mockWorkflows[workflowType] || null;


}

// Save workflow configuration
static async saveWorkflowConfiguration(config: WorkflowConfiguration): Promise<WorkflowConfiguration> {
await delay(400);


const savedConfig: WorkflowConfiguration = {
  ...config,
  modifiedAt: new Date().toISOString(),
  version: config.version + 1
};

// Save to localStorage
localStorage.setItem(`workflow-config-${config.type}`, JSON.stringify(savedConfig));

return savedConfig;


}

// Create new workflow configuration
static async createWorkflowConfiguration(type: string, name: string): Promise<WorkflowConfiguration> {
await delay(300);


const newConfig: WorkflowConfiguration = {
  id: `wf-${type.toLowerCase()}-${Date.now()}`,
  type,
  name,
  description: `Neuer Workflow für ${type}`,
  steps: [],
  isActive: false,
  version: 1,
  createdAt: new Date().toISOString(),
  modifiedAt: new Date().toISOString(),
  createdBy: "Current User"
};

localStorage.setItem(`workflow-config-${type}`, JSON.stringify(newConfig));
return newConfig;


}

// Delete workflow configuration
static async deleteWorkflowConfiguration(configId: string, workflowType: string): Promise<boolean> {
await delay(200);


localStorage.removeItem(`workflow-config-${workflowType}`);
return true;


}

// Duplicate workflow configuration
static async duplicateWorkflowConfiguration(configId: string, newName: string): Promise<WorkflowConfiguration> {
await delay(300);


// Find the config to duplicate
for (const [type, defaultConfig] of Object.entries(mockWorkflows)) {
  const stored = localStorage.getItem(`workflow-config-${type}`);
  const config = stored ? JSON.parse(stored) : defaultConfig;
  
  if (config.id === configId) {
    const duplicatedConfig: WorkflowConfiguration = {
      ...config,
      id: `wf-${type.toLowerCase()}-${Date.now()}`,
      name: newName,
      type: `${type} Copy`,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      version: 1
    };
    
    localStorage.setItem(`workflow-config-${duplicatedConfig.type}`, JSON.stringify(duplicatedConfig));
    return duplicatedConfig;
  }
}

throw new Error("Workflow not found");


}

// Toggle workflow active status
static async toggleWorkflowStatus(configId: string, isActive: boolean): Promise<WorkflowConfiguration> {
await delay(200);


// Find and update the workflow
for (const [type] of Object.entries(mockWorkflows)) {
  const stored = localStorage.getItem(`workflow-config-${type}`);
  if (stored) {
    const config = JSON.parse(stored);
    if (config.id === configId) {
      config.isActive = isActive;
      config.modifiedAt = new Date().toISOString();
      localStorage.setItem(`workflow-config-${type}`, JSON.stringify(config));
      return config;
    }
  }
}

throw new Error("Workflow not found");


}

// Validate workflow configuration
static async validateWorkflow(config: WorkflowConfiguration): Promise<{ isValid: boolean; errors: string[] }> {
await delay(150);


const errors: string[] = [];

if (!config.name || config.name.trim().length === 0) {
  errors.push("Workflow-Name ist erforderlich");
}

if (config.steps.length === 0) {
  errors.push("Mindestens ein Workflow-Schritt ist erforderlich");
}

if (config.steps.some(step => !step.title || step.title.trim().length === 0)) {
  errors.push("Alle Schritte müssen einen Titel haben");
}

if (config.steps.some(step => step.estimatedDays <= 0)) {
  errors.push("Geschätzte Dauer muss größer als 0 sein");
}

const hasApprovalSteps = config.steps.some(step => step.type === "APPROVAL");
if (!hasApprovalSteps && config.type !== "TIA-Anforderung") {
  errors.push("Workflow sollte mindestens einen Genehmigungsschritt enthalten");
}

return {
  isValid: errors.length === 0,
  errors
};


}

// Get workflow templates
static async getWorkflowTemplates(): Promise<{ [key: string]: WorkflowConfiguration }> {
await delay(200);
return mockWorkflows;
}

// Export workflow as JSON
static async exportWorkflow(configId: string): Promise<Blob> {
await delay(100);


for (const [type] of Object.entries(mockWorkflows)) {
  const stored = localStorage.getItem(`workflow-config-${type}`);
  if (stored) {
    const config = JSON.parse(stored);
    if (config.id === configId) {
      const exportData = {
        ...config,
        exportedAt: new Date().toISOString(),
        exportedBy: "Current User"
      };
      return new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    }
  }
}

throw new Error("Workflow not found");


}

// Import workflow from JSON
static async importWorkflow(file: File): Promise<WorkflowConfiguration> {
await delay(300);


return new Promise((resolve, reject) => {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target?.result as string);
      
      // Validate imported data
      if (!imported.type || !imported.name || !imported.steps) {
        reject(new Error("Invalid workflow file format"));
        return;
      }
      
      const importedConfig: WorkflowConfiguration = {
        ...imported,
        id: `wf-${imported.type.toLowerCase()}-${Date.now()}`,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        version: 1
      };
      
      localStorage.setItem(`workflow-config-${importedConfig.type}`, JSON.stringify(importedConfig));
      resolve(importedConfig);
    } catch (error) {
      reject(new Error("Failed to parse workflow file"));
    }
  };
  
  reader.onerror = () => reject(new Error("Failed to read file"));
  reader.readAsText(file);
});


}

// Reset workflow to default
static async resetWorkflowToDefault(workflowType: string): Promise<WorkflowConfiguration> {
await delay(200);


const defaultConfig = mockWorkflows[workflowType];
if (!defaultConfig) {
  throw new Error(`No default workflow found for type: ${workflowType}`);
}

// Remove from localStorage to reset to default
localStorage.removeItem(`workflow-config-${workflowType}`);

return defaultConfig;


}

// Get workflow statistics
static async getWorkflowStatistics(workflowType: string): Promise<{
totalSteps: number;
totalEstimatedDays: number;
stepsByType: { [key: string]: number };
stepsByResponsible: { [key: string]: number };
}> {
await delay(100);


const config = await this.getWorkflowByType(workflowType);
if (!config) {
  throw new Error("Workflow not found");
}

const stats = {
  totalSteps: config.steps.length,
  totalEstimatedDays: config.steps.reduce((sum, step) => sum + step.estimatedDays, 0),
  stepsByType: {} as { [key: string]: number },
  stepsByResponsible: {} as { [key: string]: number }
};

config.steps.forEach(step => {
  stats.stepsByType[step.type] = (stats.stepsByType[step.type] || 0) + 1;
  stats.stepsByResponsible[step.responsible] = (stats.stepsByResponsible[step.responsible] || 0) + 1;
});

return stats;


}
}
