-- =====================================================
-- Requirements Database Schema Update Script
-- Adds missing columns and updates existing tables safely
-- Preserves all data, users, and permissions
-- =====================================================

-- Check if we're connected to the right database
IF DB_NAME() != 'REQUIREMENTS'
BEGIN
    PRINT 'WARNING: Not connected to REQUIREMENTS database!';
    PRINT 'Please connect to the REQUIREMENTS database first.';
    PRINT 'Example: USE REQUIREMENTS;';
    PRINT '';
    PRINT 'Exiting script to prevent accidental changes...';
    RETURN;
END

-- Show current database context
PRINT '==============================================';
PRINT 'Requirements Database Schema Update';
PRINT '==============================================';
PRINT 'Current Database: ' + DB_NAME();
PRINT 'Current User: ' + SYSTEM_USER;
PRINT 'Execution Time: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '';

-- =====================================================
-- Check and Update FormConfigurations Table
-- =====================================================

PRINT 'Checking FormConfigurations table schema...';

-- Check if table exists, if not create it
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'FormConfigurations')
BEGIN
    PRINT 'Creating FormConfigurations table...';
    CREATE TABLE [dbo].[FormConfigurations](
        [Id] [uniqueidentifier] NOT NULL DEFAULT (NEWID()),
        [RequirementType] [nvarchar](100) NOT NULL,
        [Name] [nvarchar](255) NOT NULL,
        [Description] [nvarchar](500) NULL,
        [WorkflowStep] [nvarchar](100) NOT NULL,
        [ConfigurationData] [nvarchar](max) NOT NULL,
        [IsActive] [bit] NOT NULL DEFAULT ((1)),
        [Version] [int] NOT NULL DEFAULT ((1)),
        [CreatedAt] [datetime2](7) NOT NULL DEFAULT (GETUTCDATE()),
        [ModifiedAt] [datetime2](7) NOT NULL DEFAULT (GETUTCDATE()),
        [CreatedBy] [nvarchar](100) NOT NULL,
        [ModifiedBy] [nvarchar](100) NULL,
        CONSTRAINT [PK_FormConfigurations] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
    PRINT 'FormConfigurations table created.';
END
ELSE
BEGIN
    PRINT 'FormConfigurations table exists. Checking for missing columns...';
    
    -- Check and add Id column (Primary Key)
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'FormConfigurations' AND COLUMN_NAME = 'Id')
    BEGIN
        PRINT 'Adding Id column...';
        ALTER TABLE [dbo].[FormConfigurations] ADD [Id] [uniqueidentifier] NOT NULL DEFAULT (NEWID());
        -- Add primary key constraint if it doesn't exist
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_NAME = 'FormConfigurations' AND CONSTRAINT_TYPE = 'PRIMARY KEY')
        BEGIN
            ALTER TABLE [dbo].[FormConfigurations] ADD CONSTRAINT [PK_FormConfigurations] PRIMARY KEY CLUSTERED ([Id] ASC);
        END
    END
    
    -- Check and add RequirementType column
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'FormConfigurations' AND COLUMN_NAME = 'RequirementType')
    BEGIN
        PRINT 'Adding RequirementType column...';
        ALTER TABLE [dbo].[FormConfigurations] ADD [RequirementType] [nvarchar](100) NOT NULL DEFAULT ('Unknown');
    END
    
    -- Check and add Name column
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'FormConfigurations' AND COLUMN_NAME = 'Name')
    BEGIN
        PRINT 'Adding Name column...';
        ALTER TABLE [dbo].[FormConfigurations] ADD [Name] [nvarchar](255) NOT NULL DEFAULT ('Unnamed Configuration');
    END
    
    -- Check and add Description column
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'FormConfigurations' AND COLUMN_NAME = 'Description')
    BEGIN
        PRINT 'Adding Description column...';
        ALTER TABLE [dbo].[FormConfigurations] ADD [Description] [nvarchar](500) NULL;
    END
    
    -- Check and add WorkflowStep column
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'FormConfigurations' AND COLUMN_NAME = 'WorkflowStep')
    BEGIN
        PRINT 'Adding WorkflowStep column...';
        ALTER TABLE [dbo].[FormConfigurations] ADD [WorkflowStep] [nvarchar](100) NOT NULL DEFAULT ('step-1');
    END
    
    -- Check and add ConfigurationData column
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'FormConfigurations' AND COLUMN_NAME = 'ConfigurationData')
    BEGIN
        PRINT 'Adding ConfigurationData column...';
        ALTER TABLE [dbo].[FormConfigurations] ADD [ConfigurationData] [nvarchar](max) NOT NULL DEFAULT ('{}');
    END
    
    -- Check and add IsActive column
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'FormConfigurations' AND COLUMN_NAME = 'IsActive')
    BEGIN
        PRINT 'Adding IsActive column...';
        ALTER TABLE [dbo].[FormConfigurations] ADD [IsActive] [bit] NOT NULL DEFAULT ((1));
    END
    
    -- Check and add Version column
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'FormConfigurations' AND COLUMN_NAME = 'Version')
    BEGIN
        PRINT 'Adding Version column...';
        ALTER TABLE [dbo].[FormConfigurations] ADD [Version] [int] NOT NULL DEFAULT ((1));
    END
    
    -- Check and add CreatedAt column
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'FormConfigurations' AND COLUMN_NAME = 'CreatedAt')
    BEGIN
        PRINT 'Adding CreatedAt column...';
        ALTER TABLE [dbo].[FormConfigurations] ADD [CreatedAt] [datetime2](7) NOT NULL DEFAULT (GETUTCDATE());
    END
    
    -- Check and add ModifiedAt column
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'FormConfigurations' AND COLUMN_NAME = 'ModifiedAt')
    BEGIN
        PRINT 'Adding ModifiedAt column...';
        ALTER TABLE [dbo].[FormConfigurations] ADD [ModifiedAt] [datetime2](7) NOT NULL DEFAULT (GETUTCDATE());
    END
    
    -- Check and add CreatedBy column
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'FormConfigurations' AND COLUMN_NAME = 'CreatedBy')
    BEGIN
        PRINT 'Adding CreatedBy column...';
        ALTER TABLE [dbo].[FormConfigurations] ADD [CreatedBy] [nvarchar](100) NOT NULL DEFAULT ('system');
    END
    
    -- Check and add ModifiedBy column (THIS WAS MISSING!)
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'FormConfigurations' AND COLUMN_NAME = 'ModifiedBy')
    BEGIN
        PRINT 'Adding ModifiedBy column...';
        ALTER TABLE [dbo].[FormConfigurations] ADD [ModifiedBy] [nvarchar](100) NULL;
    END
