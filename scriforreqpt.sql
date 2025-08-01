USE [master]
GO
/****** Object:  Database [REQUIREMENTS]    Script Date: 30.07.2025 09:16:07 ******/
CREATE DATABASE [REQUIREMENTS]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'REQUIREMENTS', FILENAME = N'C:\Daten\SQL\REQUIREMENTS.mdf' , SIZE = 131072KB , MAXSIZE = 1048576KB , FILEGROWTH = 524288KB )
 LOG ON 
( NAME = N'REQUIREMENTS_log', FILENAME = N'C:\Daten\SQL\REQUIREMENTS_log.ldf' , SIZE = 65536KB , MAXSIZE = 1048576KB , FILEGROWTH = 1048576KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [REQUIREMENTS] SET COMPATIBILITY_LEVEL = 130
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [REQUIREMENTS].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [REQUIREMENTS] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [REQUIREMENTS] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [REQUIREMENTS] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [REQUIREMENTS] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [REQUIREMENTS] SET ARITHABORT OFF 
GO
ALTER DATABASE [REQUIREMENTS] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [REQUIREMENTS] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [REQUIREMENTS] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [REQUIREMENTS] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [REQUIREMENTS] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [REQUIREMENTS] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [REQUIREMENTS] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [REQUIREMENTS] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [REQUIREMENTS] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [REQUIREMENTS] SET  DISABLE_BROKER 
GO
ALTER DATABASE [REQUIREMENTS] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [REQUIREMENTS] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [REQUIREMENTS] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [REQUIREMENTS] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [REQUIREMENTS] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [REQUIREMENTS] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [REQUIREMENTS] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [REQUIREMENTS] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [REQUIREMENTS] SET  MULTI_USER 
GO
ALTER DATABASE [REQUIREMENTS] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [REQUIREMENTS] SET DB_CHAINING OFF 
GO
ALTER DATABASE [REQUIREMENTS] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [REQUIREMENTS] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [REQUIREMENTS] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [REQUIREMENTS] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [REQUIREMENTS] SET QUERY_STORE = OFF
GO
USE [REQUIREMENTS]
GO
/****** Object:  UserDefinedFunction [dbo].[HasCalendarAccess]    Script Date: 30.07.2025 09:16:07 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- ====================================
-- 10. UTILITY FUNCTIONS
-- ====================================

-- Function to check if a user has calendar access to a requirement
CREATE FUNCTION [dbo].[HasCalendarAccess](@UserId NVARCHAR(255), @RequirementId UNIQUEIDENTIFIER)
RETURNS BIT
AS
BEGIN
DECLARE @HasAccess BIT = 0;

SELECT @HasAccess = 1
FROM Requirements r
WHERE r.Id = @RequirementId
AND (r.AssignedUserId = @UserId
OR r.RequestedBy = @UserId
OR r.BusinessOwner = @UserId
OR r.TechnicalOwner = @UserId
OR r.IsPublic = 1);

RETURN ISNULL(@HasAccess, 0);
END;
GO
/****** Object:  Table [dbo].[WorkflowConfigurations]    Script Date: 30.07.2025 09:16:07 ******/
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
	[Version] [nvarchar](20) NULL,
	[IsActive] [bit] NULL,
	[CreatedAt] [datetime2](7) NULL,
	[ModifiedAt] [datetime2](7) NULL,
	[CreatedBy] [nvarchar](255) NULL,
	[ModifiedBy] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Requirements]    Script Date: 30.07.2025 09:16:07 ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[RequirementNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WorkflowDeployments]    Script Date: 30.07.2025 09:16:07 ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  View [dbo].[ActiveWorkflowDeployments]    Script Date: 30.07.2025 09:16:07 ******/
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
/****** Object:  Table [dbo].[CalendarEvents]    Script Date: 30.07.2025 09:16:07 ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CalendarNotifications]    Script Date: 30.07.2025 09:16:07 ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CalendarSubscriptions]    Script Date: 30.07.2025 09:16:07 ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[UserId] ASC,
	[SubscriptionType] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ConfigurationExports]    Script Date: 30.07.2025 09:16:07 ******/
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
	[ExportVersion] [nvarchar](20) NULL,
	[CreatedAt] [datetime2](7) NULL,
	[ExpiresAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ConfigurationImports]    Script Date: 30.07.2025 09:16:07 ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[FormConfigurations]    Script Date: 30.07.2025 09:16:07 ******/
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
	[IsActive] [bit] NULL,
	[HasLightMode] [bit] NULL,
	[CreatedAt] [datetime2](7) NULL,
	[ModifiedAt] [datetime2](7) NULL,
	[CreatedBy] [nvarchar](255) NULL,
	[Version] [nvarchar](20) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[FormDeployments]    Script Date: 30.07.2025 09:16:07 ******/
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
	[Rollback] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[FormSubmissions]    Script Date: 30.07.2025 09:16:07 ******/
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
	[ReviewdBy] [nvarchar](255) NULL,
	[ModifiedBy] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RequirementAttachments]    Script Date: 30.07.2025 09:16:07 ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RequirementComments]    Script Date: 30.07.2025 09:16:07 ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserRoleAssignments]    Script Date: 30.07.2025 09:16:07 ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[UserId] ASC,
	[RoleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserRoles]    Script Date: 30.07.2025 09:16:07 ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[RoleName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WorkflowStepInstances]    Script Date: 30.07.2025 09:16:07 ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WorkLogAttachments]    Script Date: 30.07.2025 09:16:07 ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WorkLogEntries]    Script Date: 30.07.2025 09:16:07 ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_CalendarEvents_Calendar_View]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_CalendarEvents_Calendar_View] ON [dbo].[CalendarEvents]
