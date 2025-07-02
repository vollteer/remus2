export type FieldType =
| 'text'
| 'textarea'
| 'number'
| 'email'
| 'phone'
| 'date'
| 'datetime'
| 'select'
| 'multiselect'
| 'radio'
| 'checkbox'
| 'checkboxGroup'
| 'file'
| 'currency'
| 'percentage'
| 'url'
| 'divider'
| 'heading';

export interface FieldOption {
value: string;
label: string;
disabled?: boolean;
}

export interface ValidationRule {
type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'email' | 'url';
value?: string | number;
message?: string;
}

export interface ConditionalRule {
field: string;
operator: 'equals' | 'notEquals' | 'contains' | 'isEmpty' | 'isNotEmpty' | 'greaterThan' | 'lessThan';
value?: string | number | boolean;
}

export interface FormField {
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
validation?: ValidationRule[];
conditionalRules?: ConditionalRule[];
order: number;
width: 'full' | 'half' | 'third' | 'quarter';
section?: string;
}

export interface FormSection {
id: string;
title: string;
description?: string;
collapsible?: boolean;
collapsed?: boolean;
order: number;
}

export interface FormConfiguration {
id: string;
name: string;
description?: string;
requirementType: string;
sections: FormSection[];
fields: FormField[];
version: number;
isActive: boolean;
createdAt: string;
modifiedAt: string;
createdBy: string;
}