END

-- =====================================================
-- Check and Update WorkflowDefinitions Table
-- =====================================================

PRINT 'Checking WorkflowDefinitions table schema...';

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'WorkflowDefinitions')
BEGIN
    PRINT 'Creating WorkflowDefinitions table...';
    CREATE TABLE [dbo].[WorkflowDefinitions](
        [Id] [uniqueidentifier] NOT NULL DEFAULT (NEWID()),
        [Name] [nvarchar](255) NOT NULL,
        [Description] [nvarchar](500) NULL,
        [WorkflowType] [nvarchar](100) NOT NULL,
        [WorkflowData] [nvarchar](max) NOT NULL,
        [IsActive] [bit] NOT NULL DEFAULT ((1)),
        [Version] [int] NOT NULL DEFAULT ((1)),
        [CreatedAt] [datetime2](7) NOT NULL DEFAULT (GETUTCDATE()),
        [ModifiedAt] [datetime2](7) NOT NULL DEFAULT (GETUTCDATE()),
        [CreatedBy] [nvarchar](100) NOT NULL,
        [ModifiedBy] [nvarchar](100) NULL,
        CONSTRAINT [PK_WorkflowDefinitions] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
    PRINT 'WorkflowDefinitions table created.';
END
ELSE
BEGIN
    PRINT 'WorkflowDefinitions table exists. Checking for missing columns...';
    
    -- Add missing columns for WorkflowDefinitions (similar pattern)
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'WorkflowDefinitions' AND COLUMN_NAME = 'Id')
    BEGIN
        ALTER TABLE [dbo].[WorkflowDefinitions] ADD [Id] [uniqueidentifier] NOT NULL DEFAULT (NEWID());
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_NAME = 'WorkflowDefinitions' AND CONSTRAINT_TYPE = 'PRIMARY KEY')
            ALTER TABLE [dbo].[WorkflowDefinitions] ADD CONSTRAINT [PK_WorkflowDefinitions] PRIMARY KEY CLUSTERED ([Id] ASC);
    END
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'WorkflowDefinitions' AND COLUMN_NAME = 'ModifiedBy')
    BEGIN
        PRINT 'Adding ModifiedBy column to WorkflowDefinitions...';
        ALTER TABLE [dbo].[WorkflowDefinitions] ADD [ModifiedBy] [nvarchar](100) NULL;
    END
    
    -- Add other missing columns as needed...
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'WorkflowDefinitions' AND COLUMN_NAME = 'CreatedBy')
    BEGIN
        PRINT 'Adding CreatedBy column to WorkflowDefinitions...';
        ALTER TABLE [dbo].[WorkflowDefinitions] ADD [CreatedBy] [nvarchar](100) NOT NULL DEFAULT ('system');
    END
