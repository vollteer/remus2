import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';

// Widget-Enhanced Types
type FieldType = 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'date' | 'datetime' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'checkboxGroup' | 'file' | 'currency' | 'percentage' | 'url' | 'divider' | 'heading' | 'userSearch' | 'requirementSearch';

type WidgetType = 'terminGroup' | 'budgetGroup' | 'zustaendigkeitGroup' | 'bezuegeGroup' | 'pruefungGroup' | 'customGroup';

interface FieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FieldPermissions {
  allowedRoles: string[];
  allowedUsers: string[];
  readOnlyRoles: string[];
  hideFromRoles: string[];
}

interface FormField {
  id: string;
  type: FieldType;
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string | number | boolean | string[];
  options?: FieldOption[];
  order: number;
  width: 'full' | 'half' | 'third' | 'quarter';
  section?: string;
  widget?: string; // Widget-ID if this field belongs to a widget
  lightModeVisible?: boolean;
  workflowStepBinding?: string[];
  permissions?: FieldPermissions;
}

// New Widget Interface
interface FormWidget {
  id: string;
  type: WidgetType;
  name: string;
  title: string;
  description?: string;
  section?: string;
  order: number;
  fields: FormField[];
  collapsible?: boolean;
  collapsed?: boolean;
  permissions?: FieldPermissions;
  workflowStepBinding?: string[];
  config?: Record<string, any>; // Widget-specific configuration
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  order: number;
  permissions?: FieldPermissions;
  workflowStepBinding?: string[];
}

interface FormConfiguration {
  id: string;
  name: string;
  description?: string;
  requirementType: string;
  workflowStepId?: string;
  sections: FormSection[];
  fields: FormField[];
  widgets: FormWidget[]; // New: Widget support
  version: number;
  isActive: boolean;
  hasLightMode: boolean;
  createdAt: string;
  modifiedAt: string;
  createdBy: string;
  lightMode?: {
    enabled: boolean;
    title: string;
    description: string;
  };
}

