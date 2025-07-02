-- ====================================
-- ENHANCED DATABASE SCHEMA WITH DEPLOYMENT SYSTEM
-- ====================================

-- ====================================
-- CORE REQUIREMENTS TABLE (Was gefehlt hat!)
-- ====================================

CREATE TABLE Requirements (
Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
RequirementNumber NVARCHAR(50) NOT NULL UNIQUE, -- REQ-2025-001
Title NVARCHAR(255) NOT NULL,
Description NVARCHAR(MAX),
RequirementType NVARCHAR(100) NOT NULL, -- Kleinanforderung, Großanforderung, etc.
Priority NVARCHAR(50) DEFAULT 'Medium', -- Low, Medium, High, Urgent
Status NVARCHAR(50) DEFAULT 'Draft', -- Draft, Submitted, InProgress, Completed, Rejected, OnHold


-- Business Data
RequestedBy NVARCHAR(255) NOT NULL, -- User ID/Email
BusinessOwner NVARCHAR(255), -- Fachlicher Anwendungsbetreuer
TechnicalOwner NVARCHAR(255), -- Systemverantwortlicher
Department NVARCHAR(100),
CostCenter NVARCHAR(50),

-- Financial
EstimatedCost DECIMAL(18,2),
ApprovedBudget DECIMAL(18,2),
ActualCost DECIMAL(18,2),
Currency NVARCHAR(3) DEFAULT 'EUR',

-- Dates
RequestedDate DATETIME2 DEFAULT GETDATE(),
RequiredByDate DATETIME2,
StartDate DATETIME2,
CompletedDate DATETIME2,

-- Workflow State
CurrentWorkflowConfigId UNIQUEIDENTIFIER, -- FK to WorkflowConfigurations
CurrentWorkflowStep NVARCHAR(100), -- Current step ID
WorkflowInstanceId UNIQUEIDENTIFIER, -- For tracking workflow progress

-- Form Data (JSON - alle ausgefüllten Felder)
FormData NVARCHAR(MAX), -- JSON: All form field values
FormConfigurationId UNIQUEIDENTIFIER, -- FK to FormConfigurations

-- Compliance & Security
HasPersonalData BIT DEFAULT 0,
SecurityClassification NVARCHAR(50) DEFAULT 'Internal', -- Public, Internal, Confidential, Secret
ComplianceFlags NVARCHAR(MAX), -- JSON: DSGVO, Security, etc.

-- Timestamps
CreatedAt DATETIME2 DEFAULT GETDATE(),
ModifiedAt DATETIME2 DEFAULT GETDATE(),
CreatedBy NVARCHAR(255),
ModifiedBy NVARCHAR(255),

-- Indexes
INDEX IX_Requirements_Number (RequirementNumber),
INDEX IX_Requirements_Type (RequirementType),
INDEX IX_Requirements_Status (Status),
INDEX IX_Requirements_RequestedBy (RequestedBy),
INDEX IX_Requirements_Dates (RequestedDate, RequiredByDate),

-- Foreign Keys
FOREIGN KEY (CurrentWorkflowConfigId) REFERENCES WorkflowConfigurations(Id),
FOREIGN KEY (FormConfigurationId) REFERENCES FormConfigurations(Id)


);

-- ====================================
-- DEPLOYMENT SYSTEM TABLES
-- ====================================

-- Workflow Deployments mit 4-Augen-Prinzip
CREATE TABLE WorkflowDeployments (
Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
WorkflowConfigurationId UNIQUEIDENTIFIER NOT NULL,


-- Deployment Info
Version NVARCHAR(20) NOT NULL, -- v1.0, v1.1, etc.
DeploymentType NVARCHAR(50) NOT NULL, -- Draft, Review, Approved, Live, Archived
Environment NVARCHAR(50) DEFAULT 'Production', -- Development, Staging, Production

-- 4-Augen-Prinzip
CreatedBy NVARCHAR(255) NOT NULL, -- Ersteller
ReviewedBy NVARCHAR(255), -- Reviewer (muss anderer User sein)
ApprovedBy NVARCHAR(255), -- Final Approver
DeployedBy NVARCHAR(255), -- Deployer

-- Review Process
ReviewStatus NVARCHAR(50) DEFAULT 'Pending', -- Pending, InReview, Approved, Rejected
ReviewComments NVARCHAR(MAX),
ReviewDate DATETIME2,
ApprovalDate DATETIME2,
DeploymentDate DATETIME2,

-- Configuration Snapshot (JSON)
ConfigurationSnapshot NVARCHAR(MAX) NOT NULL, -- Full workflow config as JSON
ChangesSummary NVARCHAR(MAX), -- What changed from previous version

-- Deployment Metadata
AffectedRequirements INT DEFAULT 0, -- How many requirements use this workflow
RollbackPlan NVARCHAR(MAX),
DeploymentNotes NVARCHAR(MAX),

-- Status Tracking
IsActive BIT DEFAULT 0, -- Currently deployed version
CanRollback BIT DEFAULT 1,

-- Timestamps
CreatedAt DATETIME2 DEFAULT GETDATE(),
ModifiedAt DATETIME2 DEFAULT GETDATE(),

-- Constraints
CONSTRAINT CK_WorkflowDeployments_4Eyes CHECK (
    (ReviewedBy IS NULL OR ReviewedBy != CreatedBy) AND
    (ApprovedBy IS NULL OR ApprovedBy != CreatedBy) AND
    (ApprovedBy IS NULL OR ApprovedBy != ReviewedBy)
),

-- Indexes
INDEX IX_WorkflowDeployments_Config (WorkflowConfigurationId),
INDEX IX_WorkflowDeployments_Status (ReviewStatus),
INDEX IX_WorkflowDeployments_Active (IsActive),
INDEX IX_WorkflowDeployments_Version (Version),

-- Foreign Keys
FOREIGN KEY (WorkflowConfigurationId) REFERENCES WorkflowConfigurations(Id)


);