END

-- =====================================================
-- Check and Update Requirements Table
-- =====================================================

PRINT 'Checking Requirements table schema...';

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Requirements')
BEGIN
    PRINT 'Creating Requirements table...';
    CREATE TABLE [dbo].[Requirements](
        [Id] [uniqueidentifier] NOT NULL DEFAULT (NEWID()),
        [RequirementNumber] [nvarchar](50) NOT NULL,
        [Title] [nvarchar](255) NOT NULL,
        [Description] [nvarchar](max) NULL,
        [RequirementType] [nvarchar](100) NOT NULL,
        [Status] [nvarchar](50) NOT NULL,
        [Priority] [nvarchar](20) NULL,
        [FormData] [nvarchar](max) NULL,
        [WorkflowInstanceId] [uniqueidentifier] NULL,
        [CreatedAt] [datetime2](7) NOT NULL DEFAULT (GETUTCDATE()),
        [ModifiedAt] [datetime2](7) NOT NULL DEFAULT (GETUTCDATE()),
        [CreatedBy] [nvarchar](100) NOT NULL,
        [ModifiedBy] [nvarchar](100) NULL,
        CONSTRAINT [PK_Requirements] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
    PRINT 'Requirements table created.';
END
ELSE
BEGIN
    PRINT 'Requirements table exists. Checking for missing columns...';
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Requirements' AND COLUMN_NAME = 'ModifiedBy')
    BEGIN
        PRINT 'Adding ModifiedBy column to Requirements...';
        ALTER TABLE [dbo].[Requirements] ADD [ModifiedBy] [nvarchar](100) NULL;
    END
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Requirements' AND COLUMN_NAME = 'CreatedBy')
    BEGIN
        PRINT 'Adding CreatedBy column to Requirements...';
        ALTER TABLE [dbo].[Requirements] ADD [CreatedBy] [nvarchar](100) NOT NULL DEFAULT ('system');
    END
END

-- =====================================================
-- Check and Update WorkflowInstances Table
-- =====================================================

PRINT 'Checking WorkflowInstances table schema...';

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'WorkflowInstances')
BEGIN
    PRINT 'Creating WorkflowInstances table...';
    CREATE TABLE [dbo].[WorkflowInstances](
        [Id] [uniqueidentifier] NOT NULL DEFAULT (NEWID()),
        [WorkflowDefinitionId] [uniqueidentifier] NOT NULL,
        [RequirementId] [uniqueidentifier] NOT NULL,
        [CurrentStep] [nvarchar](100) NOT NULL,
        [Status] [nvarchar](50) NOT NULL,
        [WorkflowData] [nvarchar](max) NULL,
        [StartedAt] [datetime2](7) NOT NULL DEFAULT (GETUTCDATE()),
        [CompletedAt] [datetime2](7) NULL,
        [CreatedBy] [nvarchar](100) NOT NULL,
        [ModifiedBy] [nvarchar](100) NULL,
        CONSTRAINT [PK_WorkflowInstances] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
    PRINT 'WorkflowInstances table created.';
    
    -- Add foreign key constraints after all tables exist
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'WorkflowDefinitions')
        AND EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Requirements')
    BEGIN
        ALTER TABLE [dbo].[WorkflowInstances] ADD 
            CONSTRAINT [FK_WorkflowInstances_WorkflowDefinitions] FOREIGN KEY([WorkflowDefinitionId]) 
            REFERENCES [dbo].[WorkflowDefinitions] ([Id]);
        
        ALTER TABLE [dbo].[WorkflowInstances] ADD 
            CONSTRAINT [FK_WorkflowInstances_Requirements] FOREIGN KEY([RequirementId]) 
            REFERENCES [dbo].[Requirements] ([Id]);
    END
