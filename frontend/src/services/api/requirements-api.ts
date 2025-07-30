// frontend/src/services/api/requirements-api.ts
// Korrigierte Version für dein Backend

export interface CreateRequirementRequest {
  title: string;
  description?: string;
  requirementType: string; // Nicht "type" - Backend erwartet "requirementType"
  priority: string;
  businessOwner?: string;
  technicalOwner?: string;
  department?: string;
  costCenter?: string;
  estimatedCost?: number;
  approvedBudget?: number;
  currency?: string;
  requiredByDate?: string; // Backend erwartet "requiredByDate" nicht "dueDate"
  startDate?: string;
  formConfigurationId?: string;
  hasPersonalData?: boolean;
  securityClassification?: string;
  formData?: string; // JSON String, nicht Object
}

export interface RequirementResponse {
  id: string;
  requirementNumber: string;
  title: string;
  description?: string;
  requirementType: string;
  priority: string;
  status: string;
  requestedBy: string;
  businessOwner?: string;
  technicalOwner?: string;
  department?: string;
  costCenter?: string;
  estimatedCost?: number;
  approvedBudget?: number;
  actualCost?: number;
  currency: string;
  requestedDate?: string;
  requiredByDate?: string;
  startDate?: string;
  completedDate?: string;
  currentWorkflowConfigId?: string;
  currentWorkflowStep?: string;
  workflowInstanceId?: string;
  formConfigurationId?: string;
  formData?: string;
  hasPersonalData?: boolean;
  securityClassification: string;
  createdAt?: string;
  modifiedAt?: string;
  createdBy: string;
  modifiedBy?: string;
  
  // Navigation Properties die noch in deinem RequirementDto fehlen!
  workflowConfigName?: string;
  formConfigName?: string;
  attachmentCount: number;
  commentCount: number;
}

