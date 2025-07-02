import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

// Types
interface Requirement {
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
estimatedCost?: number;
approvedBudget?: number;
actualCost?: number;
currency: string;
requestedDate: string;
requiredByDate?: string;
startDate?: string;
completedDate?: string;
currentWorkflowStep?: string;
currentAssignee?: string;
currentStepDueDate?: string;
attachmentCount: number;
commentCount: number;
workflowName?: string;
formName?: string;
hasPersonalData: boolean;
securityClassification: string;
}

interface RequirementFilters {
search: string;
type: string;
status: string;
priority: string;
assignee: string;
dateRange: string;
department: string;
}

// Mock data - replace with real API
const mockRequirements: Requirement[] = [
{
id: 'req-1',
requirementNumber: 'REQ-2025-001',
title: 'Neue CRM-Integration',
description: 'Integration des bestehenden CRM-Systems mit der Anforderungsverwaltung für bessere Datenübertragung',
requirementType: 'Großanforderung',
priority: 'High',
status: 'InProgress',
requestedBy: 'max.mustermann@company.com',
businessOwner: 'Anna Schmidt',
technicalOwner: 'Thomas Wagner',
department: 'IT',
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
attachmentCount: 5,
commentCount: 12,
workflowName: 'Großanforderung Enhanced',
formName: 'Großanforderung Form v2.1',
hasPersonalData: true,
securityClassification: 'Confidential'
},
{
id: 'req-2',
requirementNumber: 'REQ-2025-002',
title: 'Bugfix User Login',
description: 'Behebung des Login-Problems bei externen Benutzern die über SSO authentifiziert werden',
requirementType: 'Kleinanforderung',
priority: 'Urgent',
status: 'Submitted',
requestedBy: 'anna.schmidt@company.com',
businessOwner: 'Lisa Müller',
technicalOwner: 'Thomas Wagner',
department: 'IT',
estimatedCost: 2500,
currency: 'EUR',
requestedDate: '2025-01-20',
requiredByDate: '2025-08-15',
currentWorkflowStep: 'Prüfung',
currentAssignee: 'approver.team@company.com',
currentStepDueDate: '2025-07-10',
attachmentCount: 2,
commentCount: 4,
workflowName: 'Kleinanforderung Enhanced',
formName: 'Kleinanforderung Form v1.2',
hasPersonalData: false,
securityClassification: 'Internal'
},
{
id: 'req-3',
requirementNumber: 'REQ-2025-003',
title: 'Dashboard Performance Optimierung',
description: 'Verbesserung der Ladezeiten des Management-Dashboards durch Caching und Query-Optimierung',
requirementType: 'TIA-Anforderung',
priority: 'Medium',
status: 'Completed',
requestedBy: 'thomas.wagner@company.com',
businessOwner: 'Max Mustermann',
technicalOwner: 'Dev Team',
department: 'IT',
estimatedCost: 8000,
approvedBudget: 8000,
actualCost: 7200,
currency: 'EUR',
requestedDate: '2025-01-10',
requiredByDate: '2025-10-01',
startDate: '2025-01-25',
completedDate: '2025-06-15',
attachmentCount: 8,
commentCount: 18,
workflowName: 'TIA-Anforderung Enhanced',
formName: 'TIA Form v1.0',
hasPersonalData: false,
securityClassification: 'Internal'
},
{
id: 'req-4',
requirementNumber: 'REQ-2025-004',
title: 'DSGVO Compliance Audit',
description: 'Vollständige Überprüfung aller Datenverarbeitungsprozesse auf DSGVO-Konformität',
requirementType: 'Supportleistung',
priority: 'High',
status: 'OnHold',
requestedBy: 'compliance@company.com',
businessOwner: 'Legal Team',
technicalOwner: 'Security Team',
department: 'Legal',
estimatedCost: 15000,
currency: 'EUR',
requestedDate: '2025-01-12',
requiredByDate: '2025-11-30',
currentWorkflowStep: 'Genehmigung',
attachmentCount: 15,
commentCount: 8,
workflowName: 'Support Enhanced',
hasPersonalData: true,
securityClassification: 'Confidential'
}
];

