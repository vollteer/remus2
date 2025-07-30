// Script to seed the Kleinanforderung configuration into the database
import { FormBuilderAPI } from '~/services/api/forms-api-service';
import type { FormConfiguration, FormField, FormWidget } from '~/services/api/forms-api-service';

export const createKleinanforderungConfiguration = async (): Promise<FormConfiguration> => {
  const config: FormConfiguration = {
    id: `temp-${Date.now()}`, // Use temp ID to force POST instead of PUT
    name: 'Kleinanforderung - Antrag erstellen',
    description: 'Formular für Kleinanforderungen - Schritt 1: Antrag erstellen',
    workflowType: 'Kleinanforderung',
    lightModeEnabled: false,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    version: 'v1.0.0',
    fields: [
      // All fields are part of widgets for step 1
    ],
    widgets: [
      // Widget 1: Basisdaten
      {
        id: 'widget-basisdaten',
        type: 'customGroup',
        title: 'Basisdaten',
        description: 'Grundlegende Informationen zur Anforderung',
        order: 1,
        section: 'default',
        fields: [
          {
            id: 'field-titel',
            type: 'text',
            name: 'titel',
            label: 'Titel der Anforderung',
            placeholder: 'Kurze prägnante Bezeichnung',
            description: 'Geben Sie einen aussagekräftigen Titel ein',
            required: true,
            order: 1,
            width: 'full',
            workflowStepBinding: ['step-1'],
            permissions: {
              allowedRoles: ['Requester', 'Approver'],
              readOnlyRoles: [],
              hideFromRoles: []
            }
          },
          {
            id: 'field-beschreibung',
            type: 'textarea',
            name: 'beschreibung',
            label: 'Beschreibung',
            placeholder: 'Detaillierte Beschreibung der Anforderung...',
            description: 'Beschreiben Sie die Anforderung ausführlich',
            required: true,
            order: 2,
            width: 'full',
            workflowStepBinding: ['step-1'],
            permissions: {
              allowedRoles: ['Requester', 'Approver'],
              readOnlyRoles: [],
              hideFromRoles: []
            }
          },
          {
            id: 'field-zieltermin',
            type: 'date',
            name: 'zieltermin',
            label: 'Gewünschter Zieltermin',
            placeholder: '',
            description: 'Bis wann soll die Anforderung umgesetzt sein?',
            required: true,
            order: 3,
            width: 'half',
            workflowStepBinding: ['step-1'],
            permissions: {
              allowedRoles: ['Requester', 'Approver'],
              readOnlyRoles: [],
              hideFromRoles: []
            }
          },
          {
            id: 'field-prioritaet',
            type: 'select',
            name: 'prioritaet',
            label: 'Priorität',
            placeholder: 'Priorität auswählen',
            description: 'Wie dringend ist die Umsetzung?',
            required: true,
            order: 4,
            width: 'half',
            options: [
              { value: 'niedrig', label: 'Niedrig' },
              { value: 'mittel', label: 'Mittel' },
              { value: 'hoch', label: 'Hoch' },
              { value: 'kritisch', label: 'Kritisch' }
            ],
            workflowStepBinding: ['step-1'],
            permissions: {
              allowedRoles: ['Requester', 'Approver'],
              readOnlyRoles: [],
              hideFromRoles: []
            }
          }
        ],
        workflowStepBinding: ['step-1'],
        permissions: {
          allowedRoles: ['Requester', 'Approver'],
          readOnlyRoles: [],
          hideFromRoles: []
        }
      },
      // Widget 2: Zuständigkeiten
      {
        id: 'widget-zustaendigkeiten',
        type: 'zustaendigkeitGroup',
        title: 'Zuständigkeiten',
        description: 'Verantwortliche Personen für diese Anforderung',
        order: 2,
        section: 'default',
        fields: [
          {
            id: 'field-fachlicher-ansprechpartner',
            type: 'userSearch',
            name: 'fachlicher_ansprechpartner',
            label: 'Fachlicher Ansprechpartner',
            placeholder: 'Person suchen...',
            description: 'Wer ist fachlich verantwortlich?',
            required: true,
            order: 1,
            width: 'half',
            workflowStepBinding: ['step-1'],
            permissions: {
              allowedRoles: ['Requester', 'Approver'],
              readOnlyRoles: [],
              hideFromRoles: []
            }
          },
          {
            id: 'field-kostenstellenverantwortlicher',
            type: 'userSearch',
            name: 'kostenstellenverantwortlicher',
            label: 'Kostenstellenverantwortlicher',
            placeholder: 'Person suchen...',
            description: 'Wer genehmigt die Kosten?',
            required: true,
            order: 2,
            width: 'half',
            workflowStepBinding: ['step-1'],
            permissions: {
              allowedRoles: ['Requester', 'Approver'],
              readOnlyRoles: [],
              hideFromRoles: []
            }
          }
        ],
        workflowStepBinding: ['step-1'],
        permissions: {
          allowedRoles: ['Requester', 'Approver'],
          readOnlyRoles: [],
          hideFromRoles: []
        }
      },
      // Widget 3: Budget (AN/AG Layout)
      {
        id: 'widget-budget',
        type: 'budgetGroup',
        title: 'Geschätztes Budget',
        description: 'Aufwandsschätzung für Auftragnehmer und Auftraggeber',
        order: 3,
        section: 'default',
        fields: [
          // AN Felder
          {
            id: 'field-aufwand-entwicklung-an',
            type: 'currency',
            name: 'aufwand_an_entwicklung',
            label: 'Aufwand AN Entwicklung',
            placeholder: '0,00 €',
            description: 'Entwicklungsaufwand in EUR',
            required: false,
            order: 1,
            width: 'half',
            workflowStepBinding: ['step-1'],
            permissions: {
              allowedRoles: ['Requester', 'Approver'],
              readOnlyRoles: [],
              hideFromRoles: []
            }
          },
          {
            id: 'field-aufwand-test-an',
            type: 'currency',
            name: 'aufwand_an_test',
            label: 'Aufwand AN Test',
            placeholder: '0,00 €',
            description: 'Testaufwand in EUR',
            required: false,
            order: 2,
            width: 'half',
            workflowStepBinding: ['step-1'],
            permissions: {
              allowedRoles: ['Requester', 'Approver'],
              readOnlyRoles: [],
              hideFromRoles: []
            }
          },
          // AG Felder
          {
            id: 'field-aufwand-fachkonzept-ag',
            type: 'currency',
            name: 'aufwand_ag_fachkonzept',
            label: 'Aufwand AG Fachkonzept',
            placeholder: '0,00 €',
            description: 'Aufwand für Fachkonzept in EUR',
            required: false,
            order: 3,
            width: 'half',
            workflowStepBinding: ['step-1'],
            permissions: {
              allowedRoles: ['Requester', 'Approver'],
              readOnlyRoles: [],
              hideFromRoles: []
            }
          },
          {
            id: 'field-aufwand-abnahme-ag',
            type: 'currency',
            name: 'aufwand_ag_abnahme',
            label: 'Aufwand AG Abnahme',
            placeholder: '0,00 €',
            description: 'Aufwand für Abnahme in EUR',
            required: false,
            order: 4,
            width: 'half',
            workflowStepBinding: ['step-1'],
            permissions: {
              allowedRoles: ['Requester', 'Approver'],
              readOnlyRoles: [],
              hideFromRoles: []
            }
          }
        ],
        workflowStepBinding: ['step-1'],
        permissions: {
          allowedRoles: ['Requester', 'Approver'],
          readOnlyRoles: [],
          hideFromRoles: []
        }
      },
      // Widget 4: Zusätzliche Informationen
      {
        id: 'widget-zusatzinfo',
        type: 'customGroup',
        title: 'Zusätzliche Informationen',
        description: 'Weitere relevante Details',
        order: 4,
        section: 'default',
        fields: [
          {
            id: 'field-betroffene-systeme',
            type: 'text',
            name: 'betroffene_systeme',
            label: 'Betroffene Systeme',
            placeholder: 'z.B. SAP, CRM, Portal',
            description: 'Welche Systeme sind betroffen?',
            required: false,
            order: 1,
            width: 'full',
            workflowStepBinding: ['step-1'],
            permissions: {
              allowedRoles: ['Requester', 'Approver'],
              readOnlyRoles: [],
              hideFromRoles: []
            }
          },
          {
            id: 'field-referenz-anforderung',
            type: 'requirementSearch',
            name: 'referenz_anforderung',
            label: 'Referenz zu anderer Anforderung',
            placeholder: 'Anforderungsnummer eingeben...',
            description: 'Gibt es eine verwandte Anforderung?',
            required: false,
            order: 2,
            width: 'half',
            workflowStepBinding: ['step-1'],
            permissions: {
              allowedRoles: ['Requester', 'Approver'],
              readOnlyRoles: [],
              hideFromRoles: []
            }
          },
          {
            id: 'field-notizen',
            type: 'textarea',
            name: 'notizen',
            label: 'Weitere Notizen',
            placeholder: 'Zusätzliche Informationen...',
            description: 'Sonstige wichtige Hinweise',
            required: false,
            order: 3,
            width: 'full',
            workflowStepBinding: ['step-1'],
            permissions: {
              allowedRoles: ['Requester', 'Approver'],
              readOnlyRoles: [],
              hideFromRoles: []
            }
          }
        ],
        workflowStepBinding: ['step-1'],
        permissions: {
          allowedRoles: ['Requester', 'Approver'],
          readOnlyRoles: [],
          hideFromRoles: []
        }
      }
    ]
  };

  return config;
};

