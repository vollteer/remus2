import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { FormBuilderAPI } from '~/services/api/forms-api-service';
import type { FormField, FormWidget, FormConfiguration } from '~/services/api/forms-api-service';
import { seedKleinanforderungConfiguration } from '~/scripts/seed-kleinanforderung-config';

// Simplified Widget-Enhanced Types
type FieldType = 'text' | 'textarea' | 'select' | 'date' | 'checkbox' | 'currency' | 'userSearch' | 'requirementSearch';

type WidgetType = 'terminGroup' | 'budgetGroup' | 'zustaendigkeitGroup' | 'pruefungGroup' | 'customGroup';

interface FieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  order: number;
}

// Field Templates
const fieldTemplates = [
  {
    id: 'text',
    type: 'text' as const,
    icon: '📝',
    title: 'Text',
    color: '#3b82f6',
    category: 'basic'
  },
  {
    id: 'textarea',
    type: 'textarea' as const,
    icon: '📄',
    title: 'Textarea',
    color: '#6366f1',
    category: 'basic'
  },
  {
    id: 'select',
    type: 'select' as const,
    icon: '📋',
    title: 'Dropdown',
    color: '#ef4444',
    category: 'basic'
  },
  {
    id: 'date',
    type: 'date' as const,
    icon: '📅',
    title: 'Datum',
    color: '#8b5cf6',
    category: 'basic'
  },
  {
    id: 'checkbox',
    type: 'checkbox' as const,
    icon: '☑️',
    title: 'Checkbox',
    color: '#059669',
    category: 'basic'
  },
  {
    id: 'currency',
    type: 'currency' as const,
    icon: '💰',
    title: 'Währung',
    color: '#10b981',
    category: 'financial'
  },
  {
    id: 'userSearch',
    type: 'userSearch' as const,
    icon: '👤',
    title: 'User-Suche',
    color: '#0ea5e9',
    category: 'workflow'
  },
  {
    id: 'requirementSearch',
    type: 'requirementSearch' as const,
    icon: '🔍',
    title: 'Anforderungs-Suche',
    color: '#7c3aed',
    category: 'workflow'
  }
];

// Widget Templates
const widgetTemplates = [
  {
    id: 'terminGroup',
    type: 'terminGroup' as const,
    icon: '📅',
    title: 'Termine Widget',
    color: '#8b5cf6',
    description: 'Terminverwaltung mit AN/AG Spalten'
  },
  {
    id: 'budgetGroup',
    type: 'budgetGroup' as const,
    icon: '💰',
    title: 'Budget Widget',
    color: '#10b981',
    description: 'Budget-Planung mit Vorhaben'
  },
  {
    id: 'zustaendigkeitGroup',
    type: 'zustaendigkeitGroup' as const,
    icon: '👥',
    title: 'Zuständigkeiten',
    color: '#3b82f6',
    description: 'Rollen und Verantwortlichkeiten'
  },
  {
    id: 'pruefungGroup',
    type: 'pruefungGroup' as const,
    icon: '✅',
    title: 'Prüfung',
    color: '#f59e0b',
    description: 'Fachliche Einschätzungen'
  },
  {
    id: 'customGroup',
    type: 'customGroup' as const,
    icon: '📦',
    title: 'Eigene Gruppe',
    color: '#6b7280',
    description: 'Benutzerdefinierte Gruppe'
  }
];

const requirementTypes = [
  'Kleinanforderung',
  'Großanforderung',
  'TIA-Anforderung',
  'Supportleistung'
];

const FIELD_WIDTHS = {
  'full': 'Vollbreite',
  'half': 'Halbe Breite'
} as const;

