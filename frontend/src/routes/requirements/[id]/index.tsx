import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';

// Types
interface RequirementDetail {
id: string;
requirementNumber: string;
title: string;
description: string;
requirementType: string;
priority: 'Low' | 'Medium' | 'High' | 'Urgent';
status: 'Draft' | 'Submitted' | 'InProgress' | 'Completed' | 'Rejected' | 'OnHold';
requestedBy: string;
businessOwner?: string;
technicalOwner?: string;
department?: string;
costCenter?: string;

// Financial
estimatedCost?: number;
approvedBudget?: number;
actualCost?: number;
currency: string;

// Dates
requestedDate: string;
requiredByDate?: string;
startDate?: string;
completedDate?: string;

// Workflow
currentWorkflowStep?: string;
currentAssignee?: string;
currentStepDueDate?: string;
workflowName?: string;
workflowInstanceId?: string;

// Form & Data
formName?: string;
formData?: Record<string, any>;

// Compliance
hasPersonalData: boolean;
securityClassification: string;
complianceFlags?: string[];

// Metadata
createdAt: string;
modifiedAt: string;
createdBy: string;
modifiedBy?: string;
}

interface WorkflowStep {
id: string;
title: string;
status: 'Completed' | 'Current' | 'Pending' | 'Skipped';
assignedTo?: string;
startDate?: string;
completedDate?: string;
dueDate?: string;
estimatedDays: number;
actualDays?: number;
comments?: string;
}

interface RequirementComment {
id: string;
comment: string;
commentType: 'General' | 'StatusChange' | 'Approval' | 'Technical';
createdBy: string;
createdAt: string;
isInternal: boolean;
workflowStep?: string;
previousStatus?: string;
newStatus?: string;
}

interface RequirementAttachment {
id: string;
fileName: string;
originalFileName: string;
fileSize: number;
contentType: string;
category: string;
description?: string;
uploadedBy: string;
createdAt: string;
isPublic: boolean;
}

// Mock data
const mockRequirement: RequirementDetail = {
id: 'req-1',
requirementNumber: 'REQ-2025-001',
title: 'Neue CRM-Integration',
description: 'Integration des bestehenden CRM-Systems mit der Anforderungsverwaltung für bessere Datenübertragung und automatisierte Prozesse. Das System soll bidirektionale Synchronisation unterstützen und Echtzeit-Updates ermöglichen.',
requirementType: 'Großanforderung',
priority: 'High',
status: 'InProgress',
requestedBy: 'max.mustermann@company.com',
businessOwner: 'Anna Schmidt',
technicalOwner: 'Thomas Wagner',
department: 'IT',
costCenter: 'CC-IT-001',
estimatedCost: 25000,
approvedBudget: 30000,
actualCost: 18500,
currency: 'EUR',
requestedDate: '2025-01-15',
requiredByDate: '2025-12-31',
startDate: '2025-02-01',
currentWorkflowStep: 'Umsetzung',
currentAssignee: 'dev.team@company.com',
currentStepDueDate: '2025-08-15',
workflowName: 'Großanforderung Enhanced v2.1',
workflowInstanceId: 'wf-inst-001',
formName: 'Großanforderung Form v2.1',
formData: {
shortDescription: 'CRM Integration mit Salesforce',
technicalDescription: 'REST API Integration mit OAuth 2.0',
businessJustification: 'Verbesserung der Kundenbetreuung und Effizienzsteigerung',
riskAssessment: 'Mittleres Risiko - bestehende API verfügbar',
targetUsers: 'Sales Team, Customer Service',
expectedBenefits: 'Reduzierung manueller Dateneingabe um 70%'
},
hasPersonalData: true,
securityClassification: 'Confidential',
complianceFlags: ['DSGVO', 'Security Review Required'],
createdAt: '2025-01-15T09:00:00Z',
modifiedAt: '2025-06-28T14:30:00Z',
createdBy: 'max.mustermann@company.com',
modifiedBy: 'dev.team@company.com'
};

