// src/routes/calendar/index.tsx
import { component$, useSignal, $ } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  const currentDate = useSignal(new Date(2025, 6, 7)); // July 2025
  const expandedEvent = useSignal<number | null>(null);
  const showCreateModal = useSignal<string | null>(null);
  const selectedDay = useSignal<number | null>(null);

  // Mock Events Data
  const events = [
    {
      id: 1,
      title: "Review Meeting Kleinanforderung",
      date: "2025-07-08",
      time: "10:00",
      duration: "1h",
      type: "kleinanforderung",
      participants: ["Max Mustermann", "Anna Schmidt"],
      requirement: "REQ-2025-001"
    },
    {
      id: 2,
      title: "TIA-Anforderung Projekt Alpha",
      date: "2025-07-09",
      time: "14:00",
      duration: "2h",
      type: "tia-anforderung",
      participants: ["Tom Weber", "Lisa Fischer"],
      requirement: "REQ-2025-003"
    },
    {
      id: 3,
      title: "Großanforderung Kundenportal",
      date: "2025-07-10",
      time: "09:00",
      duration: "3h",
      type: "grossanforderung",
      participants: ["Max Mustermann", "Kunde ABC"],
      requirement: "REQ-2025-002"
    },
    {
      id: 4,
      title: "Supportleistung Server-Wartung",
      date: "2025-07-11",
      time: "11:00",
      duration: "2h",
      type: "supportleistung",
      participants: ["Dev Team", "Anna Schmidt"],
      requirement: "REQ-2025-004"
    },
    {
      id: 5,
      title: "Sperrtermin - Systemwartung",
      date: "2025-07-16",
      time: "10:30",
      duration: "4h",
      type: "sperrtermin",
      participants: ["IT-Team"],
      requirement: "-"
    }
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "kleinanforderung": return "bg-blue-500";
      case "grossanforderung": return "bg-green-500";
      case "tia-anforderung": return "bg-purple-500";
      case "supportleistung": return "bg-orange-500";
      case "sperrtermin": return "bg-gray-600";
      case "infotermin": return "bg-cyan-500";
      default: return "bg-gray-500";
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "kleinanforderung": return "📋";
      case "grossanforderung": return "📊";
      case "tia-anforderung": return "🎯";
      case "supportleistung": return "🛠️";
      case "sperrtermin": return "🚫";
      case "infotermin": return "📝";
      default: return "📅";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE');
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.value.getFullYear()}-${String(currentDate.value.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    return events
      .filter(event => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];

  const previousMonth = $(() => {
    const newDate = new Date(currentDate.value);
    newDate.setMonth(newDate.getMonth() - 1);
    currentDate.value = newDate;
  });

  const nextMonth = $(() => {
    const newDate = new Date(currentDate.value);
    newDate.setMonth(newDate.getMonth() + 1);
    currentDate.value = newDate;
  });

  const goToToday = $(() => {
    currentDate.value = new Date();
  });

  const openDayMenu = $((day: number) => {
    selectedDay.value = day;
  });

  const closeAllModals = $(() => {
    selectedDay.value = null;
    showCreateModal.value = null;
  });

  return (
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 py-6">
        
        {/* Header */}
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Kalender</h1>
          <p class="text-gray-600">Übersicht über alle Termine und Meetings</p>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* Main Calendar */}
          <div class="xl:col-span-3">
            <div class="bg-white rounded-lg border border-gray-200">
              
              {/* Calendar Header */}
              <div class="p-6 border-b border-gray-200">
                <div class="flex justify-between items-center">
                  <h2 class="text-xl font-semibold">
                    {monthNames[currentDate.value.getMonth()]} {currentDate.value.getFullYear()}
                  </h2>
                  <div class="flex gap-2">
                    <button onClick$={previousMonth} class="btn btn-secondary text-sm">
                      ← Vorheriger
                    </button>
                    <button onClick$={goToToday} class="btn btn-secondary text-sm">
                      Heute
                    </button>
                    <button onClick$={nextMonth} class="btn btn-secondary text-sm">
                      Nächster →
                    </button>
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div class="p-6">
                {/* Weekday Headers */}
                <div class="grid grid-cols-7 gap-1 mb-2">
                  {['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'].map(day => (
                    <div key={day} class="p-2 text-center font-medium text-gray-600 text-sm">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div class="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: getFirstDayOfMonth(currentDate.value) }).map((_, i) => (
                    <div key={`empty-${i}`} class="h-32 bg-gray-50"></div>
                  ))}
                  
                  {/* Days of the month */}
                  {Array.from({ length: getDaysInMonth(currentDate.value) }).map((_, i) => {
                    const day = i + 1;
                    const dayEvents = getEventsForDate(day);
                    const isToday = 
                      currentDate.value.getMonth() === new Date().getMonth() &&
                      currentDate.value.getFullYear() === new Date().getFullYear() &&
                      day === new Date().getDate();

                    return (
                      <div 
                        key={day}
                        class={`h-32 border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 relative ${
                          isToday ? 'bg-blue-50 border-blue-300' : ''
                        }`}
                        onClick$={(event) => {
                          event.stopPropagation();
                          openDayMenu(day);
                        }}
                      >
                        <div class={`font-medium text-sm mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                          {day}
                        </div>
                        <div class="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div 
                              key={event.id}
                              class={`text-xs p-1 rounded text-white truncate ${getEventTypeColor(event.type)}`}
                              title={`${event.time} - ${event.title}`}
                            >
                              {event.time} {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div class="text-xs text-gray-500">
                              +{dayEvents.length - 2} weitere
                            </div>
                          )}
                        </div>

                        {/* Day Menu */}
                        {selectedDay.value === day && (
                          <div 
                            class="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-3 min-w-48"
                            onClick$={(event) => event.stopPropagation()}
                          >
                            <div class="text-sm font-medium mb-2 text-gray-700">
                              {day}. {monthNames[currentDate.value.getMonth()]}
                            </div>
                            <div class="space-y-1">
                              <button 
                                onClick$={(event) => {
                                  event.stopPropagation();
                                  showCreateModal.value = 'infotermin';
                                  selectedDay.value = null;
                                }}
                                class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                              >
                                📝 Infotermin erstellen
                              </button>
                              <button 
                                onClick$={(event) => {
                                  event.stopPropagation();
                                  showCreateModal.value = 'sperrtermin';
                                  selectedDay.value = null;
                                }}
                                class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                              >
                                🚫 Sperrtermin erstellen
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div class="space-y-6">
            
            {/* Upcoming Events */}
            <div class="bg-white rounded-lg border border-gray-200">
              <div class="p-6">
                <h3 class="text-lg font-semibold mb-4">Anstehende Termine</h3>
                <div class="space-y-4">
                  {getUpcomingEvents().map((event) => (
                    <div key={event.id} class="bg-gray-50 rounded-lg border border-gray-200">
                      <div 
                        class="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick$={() => {
                          expandedEvent.value = expandedEvent.value === event.id ? null : event.id;
                        }}
                      >
                        <div class="flex items-center justify-between">
                          <div class="flex items-start gap-3 flex-1">
                            <span class="text-xl">{getEventTypeIcon(event.type)}</span>
                            <div class="flex-1 min-w-0">
                              <div class="font-medium text-sm mb-1">{event.title}</div>
                              <div class="flex items-center gap-2 text-xs text-gray-600">
                                <span>📅</span>
                                <span>{formatDate(event.date)} um {event.time}</span>
                                <span class="text-gray-400">•</span>
                                <span>{event.duration}</span>
                              </div>
                            </div>
                          </div>
                          <div class="text-gray-400 text-sm">
                            {expandedEvent.value === event.id ? '−' : '+'}
                          </div>
                        </div>
                      </div>
                      
                      {expandedEvent.value === event.id && (
                        <div class="px-4 pb-4 border-t border-gray-200 bg-white">
                          <div class="pt-3 space-y-2">
                            <div class="flex items-center gap-2 text-xs text-gray-600">
                              <span>👥</span>
                              <span><strong>Teilnehmer:</strong> {event.participants.join(', ')}</span>
                            </div>
                            <div class="flex items-center gap-2 text-xs text-gray-600">
                              <span>🔗</span>
                              <span><strong>Anforderung:</strong> {event.requirement}</span>
                            </div>
                            <div class="flex items-center gap-2 text-xs text-gray-600">
                              <span class={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`}></span>
                              <span><strong>Typ:</strong> {event.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div class="bg-white rounded-lg border border-gray-200">
              <div class="p-6">
                <h3 class="text-lg font-semibold mb-4">Schnellaktionen</h3>
                <div class="space-y-2">
                  <button 
                    onClick$={() => showCreateModal.value = 'infotermin'}
                    class="btn btn-primary w-full text-sm"
                  >
                    📝 Infotermin erstellen
                  </button>
                  <button 
                    onClick$={() => showCreateModal.value = 'sperrtermin'}
                    class="btn btn-secondary w-full text-sm"
                  >
                    🚫 Sperrtermin erstellen
                  </button>
                </div>
              </div>
            </div>

            {/* Event Types Legend */}
            <div class="bg-white rounded-lg border border-gray-200">
              <div class="p-6">
                <h3 class="text-lg font-semibold mb-4">Termintypen</h3>
                <div class="space-y-2">
                  {[
                    { type: 'kleinanforderung', name: 'Kleinanforderung' },
                    { type: 'grossanforderung', name: 'Großanforderung' },
                    { type: 'tia-anforderung', name: 'TIA-Anforderung' },
                    { type: 'supportleistung', name: 'Supportleistung' },
                    { type: 'sperrtermin', name: 'Sperrtermin' },
                    { type: 'infotermin', name: 'Infotermin' }
                  ].map((item) => (
                    <div key={item.type} class="flex items-center gap-2 text-sm">
                      <div class={`w-3 h-3 rounded-full ${getEventTypeColor(item.type)}`}></div>
                      <span>{getEventTypeIcon(item.type)}</span>
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Event Modal */}
        {showCreateModal.value && (
          <div 
            class="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick$={() => closeAllModals()}
          >
            <div 
              class="bg-white rounded-lg max-w-md w-full shadow-xl border border-gray-200"
              onClick$={(event) => event.stopPropagation()}
            >
              <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg font-semibold">
                    {showCreateModal.value === 'infotermin' ? '📝 Infotermin erstellen' : '🚫 Sperrtermin erstellen'}
                  </h3>
                  <button 
                    onClick$={(event) => {
                      event.stopPropagation();
                      closeAllModals();
                    }}
                    class="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <form class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Titel *
                    </label>
                    <input
                      type="text"
                      class="w-full p-3 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={showCreateModal.value === 'infotermin' ? 'z.B. Quartalsplanung' : 'z.B. Systemwartung'}
                      required
                    />
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Datum *
                      </label>
                      <input
                        type="date"
                        class="w-full p-3 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Uhrzeit *
                      </label>
                      <input
                        type="time"
                        class="w-full p-3 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Dauer
                    </label>
                    <select class="w-full p-3 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="30min">30 Minuten</option>
                      <option value="1h">1 Stunde</option>
                      <option value="1.5h">1,5 Stunden</option>
                      <option value="2h">2 Stunden</option>
                      <option value="3h">3 Stunden</option>
                      <option value="4h">4 Stunden</option>
                      <option value="ganztag">Ganztägig</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Beschreibung
                    </label>
                    <textarea
                      rows={3}
                      class="w-full p-3 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Optionale Beschreibung des Termins"
                    ></textarea>
                  </div>
                </form>

                <div class="flex justify-end gap-3 mt-6">
                  <button 
                    onClick$={(event) => {
                      event.stopPropagation();
                      closeAllModals();
                    }}
                    class="btn btn-secondary"
                  >
                    Abbrechen
                  </button>
                  <button 
                    onClick$={(event) => {
                      event.stopPropagation();
                      closeAllModals();
                    }}
                    class="btn btn-primary"
                  >
                    Termin erstellen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Overlay to close day menu when clicking outside */}
        {selectedDay.value !== null && (
          <div 
            class="fixed inset-0 z-30"
            onClick$={() => selectedDay.value = null}
          ></div>
        )}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Kalender - Requirements Management",
  meta: [
    {
      name: "description",
      content: "Kalenderübersicht für alle Termine und Meetings im Requirements Management System",
    },
  ],
};