// Widget Templates
const widgetTemplates = [
  {
    id: 'widget-termine',
    type: 'terminGroup' as const,
    icon: '📅',
    title: 'Termine Widget',
    description: 'Gruppe für beliebig viele Termine (AN/AG)',
    color: '#8b5cf6',
    category: 'workflow',
    createWidget: (sectionId: string): FormWidget => ({
      id: `widget-${Date.now()}`,
      type: 'terminGroup',
      name: 'termine_gruppe',
      title: 'Termine',
      description: 'Termine und Deadlines für AN und AG',
      section: sectionId,
      order: 1,
      collapsible: true,
      collapsed: false,
      config: {
        columns: ['AN', 'AG'],
        terminTypes: ['Starttermin', 'Technische Integration', 'Migration', 'Testbeginn', 'E2E-Test', 'Go-Live']
      },
      fields: [
        {
          id: `field-${Date.now()}-1`,
          type: 'date',
          name: 'starttermin_an',
          label: 'Starttermin (AN)',
          required: false,
          width: 'half',
          order: 1,
          widget: `widget-${Date.now()}`
        },
        {
          id: `field-${Date.now()}-2`,
          type: 'date',
          name: 'starttermin_ag',
          label: 'Starttermin (AG)',
          required: false,
          width: 'half',
          order: 2,
          widget: `widget-${Date.now()}`
        }
      ]
    })
  },
  {
    id: 'widget-budget',
    type: 'budgetGroup' as const,
    icon: '💰',
    title: 'Budget Widget',
    description: 'Budget-Gruppe mit AN/AG Spalten',
    color: '#10b981',
    category: 'financial',
    createWidget: (sectionId: string): FormWidget => ({
      id: `widget-${Date.now()}`,
      type: 'budgetGroup',
      name: 'budget_gruppe',
      title: 'Budget und Termine',
      description: 'Budget aufgeteilt in AN und AG',
      section: sectionId,
      order: 1,
      collapsible: true,
      collapsed: false,
      config: {
        columns: ['AN', 'AG'],
        showVorhaben: true
      },
      fields: [
        {
          id: `field-${Date.now()}-1`,
          type: 'currency',
          name: 'budget_an',
          label: 'Budget Fachbereich (AN)',
          required: false,
          width: 'half',
          order: 1,
          widget: `widget-${Date.now()}`
        },
        {
          id: `field-${Date.now()}-2`,
          type: 'currency',
          name: 'budget_ag',
          label: 'Budget Fachbereich (AG)',
          required: false,
          width: 'half',
          order: 2,
          widget: `widget-${Date.now()}`
        },
        {
          id: `field-${Date.now()}-3`,
          type: 'requirementSearch',
          name: 'vorhaben',
          label: 'Vorhaben',
          placeholder: 'Vorhaben suchen...',
          required: false,
          width: 'full',
          order: 3,
          widget: `widget-${Date.now()}`
        }
      ]
    })
  },
  {
    id: 'widget-zustaendigkeiten',
    type: 'zustaendigkeitGroup' as const,
    icon: '👥',
    title: 'Zuständigkeiten Widget',
    description: 'Gruppe für Verantwortlichkeiten und Zuständigkeiten',
    color: '#3b82f6',
    category: 'workflow',
    createWidget: (sectionId: string): FormWidget => ({
      id: `widget-${Date.now()}`,
      type: 'zustaendigkeitGroup',
      name: 'zustaendigkeiten_gruppe',
      title: 'Zuständigkeiten',
      description: 'Verantwortlichkeiten und Rollen',
      section: sectionId,
      order: 1,
      collapsible: true,
      collapsed: false,
      fields: [
        {
          id: `field-${Date.now()}-1`,
          type: 'userSearch',
          name: 'erfasser',
          label: 'Erfasser',
          placeholder: 'User suchen...',
          required: true,
          width: 'half',
          order: 1,
          widget: `widget-${Date.now()}`
        },
        {
          id: `field-${Date.now()}-2`,
          type: 'userSearch',
          name: 'anforderungsverantwortlicher',
          label: 'Anforderungsverantwortlicher',
          placeholder: 'User suchen...',
          required: false,
          width: 'half',
          order: 2,
          widget: `widget-${Date.now()}`
        },
        {
          id: `field-${Date.now()}-3`,
          type: 'userSearch',
          name: 'anforderungsgenehmiger',
          label: 'Anforderungsgenehmiger',
          placeholder: 'User suchen...',
          required: false,
          width: 'half',
          order: 3,
          widget: `widget-${Date.now()}`
        },
        {
          id: `field-${Date.now()}-4`,
          type: 'userSearch',
          name: 'it_koordinator',
          label: 'IT-Koordinator',
          placeholder: 'User suchen...',
          required: false,
          width: 'half',
          order: 4,
          widget: `widget-${Date.now()}`
        },
        {
          id: `field-${Date.now()}-5`,
          type: 'userSearch',
          name: 'solution_manager',
          label: 'Solution Manager',
          placeholder: 'User suchen...',
          required: false,
          width: 'half',
          order: 5,
          widget: `widget-${Date.now()}`
        },
        {
          id: `field-${Date.now()}-6`,
          type: 'userSearch',
          name: 'it_anforderungsmanager',
          label: 'IT Anforderungsmanager',
          placeholder: 'User suchen...',
          required: false,
          width: 'half',
          order: 6,
          widget: `widget-${Date.now()}`
        },
        {
          id: `field-${Date.now()}-7`,
          type: 'userSearch',
          name: 'release_manager',
          label: 'Release Manager',
          placeholder: 'User suchen...',
          required: false,
          width: 'half',
          order: 7,
          widget: `widget-${Date.now()}`
        }
      ]
    })
  },
  {
    id: 'widget-pruefung',
    type: 'pruefungGroup' as const,
    icon: '✅',
    title: 'Prüfung Widget',
    description: 'Gruppe für fachliche Einschätzungen und Prüfungen',
    color: '#f59e0b',
    category: 'workflow',
    createWidget: (sectionId: string): FormWidget => ({
      id: `widget-${Date.now()}`,
      type: 'pruefungGroup',
      name: 'pruefung_gruppe',
      title: 'Prüfung fachliche Einschätzung',
      description: 'Checkboxen für fachliche Bewertungen',
      section: sectionId,
      order: 1,
      collapsible: true,
      collapsed: false,
      fields: [
        {
          id: `field-${Date.now()}-1`,
          type: 'checkbox',
          name: 'schutzbedarf_aenderung',
          label: 'Änderung Schutzbedarf notwendig?',
          required: false,
          width: 'full',
          order: 1,
          widget: `widget-${Date.now()}`
        },
        {
          id: `field-${Date.now()}-2`,
          type: 'checkbox',
          name: 'personenbezogene_daten',
          label: 'Werden für diese Anforderung personenbezogene Daten verarbeitet?',
          required: false,
          width: 'full',
          order: 2,
          widget: `widget-${Date.now()}`
        }
      ]
    })
  },
  {
    id: 'widget-custom',
    type: 'customGroup' as const,
    icon: '📦',
    title: 'Eigene Gruppe',
    description: 'Erstelle eine benutzerdefinierte Gruppe',
    color: '#6b7280',
    category: 'basic',
    createWidget: (sectionId: string): FormWidget => ({
      id: `widget-${Date.now()}`,
      type: 'customGroup',
      name: 'custom_gruppe',
      title: 'Neue Gruppe',
      description: 'Benutzerdefinierte Gruppe',
      section: sectionId,
      order: 1,
      collapsible: true,
      collapsed: false,
      fields: []
    })
  }
];

