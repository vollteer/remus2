import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import type { Requirement, Person } from '../../types';
import { MockApiService } from '../../services/mock-service';

export default component$(() => {
  const searchQuery = useSignal('');
  const searchResults = useSignal<{
    requirements: Requirement[];
    persons: Person[];
  }>({ requirements: [], persons: [] });
  const loading = useSignal(false);
  const hasSearched = useSignal(false);
  const searchTemplates = useSignal([
    { name: 'Meine offenen Anforderungen', query: 'status:open assignee:me', icon: '👤' },
    { name: 'Überfällige Tickets', query: 'overdue:true', icon: '⚠️' },
    { name: 'Großanforderungen', query: 'type:großanforderung', icon: '🏗️' },
    { name: 'Letzte 30 Tage', query: 'created:30d', icon: '📅' },
    { name: 'Kritische Priorität', query: 'priority:critical', icon: '🚨' },
    { name: 'In Review Status', query: 'status:review', icon: '👀' },
  ]);

  const performSearch = $(async (query: string) => {
    if (!query.trim()) {
      searchResults.value = { requirements: [], persons: [] };
      hasSearched.value = false;
      return;
    }

    loading.value = true;
    hasSearched.value = true;

    try {
      // Use enhanced global search
      const results = await MockApiService.globalSearch(query);
      
      searchResults.value = {
        requirements: results.requirements,
        persons: results.persons
      };
    } catch (error) {
      console.error('Search error:', error);
      searchResults.value = { requirements: [], persons: [] };
    } finally {
      loading.value = false;
    }
  });
  const handleSearchInput = $((value: string) => {
    searchQuery.value = value;
    if (value.length >= 2) {
      performSearch(value);
    } else if (value.length === 0) {
      searchResults.value = { requirements: [], persons: [] };
      hasSearched.value = false;
    }
  });

  const useTemplate = $((template: { query: string }) => {
    searchQuery.value = template.query;
    performSearch(template.query);
  });

  const getStatusBadge = (status: string) => {
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
    return badges[status as keyof typeof badges] || 'badge-info';
  };

  return (
    <div class="animate-fade-in">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-primary mb-2">Suche</h1>
          <p class="text-secondary">Durchsuchen Sie alle Anforderungen, Personen und Inhalte</p>
        </div>
        
        <div class="flex gap-3">
          <button class="btn btn-secondary">
            💾 Suche speichern
          </button>
          <button class="btn btn-secondary">
            📊 Erweiterte Suche
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div class="card mb-6">
        <div class="search-container">
          <div class="search-input-container">
            <input
              type="text"
              class="search-input-large"
              placeholder="Suchen Sie nach Anforderungen, Personen, IDs, Inhalten..."
              value={searchQuery.value}
              onInput$={(e) => handleSearchInput((e.target as HTMLInputElement).value)}
              onKeyDown$={(e) => {
                if (e.key === 'Enter') {
                  performSearch(searchQuery.value);
                }
              }}
            />
            <button 
              class="search-button"
              onClick$={() => performSearch(searchQuery.value)}
            >
              {loading.value ? '⏳' : '🔍'}
            </button>
          </div>
          
          <div class="search-suggestions">
            <p class="text-xs text-secondary mb-2">Suchoperatoren: type:, status:, priority:, assignee:, created:</p>
          </div>
        </div>
      </div>

      <div class="grid-4 gap-6">
        {/* Search Templates */}
        <div class="search-sidebar">
          <div class="card">
            <div class="card-header">
              <h3>Suchvorlagen</h3>
            </div>
            
            <div class="search-templates">
              {searchTemplates.value.map((template, index) => (
                <button 
                  key={index}
                  class="template-button"
                  onClick$={() => useTemplate(template)}
                >
                  <span class="template-icon">{template.icon}</span>
                  <div class="template-content">
                    <div class="template-name">{template.name}</div>
                    <div class="template-query">{template.query}</div>
                  </div>
                </button>
              ))}
            </div>
            
            <button class="btn btn-primary w-full mt-4 text-sm">
              + Neue Vorlage erstellen
            </button>
          </div>

          {/* Quick Stats */}
          <div class="card mt-4">
            <div class="card-header">
              <h4>Quick Stats</h4>
            </div>
            <div class="stats-mini">
              <div class="stat-mini">
                <span class="stat-mini-value">127</span>
                <span class="stat-mini-label">Gesamt</span>
              </div>
              <div class="stat-mini">
                <span class="stat-mini-value">23</span>
                <span class="stat-mini-label">Offen</span>
              </div>
              <div class="stat-mini">
                <span class="stat-mini-value">12</span>
                <span class="stat-mini-label">Bearbeitung</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div class="search-results">
          {loading.value && (
            <div class="card">
              <div class="search-loading">
                <div class="loading-spinner"></div>
                <p>Suche läuft...</p>
              </div>
            </div>
          )}

          {!loading.value && hasSearched.value && (
            <>
              {/* Requirements Results */}
              {searchResults.value.requirements.length > 0 && (
                <div class="card mb-6">
                  <div class="card-header">
                    <h3>Anforderungen ({searchResults.value.requirements.length})</h3>
                  </div>
                  
                  <div class="results-list">
                    {searchResults.value.requirements.map((req) => (
                      <div key={req.id} class="result-item">
                        <div class="result-header">
                          <div class="flex items-center gap-3">
                            <span class="result-icon">📋</span>
                            <div>
                              <h4 class="result-title">{req.title}</h4>
                              <p class="result-meta">{req.id} • {req.type}</p>
                            </div>
                          </div>
                          <div class="flex items-center gap-2">
                            <span class={`badge ${getStatusBadge(req.status)}`}>
                              {req.status}
                            </span>
                          </div>
                        </div>
                        
                        {req.description && (
                          <p class="result-description">{req.description}</p>
                        )}
                        
                        <div class="result-footer">
                          <div class="result-tags">
                            <span class="result-tag">{req.priority} Priorität</span>
                            <span class="result-tag">{req.realizationObject}</span>
                            {req.assignedTo && (
                              <span class="result-tag">👤 {req.assignedTo.name}</span>
                            )}
                          </div>
                          <div class="result-actions">
                            <button class="btn btn-sm btn-secondary">Anzeigen</button>
                            <button class="btn btn-sm btn-secondary">Bearbeiten</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Persons Results */}
              {searchResults.value.persons.length > 0 && (
                <div class="card mb-6">
                  <div class="card-header">
                    <h3>Personen ({searchResults.value.persons.length})</h3>
                  </div>
                  
                  <div class="results-list">
                    {searchResults.value.persons.map((person) => (
                      <div key={person.id} class="result-item">
                        <div class="result-header">
                          <div class="flex items-center gap-3">
                            <div class="person-avatar">
                              {person.avatar}
                            </div>
                            <div>
                              <h4 class="result-title">{person.name}</h4>
                              <p class="result-meta">{person.email}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div class="result-footer">
                          <div class="result-tags">
                            {person.department && (
                              <span class="result-tag">🏢 {person.department}</span>
                            )}
                            {person.role && (
                              <span class="result-tag">💼 {person.role}</span>
                            )}
                          </div>
                          <div class="result-actions">
                            <button class="btn btn-sm btn-secondary">Profil</button>
                            <button class="btn btn-sm btn-secondary">Kontakt</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {searchResults.value.requirements.length === 0 && 
               searchResults.value.persons.length === 0 && (
                <div class="card">
                  <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <h3>Keine Ergebnisse gefunden</h3>
                    <p>Versuchen Sie andere Suchbegriffe oder verwenden Sie eine Suchvorlage.</p>
                    <div class="flex gap-2 mt-4">
                      <button class="btn btn-secondary">Erweiterte Suche</button>
                      <button class="btn btn-primary">Neue Anforderung erstellen</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {!hasSearched.value && (
            <div class="card">
              <div class="search-welcome">
                <div class="search-welcome-icon">🔍</div>
                <h3>Willkommen bei der Suche</h3>
                <p>Geben Sie einen Suchbegriff ein oder wählen Sie eine Vorlage aus der Sidebar.</p>
                <div class="search-tips">
                  <h4>Suchtipps:</h4>
                  <ul>
                    <li><code>type:großanforderung</code> - Nach Typ filtern</li>
                    <li><code>status:open</code> - Nach Status filtern</li>
                    <li><code>priority:high</code> - Nach Priorität filtern</li>
                    <li><code>assignee:max</code> - Nach zugewiesener Person</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .search-container {
          position: relative;
        }
        
        .search-input-container {
          position: relative;
          display: flex;
          align-items: center;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .search-input-large {
          width: 100%;
          padding: 1rem 4rem 1rem 1.5rem;
          border: 2px solid var(--border-color);
          border-radius: 1rem;
          font-size: 1rem;
          background: white;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .search-input-large:focus {
          outline: none;
          border-color: var(--primary-light);
          box-shadow: 0 0 0 3px rgba(0, 158, 227, 0.1), 0 4px 8px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }
        
        .search-button {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          width: 3rem;
          height: 3rem;
          border: none;
          border-radius: 0.75rem;
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
          color: white;
          font-size: 1.25rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .search-button:hover {
          transform: translateY(-50%) scale(1.05);
          box-shadow: 0 4px 8px rgba(0, 158, 227, 0.3);
        }
        
        .search-suggestions {
          text-align: center;
          margin-top: 1rem;
        }
        
        .search-sidebar {
          grid-column: span 1;
        }
        
        .search-results {
          grid-column: span 3;
        }
        
        .search-templates {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .template-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem;
          border: none;
          border-radius: 0.5rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          width: 100%;
          border: 1px solid var(--border-color);
        }
        
        .template-button:hover {
          background: var(--background-color);
          border-color: var(--primary-light);
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .template-icon {
          font-size: 1.25rem;
          width: 2rem;
          text-align: center;
        }
        
        .template-content {
          flex: 1;
        }
        
        .template-name {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-primary);
        }
        
        .template-query {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-family: monospace;
          margin-top: 0.25rem;
        }
        
        .stats-mini {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
        }
        
        .stat-mini {
          text-align: center;
          flex: 1;
        }
        
        .stat-mini-value {
          display: block;
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--primary-color);
        }
        
        .stat-mini-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        
        .search-loading {
          text-align: center;
          padding: 3rem;
        }
        
        .loading-spinner {
          width: 2rem;
          height: 2rem;
          border: 2px solid var(--border-color);
          border-top: 2px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .results-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .result-item {
          padding: 1rem;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          background: white;
          transition: all 0.2s ease;
        }
        
        .result-item:hover {
          border-color: var(--primary-light);
          box-shadow: 0 2px 8px rgba(0, 158, 227, 0.1);
          transform: translateY(-1px);
        }
        
        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }
        
        .result-icon {
          font-size: 1.25rem;
          width: 2rem;
          text-align: center;
        }
        
        .result-title {
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
          font-size: 1rem;
        }
        
        .result-meta {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin: 0.25rem 0 0 0;
        }
        
        .result-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }
        
        .result-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .result-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .result-tag {
          background: var(--background-color);
          color: var(--text-secondary);
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          border: 1px solid var(--border-color);
        }
        
        .result-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .person-avatar {
          width: 2rem;
          height: 2rem;
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .no-results, .search-welcome {
          text-align: center;
          padding: 3rem;
        }
        
        .no-results-icon, .search-welcome-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .no-results h3, .search-welcome h3 {
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }
        
        .no-results p, .search-welcome p {
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }
        
        .search-tips {
          background: var(--background-color);
          border-radius: 0.5rem;
          padding: 1rem;
          margin-top: 1.5rem;
          text-align: left;
        }
        
        .search-tips h4 {
          margin-bottom: 0.5rem;
          color: var(--text-primary);
          font-size: 0.875rem;
        }
        
        .search-tips ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .search-tips li {
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        
        .search-tips code {
          background: white;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: monospace;
          border: 1px solid var(--border-color);
          color: var(--primary-color);
        }
        
        @media (max-width: 768px) {
          .search-sidebar {
            grid-column: span 4;
          }
          
          .search-results {
            grid-column: span 4;
          }
          
          .result-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
});