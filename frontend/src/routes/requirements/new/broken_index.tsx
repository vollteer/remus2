import { component$, useSignal, $, useTask$ } from '@builder.io/qwik';
import { requirementsApi } from '~/services/api/requirements-api';
import type { CreateRequirementRequest } from '~/services/api/requirements-api';

type RequirementType = 'Kleinanforderung' | 'Großanforderung' | 'TIA-Anforderung' | 'Supportleistung' | 'Betriebsauftrag' | 'SBBI-Lösung' | 'AWG-Release' | 'AWS-Release';
type RealizationObject = 'Anwendungssystem' | 'Komponente' | 'Prozess' | 'Hardware' | 'Infrastruktur';
type Priority = 'low' | 'medium' | 'high' | 'critical';

interface RequirementFormData {
  title: string;
  type: RequirementType | '';
  realizationObject: RealizationObject | '';
  priority: Priority;
  initialSituation: string;
  goals: string;
  budget?: number;
  functionalContact?: {
    id: string;
    name: string;
    department: string;
  } | null;
  systemResponsible?: {
    id: string;
    name: string;
    department: string;
  } | null;
  dueDate?: string;
}

export default component$(() => {
  // State
  const formData = useSignal<RequirementFormData>({
    title: '',
    type: '',
    realizationObject: '',
    priority: 'medium',
    initialSituation: '',
    goals: '',
    budget: undefined,
    functionalContact: null,
    systemResponsible: null,
    dueDate: undefined
  });

  const isSubmitting = useSignal(false);
  const currentStep = useSignal(1);
  const totalSteps = 4;
  const workflowPreview = useSignal<any[]>([]);

  // 🔥 ECHTE API INTEGRATION - submitForm ersetzt Mock-Daten
  const submitForm = $(async () => {
    isSubmitting.value = true;
    
    try {
      // Prepare request data (mapping zu deinem Backend DTO)
      const requestData: CreateRequirementRequest = {
        title: formData.value.title,
        type: formData.value.type as string,
        realizationObject: formData.value.realizationObject as string,
        priority: formData.value.priority,
        initialSituation: formData.value.initialSituation,
        goals: formData.value.goals,
        budget: formData.value.budget,
        functionalContact: formData.value.functionalContact,
        systemResponsible: formData.value.systemResponsible,
        dueDate: formData.value.dueDate,
        formData: {
          ...formData.value,
          timestamp: new Date().toISOString(),
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
        }
      };

      console.log('📤 Creating requirement:', requestData);

      // 🚀 ECHTER API-CALL STATT MOCK!
      const result = await requirementsApi.createRequirement(requestData);
      
      if (result.success && result.data) {
        console.log('✅ Requirement created successfully:', result.data);
        
        // Show success message (SSR-safe)
        if (typeof window !== 'undefined') {
          // Option 1: Use alert (simple)
          alert(`🎉 ${result.message}\n\nAnforderungs-Nr.: ${result.data.requirementNumber}`);
          
          // Option 2: Or redirect to the new requirement
          window.location.href = `/requirements/${result.data.id}`;
        }
        
      } else {
        // Handle API error
        console.error('❌ Failed to create requirement:', result);
        const errorMessage = result.message || 'Unbekannter Fehler beim Erstellen der Anforderung';
        
        if (typeof window !== 'undefined') {
          alert(`❌ Fehler: ${errorMessage}\n\nDetails: ${result.errors?.join(', ') || 'Keine Details verfügbar'}`);
        }
      }
      
    } catch (error) {
      console.error('💥 Unexpected error creating requirement:', error);
      
      if (typeof window !== 'undefined') {
        alert(`💥 Unerwarteter Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      }
    } finally {
      isSubmitting.value = false;
    }
  });

  // Mock workflow preview (bleibt erstmal, bis Workflow-API ready)
  useTask$(({ track }) => {
    track(() => formData.value.type);
    
    if (formData.value.type) {
      const workflows: Record<string, any[]> = {
        'Kleinanforderung': [
          { id: '1', name: 'Antrag erstellen', responsible: 'AG', order: 1, status: 'current', assignee: undefined },
          { id: '2', name: 'Fachliche Prüfung', responsible: 'AN', order: 2, status: 'pending', assignee: undefined },
          { id: '3', name: 'Umsetzung', responsible: 'AN', order: 3, status: 'pending', assignee: undefined },
          { id: '4', name: 'Abnahme', responsible: 'AG', order: 4, status: 'pending', assignee: undefined }
        ],
        'Großanforderung': [
          { id: '1', name: 'Antrag erstellen', responsible: 'AG', order: 1, status: 'current', assignee: undefined },
          { id: '2', name: 'Grobanalyse', responsible: 'AN', order: 2, status: 'pending', assignee: undefined },
          { id: '3', name: 'Feinkonzept', responsible: 'AN', order: 3, status: 'pending', assignee: undefined },
          { id: '4', name: 'Freigabe', responsible: 'AG', order: 4, status: 'pending', assignee: undefined },
          { id: '5', name: 'Implementierung', responsible: 'AN', order: 5, status: 'pending', assignee: undefined },
          { id: '6', name: 'Test', responsible: 'AN', order: 6, status: 'pending', assignee: undefined },
          { id: '7', name: 'Abnahme', responsible: 'AG', order: 7, status: 'pending', assignee: undefined }
        ]
      };
      
      workflowPreview.value = workflows[formData.value.type] || [];
    } else {
      workflowPreview.value = [];
    }
  });

  const nextStep = $(() => {
    if (currentStep.value < totalSteps) {
      currentStep.value++;
    }
  });

  const prevStep = $(() => {
    if (currentStep.value > 1) {
      currentStep.value--;
    }
  });

  return (
    <div class="container max-w-7xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Neue Anforderung erstellen</h1>
        <p class="text-gray-600">Erstellen Sie eine neue Anforderung mit allen erforderlichen Informationen</p>
      </div>

      {/* Progress Steps */}
      <div class="mb-8">
        <div class="flex items-center justify-between">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} class="flex items-center">
              <div class={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep.value > i + 1 ? 'bg-green-500 text-white' :
                currentStep.value === i + 1 ? 'bg-blue-500 text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                {currentStep.value > i + 1 ? '✓' : i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div class={`flex-1 h-1 mx-4 ${
                  currentStep.value > i + 1 ? 'bg-green-500' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
        <div class="flex justify-between mt-2 text-sm text-gray-600">
          <span>Grunddaten</span>
          <span>Details</span>
          <span>Personen</span>
          <span>Zusammenfassung</span>
        </div>
      </div>

      <form preventdefault:submit onSubmit$={submitForm}>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form */}
          <div class="lg:col-span-2">
            
            {/* Step 1: Grunddaten */}
            {currentStep.value === 1 && (
              <div class="card">
                <h3 class="text-xl font-semibold mb-6">Grunddaten</h3>
                
                <div class="space-y-6">
                  <div class="form-group">
                    <label class="form-label">Titel der Anforderung *</label>
                    <input 
                      type="text" 
                      class="form-input"
                      placeholder="z.B. Neue Benutzeroberfläche für Kundenportal"
                      value={formData.value.title}
                      onInput$={(e) => {
                        formData.value = { ...formData.value, title: (e.target as HTMLInputElement).value };
                      }}
                      required
                    />
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="form-group">
                      <label class="form-label">Anforderungsart *</label>
                      <select 
                        class="form-select"
                        value={formData.value.type}
                        onChange$={(e) => {
                          formData.value = { ...formData.value, type: (e.target as HTMLSelectElement).value as RequirementType | '' };
                        }}
                        required
                      >
                        <option value="">Bitte wählen...</option>
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
                      <label class="form-label">Realisierungsobjekt *</label>
                      <select 
                        class="form-select"
                        value={formData.value.realizationObject}
                        onChange$={(e) => {
                          formData.value = { ...formData.value, realizationObject: (e.target as HTMLSelectElement).value as RealizationObject | '' };
                        }}
                        required
                      >
                        <option value="">Bitte wählen...</option>
                        <option value="Anwendungssystem">Anwendungssystem</option>
                        <option value="Komponente">Komponente</option>
                        <option value="Prozess">Prozess</option>
                        <option value="Hardware">Hardware</option>
                        <option value="Infrastruktur">Infrastruktur</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Priorität</label>
                    <div class="grid grid-cols-4 gap-3">
                      {(['low', 'medium', 'high', 'critical'] as Priority[]).map(priority => (
                        <button
                          key={priority}
                          type="button"
                          class={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.value.priority === priority
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                          onClick$={() => {
                            formData.value = { ...formData.value, priority };
                          }}
                        >
                          {priority === 'low' && '🟢 Niedrig'}
                          {priority === 'medium' && '🟡 Mittel'}
                          {priority === 'high' && '🟠 Hoch'}
                          {priority === 'critical' && '🔴 Kritisch'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep.value === 2 && (
              <div class="card">
                <h3 class="text-xl font-semibold mb-6">Details</h3>
                
                <div class="space-y-6">
                  <div class="form-group">
                    <label class="form-label">Ausgangssituation *</label>
                    <textarea 
                      class="form-textarea h-32"
                      placeholder="Beschreiben Sie die aktuelle Situation und den Handlungsbedarf..."
                      value={formData.value.initialSituation}
                      onInput$={(e) => {
                        formData.value = { ...formData.value, initialSituation: (e.target as HTMLTextAreaElement).value };
                      }}
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Ziele & Anforderungen *</label>
                    <textarea 
                      class="form-textarea h-32"
                      placeholder="Was soll mit dieser Anforderung erreicht werden?"
                      value={formData.value.goals}
                      onInput$={(e) => {
                        formData.value = { ...formData.value, goals: (e.target as HTMLTextAreaElement).value };
                      }}
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Geschätztes Budget (optional)</label>
                    <div class="flex">
                      <input 
                        type="number" 
                        class="form-input rounded-r-none"
                        placeholder="25000"
                        value={formData.value.budget || ''}
                        onInput$={(e) => {
                          const value = (e.target as HTMLInputElement).value;
                          formData.value = { ...formData.value, budget: value ? parseInt(value) : undefined };
                        }}
                        min="0"
                      />
                      <span class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        €
                      </span>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Gewünschtes Lieferdatum (optional)</label>
                    <input 
                      type="date" 
                      class="form-input"
                      value={formData.value.dueDate}
                      onInput$={(e) => {
                        formData.value = { ...formData.value, dueDate: (e.target as HTMLInputElement).value };
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Personen */}
            {currentStep.value === 3 && (
              <div class="card">
                <h3 class="text-xl font-semibold mb-6">Beteiligte Personen</h3>
                
                <div class="space-y-6">
                  <div class="form-group">
                    <label class="form-label">Fachlicher Ansprechpartner</label>
                    <div class="flex gap-3">
                      <input 
                        type="text" 
                        class="form-input flex-1"
                        placeholder="Name des fachlichen Ansprechpartners"
                        value={formData.value.functionalContact?.name || ''}
                        onInput$={(e) => {
                          const name = (e.target as HTMLInputElement).value;
                          formData.value = {
                            ...formData.value,
                            functionalContact: name ? {
                              id: `user-${Date.now()}`,
                              name,
                              department: formData.value.functionalContact?.department || ''
                            } : null
                          };
                        }}
                      />
                      <button type="button" class="btn btn-secondary">👥 Suchen</button>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Systemverantwortlicher</label>
                    <div class="flex gap-3">
                      <input 
                        type="text" 
                        class="form-input flex-1"
                        placeholder="Name des Systemverantwortlichen"
                        value={formData.value.systemResponsible?.name || ''}
                        onInput$={(e) => {
                          const name = (e.target as HTMLInputElement).value;
                          formData.value = {
                            ...formData.value,
                            systemResponsible: name ? {
                              id: `user-${Date.now()}`,
                              name,
                              department: formData.value.systemResponsible?.department || ''
                            } : null
                          };
                        }}
                      />
                      <button type="button" class="btn btn-secondary">👥 Suchen</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Zusammenfassung */}
            {currentStep.value === 4 && (
              <div class="card">
                <h3 class="text-xl font-semibold mb-6">Zusammenfassung</h3>
                
                <div class="space-y-4">
                  <div class="p-4 bg-gray-50 rounded-lg">
                    <h4 class="font-medium text-gray-900 mb-2">Titel</h4>
                    <p class="text-gray-700">{formData.value.title}</p>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4">
                    <div class="p-4 bg-gray-50 rounded-lg">
                      <h4 class="font-medium text-gray-900 mb-2">Art</h4>
                      <p class="text-gray-700">{formData.value.type}</p>
                    </div>
                    <div class="p-4 bg-gray-50 rounded-lg">
                      <h4 class="font-medium text-gray-900 mb-2">Priorität</h4>
                      <p class="text-gray-700 capitalize">{formData.value.priority}</p>
                    </div>
                  </div>

                  {formData.value.budget && (
                    <div class="p-4 bg-gray-50 rounded-lg">
                      <h4 class="font-medium text-gray-900 mb-2">Budget</h4>
                      <p class="text-gray-700">{formData.value.budget.toLocaleString()} €</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div class="flex justify-between mt-8">
              <button
                type="button"
                class="btn btn-secondary"
                onClick$={prevStep}
                disabled={currentStep.value === 1}
              >
                ← Zurück
              </button>
              
              {currentStep.value < totalSteps ? (
                <button
                  type="button"
                  class="btn btn-primary"
                  onClick$={nextStep}
                  disabled={
                    (currentStep.value === 1 && (!formData.value.title || !formData.value.type || !formData.value.realizationObject)) ||
                    (currentStep.value === 2 && (!formData.value.initialSituation || !formData.value.goals))
                  }
                >
                  Weiter →
                </button>
              ) : (
                <button
                  type="submit"
                  class="btn btn-primary"
                  disabled={isSubmitting.value}
                >
                  {isSubmitting.value ? (
                    <>
                      <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Wird erstellt...
                    </>
                  ) : (
                    'Anforderung erstellen'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Sidebar - Workflow Preview mit funktionierenden Animations */}
          <div class="lg:col-span-1">
            <div class="card sticky top-8">
              <h3 class="text-lg font-semibold mb-4">📋 Workflow-Vorschau</h3>
              
              {workflowPreview.value.length > 0 ? (
                <div class="space-y-4">
                  {workflowPreview.value.map((step, index) => (
                    <div key={step.id}>
                      <div class="workflow-step-preview">
                        <div class="flex items-center">
                          <div class={`workflow-step-icon ${
                            step.status === 'current' ? 'current-step' :
                            step.status === 'completed' ? 'completed-step' :
                            'pending-step'
                          }`}>
                            <span class="step-emoji">
                              {step.status === 'completed' ? '✅' : 
                               step.status === 'current' ? '🔄' : '⏳'}
                            </span>
                          </div>
                          <div class="flex-1 ml-3">
                            <div class="workflow-step-title">{step.name}</div>
                            <div class="workflow-step-meta">
                              <span class="responsible-emoji">
                                {step.responsible === 'AG' ? '👤' : 
                                 step.responsible === 'AN' ? '👨‍💻' : 
                                 '🤖'}
                              </span>
                              {step.responsible === 'AG' ? ' Auftraggeber' : 
                               step.responsible === 'AN' ? ' Auftragnehmer' : 
                               ' System'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Connection Arrow */}
                      {index < workflowPreview.value.length - 1 && (
                        <div class="workflow-connection">
                          <div class="workflow-arrow">⬇️</div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Workflow Summary */}
                  <div class="workflow-summary">
                    <div class="summary-header">
                      <span class="summary-emoji">📊</span>
                      <span class="summary-title">Zusammenfassung</span>
                    </div>
                    <div class="summary-content">
                      <div class="summary-item">
                        <span class="summary-emoji">📝</span>
                        <span class="summary-text">{workflowPreview.value.length} Schritte</span>
                      </div>
                      <div class="summary-item">
                        <span class="summary-emoji">⏱️</span>
                        <span class="summary-text">~{workflowPreview.value.length * 2} Tage</span>
                      </div>
                      <div class="summary-item">
                        <span class="summary-emoji">👥</span>
                        <span class="summary-text">AG + AN beteiligt</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div class="workflow-placeholder">
                  <div class="workflow-placeholder-animation">
                    <span class="bounce-emoji person-1">👤</span>
                    <span class="pulse-emoji arrow-1">➡️</span>
                    <span class="bounce-emoji person-2">👨‍💻</span>
                    <span class="pulse-emoji arrow-2">➡️</span>
                    <span class="bounce-emoji person-3">✅</span>
                  </div>
                  <h4>Workflow-Vorschau</h4>
                  <p>Wählen Sie eine Anforderungsart aus, um den zugehörigen Workflow zu sehen.</p>
                  
                  <div class="workflow-tips">
                    <div class="tips-content">
                      <div class="tip-item">
                        <span class="tip-emoji">💡</span>
                        <div class="tip-text">
                          <strong>Tipp:</strong> Jeder Workflow-Typ hat unterschiedliche Schritte
                        </div>
                      </div>
                      <div class="tip-item">
                        <span class="tip-emoji rotating-bulb">🔄</span>
                        <div class="tip-text">
                          <strong>Live-Vorschau:</strong> Sehen Sie sofort, welche Schritte auf Sie warten
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
});