const requirementTypes = [
'Kleinanforderung',
'Großanforderung',
'TIA-Anforderung',
'Supportleistung',
'Betriebsauftrag',
'SBBI-Lösung',
'AWG-Release',
'AWS-Release'
];

const departments = ['IT', 'Legal', 'Finance', 'HR', 'Marketing', 'Sales', 'Operations'];

export default component$(() => {
// State
const requirements = useSignal<Requirement[]>([]);
const filteredRequirements = useSignal<Requirement[]>([]);
const isLoading = useSignal(true);
const selectedRequirement = useSignal<Requirement | null>(null);
const showFilters = useSignal(false);
const viewMode = useSignal<'list' | 'grid' | 'kanban'>('list');

// Filters
const filters = useSignal<RequirementFilters>({
search: '',
type: '',
status: '',
priority: '',
assignee: '',
dateRange: '',
department: ''
});

// Stats
const stats = useSignal({
total: 0,
byStatus: {} as Record<string, number>,
byPriority: {} as Record<string, number>,
totalBudget: 0,
totalActualCost: 0
});



const calculateStats = $(() => {
const reqs = requirements.value;
const byStatus: Record<string, number> = {};
const byPriority: Record<string, number> = {};
let totalBudget = 0;
let totalActualCost = 0;


reqs.forEach(req => {
  byStatus[req.status] = (byStatus[req.status] || 0) + 1;
  byPriority[req.priority] = (byPriority[req.priority] || 0) + 1;
  totalBudget += req.approvedBudget || req.estimatedCost || 0;
  totalActualCost += req.actualCost || 0;
});

stats.value = {
  total: reqs.length,
  byStatus,
  byPriority,
  totalBudget,
  totalActualCost
};


});

const applyFilters = $(() => {
let filtered = requirements.value;


if (filters.value.search) {
  const search = filters.value.search.toLowerCase();
  filtered = filtered.filter(req => 
    req.title.toLowerCase().includes(search) ||
    req.description.toLowerCase().includes(search) ||
    req.requirementNumber.toLowerCase().includes(search)
  );
}

if (filters.value.type) {
  filtered = filtered.filter(req => req.requirementType === filters.value.type);
}

if (filters.value.status) {
  filtered = filtered.filter(req => req.status === filters.value.status);
}

if (filters.value.priority) {
  filtered = filtered.filter(req => req.priority === filters.value.priority);
}

if (filters.value.department) {
  filtered = filtered.filter(req => req.department === filters.value.department);
}

filteredRequirements.value = filtered;


});

// Watch filter changes
useTask$(({ track }) => {
track(() => filters.value);
applyFilters();
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

// Load data
useTask$(async () => {
// Simulate API call
await new Promise(resolve => setTimeout(resolve, 500));
requirements.value = mockRequirements;
filteredRequirements.value = mockRequirements;
isLoading.value = false;


// Calculate stats
calculateStats();


});

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

const formatCurrency = (amount: number, currency: string = 'EUR') => {
return new Intl.NumberFormat('de-DE', {
style: 'currency',
currency: currency
}).format(amount);
};

const formatDate = (dateString: string) => {
return new Date(dateString).toLocaleDateString('de-DE');
};

return (
<div class="container">
{/* Header */}
<div class="flex items-center justify-between mb-6">
<div>
<h1 class="text-3xl font-bold text-gray-900">Anforderungen Übersicht</h1>
<p class="text-gray-600 mt-1">
Zentrale Verwaltung aller Anforderungen mit Enhanced Features
</p>
</div>
<div class="flex gap-3">
<button
class='btn btn-secondary'
onClick$={() => showFilters.value = !showFilters.value}
>
🔍 {showFilters.value ? 'Filter ausblenden' : 'Filter anzeigen'}
</button>
<Link href="/requirements/new" class="btn btn-primary">
➕ Neue Anforderung
</Link>
</div>
</div>


  {/* Stats Cards */}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
    <div class="card">
      <div class="flex items-center">
        <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
          📋
        </div>
        <div>
          <h3 class="text-2xl font-bold text-gray-900">{stats.value.total}</h3>
          <p class="text-sm text-gray-600">Gesamt Anforderungen</p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="flex items-center">
        <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
          💰
        </div>
        <div>
          <h3 class="text-lg font-bold text-gray-900">{formatCurrency(stats.value.totalBudget)}</h3>
          <p class="text-sm text-gray-600">Gesamt Budget</p>
          <p class="text-xs text-gray-500">
            Verbraucht: {formatCurrency(stats.value.totalActualCost)}
          </p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="flex items-center">
        <div class="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
          ⚡
        </div>
        <div>
          <h3 class="text-2xl font-bold text-gray-900">{stats.value.byStatus.InProgress || 0}</h3>
          <p class="text-sm text-gray-600">In Bearbeitung</p>
          <p class="text-xs text-gray-500">
            Urgent: {stats.value.byPriority.Urgent || 0}
          </p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="flex items-center">
        <div class="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
          ✅
        </div>
        <div>
          <h3 class="text-2xl font-bold text-gray-900">{stats.value.byStatus.Completed || 0}</h3>
          <p class="text-sm text-gray-600">Abgeschlossen</p>
          <p class="text-xs text-gray-500">
            Diese Woche: {Math.floor(Math.random() * 3) + 1}
          </p>
        </div>
      </div>
    </div>
  </div>

  {/* Filters */}
  {showFilters.value && (
    <div class="card mb-6">
      <h3 class="text-lg font-semibold mb-4">🔍 Filter & Suche</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="form-group">
          <label class="form-label">Suche</label>
          <input 
            type="text" 
            class="form-input" 
            placeholder="Titel, Beschreibung, REQ-Nummer..."
            value={filters.value.search}
            onInput$={(e) => {
              filters.value = {
                ...filters.value,
                search: (e.target as HTMLInputElement).value
              };
            }}
          />
        </div>

        <div class="form-group">
          <label class="form-label">Typ</label>
          <select 
            class="form-input"
            value={filters.value.type}
            onChange$={(e) => {
              filters.value = {
                ...filters.value,
                type: (e.target as HTMLSelectElement).value
              };
            }}
          >
            <option value="">Alle Typen</option>
            {requirementTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Status</label>
          <select 
            class="form-input"
            value={filters.value.status}
            onChange$={(e) => {
              filters.value = {
                ...filters.value,
                status: (e.target as HTMLSelectElement).value
              };
            }}
          >
            <option value="">Alle Status</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Eingereicht</option>
            <option value="InProgress">In Bearbeitung</option>
            <option value="Completed">Abgeschlossen</option>
            <option value="Rejected">Abgelehnt</option>
            <option value="OnHold">Pausiert</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Priorität</label>
          <select 
            class="form-input"
            value={filters.value.priority}
            onChange$={(e) => {
              filters.value = {
                ...filters.value,
                priority: (e.target as HTMLSelectElement).value
              };
            }}
          >
            <option value="">Alle Prioritäten</option>
            <option value="Urgent">Dringend</option>
            <option value="High">Hoch</option>
            <option value="Medium">Mittel</option>
            <option value="Low">Niedrig</option>
          </select>
        </div>
      </div>

      <div class="flex gap-3 mt-4">
        <button 
          class="btn btn-primary"
          onClick$={applyFilters}
        >
          Filter anwenden
        </button>
        <button 
          class="btn btn-secondary"
          onClick$={() => {
            filters.value = {
              search: '',
              type: '',
              status: '',
              priority: '',
              assignee: '',
              dateRange: '',
              department: ''
            };
          }}
        >
          Zurücksetzen
        </button>
      </div>
    </div>
  )}

  {/* View Mode Selector */}
  <div class="flex items-center justify-between mb-4">
    <div class="flex items-center gap-3">
      <span class="text-sm font-medium text-gray-700">Ansicht:</span>
      <div class="flex rounded-lg border border-gray-300 overflow-hidden">
        <button 
          class={`px-3 py-1 text-sm ${viewMode.value === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          onClick$={() => viewMode.value = 'list'}
        >
          📋 Liste
        </button>
        <button 
          class={`px-3 py-1 text-sm ${viewMode.value === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          onClick$={() => viewMode.value = 'grid'}
        >
          🔲 Grid
        </button>
        <button 
          class={`px-3 py-1 text-sm ${viewMode.value === 'kanban' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          onClick$={() => viewMode.value = 'kanban'}
        >
          📊 Kanban
        </button>
      </div>
    </div>
    
    <div class="text-sm text-gray-600">
      {filteredRequirements.value.length} von {requirements.value.length} Anforderungen
    </div>
  </div>

  {/* Requirements List */}
  {isLoading.value ? (
    <div class="card text-center py-12">
      <div class="text-4xl mb-4">⏳</div>
      <p class="text-lg font-medium">Anforderungen werden geladen...</p>
    </div>
  ) : viewMode.value === 'list' ? (
    <div class="card">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-3 px-4">Anforderung</th>
              <th class="text-left py-3 px-4">Typ</th>
              <th class="text-left py-3 px-4">Status</th>
              <th class="text-left py-3 px-4">Priorität</th>
              <th class="text-left py-3 px-4">Zuständig</th>
              <th class="text-left py-3 px-4">Budget</th>
              <th class="text-left py-3 px-4">Fällig</th>
              <th class="text-left py-3 px-4">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequirements.value.map((req) => (
              <tr key={req.id} class="border-b hover:bg-gray-50">
                <td class="py-3 px-4">
                  <div>
                    <div class="flex items-center gap-2">
                      <Link 
                        href={`/requirements/${req.id}`}
                        class="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {req.title}
                      </Link>
                      {req.hasPersonalData && (
                        <span class="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                          DSGVO
                        </span>
                      )}
                    </div>
                    <div class="text-sm text-gray-600 mt-1">
                      {req.requirementNumber} • {req.department}
                    </div>
                    <div class="flex items-center gap-2 mt-1">
                      {req.attachmentCount > 0 && (
                        <span class="text-xs text-gray-500">📎 {req.attachmentCount}</span>
                      )}
                      {req.commentCount > 0 && (
                        <span class="text-xs text-gray-500">💬 {req.commentCount}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span class="text-sm">{req.requirementType}</span>
                </td>
                <td class="py-3 px-4">
                  <span class={`px-2 py-1 rounded-full text-xs ${getStatusColor(req.status)}`}>
                    {req.status}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <div class={`w-3 h-3 rounded-full ${getPriorityColor(req.priority)}`}></div>
                    <span class="text-sm">{req.priority}</span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div class="text-sm">
                    {req.currentAssignee ? (
                      <>
                        <div class="font-medium">{req.currentAssignee.split('@')[0]}</div>
                        <div class="text-gray-500">{req.currentWorkflowStep}</div>
                      </>
                    ) : (
                      <span class="text-gray-500">Nicht zugewiesen</span>
                    )}
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div class="text-sm">
                    {req.approvedBudget ? (
                      <>
                        <div class="font-medium">{formatCurrency(req.approvedBudget, req.currency)}</div>
                        {req.actualCost && (
                          <div class="text-gray-500">Verbraucht: {formatCurrency(req.actualCost, req.currency)}</div>
                        )}
                      </>
                    ) : req.estimatedCost ? (
                      <div class="text-gray-500">Geschätzt: {formatCurrency(req.estimatedCost, req.currency)}</div>
                    ) : (
                      <span class="text-gray-400">Kein Budget</span>
                    )}
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div class="text-sm">
                    {req.currentStepDueDate ? (
                      <>
                        <div class="font-medium">{formatDate(req.currentStepDueDate)}</div>
                        <div class="text-gray-500">Aktueller Schritt</div>
                      </>
                    ) : req.requiredByDate ? (
                      <div class="text-gray-500">{formatDate(req.requiredByDate)}</div>
                    ) : (
                      <span class="text-gray-400">Offen</span>
                    )}
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div class="flex gap-2">
                    <Link 
                      href={`/requirements/${req.id}`} 
                      class="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      👁️ Anzeigen
                    </Link>
                    <Link 
                      href={`/requirements/${req.id}/edit`} 
                      class="text-green-600 hover:text-green-800 text-sm"
                    >
                      ✏️ Bearbeiten
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredRequirements.value.length === 0 && (
        <div class="text-center py-12">
          <div class="text-4xl mb-4">🔍</div>
          <h3 class="font-medium text-gray-900 mb-2">Keine Anforderungen gefunden</h3>
          <p class="text-sm text-gray-500">
            Versuche die Filter anzupassen oder erstelle eine neue Anforderung
          </p>
        </div>
      )}
    </div>
  ) : viewMode.value === 'grid' ? (
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredRequirements.value.map((req) => (
        <div key={req.id} class="card hover:shadow-lg transition-shadow">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="font-medium text-gray-900 mb-1">{req.title}</h3>
              <p class="text-sm text-gray-600">{req.requirementNumber}</p>
            </div>
            <div class="flex items-center gap-1">
              <div class={`w-3 h-3 rounded-full ${getPriorityColor(req.priority)}`}></div>
              <span class={`px-2 py-1 rounded-full text-xs ${getStatusColor(req.status)}`}>
                {req.status}
              </span>
            </div>
          </div>
          
          <p class="text-sm text-gray-600 mb-3 line-clamp-2">{req.description}</p>
          
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Typ:</span>
              <span>{req.requirementType}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Budget:</span>
              <span class="font-medium">
                {req.approvedBudget ? formatCurrency(req.approvedBudget, req.currency) : 'Nicht definiert'}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Fällig:</span>
              <span>{req.requiredByDate ? formatDate(req.requiredByDate) : 'Offen'}</span>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t flex justify-between items-center">
            <div class="flex items-center gap-3 text-xs text-gray-500">
              {req.attachmentCount > 0 && <span>📎 {req.attachmentCount}</span>}
              {req.commentCount > 0 && <span>💬 {req.commentCount}</span>}
              {req.hasPersonalData && <span class="text-orange-600">🔒 DSGVO</span>}
            </div>
            <Link 
              href={`/requirements/${req.id}`}
              class="btn btn-primary text-sm"
            >
              Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  ) : (
    // Kanban View
    <div class="flex gap-6 overflow-x-auto pb-6">
      {['Draft', 'Submitted', 'InProgress', 'Completed'].map(status => (
        <div key={status} class="min-w-80 bg-gray-50 rounded-lg p-4">
          <h3 class="font-medium text-gray-900 mb-4 flex items-center justify-between">
            {status}
            <span class="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
              {filteredRequirements.value.filter(req => req.status === status).length}
            </span>
          </h3>
          
          <div class="space-y-3">
            {filteredRequirements.value.filter(req => req.status === status).map((req) => (
              <div key={req.id} class="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-2">
                  <h4 class="font-medium text-sm">{req.title}</h4>
                  <div class={`w-3 h-3 rounded-full ${getPriorityColor(req.priority)}`}></div>
                </div>
                <p class="text-xs text-gray-600 mb-2">{req.requirementNumber}</p>
                <p class="text-xs text-gray-500 line-clamp-2 mb-3">{req.description}</p>
                
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-500">{req.requirementType}</span>
                  <Link 
                    href={`/requirements/${req.id}`}
                    class="text-blue-600 hover:text-blue-800"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )}
</div>


);
});