-- Form Deployments (gleiche Logik)
CREATE TABLE FormDeployments (
Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
FormConfigurationId UNIQUEIDENTIFIER NOT NULL,


-- Deployment Info
Version NVARCHAR(20) NOT NULL,
DeploymentType NVARCHAR(50) NOT NULL,
Environment NVARCHAR(50) DEFAULT 'Production',

-- 4-Augen-Prinzip
CreatedBy NVARCHAR(255) NOT NULL,
ReviewedBy NVARCHAR(255),
ApprovedBy NVARCHAR(255),
DeployedBy NVARCHAR(255),

-- Review Process
ReviewStatus NVARCHAR(50) DEFAULT 'Pending',
ReviewComments NVARCHAR(MAX),
ReviewDate DATETIME2,
ApprovalDate DATETIME2,
DeploymentDate DATETIME2,

-- Configuration Snapshot
ConfigurationSnapshot NVARCHAR(MAX) NOT NULL,
ChangesSummary NVARCHAR(MAX),

-- Status
IsActive BIT DEFAULT 0,

-- Timestamps
CreatedAt DATETIME2 DEFAULT GETDATE(),
ModifiedAt DATETIME2 DEFAULT GETDATE(),

-- Constraints
CONSTRAINT CK_FormDeployments_4Eyes CHECK (
    (ReviewedBy IS NULL OR ReviewedBy != CreatedBy) AND
    (ApprovedBy IS NULL OR ApprovedBy != CreatedBy) AND
    (ApprovedBy IS NULL OR ApprovedBy != ReviewedBy)
),

-- Indexes
INDEX IX_FormDeployments_Config (FormConfigurationId),
INDEX IX_FormDeployments_Status (ReviewStatus),
INDEX IX_FormDeployments_Active (IsActive),

-- Foreign Keys
FOREIGN KEY (FormConfigurationId) REFERENCES FormConfigurations(Id)


);

-- ====================================
-- EXPORT/IMPORT HISTORIE
-- ====================================

CREATE TABLE ConfigurationExports (
Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),


-- Export Info
ExportType NVARCHAR(50) NOT NULL, -- Workflow, Form, Complete
ExportFormat NVARCHAR(20) DEFAULT 'JSON', -- JSON, XML
FileName NVARCHAR(255) NOT NULL,

-- Content References
WorkflowConfigurationId UNIQUEIDENTIFIER,
FormConfigurationId UNIQUEIDENTIFIER,
RequirementType NVARCHAR(100), -- For complete exports

-- Export Data
ExportData NVARCHAR(MAX) NOT NULL, -- The actual exported configuration
ExportSize INT, -- Size in bytes
Checksum NVARCHAR(64), -- MD5/SHA256 for integrity

-- Metadata
ExportedBy NVARCHAR(255) NOT NULL,
ExportReason NVARCHAR(MAX), -- Why was this exported
TargetEnvironment NVARCHAR(50), -- Where will this be imported

-- Versioning
ConfigurationVersion NVARCHAR(20),
ExportVersion NVARCHAR(20), -- Export schema version

-- Timestamps
CreatedAt DATETIME2 DEFAULT GETDATE(),
ExpiresAt DATETIME2, -- Optional expiration

-- Indexes
INDEX IX_ConfigurationExports_Type (ExportType),
INDEX IX_ConfigurationExports_ExportedBy (ExportedBy),
INDEX IX_ConfigurationExports_Created (CreatedAt),

-- Foreign Keys
FOREIGN KEY (WorkflowConfigurationId) REFERENCES WorkflowConfigurations(Id),
FOREIGN KEY (FormConfigurationId) REFERENCES FormConfigurations(Id)


);

