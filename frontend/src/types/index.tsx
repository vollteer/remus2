export interface Requirement {
  id: string;
  title: string;
  description?: string;
  type: RequirementType;
  realizationObject: RealizationObject;
  status: RequirementStatus;
  priority: Priority;
  assignedTo?: Person;
  functionalContact?: Person;
  systemResponsible?: Person;
  initialSituation?: string;
  goals?: string;
  budget?: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  externalReferences: ExternalReference[];
  checkQuestions: CheckQuestion[];
  workLogEntries: WorkLogEntry[];
  workflowSteps: WorkflowStep[];
}

export type RequirementType = 
  | 'Kleinanforderung'
  | 'GroßYanforderung'  // Database encoding issue - temporary workaround
  | 'TIA-Anforderung'
  | 'Supportleistung'
  | 'Betriebsauftrag'
  | 'SBBI-Lösung'
  | 'AWG-Release'
  | 'AWS-Release';

export type RealizationObject = 
  | 'Anwendungssystem'
  | 'Komponente'
  | 'Prozess'
  | 'Hardware'
  | 'Infrastruktur';

export type RequirementStatus = 
  | 'Draft'
  | 'Open'
  | 'In Progress'
  | 'Review'
  | 'Testing'
  | 'Completed'
  | 'Rejected'
  | 'On Hold';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Person {
  id: string;
  name: string;
  email: string;
  department?: string;
  role?: string;
  avatar?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  responsible: 'AG' | 'AN';
  order: number;
  status: 'pending' | 'current' | 'completed';
  completedAt?: string;
  assignee?: Person;
  estimatedDays?: number;
  parallelGroup?: string;
  isParallel?: boolean;
}

export interface WorkLogEntry {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: WorkLogAction;
  description: string;
  timeSpent?: number;
  createdAt: string;
  attachments?: string[];
}

export type WorkLogAction = 
  | 'created'
  | 'updated'
  | 'commented'
  | 'status_changed'
  | 'assigned'
  | 'document_uploaded'
  | 'meeting_held'
  | 'approved'
  | 'rejected';

export interface ExternalReference {
  id: string;
  title: string;
  url: string;
  description?: string;
  type: 'document' | 'link' | 'ticket' | 'confluence' | 'jira';
}

export interface CheckQuestion {
  id: string;
  question: string;
  answer?: boolean;
  required: boolean;
  category: string;
}

export interface DashboardStats {
  totalRequirements: number;
  openRequirements: number;
  inProgressRequirements: number;
  completedRequirements: number;
  overdueRequirements: number;
  averageCompletionTime: number;
  requirementsByType: Record<RequirementType, number>;
  requirementsByPriority: Record<Priority, number>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  type: 'meeting' | 'deadline' | 'review' | 'release';
  requirementId?: string;
  attendees: Person[];
}