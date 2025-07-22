
const API_BASE_URL = 'https://localhost:7068/api/workflow'; 

// =======================================================
// BACKEND DTOs (exakt wie dein Controller sie liefert)
// =======================================================
interface WorkflowStepDto {
  id: string;
  title: string;
  type: string; // 'TASK', 'REVIEW', 'APPROVAL', etc.
  responsible: string; // 'AG', 'AN', 'SYSTEM', etc.
  description?: string;
  estimatedDays: number;
  order: number;
  required: boolean;
}

interface WorkflowMetadataDto {
  version: string;
  createdBy: string;
  totalEstimatedDays: number;
}

interface WorkflowConfigurationDto {
  id?: string;
  name: string;
  type: string; // Das ist der requirementType
  description?: string;
  isActive: boolean;
  version: number;
  createdAt?: string;
  modifiedAt?: string;
  createdBy?: string;
  modifiedBy?: string;
  steps: WorkflowStepDto[];
  metadata: WorkflowMetadataDto;
}

interface WorkflowValidationResultDto {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// =======================================================
// FRONTEND TYPES (deine bestehenden aus workflow-designer.tsx)
// =======================================================
export interface WorkflowStep {
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

export interface StepCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'isEmpty' | 'isNotEmpty' | 'greaterThan' | 'lessThan' | 'in' | 'notIn';
  value?: string | number | boolean | string[];
  action: 'show' | 'hide' | 'require' | 'skip' | 'branch';
}

export interface StepBranch {
  condition: string;
  targetStepId: string;
  label: string;
  description?: string;
}

export interface StepPermissions {
  allowedRoles: string[];
  allowedUsers: string[];
  denyRoles?: string[];
  requiresRole?: string;
  requiresAllRoles?: string[];
  requiresAnyRoles?: string[];
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

// =======================================================
// MAPPING ZWISCHEN BACKEND DTO ↔ FRONTEND MODEL
// =======================================================
class WorkflowMapper {
  
  // Backend DTO → Frontend Model
  static mapDtoToFrontend(dto: WorkflowConfigurationDto): WorkflowConfiguration {
    return {
      id: dto.id || '',
      type: dto.type,
      name: dto.name,
      description: dto.description,
      isActive: dto.isActive,
      version: dto.version,
      createdAt: dto.createdAt || new Date().toISOString(),
      modifiedAt: dto.modifiedAt || new Date().toISOString(),
      createdBy: dto.createdBy || 'system',
      steps: this.mapStepsToFrontend(dto.steps || [])
    };
  }

  // Frontend Model → Backend DTO  
  static mapFrontendToDto(config: WorkflowConfiguration): WorkflowConfigurationDto {
    return {
      id: config.id || undefined,
      name: config.name,
      type: config.type,
      description: config.description,
      isActive: config.isActive,
      version: config.version,
      createdAt: config.createdAt,
      modifiedAt: config.modifiedAt,
      createdBy: config.createdBy,
      modifiedBy: config.createdBy,
      steps: this.mapStepsToDto(config.steps),
      metadata: {
        version: '1.0',
        createdBy: config.createdBy,
        totalEstimatedDays: config.steps.reduce((sum, step) => sum + step.estimatedDays, 0)
      }
    };
  }

  // Backend Steps → Frontend Steps
  private static mapStepsToFrontend(dtoSteps: WorkflowStepDto[]): WorkflowStep[] {
    return dtoSteps.map(step => ({
      id: step.id,
      title: step.title,
      type: this.mapStepTypeToFrontend(step.type),
      responsible: this.mapResponsibleToFrontend(step.responsible),
      description: step.description || '',
      estimatedDays: step.estimatedDays,
      required: step.required,
      conditions: [], // Default leer
      order: step.order,
      permissions: {
        allowedRoles: [],
        allowedUsers: [],
        denyRoles: []
      },
      branches: [],
      formBinding: undefined,
      autoAssign: false,
      escalation: {
        enabled: false,
        afterDays: 7,
        escalateTo: []
      },
      notifications: {
        onStart: false,
        onComplete: false,
        onOverdue: false,
        recipients: []
      }
    }));
  }

  // Frontend Steps → Backend Steps
  private static mapStepsToDto(frontendSteps: WorkflowStep[]): WorkflowStepDto[] {
    return frontendSteps.map(step => ({
      id: step.id,
      title: step.title,
      type: this.mapStepTypeToBackend(step.type),
      responsible: this.mapResponsibleToBackend(step.responsible),
      description: step.description,
      estimatedDays: step.estimatedDays,
      order: step.order,
      required: step.required
    }));
  }

