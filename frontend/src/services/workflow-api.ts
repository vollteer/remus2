
const API_BASE_URL = 'https://localhost:7068/api/workflow'; 

// Backend DTOs (wie dein Controller sie erwartet)
interface WorkflowStepDto {
  id: string;
  title: string;
  type: 'TASK' | 'REVIEW' | 'APPROVAL' | 'NOTIFICATION' | 'WAIT' | 'END' | 'ESCALATION' | 'REDIRECT';
  responsible: 'AG' | 'AN' | 'SYSTEM' | 'BOTH' | 'Board';
  description: string;
  estimatedDays: number;
  order: number;
  required: boolean;
  permissions?: {
    allowedRoles: string[];
    requiredRoles: string[];
    allowedUsers: string[];
  };
  conditions?: Array<{
    field: string;
    operator: string;
    value: any;
    message?: string;
  }>;
  branches?: {
    [key: string]: string;
  };
  formBinding?: string;
}

interface WorkflowConfigurationDto {
  id?: string;
  name: string;
  type: string; // requirementType
  description?: string;
  isActive: boolean;
  version: number;
  createdAt?: string;
  modifiedAt?: string;
  createdBy?: string;
  modifiedBy?: string;
  steps: WorkflowStepDto[];
  metadata: {
    version: string;
    createdBy: string;
    totalEstimatedDays: number;
  };
}

// Frontend Types (deine bestehenden)
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

export class WorkflowApiService {
  
  // ===========================================
  // MAPPING FUNCTIONS (Backend ↔ Frontend)
  // ===========================================
  