// Enhanced Field Templates (inkl. neue Typen)
const enhancedFieldTemplates = [
  {
    id: 'template-text',
    type: 'text' as const,
    icon: '📝',
    title: 'Text',
    description: 'Einzeiliges Textfeld',
    color: '#3b82f6',
    category: 'basic'
  },
  {
    id: 'template-textarea',
    type: 'textarea' as const,
    icon: '📄',
    title: 'Textarea',
    description: 'Mehrzeiliges Textfeld',
    color: '#6366f1',
    category: 'basic'
  },
  {
    id: 'template-select',
    type: 'select' as const,
    icon: '📋',
    title: 'Dropdown',
    description: 'Einfachauswahl Dropdown',
    color: '#ef4444',
    category: 'basic',
    defaultOptions: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' }
    ]
  },
  {
    id: 'template-date',
    type: 'date' as const,
    icon: '📅',
    title: 'Datum',
    description: 'Datum auswählen',
    color: '#8b5cf6',
    category: 'basic'
  },
  {
    id: 'template-currency',
    type: 'currency' as const,
    icon: '💰',
    title: 'Währung',
    description: 'Währungsfeld mit Euro-Symbol',
    color: '#10b981',
    category: 'financial'
  },
  {
    id: 'template-checkbox',
    type: 'checkbox' as const,
    icon: '☑️',
    title: 'Checkbox',
    description: 'Ja/Nein Auswahl',
    color: '#059669',
    category: 'basic'
  },
  {
    id: 'template-user-search',
    type: 'userSearch' as const,
    icon: '👤',
    title: 'User-Suche',
    description: 'Suchfeld für Benutzer',
    color: '#0ea5e9',
    category: 'workflow'
  },
  {
    id: 'template-requirement-search',
    type: 'requirementSearch' as const,
    icon: '🔍',
    title: 'Anforderungs-Suche',
    description: 'Suchfeld für Anforderungen',
    color: '#7c3aed',
    category: 'workflow'
  }
];

const availableRoles = [
  { value: 'Administrator', label: 'Administrator', color: '#ef4444' },
  { value: 'Manager', label: 'Manager', color: '#f59e0b' },
  { value: 'Approver', label: 'Genehmiger', color: '#10b981' },
  { value: 'Requester', label: 'Antragsteller', color: '#3b82f6' },
  { value: 'TechnicalLead', label: 'Technischer Leiter', color: '#8b5cf6' },
  { value: 'BusinessUser', label: 'Fachbenutzer', color: '#06b6d4' },
  { value: 'Viewer', label: 'Betrachter', color: '#6b7280' },
  { value: 'External', label: 'Extern', color: '#9ca3af' }
];

const FIELD_WIDTHS = {
  'full': 'Vollbreite',
  'half': 'Halbe Breite',
  'third': 'Drittel',
  'quarter': 'Viertel'
} as const;

const requirementTypes = [
  'Kleinanforderung',
  'Großanforderung',
  'TIA-Anforderung',
  'Supportleistung',
  'Betriebsauftrag',
  'SBBI-Lösung',
  'AWG-Release',
  'AWS-Release'
];

// Mock Service mit Widget-Support
const mockLoadFormConfiguration = async (requirementType: string): Promise<FormConfiguration> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    id: `form-${requirementType.toLowerCase()}-001`,
    name: `${requirementType} Formular (Widget-Enhanced)`,
    description: 'Enhanced Form mit Widgets, Smart Permissions und Workflow-Binding',
    requirementType,
    version: 1,
    isActive: true,
    hasLightMode: true,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    createdBy: 'System',
    lightMode: {
      enabled: true,
      title: 'Schnellerstellung',
      description: 'Nur die wichtigsten Felder'
    },
    sections: [
      {
        id: 'section-1',
        title: 'Grunddaten',
        description: 'Grundlegende Informationen',
        collapsible: false,
        collapsed: false,
        order: 1
      },
      {
        id: 'section-2',
        title: 'Zuständigkeiten',
        description: 'Verantwortlichkeiten',
        collapsible: true,
        collapsed: false,
        order: 2
      }
    ],
    fields: [
      {
        id: 'field-1',
        type: 'select',
        name: 'anforderungsart',
        label: 'Anforderungsart',
        required: true,
        lightModeVisible: true,
        width: 'half',
        section: 'section-1',
        order: 1,
        options: [
          { value: 'kleinanforderung', label: 'Kleinanforderung' },
          { value: 'grossanforderung', label: 'Großanforderung' }
        ]
      },
      {
        id: 'field-2',
        type: 'select',
        name: 'realisierungsobjekt',
        label: 'Typ des Realisierungsobjekt',
        required: true,
        width: 'half',
        section: 'section-1',
        order: 2,
        options: [
          { value: 'anwendung', label: 'Anwendung' },
          { value: 'komponente', label: 'Komponente' }
        ]
      },
      {
        id: 'field-3',
        type: 'date',
        name: 'erstellungsdatum',
        label: 'Erstellungsdatum',
        required: true,
        width: 'half',
        section: 'section-1',
        order: 3
      },
      {
        id: 'field-4',
        type: 'text',
        name: 'kurzbezeichnung',
        label: 'Kurzbezeichnung',
        placeholder: 'Kurze Beschreibung der Anforderung...',
        required: true,
        lightModeVisible: true,
        width: 'full',
        section: 'section-1',
        order: 4
      },
      {
        id: 'field-5',
        type: 'textarea',
        name: 'ausgangssituation',
        label: 'Ausgangssituation',
        placeholder: 'Beschreibung der aktuellen Situation...',
        required: false,
        width: 'full',
        section: 'section-1',
        order: 5
      },
      {
        id: 'field-6',
        type: 'textarea',
        name: 'ziele',
        label: 'Ziele',
        placeholder: 'Beschreibung der Ziele...',
        required: false,
        width: 'full',
        section: 'section-1',
        order: 6
      }
    ],
    widgets: [
      // Beispiel Widget für Zuständigkeiten
      {
        id: 'widget-zustaendigkeiten-1',
        type: 'zustaendigkeitGroup',
        name: 'zustaendigkeiten',
        title: 'Zuständigkeiten',
        description: 'Verantwortlichkeiten und Rollen',
        section: 'section-2',
        order: 1,
        collapsible: true,
        collapsed: false,
        fields: [
          {
            id: 'widget-field-1',
            type: 'userSearch',
            name: 'erfasser',
            label: 'Erfasser',
            placeholder: 'User suchen...',
            required: true,
            width: 'half',
            order: 1,
            widget: 'widget-zustaendigkeiten-1'
          },
          {
            id: 'widget-field-2',
            type: 'userSearch',
            name: 'anwendungsbetreuer',
            label: 'Anwendungsbetreuer',
            placeholder: 'User in Gruppe "Anwendungsbetreuer" suchen...',
            required: false,
            width: 'half',
            order: 2,
            widget: 'widget-zustaendigkeiten-1'
          },
          {
            id: 'widget-field-3',
            type: 'userSearch',
            name: 'it_systemverantwortlicher',
            label: 'IT-Systemverantwortlicher',
            placeholder: 'User in Gruppe "IT-Systemverantwortliche" suchen...',
            required: false,
            width: 'half',
            order: 3,
            widget: 'widget-zustaendigkeiten-1'
          }
        ]
      }
    ]
  };
};