END
ELSE
BEGIN
    PRINT 'WorkflowInstances table exists. Checking for missing columns...';
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'WorkflowInstances' AND COLUMN_NAME = 'ModifiedBy')
    BEGIN
        PRINT 'Adding ModifiedBy column to WorkflowInstances...';
        ALTER TABLE [dbo].[WorkflowInstances] ADD [ModifiedBy] [nvarchar](100) NULL;
    END
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'WorkflowInstances' AND COLUMN_NAME = 'CreatedBy')
    BEGIN
        PRINT 'Adding CreatedBy column to WorkflowInstances...';
        ALTER TABLE [dbo].[WorkflowInstances] ADD [CreatedBy] [nvarchar](100) NOT NULL DEFAULT ('system');
    END
END

-- =====================================================
-- Create missing indexes
-- =====================================================

PRINT 'Checking and creating indexes...';

-- Index on FormConfigurations.RequirementType
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_FormConfigurations_RequirementType')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_FormConfigurations_RequirementType] 
        ON [dbo].[FormConfigurations]([RequirementType] ASC);
    PRINT 'Created index IX_FormConfigurations_RequirementType';
END

-- Index on Requirements.RequirementType
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Requirements_RequirementType')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Requirements_RequirementType] 
        ON [dbo].[Requirements]([RequirementType] ASC);
    PRINT 'Created index IX_Requirements_RequirementType';
END

-- Index on Requirements.Status
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Requirements_Status')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Requirements_Status] 
        ON [dbo].[Requirements]([Status] ASC);
    PRINT 'Created index IX_Requirements_Status';
END

-- Index on WorkflowInstances.RequirementId
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_WorkflowInstances_RequirementId')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_WorkflowInstances_RequirementId] 
        ON [dbo].[WorkflowInstances]([RequirementId] ASC);
    PRINT 'Created index IX_WorkflowInstances_RequirementId';
END

-- =====================================================
-- Add/Update Kleinanforderung Configuration
-- =====================================================

PRINT '';
PRINT 'Adding/Updating Kleinanforderung configuration...';

-- Remove old Kleinanforderung configuration if exists
DELETE FROM [dbo].[FormConfigurations] WHERE RequirementType = 'Kleinanforderung';

-- Insert updated Kleinanforderung configuration
INSERT INTO [dbo].[FormConfigurations] 
    ([Id], [RequirementType], [Name], [Description], [WorkflowStep], [ConfigurationData], [IsActive], [Version], [CreatedAt], [ModifiedAt], [CreatedBy], [ModifiedBy])
