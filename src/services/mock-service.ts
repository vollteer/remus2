import type { 
  Requirement, 
  Person, 
  DashboardStats,
  RequirementType,
  RequirementStatus,
  Priority 
} from '../types';
import { 
  mockRequirements, 
  mockPersons, 
  mockDashboardStats 
} from './mock-data';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockApiService {
  
  // Enhanced search with operators
  static parseSearchQuery(query: string): {
    text: string;
    filters: {
      type?: string;
      status?: string;
      priority?: string;
      assignee?: string;
      created?: string;
    };
  } {
    const filters: any = {};
    let text = query;

    // Extract search operators
    const operators = [
      { key: 'type:', field: 'type' },
      { key: 'status:', field: 'status' },
      { key: 'priority:', field: 'priority' },
      { key: 'assignee:', field: 'assignee' },
      { key: 'created:', field: 'created' }
    ];

    operators.forEach(op => {
      const regex = new RegExp(`${op.key}(\\S+)`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        matches.forEach(match => {
          const value = match.substring(op.key.length);
          filters[op.field] = value;
          text = text.replace(match, '').trim();
        });
      }
    });

    return { text: text.trim(), filters };
  }

  static async getRequirements(searchFilters?: {
    type?: RequirementType;
    status?: RequirementStatus;
    priority?: Priority;
    search?: string;
  }): Promise<Requirement[]> {
    await delay(300);
    
    let filtered = [...mockRequirements];
    
    if (searchFilters) {
      // Handle regular filters
      if (searchFilters.type) {
        filtered = filtered.filter(req => req.type === searchFilters.type);
      }
      if (searchFilters.status) {
        filtered = filtered.filter(req => req.status === searchFilters.status);
      }
      if (searchFilters.priority) {
        filtered = filtered.filter(req => req.priority === searchFilters.priority);
      }
      
      // Handle search with operators
      if (searchFilters.search) {
        const { text, filters } = this.parseSearchQuery(searchFilters.search);
        
        // Apply operator filters
        if (filters.type) {
          const typeSearch = filters.type.toLowerCase();
          filtered = filtered.filter(req => 
            req.type.toLowerCase().includes(typeSearch)
          );
        }
        
        if (filters.status) {
          const statusSearch = filters.status.toLowerCase();
          filtered = filtered.filter(req => 
            req.status.toLowerCase().includes(statusSearch) ||
            req.status.toLowerCase().replace(' ', '').includes(statusSearch.replace(' ', ''))
          );
        }
        
        if (filters.priority) {
          const prioritySearch = filters.priority.toLowerCase();
          filtered = filtered.filter(req => 
            req.priority.toLowerCase().includes(prioritySearch)
          );
        }
        
        if (filters.assignee) {
          const assigneeSearch = filters.assignee.toLowerCase();
          filtered = filtered.filter(req => 
            req.assignedTo?.name.toLowerCase().includes(assigneeSearch) ||
            req.assignedTo?.email.toLowerCase().includes(assigneeSearch) ||
            assigneeSearch === 'me' // Simulate current user
          );
        }
        
        // Apply text search
        if (text) {
          const search = text.toLowerCase();
          filtered = filtered.filter(req => 
            req.title.toLowerCase().includes(search) ||
            req.id.toLowerCase().includes(search) ||
            req.description?.toLowerCase().includes(search) ||
            req.type.toLowerCase().includes(search)
          );
        }
      }
    }
    
    return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
  
  static async getDashboardStats(): Promise<DashboardStats> {
    await delay(250);
    return mockDashboardStats;
  }
  
  static async searchPersons(query: string): Promise<Person[]> {
    await delay(150);
    
    if (!query) return mockPersons;
    
    const search = query.toLowerCase();
    return mockPersons.filter(person => 
      person.name.toLowerCase().includes(search) ||
      person.email.toLowerCase().includes(search) ||
      person.department?.toLowerCase().includes(search) ||
      person.role?.toLowerCase().includes(search)
    );
  }
  
  // Global search with enhanced capabilities
  static async globalSearch(query: string): Promise<{
    requirements: Requirement[];
    persons: Person[];
    totalResults: number;
  }> {
    await delay(300);
    
    if (!query.trim()) {
      return { requirements: [], persons: [], totalResults: 0 };
    }
    
    const [requirements, persons] = await Promise.all([
      this.getRequirements({ search: query }),
      this.searchPersons(query)
    ]);
    
    return {
      requirements: requirements.slice(0, 10),
      persons: persons.slice(0, 5),
      totalResults: requirements.length + persons.length
    };
  }
}