  private static mapDtoToFrontend(dto: WorkflowConfigurationDto): WorkflowConfiguration {
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
      steps: dto.steps.map(step => ({
        id: step.id,
        title: step.title,
        type: this.mapBackendTypeToFrontend(step.type),
        responsible: step.responsible === 'Board' ? 'SYSTEM' : step.responsible, // Map Board -> SYSTEM
        description: step.description,
        estimatedDays: step.estimatedDays,
        required: step.required,
        conditions: this.mapBackendConditionsToFrontend(step.conditions || []),
        order: step.order,
        permissions: step.permissions ? {
          allowedRoles: step.permissions.allowedRoles,
          allowedUsers: step.permissions.allowedUsers,
          denyRoles: [],
          requiresRole: step.permissions.requiredRoles[0],
          requiresAllRoles: step.permissions.requiredRoles,
          requiresAnyRoles: step.permissions.allowedRoles
        } : undefined,
        branches: this.mapBackendBranchesToFrontend(step.branches || {}),
        formBinding: step.formBinding,
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
      }))
    };
  }

  private static mapFrontendToDto(config: WorkflowConfiguration): WorkflowConfigurationDto {
    return {
      id: config.id || undefined,
      name: config.name,
      type: config.type,
      description: config.description,
      isActive: config.isActive,
      version: config.version,
      steps: config.steps.map(step => ({
        id: step.id,
        title: step.title,
        type: this.mapFrontendTypeToBackend(step.type),
        responsible: step.responsible === 'DYNAMIC' ? 'SYSTEM' : step.responsible,
        description: step.description,
        estimatedDays: step.estimatedDays,
        order: step.order,
        required: step.required,
        permissions: step.permissions ? {
          allowedRoles: step.permissions.allowedRoles,
          requiredRoles: step.permissions.requiresAllRoles || [],
          allowedUsers: step.permissions.allowedUsers
        } : {
          allowedRoles: [],
          requiredRoles: [],
          allowedUsers: []
        },
        conditions: this.mapFrontendConditionsToBackend(step.conditions),
        branches: this.mapFrontendBranchesToBackend(step.branches || []),
        formBinding: step.formBinding
      })),
      metadata: {
        version: '1.0',
        createdBy: config.createdBy,
        totalEstimatedDays: config.steps.reduce((sum, step) => sum + step.estimatedDays, 0)
      }
    };
  }

  // Type mapping helpers
  private static mapBackendTypeToFrontend(backendType: WorkflowStepDto['type']): WorkflowStep['type'] {
    switch (backendType) {
      case 'TASK': return 'task';
      case 'REVIEW': case 'APPROVAL': return 'approval';
      case 'NOTIFICATION': return 'notification';
      case 'WAIT': return 'wait';
      case 'END': return 'task';
      case 'ESCALATION': return 'decision';
      case 'REDIRECT': return 'decision';
      default: return 'task';
    }
  }

  private static mapFrontendTypeToBackend(frontendType: WorkflowStep['type']): WorkflowStepDto['type'] {
    switch (frontendType) {
      case 'task': return 'TASK';
      case 'approval': return 'APPROVAL';
      case 'decision': return 'REVIEW';
      case 'notification': return 'NOTIFICATION';
      case 'wait': return 'WAIT';
      case 'parallel': return 'TASK';
      case 'merge': return 'TASK';
      default: return 'TASK';
    }
  }

  private static mapBackendConditionsToFrontend(conditions: any[]): StepCondition[] {
    return conditions.map(condition => ({
      field: condition.field || 'status',
      operator: condition.operator || 'equals',
      value: condition.value,
      action: 'show'
    }));
  }

  private static mapFrontendConditionsToBackend(conditions: StepCondition[]) {
    return conditions.map(condition => ({
      field: condition.field,
      operator: condition.operator,
      value: condition.value,
      message: `${condition.field} ${condition.operator} ${condition.value}`
    }));
  }

  private static mapBackendBranchesToFrontend(branches: { [key: string]: string }): StepBranch[] {
    return Object.entries(branches).map(([condition, targetStepId]) => ({
      condition,
      targetStepId,
      label: condition.charAt(0).toUpperCase() + condition.slice(1),
      description: `Branch für ${condition}`
    }));
  }

  private static mapFrontendBranchesToBackend(branches: StepBranch[]): { [key: string]: string } {
    const result: { [key: string]: string } = {};
    branches.forEach(branch => {
      result[branch.condition] = branch.targetStepId;
    });
    return result;
  }

  // ===========================================
  // API METHODS
  // ===========================================

  // Lade Workflow by Type (Hauptmethode!)
  static async getWorkflowByType(workflowType: string): Promise<WorkflowConfiguration | null> {
    try {
      console.log(`[API] Loading workflow: ${workflowType}`);
      
      const response = await fetch(`${API_BASE_URL}/configuration/${encodeURIComponent(workflowType)}`);
      
      if (response.status === 404) {
        console.log('[API] Workflow not found');
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const dto: WorkflowConfigurationDto = await response.json();
      console.log('[API] Loaded workflow DTO:', dto);
      
      const frontendConfig = this.mapDtoToFrontend(dto);
      console.log('[API] Mapped to frontend config:', frontendConfig);
      
      return frontendConfig;
    } catch (error) {
      console.error('[API] Error loading workflow by type:', error);
      return null;
    }
  }

  // Speichere Workflow
  static async saveWorkflowConfiguration(config: WorkflowConfiguration): Promise<WorkflowConfiguration> {
    try {
      console.log('[API] Saving workflow:', config);
      
      const dto = this.mapFrontendToDto(config);
      console.log('[API] Mapped to DTO:', dto);
      
      const method = config.id && config.id !== '' ? 'PUT' : 'POST';
      const url = (config.id && config.id !== '') 
        ? `${API_BASE_URL}/configuration/${config.id}`
        : `${API_BASE_URL}/configuration`;

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dto)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const savedDto: WorkflowConfigurationDto = await response.json();
      console.log('[API] Saved workflow DTO:', savedDto);
      
      const savedConfig = this.mapDtoToFrontend(savedDto);
      console.log('[API] Mapped saved config:', savedConfig);
      
      return savedConfig;
    } catch (error) {
      console.error('[API] Error saving workflow:', error);
      throw error;
    }
  }

  // Validiere Workflow
  static async validateWorkflow(config: WorkflowConfiguration) {
    try {
      console.log('[API] Validating workflow:', config);
      
      const dto = this.mapFrontendToDto(config);
      
      const response = await fetch(`${API_BASE_URL}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('[API] Validation result:', result);
      
      return {
        isValid: result.isValid || false,
        errors: result.errors || [],
        warnings: result.warnings || []
      };
    } catch (error) {
      console.error('[API] Error validating workflow:', error);
      return { 
        isValid: false, 
        errors: ['API Validierung fehlgeschlagen: ' + error.message],
        warnings: []
      };
    }
  }

  // Import Workflow
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
      console.log('[API] Imported workflow DTO:', dto);
      
      const importedConfig = this.mapDtoToFrontend(dto);
      console.log('[API] Mapped imported config:', importedConfig);
      
      return importedConfig;
    } catch (error) {
      console.error('[API] Error importing workflow:', error);
      throw error;
    }
  }

  // Reset zu Default
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
      console.log('[API] Reset workflow DTO:', dto);
      
      const resetConfig = this.mapDtoToFrontend(dto);
      console.log('[API] Mapped reset config:', resetConfig);
      
      return resetConfig;
    } catch (error) {
      console.error('[API] Error resetting workflow:', error);
      return null;
    }
  }

  // Erstelle neuen Workflow (Fallback wenn keiner existiert)
  static async createEmptyWorkflow(workflowType: string): Promise<WorkflowConfiguration> {
    const emptyConfig: WorkflowConfiguration = {
      id: '',
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

  // Test API Connection
  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/configurations`);
      return response.ok;
    } catch (error) {
      console.error('[API] Connection test failed:', error);
      return false;
    }
  }