  // Type Mapping Helpers
  private static mapStepTypeToFrontend(backendType: string): WorkflowStep['type'] {
    switch (backendType.toUpperCase()) {
      case 'TASK': return 'task';
      case 'REVIEW': 
      case 'APPROVAL': return 'approval';
      case 'DECISION': return 'decision';
      case 'NOTIFICATION': return 'notification';
      case 'WAIT': return 'wait';
      case 'PARALLEL': return 'parallel';
      case 'MERGE': return 'merge';
      default: return 'task';
    }
  }

  private static mapStepTypeToBackend(frontendType: WorkflowStep['type']): string {
    switch (frontendType) {
      case 'task': return 'TASK';
      case 'approval': return 'APPROVAL';
      case 'decision': return 'REVIEW';
      case 'notification': return 'NOTIFICATION';
      case 'wait': return 'WAIT';
      case 'parallel': return 'PARALLEL';
      case 'merge': return 'MERGE';
      default: return 'TASK';
    }
  }

  private static mapResponsibleToFrontend(backendResponsible: string): WorkflowStep['responsible'] {
    switch (backendResponsible) {
      case 'AG': return 'AG';
      case 'AN': return 'AN';
      case 'SYSTEM': return 'SYSTEM';
      case 'BOTH': return 'BOTH';
      case 'DYNAMIC': return 'DYNAMIC';
      default: return 'SYSTEM';
    }
  }

  private static mapResponsibleToBackend(frontendResponsible: WorkflowStep['responsible']): string {
    switch (frontendResponsible) {
      case 'AG': return 'AG';
      case 'AN': return 'AN';
      case 'SYSTEM': return 'SYSTEM';
      case 'BOTH': return 'BOTH';
      case 'DYNAMIC': return 'DYNAMIC';
      default: return 'SYSTEM';
    }
  }
}

// =======================================================
// API SERVICE (nutzt deinen bestehenden Controller!)
// =======================================================
export class WorkflowApiService {
  