const mockWorkflowSteps: WorkflowStep[] = [
{
id: 'step-1',
title: 'Antrag erstellen',
status: 'Completed',
assignedTo: 'max.mustermann@company.com',
startDate: '2025-01-15',
completedDate: '2025-01-16',
estimatedDays: 1,
actualDays: 1,
comments: 'Antrag vollständig ausgefüllt und eingereicht'
},
{
id: 'step-2',
title: 'Grobanalyse',
status: 'Completed',
assignedTo: 'analysis.team@company.com',
startDate: '2025-01-17',
completedDate: '2025-01-25',
estimatedDays: 5,
actualDays: 8,
comments: 'Zusätzliche API-Dokumentation erforderlich, daher Verzögerung'
},
{
id: 'step-3',
title: 'Feinkonzept',
status: 'Completed',
assignedTo: 'thomas.wagner@company.com',
startDate: '2025-01-26',
completedDate: '2025-02-10',
estimatedDays: 10,
actualDays: 15,
comments: 'Detaillierte Architektur erstellt, Security Review eingebunden'
},
{
id: 'step-4',
title: 'Freigabe',
status: 'Completed',
assignedTo: 'manager@company.com',
startDate: '2025-02-11',
completedDate: '2025-02-12',
estimatedDays: 2,
actualDays: 1,
comments: 'Budget und Scope genehmigt'
},
{
id: 'step-5',
title: 'Umsetzung',
status: 'Current',
assignedTo: 'dev.team@company.com',
startDate: '2025-02-13',
dueDate: '2025-08-15',
estimatedDays: 120,
comments: 'Entwicklung läuft planmäßig, API Tests erfolgreich'
},
{
id: 'step-6',
title: 'Test',
status: 'Pending',
estimatedDays: 15
},
{
id: 'step-7',
title: 'Abnahme',
status: 'Pending',
estimatedDays: 5
}
];

const mockComments: RequirementComment[] = [
{
id: 'comment-1',
comment: 'API-Tests erfolgreich abgeschlossen. Integration funktioniert wie erwartet.',
commentType: 'Technical',
createdBy: 'dev.team@company.com',
createdAt: '2025-06-28T14:30:00Z',
isInternal: false,
workflowStep: 'Umsetzung'
},
{
id: 'comment-2',
comment: 'Security Review abgeschlossen. Keine kritischen Findings.',
commentType: 'Approval',
createdBy: 'security@company.com',
createdAt: '2025-06-25T10:15:00Z',
isInternal: true,
workflowStep: 'Umsetzung'
},
{
id: 'comment-3',
comment: 'Status geändert von "Feinkonzept" zu "Freigabe"',
commentType: 'StatusChange',
createdBy: 'thomas.wagner@company.com',
createdAt: '2025-02-10T16:45:00Z',
isInternal: false,
previousStatus: 'Feinkonzept',
newStatus: 'Freigabe',
workflowStep: 'Feinkonzept'
}
];

const mockAttachments: RequirementAttachment[] = [
{
id: 'att-1',
fileName: 'crm-integration-spec.pdf',
originalFileName: 'CRM Integration Specification v2.1.pdf',
fileSize: 2048576,
contentType: 'application/pdf',
category: 'Specification',
description: 'Technische Spezifikation der CRM-Integration',
uploadedBy: 'thomas.wagner@company.com',
createdAt: '2025-02-10T09:30:00Z',
isPublic: false
},
{
id: 'att-2',
fileName: 'api-documentation.pdf',
originalFileName: 'Salesforce API Documentation.pdf',
fileSize: 5242880,
contentType: 'application/pdf',
category: 'Documentation',
description: 'Salesforce API Dokumentation',
uploadedBy: 'dev.team@company.com',
createdAt: '2025-02-15T11:20:00Z',
isPublic: false
},
{
id: 'att-3',
fileName: 'test-results.xlsx',
originalFileName: 'Integration Test Results.xlsx',
fileSize: 1048576,
contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
category: 'Test',
description: 'Ergebnisse der API-Integration Tests',
uploadedBy: 'qa.team@company.com',
createdAt: '2025-06-20T15:45:00Z',
isPublic: false
}
];