(
	[StartDate] ASC,
	[EndDate] ASC,
	[EventType] ASC,
	[Status] ASC,
	[IsDeleted] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_CalendarEvents_EndDate]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_CalendarEvents_EndDate] ON [dbo].[CalendarEvents]
(
	[EndDate] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_CalendarEvents_EventType]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_CalendarEvents_EventType] ON [dbo].[CalendarEvents]
(
	[EventType] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_CalendarEvents_Organizer]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_CalendarEvents_Organizer] ON [dbo].[CalendarEvents]
(
	[Organizer] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_CalendarEvents_RequirementId]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_CalendarEvents_RequirementId] ON [dbo].[CalendarEvents]
(
	[RequirementId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_CalendarEvents_StartDate]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_CalendarEvents_StartDate] ON [dbo].[CalendarEvents]
(
	[StartDate] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_CalendarEvents_Status]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_CalendarEvents_Status] ON [dbo].[CalendarEvents]
(
	[Status] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_CalendarNotifications_NotificationType]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_CalendarNotifications_NotificationType] ON [dbo].[CalendarNotifications]
(
	[NotificationType] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_CalendarNotifications_ScheduledFor]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_CalendarNotifications_ScheduledFor] ON [dbo].[CalendarNotifications]
(
	[ScheduledFor] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_CalendarNotifications_Status]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_CalendarNotifications_Status] ON [dbo].[CalendarNotifications]
(
	[Status] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_CalendarNotifications_UserId]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_CalendarNotifications_UserId] ON [dbo].[CalendarNotifications]
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_CalendarSubscriptions_IsActive]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_CalendarSubscriptions_IsActive] ON [dbo].[CalendarSubscriptions]
(
	[IsActive] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_CalendarSubscriptions_SubscriptionType]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_CalendarSubscriptions_SubscriptionType] ON [dbo].[CalendarSubscriptions]
(
	[SubscriptionType] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_CalendarSubscriptions_UserId]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_CalendarSubscriptions_UserId] ON [dbo].[CalendarSubscriptions]
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ConfigurationExports_Created]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_ConfigurationExports_Created] ON [dbo].[ConfigurationExports]
(
	[CreatedAt] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_ConfigurationExports_ExportedBy]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_ConfigurationExports_ExportedBy] ON [dbo].[ConfigurationExports]
