export interface CreateRequirementRequest {
  title: string;
  type: string;
  realizationObject: string;
  priority: string;
  initialSituation: string;
  goals: string;
  budget?: number;
  functionalContact?: {
    id: string;
    name: string;
    department: string;
  } | null;
  systemResponsible?: {
    id: string;
    name: string;
    department: string;
  } | null;
  dueDate?: string;
  formData?: Record<string, any>;
}

export interface RequirementResponse {
  id: string;
  requirementNumber: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  createdAt: string;
  createdBy: string;
  // ... weitere Felder
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

class RequirementsApiService {
  private readonly BASE_URL = 'https://localhost:7068/api/requirements';

  async createRequirement(request: CreateRequirementRequest): Promise<ApiResponse<RequirementResponse>> {
    try {
      const response = await fetch(`${this.BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          title: request.title,
          requirementType: request.type,
          realizationObject: request.realizationObject,
          priority: request.priority,
          initialSituation: request.initialSituation,
          goals: request.goals,
          estimatedBudget: request.budget,
          functionalContactId: request.functionalContact?.id,
          systemResponsibleId: request.systemResponsible?.id,
          requestedDueDate: request.dueDate,
          formData: JSON.stringify(request.formData || {})
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data,
        message: 'Anforderung erfolgreich erstellt'
      };
      
    } catch (error) {
      console.error('Error creating requirement:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unbekannter Fehler beim Erstellen',
        errors: [error instanceof Error ? error.message : 'Unbekannter Fehler']
      };
    }
  }

  async getRequirement(id: string): Promise<ApiResponse<RequirementResponse>> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Anforderung nicht gefunden');
        }
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data
      };
      
    } catch (error) {
      console.error('Error fetching requirement:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Fehler beim Laden der Anforderung',
        errors: [error instanceof Error ? error.message : 'Unbekannter Fehler']
      };
    }
  }

  async getRequirements(filters?: {
    type?: string;
    status?: string;
    priority?: string;
    createdBy?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<RequirementResponse[]>> {
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      if (filters?.type) queryParams.append('type', filters.type);
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.priority) queryParams.append('priority', filters.priority);
      if (filters?.createdBy) queryParams.append('createdBy', filters.createdBy);
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.pageSize) queryParams.append('pageSize', filters.pageSize.toString());

      const url = `${this.BASE_URL}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: Array.isArray(data) ? data : data.items || []
      };
      
    } catch (error) {
      console.error('Error fetching requirements:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Fehler beim Laden der Anforderungen',
        errors: [error instanceof Error ? error.message : 'Unbekannter Fehler'],
        data: []
      };
    }
  }

  async updateRequirement(id: string, updates: Partial<CreateRequirementRequest>): Promise<ApiResponse<RequirementResponse>> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...(updates.title && { title: updates.title }),
          ...(updates.type && { requirementType: updates.type }),
          ...(updates.realizationObject && { realizationObject: updates.realizationObject }),
          ...(updates.priority && { priority: updates.priority }),
          ...(updates.initialSituation && { initialSituation: updates.initialSituation }),
          ...(updates.goals && { goals: updates.goals }),
          ...(updates.budget !== undefined && { estimatedBudget: updates.budget }),
          ...(updates.functionalContact && { functionalContactId: updates.functionalContact.id }),
          ...(updates.systemResponsible && { systemResponsibleId: updates.systemResponsible.id }),
          ...(updates.dueDate && { requestedDueDate: updates.dueDate }),
          ...(updates.formData && { formData: JSON.stringify(updates.formData) })
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data,
        message: 'Anforderung erfolgreich aktualisiert'
      };
      
    } catch (error) {
      console.error('Error updating requirement:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Fehler beim Aktualisieren',
        errors: [error instanceof Error ? error.message : 'Unbekannter Fehler']
      };
    }
  }

  async deleteRequirement(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      return {
        success: true,
        message: 'Anforderung erfolgreich gelöscht'
      };
      
    } catch (error) {
      console.error('Error deleting requirement:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Fehler beim Löschen',
        errors: [error instanceof Error ? error.message : 'Unbekannter Fehler']
      };
    }
  }
}

export const requirementsApi = new RequirementsApiService();