CREATE TABLE ConfigurationImports (
Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),


-- Import Info
ImportType NVARCHAR(50) NOT NULL,
FileName NVARCHAR(255) NOT NULL,
SourceExportId UNIQUEIDENTIFIER, -- Link to original export if available

-- Import Data
ImportData NVARCHAR(MAX) NOT NULL,
ImportSize INT,
Checksum NVARCHAR(64),

-- Import Process
ImportedBy NVARCHAR(255) NOT NULL,
ImportReason NVARCHAR(MAX),
ImportStatus NVARCHAR(50) DEFAULT 'Pending', -- Pending, Processing, Success, Failed
ImportErrors NVARCHAR(MAX), -- Any errors during import

-- Results
CreatedWorkflowConfigId UNIQUEIDENTIFIER, -- If new workflow was created
CreatedFormConfigId UNIQUEIDENTIFIER, -- If new form was created
AffectedRequirementsCount INT DEFAULT 0,

-- Validation
ValidationResults NVARCHAR(MAX), -- JSON: validation results
RequiresReview BIT DEFAULT 1, -- Needs approval before activation

-- Timestamps
CreatedAt DATETIME2 DEFAULT GETDATE(),
ProcessedAt DATETIME2,

-- Indexes
INDEX IX_ConfigurationImports_Type (ImportType),
INDEX IX_ConfigurationImports_Status (ImportStatus),
INDEX IX_ConfigurationImports_ImportedBy (ImportedBy),

-- Foreign Keys
FOREIGN KEY (SourceExportId) REFERENCES ConfigurationExports(Id)


);

-- ====================================
-- ENHANCED WORKFLOW STEP INSTANCES (Updated)
-- ====================================

-- Erweitere bestehende Tabelle
ALTER TABLE WorkflowStepInstances ADD
DeploymentId UNIQUEIDENTIFIER, -- Which deployment version is being used
StepConfiguration NVARCHAR(MAX), -- JSON: Step-specific config at runtime
PermissionOverrides NVARCHAR(MAX), -- JSON: Runtime permission overrides


-- Performance Tracking
StartedBySystem BIT DEFAULT 0,
AutoAssigned BIT DEFAULT 0,
EscalationLevel INT DEFAULT 0,
EscalationDate DATETIME2,

-- Add FK
FOREIGN KEY (DeploymentId) REFERENCES WorkflowDeployments(Id);


-- ====================================
-- REQUIREMENT ATTACHMENTS
-- ====================================

CREATE TABLE RequirementAttachments (
Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
RequirementId UNIQUEIDENTIFIER NOT NULL,


-- File Info
FileName NVARCHAR(255) NOT NULL,
OriginalFileName NVARCHAR(255) NOT NULL,
FileSize INT NOT NULL,
ContentType NVARCHAR(100) NOT NULL,

-- Storage
StoragePath NVARCHAR(500), -- File system path or blob reference
StorageType NVARCHAR(50) DEFAULT 'FileSystem', -- FileSystem, Blob, Database

-- Metadata
UploadedBy NVARCHAR(255) NOT NULL,
Description NVARCHAR(500),
Category NVARCHAR(100), -- Document, Image, Specification, etc.

-- Security
IsPublic BIT DEFAULT 0,
RequiresPermission BIT DEFAULT 1,

-- Timestamps
CreatedAt DATETIME2 DEFAULT GETDATE(),

-- Indexes
INDEX IX_RequirementAttachments_Requirement (RequirementId),
INDEX IX_RequirementAttachments_UploadedBy (UploadedBy),

-- Foreign Keys
FOREIGN KEY (RequirementId) REFERENCES Requirements(Id) ON DELETE CASCADE


);

-- ====================================
-- REQUIREMENT COMMENTS/HISTORY
-- ====================================

CREATE TABLE RequirementComments (
Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
RequirementId UNIQUEIDENTIFIER NOT NULL,


-- Comment Data
Comment NVARCHAR(MAX) NOT NULL,
CommentType NVARCHAR(50) DEFAULT 'General', -- General, StatusChange, Approval, Technical

-- Context
WorkflowStep NVARCHAR(100), -- Which step was active
PreviousStatus NVARCHAR(50), -- If status change
NewStatus NVARCHAR(50),

-- Metadata
CreatedBy NVARCHAR(255) NOT NULL,
IsInternal BIT DEFAULT 0, -- Internal comment vs. customer-facing

-- Timestamps
CreatedAt DATETIME2 DEFAULT GETDATE(),

-- Indexes
INDEX IX_RequirementComments_Requirement (RequirementId),
INDEX IX_RequirementComments_Created (CreatedAt),
INDEX IX_RequirementComments_Type (CommentType),

-- Foreign Keys
FOREIGN KEY (RequirementId) REFERENCES Requirements(Id) ON DELETE CASCADE


);