// Function to seed the configuration
export const seedKleinanforderungConfiguration = async (): Promise<void> => {
  try {
    console.log('🌱 Seeding Kleinanforderung configuration...');
    
    // First, try to load existing configuration to see if we should update or create
    let existingConfig: FormConfiguration | null = null;
    try {
      existingConfig = await FormBuilderAPI.loadFormConfiguration('Kleinanforderung');
      console.log('📋 Found existing configuration:', existingConfig?.id);
    } catch (loadError) {
      console.log('ℹ️ No existing configuration found, will create new one');
    }
    
    const config = await createKleinanforderungConfiguration();
    
    // If we have an existing config, use its ID for update
    if (existingConfig && !existingConfig.id?.startsWith('temp-')) {
      config.id = existingConfig.id;
      console.log('🔄 Will update existing configuration:', config.id);
    }
    
    const savedConfig = await FormBuilderAPI.saveFormConfiguration(config);
    
    if (savedConfig) {
      console.log('✅ Kleinanforderung configuration seeded successfully:', savedConfig.id);
      console.log('📊 Configuration includes:');
      console.log(`   - ${savedConfig.fields.length} individual fields`);
      console.log(`   - ${savedConfig.widgets.length} widget groups`);
      console.log(`   - Total widget fields: ${savedConfig.widgets.reduce((sum, w) => sum + w.fields.length, 0)}`);
      
      // Detailed breakdown
      console.log('🔍 Detailed breakdown:');
      savedConfig.widgets.forEach(widget => {
        console.log(`   - ${widget.title}: ${widget.fields.length} fields (${widget.type})`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to seed Kleinanforderung configuration:', error);
    
    // More detailed error information
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    
    throw error;
  }
};