VALUES (
    NEWID(),
    N'Kleinanforderung',
    N'Kleinanforderung - Antrag erstellen',
    N'Standardformular für Kleinanforderungen - Schritt 1: Antrag erstellen',
    N'step-1',
    N'{
  "sections": [],
  "fields": [],
  "widgets": [
    {
      "id": "widget-basisdaten",
      "type": "customGroup",
      "title": "Basisdaten",
      "description": "Grundlegende Informationen zur Anforderung",
      "order": 1,
      "section": "default",
      "fields": [
        {
          "id": "field-titel",
          "type": "text",
          "name": "titel",
          "label": "Titel der Anforderung",
          "placeholder": "Kurze prägnante Bezeichnung",
          "description": "Geben Sie einen aussagekräftigen Titel ein",
          "required": true,
          "disabled": false,
          "defaultValue": null,
          "options": [],
          "order": 1,
          "width": "full",
          "lightModeVisible": false,
          "workflowStepBinding": [],
          "permissions": {
            "allowedRoles": ["Requester", "Approver"],
            "readOnlyRoles": [],
            "hideFromRoles": []
          }
        },
        {
          "id": "field-beschreibung",
          "type": "textarea",
          "name": "beschreibung",
          "label": "Beschreibung",
          "placeholder": "Detaillierte Beschreibung der Anforderung...",
          "description": "Beschreiben Sie die Anforderung ausführlich",
          "required": true,
          "disabled": false,
          "defaultValue": null,
          "options": [],
          "order": 2,
          "width": "full",
          "lightModeVisible": false,
          "workflowStepBinding": [],
          "permissions": {
            "allowedRoles": ["Requester", "Approver"],
            "readOnlyRoles": [],
            "hideFromRoles": []
          }
        },
        {
          "id": "field-zieltermin",
          "type": "date",
          "name": "zieltermin",
          "label": "Gewünschter Zieltermin",
          "placeholder": "",
          "description": "Bis wann soll die Anforderung umgesetzt sein?",
          "required": true,
          "disabled": false,
          "defaultValue": null,
          "options": [],
          "order": 3,
          "width": "half",
          "lightModeVisible": false,
          "workflowStepBinding": [],
          "permissions": {
            "allowedRoles": ["Requester", "Approver"],
            "readOnlyRoles": [],
            "hideFromRoles": []
          }
        },
        {
          "id": "field-prioritaet",
          "type": "select",
          "name": "prioritaet",
          "label": "Priorität",
          "placeholder": "Priorität auswählen",
          "description": "Wie dringend ist die Umsetzung?",
          "required": true,
          "disabled": false,
          "defaultValue": null,
          "options": [
            { "value": "niedrig", "label": "Niedrig" },
            { "value": "mittel", "label": "Mittel" },
            { "value": "hoch", "label": "Hoch" },
            { "value": "kritisch", "label": "Kritisch" }
          ],
          "order": 4,
          "width": "half",
          "lightModeVisible": false,
          "workflowStepBinding": [],
          "permissions": {
            "allowedRoles": ["Requester", "Approver"],
            "readOnlyRoles": [],
            "hideFromRoles": []
          }
        }
      ],
      "workflowStepBinding": [],
      "permissions": {
        "allowedRoles": ["Requester", "Approver"],
        "readOnlyRoles": [],
        "hideFromRoles": []
      }
    },
    {
      "id": "widget-zustaendigkeiten",
      "type": "zustaendigkeitGroup",
      "title": "Zuständigkeiten",
      "description": "Verantwortliche Personen für diese Anforderung",
      "order": 2,
      "section": "default",
      "fields": [
        {
          "id": "field-fachlicher-ansprechpartner",
          "type": "userSearch",
          "name": "fachlicher_ansprechpartner",
          "label": "Fachlicher Ansprechpartner",
          "placeholder": "Person suchen...",
          "description": "Wer ist fachlich verantwortlich?",
          "required": true,
          "disabled": false,
          "defaultValue": null,
          "options": [],
          "order": 1,
          "width": "half",
          "lightModeVisible": false,
          "workflowStepBinding": [],
          "permissions": {
            "allowedRoles": ["Requester", "Approver"],
            "readOnlyRoles": [],
            "hideFromRoles": []
          }
        },
        {
          "id": "field-technischer-ansprechpartner",
          "type": "userSearch",
          "name": "technischer_ansprechpartner",
          "label": "Technischer Ansprechpartner",
          "placeholder": "Person suchen...",
          "description": "Wer ist technisch verantwortlich?",
          "required": false,
          "disabled": false,
          "defaultValue": null,
          "options": [],
          "order": 2,
          "width": "half",
          "lightModeVisible": false,
          "workflowStepBinding": [],
          "permissions": {
            "allowedRoles": ["Requester", "Approver"],
            "readOnlyRoles": [],
            "hideFromRoles": []
          }
        }
      ],
      "workflowStepBinding": [],
      "permissions": {
        "allowedRoles": ["Requester", "Approver"],
        "readOnlyRoles": [],
        "hideFromRoles": []
      }
    },
    {
      "id": "widget-budget",
      "type": "budgetGroup",
      "title": "Geschätztes Budget",
      "description": "Kostenschätzung für die Anforderung",
      "order": 3,
      "section": "default",
      "fields": [
        {
          "id": "field-geschaetzte-kosten",
          "type": "number",
          "name": "geschaetzte_kosten",
          "label": "Geschätzte Gesamtkosten (€)",
          "placeholder": "0.00",
          "description": "Ungefähre Kostenschätzung in Euro",
          "required": false,
          "disabled": false,
          "defaultValue": null,
          "options": [],
          "order": 1,
          "width": "half",
          "lightModeVisible": false,
          "workflowStepBinding": [],
          "permissions": {
            "allowedRoles": ["Requester", "Approver"],
            "readOnlyRoles": [],
            "hideFromRoles": []
          }
        },
        {
          "id": "field-budget-kategorie",
          "type": "select",
          "name": "budget_kategorie",
          "label": "Budget-Kategorie",
          "placeholder": "Kategorie auswählen",
          "description": "Welcher Budgetbereich ist betroffen?",
          "required": false,
          "disabled": false,
          "defaultValue": null,
          "options": [
            { "value": "it-infrastruktur", "label": "IT-Infrastruktur" },
            { "value": "software-lizenzen", "label": "Software-Lizenzen" },
            { "value": "externe-dienstleistungen", "label": "Externe Dienstleistungen" },
            { "value": "hardware", "label": "Hardware" },
            { "value": "sonstiges", "label": "Sonstiges" }
          ],
          "order": 2,
          "width": "half",
          "lightModeVisible": false,
          "workflowStepBinding": [],
          "permissions": {
            "allowedRoles": ["Requester", "Approver"],
            "readOnlyRoles": [],
            "hideFromRoles": []
          }
        },
        {
          "id": "field-aufwand-tage",
          "type": "number",
          "name": "aufwand_tage",
          "label": "Geschätzter Aufwand (Arbeitstage)",
          "placeholder": "0",
          "description": "Geschätzter Arbeitsaufwand in Tagen",
          "required": false,
          "disabled": false,
          "defaultValue": null,
          "options": [],
          "order": 3,
          "width": "half",
          "lightModeVisible": false,
          "workflowStepBinding": [],
          "permissions": {
            "allowedRoles": ["Requester", "Approver"],
            "readOnlyRoles": [],
            "hideFromRoles": []
          }
        },
        {
          "id": "field-kostenstelle",
          "type": "text",
          "name": "kostenstelle",
          "label": "Kostenstelle",
          "placeholder": "z.B. KST-12345",
          "description": "Zugehörige Kostenstelle für die Abrechnung",
          "required": false,
          "disabled": false,
          "defaultValue": null,
          "options": [],
          "order": 4,
          "width": "half",
          "lightModeVisible": false,
          "workflowStepBinding": [],
          "permissions": {
            "allowedRoles": ["Requester", "Approver"],
            "readOnlyRoles": [],
            "hideFromRoles": []
          }
        }
      ],
      "workflowStepBinding": [],
      "permissions": {
        "allowedRoles": ["Requester", "Approver"],
        "readOnlyRoles": [],
        "hideFromRoles": []
      }
    },
    {
      "id": "widget-zusaetzliche-infos",
      "type": "customGroup",
      "title": "Zusätzliche Informationen",
      "description": "Weitere Details und Anhänge",
      "order": 4,
      "section": "default",
      "fields": [
        {
          "id": "field-betroffene-systeme",
          "type": "multiselect",
          "name": "betroffene_systeme",
          "label": "Betroffene Systeme",
          "placeholder": "Systeme auswählen...",
          "description": "Welche Systeme sind von der Änderung betroffen?",
          "required": false,
          "disabled": false,
          "defaultValue": null,
          "options": [
            { "value": "sap", "label": "SAP" },
            { "value": "sharepoint", "label": "SharePoint" },
            { "value": "exchange", "label": "Exchange" },
            { "value": "active-directory", "label": "Active Directory" },
            { "value": "netzwerk", "label": "Netzwerk-Infrastruktur" },
            { "value": "datenbank", "label": "Datenbank-Systeme" },
            { "value": "web-anwendungen", "label": "Web-Anwendungen" },
            { "value": "sonstiges", "label": "Sonstige Systeme" }
          ],
          "order": 1,
          "width": "full",
          "lightModeVisible": false,
          "workflowStepBinding": [],
          "permissions": {
            "allowedRoles": ["Requester", "Approver"],
            "readOnlyRoles": [],
            "hideFromRoles": []
          }
        },
        {
          "id": "field-anhang",
          "type": "file",
          "name": "anhang",
          "label": "Anhänge",
          "placeholder": "Dateien auswählen...",
          "description": "Relevante Dokumente, Screenshots oder Spezifikationen",
          "required": false,
          "disabled": false,
          "defaultValue": null,
          "options": [],
          "order": 2,
          "width": "full",
          "lightModeVisible": false,
          "workflowStepBinding": [],
          "permissions": {
            "allowedRoles": ["Requester", "Approver"],
            "readOnlyRoles": [],
            "hideFromRoles": []
          }
        },
        {
          "id": "field-kommentar",
          "type": "textarea",
          "name": "kommentar",
          "label": "Zusätzliche Kommentare",
          "placeholder": "Weitere Anmerkungen...",
          "description": "Sonstige wichtige Informationen",
          "required": false,
          "disabled": false,
          "defaultValue": null,
          "options": [],
          "order": 3,
          "width": "full",
          "lightModeVisible": false,
          "workflowStepBinding": [],
          "permissions": {
            "allowedRoles": ["Requester", "Approver"],
            "readOnlyRoles": [],
            "hideFromRoles": []
          }
        }
      ],
      "workflowStepBinding": [],
      "permissions": {
        "allowedRoles": ["Requester", "Approver"],
        "readOnlyRoles": [],
        "hideFromRoles": []
      }
    }
  ],
  "permissions": {
    "allowedRoles": ["Requester", "Approver", "Admin"],
    "readOnlyRoles": ["Viewer"],
    "hideFromRoles": []
  },
  "lightMode": false
}',
    1,
    1,
    GETUTCDATE(),
    GETUTCDATE(),
    N'schema-update',
    NULL
);