  // 🎯 HAUPTMETHODE: Nutzt deine GetWorkflowByType Controller-Methode
  static async getWorkflowByType(workflowType: string): Promise<WorkflowConfiguration | null> {
    try {
      console.log(`[API] Loading workflow for type: ${workflowType}`);
      
      // API Call zu deinem WorkflowController.GetWorkflowByType
      const response = await fetch(`${API_BASE_URL}/configuration/${encodeURIComponent(workflowType)}`);
      
      if (response.status === 404) {
        console.log('[API] No workflow found for this type');
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Dein Controller liefert WorkflowConfigurationDto
      const dto: WorkflowConfigurationDto = await response.json();
      console.log('[API] Controller response DTO:', dto);
      
      // Convert DTO → Frontend Model
      const frontendConfig = WorkflowMapper.mapDtoToFrontend(dto);
      console.log('[API] Mapped to frontend model:', frontendConfig);
      
      return frontendConfig;
    } catch (error) {
      console.error('[API] Error loading workflow:', error);
      return null;
    }
  }

  // 💾 Speichere über deine Controller Endpoints
  static async saveWorkflowConfiguration(config: WorkflowConfiguration): Promise<WorkflowConfiguration> {
    try {
      console.log('[API] Saving workflow:', config);
      
      // Convert Frontend → DTO
      const dto = WorkflowMapper.mapFrontendToDto(config);
      console.log('[API] Mapped to DTO:', dto);
      
      const method = config.id && config.id !== '' ? 'PUT' : 'POST';
      const url = (config.id && config.id !== '') 
        ? `${API_BASE_URL}/configuration/${config.id}`
        : `${API_BASE_URL}/configuration`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      // Controller Response → Frontend Model
      const savedDto: WorkflowConfigurationDto = await response.json();
      console.log('[API] Saved DTO response:', savedDto);
      
      const savedConfig = WorkflowMapper.mapDtoToFrontend(savedDto);
      console.log('[API] Mapped saved config:', savedConfig);
      
      return savedConfig;
    } catch (error) {
      console.error('[API] Error saving workflow:', error);
      throw error;
    }
  }

  // ✅ Nutzt deine Validate Controller-Methode
  static async validateWorkflow(config: WorkflowConfiguration) {
    try {
      console.log('[API] Validating workflow:', config);
      
      const dto = WorkflowMapper.mapFrontendToDto(config);
      
      const response = await fetch(`${API_BASE_URL}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result: WorkflowValidationResultDto = await response.json();
      console.log('[API] Validation result:', result);
      
      return {
        isValid: result.isValid,
        errors: result.errors || [],
        warnings: result.warnings || []
      };
    } catch (error) {
      console.error('[API] Validation error:', error);
      return { 
        isValid: false, 
        errors: ['API Validierung fehlgeschlagen: ' + error.message],
        warnings: []
      };
    }
  }

  // 📁 Import über deine Controller-Methode
  static async importWorkflow(file: File): Promise<WorkflowConfiguration> {
    try {
      console.log('[API] Importing workflow from file:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/import`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const dto: WorkflowConfigurationDto = await response.json();
      console.log('[API] Imported DTO:', dto);
      
      const frontendConfig = WorkflowMapper.mapDtoToFrontend(dto);
      console.log('[API] Mapped imported config:', frontendConfig);
      
      return frontendConfig;
    } catch (error) {
      console.error('[API] Import error:', error);
      throw error;
    }
  }

  // 🔄 Reset über deine Controller-Methode
  static async resetWorkflowToDefault(workflowType: string): Promise<WorkflowConfiguration | null> {
    try {
      console.log('[API] Resetting workflow to default:', workflowType);
      
      const response = await fetch(`${API_BASE_URL}/reset/${encodeURIComponent(workflowType)}`, {
        method: 'POST'
      });

      if (response.status === 404) {
        console.log('[API] No default template found');
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const dto: WorkflowConfigurationDto = await response.json();
      console.log('[API] Reset DTO:', dto);
      
      const frontendConfig = WorkflowMapper.mapDtoToFrontend(dto);
      console.log('[API] Mapped reset config:', frontendConfig);
      
      return frontendConfig;
    } catch (error) {
      console.error('[API] Reset error:', error);
      return null;
    }
  }

  // 🆕 Erstelle leeren Workflow (Fallback wenn keiner existiert)
  static async createEmptyWorkflow(workflowType: string): Promise<WorkflowConfiguration> {
    const emptyConfig: WorkflowConfiguration = {
      id: '', // Wird vom Backend gesetzt
      type: workflowType,
      name: `Workflow für ${workflowType}`,
      description: `Standard-Workflow für ${workflowType}`,
      steps: [],
      isActive: false,
      version: 1,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      createdBy: 'system'
    };

    return await this.saveWorkflowConfiguration(emptyConfig);
  }

  // 🧪 Test API Connection
  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/configurations`);
      return response.ok;
    } catch (error) {
      console.error('[API] Connection test failed:', error);
      return false;
    }
  }

  // 📋 Lade alle Workflow Templates (nutzt deine Templates Controller-Methode)
  static async getWorkflowTemplates() {
    try {
      const response = await fetch(`${API_BASE_URL}/templates`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const templates = await response.json();
      console.log('[API] Workflow templates:', templates);
      
      return templates;
    } catch (error) {
      console.error('[API] Error loading templates:', error);
      return {};
    }
  }
}

// =======================================================
// USAGE EXAMPLE:
// =======================================================

/*
// In deinem workflow-designer.tsx:

const loadWorkflow = $(async (workflowType: string) => {
  try {
    // Lädt echte Daten über deinen WorkflowController.GetWorkflowByType!
    const config = await WorkflowApiService.getWorkflowByType(workflowType);
    
    if (config) {
      // Workflow aus DB geladen - Steps sind im config.steps Array!
      console.log('Loaded workflow steps:', config.steps);
      currentConfig.value = config;
      workflowSteps.value = [...config.steps]; // 🎯 HIER KOMMEN DIE STEPS HER!
      showToastMessage(`Workflow "${workflowType}" geladen (${config.steps.length} Steps)`, 'success');
    } else {
      // Kein Workflow für diesen Type in DB
      const newConfig = await WorkflowApiService.createEmptyWorkflow(workflowType);
      currentConfig.value = newConfig;
      workflowSteps.value = [];
      showToastMessage(`Neuer Workflow "${workflowType}" erstellt`, 'info');
    }
  } catch (error) {
    showToastMessage(`Fehler: ${error.message}`, 'error');
  }
});
*/
