import { component$, useSignal, useTask$ } from '@builder.io/qwik';
import type { DashboardStats } from '../types';
import { MockApiService } from '../services/mock-service';

export default component$(() => {
  const stats = useSignal<DashboardStats | null>(null);
  const loading = useSignal(true);

  useTask$(async () => {
    try {
      const data = await MockApiService.getDashboardStats();
      stats.value = data;
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      loading.value = false;
    }
  });

  return (
    <div class="animate-fade-in">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-primary mb-2">Dashboard</h1>
          <p class="text-secondary">Überblick über alle Anforderungen und Aktivitäten</p>
        </div>
        
        <div class="flex gap-3">
          <button class="btn btn-secondary">
            📊 Berichte
          </button>
          <a href="/requirements/new" class="btn btn-primary">
  + Neue Anforderung
</a>
        </div>
      </div>

      {loading.value ? (
        <div class="stats-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} class="stat-card">
              <div class="animate-pulse">
                <div style="height: 60px; background: #f1f5f9; border-radius: 8px; margin-bottom: 1rem;"></div>
                <div style="height: 20px; background: #f1f5f9; border-radius: 4px; margin-bottom: 0.5rem;"></div>
                <div style="height: 16px; background: #f1f5f9; border-radius: 4px; width: 60%;"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div class="stats-grid">
          <div class="stat-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-secondary mb-1">Offene Anforderungen</p>
                <p class="text-3xl font-bold text-primary">{stats.value?.openRequirements}</p>
                <p class="text-xs text-secondary mt-1">+8% seit letztem Monat</p>
              </div>
              <div class="stat-icon" style="background: linear-gradient(135deg, rgb(0, 158, 227) 0%, rgb(0, 200, 255) 100%);">
                📋
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-secondary mb-1">In Bearbeitung</p>
                <p class="text-3xl font-bold text-warning">{stats.value?.inProgressRequirements}</p>
                <p class="text-xs text-secondary mt-1">-2% seit letztem Monat</p>
              </div>
              <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);">
                ⚡
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-secondary mb-1">Abgeschlossen</p>
                <p class="text-3xl font-bold text-success">{stats.value?.completedRequirements}</p>
                <p class="text-xs text-secondary mt-1">+15% seit letztem Monat</p>
              </div>
              <div class="stat-icon" style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%);">
                ✅
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-secondary mb-1">Überfällig</p>
                <p class="text-3xl font-bold text-error">{stats.value?.overdueRequirements}</p>
                <p class="text-xs text-secondary mt-1">-1 seit letzter Woche</p>
              </div>
              <div class="stat-icon" style="background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);">
                ⚠️
              </div>
            </div>
          </div>
        </div>
      )}

      <div class="grid-2 gap-6 mt-8">
        <div class="card">
          <div class="card-header">
            <h3>Anforderungen nach Typ</h3>
          </div>
          <div class="space-y-4">
            {stats.value && Object.entries(stats.value.requirementsByType).map(([type, count]) => (
              <div key={type} class="flex justify-between items-center">
                <span class="text-sm font-medium">{type}</span>
                <div class="flex items-center gap-3">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      style={`width: ${(count / stats.value!.totalRequirements) * 100}%`}
                    ></div>
                  </div>
                  <span class="text-sm font-bold text-primary w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Letzte Aktivitäten</h3>
          </div>
          <div class="space-y-4">
            <div class="activity-item">
              <div class="activity-avatar">MM</div>
              <div class="flex-1">
                <p class="text-sm font-medium">Max Mustermann</p>
                <p class="text-xs text-secondary">Hat REQ-2025-001 aktualisiert</p>
                <p class="text-xs text-secondary">vor 2 Stunden</p>
              </div>
            </div>
            
            <div class="activity-item">
              <div class="activity-avatar">AS</div>
              <div class="flex-1">
                <p class="text-sm font-medium">Anna Schmidt</p>
                <p class="text-xs text-secondary">Hat einen Kommentar hinzugefügt</p>
                <p class="text-xs text-secondary">vor 4 Stunden</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .progress-bar {
          width: 100px;
          height: 6px;
          background: var(--border-color);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-light) 100%);
          border-radius: 3px;
          transition: width 0.3s ease;
        }
        
        .activity-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 0.5rem;
          transition: background 0.2s ease;
        }
        
        .activity-item:hover {
          background: var(--background-color);
        }
        
        .activity-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .space-y-4 > * + * {
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
});