// Default form configurations for different requirement types
const defaultFormConfigurations: Record<string, FormConfiguration> = {
'Kleinanforderung': {
id: 'form-klein-001',
name: 'Kleinanforderung Formular',
description: 'Standard Formular für kleine Anforderungen',
requirementType: 'Kleinanforderung',
version: 1,
isActive: true,
createdAt: '2025-01-01T00:00:00Z',
modifiedAt: '2025-01-01T00:00:00Z',
createdBy: 'System',
sections: [
{
id: 'section-1',
title: 'Grunddaten',
description: 'Allgemeine Informationen zur Anforderung',
collapsible: false,
collapsed: false,
order: 1
},
{
id: 'section-2',
title: 'Fachliche Details',
description: 'Detaillierte fachliche Beschreibung',
collapsible: true,
collapsed: false,
order: 2
},
{
id: 'section-3',
title: 'Prüffragen',
description: 'Compliance und Sicherheitsfragen',
collapsible: true,
collapsed: false,
order: 3
}
],
fields: [
{
id: 'field-1',
type: 'text',
name: 'shortDescription',
label: 'Kurzbezeichnung',
placeholder: 'Kurze Beschreibung der Anforderung',
required: true,
width: 'full',
section: 'section-1',
order: 1,
validation: [
{ type: 'required', message: 'Kurzbezeichnung ist erforderlich' },
{ type: 'minLength', value: 5, message: 'Mindestens 5 Zeichen' },
{ type: 'maxLength', value: 100, message: 'Maximal 100 Zeichen' }
]
},
{
id: 'field-2',
type: 'select',
name: 'realizationObject',
label: 'Realisierungsobjekt',
required: true,
width: 'half',
section: 'section-1',
order: 2,
options: [
{ value: '', label: 'Bitte wählen…' },
{ value: 'application', label: 'Anwendungssystem' },
{ value: 'component', label: 'Komponente' },
{ value: 'process', label: 'Prozess' },
{ value: 'hardware', label: 'Hardware' },
{ value: 'infrastructure', label: 'Infrastruktur' }
],
validation: [
{ type: 'required', message: 'Realisierungsobjekt ist erforderlich' }
]
},
{
id: 'field-3',
type: 'select',
name: 'priority',
label: 'Priorität',
required: true,
width: 'half',
section: 'section-1',
order: 3,
defaultValue: 'medium',
options: [
{ value: 'low', label: 'Niedrig' },
{ value: 'medium', label: 'Mittel' },
{ value: 'high', label: 'Hoch' },
{ value: 'urgent', label: 'Dringend' }
]
},
{
id: 'field-4',
type: 'currency',
name: 'budget',
label: 'Budget (€)',
placeholder: '0,00',
width: 'half',
section: 'section-1',
order: 4,
validation: [
{ type: 'min', value: 0, message: 'Budget muss positiv sein' }
]
},
{
id: 'field-5',
type: 'date',
name: 'targetDate',
label: 'Gewünschter Abschluss',
width: 'half',
section: 'section-1',
order: 5
},
{
id: 'field-6',
type: 'textarea',
name: 'currentSituation',
label: 'Ausgangssituation',
placeholder: 'Beschreibung der aktuellen Situation…',
width: 'full',
section: 'section-2',
order: 6,
validation: [
{ type: 'maxLength', value: 2000, message: 'Maximal 2000 Zeichen' }
]
},
{
id: 'field-7',
type: 'textarea',
name: 'objectives',
label: 'Ziele',
placeholder: 'Beschreibung der angestrebten Ziele…',
width: 'full',
section: 'section-2',
order: 7,
validation: [
{ type: 'maxLength', value: 2000, message: 'Maximal 2000 Zeichen' }
]
},
{
id: 'field-8',
type: 'checkboxGroup',
name: 'compliance',
label: 'Compliance Prüfungen',
width: 'full',
section: 'section-3',
order: 8,
options: [
{ value: 'dataProtection', label: 'Werden personenbezogene Daten verwendet?' },
{ value: 'security', label: 'Ist eine Sicherheitsprüfung erforderlich?' },
{ value: 'interfaces', label: 'Sind externe Schnittstellen betroffen?' },
{ value: 'riskAnalysis', label: 'Ist eine Risikoanalyse erforderlich?' }
]
}
]
},
'Großanforderung': {
id: 'form-gross-001',
name: 'Großanforderung Formular',
description: 'Umfassendes Formular für große Anforderungen',
requirementType: 'Großanforderung',
version: 1,
isActive: true,
createdAt: '2025-01-01T00:00:00Z',
modifiedAt: '2025-01-01T00:00:00Z',
createdBy: 'System',
sections: [
{
id: 'section-1',
title: 'Grunddaten',
description: 'Allgemeine Informationen zur Anforderung',
collapsible: false,
collapsed: false,
order: 1
},
{
id: 'section-2',
title: 'Business Case',
description: 'Geschäftsjustifikation und ROI',
collapsible: true,
collapsed: false,
order: 2
},
{
id: 'section-3',
title: 'Technische Details',
description: 'Technische Spezifikationen und Anforderungen',
collapsible: true,
collapsed: false,
order: 3
},
{
id: 'section-4',
title: 'Ressourcen & Timeline',
description: 'Personalplanung und Zeitschätzungen',
collapsible: true,
collapsed: false,
order: 4
},
{
id: 'section-5',
title: 'Compliance & Risiken',
description: 'Compliance-Anforderungen und Risikobewertung',
collapsible: true,
collapsed: false,
order: 5
}
],
fields: [
{
id: 'field-1',
type: 'text',
name: 'projectName',
label: 'Projektname',
placeholder: 'Eindeutiger Projektname',
required: true,
width: 'full',
section: 'section-1',
order: 1,
validation: [
{ type: 'required', message: 'Projektname ist erforderlich' },
{ type: 'minLength', value: 10, message: 'Mindestens 10 Zeichen' }
]
},
{
id: 'field-2',
type: 'select',
name: 'projectCategory',
label: 'Projektkategorie',
required: true,
width: 'half',
section: 'section-1',
order: 2,
options: [
{ value: '', label: 'Bitte wählen…' },
{ value: 'newDevelopment', label: 'Neuentwicklung' },
{ value: 'enhancement', label: 'Erweiterung' },
{ value: 'migration', label: 'Migration' },
{ value: 'integration', label: 'Integration' },
{ value: 'replacement', label: 'Ablösung' }
]
},
{
id: 'field-3',
type: 'select',
name: 'businessCriticality',
label: 'Geschäftskritikalität',
required: true,
width: 'half',
section: 'section-1',
order: 3,
options: [
{ value: 'low', label: 'Niedrig' },
{ value: 'medium', label: 'Mittel' },
{ value: 'high', label: 'Hoch' },
{ value: 'critical', label: 'Geschäftskritisch' }
]
},
{
id: 'field-4',
type: 'currency',
name: 'totalBudget',
label: 'Gesamtbudget (€)',
placeholder: '0,00',
required: true,
width: 'third',
section: 'section-2',
order: 4,
validation: [
{ type: 'required', message: 'Budget ist erforderlich' },
{ type: 'min', value: 10000, message: 'Mindestbudget für Großanforderung: 10.000€' }
]
},
{
id: 'field-5',
type: 'currency',
name: 'expectedSavings',
label: 'Erwartete Einsparungen (€/Jahr)',
placeholder: '0,00',
width: 'third',
section: 'section-2',
order: 5
},
{
id: 'field-6',
type: 'number',
name: 'roiMonths',
label: 'ROI Zeitraum (Monate)',
placeholder: '24',
width: 'third',
section: 'section-2',
order: 6,
validation: [
{ type: 'min', value: 1, message: 'ROI Zeitraum muss mindestens 1 Monat sein' }
]
},
{
id: 'field-7',
type: 'textarea',
name: 'businessJustification',
label: 'Geschäftsjustifikation',
placeholder: 'Detaillierte Begründung des Geschäftsnutzens…',
required: true,
width: 'full',
section: 'section-2',
order: 7,
validation: [
{ type: 'required', message: 'Geschäftsjustifikation ist erforderlich' },
{ type: 'minLength', value: 100, message: 'Mindestens 100 Zeichen' }
]
},
{
id: 'field-8',
type: 'multiselect',
name: 'technologies',
label: 'Geplante Technologien',
width: 'full',
section: 'section-3',
order: 8,
options: [
{ value: 'dotnet', label: '.NET Core' },
{ value: 'angular', label: 'Angular' },
{ value: 'react', label: 'React' },
{ value: 'sqlserver', label: 'SQL Server' },
{ value: 'oracle', label: 'Oracle' },
{ value: 'azure', label: 'Microsoft Azure' },
{ value: 'aws', label: 'Amazon AWS' },
{ value: 'kubernetes', label: 'Kubernetes' },
{ value: 'docker', label: 'Docker' }
]
},
{
id: 'field-9',
type: 'number',
name: 'expectedUsers',
label: 'Erwartete Benutzerzahl',
placeholder: '100',
width: 'half',
section: 'section-3',
order: 9,
validation: [
{ type: 'min', value: 1, message: 'Mindestens 1 Benutzer' }
]
},
{
id: 'field-10',
type: 'checkbox',
name: 'highAvailability',
label: 'Hochverfügbarkeit erforderlich (24/7)',
width: 'half',
section: 'section-3',
order: 10
},
{
id: 'field-11',
type: 'date',
name: 'projectStart',
label: 'Geplanter Projektstart',
required: true,
width: 'half',
section: 'section-4',
order: 11
},
{
id: 'field-12',
type: 'date',
name: 'targetGoLive',
label: 'Angestrebtes Go-Live',
required: true,
width: 'half',
section: 'section-4',
order: 12
},
{
id: 'field-13',
type: 'number',
name: 'teamSize',
label: 'Geschätzte Teamgröße',
placeholder: '5',
width: 'half',
section: 'section-4',
order: 13,
validation: [
{ type: 'min', value: 1, message: 'Mindestens 1 Teammitglied' }
]
},
{
id: 'field-14',
type: 'checkboxGroup',
name: 'complianceRequirements',
label: 'Compliance Anforderungen',
width: 'full',
section: 'section-5',
order: 14,
options: [
{ value: 'gdpr', label: 'DSGVO / GDPR Compliance' },
{ value: 'sox', label: 'SOX Compliance' },
{ value: 'iso27001', label: 'ISO 27001' },
{ value: 'pci', label: 'PCI DSS' },
{ value: 'hipaa', label: 'HIPAA' }
]
},
{
id: 'field-15',
type: 'select',
name: 'riskLevel',
label: 'Risikobewertung',
required: true,
width: 'half',
section: 'section-5',
order: 15,
options: [
{ value: 'low', label: 'Niedrig' },
{ value: 'medium', label: 'Mittel' },
{ value: 'high', label: 'Hoch' },
{ value: 'very-high', label: 'Sehr hoch' }
]
}
]
}
};

