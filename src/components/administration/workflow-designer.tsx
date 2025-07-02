import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { MockWorkflowService, type WorkflowStep, type WorkflowConfiguration } from '~/services/mock-workflow-service';

// Workflow Step Types
const STEP_TYPES = {
TASK: 'task',
DECISION: 'decision',
APPROVAL: 'approval',
NOTIFICATION: 'notification',
WAIT: 'wait'
} as const;

const RESPONSIBLE_TYPES = {
AG: 'Auftraggeber',
AN: 'Auftragnehmer',
SYSTEM: 'System',
BOTH: 'Beide'
} as const;

interface StepTemplate {
id: string;
title: string;
type: keyof typeof STEP_TYPES;
icon: string;
color: string;
}

export const WorkflowDesigner = component$(() => {
const selectedWorkflowType = useSignal('Kleinanforderung');
const workflowSteps = useSignal<WorkflowStep[]>([]);
const selectedStep = useSignal<WorkflowStep | null>(null);
const draggedStep = useSignal<number | null>(null);
const dragOverIndex = useSignal<number | null>(null);
const isLoading = useSignal(false);
const isSaving = useSignal(false);
const currentConfig = useSignal<WorkflowConfiguration | null>(null);

const workflowTypes = [
'Kleinanforderung',
'Großanforderung',
'TIA-Anforderung',
'Supportleistung',
'Betriebsauftrag',
'SBBI-Lösung',
'AWG-Release',
'AWS-Release'
];

// Available step templates
const stepTemplates: StepTemplate[] = [
{
id: 'template-task',
title: 'Aufgabe',
type: 'TASK',
icon: '📋',
color: 'rgb(0, 158, 227)'
},
{
id: 'template-approval',
title: 'Genehmigung',
type: 'APPROVAL',
icon: '✅',
color: '#10b981'
},
{
id: 'template-decision',
title: 'Entscheidung',
type: 'DECISION',
icon: '🔀',
color: '#f59e0b'
},
{
id: 'template-notification',
title: 'Benachrichtigung',
type: 'NOTIFICATION',
icon: '📧',
color: '#8b5cf6'
},
{
id: 'template-wait',
title: 'Wartezeit',
type: 'WAIT',
icon: '⏳',
color: '#64748b'
}
];

const loadWorkflow = $(async (workflowType: string) => {
isLoading.value = true;
try {
const config = await MockWorkflowService.getWorkflowByType(workflowType);
if (config) {
currentConfig.value = config;
workflowSteps.value = [...config.steps];
} else {
// Create new empty workflow
const newConfig = await MockWorkflowService.createWorkflowConfiguration(
workflowType,
`Workflow für ${workflowType}`
);
currentConfig.value = newConfig;
workflowSteps.value = [];
}
selectedStep.value = null;
} catch (error) {
console.error('Error loading workflow:', error);
alert('Fehler beim Laden des Workflows');
} finally {
isLoading.value = false;
}
});

// Drag and Drop handlers
const handleDragStart = $((stepIndex: number) => {
draggedStep.value = stepIndex;
});

const handleDragOver = $((index: number) => {
dragOverIndex.value = index;
});

const handleDragLeave = $(() => {
dragOverIndex.value = null;
});

const handleDrop = $((dropIndex: number) => {
if (draggedStep.value === null) return;


const newSteps = [...workflowSteps.value];
const draggedStepData = newSteps[draggedStep.value];

// Remove dragged step
newSteps.splice(draggedStep.value, 1);

// Insert at new position
const finalDropIndex = draggedStep.value < dropIndex ? dropIndex - 1 : dropIndex;
newSteps.splice(finalDropIndex, 0, draggedStepData);

// Update order
newSteps.forEach((step, index) => {
  step.order = index + 1;
});

workflowSteps.value = newSteps;
draggedStep.value = null;
dragOverIndex.value = null;


});

const addNewStep = $((template: StepTemplate) => {
const newStep: WorkflowStep = {
id: `step-${Date.now()}`,
title: `Neue ${template.title}`,
type: template.type as any,
responsible: 'AN' as any,
description: '',
estimatedDays: 1,
required: true,
conditions: [],
order: workflowSteps.value.length + 1
};


workflowSteps.value = [...workflowSteps.value, newStep];
selectedStep.value = newStep;


});

const updateStep = $((stepId: string, updates: Partial<WorkflowStep>) => {
workflowSteps.value = workflowSteps.value.map(step =>
step.id === stepId ? { ...step, ...updates } : step
);


if (selectedStep.value?.id === stepId) {
  selectedStep.value = { ...selectedStep.value, ...updates };
}


});

const deleteStep = $((stepId: string) => {
workflowSteps.value = workflowSteps.value.filter(step => step.id !== stepId);
// Reorder remaining steps
workflowSteps.value.forEach((step, index) => {
step.order = index + 1;
});


if (selectedStep.value?.id === stepId) {
  selectedStep.value = null;
}


});

const getStepIcon = (type: keyof typeof STEP_TYPES) => {
const template = stepTemplates.find(t => t.type === type);
return template?.icon || '📋';
};

const getStepColor = (type: keyof typeof STEP_TYPES) => {
const template = stepTemplates.find(t => t.type === type);
return template?.color || 'rgb(0, 158, 227)';
};

const saveWorkflow = $(async () => {
if (!currentConfig.value) return;


// Load workflow when component mounts or type changes
useTask$(async ({ track }) => {
track(() => selectedWorkflowType.value);
await loadWorkflow(selectedWorkflowType.value);
});





isSaving.value = true;
try {
  const configToSave: WorkflowConfiguration = {
    ...currentConfig.value,
    steps: workflowSteps.value
  };
  
  const savedConfig = await MockWorkflowService.saveWorkflowConfiguration(configToSave);
  currentConfig.value = savedConfig;
  
  console.log("Workflow gespeichert:", savedConfig);
  alert(`Workflow "${selectedWorkflowType.value}" erfolgreich gespeichert! 🎉`);
} catch (error) {
  console.error("Error saving workflow:", error);
  alert("Fehler beim Speichern des Workflows");
} finally {
  isSaving.value = false;
}


});

const duplicateStep = $((step: WorkflowStep) => {
const stepCopy: WorkflowStep = {
...step,
id: `step-${Date.now()}`,
title: `${step.title} (Kopie)`,
order: workflowSteps.value.length + 1
};
workflowSteps.value = [...workflowSteps.value, stepCopy];
selectedStep.value = stepCopy;
});

const resetWorkflow = $(async () => {
if (confirm('Workflow zurücksetzen? Alle Änderungen gehen verloren!')) {
try {
const resetConfig = await MockWorkflowService.resetWorkflowToDefault(selectedWorkflowType.value);
currentConfig.value = resetConfig;
workflowSteps.value = [...resetConfig.steps];
selectedStep.value = null;
alert('Workflow wurde zurückgesetzt!');
} catch (error) {
console.error('Error resetting workflow:', error);
alert('Fehler beim Zurücksetzen des Workflows');
}
}
});

const validateWorkflow = $(async () => {
if (!currentConfig.value) return;


try {
  const validation = await MockWorkflowService.validateWorkflow({
    ...currentConfig.value,
    steps: workflowSteps.value
  });
  
  if (validation.isValid) {
    alert("✅ Workflow ist valid!");
  } else {
    alert(`❌ Workflow Validierungsfehler:\n\n${validation.errors.join("\n")}`);
  }
} catch (error) {
  console.error("Error validating workflow:", error);
  alert("Fehler bei der Validierung");
}


});

const exportWorkflow = $(async () => {
if (!currentConfig.value) return;


try {
  const exportData = {
    ...currentConfig.value,
    steps: workflowSteps.value,
    exportedAt: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `workflow-${selectedWorkflowType.value}-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
} catch (error) {
  console.error("Error exporting workflow:", error);
  alert("Fehler beim Exportieren");
}


});

const importWorkflow = $(async () => {
const input = document.createElement('input');
input.type = 'file';
input.accept = '.json';


input.onchange = async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  
  try {
    const imported = await MockWorkflowService.importWorkflow(file);
    currentConfig.value = imported;
    workflowSteps.value = [...imported.steps];
    selectedStep.value = null;
    alert(`Workflow "${imported.name}" erfolgreich importiert!`);
  } catch (error) {
    console.error("Error importing workflow:", error);
    alert("Fehler beim Importieren der Datei");
  }
};

input.click();


});

return (
<div class="min-h-screen bg-white">
{/* Header */}
<div class="card mb-6">
<div class="flex items-center justify-between">
<div>
<h1 class="text-3xl font-bold text-gray-900">Workflow Designer</h1>
<p class="text-gray-600 mt-1">Gestalte und konfiguriere Workflows für verschiedene Anforderungsarten</p>
{currentConfig.value && (
<p class="text-sm text-gray-500 mt-1">
Version {currentConfig.value.version} • Zuletzt geändert: {new Date(currentConfig.value.modifiedAt).toLocaleDateString('de-DE')}
</p>
)}
</div>
<div class="flex gap-3">
<button
class='btn btn-secondary'
onClick$={validateWorkflow}
disabled={isLoading.value}
>
✅ Validieren
</button>
<button
class='btn btn-secondary'
onClick$={resetWorkflow}
disabled={isLoading.value}
>
Zurücksetzen
</button>
<button
class='btn btn-primary'
onClick$={saveWorkflow}
disabled={isLoading.value || isSaving.value}
>
{isSaving.value ? 'Speichere...' : 'Speichern'}
</button>
</div>
</div>
</div>


  {isLoading.value ? (
    <div class="card text-center py-12">
      <div class="text-4xl mb-4">⏳</div>
      <p class="text-lg font-medium">Workflow wird geladen...</p>
    </div>
  ) : (
    <div class="grid grid-cols-12 gap-6">
      {/* Left Sidebar - Step Templates */}
      <div class="col-span-3">
        <div class="card mb-4">
          <h3 class="text-lg font-semibold mb-4">Workflow-Typ</h3>
          <select 
            class="form-input"
            value={selectedWorkflowType.value}
            onChange$={(e) => {
              selectedWorkflowType.value = (e.target as HTMLSelectElement).value;
            }}
          >
            {workflowTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div class="card mb-4">
          <h3 class="text-lg font-semibold mb-4">Schritt-Vorlagen</h3>
          <div class="space-y-2">
            {stepTemplates.map((template) => (
              <button
                key={template.id}
                class="w-full flex items-center gap-3 p-3 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
                onClick$={() => addNewStep(template)}
              >
                <div 
                  class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                  style={`background-color: ${template.color}`}
                >
                  {template.icon}
                </div>
                <span class="font-medium text-gray-700 group-hover:text-blue-700">
                  {template.title}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        <div class="card">
          <h4 class="text-lg font-semibold mb-4">Workflow-Aktionen</h4>
          <div class="space-y-2">
            <button 
              class="btn btn-secondary w-full text-sm"
              onClick$={() => loadWorkflow(selectedWorkflowType.value)}
            >
              🔄 Neu laden
            </button>
            <button 
              class="btn btn-secondary w-full text-sm"
              onClick$={exportWorkflow}
            >
              📥 Exportieren
            </button>
            <button 
              class="btn btn-secondary w-full text-sm"
              onClick$={importWorkflow}
            >
              📤 Importieren
            </button>
          </div>
        </div>
      </div>

      {/* Center - Workflow Canvas */}
      <div class="col-span-6">
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Workflow: {selectedWorkflowType.value}</h3>
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-500">{workflowSteps.value.length} Schritte</span>
              <span class="text-sm text-gray-500">
                ~{workflowSteps.value.reduce((sum, step) => sum + step.estimatedDays, 0)} Tage
              </span>
            </div>
          </div>

          <div class="min-h-96 space-y-3 p-4 rounded-lg border-2 border-dashed border-gray-200">
            {workflowSteps.value.map((step, index) => (
              <div key={step.id} class="relative">
                <div 
                  draggable
                  onDragStart$={() => handleDragStart(index)}
                  onDragOver$={(e) => {
                    e.preventDefault();
                    handleDragOver(index);
                  }}
                  onDragLeave$={handleDragLeave}
                  onDrop$={(e) => {
                    e.preventDefault();
                    handleDrop(index);
                  }}
                  class={`
                    group p-4 bg-white border rounded-lg cursor-move transition-all hover:shadow-md
                    ${selectedStep.value?.id === step.id ? "border-blue-500 shadow-lg" : "border-gray-200 hover:border-gray-300"}
                    ${dragOverIndex.value === index ? "border-blue-400 bg-blue-50" : ""}
                    ${draggedStep.value === index ? "opacity-50" : ""}
                  `}
                  onClick$={() => selectedStep.value = step}
                >
                  <div class="flex items-center gap-3">
                    {/* Drag Handle */}
                    <div class="text-gray-400 hover:text-gray-600 cursor-grab">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                      </svg>
                    </div>

                    {/* Step Number */}
                    <div class="w-8 h-8 text-white rounded-full flex items-center justify-center font-bold text-sm" style="background-color: rgb(0, 72, 116);">
                      {index + 1}
                    </div>

                    {/* Step Icon */}
                    <div 
                      class="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={`background-color: ${getStepColor(step.type as any)}`}
                    >
                      {getStepIcon(step.type as any)}
                    </div>

                    {/* Step Info */}
                    <div class="flex-1">
                      <div class="flex items-center gap-2">
                        <h4 class="font-medium text-gray-900">{step.title}</h4>
                        {step.required && (
                          <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            Pflicht
                          </span>
                        )}
                      </div>
                      <div class="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{RESPONSIBLE_TYPES[step.responsible as keyof typeof RESPONSIBLE_TYPES]}</span>
                        <span>~{step.estimatedDays} Tag{step.estimatedDays !== 1 ? "e" : ""}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button 
                        class="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        onClick$={(e) => {
                          e.stopPropagation();
                          selectedStep.value = step;
                        }}
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        class="p-1 text-red-600 hover:bg-red-100 rounded"
                        onClick$={(e) => {
                          e.stopPropagation();
                          deleteStep(step.id);
                        }}
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Arrow to next step */}
                  {index < workflowSteps.value.length - 1 && (
                    <div class="flex justify-center mt-4">
                      <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {workflowSteps.value.length === 0 && (
              <div class="text-center py-12 text-gray-500">
                <div class="text-4xl mb-4">🚀</div>
                <p class="text-lg font-medium">Workflow ist leer</p>
                <p class="text-sm">Klicke auf eine Vorlage links, um einen Schritt hinzuzufügen</p>
              </div>
            )}
          </div>

          {/* Quick Add Zone */}
          <div class="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <p class="text-gray-500 text-sm mb-2">Schnell hinzufügen:</p>
            <div class="flex gap-2 justify-center flex-wrap">
              {stepTemplates.slice(0, 3).map((template) => (
                <button
                  key={template.id}
                  class="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  onClick$={() => addNewStep(template)}
                >
                  {template.icon} {template.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Step Properties */}
      <div class="col-span-3">
        {selectedStep.value ? (
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold">Schritt bearbeiten</h3>
              <button 
                class="text-gray-400 hover:text-gray-600"
                onClick$={() => selectedStep.value = null}
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="space-y-4">
              {/* Title */}
              <div class="form-group">
                <label class="form-label">Titel</label>
                <input
                  type="text"
                  class="form-input"
                  value={selectedStep.value.title}
                  onInput$={(e) => updateStep(selectedStep.value!.id, { title: (e.target as HTMLInputElement).value })}
                />
              </div>

              {/* Type */}
              <div class="form-group">
                <label class="form-label">Typ</label>
                <select
                  class="form-input"
                  value={selectedStep.value.type}
                  onChange$={(e) => updateStep(selectedStep.value!.id, { type: (e.target as HTMLSelectElement).value as any })}
                >
                  {Object.entries(STEP_TYPES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {stepTemplates.find(t => t.type === key)?.title || value}
                    </option>
                  ))}
                </select>
              </div>

              {/* Responsible */}
              <div class="form-group">
                <label class="form-label">Verantwortlich</label>
                <select
                  class="form-input"
                  value={selectedStep.value.responsible}
                  onChange$={(e) => updateStep(selectedStep.value!.id, { responsible: (e.target as HTMLSelectElement).value as any })}
                >
                  {Object.entries(RESPONSIBLE_TYPES).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div class="form-group">
                <label class="form-label">Beschreibung</label>
                <textarea
                  class="form-input"
                  rows={3}
                  value={selectedStep.value.description}
                  onInput$={(e) => updateStep(selectedStep.value!.id, { description: (e.target as HTMLTextAreaElement).value })}
                  placeholder="Beschreibung des Schritts..."
                />
              </div>

              {/* Estimated Days */}
              <div class="form-group">
                <label class="form-label">Geschätzte Dauer (Tage)</label>
                <input
                  type="number"
                  min="1"
                  class="form-input"
                  value={selectedStep.value.estimatedDays}
                  onInput$={(e) => updateStep(selectedStep.value!.id, { estimatedDays: parseInt((e.target as HTMLInputElement).value) })}
                />
              </div>

              {/* Required */}
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  class="w-4 h-4"
                  checked={selectedStep.value.required}
                  onChange$={(e) => updateStep(selectedStep.value!.id, { required: (e.target as HTMLInputElement).checked })}
                />
                <label for="required" class="text-sm font-medium text-gray-700">
                  Pflichtschritt
                </label>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t space-y-2">
              <button 
                class="btn btn-primary w-full"
                onClick$={() => duplicateStep(selectedStep.value!)}
              >
                Schritt duplizieren
              </button>
              <button 
                class="btn w-full text-white"
                style="background-color: #ef4444;"
                onClick$={() => deleteStep(selectedStep.value!.id)}
              >
                Schritt löschen
              </button>
            </div>
          </div>
        ) : (
          <div class="card text-center py-8">
            <div class="text-4xl mb-4">⚙️</div>
            <h3 class="font-medium text-gray-900 mb-2">Keinen Schritt ausgewählt</h3>
            <p class="text-sm text-gray-500">
              Klicke auf einen Schritt im Workflow, um ihn zu bearbeiten
            </p>
          </div>
        )}
      </div>
    </div>
  )}
</div>


);
});