// Mock Service - Vollständige Kleinanforderung Implementation
const mockLoadFormConfiguration = async (requirementType: string): Promise<FormConfiguration> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  if (requirementType === 'Kleinanforderung') {
    return {
      id: 'form-kleinanforderung-001',
      name: 'Kleinanforderung Formular (Vollständig)',
      requirementType: 'Kleinanforderung',
      version: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      sections: [
        {
          id: 'section-anforderung-erfassen',
          title: 'Anforderung erfassen',
          description: 'Grundlegende Informationen zur Anforderung',
          collapsible: false,
          collapsed: false,
          order: 1
        },
        {
          id: 'section-zustaendigkeiten',
          title: 'Zuständigkeiten',
          description: 'Verantwortlichkeiten und Rollen',
          collapsible: true,
          collapsed: false,
          order: 2
        },
        {
          id: 'section-zusatzinformationen',
          title: 'Zusatzinformationen',
          description: 'Kategorisierung und Priorität',
          collapsible: true,
          collapsed: false,
          order: 3
        },
        {
          id: 'section-bezuege',
          title: 'Bezüge zu anderen REMUS-Anforderungen',
          description: 'Verknüpfungen und Abhängigkeiten',
          collapsible: true,
          collapsed: false,
          order: 4
        },
        {
          id: 'section-budget-termine',
          title: 'Budget und Termine',
          description: 'Finanzielle und zeitliche Planung',
          collapsible: true,
          collapsed: false,
          order: 5
        },
        {
          id: 'section-pruefung',
          title: 'Prüfung fachliche Einschätzung',
          description: 'Bewertungen und Einschätzungen',
          collapsible: true,
          collapsed: false,
          order: 6
        }
      ],
      fields: [
        // Sektion: Anforderung erfassen
        {
          id: 'field-anforderungsart',
          type: 'select',
          name: 'anforderungsart',
          label: 'Anforderungsart',
          placeholder: 'Bitte wählen...',
          required: true,
          width: 'half',
          section: 'section-anforderung-erfassen',
          order: 1,
          options: [
            { value: 'kleinanforderung', label: 'Kleinanforderung' },
            { value: 'grossanforderung', label: 'Großanforderung' },
            { value: 'tia-anforderung', label: 'TIA-Anforderung' },
            { value: 'supportleistung', label: 'Supportleistung' }
          ]
        },
        {
          id: 'field-realisierungsobjekt',
          type: 'select',
          name: 'typ_realisierungsobjekt',
          label: 'Typ des Realisierungsobjekt',
          placeholder: 'Bitte wählen...',
          required: true,
          width: 'half',
          section: 'section-anforderung-erfassen',
          order: 2,
          options: [
            { value: 'anwendung', label: 'Anwendung' },
            { value: 'komponente', label: 'Komponente' },
            { value: 'infrastruktur', label: 'Infrastruktur' },
            { value: 'service', label: 'Service' }
          ]
        },
        {
          id: 'field-erstellungsdatum',
          type: 'date',
          name: 'erstellungsdatum',
          label: 'Erstellungsdatum',
          required: true,
          width: 'half',
          section: 'section-anforderung-erfassen',
          order: 3
        },
        {
          id: 'field-anwendungsbetreuer',
          type: 'userSearch',
          name: 'anwendungsbetreuer',
          label: 'Anwendungsbetreuer',
          placeholder: 'User in der Gruppe "Anwendungsbetreuer" suchen...',
          required: false,
          width: 'half',
          section: 'section-anforderung-erfassen',
          order: 4
        },
        {
          id: 'field-it-systemverantwortlicher',
          type: 'userSearch',
          name: 'it_systemverantwortlicher',
          label: 'IT-Systemverantwortlicher',
          placeholder: 'User in der Gruppe "IT-Systemverantwortliche" suchen...',
          required: false,
          width: 'half',
          section: 'section-anforderung-erfassen',
          order: 5
        },
        {
          id: 'field-kurzbezeichnung',
          type: 'text',
          name: 'kurzbezeichnung',
          label: 'Kurzbezeichnung',
          placeholder: 'Kurze prägnante Beschreibung der Anforderung...',
          required: true,
          width: 'full',
          section: 'section-anforderung-erfassen',
          order: 6
        },
        {
          id: 'field-ausgangssituation',
          type: 'textarea',
          name: 'ausgangssituation',
          label: 'Ausgangssituation',
          placeholder: 'Beschreibung der aktuellen Situation und des Problems...',
          required: false,
          width: 'full',
          section: 'section-anforderung-erfassen',
          order: 7
        },
        {
          id: 'field-ziele',
          type: 'textarea',
          name: 'ziele',
          label: 'Ziele',
          placeholder: 'Beschreibung der gewünschten Ziele und Ergebnisse...',
          required: false,
          width: 'full',
          section: 'section-anforderung-erfassen',
          order: 8
        },
        
        // Sektion: Zusatzinformationen - einzelne Felder
        {
          id: 'field-anforderungskategorie',
          type: 'select',
          name: 'anforderungskategorie',
          label: 'Anforderungskategorie',
          placeholder: 'Bitte wählen...',
          required: false,
          width: 'half',
          section: 'section-zusatzinformationen',
          order: 1,
          options: [
            { value: 'neuentwicklung', label: 'Neuentwicklung' },
            { value: 'erweiterung', label: 'Erweiterung' },
            { value: 'bugfix', label: 'Bugfix' },
            { value: 'wartung', label: 'Wartung' },
            { value: 'migration', label: 'Migration' }
          ]
        },
        {
          id: 'field-prioritaet',
          type: 'select',
          name: 'prioritaet',
          label: 'Priorität',
          placeholder: 'Bitte wählen...',
          required: false,
          width: 'half',
          section: 'section-zusatzinformationen',
          order: 2,
          options: [
            { value: 'niedrig', label: '1 - Niedrig' },
            { value: 'mittel', label: '2 - Mittel' },
            { value: 'hoch', label: '3 - Hoch' },
            { value: 'kritisch', label: '4 - Kritisch' }
          ]
        },

        // Sektion: Bezüge - einzelne Felder
        {
          id: 'field-fachlicher-bezug',
          type: 'requirementSearch',
          name: 'fachlicher_bezug_anfonr',
          label: 'Fachlicher Bezug zu Anfonr',
          placeholder: 'Andere Anforderung suchen...',
          required: false,
          width: 'full',
          section: 'section-bezuege',
          order: 1
        },
        {
          id: 'field-aws-release-bezug',
          type: 'requirementSearch',
          name: 'aws_release_bezug',
          label: 'AWS-Release-Bezug',
          placeholder: 'AWS-Release suchen...',
          required: false,
          width: 'half',
          section: 'section-bezuege',
          order: 2
        },
        {
          id: 'field-release-bezeichnung',
          type: 'text',
          name: 'release_bezeichnung',
          label: 'Release-Bezeichnung',
          placeholder: 'Release-Bezeichnung eingeben...',
          required: false,
          width: 'half',
          section: 'section-bezuege',
          order: 3
        }
      ],
      widgets: [
        // Widget: Zuständigkeiten (7 User-Felder)
        {
          id: 'widget-zustaendigkeiten',
          type: 'zustaendigkeitGroup',
          name: 'zustaendigkeiten_gruppe',
          title: 'Zuständigkeiten',
          description: 'Erfasser, Verantwortliche und weitere Rollen',
          section: 'section-zustaendigkeiten',
          order: 1,
          collapsible: true,
          collapsed: false,
          fields: [
            {
              id: 'widget-field-erfasser',
              type: 'userSearch',
              name: 'erfasser',
              label: 'Erfasser',
              placeholder: 'User suchen (aktuell eingeloggter User)...',
              required: true,
              width: 'half',
              order: 1,
              widget: 'widget-zustaendigkeiten'
            },
            {
              id: 'widget-field-anforderungsverantwortlicher',
              type: 'userSearch',
              name: 'anforderungsverantwortlicher',
              label: 'Anforderungsverantwortlicher',
              placeholder: 'Verantwortlichen User suchen...',
              required: false,
              width: 'half',
              order: 2,
              widget: 'widget-zustaendigkeiten'
            },
            {
              id: 'widget-field-anforderungsgenehmiger',
              type: 'userSearch',
              name: 'anforderungsgenehmiger',
              label: 'Anforderungsgenehmiger',
              placeholder: 'Genehmiger suchen...',
              required: false,
              width: 'half',
              order: 3,
              widget: 'widget-zustaendigkeiten'
            },
            {
              id: 'widget-field-it-koordinator',
              type: 'userSearch',
              name: 'it_koordinator',
              label: 'IT-Koordinator',
              placeholder: 'IT-Koordinator suchen...',
              required: false,
              width: 'half',
              order: 4,
              widget: 'widget-zustaendigkeiten'
            },
            {
              id: 'widget-field-solution-manager',
              type: 'userSearch',
              name: 'solution_manager',
              label: 'Solution Manager',
              placeholder: 'Solution Manager suchen...',
              required: false,
              width: 'half',
              order: 5,
              widget: 'widget-zustaendigkeiten'
            },
            {
              id: 'widget-field-it-anforderungsmanager',
              type: 'userSearch',
              name: 'it_anforderungsmanager',
              label: 'IT Anforderungsmanager',
              placeholder: 'IT Anforderungsmanager suchen...',
              required: false,
              width: 'half',
              order: 6,
              widget: 'widget-zustaendigkeiten'
            },
            {
              id: 'widget-field-release-manager',
              type: 'userSearch',
              name: 'release_manager',
              label: 'Release Manager',
              placeholder: 'Release Manager suchen...',
              required: false,
              width: 'half',
              order: 7,
              widget: 'widget-zustaendigkeiten'
            }
          ]
        },

        // Widget: Budget und Termine (mit AN/AG Spalten)
        {
          id: 'widget-budget-termine',
          type: 'budgetGroup',
          name: 'budget_termine_gruppe',
          title: 'Budget und Termine',
          description: 'Termine und Budget aufgeteilt in AN und AG, sowie Vorhaben-Zuordnung',
          section: 'section-budget-termine',
          order: 1,
          collapsible: true,
          collapsed: false,
          fields: [
            // Termine AN/AG
            {
              id: 'widget-field-starttermin-an',
              type: 'date',
              name: 'starttermin_an',
              label: 'Starttermin (AN)',
              required: false,
              width: 'half',
              order: 1,
              widget: 'widget-budget-termine'
            },
            {
              id: 'widget-field-starttermin-ag',
              type: 'date',
              name: 'starttermin_ag',
              label: 'Starttermin (AG)',
              required: false,
              width: 'half',
              order: 2,
              widget: 'widget-budget-termine'
            },
            {
              id: 'widget-field-technische-integration-an',
              type: 'date',
              name: 'technische_integration_an',
              label: 'Technische Integration (AN)',
              required: false,
              width: 'half',
              order: 3,
              widget: 'widget-budget-termine'
            },
            {
              id: 'widget-field-technische-integration-ag',
              type: 'date',
              name: 'technische_integration_ag',
              label: 'Technische Integration (AG)',
              required: false,
              width: 'half',
              order: 4,
              widget: 'widget-budget-termine'
            },
            {
              id: 'widget-field-migration-an',
              type: 'date',
              name: 'migration_an',
              label: 'Migration (AN)',
              required: false,
              width: 'half',
              order: 5,
              widget: 'widget-budget-termine'
            },
            {
              id: 'widget-field-migration-ag',
              type: 'date',
              name: 'migration_ag',
              label: 'Migration (AG)',
              required: false,
              width: 'half',
              order: 6,
              widget: 'widget-budget-termine'
            },
            {
              id: 'widget-field-testbeginn-an',
              type: 'date',
              name: 'testbeginn_an',
              label: 'Testbeginn (AN)',
              required: false,
              width: 'half',
              order: 7,
              widget: 'widget-budget-termine'
            },
            {
              id: 'widget-field-testbeginn-ag',
              type: 'date',
              name: 'testbeginn_ag',
              label: 'Testbeginn (AG)',
              required: false,
              width: 'half',
              order: 8,
              widget: 'widget-budget-termine'
            },
            {
              id: 'widget-field-e2e-test-an',
              type: 'date',
              name: 'e2e_test_an',
              label: 'E2E-Test (AN)',
              required: false,
              width: 'half',
              order: 9,
              widget: 'widget-budget-termine'
            },
            {
              id: 'widget-field-e2e-test-ag',
              type: 'date',
              name: 'e2e_test_ag',
              label: 'E2E-Test (AG)',
              required: false,
              width: 'half',
              order: 10,
              widget: 'widget-budget-termine'
            },
            {
              id: 'widget-field-go-live-an',
              type: 'date',
              name: 'go_live_an',
              label: 'Go-Live (AN)',
              required: false,
              width: 'half',
              order: 11,
              widget: 'widget-budget-termine'
            },
            {
              id: 'widget-field-go-live-ag',
              type: 'date',
              name: 'go_live_ag',
              label: 'Go-Live (AG)',
              required: false,
              width: 'half',
              order: 12,
              widget: 'widget-budget-termine'
            },
            
            // Budget
            {
              id: 'widget-field-budget-fachbereich-an',
              type: 'currency',
              name: 'budget_fachbereich_an',
              label: 'Budget Fachbereich (AN)',
              placeholder: '0,00 €',
              required: false,
              width: 'half',
              order: 13,
              widget: 'widget-budget-termine'
            },
            {
              id: 'widget-field-budget-fachbereich-ag',
              type: 'currency',
              name: 'budget_fachbereich_ag',
              label: 'Budget Fachbereich (AG)',
              placeholder: '0,00 €',
              required: false,
              width: 'half',
              order: 14,
              widget: 'widget-budget-termine'
            },
            
            // Vorhaben
            {
              id: 'widget-field-vorhaben',
              type: 'requirementSearch',
              name: 'vorhaben',
              label: 'Vorhaben',
              placeholder: 'Vorhaben suchen (später in Datenbank implementiert)...',
              required: false,
              width: 'full',
              order: 15,
              widget: 'widget-budget-termine'
            }
          ]
        },

        // Widget: Prüfung fachliche Einschätzung (2 Checkboxen)
        {
          id: 'widget-pruefung-einschaetzung',
          type: 'pruefungGroup',
          name: 'pruefung_fachliche_einschaetzung',
          title: 'Prüfung fachliche Einschätzung',
          description: 'Bewertungen und Checkboxen für fachliche Einschätzungen',
          section: 'section-pruefung',
          order: 1,
          collapsible: true,
          collapsed: false,
          fields: [
            {
              id: 'widget-field-schutzbedarf-aenderung',
              type: 'checkbox',
              name: 'schutzbedarf_aenderung_notwendig',
              label: 'Änderung Schutzbedarf notwendig?',
              required: false,
              width: 'full',
              order: 1,
              widget: 'widget-pruefung-einschaetzung'
            },
            {
              id: 'widget-field-personenbezogene-daten',
              type: 'checkbox',
              name: 'personenbezogene_daten_verarbeitung',
              label: 'Werden für diese Anforderung personenbezogene Daten verarbeitet?',
              required: false,
              width: 'full',
              order: 2,
              widget: 'widget-pruefung-einschaetzung'
            }
          ]
        }
      ]
    };
  }

  // Fallback für andere Anforderungstypen
  return {
    id: `form-${requirementType.toLowerCase()}-001`,
    name: `${requirementType} Formular`,
    requirementType,
    version: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    sections: [
      {
        id: 'section-1',
        title: 'Grunddaten',
        description: 'Grundlegende Informationen',
        collapsible: false,
        collapsed: false,
        order: 1
      }
    ],
    fields: [
      {
        id: 'field-1',
        type: 'text',
        name: 'title',
        label: 'Titel',
        placeholder: 'Titel eingeben...',
        required: true,
        width: 'full',
        section: 'section-1',
        order: 1
      }
    ],
    widgets: []
  };
};