// Field templates for the form builder
export const fieldTemplates = [
{
id: 'template-text',
type: 'text' as FieldType,
icon: '📝',
title: 'Text',
description: 'Einzeiliges Textfeld',
color: '#3b82f6'
},
{
id: 'template-textarea',
type: 'textarea' as FieldType,
icon: '📄',
title: 'Textarea',
description: 'Mehrzeiliges Textfeld',
color: '#6366f1'
},
{
id: 'template-number',
type: 'number' as FieldType,
icon: '🔢',
title: 'Zahl',
description: 'Numerisches Eingabefeld',
color: '#8b5cf6'
},
{
id: 'template-currency',
type: 'currency' as FieldType,
icon: '💰',
title: 'Währung',
description: 'Währungsfeld mit Euro-Symbol',
color: '#10b981'
},
{
id: 'template-date',
type: 'date' as FieldType,
icon: '📅',
title: 'Datum',
description: 'Datumsauswahl',
color: '#f59e0b'
},
{
id: 'template-select',
type: 'select' as FieldType,
icon: '📋',
title: 'Dropdown',
description: 'Einfachauswahl Dropdown',
color: '#ef4444'
},
{
id: 'template-multiselect',
type: 'multiselect' as FieldType,
icon: '☑️',
title: 'Mehrfachauswahl',
description: 'Dropdown mit Mehrfachauswahl',
color: '#ec4899'
},
{
id: 'template-radio',
type: 'radio' as FieldType,
icon: '🔘',
title: 'Radio Buttons',
description: 'Einzelauswahl mit Radio Buttons',
color: '#14b8a6'
},
{
id: 'template-checkbox',
type: 'checkbox' as FieldType,
icon: '☑️',
title: 'Checkbox',
description: 'Einzelne Checkbox',
color: '#84cc16'
},
{
id: 'template-checkboxGroup',
type: 'checkboxGroup' as FieldType,
icon: '✅',
title: 'Checkbox Gruppe',
description: 'Mehrere Checkboxen',
color: '#06b6d4'
},
{
id: 'template-email',
type: 'email' as FieldType,
icon: '📧',
title: 'E-Mail',
description: 'E-Mail Adressfeld',
color: '#8b5cf6'
},
{
id: 'template-phone',
type: 'phone' as FieldType,
icon: '📞',
title: 'Telefon',
description: 'Telefonnummer',
color: '#06b6d4'
},
{
id: 'template-url',
type: 'url' as FieldType,
icon: '🔗',
title: 'URL',
description: 'Website URL',
color: '#3b82f6'
},
{
id: 'template-file',
type: 'file' as FieldType,
icon: '📎',
title: 'Datei',
description: 'Datei Upload',
color: '#64748b'
},
{
id: 'template-divider',
type: 'divider' as FieldType,
icon: '➖',
title: 'Trennlinie',
description: 'Visuelle Trennung',
color: '#94a3b8'
},
{
id: 'template-heading',
type: 'heading' as FieldType,
icon: '🔤',
title: 'Überschrift',
description: 'Abschnittsüberschrift',
color: '#1f2937'
}
];

