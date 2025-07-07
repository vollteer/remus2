-- ====================================
-- WORKFLOW & FORM MANAGEMENT TABLES
--====================================

-- Workflow Configurations (JSON-based)
CREATE TABLE WorkflowConfigurations (
Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
RequirementType NVARCHAR(100) NOT NULL,
Name NVARCHAR(255) NOT NULL,
Description NVARCHAR(MAX),
ConfigurationData NVARCHAR(MAX) NOT NULL, -- JSON: Steps, Branching, Permissions
Version INT DEFAULT 1,
IsActive BIT DEFAULT 1,
CreatedAt DATETIME2 DEFAULT GETDATE(),
ModifiedAt DATETIME2 DEFAULT GETDATE(),
CreatedBy NVARCHAR(255),

-- Indexes for better performance
INDEX IX_WorkflowConfigurations_RequirementType (RequirementType),
INDEX IX_WorkflowConfigurations_IsActive (IsActive)

);

-- Form Configurations (JSON-based)
CREATE TABLE FormConfigurations (
Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
RequirementType NVARCHAR(100) NOT NULL,
WorkflowStepId NVARCHAR(100), -- Optional: Bind form to specific workflow step
Name NVARCHAR(255) NOT NULL,
Description NVARCHAR(MAX),
ConfigurationData NVARCHAR(MAX) NOT NULL, -- JSON: Fields, Sections, Permissions, Validation
Version INT DEFAULT 1,
IsActive BIT DEFAULT 1,
HasLightMode BIT DEFAULT 1, -- Supports 'required fields only' mode
CreatedAt DATETIME2 DEFAULT GETDATE(),
ModifiedAt DATETIME2 DEFAULT GETDATE(),
CreatedBy NVARCHAR(255),

-- Indexes
INDEX IX_FormConfigurations_RequirementType (RequirementType),
INDEX IX_FormConfigurations_WorkflowStep (WorkflowStepId),
INDEX IX_FormConfigurations_IsActive (IsActive)

);

-- Form Submissions (Filled out forms)
CREATE TABLE FormSubmissions (
Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
RequirementId UNIQUEIDENTIFIER NOT NULL, -- FK to Requirements table
FormConfigurationId UNIQUEIDENTIFIER NOT NULL,
WorkflowStepId NVARCHAR(100),-- Which step this submission belongs to
SubmissionData NVARCHAR(MAX) NOT NULL,-- JSON: All field values
Status NVARCHAR(50) DEFAULT 'Draft', -- Draft, Submitted, Approved, Rejected
IsLightMode BIT DEFAULT 0, -- Was submitted in light mode (required fields only)
SubmittedAt DATETIME2,
SubmittedBy NVARCHAR(255),
ReviewedAt DATETIME2,
ReviewedBy NVARCHAR(255),
ReviewComments NVARCHAR(MAX),

-- Foreign keys
FOREIGN KEY (FormConfigurationId) REFERENCES FormConfigurations(Id),

-- Indexes
INDEX IX_FormSubmissions_RequirementId (RequirementId),
INDEX IX_FormSubmissions_Status (Status),
INDEX IX_FormSubmissions_SubmittedBy (SubmittedBy)

);

--User Roles & Permissions (for workflow/form access control)
CREATE TABLE UserRoles (
Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
RoleName NVARCHAR(100) NOT NULL UNIQUE,
Description NVARCHAR(MAX),
IsActive BIT DEFAULT 1,
CreatedAt DATETIME2 DEFAULT GETDATE()
);

--User Role Assignments
CREATE TABLE UserRoleAssignments (
Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
UserId NVARCHAR(255) NOT NULL,-- Could be AD username or GUID
RoleId UNIQUEIDENTIFIER NOT NULL,
AssignedAt DATETIME2 DEFAULT GETDATE(),
AssignedBy NVARCHAR(255),

FOREIGN KEY (RoleId) REFERENCES UserRoles(Id),

-- Unique constraint to prevent duplicate assignments
UNIQUE (UserId, RoleId),
INDEX IX_UserRoleAssignments_UserId (UserId)

);
-- Workflow Step Instances (Runtime workflow state)
CREATE TABLE WorkflowStepInstances (
Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
RequirementId UNIQUEIDENTIFIER NOT NULL,
WorkflowConfigurationId UNIQUEIDENTIFIER NOT NULL,
StepId NVARCHAR(100) NOT NULL, -- Reference to step in WorkflowConfiguration JSON
Status NVARCHAR(50) DEFAULT 'Pending', -- Pending, InProgress, Completed, Skipped, Rejected
AssignedTo NVARCHAR(255), -- Current assignee
StartedAt DATETIME2,
CompletedAt DATETIME2,
DueDate DATETIME2,
Comments NVARCHAR(MAX),
StepData NVARCHAR(MAX), -- JSON: Step-specific data, decisions made

FOREIGN KEY (WorkflowConfigurationId) REFERENCES WorkflowConfigurations(Id),

INDEX IX_WorkflowStepInstances_RequirementId (RequirementId),
INDEX IX_WorkflowStepInstances_Status (Status),
INDEX IX_WorkflowStepInstances_AssignedTo (AssignedTo)

);

-- ====================================
-- EXAMPLE JSON STRUCTURES
-- ====================================

