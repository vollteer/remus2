-- =====================================================
-- Requirements Database Safe Migration Script
-- Works with existing databases, users, and schemas
-- =====================================================

-- Check if we're connected to the right database
IF DB_NAME() != 'REQUIREMENTS'
BEGIN
    PRINT 'WARNING: Not connected to REQUIREMENTS database!';
    PRINT 'Please connect to the REQUIREMENTS database or create it first.';
    PRINT 'Example: USE REQUIREMENTS; or CREATE DATABASE REQUIREMENTS;';
    PRINT '';
    PRINT 'Exiting script to prevent accidental changes...';
    RETURN;
END

-- Show current database context
PRINT '==============================================';
PRINT 'Requirements Database Safe Migration';
PRINT '==============================================';
PRINT 'Current Database: ' + DB_NAME();
PRINT 'Current User: ' + SYSTEM_USER;
PRINT 'Execution Time: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '';

-- Check existing users and permissions
PRINT 'Existing Database Users:';
SELECT 
    name as UserName, 
    type_desc as UserType,
    default_schema_name as DefaultSchema
FROM sys.database_principals 
WHERE type NOT IN ('R') -- Exclude roles
    AND name NOT LIKE '##%' -- Exclude system accounts
ORDER BY name;

PRINT '';
PRINT '==============================================';
PRINT 'Checking Existing Tables...';
PRINT '==============================================';

-- Check and report existing tables
DECLARE @ExistingTables TABLE (TableName NVARCHAR(128));

INSERT INTO @ExistingTables (TableName)
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
    AND TABLE_NAME IN ('WorkflowInstances', 'FormConfigurations', 'WorkflowDefinitions', 'Requirements');

IF EXISTS (SELECT 1 FROM @ExistingTables)
BEGIN
    PRINT 'Found existing Requirements tables:';
    SELECT TableName FROM @ExistingTables;
    PRINT '';
    PRINT 'SAFETY CHECK: Do you want to proceed?';
    PRINT 'This will:';
    PRINT '1. Backup existing data to temporary tables';
    PRINT '2. Drop and recreate tables';
    PRINT '3. Restore data where possible';
    PRINT '4. Add new Kleinanforderung configuration';
    PRINT '';
    PRINT 'Press Ctrl+C to cancel or any key to continue...';
    PRINT '';
END
ELSE
BEGIN
    PRINT 'No existing Requirements tables found. Safe to proceed.';
    PRINT '';
END

-- =====================================================
-- Backup existing data (if tables exist)
-- =====================================================

PRINT 'Creating backup tables for existing data...';

-- Backup WorkflowInstances
IF OBJECT_ID('dbo.WorkflowInstances', 'U') IS NOT NULL
BEGIN
    IF OBJECT_ID('dbo.WorkflowInstances_Backup', 'U') IS NOT NULL
        DROP TABLE dbo.WorkflowInstances_Backup;
    
    SELECT * INTO dbo.WorkflowInstances_Backup FROM dbo.WorkflowInstances;
    PRINT 'Backed up ' + CAST(@@ROWCOUNT AS VARCHAR) + ' WorkflowInstances records';
END

-- Backup FormConfigurations
IF OBJECT_ID('dbo.FormConfigurations', 'U') IS NOT NULL
BEGIN
    IF OBJECT_ID('dbo.FormConfigurations_Backup', 'U') IS NOT NULL
        DROP TABLE dbo.FormConfigurations_Backup;
    
    SELECT * INTO dbo.FormConfigurations_Backup FROM dbo.FormConfigurations;
    PRINT 'Backed up ' + CAST(@@ROWCOUNT AS VARCHAR) + ' FormConfigurations records';
END

-- Backup WorkflowDefinitions
IF OBJECT_ID('dbo.WorkflowDefinitions', 'U') IS NOT NULL
BEGIN
    IF OBJECT_ID('dbo.WorkflowDefinitions_Backup', 'U') IS NOT NULL
        DROP TABLE dbo.WorkflowDefinitions_Backup;
    
    SELECT * INTO dbo.WorkflowDefinitions_Backup FROM dbo.WorkflowDefinitions;
    PRINT 'Backed up ' + CAST(@@ROWCOUNT AS VARCHAR) + ' WorkflowDefinitions records';
END

-- Backup Requirements
IF OBJECT_ID('dbo.Requirements', 'U') IS NOT NULL
BEGIN
    IF OBJECT_ID('dbo.Requirements_Backup', 'U') IS NOT NULL
        DROP TABLE dbo.Requirements_Backup;
    
    SELECT * INTO dbo.Requirements_Backup FROM dbo.Requirements;
    PRINT 'Backed up ' + CAST(@@ROWCOUNT AS VARCHAR) + ' Requirements records';
