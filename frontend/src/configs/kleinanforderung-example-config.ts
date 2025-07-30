// Beispielkonfiguration für Kleinanforderung
// Basierend auf den spezifizierten Anforderungen

import { FormConfiguration, FormWidget, FormField, FormSection } from '../components/administration/widget-enhanced-form-builder';

export const kleinanforderungExampleConfig: FormConfiguration = {
  id: 'kleinanforderung-example-001',
  name: 'Kleinanforderung - Vollständige Konfiguration',
  description: 'Komplette Formular-Konfiguration für Kleinanforderungen mit allen spezifizierten Feldern und Widgets',
  requirementType: 'Kleinanforderung',
  version: 1,
  isActive: true,
  hasLightMode: true,
  createdAt: new Date().toISOString(),
  modifiedAt: new Date().toISOString(),
  createdBy: 'System',
  lightMode: {
    enabled: true,
    title: 'Kleinanforderung - Schnellerstellung',
    description: 'Nur die wichtigsten Felder für eine schnelle Erfassung'
  },
  
  // Sektionen
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

  // Einzelfelder (nicht in Widgets)
  fields: [
    // Sektion: Anforderung erfassen
    {
      id: 'field-anforderungsart',
      type: 'select',
      name: 'anforderungsart',
      label: 'Anforderungsart',
      placeholder: 'Bitte wählen...',
      required: true,
      lightModeVisible: true,
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
      lightModeVisible: true,
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
      lightModeVisible: true,
      width: 'half',
      section: 'section-anforderung-erfassen',
      order: 3,
      defaultValue: new Date().toISOString().split('T')[0]
    },
    {
      id: 'field-anwendungsbetreuer',
      type: 'userSearch',
      name: 'anwendungsbetreuer',
      label: 'Anwendungsbetreuer',
      placeholder: 'User in der Gruppe "Anwendungsbetreuer" suchen...',
      description: 'Suchfeld für User in der Gruppe "Anwendungsbetreuer"',
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
      description: 'Suchfeld für User in der Gruppe "IT-Systemverantwortliche"',
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
      description: 'Freitextfeld für eine kurze Beschreibung',
      required: true,
      lightModeVisible: true,
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
      description: 'Freitextfeld zur Beschreibung der Ausgangslage',
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
      description: 'Freitextfeld zur Beschreibung der Ziele',
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
      defaultValue: 'mittel',
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
      description: 'Suchfeld für andere Anforderungen',
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
      description: 'Suchfeld für AWS-Release',
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
      description: 'Textfeld für Release-Bezeichnung',
      required: false,
      width: 'half',
      section: 'section-bezuege',
      order: 3
    }
  ],

  // Widgets
  widgets: [
    // Widget: Zuständigkeiten
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
          description: 'User, der die Anforderung erfasst hat',
          required: true,
          lightModeVisible: true,
          width: 'half',
          order: 1,
          widget: 'widget-zustaendigkeiten',
          defaultValue: 'current_user' // Wird automatisch gesetzt
        },
        {
          id: 'widget-field-anforderungsverantwortlicher',
          type: 'userSearch',
          name: 'anforderungsverantwortlicher',
          label: 'Anforderungsverantwortlicher',
          placeholder: 'Verantwortlichen User suchen...',
          description: 'Hauptverantwortlicher für die Anforderung',
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
          description: 'Person, die die Anforderung genehmigen muss',
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
          description: 'Zuständiger IT-Koordinator',
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
          description: 'Zuständiger Solution Manager',
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
          description: 'Zuständiger IT Anforderungsmanager',
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
          description: 'Zuständiger Release Manager',
          required: false,
          width: 'half',
          order: 7,
          widget: 'widget-zustaendigkeiten'
        }
      ]
    },

    // Widget: Budget und Termine
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
      config: {
        columns: ['AN', 'AG'],
        showTermine: true,
        showBudget: true,
        showVorhaben: true,
        terminTypes: ['Starttermin', 'Technische Integration', 'Migration', 'Testbeginn', 'E2E-Test', 'Go-Live']
      },
      fields: [
        // Termine AN
        {
          id: 'widget-field-starttermin-an',
          type: 'date',
          name: 'starttermin_an',
          label: 'Starttermin (AN)',
          description: 'Geplanter Starttermin für Auftragnehmer',
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
          description: 'Geplanter Starttermin für Auftraggeber',
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
          description: 'Termin für technische Integration - Auftragnehmer',
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
          description: 'Termin für technische Integration - Auftraggeber',
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
          description: 'Migrationstermin - Auftragnehmer',
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
          description: 'Migrationstermin - Auftraggeber',
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
          description: 'Beginn der Testphase - Auftragnehmer',
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
          description: 'Beginn der Testphase - Auftraggeber',
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
          description: 'Ende-zu-Ende Test - Auftragnehmer',
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
          description: 'Ende-zu-Ende Test - Auftraggeber',
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
          description: 'Produktivgang - Auftragnehmer',
          required: false,
          width: 'half',
          order: 11,
          widget: 'widget-budget-terme'
        },
        {
          id: 'widget-field-go-live-ag',
          type: 'date',
          name: 'go_live_ag',
          label: 'Go-Live (AG)',
          description: 'Produktivgang - Auftraggeber',
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
          description: 'Budget für den Fachbereich - Auftragnehmer',
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
          description: 'Budget für den Fachbereich - Auftraggeber',
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
          description: 'Suchfeld für Vorhaben (aktuell Dummy-Werte, später Datenbankanbindung)',
          required: false,
          width: 'full',
          order: 15,
          widget: 'widget-budget-termine'
        }
      ]
    },

    // Widget: Prüfung fachliche Einschätzung
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
          description: 'Ja/Nein-Checkbox: Ist eine Änderung des Schutzbedarfs erforderlich?',
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
          description: 'Ja/Nein-Checkbox: Datenschutz-relevante Prüfung',
          required: false,
          width: 'full',
          order: 2,
          widget: 'widget-pruefung-einschaetzung'
        }
      ]
    }
  ]
};

// Hilfsfunktion zur Erstellung einer Kleinanforderung mit Beispieldaten
export const createKleinanforderungExample = (): FormConfiguration => {
  return {
    ...kleinanforderungExampleConfig,
    id: `kleinanforderung-${Date.now()}`,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };
};

// Export der einzelnen Widget-Definitionen für Referenz
export const kleinanforderungWidgets = {
  zustaendigkeiten: kleinanforderungExampleConfig.widgets[0],
  budgetTermine: kleinanforderungExampleConfig.widgets[1],
  pruefungEinschaetzung: kleinanforderungExampleConfig.widgets[2]
};

// Export der Feldgruppen nach Sektionen
export const kleinanforderungFieldsBySection = {
  anforderungErfassen: kleinanforderungExampleConfig.fields.filter(f => f.section === 'section-anforderung-erfassen'),
  zusatzinformationen: kleinanforderungExampleConfig.fields.filter(f => f.section === 'section-zusatzinformationen'),
  bezuege: kleinanforderungExampleConfig.fields.filter(f => f.section === 'section-bezuege')
};