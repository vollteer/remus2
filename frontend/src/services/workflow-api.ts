const API_BASE_URL = 'https://localhost:7001/api';

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
id?: string;
type: string;
name: string;
description?: string;
steps: WorkflowStep[];
isActive: boolean;
version: number;
createdAt?: string;
modifiedAt?: string;
createdBy?: string;
}

export class WorkflowApiService {

// Get all workflow configurations
static async getWorkflowConfigurations() {
try {
const response = await fetch(`${API_BASE_URL}/workflows/configurations`);
if (!response.ok) {
throw new Error(`HTTP error! status: ${response.status}`);
}
return await response.json();
} catch (error) {
console.error('Error fetching workflow configurations:', error);
throw error;
}
}

// Get workflow configuration by type
static async getWorkflowByType(workflowType: string) {
try {
const response = await fetch(`${API_BASE_URL}/workflows/configurations/${encodeURIComponent(workflowType)}`);
if (!response.ok) {
throw new Error(`HTTP error! status: ${response.status}`);
}
return await response.json();
} catch (error) {
console.error('Error fetching workflow by type:', error);
throw error;
}
}

// Save workflow configuration
static async saveWorkflowConfiguration(config: WorkflowConfiguration) {
try {
const method = config.id ? 'PUT' : 'POST';
const url = config.id
? `${API_BASE_URL}/workflows/configurations/${config.id}`
: `${API_BASE_URL}/workflows/configurations`;


  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
} catch (error) {
  console.error('Error saving workflow configuration:', error);
  throw error;
}


}

// Delete workflow configuration
static async deleteWorkflowConfiguration(configId: string) {
try {
const response = await fetch(`${API_BASE_URL}/workflows/configurations/${configId}`, {
method: 'DELETE'
});


  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return true;
} catch (error) {
  console.error('Error deleting workflow configuration:', error);
  throw error;
}


}

// Duplicate workflow configuration
static async duplicateWorkflowConfiguration(configId: string, newName: string) {
try {
const response = await fetch(`${API_BASE_URL}/workflows/configurations/${configId}/duplicate`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ name: newName })
});


  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
} catch (error) {
  console.error('Error duplicating workflow configuration:', error);
  throw error;
}


}

// Activate/Deactivate workflow
static async toggleWorkflowStatus(configId: string, isActive: boolean) {
try {
const response = await fetch(`${API_BASE_URL}/workflows/configurations/${configId}/toggle`, {
method: 'PATCH',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ isActive })
});


  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
} catch (error) {
  console.error('Error toggling workflow status:', error);
  throw error;
}


}

// Validate workflow configuration
static async validateWorkflow(config: WorkflowConfiguration) {
try {
const response = await fetch(`${API_BASE_URL}/workflows/validate`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify(config)
});


  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
} catch (error) {
  console.error('Error validating workflow:', error);
  throw error;
}


}

// Get workflow templates
static async getWorkflowTemplates() {
try {
const response = await fetch(`${API_BASE_URL}/workflows/templates`);
if (!response.ok) {
throw new Error(`HTTP error! status: ${response.status}`);
}
return await response.json();
} catch (error) {
console.error('Error fetching workflow templates:', error);
throw error;
}
}

// Export workflow as JSON
static async exportWorkflow(configId: string) {
try {
const response = await fetch(`${API_BASE_URL}/workflows/configurations/${configId}/export`);
if (!response.ok) {
throw new Error(`HTTP error! status: ${response.status}`);
}
return await response.blob();
} catch (error) {
console.error('Error exporting workflow:', error);
throw error;
}
}

// Import workflow from JSON
static async importWorkflow(file: File) {
try {
const formData = new FormData();
formData.append('file', file);


  const response = await fetch(`${API_BASE_URL}/workflows/import`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
} catch (error) {
  console.error('Error importing workflow:', error);
  throw error;
}


}
}

