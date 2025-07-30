// =======================================================
// src/services/api/workflow-api-service.ts
// 🔗 Echter API Service für deinen WorkflowController
// =======================================================

const API_BASE_URL = 'https://localhost:7100/api/workflow';

// ================ BACKEND DTO INTERFACES ================

interface WorkflowConfigurationDto {
  id: string;
  type: string;
  name: string;
  description?: string;
  steps: WorkflowStepDto[];
  isActive: boolean;
  version: number;
  createdAt: string;
  modifiedAt: string;
  createdBy: string;
}

interface WorkflowStepDto {
  id: string;
  title: string;
  type: 'TASK' | 'APPROVAL' | 'DECISION' | 'NOTIFICATION' | 'WAIT';
  responsible: 'AG' | 'AN' | 'SYSTEM' | 'BOTH';
  description: string;
  estimatedDays: number;
  required: boolean;
  conditions: string[];
  order: number;
  isParallel?: boolean;
  parallelGroup?: string;
  parallelPosition?: number;
}

interface CreateWorkflowConfigurationDto {
  type: string;
  name: string;
  description?: string;
  steps: WorkflowStepDto[];
  isActive: boolean;
}

interface UpdateWorkflowConfigurationDto {
  name: string;
  description?: string;
  steps: WorkflowStepDto[];
  isActive: boolean;
}

interface WorkflowValidationResultDto {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ================ MAPPING FUNCTIONS ================

class WorkflowMapper {
  
  // DTO → Frontend Model
  static mapDtoToFrontend(dto: WorkflowConfigurationDto): any {
    return {
      id: dto.id,
      type: dto.type,
      name: dto.name,
      description: dto.description,
      steps: dto.steps?.map(step => ({
        id: step.id,
        title: step.title,
        type: step.type.toLowerCase() as any,
        responsible: step.responsible,
        description: step.description,
        estimatedDays: step.estimatedDays,
        required: step.required,
        conditions: step.conditions || [],
        order: step.order,
        isParallel: step.isParallel || false,
        parallelGroup: step.parallelGroup,
        parallelPosition: step.parallelPosition || 0,
        // Default values for additional frontend properties
        permissions: { allowedRoles: ['Requester', 'TechnicalLead'], allowedUsers: [] },
        branches: [],
        autoAssign: false,
        notifications: {
          onStart: false,
          onComplete: false,
          onOverdue: false,
          recipients: []
        }
      })) || [],
      isActive: dto.isActive,
      version: dto.version,
      createdAt: dto.createdAt,
      modifiedAt: dto.modifiedAt,
      createdBy: dto.createdBy
    };
  }

  // Frontend Model → DTO
  static mapFrontendToDto(config: any): WorkflowConfigurationDto {
    return {
      id: config.id,
      type: config.type,
      name: config.name,
      description: config.description,
      steps: config.steps.map((step: any) => ({
        id: step.id,
        title: step.title,
        type: step.type.toUpperCase() as any,
        responsible: step.responsible,
        description: step.description,
        estimatedDays: step.estimatedDays,
        required: step.required,
        conditions: step.conditions,
        order: step.order,
        isParallel: step.isParallel || false,
        parallelGroup: step.parallelGroup,
        parallelPosition: step.parallelPosition || 0
      })),
      isActive: config.isActive,
      version: config.version,
      createdAt: config.createdAt,
      modifiedAt: config.modifiedAt,
      createdBy: config.createdBy
    };
  }

  // Create DTO für neue Workflows
  static mapFrontendToCreateDto(config: any): CreateWorkflowConfigurationDto {
    return {
      type: config.type,
      name: config.name,
      description: config.description,
      steps: config.steps.map((step: any) => ({
        id: step.id,
        title: step.title,
        type: step.type.toUpperCase() as any,
        responsible: step.responsible,
        description: step.description,
        estimatedDays: step.estimatedDays,
        required: step.required,
        conditions: step.conditions,
        order: step.order,
        isParallel: step.isParallel || false,
        parallelGroup: step.parallelGroup,
        parallelPosition: step.parallelPosition || 0
      })),
      isActive: config.isActive
    };
  }

  // Update DTO für bestehende Workflows
  static mapFrontendToUpdateDto(config: any): UpdateWorkflowConfigurationDto {
    return {
      name: config.name,
      description: config.description,
      steps: config.steps.map((step: any) => ({
        id: step.id,
        title: step.title,
        type: step.type.toUpperCase() as any,
        responsible: step.responsible,
        description: step.description,
        estimatedDays: step.estimatedDays,
        required: step.required,
        conditions: step.conditions,
        order: step.order,
        isParallel: step.isParallel || false,
        parallelGroup: step.parallelGroup,
        parallelPosition: step.parallelPosition || 0
      })),
      isActive: config.isActive
    };
  }
}

// ================ API SERVICE CLASS ================

export class WorkflowApiService {
  