// Simulate API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockFormBuilderService {

// Get form configuration by requirement type
static async getFormConfiguration(requirementType: string): Promise<FormConfiguration | null> {
await delay(200);


const stored = localStorage.getItem(`form-config-${requirementType}`);
if (stored) {
  try {
    return JSON.parse(stored);
  } catch {
    // Fall back to default if parsing fails
  }
}

return defaultFormConfigurations[requirementType] || null;


}

// Get all form configurations
static async getAllFormConfigurations(): Promise<FormConfiguration[]> {
await delay(300);


const configs: FormConfiguration[] = [];
const requirementTypes = Object.keys(defaultFormConfigurations);

for (const type of requirementTypes) {
  const config = await this.getFormConfiguration(type);
  if (config) {
    configs.push(config);
  }
}

return configs;


}

// Save form configuration
static async saveFormConfiguration(config: FormConfiguration): Promise<FormConfiguration> {
await delay(400);


const savedConfig: FormConfiguration = {
  ...config,
  modifiedAt: new Date().toISOString(),
  version: config.version + 1
};

localStorage.setItem(`form-config-${config.requirementType}`, JSON.stringify(savedConfig));
return savedConfig;


}

// Create new form configuration
static async createFormConfiguration(requirementType: string, name: string): Promise<FormConfiguration> {
await delay(300);


const newConfig: FormConfiguration = {
  id: `form-${requirementType.toLowerCase()}-${Date.now()}`,
  name,
  description: `Formular für ${requirementType}`,
  requirementType,
  sections: [
    {
      id: "section-1",
      title: "Grunddaten",
      description: "Grundlegende Informationen",
      collapsible: false,
      collapsed: false,
      order: 1
    }
  ],
  fields: [],
  version: 1,
  isActive: true,
  createdAt: new Date().toISOString(),
  modifiedAt: new Date().toISOString(),
  createdBy: "Current User"
};

localStorage.setItem(`form-config-${requirementType}`, JSON.stringify(newConfig));
return newConfig;


}

