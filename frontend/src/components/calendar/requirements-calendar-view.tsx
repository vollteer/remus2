// src/components/calendar/requirements-calendar-view.tsx
import { component$, useSignal, useStore, useTask$, $ } from '@builder.io/qwik';

interface RequirementEvent {
id: string;
title: string;
requirementNumber: string;
date: string;
time?: string;
type: 'deadline' | 'milestone' | 'review' | 'release';
requirementType: RequirementType;
priority: Priority;
status: RequirementStatus;
assignee?: string;
description?: string;
workflowStep?: string;
originalRequirement: Requirement;
}

interface Requirement {
id: string;
title: string;
requirementNumber: string;
type: RequirementType;
status: RequirementStatus;
priority: Priority;
dueDate?: string;
currentStepDueDate?: string;
assignedTo?: string;
currentWorkflowStep?: string;
description?: string;
}

type RequirementType =
| 'Kleinanforderung'
| 'Großanforderung'
| 'TIA-Anforderung'
| 'Supportleistung'
| 'Betriebsauftrag'
| 'SBBI-Lösung'
| 'AWG-Release'
| 'AWS-Release';

type RequirementStatus =
| 'Draft'
| 'Open'
| 'In Progress'
| 'Review'
| 'Testing'
| 'Completed'
| 'Rejected'
| 'On Hold';

type Priority = 'low' | 'medium' | 'high' | 'critical';

interface CalendarFilters {
requirementTypes: RequirementType[];
eventTypes: string[];
priorities: Priority[];
statuses: RequirementStatus[];
showOverdue: boolean;
showUpcoming: boolean;
}