(
	[ExportedBy] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ConfigurationExports_FormConfig]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_ConfigurationExports_FormConfig] ON [dbo].[ConfigurationExports]
(
	[FormConfigurationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_ConfigurationExports_Type]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_ConfigurationExports_Type] ON [dbo].[ConfigurationExports]
(
	[ExportType] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_ConfigurationImports_ImportedBy]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_ConfigurationImports_ImportedBy] ON [dbo].[ConfigurationImports]
(
	[ImportedBy] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_ConfigurationImports_Status]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_ConfigurationImports_Status] ON [dbo].[ConfigurationImports]
(
	[ImportStatus] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_ConfigurationImports_Type]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_ConfigurationImports_Type] ON [dbo].[ConfigurationImports]
(
	[ImportType] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_FormConfigurations_IsActive]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_FormConfigurations_IsActive] ON [dbo].[FormConfigurations]
(
	[IsActive] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_FormConfigurations_RequirementType]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_FormConfigurations_RequirementType] ON [dbo].[FormConfigurations]
(
	[RequirementType] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_FormConfigurations_WorkflowStep]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_FormConfigurations_WorkflowStep] ON [dbo].[FormConfigurations]
(
	[WorkflowStepId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_FormDeployments_Active]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_FormDeployments_Active] ON [dbo].[FormDeployments]
(
	[IsActive] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_FormDeployments_CanRollback]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_FormDeployments_CanRollback] ON [dbo].[FormDeployments]
(
	[CanRollback] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_FormDeployments_Config]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_FormDeployments_Config] ON [dbo].[FormDeployments]
(
	[FormConfigurationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_FormDeployments_HasErrors]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_FormDeployments_HasErrors] ON [dbo].[FormDeployments]
(
	[HasErrors] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_FormDeployments_Status]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_FormDeployments_Status] ON [dbo].[FormDeployments]
(
	[ReviewStatus] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_FormSubmissions_RequirementId]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_FormSubmissions_RequirementId] ON [dbo].[FormSubmissions]
(
	[RequirementId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_FormSubmissions_ReviewedBy]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_FormSubmissions_ReviewedBy] ON [dbo].[FormSubmissions]
(
	[ReviewedBy] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_FormSubmissions_Status]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_FormSubmissions_Status] ON [dbo].[FormSubmissions]
(
	[Status] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_FormSubmissions_SubmittedBy]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_FormSubmissions_SubmittedBy] ON [dbo].[FormSubmissions]
(
	[SubmittedBy] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_RequirementAttachments_Requirement]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_RequirementAttachments_Requirement] ON [dbo].[RequirementAttachments]
(
	[RequirementId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_RequirementAttachments_UploadedBy]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_RequirementAttachments_UploadedBy] ON [dbo].[RequirementAttachments]
(
	[UploadedBy] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_RequirementComments_Created]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_RequirementComments_Created] ON [dbo].[RequirementComments]
(
	[CreatedAt] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_RequirementComments_Requirement]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_RequirementComments_Requirement] ON [dbo].[RequirementComments]
(
	[RequirementId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_RequirementComments_Type]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_RequirementComments_Type] ON [dbo].[RequirementComments]
(
	[CommentType] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Requirements_AssignedUser]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_Requirements_AssignedUser] ON [dbo].[Requirements]
(
	[AssignedTo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Requirements_Calendar_Lookup]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_Requirements_Calendar_Lookup] ON [dbo].[Requirements]
(
	[RequirementType] ASC,
	[Status] ASC,
	[DueDate] ASC,
	[CurrentStepDueDate] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Requirements_Dates]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_Requirements_Dates] ON [dbo].[Requirements]
