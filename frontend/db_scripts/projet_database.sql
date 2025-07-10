USE [REQUIREMENTS]
GO
/****** Object:  Table [dbo].[WorkflowConfigurations]    Script Date: 7/10/2025 8:55:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WorkflowConfigurations](
	[Id] [uniqueidentifier] NOT NULL,
	[RequirementType] [nvarchar](100) NOT NULL,
	[Name] [nvarchar](255) NOT NULL,
	[Description] [nvarchar](max) NULL,
	[ConfigurationData] [nvarchar](max) NOT NULL,
	[Version] [int] NULL,
	[IsActive] [bit] NULL,
	[CreatedAt] [datetime2](7) NULL,
	[ModifiedAt] [datetime2](7) NULL,
	[CreatedBy] [nvarchar](255) NULL,
	[ModifiedBy] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Requirements]    Script Date: 7/10/2025 8:55:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Requirements](
	[Id] [uniqueidentifier] NOT NULL,
	[RequirementNumber] [nvarchar](50) NOT NULL,
	[Title] [nvarchar](255) NOT NULL,
	[Description] [nvarchar](max) NULL,
	[RequirementType] [nvarchar](100) NOT NULL,
	[Priority] [nvarchar](50) NULL,
	[Status] [nvarchar](50) NULL,
	[RequestedBy] [nvarchar](255) NOT NULL,
	[BusinessOwner] [nvarchar](255) NULL,
	[TechnicalOwner] [nvarchar](255) NULL,
	[Department] [nvarchar](100) NULL,
	[CostCenter] [nvarchar](50) NULL,
	[EstimatedCost] [decimal](18, 2) NULL,
	[ApprovedBudget] [decimal](18, 2) NULL,
	[ActualCost] [decimal](18, 2) NULL,
	[Currency] [nvarchar](3) NULL,
	[RequestedDate] [datetime2](7) NULL,
	[RequiredByDate] [datetime2](7) NULL,
	[StartDate] [datetime2](7) NULL,
	[CompletedDate] [datetime2](7) NULL,
	[CurrentWorkflowConfigId] [uniqueidentifier] NULL,
	[CurrentWorkflowStep] [nvarchar](100) NULL,
	[WorkflowInstanceId] [uniqueidentifier] NULL,
	[FormData] [nvarchar](max) NULL,
	[FormConfigurationId] [uniqueidentifier] NULL,
	[HasPersonalData] [bit] NULL,
	[SecurityClassification] [nvarchar](50) NULL,
	[ComplianceFlags] [nvarchar](max) NULL,
	[CreatedAt] [datetime2](7) NULL,
	[ModifiedAt] [datetime2](7) NULL,
	[CreatedBy] [nvarchar](255) NULL,
	[ModifiedBy] [nvarchar](255) NULL,
	[AssignedTo] [nvarchar](255) NULL,
	[DueDate] [datetime2](7) NULL,
	[CurrentStepDueDate] [datetime2](7) NULL,
	[ReminderDate] [datetime2](7) NULL,
	[AssignedUserId] [nvarchar](255) NULL,
	[AssignedUserEmail] [nvarchar](255) NULL,
	[IsPublic] [bit] NULL,
	[LastReminderSent] [datetime2](7) NULL,
	[EscalationLevel] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[RequirementNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WorkflowDeployments]    Script Date: 7/10/2025 8:55:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WorkflowDeployments](
	[Id] [uniqueidentifier] NOT NULL,
	[WorkflowConfigurationId] [uniqueidentifier] NOT NULL,
	[Version] [nvarchar](20) NOT NULL,
	[DeploymentType] [nvarchar](50) NOT NULL,
	[Environment] [nvarchar](50) NULL,
	[CreatedBy] [nvarchar](255) NOT NULL,
	[ReviewedBy] [nvarchar](255) NULL,
	[ApprovedBy] [nvarchar](255) NULL,
	[DeployedBy] [nvarchar](255) NULL,
	[ReviewStatus] [nvarchar](50) NULL,
	[ReviewComments] [nvarchar](max) NULL,
	[ReviewDate] [datetime2](7) NULL,
	[ApprovalDate] [datetime2](7) NULL,
	[DeploymentDate] [datetime2](7) NULL,
	[ConfigurationSnapshot] [nvarchar](max) NOT NULL,
	[ChangesSummary] [nvarchar](max) NULL,
	[AffectedRequirements] [int] NULL,
	[RollbackPlan] [nvarchar](max) NULL,
	[DeploymentNotes] [nvarchar](max) NULL,
	[IsActive] [bit] NULL,
	[CanRollback] [bit] NULL,
	[CreatedAt] [datetime2](7) NULL,
	[ModifiedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  View [dbo].[ActiveWorkflowDeployments]    Script Date: 7/10/2025 8:55:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- ====================================
-- ENHANCED VIEWS FOR REPORTING
-- ====================================

-- View für aktive Workflow-Deployments
CREATE VIEW [dbo].[ActiveWorkflowDeployments] AS
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
GO
/****** Object:  Table [dbo].[RequirementComments]    Script Date: 7/10/2025 8:55:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RequirementComments](
	[Id] [uniqueidentifier] NOT NULL,
	[RequirementId] [uniqueidentifier] NOT NULL,
	[Comment] [nvarchar](max) NOT NULL,
	[CommentType] [nvarchar](50) NULL,
	[WorkflowStep] [nvarchar](100) NULL,
	[PreviousStatus] [nvarchar](50) NULL,
	[NewStatus] [nvarchar](50) NULL,
	[CreatedBy] [nvarchar](255) NOT NULL,
	[IsInternal] [bit] NULL,
	[CreatedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[FormConfigurations]    Script Date: 7/10/2025 8:55:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[FormConfigurations](
	[Id] [uniqueidentifier] NOT NULL,
	[RequirementType] [nvarchar](100) NOT NULL,
	[WorkflowStepId] [nvarchar](100) NULL,
	[Name] [nvarchar](255) NOT NULL,
	[Description] [nvarchar](max) NULL,
	[ConfigurationData] [nvarchar](max) NOT NULL,
	[Version] [int] NULL,
	[IsActive] [bit] NULL,
	[HasLightMode] [bit] NULL,
	[CreatedAt] [datetime2](7) NULL,
	[ModifiedAt] [datetime2](7) NULL,
	[CreatedBy] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WorkflowStepInstances]    Script Date: 7/10/2025 8:55:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WorkflowStepInstances](
	[Id] [uniqueidentifier] NOT NULL,
	[RequirementId] [uniqueidentifier] NOT NULL,
	[WorkflowConfigurationId] [uniqueidentifier] NOT NULL,
	[StepId] [nvarchar](100) NOT NULL,
	[Status] [nvarchar](50) NULL,
	[AssignedTo] [nvarchar](255) NULL,
	[StartedAt] [datetime2](7) NULL,
	[CompletedAt] [datetime2](7) NULL,
	[DueDate] [datetime2](7) NULL,
	[Comments] [nvarchar](max) NULL,
	[StepData] [nvarchar](max) NULL,
	[DeploymentId] [uniqueidentifier] NULL,
	[StepConfiguration] [nvarchar](max) NULL,
	[PermissionOverrides] [nvarchar](max) NULL,
	[StartedBySystem] [bit] NULL,
	[AutoAssigned] [bit] NULL,
	[EscalationLevel] [int] NULL,
	[EscalationDate] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RequirementAttachments]    Script Date: 7/10/2025 8:55:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RequirementAttachments](
	[Id] [uniqueidentifier] NOT NULL,
	[RequirementId] [uniqueidentifier] NOT NULL,
	[FileName] [nvarchar](255) NOT NULL,
	[OriginalFileName] [nvarchar](255) NOT NULL,
	[FileSize] [int] NOT NULL,
	[ContentType] [nvarchar](100) NOT NULL,
	[StoragePath] [nvarchar](500) NULL,
	[StorageType] [nvarchar](50) NULL,
	[UploadedBy] [nvarchar](255) NOT NULL,
	[Description] [nvarchar](500) NULL,
	[Category] [nvarchar](100) NULL,
	[IsPublic] [bit] NULL,
	[RequiresPermission] [bit] NULL,
	[CreatedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[RequirementOverview]    Script Date: 7/10/2025 8:55:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- View für Requirement-Übersicht
CREATE VIEW [dbo].[RequirementOverview] AS
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
GO
/****** Object:  Table [dbo].[CalendarEvents]    Script Date: 7/10/2025 8:55:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CalendarEvents](
	[Id] [uniqueidentifier] NOT NULL,
	[Title] [nvarchar](255) NOT NULL,
	[Description] [nvarchar](max) NULL,
	[EventType] [nvarchar](50) NOT NULL,
	[StartDate] [datetime2](7) NOT NULL,
	[EndDate] [datetime2](7) NULL,
	[StartTime] [time](7) NULL,
	[EndTime] [time](7) NULL,
	[AllDay] [bit] NULL,
	[IsRecurring] [bit] NULL,
	[RecurrencePattern] [nvarchar](max) NULL,
	[RecurrenceEndDate] [datetime2](7) NULL,
	[RequirementId] [uniqueidentifier] NULL,
	[WorkflowStepId] [nvarchar](100) NULL,
	[Category] [nvarchar](100) NULL,
	[Priority] [nvarchar](50) NULL,
	[Status] [nvarchar](50) NULL,
	[Organizer] [nvarchar](255) NOT NULL,
	[Attendees] [nvarchar](max) NULL,
	[RequiredAttendees] [nvarchar](max) NULL,
	[OptionalAttendees] [nvarchar](max) NULL,
	[Location] [nvarchar](255) NULL,
	[MeetingUrl] [nvarchar](500) NULL,
	[MeetingId] [nvarchar](100) NULL,
	[ReminderMinutes] [int] NULL,
	[LastReminderSent] [datetime2](7) NULL,
	[CreatedBy] [nvarchar](255) NOT NULL,
	[CreatedAt] [datetime2](7) NULL,
	[ModifiedBy] [nvarchar](255) NULL,
	[ModifiedAt] [datetime2](7) NULL,
	[IsDeleted] [bit] NULL,
	[DeletedAt] [datetime2](7) NULL,
	[DeletedBy] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CalendarNotifications]    Script Date: 7/10/2025 8:55:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CalendarNotifications](
	[Id] [uniqueidentifier] NOT NULL,
	[NotificationType] [nvarchar](50) NOT NULL,
	[EventId] [uniqueidentifier] NULL,
	[RequirementId] [uniqueidentifier] NULL,
	[UserId] [nvarchar](255) NOT NULL,
	[UserEmail] [nvarchar](255) NOT NULL,
	[Subject] [nvarchar](255) NOT NULL,
	[Message] [nvarchar](max) NOT NULL,
	[DeliveryMethod] [nvarchar](50) NOT NULL,
	[ScheduledFor] [datetime2](7) NOT NULL,
	[SentAt] [datetime2](7) NULL,
	[Status] [nvarchar](50) NULL,
	[ErrorMessage] [nvarchar](max) NULL,
	[RetryCount] [int] NULL,
	[CreatedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CalendarSubscriptions]    Script Date: 7/10/2025 8:55:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CalendarSubscriptions](
	[Id] [uniqueidentifier] NOT NULL,
	[UserId] [nvarchar](255) NOT NULL,
	[UserEmail] [nvarchar](255) NOT NULL,
	[SubscriptionType] [nvarchar](50) NOT NULL,
	[FilterCriteria] [nvarchar](max) NULL,
	[RequirementTypes] [nvarchar](max) NULL,
	[EventTypes] [nvarchar](max) NULL,
	[Priorities] [nvarchar](max) NULL,
	[EmailNotifications] [bit] NULL,
	[PushNotifications] [bit] NULL,
	[NotificationMinutes] [int] NULL,
	[DefaultView] [nvarchar](20) NULL,
	[ShowWeekends] [bit] NULL,
	[TimeFormat] [nvarchar](10) NULL,
	[CreatedAt] [datetime2](7) NULL,
	[ModifiedAt] [datetime2](7) NULL,
	[IsActive] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[UserId] ASC,
	[SubscriptionType] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ConfigurationExports]    Script Date: 7/10/2025 8:55:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ConfigurationExports](
	[Id] [uniqueidentifier] NOT NULL,
	[ExportType] [nvarchar](50) NOT NULL,
	[ExportFormat] [nvarchar](20) NULL,
	[FileName] [nvarchar](255) NOT NULL,
	[WorkflowConfigurationId] [uniqueidentifier] NULL,
	[FormConfigurationId] [uniqueidentifier] NULL,
	[RequirementType] [nvarchar](100) NULL,
	[ExportData] [nvarchar](max) NOT NULL,
	[ExportSize] [int] NULL,
	[Checksum] [nvarchar](64) NULL,
	[ExportedBy] [nvarchar](255) NOT NULL,
	[ExportReason] [nvarchar](max) NULL,
	[TargetEnvironment] [nvarchar](50) NULL,
	[ConfigurationVersion] [nvarchar](20) NULL,
	[ExportVersion] [nvarchar](20) NULL,
	[CreatedAt] [datetime2](7) NULL,
	[ExpiresAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ConfigurationImports]    Script Date: 7/10/2025 8:55:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ConfigurationImports](
	[Id] [uniqueidentifier] NOT NULL,
	[ImportType] [nvarchar](50) NOT NULL,
	[FileName] [nvarchar](255) NOT NULL,
	[SourceExportId] [uniqueidentifier] NULL,
	[ImportData] [nvarchar](max) NOT NULL,
	[ImportSize] [int] NULL,
	[Checksum] [nvarchar](64) NULL,
	[ImportedBy] [nvarchar](255) NOT NULL,
	[ImportReason] [nvarchar](max) NULL,
	[ImportStatus] [nvarchar](50) NULL,
	[ImportErrors] [nvarchar](max) NULL,
	[CreatedWorkflowConfigId] [uniqueidentifier] NULL,
	[CreatedFormConfigId] [uniqueidentifier] NULL,
	[AffectedRequirementsCount] [int] NULL,
	[ValidationResults] [nvarchar](max) NULL,
	[RequiresReview] [bit] NULL,
	[CreatedAt] [datetime2](7) NULL,
	[ProcessedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[FormDeployments]    Script Date: 7/10/2025 8:55:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[FormDeployments](
	[Id] [uniqueidentifier] NOT NULL,
	[FormConfigurationId] [uniqueidentifier] NOT NULL,
	[Version] [nvarchar](20) NOT NULL,
	[DeploymentType] [nvarchar](50) NOT NULL,
	[Environment] [nvarchar](50) NULL,
	[CreatedBy] [nvarchar](255) NOT NULL,
	[ReviewedBy] [nvarchar](255) NULL,
	[ApprovedBy] [nvarchar](255) NULL,
	[DeployedBy] [nvarchar](255) NULL,
	[ReviewStatus] [nvarchar](50) NULL,
	[ReviewComments] [nvarchar](max) NULL,
	[ReviewDate] [datetime2](7) NULL,
	[ApprovalDate] [datetime2](7) NULL,
	[DeploymentDate] [datetime2](7) NULL,
	[ConfigurationSnapshot] [nvarchar](max) NOT NULL,
	[ChangesSummary] [nvarchar](max) NULL,
	[IsActive] [bit] NULL,
	[CreatedAt] [datetime2](7) NULL,
	[ModifiedAt] [datetime2](7) NULL,
	[DeploymentErrors] [nvarchar](max) NULL,
	[ValidationErrors] [nvarchar](max) NULL,
	[ErrorMessage] [nvarchar](max) NULL,
	[LastError] [nvarchar](max) NULL,
	[ErrorCount] [int] NULL,
	[HasErrors] [bit] NULL,
	[RollbackReason] [nvarchar](max) NULL,
	[DeploymentNotes] [nvarchar](max) NULL,
	[AffectedRequirements] [int] NULL,
	[CanRollback] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[FormSubmissions]    Script Date: 7/10/2025 8:55:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[FormSubmissions](
	[Id] [uniqueidentifier] NOT NULL,
	[RequirementId] [uniqueidentifier] NOT NULL,
	[FormConfigurationId] [uniqueidentifier] NOT NULL,
	[WorkflowStepId] [nvarchar](100) NULL,
	[SubmissionData] [nvarchar](max) NOT NULL,
	[Status] [nvarchar](50) NULL,
	[IsLightMode] [bit] NULL,
	[SubmittedAt] [datetime2](7) NULL,
	[SubmittedBy] [nvarchar](255) NULL,
	[ReviewedAt] [datetime2](7) NULL,
	[ReviewedBy] [nvarchar](255) NULL,
	[ReviewComments] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserRoleAssignments]    Script Date: 7/10/2025 8:55:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserRoleAssignments](
	[Id] [uniqueidentifier] NOT NULL,
	[UserId] [nvarchar](255) NOT NULL,
	[RoleId] [uniqueidentifier] NOT NULL,
	[AssignedAt] [datetime2](7) NULL,
	[AssignedBy] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[UserId] ASC,
	[RoleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserRoles]    Script Date: 7/10/2025 8:55:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserRoles](
	[Id] [uniqueidentifier] NOT NULL,
	[RoleName] [nvarchar](100) NOT NULL,
	[Description] [nvarchar](max) NULL,
	[IsActive] [bit] NULL,
	[CreatedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[RoleName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WorkLogAttachments]    Script Date: 7/10/2025 8:55:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WorkLogAttachments](
	[Id] [uniqueidentifier] NOT NULL,
	[WorkLogEntryId] [uniqueidentifier] NOT NULL,
	[FileName] [nvarchar](255) NOT NULL,
	[OriginalFileName] [nvarchar](255) NOT NULL,
	[FileSize] [int] NOT NULL,
	[ContentType] [nvarchar](100) NOT NULL,
	[StoragePath] [nvarchar](500) NULL,
	[StorageType] [nvarchar](50) NULL,
	[UploadedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WorkLogEntries]    Script Date: 7/10/2025 8:55:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WorkLogEntries](
	[Id] [uniqueidentifier] NOT NULL,
	[RequirementId] [uniqueidentifier] NOT NULL,
	[UserId] [nvarchar](255) NOT NULL,
	[UserName] [nvarchar](255) NOT NULL,
	[UserEmail] [nvarchar](255) NULL,
	[UserAvatar] [nvarchar](500) NULL,
	[Action] [nvarchar](100) NOT NULL,
	[Category] [nvarchar](50) NULL,
	[Description] [nvarchar](max) NOT NULL,
	[FieldName] [nvarchar](100) NULL,
	[OldValue] [nvarchar](max) NULL,
	[NewValue] [nvarchar](max) NULL,
	[WorkflowStep] [nvarchar](100) NULL,
	[ClientInfo] [nvarchar](max) NULL,
	[TimeSpent] [int] NULL,
	[CreatedAt] [datetime2](7) NULL,
	[IsSystemGenerated] [bit] NULL,
	[IsPublic] [bit] NULL,
	[IsDeleted] [bit] NULL,
	[DeletedAt] [datetime2](7) NULL,
	[DeletedBy] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [dbo].[CalendarEvents] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[CalendarEvents] ADD  DEFAULT ((0)) FOR [AllDay]
GO
ALTER TABLE [dbo].[CalendarEvents] ADD  DEFAULT ((0)) FOR [IsRecurring]
GO
ALTER TABLE [dbo].[CalendarEvents] ADD  DEFAULT ('Medium') FOR [Priority]
GO
ALTER TABLE [dbo].[CalendarEvents] ADD  DEFAULT ('Scheduled') FOR [Status]
GO
ALTER TABLE [dbo].[CalendarEvents] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[CalendarEvents] ADD  DEFAULT (getdate()) FOR [ModifiedAt]
GO
ALTER TABLE [dbo].[CalendarEvents] ADD  DEFAULT ((0)) FOR [IsDeleted]
GO
ALTER TABLE [dbo].[CalendarNotifications] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[CalendarNotifications] ADD  DEFAULT ('Pending') FOR [Status]
GO
ALTER TABLE [dbo].[CalendarNotifications] ADD  DEFAULT ((0)) FOR [RetryCount]
GO
ALTER TABLE [dbo].[CalendarNotifications] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[CalendarSubscriptions] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[CalendarSubscriptions] ADD  DEFAULT ((1)) FOR [EmailNotifications]
GO
ALTER TABLE [dbo].[CalendarSubscriptions] ADD  DEFAULT ((1)) FOR [PushNotifications]
GO
ALTER TABLE [dbo].[CalendarSubscriptions] ADD  DEFAULT ((60)) FOR [NotificationMinutes]
GO
ALTER TABLE [dbo].[CalendarSubscriptions] ADD  DEFAULT ('month') FOR [DefaultView]
GO
ALTER TABLE [dbo].[CalendarSubscriptions] ADD  DEFAULT ((1)) FOR [ShowWeekends]
GO
ALTER TABLE [dbo].[CalendarSubscriptions] ADD  DEFAULT ('24h') FOR [TimeFormat]
GO
ALTER TABLE [dbo].[CalendarSubscriptions] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[CalendarSubscriptions] ADD  DEFAULT (getdate()) FOR [ModifiedAt]
GO
ALTER TABLE [dbo].[CalendarSubscriptions] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[ConfigurationExports] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[ConfigurationExports] ADD  DEFAULT ('JSON') FOR [ExportFormat]
GO
ALTER TABLE [dbo].[ConfigurationExports] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ConfigurationImports] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[ConfigurationImports] ADD  DEFAULT ('Pending') FOR [ImportStatus]
GO
ALTER TABLE [dbo].[ConfigurationImports] ADD  DEFAULT ((0)) FOR [AffectedRequirementsCount]
GO
ALTER TABLE [dbo].[ConfigurationImports] ADD  DEFAULT ((1)) FOR [RequiresReview]
GO
ALTER TABLE [dbo].[ConfigurationImports] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[FormConfigurations] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[FormConfigurations] ADD  DEFAULT ((1)) FOR [Version]
GO
ALTER TABLE [dbo].[FormConfigurations] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[FormConfigurations] ADD  DEFAULT ((1)) FOR [HasLightMode]
GO
ALTER TABLE [dbo].[FormConfigurations] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[FormConfigurations] ADD  DEFAULT (getdate()) FOR [ModifiedAt]
GO
ALTER TABLE [dbo].[FormDeployments] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[FormDeployments] ADD  DEFAULT ('Production') FOR [Environment]
GO
ALTER TABLE [dbo].[FormDeployments] ADD  DEFAULT ('Pending') FOR [ReviewStatus]
GO
ALTER TABLE [dbo].[FormDeployments] ADD  DEFAULT ((0)) FOR [IsActive]
GO
ALTER TABLE [dbo].[FormDeployments] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[FormDeployments] ADD  DEFAULT (getdate()) FOR [ModifiedAt]
GO
ALTER TABLE [dbo].[FormDeployments] ADD  DEFAULT ((0)) FOR [ErrorCount]
GO
ALTER TABLE [dbo].[FormDeployments] ADD  DEFAULT ((0)) FOR [HasErrors]
GO
ALTER TABLE [dbo].[FormDeployments] ADD  DEFAULT ((0)) FOR [AffectedRequirements]
GO
ALTER TABLE [dbo].[FormDeployments] ADD  DEFAULT ((1)) FOR [CanRollback]
GO
ALTER TABLE [dbo].[FormSubmissions] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[FormSubmissions] ADD  DEFAULT ('Draft') FOR [Status]
GO
ALTER TABLE [dbo].[FormSubmissions] ADD  DEFAULT ((0)) FOR [IsLightMode]
GO
ALTER TABLE [dbo].[RequirementAttachments] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[RequirementAttachments] ADD  DEFAULT ('FileSystem') FOR [StorageType]
GO
ALTER TABLE [dbo].[RequirementAttachments] ADD  DEFAULT ((0)) FOR [IsPublic]
GO
ALTER TABLE [dbo].[RequirementAttachments] ADD  DEFAULT ((1)) FOR [RequiresPermission]
GO
ALTER TABLE [dbo].[RequirementAttachments] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[RequirementComments] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[RequirementComments] ADD  DEFAULT ('General') FOR [CommentType]
GO
ALTER TABLE [dbo].[RequirementComments] ADD  DEFAULT ((0)) FOR [IsInternal]
GO
ALTER TABLE [dbo].[RequirementComments] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Requirements] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[Requirements] ADD  DEFAULT ('Medium') FOR [Priority]
GO
ALTER TABLE [dbo].[Requirements] ADD  DEFAULT ('Draft') FOR [Status]
GO
ALTER TABLE [dbo].[Requirements] ADD  DEFAULT ('EUR') FOR [Currency]
GO
ALTER TABLE [dbo].[Requirements] ADD  DEFAULT (getdate()) FOR [RequestedDate]
GO
ALTER TABLE [dbo].[Requirements] ADD  DEFAULT ((0)) FOR [HasPersonalData]
GO
ALTER TABLE [dbo].[Requirements] ADD  DEFAULT ('Internal') FOR [SecurityClassification]
GO
ALTER TABLE [dbo].[Requirements] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Requirements] ADD  DEFAULT (getdate()) FOR [ModifiedAt]
GO
ALTER TABLE [dbo].[Requirements] ADD  DEFAULT ((0)) FOR [IsPublic]
GO
ALTER TABLE [dbo].[Requirements] ADD  DEFAULT ((0)) FOR [EscalationLevel]
GO
ALTER TABLE [dbo].[UserRoleAssignments] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[UserRoleAssignments] ADD  DEFAULT (getdate()) FOR [AssignedAt]
GO
ALTER TABLE [dbo].[UserRoles] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[UserRoles] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[UserRoles] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[WorkflowConfigurations] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[WorkflowConfigurations] ADD  DEFAULT ((1)) FOR [Version]
GO
ALTER TABLE [dbo].[WorkflowConfigurations] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[WorkflowConfigurations] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[WorkflowConfigurations] ADD  DEFAULT (getdate()) FOR [ModifiedAt]
GO
ALTER TABLE [dbo].[WorkflowDeployments] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[WorkflowDeployments] ADD  DEFAULT ('Production') FOR [Environment]
GO
ALTER TABLE [dbo].[WorkflowDeployments] ADD  DEFAULT ('Pending') FOR [ReviewStatus]
GO
ALTER TABLE [dbo].[WorkflowDeployments] ADD  DEFAULT ((0)) FOR [AffectedRequirements]
GO
ALTER TABLE [dbo].[WorkflowDeployments] ADD  DEFAULT ((0)) FOR [IsActive]
GO
ALTER TABLE [dbo].[WorkflowDeployments] ADD  DEFAULT ((1)) FOR [CanRollback]
GO
ALTER TABLE [dbo].[WorkflowDeployments] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[WorkflowDeployments] ADD  DEFAULT (getdate()) FOR [ModifiedAt]
GO
ALTER TABLE [dbo].[WorkflowStepInstances] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[WorkflowStepInstances] ADD  DEFAULT ('Pending') FOR [Status]
GO
ALTER TABLE [dbo].[WorkflowStepInstances] ADD  DEFAULT ((0)) FOR [StartedBySystem]
GO
ALTER TABLE [dbo].[WorkflowStepInstances] ADD  DEFAULT ((0)) FOR [AutoAssigned]
GO
ALTER TABLE [dbo].[WorkflowStepInstances] ADD  DEFAULT ((0)) FOR [EscalationLevel]
GO
ALTER TABLE [dbo].[WorkLogAttachments] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[WorkLogAttachments] ADD  DEFAULT ('FileSystem') FOR [StorageType]
GO
ALTER TABLE [dbo].[WorkLogAttachments] ADD  DEFAULT (getdate()) FOR [UploadedAt]
GO
ALTER TABLE [dbo].[WorkLogEntries] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[WorkLogEntries] ADD  DEFAULT ('General') FOR [Category]
GO
ALTER TABLE [dbo].[WorkLogEntries] ADD  DEFAULT ((0)) FOR [TimeSpent]
GO
ALTER TABLE [dbo].[WorkLogEntries] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[WorkLogEntries] ADD  DEFAULT ((0)) FOR [IsSystemGenerated]
GO
ALTER TABLE [dbo].[WorkLogEntries] ADD  DEFAULT ((1)) FOR [IsPublic]
GO
ALTER TABLE [dbo].[WorkLogEntries] ADD  DEFAULT ((0)) FOR [IsDeleted]
GO
ALTER TABLE [dbo].[CalendarEvents]  WITH CHECK ADD FOREIGN KEY([RequirementId])
REFERENCES [dbo].[Requirements] ([Id])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[CalendarNotifications]  WITH CHECK ADD FOREIGN KEY([EventId])
REFERENCES [dbo].[CalendarEvents] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[CalendarNotifications]  WITH CHECK ADD FOREIGN KEY([RequirementId])
REFERENCES [dbo].[Requirements] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ConfigurationExports]  WITH CHECK ADD FOREIGN KEY([FormConfigurationId])
REFERENCES [dbo].[FormConfigurations] ([Id])
GO
ALTER TABLE [dbo].[ConfigurationExports]  WITH CHECK ADD FOREIGN KEY([WorkflowConfigurationId])
REFERENCES [dbo].[WorkflowConfigurations] ([Id])
GO
ALTER TABLE [dbo].[ConfigurationImports]  WITH CHECK ADD FOREIGN KEY([SourceExportId])
REFERENCES [dbo].[ConfigurationExports] ([Id])
GO
ALTER TABLE [dbo].[FormDeployments]  WITH CHECK ADD FOREIGN KEY([FormConfigurationId])
REFERENCES [dbo].[FormConfigurations] ([Id])
GO
ALTER TABLE [dbo].[FormSubmissions]  WITH CHECK ADD FOREIGN KEY([FormConfigurationId])
REFERENCES [dbo].[FormConfigurations] ([Id])
GO
ALTER TABLE [dbo].[RequirementAttachments]  WITH CHECK ADD FOREIGN KEY([RequirementId])
REFERENCES [dbo].[Requirements] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[RequirementComments]  WITH CHECK ADD FOREIGN KEY([RequirementId])
REFERENCES [dbo].[Requirements] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Requirements]  WITH CHECK ADD FOREIGN KEY([CurrentWorkflowConfigId])
REFERENCES [dbo].[WorkflowConfigurations] ([Id])
GO
ALTER TABLE [dbo].[Requirements]  WITH CHECK ADD FOREIGN KEY([FormConfigurationId])
REFERENCES [dbo].[FormConfigurations] ([Id])
GO
ALTER TABLE [dbo].[UserRoleAssignments]  WITH CHECK ADD FOREIGN KEY([RoleId])
REFERENCES [dbo].[UserRoles] ([Id])
GO
ALTER TABLE [dbo].[WorkflowDeployments]  WITH CHECK ADD FOREIGN KEY([WorkflowConfigurationId])
REFERENCES [dbo].[WorkflowConfigurations] ([Id])
GO
ALTER TABLE [dbo].[WorkflowStepInstances]  WITH CHECK ADD FOREIGN KEY([DeploymentId])
REFERENCES [dbo].[WorkflowDeployments] ([Id])
GO
ALTER TABLE [dbo].[WorkflowStepInstances]  WITH CHECK ADD FOREIGN KEY([WorkflowConfigurationId])
REFERENCES [dbo].[WorkflowConfigurations] ([Id])
GO
ALTER TABLE [dbo].[WorkLogAttachments]  WITH CHECK ADD FOREIGN KEY([WorkLogEntryId])
REFERENCES [dbo].[WorkLogEntries] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[WorkLogEntries]  WITH CHECK ADD FOREIGN KEY([RequirementId])
REFERENCES [dbo].[Requirements] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[FormDeployments]  WITH CHECK ADD  CONSTRAINT [CK_FormDeployments_4Eyes] CHECK  ((([ReviewedBy] IS NULL OR [ReviewedBy]<>[CreatedBy]) AND ([ApprovedBy] IS NULL OR [ApprovedBy]<>[CreatedBy]) AND ([ApprovedBy] IS NULL OR [ApprovedBy]<>[ReviewedBy])))
GO
ALTER TABLE [dbo].[FormDeployments] CHECK CONSTRAINT [CK_FormDeployments_4Eyes]
GO
ALTER TABLE [dbo].[WorkflowDeployments]  WITH CHECK ADD  CONSTRAINT [CK_WorkflowDeployments_4Eyes] CHECK  ((([ReviewedBy] IS NULL OR [ReviewedBy]<>[CreatedBy]) AND ([ApprovedBy] IS NULL OR [ApprovedBy]<>[CreatedBy]) AND ([ApprovedBy] IS NULL OR [ApprovedBy]<>[ReviewedBy])))
GO
ALTER TABLE [dbo].[WorkflowDeployments] CHECK CONSTRAINT [CK_WorkflowDeployments_4Eyes]
GO
