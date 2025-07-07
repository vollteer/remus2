import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import type { Requirement, RequirementType, RequirementStatus, Priority } from '../../types';
import { MockApiService } from '../../../services/mock-service';

export default component$(() => {
  const requirements = useSignal<Requirement[]>([]);
  const loading = useSignal(true);
  const filters = useSignal({
    type: '' as RequirementType | '',
    status: '' as RequirementStatus | '',
    priority: '' as Priority | '',
    search: ''
  });

  const loadRequirements = $(async () => {
    loading.value = true;
    try {
      const data = await MockApiService.getRequirements({
        type: filters.value.type || undefined,
        status: filters.value.status || undefined,
        priority: filters.value.priority || undefined,
        search: filters.value.search || undefined,
      });
      requirements.value = data;
    } catch (error) {
      console.error('Error loading requirements:', error);
    } finally {
      loading.value = false;
    }
  });

  useTask$(async () => {
    await loadRequirements();
  });

  const getStatusBadge = (status: RequirementStatus) => {
    const badges = {
      'Draft': 'badge-info',
      'Open': 'badge-info',
      'In Progress': 'badge-warning',
      'Review': 'badge-warning',
      'Testing': 'badge-warning',
      'Completed': 'badge-success',
      'Rejected': 'badge-error',
      'On Hold': 'badge-error'
    };
    return badges[status] || 'badge-info';
  };

  const getPriorityBadge = (priority: Priority) => {
    const badges = {
      'low': 'badge-success',
      'medium': 'badge-warning',
      'high': 'badge-error',
      'critical': 'badge-error'
    };
    return badges[priority];
  };

  const getPriorityText = (priority: Priority) => {
    const text = {
      'low': 'Niedrig',
      'medium': 'Mittel',
      'high': 'Hoch',
      'critical': 'Kritisch'
    };
    return text[priority];
  };

  return (
    <div class="animate-fade-in">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-primary mb-2">Anforderungen</h1>
          <p class="text-secondary">Verwalten und verfolgen Sie alle Anforderungen</p>
        </div>
        
        <div class="flex gap-3">
          <button class="btn btn-secondary">
            📤 Export
          </button>
		<a href="/requirements/new" class="btn btn-primary">
		  + Neue Anforderung erstellen
		</a>
        </div>
      </div>

      {/* Filters */}
      <div class="card mb-6">
        <div class="card-header">
          <h3>Filter & Suche</h3>
        </div>
        
        <div class="grid-4 gap-4 mb-4">
          <div class="form-group">
            <label class="form-label">Anforderungsart</label>
            <select 
              class="form-select"
              value={filters.value.type}
              onChange$={(e) => {
                filters.value = { ...filters.value, type: (e.target as HTMLSelectElement).value as RequirementType | '' };
                loadRequirements();
              }}
            >
              <option value="">Alle Arten</option>
              <option value="Kleinanforderung">Kleinanforderung</option>
              <option value="Großanforderung">Großanforderung</option>
              <option value="TIA-Anforderung">TIA-Anforderung</option>
              <option value="Supportleistung">Supportleistung</option>
              <option value="Betriebsauftrag">Betriebsauftrag</option>
              <option value="SBBI-Lösung">SBBI-Lösung</option>
              <option value="AWG-Release">AWG-Release</option>
              <option value="AWS-Release">AWS-Release</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Status</label>
            <select 
              class="form-select"
              value={filters.value.status}
              onChange$={(e) => {
                filters.value = { ...filters.value, status: (e.target as HTMLSelectElement).value as RequirementStatus | '' };
                loadRequirements();
              }}
            >
              <option value="">Alle Status</option>
              <option value="Draft">Entwurf</option>
              <option value="Open">Offen</option>
              <option value="In Progress">In Bearbeitung</option>
              <option value="Review">Review</option>
              <option value="Testing">Test</option>
              <option value="Completed">Abgeschlossen</option>
              <option value="Rejected">Abgelehnt</option>
              <option value="On Hold">Pausiert</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Priorität</label>
            <select 
              class="form-select"
              value={filters.value.priority}
              onChange$={(e) => {
                filters.value = { ...filters.value, priority: (e.target as HTMLSelectElement).value as Priority | '' };
                loadRequirements();
              }}
            >
              <option value="">Alle Prioritäten</option>
              <option value="low">Niedrig</option>
              <option value="medium">Mittel</option>
              <option value="high">Hoch</option>
              <option value="critical">Kritisch</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Suche</label>
            <input 
              type="text" 
              class="form-input" 
              placeholder="ID, Titel, Beschreibung..."
              value={filters.value.search}
              onInput$={(e) => {
                filters.value = { ...filters.value, search: (e.target as HTMLInputElement).value };
              }}
              onKeyDown$={(e) => {
                if (e.key === 'Enter') {
                  loadRequirements();
                }
              }}
            />
          </div>
        </div>
        
        <div class="flex gap-3">
          <button class="btn btn-primary" onClick$={loadRequirements}>
            🔍 Filter anwenden
          </button>
          <button 
            class="btn btn-secondary"
            onClick$={() => {
              filters.value = { type: '', status: '', priority: '', search: '' };
              loadRequirements();
            }}
          >
            ↻ Zurücksetzen
          </button>
        </div>
      </div>

      {/* Requirements Table */}
      <div class="table-container">
        {loading.value ? (
          <div class="p-8 text-center">
            <div class="animate-pulse">
              <div style="height: 20px; background: #f1f5f9; border-radius: 4px; margin-bottom: 1rem;"></div>
              <div style="height: 20px; background: #f1f5f9; border-radius: 4px; margin-bottom: 1rem;"></div>
              <div style="height: 20px; background: #f1f5f9; border-radius: 4px;"></div>
            </div>
          </div>
        ) : (
          <>
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Titel</th>
                  <th>Typ</th>
                  <th>Status</th>
                  <th>Priorität</th>
                  <th>Zugewiesen</th>
                  <th>Fällig</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {requirements.value.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <span class="font-mono text-sm font-medium text-primary">{req.id}</span>
                    </td>
                    <td>
                      <div>
                        <p class="font-semibold">{req.title}</p>
                        {req.description && (
                          <p class="text-xs text-secondary mt-1 truncate" style="max-width: 200px;">
                            {req.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td>
                      <span class="text-sm">{req.type}</span>
                    </td>
                    <td>
                      <span class={`badge ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      <span class={`badge ${getPriorityBadge(req.priority)}`}>
                        {getPriorityText(req.priority)}
                      </span>
                    </td>
                    <td>
                      {req.assignedTo ? (
                        <div class="flex items-center gap-2">
                          <div class="activity-avatar text-xs">
                            {req.assignedTo.avatar}
                          </div>
                          <span class="text-sm">{req.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span class="text-secondary text-sm">Nicht zugewiesen</span>
                      )}
                    </td>
                    <td>
                      {req.dueDate ? (
                        <span class="text-sm">
                          {new Date(req.dueDate).toLocaleDateString('de-DE')}
                        </span>
                      ) : (
                        <span class="text-secondary text-sm">Kein Datum</span>
                      )}
                    </td>
                    <td>
                      <div class="flex gap-2">
                        <button class="btn btn-sm btn-secondary">
                          👁️ Anzeigen
                        </button>
                        <button class="btn btn-sm btn-secondary">
                          ✏️ Bearbeiten
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {requirements.value.length === 0 && (
              <div class="text-center py-12">
                <div class="text-4xl mb-4">📋</div>
                <h3 class="text-lg font-semibold mb-2">Keine Anforderungen gefunden</h3>
                <p class="text-secondary mb-4">
                  {filters.value.search || filters.value.type || filters.value.status 
                    ? 'Versuchen Sie andere Suchkriterien oder erstellen Sie eine neue Anforderung.'
                    : 'Erstellen Sie Ihre erste Anforderung.'
                  }
                </p>
                <button class="btn btn-primary">
                  + Neue Anforderung erstellen
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {requirements.value.length > 0 && (
        <div class="flex justify-between items-center mt-6 px-4">
          <p class="text-sm text-secondary">
            Zeige {requirements.value.length} von {requirements.value.length} Anforderungen
          </p>
          <div class="flex gap-2">
            <button class="btn btn-sm btn-secondary">← Vorherige</button>
            <button class="btn btn-sm btn-secondary">Nächste →</button>
          </div>
        </div>
      )}
    </div>
  );
});