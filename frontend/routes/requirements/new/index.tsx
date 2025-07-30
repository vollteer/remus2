import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import type { 
  RequirementType, 
  RealizationObject, 
  Priority, 
  Person,
  CheckQuestion,
  WorkflowStep 
} from '../../../types';
import { MockApiService } from '../../../services/mock-service';

export default component$(() => {
  const currentStep = useSignal(1);
  const totalSteps = 4;
  const isSubmitting = useSignal(false);
  const availablePersons = useSignal<Person[]>([]);
  
  // Form data
  const formData = useSignal({
    title: '',
    description: '',
    type: '' as RequirementType | '',
    realizationObject: '' as RealizationObject | '',
    priority: 'medium' as Priority,
    functionalContact: null as Person | null,
    systemResponsible: null as Person | null,
    initialSituation: '',
    goals: '',
    budget: 0,
    dueDate: '',
    checkQuestions: [] as CheckQuestion[],
    externalReferences: [] as Array<{ title: string; url: string; description: string }>
  });

  const workflowPreview = useSignal<WorkflowStep[]>([]);

  // Load persons for dropdowns
  useTask$(async () => {
    try {
      const persons = await MockApiService.searchPersons('');
      availablePersons.value = persons;
    } catch (error) {
      console.error('Error loading persons:', error);
    }
  });

  // Update workflow preview when type changes
  useTask$(({ track }) => {
    track(() => formData.value.type);
    
    if (formData.value.type) {
      // Mock workflow steps based on type
      const workflows: Record<RequirementType, WorkflowStep[]> = {
        'Kleinanforderung': [
          { id: '1', name: 'Antrag erstellen', responsible: 'AG', order: 1, status: 'current', assignee: undefined },
          { id: '2', name: 'Prüfung', responsible: 'AN', order: 2, status: 'pending', assignee: undefined },
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
        ],
        'TIA-Anforderung': [
          { id: '1', name: 'TIA-Antrag', responsible: 'AG', order: 1, status: 'current', assignee: undefined },
          { id: '2', name: 'Architektur Review', responsible: 'AN', order: 2, status: 'pending', assignee: undefined },
          { id: '3', name: 'Sicherheitsanalyse', responsible: 'AN', order: 3, status: 'pending', assignee: undefined },
          { id: '4', name: 'Implementierung', responsible: 'AN', order: 4, status: 'pending', assignee: undefined },
          { id: '5', name: 'Security Test', responsible: 'AN', order: 5, status: 'pending', assignee: undefined },
          { id: '6', name: 'Go-Live', responsible: 'AG', order: 6, status: 'pending', assignee: undefined }
        ],
        'Supportleistung': [
          { id: '1', name: 'Support-Anfrage', responsible: 'AG', order: 1, status: 'current', assignee: undefined },
          { id: '2', name: 'Analyse', responsible: 'AN', order: 2, status: 'pending', assignee: undefined },
          { id: '3', name: 'Lösung', responsible: 'AN', order: 3, status: 'pending', assignee: undefined },
          { id: '4', name: 'Verifikation', responsible: 'AG', order: 4, status: 'pending', assignee: undefined }
        ],
        'Betriebsauftrag': [
          { id: '1', name: 'Auftrag erstellen', responsible: 'AG', order: 1, status: 'current', assignee: undefined },
          { id: '2', name: 'Planung', responsible: 'AN', order: 2, status: 'pending', assignee: undefined },
          { id: '3', name: 'Durchführung', responsible: 'AN', order: 3, status: 'pending', assignee: undefined },
          { id: '4', name: 'Dokumentation', responsible: 'AN', order: 4, status: 'pending', assignee: undefined }
        ],
        'SBBI-Lösung': [
          { id: '1', name: 'SBBI-Antrag', responsible: 'AG', order: 1, status: 'current', assignee: undefined },
          { id: '2', name: 'Bewertung', responsible: 'AN', order: 2, status: 'pending', assignee: undefined },
          { id: '3', name: 'Entwicklung', responsible: 'AN', order: 3, status: 'pending', assignee: undefined },
          { id: '4', name: 'Integration', responsible: 'AN', order: 4, status: 'pending', assignee: undefined }
        ],
        'AWG-Release': [
          { id: '1', name: 'Release-Antrag', responsible: 'AG', order: 1, status: 'current', assignee: undefined },
          { id: '2', name: 'Release Planning', responsible: 'AN', order: 2, status: 'pending', assignee: undefined },
          { id: '3', name: 'Development', responsible: 'AN', order: 3, status: 'pending', assignee: undefined },
          { id: '4', name: 'Testing', responsible: 'AN', order: 4, status: 'pending', assignee: undefined },
          { id: '5', name: 'Deployment', responsible: 'AN', order: 5, status: 'pending', assignee: undefined }
        ],
        'AWS-Release': [
          { id: '1', name: 'AWS-Release Antrag', responsible: 'AG', order: 1, status: 'current', assignee: undefined },
          { id: '2', name: 'AWS Planning', responsible: 'AN', order: 2, status: 'pending', assignee: undefined },
          { id: '3', name: 'Cloud Setup', responsible: 'AN', order: 3, status: 'pending', assignee: undefined },
          { id: '4', name: 'Migration', responsible: 'AN', order: 4, status: 'pending', assignee: undefined },
          { id: '5', name: 'Go-Live', responsible: 'AG', order: 5, status: 'pending', assignee: undefined }
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

  const submitForm = $(async () => {
    isSubmitting.value = true;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real app: await MockApiService.createRequirement(formData.value);
      
      // Redirect to requirements list or detail page
      console.log('Created requirement:', formData.value);
      alert('Anforderung erfolgreich erstellt!');
      
      // Reset form or redirect
      window.location.href = '/requirements';
      
    } catch (error) {
      console.error('Error creating requirement:', error);
      alert('Fehler beim Erstellen der Anforderung');
    } finally {
      isSubmitting.value = false;
    }
  });

  const getStepTitle = (step: number) => {
    const titles = {
      1: 'Grundinformationen',
      2: 'Details & Beschreibung',
      3: 'Zuweisungen & Termine',
      4: 'Prüfung & Abschluss'
    };
    return titles[step as keyof typeof titles];
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return !!(formData.value.title && formData.value.type && formData.value.realizationObject);
      case 2:
        return !!(formData.value.initialSituation && formData.value.goals);
      case 3:
        return true; // Optional fields
      case 4:
        return true; // Review step
      default:
        return false;
    }
  };

  return (
    <div class="animate-fade-in">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-primary mb-2">Neue Anforderung erstellen</h1>
          <p class="text-secondary">Schritt {currentStep.value} von {totalSteps}: {getStepTitle(currentStep.value)}</p>
        </div>
        
        <button class="btn btn-secondary" onClick$={() => window.history.back()}>
          ← Zurück zur Übersicht
        </button>
      </div>

      {/* Progress Bar */}
      <div class="card mb-6">
        <div class="progress-container">
          <div class="progress-bar-container">
            <div 
              class="progress-bar-fill"
              style={`width: ${(currentStep.value / totalSteps) * 100}%`}
            ></div>
          </div>
          
          <div class="progress-steps">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => (
              <div 
                key={step}
                class={`progress-step ${
                  step < currentStep.value ? 'completed' : 
                  step === currentStep.value ? 'current' : 'pending'
                }`}
              >
                <div class="progress-step-number">
                  {step < currentStep.value ? '✓' : step}
                </div>
                <div class="progress-step-label">{getStepTitle(step)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div class="form-layout">
        {/* Main Form */}
        <div class="form-main">
          
          {/* Step 1: Basic Information */}
          {currentStep.value === 1 && (
            <div class="card">
              <div class="card-header">
                <h3>Grundinformationen</h3>
                <p class="text-secondary">Bitte geben Sie die Basisdaten für Ihre Anforderung ein.</p>
              </div>

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
                />
              </div>

              <div class="grid-2 gap-4">
                <div class="form-group">
                  <label class="form-label">Anforderungsart *</label>
                  <select 
                    class="form-select"
                    value={formData.value.type}
                    onChange$={(e) => {
                      formData.value = { ...formData.value, type: (e.target as HTMLSelectElement).value as RequirementType };
                    }}
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
                      formData.value = { ...formData.value, realizationObject: (e.target as HTMLSelectElement).value as RealizationObject };
                    }}
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
                <div class="priority-selector">
                  {(['low', 'medium', 'high', 'critical'] as Priority[]).map(priority => (
                    <button
                      key={priority}
                      type="button"
                      class={`priority-option ${formData.value.priority === priority ? 'selected' : ''} priority-${priority}`}
                      onClick$={() => {
                        formData.value = { ...formData.value, priority };
                      }}
                    >
                      <span class="priority-icon">
                        {priority === 'low' ? '🟢' : 
                         priority === 'medium' ? '🟡' : 
                         priority === 'high' ? '🟠' : '🔴'}
                      </span>
                      <span class="priority-text">
                        {priority === 'low' ? 'Niedrig' : 
                         priority === 'medium' ? 'Mittel' : 
                         priority === 'high' ? 'Hoch' : 'Kritisch'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep.value === 2 && (
            <div class="card">
              <div class="card-header">
                <h3>Details & Beschreibung</h3>
                <p class="text-secondary">Beschreiben Sie Ihre Anforderung detailliert.</p>
              </div>

              <div class="form-group">
                <label class="form-label">Kurzbeschreibung</label>
                <textarea 
                  class="form-textarea" 
                  rows={3}
                  placeholder="Kurze Zusammenfassung der Anforderung..."
                  value={formData.value.description}
                  onInput$={(e) => {
                    formData.value = { ...formData.value, description: (e.target as HTMLTextAreaElement).value };
                  }}
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Ausgangssituation *</label>
                <textarea 
                  class="form-textarea" 
                  rows={4}
                  placeholder="Beschreiben Sie die aktuelle Situation und den Grund für diese Anforderung..."
                  value={formData.value.initialSituation}
                  onInput$={(e) => {
                    formData.value = { ...formData.value, initialSituation: (e.target as HTMLTextAreaElement).value };
                  }}
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Ziele *</label>
                <textarea 
                  class="form-textarea" 
                  rows={4}
                  placeholder="Was soll mit dieser Anforderung erreicht werden? Welche Ziele verfolgen Sie?"
                  value={formData.value.goals}
                  onInput$={(e) => {
                    formData.value = { ...formData.value, goals: (e.target as HTMLTextAreaElement).value };
                  }}
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Budget (€)</label>
                <input 
                  type="number" 
                  class="form-input" 
                  placeholder="0"
                  min="0"
                  step="1000"
                  value={formData.value.budget || ''}
                  onInput$={(e) => {
                    formData.value = { ...formData.value, budget: parseInt((e.target as HTMLInputElement).value) || 0 };
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 3: Assignments */}
          {currentStep.value === 3 && (
            <div class="card">
              <div class="card-header">
                <h3>Zuweisungen & Termine</h3>
                <p class="text-secondary">Legen Sie Verantwortlichkeiten und Termine fest.</p>
              </div>

              <div class="grid-2 gap-4">
                <div class="form-group">
                  <label class="form-label">Fachlicher Anwendungsbetreuer</label>
                  <select 
                    class="form-select"
                    value={formData.value.functionalContact?.id || ''}
                    onChange$={(e) => {
                      const personId = (e.target as HTMLSelectElement).value;
                      const person = availablePersons.value.find(p => p.id === personId);
                      formData.value = { ...formData.value, functionalContact: person || null };
                    }}
                  >
                    <option value="">Nicht zugewiesen</option>
                    {availablePersons.value.map(person => (
                      <option key={person.id} value={person.id}>
                        {person.name} ({person.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Systemverantwortlicher</label>
                  <select 
                    class="form-select"
                    value={formData.value.systemResponsible?.id || ''}
                    onChange$={(e) => {
                      const personId = (e.target as HTMLSelectElement).value;
                      const person = availablePersons.value.find(p => p.id === personId);
                      formData.value = { ...formData.value, systemResponsible: person || null };
                    }}
                  >
                    <option value="">Nicht zugewiesen</option>
                    {availablePersons.value.map(person => (
                      <option key={person.id} value={person.id}>
                        {person.name} ({person.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Gewünschtes Fertigstellungsdatum</label>
                <input 
                  type="date" 
                  class="form-input"
                  value={formData.value.dueDate}
                  onInput$={(e) => {
                    formData.value = { ...formData.value, dueDate: (e.target as HTMLInputElement).value };
                  }}
                />
              </div>

              {/* Check Questions */}
              <div class="form-group">
                <label class="form-label">Prüffragen</label>
                <div class="check-questions">
                  <div class="check-question">
                    <label class="checkbox-label">
                      <input type="checkbox" />
                      <span class="checkmark"></span>
                      Ist Schutzbedarf notwendig?
                    </label>
                  </div>
                  <div class="check-question">
                    <label class="checkbox-label">
                      <input type="checkbox" />
                      <span class="checkmark"></span>
                      Werden personenbezogene Daten verwendet?
                    </label>
                  </div>
                  <div class="check-question">
                    <label class="checkbox-label">
                      <input type="checkbox" />
                      <span class="checkmark"></span>
                      Sind externe Schnittstellen betroffen?
                    </label>
                  </div>
                  <div class="check-question">
                    <label class="checkbox-label">
                      <input type="checkbox" />
                      <span class="checkmark"></span>
                      Ist eine Risikoanalyse erforderlich?
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep.value === 4 && (
            <div class="card">
              <div class="card-header">
                <h3>Prüfung & Abschluss</h3>
                <p class="text-secondary">Überprüfen Sie Ihre Eingaben vor dem Absenden.</p>
              </div>

              <div class="review-section">
                <div class="review-item">
                  <strong>Titel:</strong> {formData.value.title}
                </div>
                <div class="review-item">
                  <strong>Typ:</strong> {formData.value.type}
                </div>
                <div class="review-item">
                  <strong>Realisierungsobjekt:</strong> {formData.value.realizationObject}
                </div>
                <div class="review-item">
                  <strong>Priorität:</strong> {formData.value.priority}
                </div>
                {formData.value.budget > 0 && (
                  <div class="review-item">
                    <strong>Budget:</strong> {formData.value.budget.toLocaleString('de-DE')} €
                  </div>
                )}
                {formData.value.dueDate && (
                  <div class="review-item">
                    <strong>Fertigstellungsdatum:</strong> {new Date(formData.value.dueDate).toLocaleDateString('de-DE')}
                  </div>
                )}
                {formData.value.functionalContact && (
                  <div class="review-item">
                    <strong>Fachlicher Anwendungsbetreuer:</strong> {formData.value.functionalContact.name}
                  </div>
                )}
                {formData.value.systemResponsible && (
                  <div class="review-item">
                    <strong>Systemverantwortlicher:</strong> {formData.value.systemResponsible.name}
                  </div>
                )}
              </div>

              <div class="form-actions-final">
                <button 
                  class="btn btn-secondary"
                  onClick$={() => {
                    // Save as draft
                    alert('Als Entwurf gespeichert');
                  }}
                >
                  💾 Als Entwurf speichern
                </button>
                
                <button 
                  class={`btn btn-primary ${isSubmitting.value ? 'loading' : ''}`}
                  onClick$={submitForm}
                  disabled={isSubmitting.value}
                >
                  {isSubmitting.value ? '⏳ Wird erstellt...' : '🚀 Anforderung erstellen'}
                </button>
              </div>
            </div>
          )}

          {/* Form Navigation */}
          <div class="form-navigation">
            <button 
              class="btn btn-secondary"
              onClick$={prevStep}
              disabled={currentStep.value === 1}
            >
              ← Zurück
            </button>
            
            <div class="form-nav-info">
              Schritt {currentStep.value} von {totalSteps}
            </div>
            
            {currentStep.value < totalSteps ? (
              <button 
                class="btn btn-primary"
                onClick$={nextStep}
                disabled={!isStepValid(currentStep.value)}
              >
                Weiter →
              </button>
            ) : null}
          </div>
        </div>

        {/* Enhanced Workflow Preview Sidebar */}
        <div class="workflow-sidebar">
          <div class="card">
            <div class="card-header">
              <h4>🔄 Workflow-Vorschau</h4>
              {formData.value.type ? (
                <p class="text-secondary text-sm">Für {formData.value.type}</p>
              ) : (
                <p class="text-secondary text-sm">Wählen Sie eine Anforderungsart</p>
              )}
            </div>
            
            {workflowPreview.value.length > 0 ? (
              <div class="workflow-timeline">
                <div class="workflow-legend">
                  <div class="legend-item">
                    <div class="legend-icon ag-icon">👤</div>
                    <span>Auftraggeber (AG)</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-icon an-icon">🔧</div>
                    <span>Auftragnehmer (AN)</span>
                  </div>
                </div>
                
                <div class="workflow-steps">
                  {workflowPreview.value.map((step, index) => (
                    <div 
                      key={step.id}
                      class={`workflow-step-new ${step.responsible.toLowerCase()} ${step.status}`}
                    >
                      {/* Connector Line */}
                      {index > 0 && (
                        <div class="workflow-connector"></div>
                      )}
                      
                      {/* Step Content */}
                      <div class="workflow-step-container">
                        <div class="workflow-step-side">
                          {step.responsible === 'AG' ? (
                            <div class="workflow-person ag-person">
                              <div class="person-avatar ag-avatar">
                                👤
                              </div>
                              <div class="person-label">AG</div>
                            </div>
                          ) : (
                            <div class="workflow-spacer"></div>
                          )}
                        </div>
                        
                        <div class="workflow-step-center">
                          <div class={`workflow-step-bubble ${step.responsible.toLowerCase()}`}>
                            <div class="step-number">
                              {step.status === 'current' ? '▶️' : 
                               step.status === 'completed' ? '✅' : index + 1}
                            </div>
                            <div class="step-content">
                              <div class="step-name">{step.name}</div>
                              <div class={`step-status ${step.status}`}>
                                {step.status === 'current' ? 'Aktuell' : 
                                 step.status === 'completed' ? 'Erledigt' : 'Ausstehend'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div class="workflow-step-side">
                          {step.responsible === 'AN' ? (
                            <div class="workflow-person an-person">
                              <div class="person-avatar an-avatar">
                                🔧
                              </div>
                              <div class="person-label">AN</div>
                            </div>
                          ) : (
                            <div class="workflow-spacer"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div class="workflow-summary">
                  <div class="summary-item">
                    <span class="summary-icon">📊</span>
                    <span class="summary-text">
                      {workflowPreview.value.length} Schritte insgesamt
                    </span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-icon">⏱️</span>
                    <span class="summary-text">
                      ≈ {Math.ceil(workflowPreview.value.length * 2.5)} Tage geschätzt
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div class="workflow-placeholder">
                <div class="workflow-placeholder-animation">
                  <div class="placeholder-person">👤</div>
                  <div class="placeholder-arrow">↔️</div>
                  <div class="placeholder-person">🔧</div>
                </div>
                <h4>Workflow wird geladen...</h4>
                <p>Wählen Sie eine Anforderungsart aus, um den Workflow anzuzeigen.</p>
              </div>
            )}
          </div>
          
          {/* Workflow Tips */}
          {formData.value.type && (
            <div class="card workflow-tips">
              <div class="card-header">
                <h4>💡 Workflow-Tipps</h4>
              </div>
              <div class="tips-content">
                {formData.value.type === 'Großanforderung' && (
                  <div class="tip-item">
                    <span class="tip-icon">🎯</span>
                    <p>Großanforderungen benötigen ein detailliertes Feinkonzept vor der Implementierung.</p>
                  </div>
                )}
                {formData.value.type === 'TIA-Anforderung' && (
                  <div class="tip-item">
                    <span class="tip-icon">🔒</span>
                    <p>TIA-Anforderungen durchlaufen eine spezielle Sicherheitsanalyse.</p>
                  </div>
                )}
                {formData.value.type === 'Kleinanforderung' && (
                  <div class="tip-item">
                    <span class="tip-icon">⚡</span>
                    <p>Kleinanforderungen haben einen verkürzten Workflow für schnelle Umsetzung.</p>
                  </div>
                )}
                <div class="tip-item">
                  <span class="tip-icon">👥</span>
                  <p>Die Verantwortung wechselt zwischen Auftraggeber (AG) und Auftragnehmer (AN).</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

  <style>{`
        .form-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 2rem;
        }
        
        @media (max-width: 1024px) {
          .form-layout {
            grid-template-columns: 1fr;
          }
          
          .workflow-sidebar {
            order: -1;
          }
        }
        
        /* Enhanced Workflow Styles - IMPROVED */
        .workflow-legend {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 1rem;
          padding: 0.75rem 1rem;
          background: var(--background-color);
          border-radius: 0.5rem;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .legend-icon {
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
        }
        
        .ag-icon {
          background: linear-gradient(135deg, rgb(59, 130, 246) 0%, var(--primary-light) 100%);
          color: white;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        }
        
        .an-icon {
          background: linear-gradient(135deg, var(--primary-light) 0%, rgb(0, 200, 255) 100%);
          color: white;
          box-shadow: 0 2px 4px rgba(0, 158, 227, 0.3);
        }
        
        .workflow-timeline {
          position: relative;
        }
        
        .workflow-steps {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          position: relative;
        }
        
        .workflow-step-new {
          position: relative;
        }
        
        .workflow-connector {
          position: absolute;
          left: 50%;
          top: -0.25rem;
          transform: translateX(-50%);
          width: 2px;
          height: 0.5rem;
          background: linear-gradient(180deg, var(--border-color) 0%, var(--primary-light) 100%);
        }
        
        .workflow-step-container {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          align-items: center;
          gap: 0.5rem;
        }
        
        .workflow-step-side {
          display: flex;
          justify-content: center;
        }
        
        .workflow-person {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }
        
        .person-avatar {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .ag-avatar {
          background: linear-gradient(135deg, rgb(59, 130, 246) 0%, var(--primary-light) 100%);
          color: white;
          box-shadow: 0 3px 6px rgba(59, 130, 246, 0.4);
        }
        
        .an-avatar {
          background: linear-gradient(135deg, var(--primary-light) 0%, rgb(0, 200, 255) 100%);
          color: white;
          box-shadow: 0 3px 6px rgba(0, 158, 227, 0.4);
        }
        
        .person-label {
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .workflow-spacer {
          width: 2.25rem;
          height: 2.25rem;
        }
        
        .workflow-step-center {
          display: flex;
          justify-content: center;
        }
        
        .workflow-step-bubble {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 0.875rem;
          border-radius: 0.875rem;
          background: white;
          border: 2px solid;
          transition: all 0.3s ease;
          min-width: 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          max-width: 100%;
        }
        
        .workflow-step-bubble.ag {
          border-color: rgb(59, 130, 246);
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%);
        }
        
        .workflow-step-bubble.an {
          border-color: var(--primary-light);
          background: linear-gradient(135deg, rgba(0, 158, 227, 0.05) 0%, rgba(0, 158, 227, 0.02) 100%);
        }
        
        .workflow-step-new.current .workflow-step-bubble {
          transform: scale(1.03);
          box-shadow: 0 4px 12px rgba(0, 158, 227, 0.2);
        }
        
        .workflow-step-new.current .person-avatar {
          transform: scale(1.08);
          box-shadow: 0 4px 12px rgba(0, 158, 227, 0.4);
        }
        
        .step-number {
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.8rem;
          flex-shrink: 0;
        }
        
        .workflow-step-bubble.ag .step-number {
          background: rgb(59, 130, 246);
          color: white;
        }
        
        .workflow-step-bubble.an .step-number {
          background: var(--primary-light);
          color: white;
        }
        
        .step-content {
          flex: 1;
          min-width: 0;
        }
        
        .step-name {
          font-weight: 600;
          font-size: 0.8rem;
          color: var(--text-primary);
          line-height: 1.2;
          margin-bottom: 0.2rem;
        }
        
        .step-status {
          font-size: 0.65rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .step-status.current {
          color: var(--primary-light);
        }
        
        .step-status.completed {
          color: var(--success-color);
        }
        
        .step-status.pending {
          color: var(--text-secondary);
        }
        
        .workflow-summary {
          margin-top: 1rem;
          padding: 0.875rem;
          background: linear-gradient(135deg, var(--background-color) 0%, white 100%);
          border-radius: 0.5rem;
          border: 1px solid var(--border-color);
        }
        
        .summary-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.375rem;
        }
        
        .summary-item:last-child {
          margin-bottom: 0;
        }
        
        .summary-icon {
          font-size: 0.9rem;
        }
        
        .summary-text {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 500;
        }
        
        .workflow-placeholder {
          text-align: center;
          padding: 1.5rem;
        }
        
        .workflow-placeholder-animation {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          font-size: 1.25rem;
        }
        
        .placeholder-person {
          animation: bounce 2s infinite;
        }
        
        .placeholder-arrow {
          animation: pulse 2s infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
        
        .workflow-placeholder h4 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        
        .workflow-placeholder p {
          color: var(--text-secondary);
          font-size: 0.8rem;
        }
        
        .workflow-tips {
          margin-top: 1rem;
        }
        
        .tips-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .tip-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.625rem;
          background: var(--background-color);
          border-radius: 0.375rem;
          border-left: 3px solid var(--primary-light);
        }
        
        .tip-icon {
          font-size: 1rem;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }
        
        .tip-item p {
          margin: 0;
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        
        /* Rest of the existing styles... */
        .progress-container {
          margin-bottom: 0;
        }
        
        .progress-bar-container {
          width: 100%;
          height: 8px;
          background: var(--border-color);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 2rem;
        }
        
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-light) 100%);
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        
        .progress-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        
        .progress-step {
          text-align: center;
        }
        
        .progress-step-number {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }
        
        .progress-step.pending .progress-step-number {
          background: var(--border-color);
          color: var(--text-secondary);
        }
        
        .progress-step.current .progress-step-number {
          background: var(--primary-color);
          color: white;
          box-shadow: 0 0 0 4px rgba(0, 72, 116, 0.2);
        }
        
        .progress-step.completed .progress-step-number {
          background: var(--success-color);
          color: white;
        }
        
        .progress-step-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
        }
        
        .progress-step.current .progress-step-label {
          color: var(--primary-color);
          font-weight: 600;
        }
        
        /* Form Elements */
        .priority-selector {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.75rem;
        }
        
        .priority-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1rem;
          border: 2px solid var(--border-color);
          border-radius: 0.75rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }
        
        .priority-option:hover {
          border-color: var(--primary-light);
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .priority-option.selected {
          border-color: var(--primary-color);
          background: rgba(0, 72, 116, 0.05);
          color: var(--primary-color);
        }
        
        .priority-icon {
          font-size: 1.25rem;
        }
        
        .check-questions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .check-question {
          display: flex;
          align-items: center;
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          font-weight: 500;
        }
        
        .checkbox-label input[type="checkbox"] {
          width: 1.25rem;
          height: 1.25rem;
          accent-color: var(--primary-color);
        }
        
        .review-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .review-item {
          padding: 0.75rem;
          background: var(--background-color);
          border-radius: 0.5rem;
          border-left: 4px solid var(--primary-color);
        }
        
        .form-actions-final {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
        }
        
        .form-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-color);
        }
        
        .form-nav-info {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }
        
        .btn.loading {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
});