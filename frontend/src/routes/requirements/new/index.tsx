import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import type { 
  RequirementType, 
  RealizationObject, 
  Priority, 
  Person,
  CheckQuestion,
  WorkflowStep 
} from '../../../types';

import { requirementsApi, type CreateRequirementRequest } from '~/services/api/requirements-api';
import { WorkflowApiService } from '~/services/api/workflow-api-service';
import { FormBuilderAPI, type FormConfiguration } from '~/services/api/forms-api-service';


export default component$(() => {
  const currentStep = useSignal(1);
  const isSubmitting = useSignal(false);
  const availablePersons = useSignal<Person[]>([]);
  const workflowError = useSignal<string | null>(null);
  const isLoadingWorkflow = useSignal(false);
  
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

  // Dynamic form values for widgets and fields
  const dynamicFormValues = useSignal<Record<string, any>>({});

  const workflowPreview = useSignal<WorkflowStep[]>([]);
  const formConfiguration = useSignal<FormConfiguration | null>(null);
  const dynamicSteps = useSignal<Array<{id: string, name: string, fields: any[], widgets: any[], stepType: 'workflow'|'form', workflowStepId?: string}>>([]);
  const serverWarning = useSignal<string | null>(null);

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
  // useTask$(({ track }) => {
  //   track(() => formData.value.type);
    
  //   if (formData.value.type) {
  //     // Mock workflow steps based on type
  //     const workflows: Record<RequirementType, WorkflowStep[]> = {
  //       'Kleinanforderung': [
  //         { id: '1', name: 'Antrag erstellen', responsible: 'AG', order: 1, status: 'current', assignee: undefined },
  //         { id: '2', name: 'Prüfung', responsible: 'AN', order: 2, status: 'pending', assignee: undefined },
  //         { id: '3', name: 'Umsetzung', responsible: 'AN', order: 3, status: 'pending', assignee: undefined },
  //         { id: '4', name: 'Abnahme', responsible: 'AG', order: 4, status: 'pending', assignee: undefined }
  //       ],
  //       'Großanforderung': [
  //         { id: '1', name: 'Antrag erstellen', responsible: 'AG', order: 1, status: 'current', assignee: undefined },
  //         { id: '2', name: 'Grobanalyse', responsible: 'AN', order: 2, status: 'pending', assignee: undefined },
  //         { id: '3', name: 'Feinkonzept', responsible: 'AN', order: 3, status: 'pending', assignee: undefined },
  //         { id: '4', name: 'Freigabe', responsible: 'AG', order: 4, status: 'pending', assignee: undefined },
  //         { id: '5', name: 'Implementierung', responsible: 'AN', order: 5, status: 'pending', assignee: undefined },
  //         { id: '6', name: 'Test', responsible: 'AN', order: 6, status: 'pending', assignee: undefined },
  //         { id: '7', name: 'Abnahme', responsible: 'AG', order: 7, status: 'pending', assignee: undefined }
  //       ],
  //       'TIA-Anforderung': [
  //         { id: '1', name: 'TIA-Antrag', responsible: 'AG', order: 1, status: 'current', assignee: undefined },
  //         { id: '2', name: 'Architektur Review', responsible: 'AN', order: 2, status: 'pending', assignee: undefined },
  //         { id: '3', name: 'Sicherheitsanalyse', responsible: 'AN', order: 3, status: 'pending', assignee: undefined },
  //         { id: '4', name: 'Implementierung', responsible: 'AN', order: 4, status: 'pending', assignee: undefined },
  //         { id: '5', name: 'Security Test', responsible: 'AN', order: 5, status: 'pending', assignee: undefined },
  //         { id: '6', name: 'Go-Live', responsible: 'AG', order: 6, status: 'pending', assignee: undefined }
  //       ],
  //       'Supportleistung': [
  //         { id: '1', name: 'Support-Anfrage', responsible: 'AG', order: 1, status: 'current', assignee: undefined },
  //         { id: '2', name: 'Analyse', responsible: 'AN', order: 2, status: 'pending', assignee: undefined },
  //         { id: '3', name: 'Lösung', responsible: 'AN', order: 3, status: 'pending', assignee: undefined },
  //         { id: '4', name: 'Verifikation', responsible: 'AG', order: 4, status: 'pending', assignee: undefined }
  //       ],
  //       'Betriebsauftrag': [
  //         { id: '1', name: 'Auftrag erstellen', responsible: 'AG', order: 1, status: 'current', assignee: undefined },
  //         { id: '2', name: 'Planung', responsible: 'AN', order: 2, status: 'pending', assignee: undefined },
  //         { id: '3', name: 'Durchführung', responsible: 'AN', order: 3, status: 'pending', assignee: undefined },
  //         { id: '4', name: 'Dokumentation', responsible: 'AN', order: 4, status: 'pending', assignee: undefined }
  //       ],
  //       'SBBI-Lösung': [
  //         { id: '1', name: 'SBBI-Antrag', responsible: 'AG', order: 1, status: 'current', assignee: undefined },
  //         { id: '2', name: 'Bewertung', responsible: 'AN', order: 2, status: 'pending', assignee: undefined },
  //         { id: '3', name: 'Entwicklung', responsible: 'AN', order: 3, status: 'pending', assignee: undefined },
  //         { id: '4', name: 'Integration', responsible: 'AN', order: 4, status: 'pending', assignee: undefined }
  //       ],
  //       'AWG-Release': [
  //         { id: '1', name: 'Release-Antrag', responsible: 'AG', order: 1, status: 'current', assignee: undefined },
  //         { id: '2', name: 'Release Planning', responsible: 'AN', order: 2, status: 'pending', assignee: undefined },
  //         { id: '3', name: 'Development', responsible: 'AN', order: 3, status: 'pending', assignee: undefined },
  //         { id: '4', name: 'Testing', responsible: 'AN', order: 4, status: 'pending', assignee: undefined },
  //         { id: '5', name: 'Deployment', responsible: 'AN', order: 5, status: 'pending', assignee: undefined }
  //       ],
  //       'AWS-Release': [
  //         { id: '1', name: 'AWS-Release Antrag', responsible: 'AG', order: 1, status: 'current', assignee: undefined },
  //         { id: '2', name: 'AWS Planning', responsible: 'AN', order: 2, status: 'pending', assignee: undefined },
  //         { id: '3', name: 'Cloud Setup', responsible: 'AN', order: 3, status: 'pending', assignee: undefined },
  //         { id: '4', name: 'Migration', responsible: 'AN', order: 4, status: 'pending', assignee: undefined },
  //         { id: '5', name: 'Go-Live', responsible: 'AG', order: 5, status: 'pending', assignee: undefined }
  //       ]
  //     };
      
  //     workflowPreview.value = workflows[formData.value.type] || [];
  //   } else {
  //     workflowPreview.value = [];
  //   }
  // });
useTask$(async ({ track }) => {
  track(() => formData.value.type);
  
  if (formData.value.type) {
    isLoadingWorkflow.value = true;
    workflowError.value = null;
    workflowPreview.value = [];
    
    try {
      console.log(`📥 Loading workflow: ${formData.value.type}`);
      
      // 🚀 ECHTER API-CALL über deinen services/api/workflow-api-service!
      const workflowConfig = await WorkflowApiService.getWorkflowByType(formData.value.type);
      
      if (workflowConfig && workflowConfig.steps && workflowConfig.steps.length > 0) {
        console.log('✅ Workflow steps loaded from API:', workflowConfig.steps);
        
        // Convert deine Backend-Steps zu Frontend-Format
        const frontendSteps = workflowConfig.steps.map((step, index) => ({
          id: step.id,
          name: step.title, // Backend: "title" → Frontend: "name"
          responsible: step.responsible,
          order: step.order || (index + 1),
          status: step.order === 1 ? 'current' : 'pending', // Erster Step ist current
          assignee: undefined,
          estimatedDays: step.estimatedDays || 1,
          parallelGroup: step.parallelGroup, // Neue Felder für Parallelisierung
          isParallel: step.isParallel || false
        }));
        
        workflowPreview.value = frontendSteps;
        console.log('🎯 Converted to frontend format:', frontendSteps);
        
        // Load form configuration for this workflow
        try {
          console.log('📋 Loading form configuration for:', formData.value.type);
          const formConfig = await FormBuilderAPI.loadFormConfiguration(formData.value.type);
          formConfiguration.value = formConfig;
          
          console.log('🔍 Loaded form config:', {
            id: formConfig?.id,
            name: formConfig?.name,
            fields: formConfig?.fields?.length || 0,
            widgets: formConfig?.widgets?.length || 0,
            widgetDetails: formConfig?.widgets?.map(w => ({
              id: w.id,
              title: w.title,
              type: w.type,
              fields: w.fields?.length || 0,
              binding: w.workflowStepBinding
            }))
          });
          
          // Check if config was loaded from local storage
          if (formConfig?.id && (formConfig.id.startsWith('temp-') || formConfig.id.startsWith('local-'))) {
            console.log('ℹ️ Using local/fallback configuration due to server issues');
            serverWarning.value = `Form-Server nicht verfügbar. Verwende lokale Konfiguration für "${formData.value.type}".`;
            
            // Clear warning after 8 seconds
            setTimeout(() => {
              serverWarning.value = null;
            }, 8000);
          } else {
            console.log('✅ Form configuration loaded from server:', formConfig);
            serverWarning.value = null; // Clear any previous warnings
          }
          
          // Create dynamic steps directly from workflow steps
          const newDynamicSteps = [];
          
          // Use actual workflow steps as the form steps
          for (const workflowStep of frontendSteps) {
            // For first step, also check for 'step-1' binding (compatibility)
            const stepFields = formConfig?.fields?.filter(field => {
              if (!field.workflowStepBinding || field.workflowStepBinding.length === 0) {
                return true; // Fields without binding are shown on all steps
              }
              if (field.workflowStepBinding.includes(workflowStep.id)) {
                return true;
              }
              // Special handling for first step - also accept 'step-1' binding
              if (workflowStep.order === 1 && field.workflowStepBinding.includes('step-1')) {
                return true;
              }
              return false;
            }) || [];
            
            // For first step, also check for 'step-1' binding (compatibility)
            const stepWidgets = formConfig?.widgets?.filter(widget => {
              if (!widget.workflowStepBinding || widget.workflowStepBinding.length === 0) {
                return true; // Widgets without binding are shown on all steps
              }
              if (widget.workflowStepBinding.includes(workflowStep.id)) {
                return true;
              }
              // Special handling for first step - also accept 'step-1' binding
              if (workflowStep.order === 1 && widget.workflowStepBinding.includes('step-1')) {
                return true;
              }
              return false;
            }) || [];
            
            console.log(`📊 Step ${workflowStep.id} - Fields: ${stepFields.length}, Widgets: ${stepWidgets.length}`);
            if (workflowStep.order === 1) {
              console.log('🔍 First step widget bindings:', formConfig?.widgets?.map(w => ({
                id: w.id,
                title: w.title,
                binding: w.workflowStepBinding
              })));
            }
            
            newDynamicSteps.push({
              id: workflowStep.id,
              name: workflowStep.name,
              fields: stepFields,
              widgets: stepWidgets,
              stepType: 'workflow' as const,
              workflowStepId: workflowStep.id,
              isFirstStep: workflowStep.order === 1
            });
          }
          
          dynamicSteps.value = newDynamicSteps;
          console.log('🔄 Generated dynamic steps:', newDynamicSteps);
          
        } catch (formError) {
          console.log('ℹ️ No form configuration found for this workflow:', formError);
          formConfiguration.value = null;
          
          // Auto-seed if it's Kleinanforderung and no config exists
          if (formData.value.type === 'Kleinanforderung') {
            console.log('🌱 Auto-seeding Kleinanforderung configuration...');
            try {
              const { seedKleinanforderungConfiguration } = await import('~/scripts/seed-kleinanforderung-config');
              await seedKleinanforderungConfiguration();
              console.log('✅ Auto-seed completed, retrying configuration load...');
              
              // Retry loading the configuration (will use local fallback)
              const retryConfig = await FormBuilderAPI.loadFormConfiguration(formData.value.type);
              formConfiguration.value = retryConfig;
              
              // If still no config from API, try to load from local storage directly
              if (!retryConfig || !retryConfig.widgets || retryConfig.widgets.length === 0) {
                console.log('🔄 API still empty, checking local storage directly...');
                if (typeof window !== 'undefined') {
                  const localKey = `form-config-${formData.value.type}`;
                  const localData = localStorage.getItem(localKey);
                  if (localData) {
                    try {
                      const localConfig = JSON.parse(localData);
                      formConfiguration.value = localConfig;
                      console.log('✅ Using local storage config:', localConfig);
                    } catch (parseError) {
                      console.error('❌ Failed to parse local config:', parseError);
                    }
                  }
                }
              }
              
              console.log('🔍 Retry loaded config:', {
                id: retryConfig?.id,
                name: retryConfig?.name,
                widgets: retryConfig?.widgets?.length || 0
              });
              
              if (retryConfig && retryConfig.widgets && retryConfig.widgets.length > 0) {
                // Regenerate dynamic steps with the new config
                const newDynamicSteps = [];
                for (const workflowStep of frontendSteps) {
                  const stepFields = retryConfig?.fields?.filter(field => {
                    if (!field.workflowStepBinding || field.workflowStepBinding.length === 0) {
                      return true;
                    }
                    if (field.workflowStepBinding.includes(workflowStep.id)) {
                      return true;
                    }
                    if (workflowStep.order === 1 && field.workflowStepBinding.includes('step-1')) {
                      return true;
                    }
                    return false;
                  }) || [];
                  
                  const stepWidgets = retryConfig?.widgets?.filter(widget => {
                    if (!widget.workflowStepBinding || widget.workflowStepBinding.length === 0) {
                      return true;
                    }
                    if (widget.workflowStepBinding.includes(workflowStep.id)) {
                      return true;
                    }
                    if (workflowStep.order === 1 && widget.workflowStepBinding.includes('step-1')) {
                      return true;
                    }
                    return false;
                  }) || [];
                  
                  newDynamicSteps.push({
                    id: workflowStep.id,
                    name: workflowStep.name,
                    fields: stepFields,
                    widgets: stepWidgets,
                    stepType: 'workflow' as const,
                    workflowStepId: workflowStep.id,
                    isFirstStep: workflowStep.order === 1
                  });
                }
                
                dynamicSteps.value = newDynamicSteps;
                console.log('🔄 Generated dynamic steps after auto-seed:', newDynamicSteps);
                return; // Exit early as we've successfully loaded the config
              }
            } catch (seedError) {
              console.error('❌ Auto-seed failed:', seedError);
            }
          }
          
          // Use real workflow steps even without form configuration
          const newDynamicSteps = [];
          
          for (const workflowStep of frontendSteps) {
            newDynamicSteps.push({
              id: workflowStep.id,
              name: workflowStep.name,
              fields: [], // No form fields available
              widgets: [], // No widgets available
              stepType: 'workflow' as const,
              workflowStepId: workflowStep.id,
              isFirstStep: workflowStep.order === 1
            });
          }
          
          dynamicSteps.value = newDynamicSteps;
          console.log('🔄 Generated dynamic steps without form config:', newDynamicSteps);
        }
        
      } else {
        // 🚨 KEINE MOCK-DATEN! Ehrliche Fehlermeldung:
        workflowError.value = `Kein Workflow für "${formData.value.type}" konfiguriert. Bitte kontaktieren Sie den Administrator.`;
        workflowPreview.value = [];
        console.warn('⚠️ No workflow configuration found for type:', formData.value.type);
      }
      
    } catch (error) {
      console.error('💥 Error loading workflow:', error);
      
      // 🚨 ECHTER FEHLER - Keine Mock-Daten!
      if (error instanceof Error) {
        if (error.message.includes('404') || error.message.includes('not found')) {
          workflowError.value = `Workflow-Typ "${formData.value.type}" existiert nicht in der Datenbank.`;
        } else if (error.message.includes('500') || error.message.includes('Internal server error')) {
          workflowError.value = `Server-Fehler beim Laden des Workflows. Bitte versuchen Sie es später erneut.`;
        } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
          workflowError.value = `Verbindung zum Server fehlgeschlagen. Prüfen Sie Ihre Internetverbindung.`;
        } else if (error.message.includes('timeout')) {
          workflowError.value = `Timeout beim Laden des Workflows. Server antwortet nicht.`;
        } else {
          workflowError.value = `Fehler beim Laden des Workflows: ${error.message}`;
        }
      } else {
        workflowError.value = `Unbekannter Fehler beim Laden des Workflows.`;
      }
      
      workflowPreview.value = [];
    } finally {
      isLoadingWorkflow.value = false;
    }
  } else {
    // Kein Type gewählt - Reset
    workflowPreview.value = [];
    workflowError.value = null;
    isLoadingWorkflow.value = false;
  }
});

  // Helper functions - must be defined before usage (using QRL for Qwik serialization)
  const getTotalSteps = $(() => dynamicSteps.value.length || 4);
  
  const getStepTitle = $((step: number) => {
    const dynamicStep = dynamicSteps.value[step - 1];
    console.log(`getStepTitle(${step}):`, dynamicStep?.name, 'from dynamicSteps:', dynamicSteps.value.length);
    return dynamicStep?.name || 'Schritt';
  });

  const nextStep = $(() => {
    if (currentStep.value < dynamicSteps.value.length) {
      currentStep.value++;
    }
  });

  const prevStep = $(() => {
    if (currentStep.value > 1) {
      currentStep.value--;
    }
  });

// const submitForm = $(async () => {
//   isSubmitting.value = true;
  
//   try {
//     // Prepare request data (mapping zu deinem Backend DTO)
//     const requestData: CreateRequirementRequest = {
//       title: formData.value.title,
//       type: formData.value.type as string,
//       realizationObject: formData.value.realizationObject as string,
//       priority: formData.value.priority,
//       initialSituation: formData.value.initialSituation,
//       goals: formData.value.goals,
//       budget: formData.value.budget,
//       functionalContact: formData.value.functionalContact,
//       systemResponsible: formData.value.systemResponsible,
//       dueDate: formData.value.dueDate,
//       formData: {
//         ...formData.value,
//         timestamp: new Date().toISOString(),
//         userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
//       }
//     };

//     console.log('📤 Creating requirement:', requestData);

//     // 🚀 ECHTER API-CALL STATT MOCK!
//     const result = await requirementsApi.createRequirement(requestData);
    
//     if (result.success && result.data) {
//       console.log('✅ Requirement created successfully:', result.data);
      
//       // Show success message (SSR-safe)
//       if (typeof window !== 'undefined') {
//         alert(`🎉 ${result.message}\n\nAnforderungs-Nr.: ${result.data.requirementNumber}`);
        
//         // Optional: Redirect to the new requirement
//         // window.location.href = `/requirements/${result.data.id}`;
//       }
      
//     } else {
//       // Handle API error
//       console.error('❌ Failed to create requirement:', result);
//       const errorMessage = result.message || 'Unbekannter Fehler beim Erstellen der Anforderung';
      
//       if (typeof window !== 'undefined') {
//         alert(`❌ Fehler: ${errorMessage}\n\nDetails: ${result.errors?.join(', ') || 'Keine Details verfügbar'}`);
//       }
//     }
    
//   } catch (error) {
//     console.error('💥 Unexpected error creating requirement:', error);
    
//     if (typeof window !== 'undefined') {
//       alert(`💥 Unerwarteter Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
//     }
//   } finally {
//     isSubmitting.value = false;
//   }
// });
const submitForm = $(async () => {
  // 🚨 Validierung: Workflow muss geladen sein!
  if (workflowError.value) {
    if (typeof window !== 'undefined') {
      alert(`❌ Kann Anforderung nicht erstellen:\n\n${workflowError.value}\n\nBitte beheben Sie den Workflow-Fehler zuerst.`);
    }
    return;
  }
  
  if (workflowPreview.value.length === 0) {
    if (typeof window !== 'undefined') {
      alert('❌ Kann Anforderung nicht erstellen:\n\nKein Workflow für diesen Typ verfügbar.');
    }
    return;
  }
  
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
        dynamicFields: dynamicFormValues.value, // Include all widget/field values
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
        alert(`🎉 ${result.message}\n\nAnforderungs-Nr.: ${result.data.requirementNumber}\n\nWorkflow "${formData.value.type}" wurde gestartet mit ${workflowPreview.value.length} Schritten.`);
        
        // Optional: Redirect to the new requirement
        // window.location.href = `/requirements/${result.data.id}`;
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




  // Simplified workflow step rendering for sidebar
  const renderWorkflowStep = (step: WorkflowStep, isParallel: boolean, stepIndex?: number) => {
    // Use step.order if available, otherwise use provided stepIndex or fallback to findIndex
    const stepNumber = step.order || (stepIndex !== undefined ? stepIndex + 1 : workflowPreview.value.findIndex(s => s.id === step.id) + 1);
    
    return (
      <div class={`workflow-step-simple ${step.responsible.toLowerCase()} ${step.status} ${isParallel ? 'parallel' : ''}`}>
        {/* Connector Line for non-parallel steps */}
        {!isParallel && stepNumber > 1 && (
          <div class="workflow-connector-simple"></div>
        )}
        
        {/* Step Content */}
        <div class="workflow-step-container-simple">
          <div class="workflow-step-side">
            {step.responsible === 'AG' ? (
              <div class="workflow-person ag-person">
                <div class="person-avatar ag-avatar">👤</div>
                <div class="person-label">AG</div>
              </div>
            ) : (
              <div class="workflow-spacer"></div>
            )}
          </div>
          
          <div class="workflow-step-center">
            <div class={`workflow-step-bubble ${step.responsible.toLowerCase()} ${isParallel ? 'parallel' : ''}`}>
              <div class="step-number">
                {step.status === 'current' ? '▶️' : 
                 step.status === 'completed' ? '✅' : 
                 isParallel ? '⚡' : stepNumber}
              </div>
              <div class="step-content">
                <div class="step-name">{step.name}</div>
                <div class={`step-status ${step.status}`}>
                  {step.status === 'current' ? 'Aktuell' : 
                   step.status === 'completed' ? 'Erledigt' : 'Ausstehend'}
                </div>
                {step.estimatedDays && step.estimatedDays > 0 && (
                  <div class="step-duration">≈ {step.estimatedDays}d</div>
                )}
                {isParallel && step.parallelGroup && (
                  <div class="step-parallel-badge">
                    ⚡ {step.parallelGroup}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div class="workflow-step-side">
            {step.responsible === 'AN' ? (
              <div class="workflow-person an-person">
                <div class="person-avatar an-avatar">🔧</div>
                <div class="person-label">AN</div>
              </div>
            ) : (
              <div class="workflow-spacer"></div>
            )}
          </div>
        </div>
      </div>
    );
  };


  const isStepValid = (step: number) => {
    const dynamicStep = dynamicSteps.value[step - 1];
    if (!dynamicStep) return false;
    
    if (dynamicStep.isFirstStep || dynamicStep.id === 'step-1') {
      return formData.value.title && formData.value.type && formData.value.realizationObject;
    } else if (dynamicStep.stepType === 'workflow') {
      // Validate based on configured required fields
      const requiredFields = dynamicStep.fields.filter(field => field.required);
      // For now, return true - implement proper validation later
      return true;
    }
    return true;
  };

  // Render dynamic form fields and widgets for workflow steps
  // Helper function to get widget icon
  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'customGroup': return '📝';
      case 'zustaendigkeitGroup': return '👥';
      case 'budgetGroup': return '💰';
      case 'terminGroup': return '📅';
      case 'pruefungGroup': return '✅';
      default: return '📦';
    }
  };

  // Helper function to get widget color
  const getWidgetColor = (type: string) => {
    switch (type) {
      case 'customGroup': return '#3b82f6';
      case 'zustaendigkeitGroup': return '#10b981';
      case 'budgetGroup': return '#f59e0b';
      case 'terminGroup': return '#8b5cf6';
      case 'pruefungGroup': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const renderDynamicFields = (fields: any[], widgets: any[] = []) => {
    const elements = [];
    
    // Add regular fields that are not part of widgets
    const standaloneFields = fields.filter(field => !field.widget);
    standaloneFields.forEach(field => {
      const fieldValue = dynamicFormValues.value[field.id] || field.defaultValue || '';
      
      elements.push(
        <div key={field.id} class="form-group">
          <label class="form-label">
            {field.label}
            {field.required && <span class="text-red-500">*</span>}
          </label>
          
          {field.type === 'text' && (
            <input 
              type="text" 
              class="form-input" 
              placeholder={field.placeholder}
              value={fieldValue}
              onInput$={(e) => {
                dynamicFormValues.value = {
                  ...dynamicFormValues.value,
                  [field.id]: (e.target as HTMLInputElement).value
                };
              }}
            />
          )}
          {field.type === 'textarea' && (
            <textarea 
              class="form-textarea" 
              rows={3}
              placeholder={field.placeholder}
              value={fieldValue}
              onInput$={(e) => {
                dynamicFormValues.value = {
                  ...dynamicFormValues.value,
                  [field.id]: (e.target as HTMLTextAreaElement).value
                };
              }}
            />
          )}
          {field.type === 'select' && (
            <select 
              class="form-select"
              value={fieldValue}
              onChange$={(e) => {
                dynamicFormValues.value = {
                  ...dynamicFormValues.value,
                  [field.id]: (e.target as HTMLSelectElement).value
                };
              }}
            >
              <option value="">Auswählen...</option>
              {field.options?.map((opt: any) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
          {field.type === 'date' && (
            <input 
              type="date" 
              class="form-input"
              value={fieldValue}
              onInput$={(e) => {
                dynamicFormValues.value = {
                  ...dynamicFormValues.value,
                  [field.id]: (e.target as HTMLInputElement).value
                };
              }}
            />
          )}
          {field.type === 'currency' && (
            <input 
              type="number" 
              class="form-input" 
              placeholder={field.placeholder || "0,00 €"}
              step="0.01"
              value={fieldValue}
              onInput$={(e) => {
                dynamicFormValues.value = {
                  ...dynamicFormValues.value,
                  [field.id]: parseFloat((e.target as HTMLInputElement).value) || 0
                };
              }}
            />
          )}
          {field.type === 'checkbox' && (
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                checked={fieldValue === true}
                onChange$={(e) => {
                  dynamicFormValues.value = {
                    ...dynamicFormValues.value,
                    [field.id]: (e.target as HTMLInputElement).checked
                  };
                }}
              />
              <span class="checkmark"></span>
              {field.placeholder || field.label}
            </label>
          )}
          {field.type === 'userSearch' && (
            <div class="user-search-field">
              <input 
                type="text" 
                class="form-input" 
                placeholder={field.placeholder || "User suchen..."}
                value={fieldValue}
                onInput$={(e) => {
                  dynamicFormValues.value = {
                    ...dynamicFormValues.value,
                    [field.id]: (e.target as HTMLInputElement).value
                  };
                }}
              />
              <div class="field-hint">👤 User-Suchfeld</div>
            </div>
          )}
          {field.type === 'requirementSearch' && (
            <div class="requirement-search-field">
              <input 
                type="text" 
                class="form-input" 
                placeholder={field.placeholder || "Anforderung suchen..."}
                value={fieldValue}
                onInput$={(e) => {
                  dynamicFormValues.value = {
                    ...dynamicFormValues.value,
                    [field.id]: (e.target as HTMLInputElement).value
                  };
                }}
              />
              <div class="field-hint">🔍 Anforderungs-Suchfeld</div>
            </div>
          )}
          
          {field.description && (
            <p class="field-description">{field.description}</p>
          )}
        </div>
      );
    });
    
    // Add widgets with enhanced styling like Form Builder
    widgets.forEach(widget => {
      if (!widget.fields || widget.fields.length === 0) return;
      
      // Special handling for budget/termine widgets with AN/AG columns
      const isBudgetWidget = widget.type === 'budgetGroup' || widget.type === 'terminGroup';
      const hasAnAgFields = widget.fields?.some((f: any) => f.name.includes('_an_') || f.name.includes('_ag_'));
      
      elements.push(
        <div key={widget.id} class="form-widget-container modern-widget">
          <div class="form-widget-header">
            <div class="widget-header-content">
              <div class="widget-title-section">
                <span class="widget-icon" style={`color: ${getWidgetColor(widget.type)}`}>
                  {getWidgetIcon(widget.type)}
                </span>
                <h4 class="form-widget-title">{widget.title}</h4>
              </div>
              {widget.description && (
                <p class="form-widget-description">{widget.description}</p>
              )}
            </div>
          </div>
          
          <div class="form-widget-fields">
            {isBudgetWidget && hasAnAgFields ? (
              // Special AN/AG column layout for budget/termine widgets
              <div class="budget-widget-layout">
                <div class="budget-columns-header">
                  <div class="budget-column-label an-column">
                    <span class="column-icon">🔧</span>
                    <span>Auftragnehmer (AN)</span>
                  </div>
                  <div class="budget-column-label ag-column">
                    <span class="column-icon">👤</span>
                    <span>Auftraggeber (AG)</span>
                  </div>
                </div>
                
                <div class="budget-columns-content">
                  <div class="budget-column an-fields">
                    {widget.fields.filter((f: any) => f.name.includes('_an_')).map((field: any) => {
                      const fieldValue = dynamicFormValues.value[field.id] || field.defaultValue || '';
                      return (
                        <div key={field.id} class="budget-field-row">
                          <label class="budget-field-label">
                            {field.label.replace('Aufwand AN ', '')}
                            {field.required && <span class="text-red-500">*</span>}
                          </label>
                          <input 
                            type={field.type === 'currency' ? 'number' : 'text'}
                            class="budget-field-input" 
                            placeholder={field.placeholder || "0,00 €"}
                            step={field.type === 'currency' ? '0.01' : undefined}
                            value={fieldValue}
                            onInput$={(e) => {
                              const value = field.type === 'currency' 
                                ? parseFloat((e.target as HTMLInputElement).value) || 0
                                : (e.target as HTMLInputElement).value;
                              dynamicFormValues.value = {
                                ...dynamicFormValues.value,
                                [field.id]: value
                              };
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  
                  <div class="budget-column ag-fields">
                    {widget.fields.filter((f: any) => f.name.includes('_ag_')).map((field: any) => {
                      const fieldValue = dynamicFormValues.value[field.id] || field.defaultValue || '';
                      return (
                        <div key={field.id} class="budget-field-row">
                          <label class="budget-field-label">
                            {field.label.replace('Aufwand AG ', '')}
                            {field.required && <span class="text-red-500">*</span>}
                          </label>
                          <input 
                            type={field.type === 'currency' ? 'number' : 'text'}
                            class="budget-field-input" 
                            placeholder={field.placeholder || "0,00 €"}
                            step={field.type === 'currency' ? '0.01' : undefined}
                            value={fieldValue}
                            onInput$={(e) => {
                              const value = field.type === 'currency' 
                                ? parseFloat((e.target as HTMLInputElement).value) || 0
                                : (e.target as HTMLInputElement).value;
                              dynamicFormValues.value = {
                                ...dynamicFormValues.value,
                                [field.id]: value
                              };
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              // Regular widget field layout
              <div class="widget-fields-grid">
                {widget.fields.map((field: any) => {
                  const fieldValue = dynamicFormValues.value[field.id] || field.defaultValue || '';
                  return (
                    <div key={field.id} class={`form-group ${field.width === 'half' ? 'form-group-half' : 'form-group-full'}`}>
                      <label class="form-label enhanced">
                        {field.label}
                        {field.required && <span class="text-red-500">*</span>}
                      </label>
                      
                      {field.type === 'text' && (
                        <input 
                          type="text" 
                          class="form-input enhanced" 
                          placeholder={field.placeholder}
                          value={fieldValue}
                          onInput$={(e) => {
                            dynamicFormValues.value = {
                              ...dynamicFormValues.value,
                              [field.id]: (e.target as HTMLInputElement).value
                            };
                          }}
                        />
                      )}
                      {field.type === 'textarea' && (
                        <textarea 
                          class="form-textarea enhanced" 
                          rows={3}
                          placeholder={field.placeholder}
                          value={fieldValue}
                          onInput$={(e) => {
                            dynamicFormValues.value = {
                              ...dynamicFormValues.value,
                              [field.id]: (e.target as HTMLTextAreaElement).value
                            };
                          }}
                        />
                      )}
                      {field.type === 'date' && (
                        <input 
                          type="date" 
                          class="form-input enhanced"
                          value={fieldValue}
                          onInput$={(e) => {
                            dynamicFormValues.value = {
                              ...dynamicFormValues.value,
                              [field.id]: (e.target as HTMLInputElement).value
                            };
                          }}
                        />
                      )}
                      {field.type === 'currency' && (
                        <input 
                          type="number" 
                          class="form-input enhanced" 
                          placeholder={field.placeholder || "0,00 €"}
                          step="0.01"
                          value={fieldValue}
                          onInput$={(e) => {
                            dynamicFormValues.value = {
                              ...dynamicFormValues.value,
                              [field.id]: parseFloat((e.target as HTMLInputElement).value) || 0
                            };
                          }}
                        />
                      )}
                      {field.type === 'checkbox' && (
                        <label class="checkbox-label enhanced">
                          <input 
                            type="checkbox" 
                            checked={fieldValue === true}
                            onChange$={(e) => {
                              dynamicFormValues.value = {
                                ...dynamicFormValues.value,
                                [field.id]: (e.target as HTMLInputElement).checked
                              };
                            }}
                          />
                          <span class="checkmark enhanced"></span>
                          {field.label}
                        </label>
                      )}
                      {field.type === 'select' && (
                        <select 
                          class="form-select enhanced"
                          value={fieldValue}
                          onChange$={(e) => {
                            dynamicFormValues.value = {
                              ...dynamicFormValues.value,
                              [field.id]: (e.target as HTMLSelectElement).value
                            };
                          }}
                        >
                          <option value="">Auswählen...</option>
                          {field.options?.map((opt: any) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      )}
                      {field.type === 'number' && (
                        <input 
                          type="number" 
                          class="form-input enhanced" 
                          placeholder={field.placeholder || "0"}
                          value={fieldValue}
                          onInput$={(e) => {
                            dynamicFormValues.value = {
                              ...dynamicFormValues.value,
                              [field.id]: parseInt((e.target as HTMLInputElement).value) || 0
                            };
                          }}
                        />
                      )}
                      {field.type === 'multiselect' && (
                        <div class="multiselect-field enhanced">
                          <select 
                            class="form-select enhanced"
                            multiple
                            value={Array.isArray(fieldValue) ? fieldValue : []}
                            onChange$={(e) => {
                              const selected = Array.from((e.target as HTMLSelectElement).selectedOptions)
                                .map(option => option.value);
                              dynamicFormValues.value = {
                                ...dynamicFormValues.value,
                                [field.id]: selected
                              };
                            }}
                          >
                            {field.options?.map((opt: any) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          <div class="field-hint enhanced">💼 {field.placeholder || "Mehrfachauswahl möglich"}</div>
                        </div>
                      )}
                      {field.type === 'file' && (
                        <div class="file-field enhanced">
                          <input 
                            type="file" 
                            class="form-input enhanced"
                            multiple
                            onChange$={(e) => {
                              const files = Array.from((e.target as HTMLInputElement).files || []);
                              dynamicFormValues.value = {
                                ...dynamicFormValues.value,
                                [field.id]: files.map(f => f.name)
                              };
                            }}
                          />
                          <div class="field-hint enhanced">📎 {field.placeholder || "Dateien auswählen"}</div>
                        </div>
                      )}
                      {field.type === 'userSearch' && (
                        <div class="user-search-field enhanced">
                          <input 
                            type="text" 
                            class="form-input enhanced" 
                            placeholder={field.placeholder || "User suchen..."}
                            value={fieldValue}
                            onInput$={(e) => {
                              dynamicFormValues.value = {
                                ...dynamicFormValues.value,
                                [field.id]: (e.target as HTMLInputElement).value
                              };
                            }}
                          />
                          <div class="field-hint enhanced">👤 {field.placeholder || "User suchen"}</div>
                        </div>
                      )}
                      {field.type === 'requirementSearch' && (
                        <div class="requirement-search-field enhanced">
                          <input 
                            type="text" 
                            class="form-input enhanced" 
                            placeholder={field.placeholder || "Anforderung suchen..."}
                            value={fieldValue}
                            onInput$={(e) => {
                              dynamicFormValues.value = {
                                ...dynamicFormValues.value,
                                [field.id]: (e.target as HTMLInputElement).value
                              };
                            }}
                          />
                          <div class="field-hint enhanced">🔍 {field.placeholder || "Anforderung suchen"}</div>
                        </div>
                      )}
                      
                      {field.description && (
                        <p class="field-description enhanced">{field.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    });
    
    return elements;
  };

  return (
    <div class="animate-fade-in">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-primary mb-2">Neue Anforderung erstellen</h1>
          {dynamicSteps.value.length > 0 ? (
            <p class="text-secondary">Schritt {currentStep.value} von {dynamicSteps.value.length}: {getStepTitle(currentStep.value)}</p>
          ) : (
            <p class="text-secondary">Wählen Sie zuerst eine Anforderungsart aus</p>
          )}
        </div>
        
        <button class="btn btn-secondary" onClick$={() => window.history.back()}>
          ← Zurück zur Übersicht
        </button>
      </div>

      {/* Server Warning */}
      {serverWarning.value && (
        <div class="alert alert-warning mb-6">
          <div class="flex items-center gap-3">
            <span class="text-xl">⚠️</span>
            <div>
              <p class="font-medium">Server-Warnung</p>
              <p class="text-sm">{serverWarning.value}</p>
            </div>
            <button
              onClick$={() => serverWarning.value = null}
              class="ml-auto text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar - only show when workflow is selected */}
      {dynamicSteps.value.length > 0 && (
        <div class="card mb-6">
          <div class="progress-container">
            <div class="progress-bar-container">
              <div 
                class="progress-bar-fill"
                style={`width: ${(currentStep.value / dynamicSteps.value.length) * 100}%`}
              ></div>
            </div>
            
            <div 
              class="progress-steps"
              style={`grid-template-columns: repeat(${dynamicSteps.value.length}, 1fr);`}
            >
              {Array.from({ length: dynamicSteps.value.length }, (_, i) => i + 1).map(step => (
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
      )}

      <div class={dynamicSteps.value.length > 0 ? "form-layout" : "form-layout-single"}>
        {/* Main Form */}
        <div class="form-main">
          {(() => {
            // If no workflow selected yet, show workflow selection
            if (dynamicSteps.value.length === 0) {
              return (
                <div class="card">
                  <div class="card-header">
                    <h3>Anforderungsart wählen</h3>
                    <p class="text-secondary">Wählen Sie zuerst die Art Ihrer Anforderung aus, um den passenden Workflow zu laden.</p>
                  </div>

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
                      <option value="GroßYanforderung">Großanforderung</option>
                      <option value="TIA-Anforderung">TIA-Anforderung</option>
                      <option value="Supportleistung">Supportleistung</option>
                      <option value="Betriebsauftrag">Betriebsauftrag</option>
                      <option value="SBBI-Lösung">SBBI-Lösung</option>
                      <option value="AWG-Release">AWG-Release</option>
                      <option value="AWS-Release">AWS-Release</option>
                    </select>
                  </div>

                  {isLoadingWorkflow.value && (
                    <div class="loading-workflow">
                      <div class="loading-spinner">⏳</div>
                      <p>Workflow wird geladen...</p>
                    </div>
                  )}

                  {workflowError.value && (
                    <div class="workflow-error">
                      <div class="error-icon">❌</div>
                      <p>{workflowError.value}</p>
                    </div>
                  )}

                  {formData.value.type && !isLoadingWorkflow.value && !workflowError.value && dynamicSteps.value.length === 0 && (
                    <div class="workflow-info">
                      <div class="info-icon">ℹ️</div>
                      <p>Workflow für "{formData.value.type}" wird vorbereitet...</p>
                    </div>
                  )}
                </div>
              );
            }

            const currentDynamicStep = dynamicSteps.value[currentStep.value - 1];
            if (!currentDynamicStep) return null;
            
            // First workflow step (contains basic info fields)
            if (currentDynamicStep.isFirstStep || currentDynamicStep.id === 'step-1') {
              return (
                <div class="card">
                  <div class="card-header">
                    <h3>{currentDynamicStep.name}</h3>
                    <p class="text-secondary">
                      Workflow: <strong>{formData.value.type}</strong> • 
                      {currentDynamicStep.fields.length > 0 || currentDynamicStep.widgets.length > 0 
                        ? `${currentDynamicStep.fields.length} Felder, ${currentDynamicStep.widgets.length} Widgets`
                        : 'Bitte geben Sie die Basisdaten für Ihre Anforderung ein.'}
                    </p>
                    {/* Debug Info */}
                    <div class="text-xs text-gray-500 mt-2">
                      Debug: Step ID: {currentDynamicStep.id}, Has Config: {formConfiguration.value ? 'Ja' : 'Nein'}
                      {formData.value.type === 'Kleinanforderung' && (
                        <button 
                          class="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded"
                          onClick$={async () => {
                            try {
                              const { seedKleinanforderungConfiguration } = await import('~/scripts/seed-kleinanforderung-config');
                              await seedKleinanforderungConfiguration();
                              console.log('✅ Manual seed completed');
                              // Reload page to pick up new config
                              if (typeof window !== 'undefined') {
                                window.location.reload();
                              }
                            } catch (error) {
                              console.error('❌ Manual seed failed:', error);
                            }
                          }}
                        >
                          🌱 Seed Now
                        </button>
                      )}
                    </div>
                    {Object.keys(dynamicFormValues.value).length > 0 && (
                      <div class="form-values-debug">
                        <small class="text-gray-500">
                          Erfasst: {Object.keys(dynamicFormValues.value).length} Werte
                        </small>
                      </div>
                    )}
                  </div>

                  {(currentDynamicStep.fields.length > 0 || currentDynamicStep.widgets.length > 0) ? (
                    <div class="space-y-4">
                      {renderDynamicFields(currentDynamicStep.fields, currentDynamicStep.widgets)}
                    </div>
                  ) : (
                    // Fallback wenn keine Konfiguration geladen wurde
                    <>
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
                    </>
                  )}
                </div>
              );
            }
            
            // Workflow Step (dynamic fields from Form Builder)
            if (currentDynamicStep.stepType === 'workflow') {
              return (
                <div class="card">
                  <div class="card-header">
                    <h3>{currentDynamicStep.name}</h3>
                    <p class="text-secondary">
                      Workflow-Schritt mit {currentDynamicStep.fields.length} Feldern und {currentDynamicStep.widgets.length} Widgets.
                    </p>
                    {Object.keys(dynamicFormValues.value).length > 0 && (
                      <div class="form-values-debug">
                        <small class="text-gray-500">
                          Erfasst: {Object.keys(dynamicFormValues.value).length} Werte
                        </small>
                      </div>
                    )}
                  </div>

                  {(currentDynamicStep.fields.length > 0 || currentDynamicStep.widgets.length > 0) ? (
                    <div class="space-y-4">
                      {renderDynamicFields(currentDynamicStep.fields, currentDynamicStep.widgets)}
                    </div>
                  ) : (
                    <div class="text-center py-8 text-gray-500">
                      <div class="text-4xl mb-3">📝</div>
                      <p class="font-medium">Noch keine Felder oder Widgets konfiguriert</p>
                      <p class="text-sm">Verwende den Widget Form Builder um Felder und Widgets für diesen Schritt hinzuzufügen.</p>
                    </div>
                  )}
                </div>
              );
            }
            
            // Last workflow step (show submit actions)
            if (currentStep.value === dynamicSteps.value.length) {
              return (
                <div class="card">
                  <div class="card-header">
                    <h3>{currentDynamicStep.name}</h3>
                    <p class="text-secondary">Letzter Schritt - Anforderung abschließen.</p>
                  </div>

                  {(currentDynamicStep.fields.length > 0 || currentDynamicStep.widgets.length > 0) ? (
                    <div class="space-y-4">
                      {renderDynamicFields(currentDynamicStep.fields, currentDynamicStep.widgets)}
                    </div>
                  ) : (
                    <div class="text-center py-8 text-gray-500">
                      <div class="text-4xl mb-3">📝</div>
                      <p class="font-medium">Noch keine Felder oder Widgets konfiguriert</p>
                      <p class="text-sm">Verwende den Widget Form Builder um Felder und Widgets für diesen Schritt hinzuzufügen.</p>
                    </div>
                  )}

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
              );
            }
            
            return null;
          })()}

          {/* Form Navigation - only show when workflow is selected */}
          {dynamicSteps.value.length > 0 && (
            <div class="form-navigation">
              <button 
                class="btn btn-secondary"
                onClick$={prevStep}
                disabled={currentStep.value === 1}
              >
                ← Zurück
              </button>
              
              <div class="form-nav-info">
                Schritt {currentStep.value} von {dynamicSteps.value.length}
              </div>
              
              {currentStep.value < dynamicSteps.value.length ? (
                <button 
                  class="btn btn-primary"
                  onClick$={nextStep}
                  disabled={!isStepValid(currentStep.value)}
                >
                  Weiter →
                </button>
              ) : null}
            </div>
          )}
        </div>

        {/* Enhanced Workflow Preview Sidebar - only show when workflow is selected */}
        {dynamicSteps.value.length > 0 && (
          <div class="workflow-sidebar">
            <div class="card">
              <div class="card-header">
                <h4>🔄 Workflow-Vorschau</h4>
                <p class="text-secondary text-sm">Für {formData.value.type}</p>
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
                  {workflowPreview.value.some(s => s.isParallel) && (
                    <div class="legend-item">
                      <div class="legend-icon parallel-icon">⚡</div>
                      <span>Parallel</span>
                    </div>
                  )}
                </div>
                
                <div class="workflow-steps">
                  {(() => {
                    // Group steps by parallel groups and render them appropriately
                    const groupedSteps: Array<WorkflowStep | WorkflowStep[]> = [];
                    const processedIndexes = new Set<number>();
                    
                    workflowPreview.value.forEach((step, index) => {
                      if (processedIndexes.has(index)) return;
                      
                      if (step.isParallel && step.parallelGroup) {
                        // Find all steps in this parallel group
                        const parallelSteps = workflowPreview.value.filter(s => 
                          s.parallelGroup === step.parallelGroup
                        );
                        
                        // Mark all parallel steps as processed
                        parallelSteps.forEach(parallelStep => {
                          const parallelIndex = workflowPreview.value.findIndex(s => s.id === parallelStep.id);
                          processedIndexes.add(parallelIndex);
                        });
                        
                        groupedSteps.push(parallelSteps);
                      } else {
                        // Regular single step
                        processedIndexes.add(index);
                        groupedSteps.push(step);
                      }
                    });
                    
                    return groupedSteps.map((stepOrGroup, groupIndex) => {
                      if (Array.isArray(stepOrGroup)) {
                        // Parallel group
                        return (
                          <div key={`group-${groupIndex}`} class="parallel-group">
                            <div class="parallel-group-header">
                              <span class="parallel-icon">⚡</span>
                              <span class="parallel-label">{stepOrGroup[0].parallelGroup}</span>
                              <span class="parallel-count">({stepOrGroup.length} parallel)</span>
                            </div>
                            <div class="parallel-steps">
                              {stepOrGroup.map((step) => {
                                const stepIndex = workflowPreview.value.findIndex(s => s.id === step.id);
                                return (
                                  <div key={step.id} class="parallel-step">
                                    {renderWorkflowStep(step, true, stepIndex)}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      } else {
                        // Single step
                        const step = stepOrGroup;
                        const stepIndex = workflowPreview.value.findIndex(s => s.id === step.id);
                        return renderWorkflowStep(step, false, stepIndex);
                      }
                    });
                  })()}
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
                {formData.value.type === 'GroßYanforderung' && (
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
        )}

      </div>

  <style>{`
        .form-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 2rem;
        }
        
        .form-layout-single {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }
        
        /* Workflow Selection States */
        .loading-workflow {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(59, 130, 246, 0.05);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 0.5rem;
          margin-top: 1rem;
        }
        
        .loading-spinner {
          font-size: 1.25rem;
          animation: spin 2s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .workflow-error {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 0.5rem;
          margin-top: 1rem;
        }
        
        .error-icon {
          font-size: 1.25rem;
        }
        
        .workflow-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(245, 158, 11, 0.05);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: 0.5rem;
          margin-top: 1rem;
        }
        
        .info-icon {
          font-size: 1.25rem;
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
        
        .parallel-icon {
          background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
          color: white;
          box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
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
        
        .workflow-step-simple {
          position: relative;
        }
        
        .workflow-connector-simple {
          position: absolute;
          left: 50%;
          top: -0.25rem;
          transform: translateX(-50%);
          width: 2px;
          height: 0.5rem;
          background: linear-gradient(180deg, var(--border-color) 0%, var(--primary-light) 100%);
        }
        
        .workflow-step-container-simple {
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
        
        /* Parallel Group Styles */
        .parallel-group {
          margin: 1rem 0;
          border: 2px dashed #f59e0b;
          border-radius: 0.75rem;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(249, 115, 22, 0.05) 100%);
          padding: 1rem;
        }
        
        .parallel-group-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(245, 158, 11, 0.2);
        }
        
        .parallel-group-header .parallel-icon {
          font-size: 1rem;
          color: #f59e0b;
        }
        
        .parallel-label {
          font-weight: 600;
          color: #92400e;
          font-size: 0.9rem;
        }
        
        .parallel-count {
          font-size: 0.75rem;
          color: #78716c;
          background: rgba(245, 158, 11, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
        }
        
        .parallel-steps {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .parallel-step {
          background: white;
          border-radius: 0.5rem;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }
        
        .workflow-step-bubble.parallel {
          border-color: #f59e0b;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%);
        }
        
        .step-duration {
          font-size: 0.65rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }
        
        .step-parallel-badge {
          font-size: 0.6rem;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          margin-top: 0.25rem;
          display: inline-block;
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
          gap: 1rem;
        }
        
        /* Responsive progress steps for mobile */
        @media (max-width: 768px) {
          .progress-steps {
            gap: 0.5rem;
          }
          
          .progress-step-label {
            font-size: 0.6rem !important;
          }
          
          .progress-step-number {
            width: 2rem !important;
            height: 2rem !important;
            font-size: 0.7rem !important;
          }
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

        .current-step-content {
          margin-bottom: 2rem;
        }

        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .workflow-step-form {
          padding: 1rem;
        }

        .workflow-step-info {
          font-size: 1rem;
          color: var(--primary-color);
          font-weight: 600;
          margin-bottom: 1.5rem;
          padding: 0.75rem 1rem;
          background: rgba(0, 72, 116, 0.1);
          border-radius: 0.5rem;
          border-left: 4px solid var(--primary-color);
        }

        .no-fields-message {
          text-align: center;
          padding: 2rem;
          background: var(--background-color);
          border-radius: 0.75rem;
          border: 2px dashed var(--border-color);
        }

        .no-fields-message p {
          margin: 0.5rem 0;
        }

        .field-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-top: 0.5rem;
          font-style: italic;
        }

        .required {
          color: #ef4444;
          margin-left: 0.25rem;
        }

        .form-nav-buttons {
          display: flex;
          gap: 1rem;
        }

        .priority-title {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .alert {
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid;
        }

        .alert-warning {
          background: #fef3c7;
          border-color: #f59e0b;
          color: #92400e;
        }

        .mb-6 {
          margin-bottom: 1.5rem;
        }

        .flex {
          display: flex;
        }

        .items-center {
          align-items: center;
        }

        .gap-3 {
          gap: 0.75rem;
        }

        .ml-auto {
          margin-left: auto;
        }

        /* Enhanced Widget Form Styles (like Form Builder) */
        .form-widget-container.modern-widget {
          background: white;
          border-radius: 1rem;
          border: 2px solid #e2e8f0;
          margin-bottom: 2rem;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
        }

        .form-widget-container.modern-widget:hover {
          border-color: #cbd5e1;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .form-widget-header {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          color: #334155;
          padding: 1.5rem 1.5rem 1rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .widget-header-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .widget-title-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .form-widget-title {
          font-size: 1.125rem;
          font-weight: 700;
          margin: 0;
          color: #1e293b;
        }

        .widget-icon {
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-widget-description {
          font-size: 0.875rem;
          margin: 0;
          color: #64748b;
          font-weight: 500;
        }

        .form-widget-fields {
          padding: 1.5rem;
        }

        .widget-fields-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
        }

        /* Budget Widget Special Layout */
        .budget-widget-layout {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .budget-columns-header {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .budget-column-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          text-align: center;
          justify-content: center;
        }

        .budget-column-label.an-column {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1e40af;
          border: 1px solid #93c5fd;
        }

        .budget-column-label.ag-column {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          color: #047857;
          border: 1px solid #86efac;
        }

        .column-icon {
          font-size: 1.125rem;
        }

        .budget-columns-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .budget-column {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .budget-field-row {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .budget-field-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .budget-field-input {
          padding: 0.625rem 0.875rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          background: white;
        }

        .budget-field-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Enhanced form inputs */
        .form-input.enhanced,
        .form-textarea.enhanced {
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          background: white;
        }

        .form-input.enhanced:focus,
        .form-textarea.enhanced:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-label.enhanced {
          font-weight: 600;
          font-size: 0.875rem;
          color: #374151;
          margin-bottom: 0.5rem;
          display: block;
        }

        .field-hint.enhanced {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 500;
        }

        .field-description.enhanced {
          font-size: 0.8125rem;
          color: #6b7280;
          margin-top: 0.375rem;
          font-style: italic;
        }

        .checkbox-label.enhanced {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          font-weight: 500;
          margin-top: 0.5rem;
          padding: 0.5rem;
          border-radius: 0.375rem;
          transition: background-color 0.2s ease;
        }

        .checkbox-label.enhanced:hover {
          background: #f8fafc;
        }

        .checkmark.enhanced {
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid #d1d5db;
          border-radius: 0.25rem;
          display: inline-block;
          position: relative;
          transition: all 0.2s ease;
        }

        .checkbox-label.enhanced input[type="checkbox"]:checked + .checkmark.enhanced {
          background: #3b82f6;
          border-color: #3b82f6;
        }

        .checkbox-label.enhanced input[type="checkbox"]:checked + .checkmark.enhanced::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 0.875rem;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .budget-columns-header,
          .budget-columns-content {
            grid-template-columns: 1fr;
          }
          
          .widget-fields-grid {
            grid-template-columns: 1fr;
          }
        }

        .form-group-half {
          grid-column: span 1;
        }

        .form-group-full {
          grid-column: span 2;
        }

        @media (max-width: 768px) {
          .form-group-full,
          .form-group-half {
            grid-column: span 1;
          }
          
          .form-widget-fields {
            grid-template-columns: 1fr;
          }
        }

        .user-search-field,
        .requirement-search-field {
          position: relative;
        }

        .field-hint {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 0.375rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          font-weight: 500;
          margin-top: 0.5rem;
        }

        .checkbox-label input[type="checkbox"] {
          width: 1.25rem;
          height: 1.25rem;
          accent-color: var(--primary-color);
        }

        .checkmark {
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid var(--border-color);
          border-radius: 0.25rem;
          display: inline-block;
          position: relative;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark {
          background: var(--primary-color);
          border-color: var(--primary-color);
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 0.875rem;
          font-weight: bold;
        }

        .space-y-4 > * + * {
          margin-top: 1rem;
        }

        /* Widget Styling */
        .widget-container {
          margin-bottom: 1.5rem;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .widget-header {
          background: #f8fafc;
          padding: 1rem;
          border-left: 4px solid #3b82f6;
          border-bottom: 1px solid #e2e8f0;
        }

        .widget-header h4 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .widget-header p {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0.25rem 0 0 0;
        }

        .widget-fields {
          background: white;
          padding: 1rem;
          border: 1px solid #e2e8f0;
          border-top: none;
        }

        .widget-fields .form-group:last-child {
          margin-bottom: 0;
        }

        /* Enhanced Widget Styling */
        .form-widget-container.modern-widget {
          margin-bottom: 1.5rem;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }

        .form-widget-header {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-bottom: 1px solid #e2e8f0;
        }

        .widget-header-content {
          padding: 1rem;
        }

        .widget-title-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .widget-icon {
          font-size: 1.25rem;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          background: rgba(255, 255, 255, 0.8);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .form-widget-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .form-widget-description {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0.5rem 0 0 0;
        }

        .form-widget-fields {
          background: white;
          padding: 1rem;
        }

        .widget-fields-grid {
          display: grid;
          gap: 1rem;
        }

        .form-group-half {
          grid-column: span 1;
        }

        .form-group-full {
          grid-column: span 2;
        }

        @media (min-width: 768px) {
          .widget-fields-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .form-label.enhanced {
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.375rem;
        }

        /* Budget Widget Specific Styling */
        .budget-widget-layout {
          display: grid;
          gap: 1rem;
        }

        .budget-columns-header {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .budget-column-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .budget-column-label.an-column {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1e40af;
          border: 1px solid #93c5fd;
        }

        .budget-column-label.ag-column {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          color: #166534;
          border: 1px solid #86efac;
        }

        .column-icon {
          font-size: 1rem;
        }

        .budget-columns-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .budget-column {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .budget-field-row {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .budget-field-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .budget-field-input {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }

        .budget-field-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
});