export const WidgetEnhancedFormBuilder = component$(() => {
  // State
  const selectedRequirementType = useSignal('Kleinanforderung');
  const selectedWorkflowStep = useSignal<string>('step-1');
  const workflowSteps = useSignal<Array<{id: string, name: string}>>([]);
  const formFields = useSignal<FormField[]>([]);
  const formSections = useSignal<FormSection[]>([]);
  const formWidgets = useSignal<FormWidget[]>([]);
  const selectedField = useSignal<FormField | null>(null);
  const selectedWidget = useSignal<FormWidget | null>(null);
  const currentConfig = useSignal<FormConfiguration | null>(null);
  const isLoading = useSignal(false);
  const editMode = useSignal<'fields' | 'widgets'>('fields');

  // Helper functions
  const getFieldIcon = (type: FieldType) => {
    const template = fieldTemplates.find(t => t.type === type);
    return template?.icon || '📝';
  };

  const getFieldColor = (type: FieldType) => {
    const template = fieldTemplates.find(t => t.type === type);
    return template?.color || '#3b82f6';
  };

  const getWidgetIcon = (type: WidgetType) => {
    const template = widgetTemplates.find(t => t.type === type);
    return template?.icon || '📦';
  };

  const getWidgetColor = (type: WidgetType) => {
    const template = widgetTemplates.find(t => t.type === type);
    return template?.color || '#6b7280';
  };

  const getItemsBySection = (sectionId: string) => {
    const currentStep = selectedWorkflowStep.value;
    
    const fieldsInSection = formFields.value.filter(field => 
      field.section === sectionId && 
      !field.widget &&
      (field.workflowStepBinding?.includes(currentStep) || !field.workflowStepBinding?.length)
    );
    
    const widgetsInSection = formWidgets.value.filter(widget => 
      widget.section === sectionId &&
      (widget.workflowStepBinding?.includes(currentStep) || !widget.workflowStepBinding?.length)
    );
    
    // Debug log for troubleshooting
    if (sectionId === 'default' && (fieldsInSection.length > 0 || widgetsInSection.length > 0)) {
      console.log(`[Widget Form Builder] 🔧 Section "${sectionId}" items:`, {
        currentStep,
        fields: fieldsInSection.length,
        widgets: widgetsInSection.length,
        widgetBindings: formWidgets.value.map(w => ({ id: w.id, binding: w.workflowStepBinding }))
      });
    }
    
    return [...fieldsInSection, ...widgetsInSection].sort((a, b) => a.order - b.order);
  };

  // Load form configuration
  useTask$(async ({ track }) => {
    track(() => selectedRequirementType.value);
    isLoading.value = true;

    try {
      console.log('[Widget Form Builder] Loading configuration for:', selectedRequirementType.value);
      
      // Load workflow steps first
      const steps = await FormBuilderAPI.getWorkflowSteps(selectedRequirementType.value);
      workflowSteps.value = steps.map(step => ({ id: step.id, name: step.name }));
      
      console.log('[Widget Form Builder] 🔧 Available workflow steps:', steps.map(s => s.id));
      
      // Reset to first step when changing workflow type
      if (steps.length > 0) {
        selectedWorkflowStep.value = steps[0].id;
        console.log('[Widget Form Builder] 🔧 Selected workflow step:', steps[0].id);
      }
      
      // Use the real API service instead of mock
      const config = await FormBuilderAPI.loadFormConfiguration(selectedRequirementType.value);
      
      if (config) {
        currentConfig.value = config;
        formFields.value = [...config.fields].sort((a, b) => a.order - b.order);
        formWidgets.value = [...(config.widgets || [])].sort((a, b) => a.order - b.order);
        
        // Create default sections from widgets and fields
        const sectionsFromConfig = new Set([
          ...config.fields.map(f => f.section || 'default'),
          ...config.widgets.map(w => w.section || 'default')
        ]);
        
        const sections = Array.from(sectionsFromConfig).map((sectionId, index) => ({
          id: sectionId,
          title: sectionId === 'default' ? 'Allgemeine Informationen' : sectionId,
          description: '',
          collapsible: true,
          collapsed: false,
          order: index + 1
        }));
        
        formSections.value = sections;
        
        console.log('[Widget Form Builder] ✅ Configuration loaded successfully:', {
          fields: config.fields.length,
          widgets: config.widgets.length,
          sections: sections.length
        });
      } else {
        // No configuration found - create empty configuration
        console.log('[Widget Form Builder] ⚠️ No configuration found in database for:', selectedRequirementType.value);
        console.log('[Widget Form Builder] 💡 Please run the SQL seeding script or use the "Seed DB" button');
        
        currentConfig.value = {
          id: `temp-${Date.now()}`,
          name: `${selectedRequirementType.value} - Neue Konfiguration`,
          workflowType: selectedRequirementType.value,
          version: 'v1.0.0',
          lightModeEnabled: false,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          fields: [],
          widgets: []
        };
        formFields.value = [];
        formWidgets.value = [];
        formSections.value = [{
          id: 'default',
          title: 'Allgemeine Informationen',
          description: '',
          collapsible: true,
          collapsed: false,
          order: 1
        }];
      }
      
      selectedField.value = null;
      selectedWidget.value = null;
    } catch (error) {
      console.error("[Widget Form Builder] Error loading form configuration:", error);
      
      // On error, fallback to mock
      try {
        console.log('[Widget Form Builder] 🔄 Falling back to mock configuration');
        const fallbackConfig = await mockLoadFormConfiguration(selectedRequirementType.value);
        currentConfig.value = fallbackConfig;
        formFields.value = [...fallbackConfig.fields].sort((a, b) => a.order - b.order);
        formSections.value = [...fallbackConfig.sections].sort((a, b) => a.order - b.order);
        formWidgets.value = [...(fallbackConfig.widgets || [])].sort((a, b) => a.order - b.order);
      } catch (fallbackError) {
        console.error("[Widget Form Builder] Fallback also failed:", fallbackError);
      }
    } finally {
      isLoading.value = false;
    }
  });

  // Seed Kleinanforderung configuration
  const seedConfiguration = $(async () => {
    isLoading.value = true;
    
    try {
      console.log('[Widget Form Builder] Seeding Kleinanforderung configuration...');
      
      // First check API connection
      const isConnected = await FormBuilderAPI.testConnection();
      if (!isConnected) {
        throw new Error('Keine Verbindung zur Forms API. Server möglicherweise nicht erreichbar.');
      }
      
      await seedKleinanforderungConfiguration();
      
      // Reload the current configuration
      if (selectedRequirementType.value === 'Kleinanforderung') {
        const config = await FormBuilderAPI.loadFormConfiguration('Kleinanforderung');
        if (config) {
          currentConfig.value = config;
          formFields.value = [...config.fields].sort((a, b) => a.order - b.order);
          formWidgets.value = [...(config.widgets || [])].sort((a, b) => a.order - b.order);
          
          console.log('[Widget Form Builder] ✅ Configuration reloaded after seeding');
        }
      }
      
      if (typeof window !== 'undefined') {
        alert('✅ Kleinanforderung-Konfiguration erfolgreich in DB gespeichert!\n\n' +
              'Die Konfiguration wurde mit allen Widgets und Feldern erstellt.');
      }
    } catch (error) {
      console.error('[Widget Form Builder] Seed failed:', error);
      
      let errorMessage = 'Unbekannter Fehler';
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          errorMessage = 'API-Endpunkt nicht gefunden. Backend unterstützt möglicherweise noch keine Widget-Konfigurationen.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server-Fehler. Prüfe Backend-Logs für Details.';
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Netzwerk-Fehler. Ist der Backend-Server erreichbar?';
        } else {
          errorMessage = error.message;
        }
      }
      
      if (typeof window !== 'undefined') {
        alert('❌ Seeding fehlgeschlagen:\n\n' + errorMessage + 
              '\n\n💡 Tipp: Die Konfiguration kann lokal gespeichert werden.');
      }
    } finally {
      isLoading.value = false;
    }
  });

  // Save form configuration
  const saveConfiguration = $(async () => {
    if (!currentConfig.value) return;
    
    isLoading.value = true;
    
    try {
      console.log('[Widget Form Builder] Saving configuration...');
      
      const configToSave: FormConfiguration = {
        ...currentConfig.value,
        fields: formFields.value,
        widgets: formWidgets.value,
        modifiedAt: new Date().toISOString()
      };
      
      const savedConfig = await FormBuilderAPI.saveFormConfiguration(configToSave);
      
      if (savedConfig) {
        currentConfig.value = savedConfig;
        console.log('[Widget Form Builder] ✅ Configuration saved successfully');
        
        // Show success notification (browser safe)
        if (typeof window !== 'undefined') {
          alert('✅ Formular-Konfiguration erfolgreich gespeichert!');
        }
      }
    } catch (error) {
      console.error('[Widget Form Builder] Save failed:', error);
      
      // Show error notification (browser safe)
      if (typeof window !== 'undefined') {
        alert('❌ Speichern fehlgeschlagen: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
      }
    } finally {
      isLoading.value = false;
    }
  });

  const addNewField = $((template: typeof fieldTemplates[0]) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: template.type,
      name: `field_${Date.now()}`,
      label: `Neues ${template.title}`,
      placeholder: template.type === 'text' ? 'Platzhalter Text...' : undefined,
      required: false,
      width: 'full',
      section: formSections.value[0]?.id || 'section-1',
      workflowStepBinding: [selectedWorkflowStep.value],
      order: Math.max(...formFields.value.map(f => f.order), ...formWidgets.value.map(w => w.order), 0) + 1,
      options: template.type === 'select' ? [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ] : undefined
    };

    formFields.value = [...formFields.value, newField];
    selectedField.value = newField;
    selectedWidget.value = null;
  });

  const addNewWidget = $((template: typeof widgetTemplates[0]) => {
    const widgetId = `widget-${Date.now()}`;
    const widget: FormWidget = {
      id: widgetId,
      type: template.type,
      name: `widget_${Date.now()}`,
      title: template.title,
      description: template.description,
      section: formSections.value[0]?.id || 'section-1',
      order: Math.max(...formFields.value.map(f => f.order), ...formWidgets.value.map(w => w.order), 0) + 1,
      collapsible: true,
      collapsed: false,
      fields: []
    };
    
    formWidgets.value = [...formWidgets.value, widget];
    selectedWidget.value = widget;
    selectedField.value = null;
  });

  const updateField = $((fieldId: string, updates: Partial<FormField>) => {
    formFields.value = formFields.value.map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    );

    if (selectedField.value?.id === fieldId) {
      selectedField.value = { ...selectedField.value, ...updates };
    }

    // Update widget's fields if field belongs to a widget
    formWidgets.value = formWidgets.value.map(widget => ({
      ...widget,
      fields: widget.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  });

  const updateWidget = $((widgetId: string, updates: Partial<FormWidget>) => {
    formWidgets.value = formWidgets.value.map(widget =>
      widget.id === widgetId ? { ...widget, ...updates } : widget
    );

    if (selectedWidget.value?.id === widgetId) {
      selectedWidget.value = { ...selectedWidget.value, ...updates };
    }
  });

  const deleteField = $((fieldId: string) => {
    formFields.value = formFields.value.filter(field => field.id !== fieldId);
    
    if (selectedField.value?.id === fieldId) {
      selectedField.value = null;
    }

    formWidgets.value = formWidgets.value.map(widget => ({
      ...widget,
      fields: widget.fields.filter(field => field.id !== fieldId)
    }));
  });

  const deleteWidget = $((widgetId: string) => {
    formFields.value = formFields.value.filter(field => field.widget !== widgetId);
    formWidgets.value = formWidgets.value.filter(widget => widget.id !== widgetId);
    
    if (selectedWidget.value?.id === widgetId) {
      selectedWidget.value = null;
    }
  });

  return (
    <div class="workflow-container">
      {/* Header */}
      <div class="workflow-header">
        <div class="workflow-header-content">
          <div>
            <h1 class="workflow-title">Widget Form Builder</h1>
            <p class="workflow-subtitle">Intelligente Formulare mit Widget-Gruppen</p>
          </div>
          <div class="workflow-actions">
            <select 
              class="form-input"
              value={selectedRequirementType.value}
              onChange$={(e) => selectedRequirementType.value = (e.target as HTMLSelectElement).value}
            >
              {requirementTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select 
              class="form-input"
              value={selectedWorkflowStep.value}
              onChange$={(e) => selectedWorkflowStep.value = (e.target as HTMLSelectElement).value}
              disabled={workflowSteps.value.length === 0}
            >
              {workflowSteps.value.map(step => (
                <option key={step.id} value={step.id}>{step.name}</option>
              ))}
            </select>
            <button 
              class={`btn btn-primary ${isLoading.value ? 'loading' : ''}`}
              onClick$={saveConfiguration}
              disabled={isLoading.value}
            >
              {isLoading.value ? '⏳ Speichert...' : '💾 Speichern'}
            </button>
            {selectedRequirementType.value === 'Kleinanforderung' && (
              <button 
                class={`btn btn-secondary ${isLoading.value ? 'loading' : ''}`}
                onClick$={seedConfiguration}
                disabled={isLoading.value}
                title="Kleinanforderung-Konfiguration in DB laden"
              >
                {isLoading.value ? '⏳ Lädt...' : '🌱 Seed DB'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div class="workflow-grid">
        {/* Left Sidebar - Templates */}
        <div class="workflow-sidebar-left">
          <div class="card">
            <h3 class="card-title">Templates</h3>
            
            {/* Mode Toggle */}
            <div class="tab-nav">
              <button 
                class={`tab-button ${editMode.value === 'fields' ? 'active' : ''}`}
                onClick$={() => editMode.value = 'fields'}
              >
                📝 Felder
              </button>
              <button 
                class={`tab-button ${editMode.value === 'widgets' ? 'active' : ''}`}
                onClick$={() => editMode.value = 'widgets'}
              >
                📦 Widgets
              </button>
            </div>

            <div class="template-list">
              {editMode.value === 'fields' ? (
                <>
                  {fieldTemplates.map((template) => (
                    <button
                      key={template.id}
                      class="template-item"
                      onClick$={() => addNewField(template)}
                    >
                      <div 
                        class="template-icon"
                        style={`background-color: ${template.color}`}
                      >
                        {template.icon}
                      </div>
                      <div class="template-content">
                        <div class="template-title">{template.title}</div>
                        <div class="template-type">{template.type}</div>
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {widgetTemplates.map((template) => (
                    <button
                      key={template.id}
                      class="template-item"
                      onClick$={() => addNewWidget(template)}
                    >
                      <div 
                        class="template-icon"
                        style={`background-color: ${template.color}`}
                      >
                        {template.icon}
                      </div>
                      <div class="template-content">
                        <div class="template-title">{template.title}</div>
                        <div class="template-description">{template.description}</div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center - Form Canvas */}
        <div class="workflow-main">
          <div class="card">
            <h3 class="card-title">
              Formular: {selectedRequirementType.value}
              <span class="badge badge-gray">
                {formFields.value.length} Felder, {formWidgets.value.length} Widgets
              </span>
            </h3>

            {isLoading.value ? (
              <div class="loading-state">
                <div class="loading-spinner">⏳</div>
                <p>Formular wird geladen...</p>
              </div>
            ) : (
              <div class="form-canvas">
                {formSections.value.map(section => {
                  const itemsInSection = getItemsBySection(section.id);
                  
                  return (
                    <div key={section.id} class="form-section">
                      <div class="form-section-header">
                        <h4 class="form-section-title">{section.title}</h4>
                        {section.description && (
                          <p class="form-section-description">{section.description}</p>
                        )}
                      </div>
                      
                      <div class="form-section-content">
                        {itemsInSection.map((item) => {
                          const isWidget = 'fields' in item;
                          
                          if (isWidget) {
                            const widget = item as FormWidget;
                            return (
                              <div 
                                key={widget.id} 
                                class={`form-widget ${selectedWidget.value?.id === widget.id ? 'selected' : ''}`}
                                onClick$={() => {
                                  selectedWidget.value = widget;
                                  selectedField.value = null;
                                }}
                              >
                                <div class="form-widget-header">
                                  <div 
                                    class="form-widget-icon"
                                    style={`background-color: ${getWidgetColor(widget.type)}`}
                                  >
                                    {getWidgetIcon(widget.type)}
                                  </div>
                                  <div class="form-widget-content">
                                    <h4 class="form-widget-title">{widget.title}</h4>
                                    <p class="form-widget-description">{widget.description}</p>
                                  </div>
                                  <div class="form-item-actions opacity-0 group-hover:opacity-100">
                                    <button 
                                      class="action-btn edit"
                                      onClick$={(e) => {
                                        e.stopPropagation();
                                        selectedWidget.value = widget;
                                      }}
                                    >
                                      ✏️
                                    </button>
                                    <button 
                                      class="action-btn delete"
                                      onClick$={(e) => {
                                        e.stopPropagation();
                                        deleteWidget(widget.id);
                                      }}
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>

                                <div class="form-widget-fields">
                                  {widget.fields.map(field => (
                                    <div 
                                      key={field.id} 
                                      class="form-widget-field"
                                      onClick$={(e) => {
                                        e.stopPropagation();
                                        selectedField.value = field;
                                        selectedWidget.value = null;
                                      }}
                                    >
                                      <span class="field-icon">{getFieldIcon(field.type)}</span>
                                      <span class="field-label">{field.label}</span>
                                      {field.required && <span class="field-required">*</span>}
                                    </div>
                                  ))}
                                  
                                  <div class="form-widget-field add-field">
                                    <span>+ Feld hinzufügen</span>
                                  </div>
                                </div>
                              </div>
                            );
                          } else {
                            const field = item as FormField;
                            return (
                              <div 
                                key={field.id} 
                                class={`form-field ${selectedField.value?.id === field.id ? 'selected' : ''}`}
                                onClick$={() => {
                                  selectedField.value = field;
                                  selectedWidget.value = null;
                                }}
                              >
                                <div class="form-field-header">
                                  <div 
                                    class="form-field-icon"
                                    style={`background-color: ${getFieldColor(field.type)}`}
                                  >
                                    {getFieldIcon(field.type)}
                                  </div>
                                  <div class="form-field-content">
                                    <h4 class="form-field-title">{field.label}</h4>
                                    <div class="form-field-meta">
                                      <span class="badge badge-outline">{field.type}</span>
                                      <span class="badge badge-outline">{FIELD_WIDTHS[field.width]}</span>
                                      {field.required && <span class="badge badge-red">Pflicht</span>}
                                    </div>
                                  </div>
                                  <div class="form-item-actions opacity-0 group-hover:opacity-100">
                                    <button 
                                      class="action-btn edit"
                                      onClick$={(e) => {
                                        e.stopPropagation();
                                        selectedField.value = field;
                                      }}
                                    >
                                      ✏️
                                    </button>
                                    <button 
                                      class="action-btn delete"
                                      onClick$={(e) => {
                                        e.stopPropagation();
                                        deleteField(field.id);
                                      }}
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        })}
                        
                        {itemsInSection.length === 0 && (
                          <div class="empty-section">
                            <div class="empty-icon">📝</div>
                            <p>Ziehe Felder oder Widgets hier hinein</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {formSections.value.length === 0 && (
                  <div class="empty-canvas">
                    <div class="empty-icon">📋</div>
                    <p>Keine Sektionen vorhanden</p>
                    <p class="empty-description">Erstelle eine Sektion, um Felder und Widgets hinzuzufügen</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div class="workflow-sidebar-right">
          {selectedField.value && !selectedWidget.value ? (
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Feld bearbeiten</h3>
                <button 
                  class="close-btn"
                  onClick$={() => selectedField.value = null}
                >
                  ✖️
                </button>
              </div>

              <div class="form-properties">
                <div class="form-group">
                  <label class="form-label">Label</label>
                  <input
                    type="text"
                    class="form-input"
                    value={selectedField.value.label}
                    onInput$={(e) => updateField(selectedField.value!.id, { label: (e.target as HTMLInputElement).value })}
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Feldname (technisch)</label>
                  <input
                    type="text"
                    class="form-input"
                    value={selectedField.value.name}
                    onInput$={(e) => updateField(selectedField.value!.id, { name: (e.target as HTMLInputElement).value })}
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Breite</label>
                  <select
                    class="form-input"
                    value={selectedField.value.width}
                    onChange$={(e) => updateField(selectedField.value!.id, { width: (e.target as HTMLSelectElement).value as any })}
                  >
                    {Object.entries(FIELD_WIDTHS).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Sektion</label>
                  <select
                    class="form-input"
                    value={selectedField.value.section}
                    onChange$={(e) => updateField(selectedField.value!.id, { section: (e.target as HTMLSelectElement).value })}
                  >
                    {formSections.value.map((section) => (
                      <option key={section.id} value={section.id}>{section.title}</option>
                    ))}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedField.value.required}
                      onChange$={(e) => updateField(selectedField.value!.id, { required: (e.target as HTMLInputElement).checked })}
                    />
                    <span>Pflichtfeld</span>
                  </label>
                </div>
              </div>
            </div>
          ) : selectedWidget.value ? (
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Widget bearbeiten</h3>
                <button 
                  class="close-btn"
                  onClick$={() => selectedWidget.value = null}
                >
                  ✖️
                </button>
              </div>

              <div class="form-properties">
                <div class="form-group">
                  <label class="form-label">Titel</label>
                  <input
                    type="text"
                    class="form-input"
                    value={selectedWidget.value.title}
                    onInput$={(e) => updateWidget(selectedWidget.value!.id, { title: (e.target as HTMLInputElement).value })}
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Beschreibung</label>
                  <textarea
                    class="form-input"
                    value={selectedWidget.value.description || ''}
                    onInput$={(e) => updateWidget(selectedWidget.value!.id, { description: (e.target as HTMLTextAreaElement).value })}
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Sektion</label>
                  <select
                    class="form-input"
                    value={selectedWidget.value.section}
                    onChange$={(e) => updateWidget(selectedWidget.value!.id, { section: (e.target as HTMLSelectElement).value })}
                  >
                    {formSections.value.map((section) => (
                      <option key={section.id} value={section.id}>{section.title}</option>
                    ))}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedWidget.value.collapsible}
                      onChange$={(e) => updateWidget(selectedWidget.value!.id, { collapsible: (e.target as HTMLInputElement).checked })}
                    />
                    <span>Einklappbar</span>
                  </label>
                </div>

                <div class="widget-fields">
                  <h4 class="widget-fields-title">Widget Felder ({selectedWidget.value.fields.length})</h4>
                  <div class="widget-fields-list">
                    {selectedWidget.value.fields.map((field) => (
                      <div key={field.id} class="widget-field-item">
                        <span class="field-icon">{getFieldIcon(field.type)}</span>
                        <span class="field-label">{field.label}</span>
                        <button 
                          class="field-delete"
                          onClick$={() => deleteField(field.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div class="card">
              <div class="empty-properties">
                <div class="empty-icon">
                  {editMode.value === 'widgets' ? '📦' : '📝'}
                </div>
                <h3>
                  {editMode.value === 'widgets' ? 'Kein Widget ausgewählt' : 'Kein Feld ausgewählt'}
                </h3>
                <p>
                  {editMode.value === 'widgets' 
                    ? 'Klicke auf ein Widget im Formular, um es zu bearbeiten'
                    : 'Klicke auf ein Feld im Formular, um es zu bearbeiten'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* Workflow Designer inspired styles */
        .workflow-container {
          min-height: 100vh;
          background: #f8fafc;
        }

        .workflow-header {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 1.5rem 2rem;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .workflow-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
        }

        .workflow-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .workflow-subtitle {
          color: #64748b;
          margin: 0.25rem 0 0 0;
          font-size: 0.875rem;
        }

        .workflow-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .workflow-grid {
          display: grid;
          grid-template-columns: 280px 1fr 320px;
          gap: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem 2rem;
          min-height: calc(100vh - 200px);
        }

        .workflow-sidebar-left,
        .workflow-sidebar-right {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .workflow-main {
          display: flex;
          flex-direction: column;
        }

        .card {
          background: white;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .card-title {
          font-weight: 600;
          color: #1e293b;
          margin: 0;
          font-size: 1.125rem;
          padding: 1.5rem 1.5rem 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 1.5rem 1rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .close-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.25rem;
        }

        .close-btn:hover {
          color: #64748b;
          background: #f1f5f9;
        }

        .tab-nav {
          display: flex;
          gap: 0.25rem;
          padding: 0 1.5rem 1rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .tab-button {
          background: none;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-button.active {
          background: #3b82f6;
          color: white;
        }

        .tab-button:not(.active):hover {
          background: #f1f5f9;
          color: #374151;
        }

        .template-list {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 500px;
          overflow-y: auto;
        }

        .template-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .template-item:hover {
          border-color: #3b82f6;
          background: #f8fafc;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .template-icon {
          width: 2rem;
          height: 2rem;
          border-radius: 0.375rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .template-content {
          flex: 1;
          min-width: 0;
        }

        .template-title {
          font-weight: 500;
          color: #1e293b;
          font-size: 0.875rem;
        }

        .template-type {
          color: #64748b;
          font-size: 0.75rem;
          margin-top: 0.125rem;
        }

        .template-description {
          color: #64748b;
          font-size: 0.75rem;
          margin-top: 0.125rem;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: #64748b;
        }

        .loading-spinner {
          font-size: 2rem;
          margin-bottom: 1rem;
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .form-canvas {
          padding: 1.5rem;
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .form-section-header {
          margin-bottom: 1rem;
        }

        .form-section-title {
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
        }

        .form-section-description {
          color: #64748b;
          font-size: 0.875rem;
          margin: 0;
        }

        .form-section-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          min-height: 100px;
          padding: 1rem;
          border: 2px dashed #e2e8f0;
          border-radius: 0.5rem;
          background: #fafafa;
        }

        .form-field,
        .form-widget {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .form-field:hover,
        .form-widget:hover {
          border-color: #3b82f6;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .form-field.selected,
        .form-widget.selected {
          border-color: #3b82f6;
          background: #f0f9ff;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .form-field-header,
        .form-widget-header {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .form-field-icon,
        .form-widget-icon {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .form-field-content,
        .form-widget-content {
          flex: 1;
          min-width: 0;
        }

        .form-field-title,
        .form-widget-title {
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }

        .form-field-meta {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .form-widget-description {
          color: #64748b;
          font-size: 0.875rem;
          margin: 0;
        }

        .form-widget-fields {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #f1f5f9;
        }

        .form-widget-field {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.25rem;
          margin-bottom: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .form-widget-field:hover {
          border-color: #3b82f6;
          background: #f0f9ff;
        }

        .form-widget-field.add-field {
          border-style: dashed;
          color: #64748b;
          justify-content: center;
        }

        .field-icon {
          font-size: 0.875rem;
        }

        .field-label {
          font-size: 0.875rem;
          color: #374151;
        }

        .field-required {
          color: #ef4444;
          font-weight: 600;
        }

        .form-item-actions {
          display: flex;
          gap: 0.5rem;
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          transition: opacity 0.2s;
        }

        .action-btn {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.25rem;
          padding: 0.25rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .action-btn.edit:hover {
          background: #dbeafe;
          border-color: #3b82f6;
        }

        .action-btn.delete:hover {
          background: #fee2e2;
          border-color: #ef4444;
        }

        .empty-section,
        .empty-canvas,
        .empty-properties {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: #64748b;
          text-align: center;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-description {
          font-size: 0.875rem;
          color: #94a3b8;
          margin-top: 0.5rem;
        }

        .form-properties {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .form-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .form-checkbox {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .form-checkbox input {
          margin: 0;
        }

        .widget-fields {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #f1f5f9;
        }

        .widget-fields-title {
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 1rem 0;
          font-size: 1rem;
        }

        .widget-fields-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .widget-field-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.25rem;
        }

        .field-delete {
          margin-left: auto;
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: background 0.2s;
        }

        .field-delete:hover {
          background: #fee2e2;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .badge-gray {
          background: #f1f5f9;
          color: #64748b;
        }

        .badge-outline {
          background: transparent;
          border: 1px solid #e2e8f0;
          color: #64748b;
        }

        .badge-red {
          background: #fee2e2;
          color: #dc2626;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .btn:disabled,
        .btn.loading {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn.loading:hover {
          background: #3b82f6; /* Keep original color when loading */
        }

        /* Group hover effect */
        .group:hover .group-hover\\:opacity-100 {
          opacity: 1 !important;
        }

        .opacity-0 {
          opacity: 0;
        }

        .group-hover\\:opacity-100 {
          transition: opacity 0.2s;
        }
      `}</style>
    </div>
  );
});