  // 🎯 GET /api/workflow/configuration/{workflowType}
  static async getWorkflowByType(workflowType: string): Promise<any | null> {
    try {
      console.log(`[API] Loading workflow for type: ${workflowType}`);
      
      const response = await fetch(`${API_BASE_URL}/configuration/${encodeURIComponent(workflowType)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('[API] No workflow found for this type');
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const apiResponse = await response.json();
      console.log('[API] API Response:', apiResponse);
      
      if (apiResponse.isSuccess && apiResponse.data) {
        const dto: WorkflowConfigurationDto = apiResponse.data;
        console.log('[API] Controller response DTO:', dto);
        
        const frontendConfig = WorkflowMapper.mapDtoToFrontend(dto);
        console.log('[API] Mapped to frontend model:', frontendConfig);
        
        return frontendConfig;
      } else {
        // No configuration found is not an error
        console.log('[API] No workflow configuration found for', workflowType);
        return null;
      }
    } catch (error) {
      console.error('[API] Error loading workflow:', error);
      return null;
    }
  }

  // 💾 POST /api/workflow/configuration (new) oder PUT /api/workflow/configuration/{id} (update)
  static async saveWorkflowConfiguration(config: any): Promise<any> {
    try {
      console.log('[API] Saving workflow:', config);
      
      const isUpdate = config.id && config.id !== '' && config.id !== 'new';
      const method = isUpdate ? 'PUT' : 'POST';
      
      let url: string;
      let dto: any;
      
      if (isUpdate) {
        // Update existing workflow
        url = `${API_BASE_URL}/configuration/${config.id}`;
        dto = WorkflowMapper.mapFrontendToUpdateDto(config);
      } else {
        // Create new workflow
        url = `${API_BASE_URL}/configuration`;
        dto = WorkflowMapper.mapFrontendToCreateDto(config);
      }
      
      console.log(`[API] ${method} ${url}`, dto);
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[API] Save failed:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const savedDto: WorkflowConfigurationDto = await response.json();
      console.log('[API] ✅ Workflow saved successfully:', savedDto);
      
      return WorkflowMapper.mapDtoToFrontend(savedDto);
    } catch (error) {
      console.error('[API] 💥 Save error:', error);
      throw error;
    }
  }

  // ✅ POST /api/workflow/validate
  static async validateWorkflow(config: any) {
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

  // 🗑️ DELETE /api/workflow/configuration/{id}
  static async deleteWorkflowConfiguration(configId: string): Promise<boolean> {
    try {
      console.log('[API] Deleting workflow:', configId);
      
      const response = await fetch(`${API_BASE_URL}/configuration/${configId}`, {
        method: 'DELETE'
      });
      
      if (response.status === 404) {
        console.log('[API] Workflow not found for deletion');
        return false;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log('[API] ✅ Workflow deleted successfully');
      return true;
    } catch (error) {
      console.error('[API] Delete error:', error);
      throw error;
    }
  }

  // 📊 GET /api/workflow/configurations (alle Workflows)
  static async getAllWorkflowConfigurations(): Promise<any[]> {
    try {
      console.log('[API] Loading all workflow configurations');
      
      const response = await fetch(`${API_BASE_URL}/configurations`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const dtos: WorkflowConfigurationDto[] = await response.json();
      console.log('[API] Loaded configurations:', dtos.length);
      
      return dtos.map(dto => WorkflowMapper.mapDtoToFrontend(dto));
    } catch (error) {
      console.error('[API] Error loading all configurations:', error);
      return [];
    }
  }

  // 📁 POST /api/workflow/export/{id}
  static async exportWorkflowConfiguration(configId: string): Promise<string> {
    try {
      console.log('[API] Exporting workflow:', configId);
      
      const response = await fetch(`${API_BASE_URL}/export/${configId}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const exportData = await response.json();
      console.log('[API] ✅ Workflow exported successfully');
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('[API] Export error:', error);
      throw error;
    }
  }

  // 📥 POST /api/workflow/import
  static async importWorkflow(file: File): Promise<any> {
    try {
      console.log('[API] Importing workflow from file:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/import`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const dto: WorkflowConfigurationDto = await response.json();
      console.log('[API] ✅ Workflow imported successfully:', dto);
      
      return WorkflowMapper.mapDtoToFrontend(dto);
    } catch (error) {
      console.error('[API] Import error:', error);
      throw error;
    }
  }

  // 🔧 GET /api/workflow/templates
  static async getWorkflowTemplates(): Promise<Record<string, any>> {
    try {
      console.log('[API] Loading workflow templates');
      
      const response = await fetch(`${API_BASE_URL}/templates`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const templateDtos: Record<string, WorkflowConfigurationDto> = await response.json();
      console.log('[API] Loaded templates:', Object.keys(templateDtos));
      
      // Convert all DTOs to frontend models
      const templates: Record<string, any> = {};
      for (const [key, dto] of Object.entries(templateDtos)) {
        templates[key] = WorkflowMapper.mapDtoToFrontend(dto);
      }
      
      return templates;
    } catch (error) {
      console.error('[API] Error loading templates:', error);
      return {};
    }
  }

  // 🔄 POST /api/workflow/reset/{workflowType}
  static async resetWorkflowToDefault(workflowType: string): Promise<any | null> {
    try {
      console.log('[API] Resetting workflow to default:', workflowType);
      
      const response = await fetch(`${API_BASE_URL}/reset/${encodeURIComponent(workflowType)}`, {
        method: 'POST'
      });
      
      if (response.status === 404) {
        console.log('[API] No default template found for workflow type');
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const dto: WorkflowConfigurationDto = await response.json();
      console.log('[API] ✅ Workflow reset successfully:', dto);
      
      return WorkflowMapper.mapDtoToFrontend(dto);
    } catch (error) {
      console.error('[API] Reset error:', error);
      throw error;
    }
  }
}
