-- =====================================================
-- Requirements Database Complete Export with Data
-- This script will recreate the entire database on any SQL Server
-- =====================================================

-- Switch to master database to create the REQUIREMENTS database
USE master;
GO

-- Create database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'REQUIREMENTS')
BEGIN
    CREATE DATABASE [REQUIREMENTS]
    COLLATE Latin1_General_CI_AS;  -- Ensures German character support
END
GO

-- Switch to the new database
USE [REQUIREMENTS];
GO

-- =====================================================
-- Drop existing objects in correct order
-- =====================================================
IF OBJECT_ID('dbo.WorkflowInstances', 'U') IS NOT NULL 
    DROP TABLE dbo.WorkflowInstances;
GO

IF OBJECT_ID('dbo.FormConfigurations', 'U') IS NOT NULL 
    DROP TABLE dbo.FormConfigurations;
GO

IF OBJECT_ID('dbo.WorkflowDefinitions', 'U') IS NOT NULL 
    DROP TABLE dbo.WorkflowDefinitions;
GO

IF OBJECT_ID('dbo.Requirements', 'U') IS NOT NULL 
    DROP TABLE dbo.Requirements;
GO

-- =====================================================
-- Create Tables
-- =====================================================

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
GO

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
GO

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
GO

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
GO

-- Create indexes for better performance
CREATE NONCLUSTERED INDEX [IX_FormConfigurations_RequirementType] 
    ON [dbo].[FormConfigurations]([RequirementType] ASC);
GO

CREATE NONCLUSTERED INDEX [IX_Requirements_RequirementType] 
    ON [dbo].[Requirements]([RequirementType] ASC);
GO

CREATE NONCLUSTERED INDEX [IX_Requirements_Status] 
    ON [dbo].[Requirements]([Status] ASC);
GO

CREATE NONCLUSTERED INDEX [IX_WorkflowInstances_RequirementId] 
    ON [dbo].[WorkflowInstances]([RequirementId] ASC);
GO

-- =====================================================
-- Insert Data - FormConfigurations
-- =====================================================

-- Insert Kleinanforderung configuration
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
    N'system',
    NULL
);
GO

-- =====================================================
-- Success Message
-- =====================================================
PRINT 'Requirements database created successfully!';
PRINT '';
PRINT 'Summary:';
PRINT '- Database: REQUIREMENTS';
PRINT '- Tables created: 4';
PRINT '  - WorkflowDefinitions';
PRINT '  - FormConfigurations';
PRINT '  - Requirements';
PRINT '  - WorkflowInstances';
PRINT '- Form configuration: Kleinanforderung';
PRINT '';
PRINT 'The database is ready for use with the Requirements API.';
GO