-- ====================================
-- ENHANCED VIEWS FOR REPORTING
-- ====================================

-- View für aktive Workflow-Deployments
CREATE VIEW ActiveWorkflowDeployments AS
SELECT
wd.*,
wc.RequirementType,
wc.Name as WorkflowName,
COUNT(r.Id) as ActiveRequirementsCount
FROM WorkflowDeployments wd
JOIN WorkflowConfigurations wc ON wd.WorkflowConfigurationId = wc.Id
LEFT JOIN Requirements r ON r.CurrentWorkflowConfigId = wc.Id
AND r.Status NOT IN ('Completed', 'Rejected', 'Cancelled')
WHERE wd.IsActive = 1
AND wd.ReviewStatus = 'Approved'
GROUP BY wd.Id, wd.WorkflowConfigurationId, wd.Version, wd.DeploymentType,
wd.Environment, wd.CreatedBy, wd.ReviewedBy, wd.ApprovedBy,
wd.DeployedBy, wd.ReviewStatus, wd.ReviewComments, wd.ReviewDate,
wd.ApprovalDate, wd.DeploymentDate, wd.ConfigurationSnapshot,
wd.ChangesSummary, wd.AffectedRequirements, wd.RollbackPlan,
wd.DeploymentNotes, wd.IsActive, wd.CanRollback, wd.CreatedAt,
wd.ModifiedAt, wc.RequirementType, wc.Name;

-- View für Requirement-Übersicht
CREATE VIEW RequirementOverview AS
SELECT
r.*,
wc.Name as WorkflowName,
fc.Name as FormName,
COUNT(ra.Id) as AttachmentCount,
COUNT(rc.Id) as CommentCount,
wsi.Status as CurrentStepStatus,
wsi.AssignedTo as CurrentAssignee,
wsi.DueDate as CurrentStepDueDate
FROM Requirements r
LEFT JOIN WorkflowConfigurations wc ON r.CurrentWorkflowConfigId = wc.Id
LEFT JOIN FormConfigurations fc ON r.FormConfigurationId = fc.Id
LEFT JOIN RequirementAttachments ra ON r.Id = ra.RequirementId
LEFT JOIN RequirementComments rc ON r.Id = rc.RequirementId
LEFT JOIN WorkflowStepInstances wsi ON r.WorkflowInstanceId = wsi.Id
AND wsi.Status IN ('Pending', 'InProgress')
GROUP BY r.Id, r.RequirementNumber, r.Title, r.Description, r.RequirementType,
r.Priority, r.Status, r.RequestedBy, r.BusinessOwner, r.TechnicalOwner,
r.Department, r.CostCenter, r.EstimatedCost, r.ApprovedBudget,
r.ActualCost, r.Currency, r.RequestedDate, r.RequiredByDate,
r.StartDate, r.CompletedDate, r.CurrentWorkflowConfigId,
r.CurrentWorkflowStep, r.WorkflowInstanceId, r.FormData,
r.FormConfigurationId, r.HasPersonalData, r.SecurityClassification,
r.ComplianceFlags, r.CreatedAt, r.ModifiedAt, r.CreatedBy,
r.ModifiedBy, wc.Name, fc.Name, wsi.Status, wsi.AssignedTo, wsi.DueDate;

-- ====================================
-- SAMPLE DATA FÜR TESTING
-- ====================================

-- Sample Requirements
INSERT INTO Requirements (RequirementNumber, Title, Description, RequirementType, Priority, RequestedBy, EstimatedCost, RequiredByDate) VALUES
('REQ-2025-001', 'Neue CRM-Integration', 'Integration des bestehenden CRM-Systems mit der Anforderungsverwaltung', 'Großanforderung', 'High', 'max.mustermann@company.com', 25000.00, '2025-12-31'),
('REQ-2025-002', 'Bugfix User Login', 'Behebung des Login-Problems bei externen Benutzern', 'Kleinanforderung', 'Urgent', 'anna.schmidt@company.com', 2500.00, '2025-08-15'),
('REQ-2025-003', 'Dashboard Performance Optimierung', 'Verbesserung der Ladezeiten des Management-Dashboards', 'TIA-Anforderung', 'Medium', 'thomas.wagner@company.com', 8000.00, '2025-10-01');

-- Sample Workflow Deployment
INSERT INTO WorkflowDeployments (WorkflowConfigurationId, Version, DeploymentType, CreatedBy, ReviewStatus, ConfigurationSnapshot, ChangesSummary)
SELECT
Id,
'v1.0',
'Live',
'system@company.com',
'Approved',
'{“steps”: [], “metadata”: {}}',
'Initial deployment of enhanced workflow system'
FROM WorkflowConfigurations
WHERE RequirementType = 'Kleinanforderung';