--WorkflowConfiguration.ConfigurationData Example:
/*
{
'steps': [
{
'id': 'step-1',
'title': 'Antrag erstellen',
'type': 'task',
'responsible': 'AG',
'permissions': {
'allowedRoles': ['Requester', 'BusinessUser'],
'allowedUsers': ['user1@company.com'],
'denyRoles': ['ReadOnly']
},
'estimatedDays': 1,
'required': true,
'conditions': [],
'branches': null,
'formBinding': 'form-step-1' // Optional: Specific form for this step
},
{
'id': 'step-2',
'title': 'Prüfung',
'type': 'decision',
'responsible': 'AN',
'permissions': {
'allowedRoles': ['Approver', 'TechnicalLead'],
'allowedUsers': [],
'requiresRole': 'Approver' // Must have this role
},
'estimatedDays': 3,
'required': true,
'conditions': [
{
'field': 'budget',
'operator': 'greaterThan',
'value': 10000,
'action': 'require'
}
],
'branches': {
'approved': 'step-3',
'rejected': 'step-reject',
'needsMoreInfo': 'step-1'
}
}
],
'metadata': {
'version': '1.0',
'createdBy': 'system',
'totalEstimatedDays': 15
}
}
*/

-- FormConfiguration.ConfigurationData Example:
/*
{
'sections': [
{
'id': 'section-1',
'title': 'Grunddaten',
'description': 'Allgemeine Informationen',
'order': 1,
'collapsible': false,
'permissions': {
'allowedRoles': ['All'],
'allowedUsers': [],
'readOnlyRoles': ['ReadOnly']
}
}
],
'fields': [
{
'id': 'field-1',
'type': 'text',
'name': 'shortDescription',
'label': 'Kurzbezeichnung',
'placeholder': 'Kurze Beschreibung...',
'required': true,
'lightModeVisible': true, // Show in light mode (required fields only)
'section': 'section-1',
'order': 1,
'width': 'full',
'permissions': {
'allowedRoles': ['Requester', 'Approver'],
'allowedUsers': ['specific.user@company.com'],
'readOnlyRoles': ['Viewer'],
'hideFromRoles': ['External']
},
'validation': [
{
'type': 'required',
'message': 'Kurzbezeichnung ist erforderlich'
},
{
'type': 'minLength',
'value': 5,
'message': 'Mindestens 5 Zeichen'
}
],
'workflowStepBinding': ['step-1', 'step-2'], // Show in these workflow steps
'conditionalRules': [
{
'field': 'requirementType',
'operator': 'equals',
'value': 'Großanforderung',
'action': 'show'
}
]
},
{
'id': 'field-2',
'type': 'select',
'name': 'priority',
'label': 'Priorität',
'required': false,
'lightModeVisible': false, // Hide in light mode
'section': 'section-1',
'order': 2,
'width': 'half',
'options': [
{'value': 'low', 'label': 'Niedrig'},
{'value': 'medium', 'label': 'Mittel'},
{'value': 'high', 'label': 'Hoch'}
],
'permissions': {
'allowedRoles': ['Approver', 'Manager'],
'allowedUsers': [],
'readOnlyRoles': ['Requester'] // Requester can see but not edit
},
'workflowStepBinding': ['step-2'], // Only show in approval step
'defaultValue': 'medium'
}
],
'permissions': {
'allowedRoles': ['Requester', 'Approver'],
'denyRoles': ['Guest'],
'adminRoles': ['Administrator'] // Full access regardless of field permissions
},
'lightMode': {
'enabled': true,
'title': 'Schnellerstellung (nur Pflichtfelder)',
'description': 'Vereinfachte Eingabe mit nur den wichtigsten Feldern'
}
}
*/

--FormSubmission.SubmissionData Example:
/*
{
'fieldValues': {
'shortDescription': 'Neue CRM Integration',
'priority': 'high',
'budget': 25000,
'targetDate': '2025-12-31',
'compliance': ['dataProtection', 'security']
},
'metadata': {
'submittedInLightMode': false,
'workflowStep': 'step-1',
'submissionTime': '2025-07-02T10:30:00Z',
'userAgent': 'Mozilla/5.0...',
'formVersion': 3
},
'validationResults': {
'isValid': true,
'errors': [],
'warnings': ['Budget higher than usual for this requirement type']
}
}
*/

--Insert default roles
INSERT INTO UserRoles (RoleName, Description) VALUES
('Administrator', 'Full system access'),
('Manager', 'Can approve and manage workflows'),
('Approver', 'Can approve requirements'),
('Requester', 'Can create and edit own requirements'),
('TechnicalLead', 'Technical review and implementation'),
('BusinessUser', 'Business domain expert'),
('Viewer', 'Read-only access'),
('External', 'Limited external access');

-- ====================================
-- JSON QUERY EXAMPLES (for later use)
-- ====================================
--
-- Find all forms that have a specific field type
-- SELECT * FROM FormConfigurations
-- WHERE JSON_QUERY(ConfigurationData, '$.fields[?(@.type == 'currency')]') IS NOT NULL;
--
-- Get workflow steps for a specific requirement type
-- SELECT JSON_QUERY(ConfigurationData, '$.steps')
-- FROM WorkflowConfigurations
-- WHERE RequirementType = 'Großanforderung' AND IsActive = 1;
--
-- Find forms that support light mode
-- SELECT * FROM FormConfigurations
-- WHERE JSON_VALUE(ConfigurationData, '$.lightMode.enabled') = 'true';