export const RequirementsCalendarView = component$(() => {
const currentDate = useSignal(new Date());
const view = useSignal<'month' | 'week' | 'day'>('month');
const selectedEvent = useSignal<RequirementEvent | null>(null);
const showEventModal = useSignal(false);
const showFilters = useSignal(false);
const isLoading = useSignal(false);

// Filter state
const filters = useStore<CalendarFilters>({
requirementTypes: ['AWS-Release', 'AWG-Release', 'Großanforderung'], // Default zu wichtigen Types
eventTypes: ['deadline', 'milestone', 'release'],
priorities: ['high', 'critical', 'medium'],
statuses: ['Open', 'In Progress', 'Review'],
showOverdue: true,
showUpcoming: true
});

// Mock Requirements data - in real app würde das von der API kommen
const requirements = useStore<Requirement[]>([
{
id: 'REQ-001',
title: 'AWS Migration Database Service',
requirementNumber: 'AWS-2024-001',
type: 'AWS-Release',
status: 'In Progress',
priority: 'high',
dueDate: '2025-07-15',
currentStepDueDate: '2025-07-08',
assignedTo: 'Thomas Wagner',
currentWorkflowStep: 'Cloud Setup',
description: 'Migration der Hauptdatenbank zu AWS RDS'
},
{
id: 'REQ-002',
title: 'Container Orchestration Setup',
requirementNumber: 'AWS-2024-002',
type: 'AWS-Release',
status: 'Review',
priority: 'critical',
dueDate: '2025-07-20',
currentStepDueDate: '2025-07-05',
assignedTo: 'Lisa Müller',
currentWorkflowStep: 'AWS Planning',
description: 'Kubernetes Cluster Setup in EKS'
},
{
id: 'REQ-003',
title: 'Legacy System AWG Migration',
requirementNumber: 'AWG-2024-003',
type: 'AWG-Release',
status: 'Open',
priority: 'medium',
dueDate: '2025-08-01',
currentStepDueDate: '2025-07-10',
assignedTo: 'Peter Klein',
currentWorkflowStep: 'Analysis',
description: 'Migration des Legacy AWG Systems'
},
{
id: 'REQ-004',
title: 'API Gateway Implementation',
requirementNumber: 'GR-2024-004',
type: 'Großanforderung',
status: 'Testing',
priority: 'high',
dueDate: '2025-07-12',
currentStepDueDate: '2025-07-06',
assignedTo: 'Sarah Weber',
currentWorkflowStep: 'Testing',
description: 'Implementierung des zentralen API Gateways'
}
]);

// Convert requirements to calendar events
const events = useStore<RequirementEvent[]>([]);

// Load and filter events
const loadEvents = $(async () => {
isLoading.value = true;


try {
  // Simulate API call - in real app: await RequirementsApiService.getRequirements()
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const filteredRequirements = requirements.filter(req => {
    return filters.requirementTypes.includes(req.type) &&
           filters.priorities.includes(req.priority) &&
           filters.statuses.includes(req.status);
  });

  const calendarEvents: RequirementEvent[] = [];

  filteredRequirements.forEach(req => {
    // Add main deadline event
    if (req.dueDate) {
      const isOverdue = new Date(req.dueDate) < new Date() && req.status !== 'Completed';
      
      if ((isOverdue && filters.showOverdue) || (!isOverdue && filters.showUpcoming)) {
        calendarEvents.push({
          id: `${req.id}-deadline`,
          title: `📅 ${req.title}`,
          requirementNumber: req.requirementNumber,
          date: req.dueDate,
          type: 'deadline',
          requirementType: req.type,
          priority: req.priority,
          status: req.status,
          assignee: req.assignedTo,
          description: `Deadline: ${req.description}`,
          originalRequirement: req
        });
      }
    }

    // Add current step deadline
    if (req.currentStepDueDate && req.currentWorkflowStep) {
      const stepIsOverdue = new Date(req.currentStepDueDate) < new Date() && req.status !== 'Completed';
      
      if ((stepIsOverdue && filters.showOverdue) || (!stepIsOverdue && filters.showUpcoming)) {
        calendarEvents.push({
          id: `${req.id}-step`,
          title: `🎯 ${req.currentWorkflowStep}`,
          requirementNumber: req.requirementNumber,
          date: req.currentStepDueDate,
          type: 'milestone',
          requirementType: req.type,
          priority: req.priority,
          status: req.status,
          assignee: req.assignedTo,
          workflowStep: req.currentWorkflowStep,
          description: `Workflow Schritt: ${req.currentWorkflowStep} für ${req.title}`,
          originalRequirement: req
        });
      }
    }

    // Add release events for AWS/AWG releases
    if ((req.type === 'AWS-Release' || req.type === 'AWG-Release') && req.dueDate) {
      const releaseDate = new Date(req.dueDate);
      releaseDate.setDate(releaseDate.getDate() + 1); // Day after deadline = release day
      
      calendarEvents.push({
        id: `${req.id}-release`,
        title: `🚀 ${req.type} Go-Live`,
        requirementNumber: req.requirementNumber,
        date: releaseDate.toISOString().split('T')[0],
        type: 'release',
        requirementType: req.type,
        priority: req.priority,
        status: req.status,
        assignee: req.assignedTo,
        description: `Release/Go-Live: ${req.title}`,
        originalRequirement: req
      });
    }
  });

  events.splice(0, events.length, ...calendarEvents);
} catch (error) {
  console.error('Error loading events:', error);
} finally {
  isLoading.value = false;
}


});

// Load events when filters change
useTask$(({ track }) => {
track(() => filters.requirementTypes);
track(() => filters.eventTypes);
track(() => filters.priorities);
track(() => filters.statuses);
track(() => filters.showOverdue);
track(() => filters.showUpcoming);


loadEvents();


});

// Get calendar days for current month
const getCalendarDays = $(() => {
const year = currentDate.value.getFullYear();
const month = currentDate.value.getMonth();


const firstDay = new Date(year, month, 1);
const startDate = new Date(firstDay);
startDate.setDate(startDate.getDate() - ((firstDay.getDay() + 6) % 7));

const days: Date[] = [];
const current = new Date(startDate);

for (let i = 0; i < 42; i++) {
  days.push(new Date(current));
  current.setDate(current.getDate() + 1);
}

return days;


});

// Navigate months
const navigateMonth = $((direction: number) => {
const newDate = new Date(currentDate.value);
newDate.setMonth(newDate.getMonth() + direction);
currentDate.value = newDate;
});

// Get events for specific date
const getEventsForDate = $((date: Date) => {
const dateStr = date.toISOString().split('T')[0];
return events.filter(event =>
event.date === dateStr &&
filters.eventTypes.includes(event.type)
);
});

// Event styling
const getEventColor = $((event: RequirementEvent) => {
const isOverdue = new Date(event.date) < new Date() && event.status !== 'Completed';


if (isOverdue) {
  return 'bg-red-600 text-white border-red-700'; // Overdue = rot
}

const baseColors = {
  deadline: event.priority === 'critical' ? 'bg-purple-600' : 'bg-blue-600',
  milestone: event.priority === 'critical' ? 'bg-orange-600' : 'bg-green-600',
  release: 'bg-indigo-600',
  review: 'bg-yellow-600'
};

return `${baseColors[event.type] || 'bg-gray-600'} text-white`;


});

const getRequirementTypeColor = $((type: RequirementType) => {
const colors = {
'AWS-Release': 'bg-orange-100 text-orange-800',
'AWG-Release': 'bg-blue-100 text-blue-800',
'Großanforderung': 'bg-purple-100 text-purple-800',
'TIA-Anforderung': 'bg-green-100 text-green-800',
'Kleinanforderung': 'bg-gray-100 text-gray-800',
'Supportleistung': 'bg-yellow-100 text-yellow-800',
'Betriebsauftrag': 'bg-pink-100 text-pink-800',
'SBBI-Lösung': 'bg-indigo-100 text-indigo-800'
};
return colors[type] || 'bg-gray-100 text-gray-800';
});

const isToday = $((date: Date) => {
const today = new Date();
return date.toDateString() === today.toDateString();
});

const isCurrentMonth = $((date: Date) => {
return date.getMonth() === currentDate.value.getMonth();
});

const openEventModal = $((event: RequirementEvent) => {
selectedEvent.value = event;
showEventModal.value = true;
});

const closeEventModal = $(() => {
showEventModal.value = false;
selectedEvent.value = null;
});

const toggleRequirementTypeFilter = $((type: RequirementType) => {
if (filters.requirementTypes.includes(type)) {
filters.requirementTypes = filters.requirementTypes.filter(t => t !== type);
} else {
filters.requirementTypes = [...filters.requirementTypes, type];
}
});

const toggleEventTypeFilter = $((type: string) => {
if (filters.eventTypes.includes(type)) {
filters.eventTypes = filters.eventTypes.filter(t => t !== type);
} else {
filters.eventTypes = [...filters.eventTypes, type];
}
});

return (
<div class="min-h-screen bg-gray-50 p-6">
<div class="max-w-7xl mx-auto">
{/* Header */}
<div class="mb-8">
<div class="flex items-center justify-between mb-4">
<div>
<h1 class="text-3xl font-bold text-gray-900">Requirements Kalender</h1>
<p class="text-gray-600 mt-1">Deadlines, Meilensteine und Releases im Überblick</p>
</div>


        <div class="flex items-center gap-4">
          <button
            onClick$={() => showFilters.value = !showFilters.value}
            class="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span>🔍</span>
            Filter ({events.filter(e => filters.eventTypes.includes(e.type)).length})
          </button>
          
          <div class="flex items-center bg-white rounded-lg border shadow-sm">
            <button
              onClick$={() => view.value = 'day'}
              class={`px-4 py-2 rounded-l-lg transition-colors ${
                view.value === 'day' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Tag
            </button>
            <button
              onClick$={() => view.value = 'week'}
              class={`px-4 py-2 transition-colors ${
                view.value === 'week' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Woche
            </button>
            <button
              onClick$={() => view.value = 'month'}
              class={`px-4 py-2 rounded-r-lg transition-colors ${
                view.value === 'month' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Monat
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters.value && (
        <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4">Filter Optionen</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Requirement Types */}
            <div>
              <h4 class="font-medium mb-3">Anforderungstypen</h4>
              <div class="space-y-2">
                {(['AWS-Release', 'AWG-Release', 'Großanforderung', 'TIA-Anforderung'] as RequirementType[]).map(type => (
                  <label key={type} class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={filters.requirementTypes.includes(type)}
                      onChange$={() => toggleRequirementTypeFilter(type)}
                      class="rounded"
                    />
                    <span class={`text-xs px-2 py-1 rounded ${getRequirementTypeColor(type)}`}>
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Event Types */}
            <div>
              <h4 class="font-medium mb-3">Event Typen</h4>
              <div class="space-y-2">
                {[
                  { key: 'deadline', label: '📅 Deadlines', color: 'bg-blue-100 text-blue-800' },
                  { key: 'milestone', label: '🎯 Meilensteine', color: 'bg-green-100 text-green-800' },
                  { key: 'release', label: '🚀 Releases', color: 'bg-indigo-100 text-indigo-800' },
                  { key: 'review', label: '👁️ Reviews', color: 'bg-yellow-100 text-yellow-800' }
                ].map(eventType => (
                  <label key={eventType.key} class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={filters.eventTypes.includes(eventType.key)}
                      onChange$={() => toggleEventTypeFilter(eventType.key)}
                      class="rounded"
                    />
                    <span class={`text-xs px-2 py-1 rounded ${eventType.color}`}>
                      {eventType.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <h4 class="font-medium mb-3">Prioritäten</h4>
              <div class="space-y-2">
                {[
                  { key: 'critical', label: '🔴 Kritisch', color: 'bg-red-100 text-red-800' },
                  { key: 'high', label: '🟠 Hoch', color: 'bg-orange-100 text-orange-800' },
                  { key: 'medium', label: '🟡 Mittel', color: 'bg-yellow-100 text-yellow-800' },
                  { key: 'low', label: '🟢 Niedrig', color: 'bg-green-100 text-green-800' }
                ].map(priority => (
                  <label key={priority.key} class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={filters.priorities.includes(priority.key as Priority)}
                      onChange$={() => {
                        const p = priority.key as Priority;
                        if (filters.priorities.includes(p)) {
                          filters.priorities = filters.priorities.filter(x => x !== p);
                        } else {
                          filters.priorities = [...filters.priorities, p];
                        }
                      }}
                      class="rounded"
                    />
                    <span class={`text-xs px-2 py-1 rounded ${priority.color}`}>
                      {priority.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Time Range */}
            <div>
              <h4 class="font-medium mb-3">Zeitraum</h4>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={filters.showOverdue}
                    onChange$={() => filters.showOverdue = !filters.showOverdue}
                    class="rounded"
                  />
                  <span class="text-sm">Überfällige anzeigen</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={filters.showUpcoming}
                    onChange$={() => filters.showUpcoming = !filters.showUpcoming}
                    class="rounded"
                  />
                  <span class="text-sm">Kommende anzeigen</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Month Navigation */}
      <div class="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
        <button
          onClick$={() => navigateMonth(-1)}
          class="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span>←</span>
          Vorheriger
        </button>
        
        <h2 class="text-xl font-semibold text-gray-900">
          {currentDate.value.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
        </h2>
        
        <button
          onClick$={() => navigateMonth(1)}
          class="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Nächster
          <span>→</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Calendar Grid */}
      <div class="lg:col-span-3">
        <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Loading State */}
          {isLoading.value && (
            <div class="p-8 text-center">
              <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p class="text-gray-600">Lade Requirements...</p>
            </div>
          )}

          {/* Days Header */}
          {!isLoading.value && (
            <>
              <div class="grid grid-cols-7 bg-gray-50 border-b">
                {['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'].map(day => (
                  <div key={day} class="p-4 text-center font-medium text-gray-700 border-r last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div class="grid grid-cols-7">
                {getCalendarDays().map((date, index) => {
                  const dayEvents = getEventsForDate(date);
                  const todayClass = isToday(date) ? 'bg-blue-50 border-blue-200' : '';
                  const currentMonthClass = !isCurrentMonth(date) ? 'bg-gray-100 text-gray-400' : '';
                  const todayTextClass = isToday(date) ? 'text-blue-600' : '';
                  const monthTextClass = !isCurrentMonth(date) ? 'text-gray-400' : 'text-gray-900';
                  
                  return (
                    <div 
                      key={index} 
                      class={`min-h-32 p-2 border-r border-b last:border-r-0 cursor-pointer hover:bg-gray-50 transition-colors ${currentMonthClass} ${todayClass}`}
                    >
                      <div class={`text-sm font-medium mb-1 ${todayTextClass} ${monthTextClass}`}>
                        {date.getDate()}
                      </div>
                      
                      {/* Events */}
                      <div class="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            onClick$={() => openEventModal(event)}
                            class={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${getEventColor(event)}`}
                          >
                            <div class="font-medium truncate">{event.title}</div>
                            <div class="truncate text-xs opacity-90">{event.requirementNumber}</div>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div class="text-xs text-gray-500 text-center">
                            +{dayEvents.length - 3} weitere
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div class="space-y-6">
        {/* Upcoming Deadlines */}
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>⚠️</span>
            Kritische Deadlines
          </h3>
          
          <div class="space-y-3">
            {events
              .filter(e => e.type === 'deadline' && e.priority === 'critical')
              .slice(0, 5)
              .map((event) => (
              <div key={event.id} class="p-3 bg-red-50 rounded-lg border border-red-200">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="font-medium text-sm text-gray-900">{event.title}</div>
                    <div class="text-xs text-gray-600 mt-1">
                      {event.requirementNumber} • {event.date}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      {event.assignee}
                    </div>
                  </div>
                  <span class={`text-xs px-2 py-1 rounded ${getRequirementTypeColor(event.requirementType)}`}>
                    {event.requirementType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AWS Releases */}
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>☁️</span>
            AWS Releases
          </h3>
          
          <div class="space-y-3">
            {events
              .filter(e => e.requirementType === 'AWS-Release')
              .slice(0, 4)
              .map((event) => (
              <div key={event.id} class="p-3 bg-orange-50 rounded-lg">
                <div class="font-medium text-sm text-gray-900">{event.title}</div>
                <div class="text-xs text-gray-600 mt-1">
                  {event.requirementNumber} • {event.date}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {event.assignee} • {event.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Statistiken</h3>
          
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span>Gesamt Events:</span>
              <span class="font-medium">{events.length}</span>
            </div>
            <div class="flex justify-between">
              <span>Überfällig:</span>
              <span class="font-medium text-red-600">
                {events.filter(e => new Date(e.date) < new Date() && e.status !== 'Completed').length}
              </span>
            </div>
            <div class="flex justify-between">
              <span>Diese Woche:</span>
              <span class="font-medium text-blue-600">
                {events.filter(e => {
                  const eventDate = new Date(e.date);
                  const today = new Date();
                  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                  return eventDate >= today && eventDate <= weekFromNow;
                }).length}
              </span>
            </div>
            <div class="flex justify-between">
              <span>AWS Releases:</span>
              <span class="font-medium text-orange-600">
                {events.filter(e => e.requirementType === 'AWS-Release').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Event Modal */}
    {showEventModal.value && selectedEvent.value && (
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-96 overflow-auto">
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900">{selectedEvent.value.title}</h3>
                <p class="text-sm text-gray-600 mt-1">{selectedEvent.value.requirementNumber}</p>
              </div>
              <button
                onClick$={closeEventModal}
                class="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div class="space-y-3 text-sm">
              <div class="flex items-center gap-2">
                <span>📅</span>
                <span>{selectedEvent.value.date}</span>
              </div>
              
              <div class="flex items-center gap-2">
                <span>📋</span>
                <span class={`px-2 py-1 rounded text-xs ${getRequirementTypeColor(selectedEvent.value.requirementType)}`}>
                  {selectedEvent.value.requirementType}
                </span>
              </div>

              <div class="flex items-center gap-2">
                <span>🎯</span>
                <span class="capitalize">{selectedEvent.value.type}</span>
              </div>

              <div class="flex items-center gap-2">
                <span>⚡</span>
                <span class="capitalize">{selectedEvent.value.priority} Priorität</span>
              </div>

              {selectedEvent.value.assignee && (
                <div class="flex items-center gap-2">
                  <span>👤</span>
                  <span>{selectedEvent.value.assignee}</span>
                </div>
              )}

              {selectedEvent.value.workflowStep && (
                <div class="flex items-center gap-2">
                  <span>🔄</span>
                  <span>{selectedEvent.value.workflowStep}</span>
                </div>
              )}

              {selectedEvent.value.description && (
                <div class="mt-4">
                  <p class="text-gray-700">{selectedEvent.value.description}</p>
                </div>
              )}
            </div>
            
            <div class="flex gap-2 mt-6">
              <button class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                Requirement öffnen
              </button>
              <button class="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                Termin bearbeiten
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
</div>


);
});

// API Service für echte Daten
export class RequirementsCalendarApiService {
private static readonly API_BASE_URL = 'https://localhost:7001/api';

static async getRequirementsWithDeadlines(filters: CalendarFilters) {
try {
const response = await fetch(`${this.API_BASE_URL}/requirements/calendar`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify(filters)
});


  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
} catch (error) {
  console.error('Error fetching calendar requirements:', error);
  throw error;
}


}

static async updateRequirementDeadline(requirementId: string, newDeadline: string) {
try {
const response = await fetch(`${this.API_BASE_URL}/requirements/${requirementId}/deadline`, {
method: 'PATCH',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ deadline: newDeadline })
});


  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
} catch (error) {
  console.error('Error updating requirement deadline:', error);
  throw error;
}


}
}