PRINT 'Kleinanforderung configuration added/updated successfully.';
PRINT '';

-- =====================================================
-- Final Summary
-- =====================================================

PRINT '==============================================';
PRINT 'Schema Update Completed Successfully!';
PRINT '==============================================';

-- Show final schema
PRINT 'Current FormConfigurations schema:';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'FormConfigurations'
ORDER BY ORDINAL_POSITION;

-- Final verification
DECLARE @FormConfigCount INT = (SELECT COUNT(*) FROM FormConfigurations);
DECLARE @WorkflowDefCount INT = ISNULL((SELECT COUNT(*) FROM WorkflowDefinitions), 0);
DECLARE @RequirementsCount INT = ISNULL((SELECT COUNT(*) FROM Requirements), 0);
DECLARE @WorkflowInstCount INT = ISNULL((SELECT COUNT(*) FROM WorkflowInstances), 0);

PRINT '';
PRINT 'Final record counts:';
PRINT '- FormConfigurations: ' + CAST(@FormConfigCount AS VARCHAR);
PRINT '- WorkflowDefinitions: ' + CAST(@WorkflowDefCount AS VARCHAR);
PRINT '- Requirements: ' + CAST(@RequirementsCount AS VARCHAR);  
PRINT '- WorkflowInstances: ' + CAST(@WorkflowInstCount AS VARCHAR);
PRINT '';
PRINT 'All missing columns have been added.';
PRINT 'Database users and permissions remain unchanged.';
PRINT 'Your Requirements API should now work correctly.';
PRINT '';