(
	[RequestedDate] ASC,
	[RequiredByDate] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Requirements_DueDate]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_Requirements_DueDate] ON [dbo].[Requirements]
(
	[RequiredByDate] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Requirements_Number]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_Requirements_Number] ON [dbo].[Requirements]
(
	[RequirementNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Requirements_RequestedBy]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_Requirements_RequestedBy] ON [dbo].[Requirements]
(
	[RequestedBy] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Requirements_Status]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_Requirements_Status] ON [dbo].[Requirements]
(
	[Status] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Requirements_Type]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_Requirements_Type] ON [dbo].[Requirements]
(
	[RequirementType] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_UserRoleAssignments_UserId]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_UserRoleAssignments_UserId] ON [dbo].[UserRoleAssignments]
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_WorkflowConfigurations_IsActive]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_WorkflowConfigurations_IsActive] ON [dbo].[WorkflowConfigurations]
(
	[IsActive] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_WorkflowConfigurations_RequirementType]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_WorkflowConfigurations_RequirementType] ON [dbo].[WorkflowConfigurations]
(
	[RequirementType] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_WorkflowDeployments_Active]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_WorkflowDeployments_Active] ON [dbo].[WorkflowDeployments]
(
	[IsActive] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_WorkflowDeployments_Config]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_WorkflowDeployments_Config] ON [dbo].[WorkflowDeployments]
(
	[WorkflowConfigurationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_WorkflowDeployments_Status]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_WorkflowDeployments_Status] ON [dbo].[WorkflowDeployments]
(
	[ReviewStatus] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_WorkflowDeployments_Version]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_WorkflowDeployments_Version] ON [dbo].[WorkflowDeployments]
(
	[Version] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_WorkflowStepInstances_AssignedTo]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_WorkflowStepInstances_AssignedTo] ON [dbo].[WorkflowStepInstances]
(
	[AssignedTo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_WorkflowStepInstances_RequirementId]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_WorkflowStepInstances_RequirementId] ON [dbo].[WorkflowStepInstances]
(
	[RequirementId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_WorkflowStepInstances_Status]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_WorkflowStepInstances_Status] ON [dbo].[WorkflowStepInstances]
(
	[Status] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_WorkLogAttachments_WorkLogEntryId]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_WorkLogAttachments_WorkLogEntryId] ON [dbo].[WorkLogAttachments]
(
	[WorkLogEntryId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_WorkLogEntries_Action]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_WorkLogEntries_Action] ON [dbo].[WorkLogEntries]
(
	[Action] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_WorkLogEntries_Category]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_WorkLogEntries_Category] ON [dbo].[WorkLogEntries]
(
	[Category] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_WorkLogEntries_CreatedAt]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_WorkLogEntries_CreatedAt] ON [dbo].[WorkLogEntries]
(
	[CreatedAt] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_WorkLogEntries_RequirementId]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_WorkLogEntries_RequirementId] ON [dbo].[WorkLogEntries]
(
	[RequirementId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_WorkLogEntries_Timeline]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_WorkLogEntries_Timeline] ON [dbo].[WorkLogEntries]
(
	[RequirementId] ASC,
	[CreatedAt] ASC,
	[IsDeleted] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_WorkLogEntries_UserId]    Script Date: 30.07.2025 09:16:07 ******/