export default component$(() => {
const location = useLocation();
const requirementId = location.params.id;

// State
const requirement = useSignal<RequirementDetail | null>(null);
const workflowSteps = useSignal<WorkflowStep[]>([]);
const comments = useSignal<RequirementComment[]>([]);
const attachments = useSignal<RequirementAttachment[]>([]);
const isLoading = useSignal(true);
const activeTab = useSignal<'overview' | 'workflow' | 'comments' | 'attachments' | 'history'>('overview');
const showFormData = useSignal(false);
const newComment = useSignal('');
const isAddingComment = useSignal(false);

// Load requirement data
useTask$(async () => {
// Simulate API call
await new Promise(resolve => setTimeout(resolve, 500));


// In real app: const req = await fetch(`/api/requirements/${requirementId}`)
requirement.value = mockRequirement;
workflowSteps.value = mockWorkflowSteps;
comments.value = mockComments;
attachments.value = mockAttachments;
isLoading.value = false;


});

const addComment = $(async () => {
if (!newComment.value.trim()) return;


isAddingComment.value = true;

// Simulate API call
await new Promise(resolve => setTimeout(resolve, 300));

const comment: RequirementComment = {
  id: `comment-${Date.now()}`,
  comment: newComment.value,
  commentType: 'General',
  createdBy: 'current.user@company.com',
  createdAt: new Date().toISOString(),
  isInternal: false,
  workflowStep: requirement.value?.currentWorkflowStep
};

comments.value = [comment, ...comments.value];
newComment.value = '';
isAddingComment.value = false;


});

const getPriorityColor = (priority: string) => {
switch (priority) {
case 'Urgent': return 'bg-red-500';
case 'High': return 'bg-orange-500';
case 'Medium': return 'bg-yellow-500';
case 'Low': return 'bg-green-500';
default: return 'bg-gray-500';
}
};

const getStatusColor = (status: string) => {
switch (status) {
case 'Draft': return 'bg-gray-100 text-gray-800';
case 'Submitted': return 'bg-blue-100 text-blue-800';
case 'InProgress': return 'bg-yellow-100 text-yellow-800';
case 'Completed': return 'bg-green-100 text-green-800';
case 'Rejected': return 'bg-red-100 text-red-800';
case 'OnHold': return 'bg-purple-100 text-purple-800';
default: return 'bg-gray-100 text-gray-800';
}
};

const getStepStatusColor = (status: string) => {
switch (status) {
case 'Completed': return 'text-green-600 bg-green-100';
case 'Current': return 'text-blue-600 bg-blue-100';
case 'Pending': return 'text-gray-600 bg-gray-100';
case 'Skipped': return 'text-orange-600 bg-orange-100';
default: return 'text-gray-600 bg-gray-100';
}
};

const formatCurrency = (amount: number, currency: string = 'EUR') => {
return new Intl.NumberFormat('de-DE', {
style: 'currency',
currency: currency
}).format(amount);
};

const formatDate = (dateString: string) => {
return new Date(dateString).toLocaleDateString('de-DE', {
year: 'numeric',
month: 'long',
day: 'numeric'
});
};

const formatDateTime = (dateString: string) => {
return new Date(dateString).toLocaleString('de-DE');
};

const formatFileSize = (bytes: number) => {
const units = ['B', 'KB', 'MB', 'GB'];
let size = bytes;
let unitIndex = 0;


while (size >= 1024 && unitIndex < units.length - 1) {
  size /= 1024;
  unitIndex++;
}

return `${size.toFixed(1)} ${units[unitIndex]}`;


};

if (isLoading.value) {
return (
<div class="container">
<div class="card text-center py-12">
<div class="text-4xl mb-4">⏳</div>
<p class="text-lg font-medium">Anforderung wird geladen…</p>
</div>
</div>
);
}

if (!requirement.value) {
return (
<div class="container">
<div class="card text-center py-12">
<div class="text-4xl mb-4">❌</div>
<h3 class="font-medium text-gray-900 mb-2">Anforderung nicht gefunden</h3>
<p class="text-sm text-gray-500 mb-4">
Die angeforderte Anforderung konnte nicht geladen werden.
</p>
<Link href="/requirements" class="btn btn-primary">
Zurück zur Übersicht
</Link>
</div>
</div>
);
}

const req = requirement.value;

return (
<div class="container">
{/* Header */}
<div class="flex items-center justify-between mb-6">
<div class="flex items-center gap-4">
<Link href="/requirements" class="text-blue-600 hover:text-blue-800">
← Zurück zur Übersicht
</Link>
<div>
<h1 class="text-2xl font-bold text-gray-900">{req.title}</h1>
<p class="text-gray-600">{req.requirementNumber} • {req.requirementType}</p>
</div>
</div>
<div class="flex gap-3">
<button class="btn btn-secondary">
📤 Exportieren
</button>
<Link href={`/requirements/${req.id}/edit`} class='btn btn-primary'>
✏️ Bearbeiten
</Link>
</div>
</div>


  {/* Status Cards */}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
    <div class="card">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600">Status</p>
          <span class={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(req.status)}`}>
            {req.status}
          </span>
        </div>
        <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
          📋
        </div>
      </div>
    </div>

    <div class="card">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600">Priorität</p>
          <div class="flex items-center gap-2 mt-1">
            <div class={`w-3 h-3 rounded-full ${getPriorityColor(req.priority)}`}></div>
            <span class="font-medium">{req.priority}</span>
          </div>
        </div>
        <div class="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xl">
          🔥
        </div>
      </div>
    </div>

    <div class="card">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600">Budget</p>
          <p class="font-bold text-gray-900">
            {req.approvedBudget ? formatCurrency(req.approvedBudget, req.currency) : 'Nicht genehmigt'}
          </p>
          {req.actualCost && (
            <p class="text-xs text-gray-500">
              Verbraucht: {formatCurrency(req.actualCost, req.currency)}
            </p>
          )}
        </div>
        <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">
          💰
        </div>
      </div>
    </div>

    <div class="card">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600">Fällig</p>
          <p class="font-medium text-gray-900">
            {req.currentStepDueDate ? formatDate(req.currentStepDueDate) : 'Offen'}
          </p>
          {req.currentWorkflowStep && (
            <p class="text-xs text-gray-500">
              {req.currentWorkflowStep}
            </p>
          )}
        </div>
        <div class="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl">
          📅
        </div>
      </div>
    </div>
  </div>

  {/* Navigation Tabs */}
  <div class="border-b border-gray-200 mb-6">
    <nav class="flex space-x-8">
      {[
        { id: 'overview', label: 'Übersicht', icon: '📋' },
        { id: 'workflow', label: 'Workflow', icon: '🎯' },
        { id: 'comments', label: 'Kommentare', icon: '💬', count: comments.value.length },
        { id: 'attachments', label: 'Anhänge', icon: '📎', count: attachments.value.length },
        { id: 'history', label: 'Historie', icon: '📚' }
      ].map(tab => (
        <button
          key={tab.id}
          class={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab.value === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick$={() => activeTab.value = tab.id as any}
        >
          <span class="mr-2">{tab.icon}</span>
          {tab.label}
          {tab.count !== undefined && (
            <span class="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </nav>
  </div>

  {/* Tab Content */}
  {activeTab.value === 'overview' && (
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Basic Information */}
      <div class="card">
        <h3 class="text-xl font-semibold mb-4">Grundinformationen</h3>
        
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-gray-700">Beschreibung</label>
            <p class="mt-1 text-gray-900">{req.description}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-700">Angefordert von</label>
              <p class="mt-1 text-gray-900">{req.requestedBy}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700">Fachlicher Betreuer</label>
              <p class="mt-1 text-gray-900">{req.businessOwner || 'Nicht zugewiesen'}</p>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-700">Technischer Betreuer</label>
              <p class="mt-1 text-gray-900">{req.technicalOwner || 'Nicht zugewiesen'}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700">Abteilung</label>
              <p class="mt-1 text-gray-900">{req.department || 'Nicht angegeben'}</p>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-700">Angefordert am</label>
              <p class="mt-1 text-gray-900">{formatDate(req.requestedDate)}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700">Benötigt bis</label>
              <p class="mt-1 text-gray-900">{req.requiredByDate ? formatDate(req.requiredByDate) : 'Offen'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div class="card">
        <h3 class="text-xl font-semibold mb-4">💰 Finanzielle Informationen</h3>
        
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-700">Geschätzte Kosten</label>
              <p class="mt-1 text-lg font-semibold text-gray-900">
                {req.estimatedCost ? formatCurrency(req.estimatedCost, req.currency) : 'Nicht angegeben'}
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700">Genehmigtes Budget</label>
              <p class="mt-1 text-lg font-semibold text-green-600">
                {req.approvedBudget ? formatCurrency(req.approvedBudget, req.currency) : 'Nicht genehmigt'}
              </p>
            </div>
          </div>
          
          <div>
            <label class="text-sm font-medium text-gray-700">Aktuelle Kosten</label>
            <p class="mt-1 text-lg font-semibold text-blue-600">
              {req.actualCost ? formatCurrency(req.actualCost, req.currency) : 'Noch keine Kosten'}
            </p>
            {req.approvedBudget && req.actualCost && (
              <div class="mt-2">
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Budget-Verbrauch</span>
                  <span>{Math.round((req.actualCost / req.approvedBudget) * 100)}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-blue-600 h-2 rounded-full" 
                    style={`width: ${Math.min((req.actualCost / req.approvedBudget) * 100, 100)}%`}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          {req.costCenter && (
            <div>
              <label class="text-sm font-medium text-gray-700">Kostenstelle</label>
              <p class="mt-1 text-gray-900">{req.costCenter}</p>
            </div>
          )}
        </div>
      </div>

      {/* Compliance & Security */}
      <div class="card">
        <h3 class="text-xl font-semibold mb-4">🔒 Compliance & Sicherheit</h3>
        
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-gray-700">Sicherheitsklassifizierung</label>
            <span class={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
              req.securityClassification === 'Confidential' ? 'bg-red-100 text-red-800' :
              req.securityClassification === 'Internal' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {req.securityClassification}
            </span>
          </div>
          
          <div>
            <label class="text-sm font-medium text-gray-700">Personenbezogene Daten</label>
            <p class="mt-1">
              <span class={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                req.hasPersonalData ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
              }`}>
                {req.hasPersonalData ? '⚠️ Ja' : '✅ Nein'}
              </span>
            </p>
          </div>
          
          {req.complianceFlags && req.complianceFlags.length > 0 && (
            <div>
              <label class="text-sm font-medium text-gray-700">Compliance-Flags</label>
              <div class="mt-1 flex flex-wrap gap-2">
                {req.complianceFlags.map(flag => (
                  <span key={flag} class="inline-block px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Data */}
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold">📝 Formulardaten</h3>
          <button 
            class="btn btn-secondary text-sm"
            onClick$={() => showFormData.value = !showFormData.value}
          >
            {showFormData.value ? 'Ausblenden' : 'Anzeigen'}
          </button>
        </div>
        
        {req.formName && (
          <p class="text-sm text-gray-600 mb-3">Formular: {req.formName}</p>
        )}
        
        {showFormData.value && req.formData && (
          <div class="space-y-3">
            {Object.entries(req.formData).map(([key, value]) => (
              <div key={key}>
                <label class="text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </label>
                <p class="mt-1 text-gray-900 bg-gray-50 p-2 rounded">{String(value)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )}

  {activeTab.value === 'workflow' && (
    <div class="space-y-6">
      {/* Current Assignment */}
      {req.currentAssignee && (
        <div class="card bg-blue-50 border-blue-200">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
              👤
            </div>
            <div>
              <h3 class="font-semibold text-blue-900">Aktuell zugewiesen</h3>
              <p class="text-blue-800">{req.currentAssignee}</p>
              <p class="text-sm text-blue-600">
                Schritt: {req.currentWorkflowStep} • 
                Fällig: {req.currentStepDueDate ? formatDate(req.currentStepDueDate) : 'Offen'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Steps */}
      <div class="card">
        <h3 class="text-xl font-semibold mb-6">🎯 Workflow-Fortschritt</h3>
        
        <div class="space-y-4">
          {workflowSteps.value.map((step, index) => (
            <div key={step.id} class="flex items-start gap-4">
              {/* Step Icon */}
              <div class="flex flex-col items-center">
                <div class={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                  step.status === 'Completed' ? 'bg-green-500' :
                  step.status === 'Current' ? 'bg-blue-500' :
                  step.status === 'Skipped' ? 'bg-orange-500' :
                  'bg-gray-300'
                }`}>
                  {step.status === 'Completed' ? '✓' : 
                   step.status === 'Skipped' ? '⏭️' : 
                   index + 1}
                </div>
                {index < workflowSteps.value.length - 1 && (
                  <div class={`w-1 h-12 ${
                    step.status === 'Completed' ? 'bg-green-200' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>

              {/* Step Content */}
              <div class="flex-1 pb-8">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-medium text-gray-900">{step.title}</h4>
                  <span class={`px-2 py-1 rounded-full text-xs font-medium ${getStepStatusColor(step.status)}`}>
                    {step.status}
                  </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span class="font-medium">Zugewiesen an:</span> {step.assignedTo || 'Nicht zugewiesen'}
                  </div>
                  <div>
                    <span class="font-medium">Geschätzte Dauer:</span> {step.estimatedDays} Tage
                  </div>
                  {step.startDate && (
                    <div>
                      <span class="font-medium">Gestartet:</span> {formatDate(step.startDate)}
                    </div>
                  )}
                  {step.completedDate && (
                    <div>
                      <span class="font-medium">Abgeschlossen:</span> {formatDate(step.completedDate)}
                    </div>
                  )}
                  {step.dueDate && !step.completedDate && (
                    <div>
                      <span class="font-medium">Fällig:</span> {formatDate(step.dueDate)}
                    </div>
                  )}
                  {step.actualDays && (
                    <div>
                      <span class="font-medium">Tatsächliche Dauer:</span> {step.actualDays} Tage
                    </div>
                  )}
                </div>
                
                {step.comments && (
                  <div class="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-700">{step.comments}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )}

  {activeTab.value === 'comments' && (
    <div class="space-y-6">
      {/* Add Comment */}
      <div class="card">
        <h3 class="text-xl font-semibold mb-4">💬 Neuen Kommentar hinzufügen</h3>
        
        <div class="space-y-4">
          <textarea
            class="form-input"
            rows={4}
            placeholder="Ihr Kommentar..."
            value={newComment.value}
            onInput$={(e) => newComment.value = (e.target as HTMLTextAreaElement).value}
          />
          <button 
            class="btn btn-primary"
            onClick$={addComment}
            disabled={!newComment.value.trim() || isAddingComment.value}
          >
            {isAddingComment.value ? 'Wird hinzugefügt...' : 'Kommentar hinzufügen'}
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div class="card">
        <h3 class="text-xl font-semibold mb-4">Kommentare ({comments.value.length})</h3>
        
        <div class="space-y-4">
          {comments.value.map((comment) => (
            <div key={comment.id} class={`p-4 rounded-lg border ${
              comment.isInternal ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'
            }`}>
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                    {comment.createdBy.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{comment.createdBy.split('@')[0]}</p>
                    <p class="text-sm text-gray-500">{formatDateTime(comment.createdAt)}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  {comment.isInternal && (
                    <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Intern
                    </span>
                  )}
                  <span class={`px-2 py-1 text-xs rounded-full ${
                    comment.commentType === 'StatusChange' ? 'bg-blue-100 text-blue-800' :
                    comment.commentType === 'Approval' ? 'bg-green-100 text-green-800' :
                    comment.commentType === 'Technical' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {comment.commentType}
                  </span>
                </div>
              </div>
              
              <p class="text-gray-900 mb-2">{comment.comment}</p>
              
              {comment.workflowStep && (
                <p class="text-xs text-gray-500">
                  Workflow-Schritt: {comment.workflowStep}
                </p>
              )}
              
              {comment.previousStatus && comment.newStatus && (
                <p class="text-xs text-blue-600">
                  Status geändert: {comment.previousStatus} → {comment.newStatus}
                </p>
              )}
            </div>
          ))}
          
          {comments.value.length === 0 && (
            <div class="text-center py-8 text-gray-500">
              <div class="text-4xl mb-4">💬</div>
              <p>Noch keine Kommentare vorhanden</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )}

  {activeTab.value === 'attachments' && (
    <div class="space-y-6">
      {/* Upload Area */}
      <div class="card">
        <h3 class="text-xl font-semibold mb-4">📎 Datei hinzufügen</h3>
        
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <div class="text-4xl mb-4">📁</div>
          <p class="text-lg font-medium text-gray-900 mb-2">Dateien hier ablegen</p>
          <p class="text-sm text-gray-500 mb-4">oder klicken zum Auswählen</p>
          <button class="btn btn-primary">
            Dateien auswählen
          </button>
        </div>
      </div>

      {/* Attachments List */}
      <div class="card">
        <h3 class="text-xl font-semibold mb-4">Anhänge ({attachments.value.length})</h3>
        
        <div class="space-y-3">
          {attachments.value.map((attachment) => (
            <div key={attachment.id} class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  {attachment.contentType.includes('pdf') ? '📄' :
                   attachment.contentType.includes('image') ? '🖼️' :
                   attachment.contentType.includes('spreadsheet') ? '📊' :
                   '📎'}
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">{attachment.originalFileName}</h4>
                  <div class="flex items-center gap-4 text-sm text-gray-500">
                    <span>{formatFileSize(attachment.fileSize)}</span>
                    <span>•</span>
                    <span>{attachment.category}</span>
                    <span>•</span>
                    <span>Hochgeladen von {attachment.uploadedBy.split('@')[0]}</span>
                    <span>•</span>
                    <span>{formatDateTime(attachment.createdAt)}</span>
                  </div>
                  {attachment.description && (
                    <p class="text-sm text-gray-600 mt-1">{attachment.description}</p>
                  )}
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                {!attachment.isPublic && (
                  <span class="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    Privat
                  </span>
                )}
                <button class="btn btn-secondary text-sm">
                  📥 Download
                </button>
              </div>
            </div>
          ))}
          
          {attachments.value.length === 0 && (
            <div class="text-center py-8 text-gray-500">
              <div class="text-4xl mb-4">📎</div>
              <p>Noch keine Anhänge vorhanden</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )}

  {activeTab.value === 'history' && (
    <div class="card">
      <h3 class="text-xl font-semibold mb-4">📚 Änderungshistorie</h3>
      
      <div class="space-y-4">
        <div class="p-4 border-l-4 border-blue-500 bg-blue-50">
          <div class="flex justify-between items-start mb-2">
            <h4 class="font-medium text-blue-900">Anforderung erstellt</h4>
            <span class="text-sm text-blue-600">{formatDateTime(req.createdAt)}</span>
          </div>
          <p class="text-blue-800">Von: {req.createdBy}</p>
        </div>
        
        <div class="p-4 border-l-4 border-green-500 bg-green-50">
          <div class="flex justify-between items-start mb-2">
            <h4 class="font-medium text-green-900">Anforderung zuletzt geändert</h4>
            <span class="text-sm text-green-600">{formatDateTime(req.modifiedAt)}</span>
          </div>
          <p class="text-green-800">Von: {req.modifiedBy || 'System'}</p>
        </div>
        
        {/* More history entries would be loaded from API */}
        <div class="text-center py-8 text-gray-500">
          <p class="text-sm">Weitere Historiendaten werden aus der Datenbank geladen...</p>
        </div>
      </div>
    </div>
  )}
</div>


);
});
