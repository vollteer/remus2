import type { 
  Requirement, 
  Person, 
  DashboardStats, 
  CalendarEvent,
  RequirementType,
  RequirementStatus,
  Priority 
} from '../types';

// Mock Persons
export const mockPersons: Person[] = [
  {
    id: '1',
    name: 'Max Mustermann',
    email: 'max.mustermann@company.com',
    department: 'IT Development',
    role: 'Senior Developer',
    avatar: 'MM'
  },
  {
    id: '2',
    name: 'Anna Schmidt',
    email: 'anna.schmidt@company.com',
    department: 'Business Analysis',
    role: 'Business Analyst',
    avatar: 'AS'
  },
  {
    id: '3',
    name: 'Thomas Wagner',
    email: 'thomas.wagner@company.com',
    department: 'Architecture',
    role: 'Solution Architect',
    avatar: 'TW'
  }
];

// Mock Requirements
export const mockRequirements: Requirement[] = [
  {
    id: 'REQ-2025-001',
    title: 'Neue Benutzeroberfläche für Kundenportal',
    description: 'Entwicklung einer modernen, responsiven Benutzeroberfläche für das bestehende Kundenportal.',
    type: 'Großanforderung',
    realizationObject: 'Anwendungssystem',
    status: 'In Progress',
    priority: 'high',
    assignedTo: mockPersons[0],
    functionalContact: mockPersons[1],
    systemResponsible: mockPersons[2],
    budget: 85000,
    dueDate: '2025-08-15',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-06-28T14:30:00Z',
    externalReferences: [],
    checkQuestions: [],
    workLogEntries: [],
    workflowSteps: []
  },
  {
    id: 'REQ-2025-002',
    title: 'Datenbankoptimierung Backend-Services',
    description: 'Optimierung der Datenbankzugriffe und Performance-Verbesserungen.',
    type: 'Kleinanforderung',
    realizationObject: 'Komponente',
    status: 'Open',
    priority: 'medium',
    assignedTo: mockPersons[2],
    budget: 15000,
    dueDate: '2025-07-20',
    createdAt: '2025-02-10T11:00:00Z',
    updatedAt: '2025-06-20T08:15:00Z',
    externalReferences: [],
    checkQuestions: [],
    workLogEntries: [],
    workflowSteps: []
  },
  {
    id: 'REQ-2025-003',
    title: 'Sicherheitsupdate Authentifizierung',
    description: 'Implementation neuer Sicherheitsstandards für die Benutzerauthentifizierung.',
    type: 'TIA-Anforderung',
    realizationObject: 'Anwendungssystem',
    status: 'Completed',
    priority: 'critical',
    assignedTo: mockPersons[0],
    systemResponsible: mockPersons[2],
    budget: 25000,
    dueDate: '2025-06-30',
    createdAt: '2025-01-05T09:00:00Z',
    updatedAt: '2025-06-30T17:00:00Z',
    externalReferences: [],
    checkQuestions: [],
    workLogEntries: [],
    workflowSteps: []
  },
  {
    id: 'REQ-2025-004',
    title: 'Mobile App Entwicklung',
    description: 'Entwicklung einer nativen mobilen Anwendung für iOS und Android.',
    type: 'Großanforderung',
    realizationObject: 'Anwendungssystem',
    status: 'Review',
    priority: 'high',
    assignedTo: mockPersons[1],
    budget: 120000,
    dueDate: '2025-09-30',
    createdAt: '2025-03-01T08:00:00Z',
    updatedAt: '2025-06-25T10:00:00Z',
    externalReferences: [],
    checkQuestions: [],
    workLogEntries: [],
    workflowSteps: []
  },
  {
    id: 'REQ-2025-005',
    title: 'API Gateway Setup',
    description: 'Einrichtung eines zentralen API-Gateways für alle Microservices.',
    type: 'TIA-Anforderung',
    realizationObject: 'Infrastruktur',
    status: 'Open',
    priority: 'medium',
    assignedTo: mockPersons[2],
    budget: 35000,
    dueDate: '2025-07-15',
    createdAt: '2025-04-01T12:00:00Z',
    updatedAt: '2025-06-15T16:00:00Z',
    externalReferences: [],
    checkQuestions: [],
    workLogEntries: [],
    workflowSteps: []
  }
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalRequirements: 127,
  openRequirements: 23,
  inProgressRequirements: 12,
  completedRequirements: 89,
  overdueRequirements: 5,
  averageCompletionTime: 12.5,
  requirementsByType: {
    'Kleinanforderung': 45,
    'Großanforderung': 32,
    'TIA-Anforderung': 28,
    'Supportleistung': 15,
    'Betriebsauftrag': 4,
    'SBBI-Lösung': 2,
    'AWG-Release': 1,
    'AWS-Release': 0
  },
  requirementsByPriority: {
    'low': 35,
    'medium': 58,
    'high': 28,
    'critical': 6
  }
};