const mockSaveFormConfiguration = async (config: FormConfiguration): Promise<FormConfiguration> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    ...config,
    modifiedAt: new Date().toISOString(),
    version: config.version + 1
  };
};

const mockGetWorkflowSteps = async (requirementType: string) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const workflowSteps: Record<string, { value: string; label: string; description?: string }[]> = {
    'Kleinanforderung': [
      { value: 'step-1', label: 'Anforderung erfassen', description: 'Benutzer erstellt Anforderung' },
      { value: 'step-2', label: 'Prüfung', description: 'Fachliche Prüfung' },
      { value: 'step-3', label: 'Genehmigung', description: 'Manager-Genehmigung' },
      { value: 'step-4', label: 'Umsetzung', description: 'Technische Umsetzung' },
      { value: 'step-5', label: 'Abnahme', description: 'Finale Abnahme' }
    ]
  };

  return workflowSteps[requirementType] || workflowSteps['Kleinanforderung'];
};

export const WidgetEnhancedFormBuilder = component$(() => {
  // State management
  const selectedRequirementType = useSignal('Kleinanforderung');
  const formFields = useSignal<FormField[]>([]);
  const formSections = useSignal<FormSection[]>([]);
  const formWidgets = useSignal<FormWidget[]>([]); // New: Widget state
  const selectedField = useSignal<FormField | null>(null);
  const selectedWidget = useSignal<FormWidget | null>(null); // New: Selected widget
  const currentConfig = useSignal<FormConfiguration | null>(null);
  const isLoading = useSignal(false);
  const isSaving = useSignal(false);
  const previewMode = useSignal(false);
  const notification = useSignal<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Enhanced State
  const currentUserRoles = useSignal<string[]>(['Requester', 'Approver']);
  const previewAsRole = useSignal<string>('Requester');
  const availableWorkflowSteps = useSignal<{ value: string; label: string; description?: string }[]>([]);
  const selectedTemplateCategory = useSignal<string>('all');
  const selectedWidgetCategory = useSignal<string>('all'); // New: Widget category filter
  const showRolePreview = useSignal(false);
  const editMode = useSignal<'fields' | 'widgets'>('fields'); // New: Toggle between field and widget mode

  // Helper functions
  const showNotification = $((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    notification.value = { message, type };
    setTimeout(() => {
      notification.value = null;
    }, 5000);
  });

  const getFieldIcon = (type: FieldType) => {
    const template = enhancedFieldTemplates.find(t => t.type === type);
    return template?.icon || '📝';
  };

  const getFieldColor = (type: FieldType) => {
    const template = enhancedFieldTemplates.find(t => t.type === type);
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
    const fieldsInSection = formFields.value.filter(field => field.section === sectionId && !field.widget);
    const widgetsInSection = formWidgets.value.filter(widget => widget.section === sectionId);
    
    return [...fieldsInSection, ...widgetsInSection].sort((a, b) => a.order - b.order);
  };

  const getFilteredTemplates = () => {
    if (selectedTemplateCategory.value === 'all') return enhancedFieldTemplates;
    return enhancedFieldTemplates.filter(t => t.category === selectedTemplateCategory.value);
  };

  const getFilteredWidgetTemplates = () => {
    if (selectedWidgetCategory.value === 'all') return widgetTemplates;
    return widgetTemplates.filter(t => t.category === selectedWidgetCategory.value);
  };

  // Load form configuration
  useTask$(async ({ track }) => {
    track(() => selectedRequirementType.value);
    isLoading.value = true;

    try {
      const config = await mockLoadFormConfiguration(selectedRequirementType.value);
      currentConfig.value = config;
      formFields.value = [...config.fields].sort((a, b) => a.order - b.order);
      formSections.value = [...config.sections].sort((a, b) => a.order - b.order);
      formWidgets.value = [...(config.widgets || [])].sort((a, b) => a.order - b.order); // New
      
      const steps = await mockGetWorkflowSteps(selectedRequirementType.value);
      availableWorkflowSteps.value = steps;
      
      selectedField.value = null;
      selectedWidget.value = null; // New
    } catch (error) {
      console.error("Error loading form configuration:", error);
      showNotification("Fehler beim Laden der Formular-Konfiguration", "error");
    } finally {
      isLoading.value = false;
    }
  });

  const addNewField = $((template: typeof enhancedFieldTemplates[0]) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: template.type,
      name: `field_${Date.now()}`,
      label: `Neues ${template.title}`,
      placeholder: template.type === 'text' ? 'Platzhalter Text...' : undefined,
      required: false,
      lightModeVisible: false,
      width: 'full',
      section: formSections.value[0]?.id || 'section-1',
      order: Math.max(...formFields.value.map(f => f.order), ...formWidgets.value.map(w => w.order), 0) + 1,
      options: ['select', 'multiselect', 'radio', 'checkboxGroup'].includes(template.type)
        ? (template as any).defaultOptions || [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
          ]
        : undefined
    };

    formFields.value = [...formFields.value, newField];
    selectedField.value = newField;
    selectedWidget.value = null;
  });

  // New: Add widget function
  const addNewWidget = $((template: typeof widgetTemplates[0]) => {
    const widget = template.createWidget(formSections.value[0]?.id || 'section-1');
    widget.order = Math.max(...formFields.value.map(f => f.order), ...formWidgets.value.map(w => w.order), 0) + 1;
    
    formWidgets.value = [...formWidgets.value, widget];
    
    // Add widget fields to form fields
    const widgetFields = widget.fields.map(field => ({
      ...field,
      widget: widget.id
    }));
    formFields.value = [...formFields.value, ...widgetFields];
    
    selectedWidget.value = widget;
    selectedField.value = null;
  });

  // New: Add field to widget
  const addFieldToWidget = $((widgetId: string, template: typeof enhancedFieldTemplates[0]) => {
    const widget = formWidgets.value.find(w => w.id === widgetId);
    if (!widget) return;

    const widgetFields = formFields.value.filter(f => f.widget === widgetId);
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: template.type,
      name: `${widget.name}_${template.type}_${Date.now()}`,
      label: `${template.title}`,
      placeholder: template.type === 'text' ? 'Platzhalter Text...' : undefined,
      required: false,
      width: 'full',
      section: widget.section,
      widget: widgetId,
      order: Math.max(...widgetFields.map(f => f.order), 0) + 1,
      options: ['select', 'multiselect', 'radio', 'checkboxGroup'].includes(template.type)
        ? (template as any).defaultOptions || [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
          ]
        : undefined
    };

    formFields.value = [...formFields.value, newField];
    
    // Update widget's fields
    const updatedWidget = {
      ...widget,
      fields: [...widget.fields, newField]
    };
    formWidgets.value = formWidgets.value.map(w => w.id === widgetId ? updatedWidget : w);
    
    selectedField.value = newField;
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

  // New: Update widget function
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

    // Remove field from widget
    formWidgets.value = formWidgets.value.map(widget => ({
      ...widget,
      fields: widget.fields.filter(field => field.id !== fieldId)
    }));
  });

  // New: Delete widget function
  const deleteWidget = $((widgetId: string) => {
    // Remove all fields belonging to the widget
    formFields.value = formFields.value.filter(field => field.widget !== widgetId);
    
    // Remove the widget
    formWidgets.value = formWidgets.value.filter(widget => widget.id !== widgetId);
    
    if (selectedWidget.value?.id === widgetId) {
      selectedWidget.value = null;
    }
  });

  const saveFormConfiguration = $(async () => {
    if (!currentConfig.value) return;

    isSaving.value = true;
    try {
      const configToSave: FormConfiguration = {
        ...currentConfig.value,
        fields: formFields.value,
        sections: formSections.value,
        widgets: formWidgets.value // New: Save widgets
      };
      
      const savedConfig = await mockSaveFormConfiguration(configToSave);
      currentConfig.value = savedConfig;
      
      showNotification(`Widget-Enhanced Formular für "${selectedRequirementType.value}" gespeichert! 🎉`, "success");
    } catch (error) {
      console.error("Error saving form configuration:", error);
      showNotification("Fehler beim Speichern der Formular-Konfiguration", "error");
    } finally {
      isSaving.value = false;
    }
  });

  const addNewSection = $(() => {
    const newSection: FormSection = {
      id: `section-${Date.now()}`,
      title: 'Neue Sektion',
      description: '',
      collapsible: true,
      collapsed: false,
      order: formSections.value.length + 1
    };

    formSections.value = [...formSections.value, newSection];
  });

  return (
    <div class="min-h-screen bg-white">
      {/* Notification */}
      {notification.value && (
        <div class={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.value.type === "success" ? "bg-green-500 text-white" : 
          notification.value.type === "error" ? "bg-red-500 text-white" : 
          "bg-blue-500 text-white"
        }`}>
          {notification.value.message}
        </div>
      )}

      {/* Enhanced Header */}
      <div class="card mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Widget-Enhanced Form Builder 🚀</h1>
            <p class="text-gray-600 mt-1">Intelligente Formulare mit Widgets, Smart Permissions und Workflow-Binding</p>
            {currentConfig.value && (
              <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>Version {currentConfig.value.version}</span>
                <span>•</span>
                <span>{formFields.value.length} Felder</span>
                <span>•</span>
                <span>{formWidgets.value.length} Widgets</span>
                <span>•</span>
                <span>{formSections.value.length} Sektionen</span>
              </div>
            )}
          </div>
          <div class="flex gap-3">
            <div class="flex items-center gap-2">
              <label class="text-sm font-medium text-gray-700">Modus:</label>
              <select 
                class="form-input text-sm"
                value={editMode.value}
                onChange$={(e) => {
                  editMode.value = (e.target as HTMLSelectElement).value as 'fields' | 'widgets';
                  selectedField.value = null;
                  selectedWidget.value = null;
                }}
              >
                <option value="fields">Felder</option>
                <option value="widgets">Widgets</option>
              </select>
            </div>
            <button 
              class="btn btn-secondary"
              onClick$={() => previewMode.value = !previewMode.value}
            >
              {previewMode.value ? "🛠️ Editor" : "👁️ Vorschau"}
            </button>
            <button 
              class="btn btn-primary"
              onClick$={saveFormConfiguration}
              disabled={isLoading.value || isSaving.value}
            >
              {isSaving.value ? "⏳ Speichere..." : "💾 Speichern"}
            </button>
          </div>
        </div>
      </div>

      {isLoading.value ? (
        <div class="card text-center py-12">
          <div class="text-4xl mb-4">⏳</div>
          <p class="text-lg font-medium">Widget-Enhanced Form Builder wird geladen...</p>
          <p class="text-sm text-gray-500 mt-2">Lade Widgets, Smart Permissions und Workflow-Bindings...</p>
        </div>
      ) : (
        <div class="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Templates & Widgets */}
          <div class="col-span-3">
            <div class="card mb-4">
              <h3 class="text-lg font-semibold mb-4">Anforderungsart</h3>
              <select 
                class="form-input"
                value={selectedRequirementType.value}
                onChange$={(e) => {
                  selectedRequirementType.value = (e.target as HTMLSelectElement).value;
                }}
              >
                {requirementTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Mode Toggle Tabs */}
            <div class="card mb-4">
              <div class="flex border-b mb-4">
                <button 
                  class={`px-4 py-2 text-sm font-medium border-b-2 ${
                    editMode.value === 'fields' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick$={() => {
                    editMode.value = 'fields';
                    selectedWidget.value = null;
                  }}
                >
                  📝 Einzelne Felder
                </button>
                <button 
                  class={`px-4 py-2 text-sm font-medium border-b-2 ${
                    editMode.value === 'widgets' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick$={() => {
                    editMode.value = 'widgets';
                    selectedField.value = null;
                  }}
                >
                  📦 Widget-Gruppen
                </button>
              </div>

              {editMode.value === 'fields' ? (
                <>
                  {/* Field Categories */}
                  <div class="flex flex-wrap gap-2 mb-4">
                    <button 
                      class={`px-3 py-1 text-xs rounded-full transition-colors ${
                        selectedTemplateCategory.value === "all" 
                          ? "bg-blue-500 text-white" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick$={() => selectedTemplateCategory.value = "all"}
                    >
                      Alle
                    </button>
                    <button 
                      class={`px-3 py-1 text-xs rounded-full transition-colors ${
                        selectedTemplateCategory.value === "basic" 
                          ? "bg-blue-500 text-white" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick$={() => selectedTemplateCategory.value = "basic"}
                    >
                      Basic
                    </button>
                    <button 
                      class={`px-3 py-1 text-xs rounded-full transition-colors ${
                        selectedTemplateCategory.value === "workflow" 
                          ? "bg-blue-500 text-white" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick$={() => selectedTemplateCategory.value = "workflow"}
                    >
                      Workflow
                    </button>
                    <button 
                      class={`px-3 py-1 text-xs rounded-full transition-colors ${
                        selectedTemplateCategory.value === "financial" 
                          ? "bg-blue-500 text-white" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick$={() => selectedTemplateCategory.value = "financial"}
                    >
                      Financial
                    </button>
                  </div>

                  {/* Field Templates */}
                  <div class="space-y-2 max-h-96 overflow-y-auto">
                    {getFilteredTemplates().map((template) => (
                      <button
                        key={template.id}
                        class="w-full flex items-center gap-3 p-3 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group text-left"
                        onClick$={() => addNewField(template)}
                      >
                        <div 
                          class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0"
                          style={`background-color: ${template.color}`}
                        >
                          {template.icon}
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="font-medium text-gray-700 group-hover:text-blue-700 text-sm">
                            {template.title}
                          </div>
                          <div class="text-xs text-gray-500 truncate">
                            {template.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Widget Categories */}
                  <div class="flex flex-wrap gap-2 mb-4">
                    <button 
                      class={`px-3 py-1 text-xs rounded-full transition-colors ${
                        selectedWidgetCategory.value === "all" 
                          ? "bg-purple-500 text-white" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick$={() => selectedWidgetCategory.value = "all"}
                    >
                      Alle
                    </button>
                    <button 
                      class={`px-3 py-1 text-xs rounded-full transition-colors ${
                        selectedWidgetCategory.value === "workflow" 
                          ? "bg-purple-500 text-white" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick$={() => selectedWidgetCategory.value = "workflow"}
                    >
                      Workflow
                    </button>
                    <button 
                      class={`px-3 py-1 text-xs rounded-full transition-colors ${
                        selectedWidgetCategory.value === "financial" 
                          ? "bg-purple-500 text-white" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick$={() => selectedWidgetCategory.value = "financial"}
                    >
                      Financial
                    </button>
                  </div>

                  {/* Widget Templates */}
                  <div class="space-y-2 max-h-96 overflow-y-auto">
                    {getFilteredWidgetTemplates().map((template) => (
                      <button
                        key={template.id}
                        class="w-full flex items-center gap-3 p-3 border-2 border-dashed border-purple-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group text-left"
                        onClick$={() => addNewWidget(template)}
                      >
                        <div 
                          class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0"
                          style={`background-color: ${template.color}`}
                        >
                          {template.icon}
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="font-medium text-gray-700 group-hover:text-purple-700 text-sm">
                            {template.title}
                          </div>
                          <div class="text-xs text-gray-500 truncate">
                            {template.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div class="card">
              <h4 class="text-lg font-semibold mb-4">Aktionen</h4>
              <div class="space-y-2">
                <button 
                  class="btn btn-secondary w-full text-sm"
                  onClick$={addNewSection}
                >
                  📂 Sektion hinzufügen
                </button>
              </div>
            </div>
          </div>

          {/* Center - Form Canvas */}
          <div class="col-span-6">
            <div class="card">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold">
                  Formular: {selectedRequirementType.value}
                </h3>
                <div class="flex items-center gap-3">
                  <span class="text-sm text-gray-500">
                    {formFields.value.length} Felder, {formWidgets.value.length} Widgets
                  </span>
                </div>
              </div>

              <div class="min-h-96 space-y-4">
                {formSections.value.map(section => {
                  const itemsInSection = getItemsBySection(section.id);
                  
                  return (
                    <div key={section.id} class="border rounded-lg p-4 bg-gray-50">
                      <div class="flex items-center justify-between mb-2">
                        <div>
                          <h4 class="font-medium text-gray-900">{section.title}</h4>
                          {section.description && (
                            <p class="text-sm text-gray-600">{section.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div class="space-y-3 min-h-20 p-4 rounded-lg border-2 border-dashed border-gray-200 bg-white">
                        {itemsInSection.map((item) => {
                          // Check if item is a widget or field
                          const isWidget = 'fields' in item;
                          
                          if (isWidget) {
                            // Render Widget
                            const widget = item as FormWidget;
                            return (
                              <div key={widget.id} class="relative">
                                <div 
                                  class={`
                                    group p-4 bg-purple-50 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md
                                    ${selectedWidget.value?.id === widget.id ? "border-purple-500 shadow-lg" : "border-purple-200 hover:border-purple-300"}
                                  `}
                                  onClick$={() => {
                                    selectedWidget.value = widget;
                                    selectedField.value = null;
                                  }}
                                >
                                  <div class="flex items-center gap-3 mb-3">
                                    <div 
                                      class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                                      style={`background-color: ${getWidgetColor(widget.type)}`}
                                    >
                                      {getWidgetIcon(widget.type)}
                                    </div>
                                    
                                    <div class="flex-1">
                                      <div class="flex items-center gap-2">
                                        <h4 class="font-medium text-gray-900">{widget.title}</h4>
                                        <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                          Widget
                                        </span>
                                      </div>
                                      {widget.description && (
                                        <p class="text-sm text-gray-500">{widget.description}</p>
                                      )}
                                    </div>

                                    {/* Widget Actions */}
                                    <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                      <button 
                                        class="p-1 text-purple-600 hover:bg-purple-100 rounded"
                                        onClick$={(e) => {
                                          e.stopPropagation();
                                          selectedWidget.value = widget;
                                        }}
                                      >
                                        ✏️
                                      </button>
                                      <button 
                                        class="p-1 text-red-600 hover:bg-red-100 rounded"
                                        onClick$={(e) => {
                                          e.stopPropagation();
                                          deleteWidget(widget.id);
                                        }}
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </div>

                                  {/* Widget Fields */}
                                  <div class="grid grid-cols-2 gap-2 pl-4 border-l-2 border-purple-200">
                                    {widget.fields.map(field => (
                                      <div 
                                        key={field.id} 
                                        class="p-2 bg-white border border-gray-200 rounded text-sm cursor-pointer hover:border-blue-300"
                                        onClick$={(e) => {
                                          e.stopPropagation();
                                          selectedField.value = field;
                                          selectedWidget.value = null;
                                        }}
                                      >
                                        <div class="flex items-center gap-2">
                                          <span class="text-xs">{getFieldIcon(field.type)}</span>
                                          <span class="text-xs font-medium truncate">{field.label}</span>
                                        </div>
                                      </div>
                                    ))}
                                    
                                    {/* Add Field to Widget Button */}
                                    <div class="p-2 border-2 border-dashed border-gray-300 rounded text-sm text-center text-gray-500 hover:border-blue-300 hover:text-blue-600 cursor-pointer">
                                      <span class="text-xs">+ Feld hinzufügen</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          } else {
                            // Render Field
                            const field = item as FormField;
                            return (
                              <div key={field.id} class="relative">
                                <div 
                                  class={`
                                    group p-3 bg-white border rounded-lg cursor-pointer transition-all hover:shadow-md
                                    ${selectedField.value?.id === field.id ? "border-blue-500 shadow-lg" : "border-gray-200 hover:border-gray-300"}
                                  `}
                                  onClick$={() => {
                                    selectedField.value = field;
                                    selectedWidget.value = null;
                                  }}
                                >
                                  <div class="flex items-center gap-3">
                                    <div 
                                      class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                                      style={`background-color: ${getFieldColor(field.type)}`}
                                    >
                                      {getFieldIcon(field.type)}
                                    </div>

                                    <div class="flex-1">
                                      <div class="flex items-center gap-2 flex-wrap">
                                        <h4 class="font-medium text-gray-900">{field.label}</h4>
                                        {field.required && (
                                          <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                            Pflicht
                                          </span>
                                        )}
                                      </div>
                                      <div class="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                        <span>{field.type}</span>
                                        <span>{FIELD_WIDTHS[field.width]}</span>
                                        <span>({field.name})</span>
                                      </div>
                                    </div>

                                    {/* Field Actions */}
                                    <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                      <button 
                                        class="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                        onClick$={(e) => {
                                          e.stopPropagation();
                                          selectedField.value = field;
                                        }}
                                      >
                                        ✏️
                                      </button>
                                      <button 
                                        class="p-1 text-red-600 hover:bg-red-100 rounded"
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
                              </div>
                            );
                          }
                        })}
                        
                        {itemsInSection.length === 0 && (
                          <div class="text-center py-8 text-gray-500">
                            <div class="text-2xl mb-2">📝</div>
                            <p class="text-sm">Ziehe Felder oder Widgets hier hinein</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {formSections.value.length === 0 && (
                  <div class="text-center py-12 text-gray-500">
                    <div class="text-4xl mb-4">📋</div>
                    <p class="text-lg font-medium">Keine Sektionen vorhanden</p>
                    <p class="text-sm">Erstelle eine Sektion, um Felder und Widgets hinzuzufügen</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Properties */}
          <div class="col-span-3">
            {selectedField.value && !selectedWidget.value ? (
              <div class="space-y-4">
                {/* Field Properties */}
                <div class="card">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold">Feld bearbeiten</h3>
                    <button 
                      class="text-gray-400 hover:text-gray-600"
                      onClick$={() => selectedField.value = null}
                    >
                      ✖️
                    </button>
                  </div>

                  <div class="space-y-4">
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

                    <div class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="required"
                        class="w-4 h-4"
                        checked={selectedField.value.required}
                        onChange$={(e) => updateField(selectedField.value!.id, { required: (e.target as HTMLInputElement).checked })}
                      />
                      <label for="required" class="text-sm font-medium text-gray-700">
                        Pflichtfeld
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedWidget.value ? (
              <div class="space-y-4">
                {/* Widget Properties */}
                <div class="card">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold">Widget bearbeiten</h3>
                    <button 
                      class="text-gray-400 hover:text-gray-600"
                      onClick$={() => selectedWidget.value = null}
                    >
                      ✖️
                    </button>
                  </div>

                  <div class="space-y-4">
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

                    <div class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="collapsible"
                        class="w-4 h-4"
                        checked={selectedWidget.value.collapsible}
                        onChange$={(e) => updateWidget(selectedWidget.value!.id, { collapsible: (e.target as HTMLInputElement).checked })}
                      />
                      <label for="collapsible" class="text-sm font-medium text-gray-700">
                        Einklappbar
                      </label>
                    </div>
                  </div>
                </div>

                {/* Widget Fields Management */}
                <div class="card">
                  <h4 class="text-lg font-semibold mb-4">Widget Felder ({selectedWidget.value.fields.length})</h4>
                  
                  <div class="space-y-2 mb-4 max-h-48 overflow-y-auto">
                    {selectedWidget.value.fields.map((field) => (
                      <div key={field.id} class="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div class="flex items-center gap-2">
                          <span class="text-sm">{getFieldIcon(field.type)}</span>
                          <span class="text-sm font-medium">{field.label}</span>
                        </div>
                        <button 
                          class="text-red-600 hover:bg-red-100 p-1 rounded"
                          onClick$={() => deleteField(field.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>

                  <div class="border-t pt-4">
                    <h5 class="text-sm font-medium mb-2">Feld hinzufügen:</h5>
                    <div class="grid grid-cols-2 gap-1">
                      {enhancedFieldTemplates.slice(0, 6).map((template) => (
                        <button
                          key={template.id}
                          class="p-2 text-xs bg-gray-100 hover:bg-blue-100 rounded transition-colors flex items-center gap-1"
                          onClick$={() => addFieldToWidget(selectedWidget.value!.id, template)}
                        >
                          <span>{template.icon}</span>
                          <span class="truncate">{template.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div class="card text-center py-8">
                <div class="text-4xl mb-4">
                  {editMode.value === 'widgets' ? '📦' : '📝'}
                </div>
                <h3 class="font-medium text-gray-900 mb-2">
                  {editMode.value === 'widgets' ? 'Kein Widget ausgewählt' : 'Kein Feld ausgewählt'}
                </h3>
                <p class="text-sm text-gray-500">
                  {editMode.value === 'widgets' 
                    ? 'Klicke auf ein Widget im Formular, um es zu bearbeiten'
                    : 'Klicke auf ein Feld im Formular, um es zu bearbeiten'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});