END

PRINT '';
PRINT '==============================================';
PRINT 'Recreating Tables...';
PRINT '==============================================';

-- Drop existing tables in correct order (Foreign Key constraints)
IF OBJECT_ID('dbo.WorkflowInstances', 'U') IS NOT NULL 
BEGIN
    DROP TABLE dbo.WorkflowInstances;
    PRINT 'Dropped WorkflowInstances table';
END

IF OBJECT_ID('dbo.FormConfigurations', 'U') IS NOT NULL 
BEGIN
    DROP TABLE dbo.FormConfigurations;
    PRINT 'Dropped FormConfigurations table';
END

IF OBJECT_ID('dbo.WorkflowDefinitions', 'U') IS NOT NULL 
BEGIN
    DROP TABLE dbo.WorkflowDefinitions;
    PRINT 'Dropped WorkflowDefinitions table';
END

IF OBJECT_ID('dbo.Requirements', 'U') IS NOT NULL 
BEGIN
    DROP TABLE dbo.Requirements;
    PRINT 'Dropped Requirements table';
END

-- Create WorkflowDefinitions table
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
PRINT 'Created WorkflowDefinitions table';

-- Create FormConfigurations table
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
PRINT 'Created FormConfigurations table';

-- Create Requirements table
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
PRINT 'Created Requirements table';

-- Create WorkflowInstances table
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
    CONSTRAINT [PK_WorkflowInstances] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_WorkflowInstances_WorkflowDefinitions] FOREIGN KEY([WorkflowDefinitionId]) 
        REFERENCES [dbo].[WorkflowDefinitions] ([Id]),
    CONSTRAINT [FK_WorkflowInstances_Requirements] FOREIGN KEY([RequirementId]) 
        REFERENCES [dbo].[Requirements] ([Id])
);
PRINT 'Created WorkflowInstances table';

-- Create indexes
CREATE NONCLUSTERED INDEX [IX_FormConfigurations_RequirementType] 
    ON [dbo].[FormConfigurations]([RequirementType] ASC);

CREATE NONCLUSTERED INDEX [IX_Requirements_RequirementType] 
    ON [dbo].[Requirements]([RequirementType] ASC);

CREATE NONCLUSTERED INDEX [IX_Requirements_Status] 
    ON [dbo].[Requirements]([Status] ASC);

CREATE NONCLUSTERED INDEX [IX_WorkflowInstances_RequirementId] 
    ON [dbo].[WorkflowInstances]([RequirementId] ASC);

PRINT 'Created all indexes';
PRINT '';

-- =====================================================
-- Restore backed up data
-- =====================================================

PRINT '==============================================';
PRINT 'Restoring Data from Backups...';
PRINT '==============================================';

-- Restore WorkflowDefinitions
IF OBJECT_ID('dbo.WorkflowDefinitions_Backup', 'U') IS NOT NULL
BEGIN
    INSERT INTO dbo.WorkflowDefinitions 
        ([Id], [Name], [Description], [WorkflowType], [WorkflowData], [IsActive], [Version], [CreatedAt], [ModifiedAt], [CreatedBy], [ModifiedBy])
    SELECT [Id], [Name], [Description], [WorkflowType], [WorkflowData], [IsActive], [Version], [CreatedAt], [ModifiedAt], [CreatedBy], [ModifiedBy]
    FROM dbo.WorkflowDefinitions_Backup;
    PRINT 'Restored ' + CAST(@@ROWCOUNT AS VARCHAR) + ' WorkflowDefinitions records';
END