// Reset form to default
static async resetFormToDefault(requirementType: string): Promise<FormConfiguration> {
await delay(200);


const defaultConfig = defaultFormConfigurations[requirementType];
if (!defaultConfig) {
  throw new Error(`No default form found for type: ${requirementType}`);
}

localStorage.removeItem(`form-config-${requirementType}`);
return defaultConfig;


}

// Validate form configuration
static async validateFormConfiguration(config: FormConfiguration): Promise<{ isValid: boolean; errors: string[] }> {
await delay(150);


const errors: string[] = [];

if (!config.name || config.name.trim().length === 0) {
  errors.push("Formular-Name ist erforderlich");
}

if (config.fields.length === 0) {
  errors.push("Mindestens ein Feld ist erforderlich");
}

// Check for duplicate field names
const fieldNames = config.fields.map(f => f.name);
const duplicateNames = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index);
if (duplicateNames.length > 0) {
  errors.push(`Doppelte Feldnamen gefunden: ${duplicateNames.join(", ")}`);
}

// Check for required fields without labels
const fieldsWithoutLabels = config.fields.filter(f => !f.label || f.label.trim().length === 0);
if (fieldsWithoutLabels.length > 0) {
  errors.push("Alle Felder müssen ein Label haben");
}

// Check select fields have options
const selectFields = config.fields.filter(f => ["select", "multiselect", "radio", "checkboxGroup"].includes(f.type));
const selectFieldsWithoutOptions = selectFields.filter(f => !f.options || f.options.length === 0);
if (selectFieldsWithoutOptions.length > 0) {
  errors.push("Auswahl-Felder müssen Optionen haben");
}

return {
  isValid: errors.length === 0,
  errors
};


}

// Export form configuration
static async exportFormConfiguration(requirementType: string): Promise<Blob> {
await delay(100);


const config = await this.getFormConfiguration(requirementType);
if (!config) {
  throw new Error("Form configuration not found");
}

const exportData = {
  ...config,
  exportedAt: new Date().toISOString(),
  exportedBy: "Current User"
};

return new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });


}

// Import form configuration
static async importFormConfiguration(file: File): Promise<FormConfiguration> {
await delay(300);


return new Promise((resolve, reject) => {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target?.result as string);
      
      if (!imported.requirementType || !imported.name || !imported.fields) {
        reject(new Error("Invalid form configuration file format"));
        return;
      }
      
      const importedConfig: FormConfiguration = {
        ...imported,
        id: `form-${imported.requirementType.toLowerCase()}-${Date.now()}`,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        version: 1
      };
      
      localStorage.setItem(`form-config-${importedConfig.requirementType}`, JSON.stringify(importedConfig));
      resolve(importedConfig);
    } catch (error) {
      reject(new Error("Failed to parse form configuration file"));
    }
  };
  
  reader.onerror = () => reject(new Error("Failed to read file"));
  reader.readAsText(file);
});


}

// Get field templates
static async getFieldTemplates() {
await delay(100);
return fieldTemplates;
}
}