CREATE NONCLUSTERED INDEX [IX_WorkLogEntries_UserId] ON [dbo].[WorkLogEntries]
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
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
ALTER TABLE [dbo].[FormConfigurations] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[FormConfigurations] ADD  DEFAULT ((1)) FOR [HasLightMode]
GO
ALTER TABLE [dbo].[FormConfigurations] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[FormConfigurations] ADD  DEFAULT (getdate()) FOR [ModifiedAt]
GO
ALTER TABLE [dbo].[FormConfigurations] ADD  CONSTRAINT [DF_FormConfigurations_Version]  DEFAULT ('v1.0') FOR [Version]
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
ALTER TABLE [dbo].[FormDeployments] ADD  DEFAULT ((1)) FOR [Rollback]
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
ALTER TABLE [dbo].[ConfigurationExports]  WITH CHECK ADD FOREIGN KEY([FormConfigurationId])
REFERENCES [dbo].[FormConfigurations] ([Id])
GO
ALTER TABLE [dbo].[ConfigurationExports]  WITH CHECK ADD  CONSTRAINT [FK_ConfigurationExports_FormConfigurations] FOREIGN KEY([FormConfigurationId])
REFERENCES [dbo].[FormConfigurations] ([Id])
GO
ALTER TABLE [dbo].[ConfigurationExports] CHECK CONSTRAINT [FK_ConfigurationExports_FormConfigurations]
GO
ALTER TABLE [dbo].[ConfigurationImports]  WITH CHECK ADD FOREIGN KEY([SourceExportId])
REFERENCES [dbo].[ConfigurationExports] ([Id])
GO
ALTER TABLE [dbo].[ConfigurationImports]  WITH CHECK ADD FOREIGN KEY([SourceExportId])
REFERENCES [dbo].[ConfigurationExports] ([Id])
GO
ALTER TABLE [dbo].[FormDeployments]  WITH CHECK ADD FOREIGN KEY([FormConfigurationId])
REFERENCES [dbo].[FormConfigurations] ([Id])
GO
ALTER TABLE [dbo].[FormDeployments]  WITH CHECK ADD FOREIGN KEY([FormConfigurationId])
REFERENCES [dbo].[FormConfigurations] ([Id])
GO
ALTER TABLE [dbo].[FormSubmissions]  WITH CHECK ADD FOREIGN KEY([FormConfigurationId])
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
ALTER TABLE [dbo].[Requirements]  WITH CHECK ADD FOREIGN KEY([CurrentWorkflowConfigId])
REFERENCES [dbo].[WorkflowConfigurations] ([Id])
GO
ALTER TABLE [dbo].[Requirements]  WITH CHECK ADD FOREIGN KEY([FormConfigurationId])
REFERENCES [dbo].[FormConfigurations] ([Id])
GO
ALTER TABLE [dbo].[Requirements]  WITH CHECK ADD FOREIGN KEY([FormConfigurationId])
REFERENCES [dbo].[FormConfigurations] ([Id])
GO
ALTER TABLE [dbo].[UserRoleAssignments]  WITH CHECK ADD FOREIGN KEY([RoleId])
REFERENCES [dbo].[UserRoles] ([Id])
GO
ALTER TABLE [dbo].[UserRoleAssignments]  WITH CHECK ADD FOREIGN KEY([RoleId])
REFERENCES [dbo].[UserRoles] ([Id])
GO
ALTER TABLE [dbo].[WorkflowDeployments]  WITH CHECK ADD FOREIGN KEY([WorkflowConfigurationId])
REFERENCES [dbo].[WorkflowConfigurations] ([Id])
GO
ALTER TABLE [dbo].[WorkflowDeployments]  WITH CHECK ADD FOREIGN KEY([WorkflowConfigurationId])
REFERENCES [dbo].[WorkflowConfigurations] ([Id])
GO
ALTER TABLE [dbo].[WorkflowStepInstances]  WITH CHECK ADD FOREIGN KEY([DeploymentId])
REFERENCES [dbo].[WorkflowDeployments] ([Id])
GO
ALTER TABLE [dbo].[WorkflowStepInstances]  WITH CHECK ADD FOREIGN KEY([DeploymentId])
REFERENCES [dbo].[WorkflowDeployments] ([Id])
GO
ALTER TABLE [dbo].[WorkflowStepInstances]  WITH CHECK ADD FOREIGN KEY([WorkflowConfigurationId])
REFERENCES [dbo].[WorkflowConfigurations] ([Id])
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
USE [master]
GO
ALTER DATABASE [REQUIREMENTS] SET  READ_WRITE 
GO