export interface RequirementQueryRequest {
  requirementType?: string;
  status?: string;
  priority?: string;
  department?: string;
  searchText?: string;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Backend gibt direkt DTOs zurück, kein Wrapper
// Kein ApiResponse<T> wrapper needed, da dein Controller direkt DTOs zurückgibt

class RequirementsApiService {
  private readonly BASE_URL = 'https://localhost:7100/api/requirements';

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async createRequirement(request: CreateRequirementRequest): Promise<RequirementResponse> {
    try {
      console.log('Creating requirement:', request);
      
      const response = await fetch(`${this.BASE_URL}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request) // Direkt das Request Object senden
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Backend gibt direkt RequirementDto zurück, kein Wrapper
      const data: RequirementResponse = await response.json();
      console.log('Successfully created requirement:', data);
      
      return data;
      
    } catch (error) {
      console.error('Error creating requirement:', error);
      throw error; // Re-throw für Component Error Handling
    }
  }

  async getRequirement(id: string): Promise<RequirementResponse> {
    try {
      console.log(`Getting requirement: ${id}`);
      
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Anforderung nicht gefunden');
        }
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data: RequirementResponse = await response.json();
      console.log('Successfully loaded requirement:', data);
      
      return data;
      
    } catch (error) {
      console.error('Error fetching requirement:', error);
      throw error;
    }
  }

  async getRequirements(queryRequest: RequirementQueryRequest = {}): Promise<PagedResult<RequirementResponse>> {
    try {
      console.log('Getting requirements with query:', queryRequest);
      
      // Build query string aus RequirementQueryRequest
      const queryParams = new URLSearchParams();
      if (queryRequest.requirementType) queryParams.append('requirementType', queryRequest.requirementType);
      if (queryRequest.status) queryParams.append('status', queryRequest.status);
      if (queryRequest.priority) queryParams.append('priority', queryRequest.priority);
      if (queryRequest.department) queryParams.append('department', queryRequest.department);
      if (queryRequest.searchText) queryParams.append('searchText', queryRequest.searchText);
      if (queryRequest.createdFrom) queryParams.append('createdFrom', queryRequest.createdFrom);
      if (queryRequest.createdTo) queryParams.append('createdTo', queryRequest.createdTo);
      if (queryRequest.page) queryParams.append('page', queryRequest.page.toString());
      if (queryRequest.pageSize) queryParams.append('pageSize', queryRequest.pageSize.toString());
      if (queryRequest.sortBy) queryParams.append('sortBy', queryRequest.sortBy);
      if (queryRequest.sortDirection) queryParams.append('sortDirection', queryRequest.sortDirection);

      const url = `${this.BASE_URL}?${queryParams.toString()}`;
      console.log('Request URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Backend gibt PagedResultDto<RequirementDto> zurück
      const data: PagedResult<RequirementResponse> = await response.json();
      console.log(`Successfully loaded ${data.items.length} requirements`);
      
      return data;
      
    } catch (error) {
      console.error('Error fetching requirements:', error);
      throw error;
    }
  }

  async updateRequirement(id: string, updates: Partial<CreateRequirementRequest>): Promise<RequirementResponse> {
    try {
      console.log(`Updating requirement ${id}:`, updates);
      
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data: RequirementResponse = await response.json();
      console.log('Successfully updated requirement:', data);
      
      return data;
      
    } catch (error) {
      console.error('Error updating requirement:', error);
      throw error;
    }
  }

  async deleteRequirement(id: string): Promise<boolean> {
    try {
      console.log(`Deleting requirement: ${id}`);
      
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      console.log(`Successfully deleted requirement: ${id}`);
      return true;
      
    } catch (error) {
      console.error('Error deleting requirement:', error);
      throw error;
    }
  }

  // Workflow Steps für Requirements Form (nutzt deinen bestehenden Workflow Controller)
  async getWorkflowStepsForRequirementType(requirementType: string): Promise<Array<{id: string, name: string, responsible: string}>> {
    try {
      console.log(`Getting workflow steps for: ${requirementType}`);
      
      // Nutze deinen WorkflowController!
      const response = await fetch(`https://localhost:7100/api/workflow/configuration/${requirementType}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`No workflow found for requirement type: ${requirementType}`);
          return this.getFallbackWorkflowSteps(requirementType);
        }
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const workflowConfig = await response.json();
      console.log('Successfully loaded workflow config:', workflowConfig);
      
      // Extract steps from WorkflowConfigurationDto
      if (workflowConfig.steps && Array.isArray(workflowConfig.steps)) {
        return workflowConfig.steps.map((step: any) => ({
          id: step.id,
          name: step.title,
          responsible: step.responsible,
          estimatedDays: step.estimatedDays,
          order: step.order
        }));
      }

      return this.getFallbackWorkflowSteps(requirementType);
      
    } catch (error) {
      console.error('Error getting workflow steps, using fallback:', error);
      return this.getFallbackWorkflowSteps(requirementType);
    }
  }

  // Fallback wenn kein Workflow in DB gefunden wird
  private getFallbackWorkflowSteps(requirementType: string): Array<{id: string, name: string, responsible: string}> {
    const workflows: Record<string, Array<{id: string, name: string, responsible: string}>> = {
      'Kleinanforderung': [
        { id: '1', name: 'Antrag', responsible: 'AG' },
        { id: '2', name: 'Prüfung', responsible: 'AN' },
        { id: '3', name: 'Umsetzung', responsible: 'AN' },
        { id: '4', name: 'Test', responsible: 'AN' },
        { id: '5', name: 'Abschluss', responsible: 'AG' }
      ],
      'Großanforderung': [
        { id: '1', name: 'Antrag', responsible: 'AG' },
        { id: '2', name: 'Analyse', responsible: 'AN' },
        { id: '3', name: 'Konzept', responsible: 'AN' },
        { id: '4', name: 'Entwicklung', responsible: 'AN' },
        { id: '5', name: 'Test', responsible: 'AN' },
        { id: '6', name: 'Deployment', responsible: 'AN' }
      ],
      'AWS-Release': [
        { id: '1', name: 'AWS-Release Antrag', responsible: 'AG' },
        { id: '2', name: 'AWS Planning', responsible: 'AN' },
        { id: '3', name: 'Cloud Setup', responsible: 'AN' },
        { id: '4', name: 'Migration', responsible: 'AN' },
        { id: '5', name: 'Go-Live', responsible: 'AG' }
      ]
    };

    return workflows[requirementType] || workflows['Kleinanforderung'];
  }
}

// Singleton Export
export const requirementsApi = new RequirementsApiService();