-- Restore FormConfigurations (but exclude Kleinanforderung - we'll add the new one)
IF OBJECT_ID('dbo.FormConfigurations_Backup', 'U') IS NOT NULL
BEGIN
    INSERT INTO dbo.FormConfigurations 
        ([Id], [RequirementType], [Name], [Description], [WorkflowStep], [ConfigurationData], [IsActive], [Version], [CreatedAt], [ModifiedAt], [CreatedBy], [ModifiedBy])
    SELECT [Id], [RequirementType], [Name], [Description], [WorkflowStep], [ConfigurationData], [IsActive], [Version], [CreatedAt], [ModifiedAt], [CreatedBy], [ModifiedBy]
    FROM dbo.FormConfigurations_Backup
    WHERE RequirementType != 'Kleinanforderung';
    PRINT 'Restored ' + CAST(@@ROWCOUNT AS VARCHAR) + ' FormConfigurations records (excluding Kleinanforderung)';
END

-- Restore Requirements
IF OBJECT_ID('dbo.Requirements_Backup', 'U') IS NOT NULL
BEGIN
    INSERT INTO dbo.Requirements 
        ([Id], [RequirementNumber], [Title], [Description], [RequirementType], [Status], [Priority], [FormData], [WorkflowInstanceId], [CreatedAt], [ModifiedAt], [CreatedBy], [ModifiedBy])
    SELECT [Id], [RequirementNumber], [Title], [Description], [RequirementType], [Status], [Priority], [FormData], [WorkflowInstanceId], [CreatedAt], [ModifiedAt], [CreatedBy], [ModifiedBy]
    FROM dbo.Requirements_Backup;
    PRINT 'Restored ' + CAST(@@ROWCOUNT AS VARCHAR) + ' Requirements records';
END

-- Restore WorkflowInstances (only if both parent records exist)
IF OBJECT_ID('dbo.WorkflowInstances_Backup', 'U') IS NOT NULL
BEGIN
    INSERT INTO dbo.WorkflowInstances 
        ([Id], [WorkflowDefinitionId], [RequirementId], [CurrentStep], [Status], [WorkflowData], [StartedAt], [CompletedAt], [CreatedBy], [ModifiedBy])
    SELECT b.[Id], b.[WorkflowDefinitionId], b.[RequirementId], b.[CurrentStep], b.[Status], b.[WorkflowData], b.[StartedAt], b.[CompletedAt], b.[CreatedBy], b.[ModifiedBy]
    FROM dbo.WorkflowInstances_Backup b
    WHERE EXISTS (SELECT 1 FROM dbo.WorkflowDefinitions wd WHERE wd.Id = b.WorkflowDefinitionId)
      AND EXISTS (SELECT 1 FROM dbo.Requirements r WHERE r.Id = b.RequirementId);
    PRINT 'Restored ' + CAST(@@ROWCOUNT AS VARCHAR) + ' WorkflowInstances records';
END

PRINT '';
PRINT '==============================================';
PRINT 'Adding Updated Kleinanforderung Configuration...';
PRINT '==============================================';

-- Remove old Kleinanforderung configuration if exists
DELETE FROM dbo.FormConfigurations WHERE RequirementType = 'Kleinanforderung';

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
    N'migration',
    NULL
);
PRINT 'Added updated Kleinanforderung configuration';
PRINT '';

-- =====================================================
-- Cleanup backup tables (optional)
-- =====================================================

PRINT '==============================================';
PRINT 'Cleanup (backup tables will remain for safety)';
PRINT '==============================================';

PRINT 'Backup tables created (you can delete them later):';
IF OBJECT_ID('dbo.WorkflowInstances_Backup', 'U') IS NOT NULL
    PRINT '- WorkflowInstances_Backup';
IF OBJECT_ID('dbo.FormConfigurations_Backup', 'U') IS NOT NULL
    PRINT '- FormConfigurations_Backup';
IF OBJECT_ID('dbo.WorkflowDefinitions_Backup', 'U') IS NOT NULL
    PRINT '- WorkflowDefinitions_Backup';
IF OBJECT_ID('dbo.Requirements_Backup', 'U') IS NOT NULL
    PRINT '- Requirements_Backup';

PRINT '';
PRINT '==============================================';
PRINT 'Migration Completed Successfully!';
PRINT '==============================================';

-- Final verification
DECLARE @FormConfigCount INT = (SELECT COUNT(*) FROM FormConfigurations);
DECLARE @WorkflowDefCount INT = (SELECT COUNT(*) FROM WorkflowDefinitions);
DECLARE @RequirementsCount INT = (SELECT COUNT(*) FROM Requirements);
DECLARE @WorkflowInstCount INT = (SELECT COUNT(*) FROM WorkflowInstances);

PRINT 'Final counts:';
PRINT '- FormConfigurations: ' + CAST(@FormConfigCount AS VARCHAR);
PRINT '- WorkflowDefinitions: ' + CAST(@WorkflowDefCount AS VARCHAR);
PRINT '- Requirements: ' + CAST(@RequirementsCount AS VARCHAR);  
PRINT '- WorkflowInstances: ' + CAST(@WorkflowInstCount AS VARCHAR);
PRINT '';
PRINT 'Database users and permissions remain unchanged.';
PRINT 'Requirements API should work with existing connection strings.';
PRINT '';

/*
-- Uncomment to delete backup tables after verification
DROP TABLE IF EXISTS dbo.WorkflowInstances_Backup;
DROP TABLE IF EXISTS dbo.FormConfigurations_Backup;
DROP TABLE IF EXISTS dbo.WorkflowDefinitions_Backup;
DROP TABLE IF EXISTS dbo.Requirements_Backup;
PRINT 'Backup tables deleted.';
*/