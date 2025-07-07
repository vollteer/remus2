-- ====================================
-- CALENDAR-SPECIFIC DATABASE EXTENSIONS
-- ====================================

-- ====================================
-- 1. ERWEITERE BESTEHENDE REQUIREMENTS TABLE
-- ====================================

-- Add calendar-specific fields to existing Requirements table
ALTER TABLE Requirements ADD
-- Calendar & Deadline Management
DueDate DATETIME2 NULL,                    -- Main deadline for requirement
CurrentStepDueDate DATETIME2 NULL,         -- Current workflow step deadline
ReminderDate DATETIME2 NULL,              -- When to send reminders

-- Assignment & Responsibility
AssignedUserId NVARCHAR(255) NULL,        -- Currently assigned user
AssignedUserEmail NVARCHAR(255) NULL,     -- For easier lookup

-- Visibility & Permissions
IsPublic BIT DEFAULT 0,                   -- Public calendar visibility

-- Tracking
LastReminderSent DATETIME2 NULL,          -- When last reminder was sent
EscalationLevel INT DEFAULT 0;            -- 0=None, 1=Warning, 2=Critical

-- Indexes for calendar queries
create INDEX IX_Requirements_DueDate on requirements (DueDate);
--create |INDEX IX_Requirements_CurrentStepDueDate (CurrentStepDueDate),
create INDEX IX_Requirements_AssignedUser on requirements (AssignedTo);
create INDEX IX_Requirements_Calendar_Lookup on requirements (RequirementType, Status, DueDate);

-- ====================================
-- 2. CALENDAR EVENTS TABLE (For custom events)
-- ====================================

CREATE TABLE CalendarEvents (
Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

-- Event Information
Title NVARCHAR(255) NOT NULL,
Description NVARCHAR(MAX),
EventType NVARCHAR(50) NOT NULL,          -- meeting, review, release, milestone, deadline

-- Date & Time
StartDate DATETIME2 NOT NULL,
EndDate DATETIME2 NULL,
StartTime TIME NULL,
EndTime TIME NULL,
AllDay BIT DEFAULT 0,

-- Recurrence (for recurring events)
IsRecurring BIT DEFAULT 0,
RecurrencePattern NVARCHAR(MAX) NULL,     -- JSON: daily, weekly, monthly patterns
RecurrenceEndDate DATETIME2 NULL,

-- Relationship to Requirements
RequirementId UNIQUEIDENTIFIER NULL,     -- FK to Requirements
WorkflowStepId NVARCHAR(100) NULL,       -- Which workflow step this relates to

-- Categorization
Category NVARCHAR(100) NULL,             -- Project, Release, Meeting, etc.
Priority NVARCHAR(50) DEFAULT 'Medium',  -- Low, Medium, High, Critical
Status NVARCHAR(50) DEFAULT 'Scheduled', -- Scheduled, InProgress, Completed, Cancelled

-- Participants
Organizer NVARCHAR(255) NOT NULL,        -- Who organized this event
Attendees NVARCHAR(MAX) NULL,            -- JSON array of attendee emails/IDs
RequiredAttendees NVARCHAR(MAX) NULL,    -- JSON array of required attendees
OptionalAttendees NVARCHAR(MAX) NULL,    -- JSON array of optional attendees

-- Location & Meeting Details
Location NVARCHAR(255) NULL,             -- Physical location
MeetingUrl NVARCHAR(500) NULL,           -- Teams/Zoom URL
MeetingId NVARCHAR(100) NULL,            -- Meeting ID for external systems

-- Notifications & Reminders
ReminderMinutes INT NULL,                -- Minutes before event to remind
LastReminderSent DATETIME2 NULL,

-- Metadata
CreatedBy NVARCHAR(255) NOT NULL,
CreatedAt DATETIME2 DEFAULT GETDATE(),
ModifiedBy NVARCHAR(255),
ModifiedAt DATETIME2 DEFAULT GETDATE(),

-- Soft delete
IsDeleted BIT DEFAULT 0,
DeletedAt DATETIME2 NULL,
DeletedBy NVARCHAR(255) NULL,

-- Indexes
INDEX IX_CalendarEvents_StartDate (StartDate),
INDEX IX_CalendarEvents_EndDate (EndDate),
INDEX IX_CalendarEvents_RequirementId (RequirementId),
INDEX IX_CalendarEvents_EventType (EventType),
INDEX IX_CalendarEvents_Status (Status),
INDEX IX_CalendarEvents_Organizer (Organizer),
INDEX IX_CalendarEvents_Calendar_View (StartDate, EndDate, EventType, Status, IsDeleted),

-- Foreign Keys
FOREIGN KEY (RequirementId) REFERENCES Requirements(Id) ON DELETE SET NULL
);

-- ====================================
-- 3. CALENDAR SUBSCRIPTIONS (User preferences)
-- ====================================

CREATE TABLE CalendarSubscriptions (
Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

-- User Information
UserId NVARCHAR(255) NOT NULL,
UserEmail NVARCHAR(255) NOT NULL,

-- Subscription Settings
SubscriptionType NVARCHAR(50) NOT NULL,   -- MyTasks, TeamTasks, AllEvents, RequirementType
FilterCriteria NVARCHAR(MAX) NULL,        -- JSON: filters for what to show

-- Specific filters
RequirementTypes NVARCHAR(MAX) NULL,      -- JSON array: which requirement types to show
EventTypes NVARCHAR(MAX) NULL,            -- JSON array: which event types to show
Priorities NVARCHAR(MAX) NULL,            -- JSON array: which priorities to show

-- Notification preferences
EmailNotifications BIT DEFAULT 1,
PushNotifications BIT DEFAULT 1,
NotificationMinutes INT DEFAULT 60,       -- How many minutes before event

-- Display preferences
DefaultView NVARCHAR(20) DEFAULT 'month', -- month, week, day
ShowWeekends BIT DEFAULT 1,
TimeFormat NVARCHAR(10) DEFAULT '24h',    -- 24h, 12h

-- Metadata
CreatedAt DATETIME2 DEFAULT GETDATE(),
ModifiedAt DATETIME2 DEFAULT GETDATE(),
IsActive BIT DEFAULT 1,

-- Indexes
INDEX IX_CalendarSubscriptions_UserId (UserId),
INDEX IX_CalendarSubscriptions_SubscriptionType (SubscriptionType),
INDEX IX_CalendarSubscriptions_IsActive (IsActive),

-- Unique constraint
UNIQUE (UserId, SubscriptionType)
);

-- ====================================
-- 4. CALENDAR NOTIFICATIONS & REMINDERS
-- ====================================

CREATE TABLE CalendarNotifications (
Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

-- What to notify about
NotificationType NVARCHAR(50) NOT NULL,   -- DeadlineReminder, EventReminder, Overdue, StatusChange
EventId UNIQUEIDENTIFIER NULL,            -- FK to CalendarEvents
RequirementId UNIQUEIDENTIFIER NULL,      -- FK to Requirements

-- Who to notify
UserId NVARCHAR(255) NOT NULL,
UserEmail NVARCHAR(255) NOT NULL,

-- Notification content
Subject NVARCHAR(255) NOT NULL,
Message NVARCHAR(MAX) NOT NULL,

-- Delivery
DeliveryMethod NVARCHAR(50) NOT NULL,     -- Email, Push, SMS, InApp
ScheduledFor DATETIME2 NOT NULL,          -- When to send
SentAt DATETIME2 NULL,                    -- When actually sent

-- Status
Status NVARCHAR(50) DEFAULT 'Pending',    -- Pending, Sent, Failed, Cancelled
ErrorMessage NVARCHAR(MAX) NULL,          -- If failed, why
RetryCount INT DEFAULT 0,

-- Metadata
CreatedAt DATETIME2 DEFAULT GETDATE(),

-- Indexes
INDEX IX_CalendarNotifications_ScheduledFor (ScheduledFor),
INDEX IX_CalendarNotifications_Status (Status),
INDEX IX_CalendarNotifications_UserId (UserId),
INDEX IX_CalendarNotifications_NotificationType (NotificationType),

-- Foreign Keys
FOREIGN KEY (EventId) REFERENCES CalendarEvents(Id) ON DELETE CASCADE,
FOREIGN KEY (RequirementId) REFERENCES Requirements(Id) ON DELETE CASCADE
);
go
-- ====================================
-- 5. CALENDAR VIEWS & STORED PROCEDURES
-- ====================================

-- View for Calendar Events with Requirement Data
CREATE VIEW CalendarEventsWithRequirements AS
SELECT
ce.Id as EventId,
ce.Title as EventTitle,
ce.Description as EventDescription,
ce.EventType,
ce.StartDate,
ce.EndDate,
ce.StartTime,
ce.EndTime,
ce.AllDay,
ce.Status as EventStatus,
ce.Priority as EventPriority,
ce.Organizer,
ce.Location,
ce.MeetingUrl,

-- Requirement Information
r.Id as RequirementId,
r.RequirementNumber,
r.Title as RequirementTitle,
r.RequirementType,
r.Priority as RequirementPriority,
r.Status as RequirementStatus,
r.DueDate as RequirementDueDate,
r.CurrentStepDueDate,
r.AssignedUserId,
r.AssignedUserEmail,
r.RequestedBy,
r.BusinessOwner,
r.TechnicalOwner,

-- Computed fields
CASE
WHEN r.DueDate IS NOT NULL AND r.DueDate < GETDATE() AND r.Status NOT IN ('Completed', 'Cancelled') THEN 1
WHEN r.CurrentStepDueDate IS NOT NULL AND r.CurrentStepDueDate < GETDATE() AND r.Status NOT IN ('Completed', 'Cancelled') THEN 1
ELSE 0
END as IsOverdue,

CASE
WHEN r.DueDate IS NOT NULL AND r.DueDate BETWEEN GETDATE() AND DATEADD(DAY, 7, GETDATE()) THEN 1
WHEN r.CurrentStepDueDate IS NOT NULL AND r.CurrentStepDueDate BETWEEN GETDATE() AND DATEADD(DAY, 7, GETDATE()) THEN 1
ELSE 0
END as IsDueSoon

FROM CalendarEvents ce
LEFT JOIN Requirements r ON ce.RequirementId = r.Id
WHERE ce.IsDeleted = 0;

-- View for Requirement Deadlines as Calendar Events
CREATE VIEW RequirementDeadlines AS
SELECT
CONCAT(r.Id, '-deadline') as EventId,
CONCAT('📅 ', r.Title) as EventTitle,
CONCAT('Deadline: ', r.Description) as EventDescription,
'deadline' as EventType,
r.DueDate as StartDate,
r.DueDate as EndDate,
NULL as StartTime,
NULL as EndTime,
1 as AllDay,
CASE
WHEN r.Status = 'Completed' THEN 'Completed'
WHEN r.DueDate < GETDATE() THEN 'Overdue'
ELSE 'Scheduled'
END as EventStatus,
r.Priority as EventPriority,
r.AssignedUserId as Organizer,
NULL as Location,
NULL as MeetingUrl,

-- Requirement Information
r.Id as RequirementId,
r.RequirementNumber,
r.Title as RequirementTitle,
r.RequirementType,
r.Priority as RequirementPriority,
r.Status as RequirementStatus,
r.DueDate as RequirementDueDate,
r.CurrentStepDueDate,
r.AssignedUserId,
r.AssignedUserEmail,
r.RequestedBy,
r.BusinessOwner,
r.TechnicalOwner,

-- Computed fields
CASE
WHEN r.DueDate < GETDATE() AND r.Status NOT IN ('Completed', 'Cancelled') THEN 1
ELSE 0
END as IsOverdue,

CASE
WHEN r.DueDate BETWEEN GETDATE() AND DATEADD(DAY, 7, GETDATE()) THEN 1
ELSE 0
END as IsDueSoon

FROM Requirements r
WHERE r.DueDate IS NOT NULL;

-- View for Workflow Step Deadlines as Calendar Events
CREATE VIEW WorkflowStepDeadlines AS
SELECT
CONCAT(r.Id, '-step') as EventId,
CONCAT('🎯 ', r.CurrentWorkflowStep) as EventTitle,
CONCAT('Workflow Schritt: ', r.CurrentWorkflowStep, ' für ', r.Title) as EventDescription,
'milestone' as EventType,
r.CurrentStepDueDate as StartDate,
r.CurrentStepDueDate as EndDate,
NULL as StartTime,
NULL as EndTime,
1 as AllDay,
CASE
WHEN r.Status = 'Completed' THEN 'Completed'
WHEN r.CurrentStepDueDate < GETDATE() THEN 'Overdue'
ELSE 'Scheduled'
END as EventStatus,
r.Priority as EventPriority,
r.AssignedUserId as Organizer,
NULL as Location,
NULL as MeetingUrl,

-- Requirement Information
r.Id as RequirementId,
r.RequirementNumber,
r.Title as RequirementTitle,
r.RequirementType,
r.Priority as RequirementPriority,
r.Status as RequirementStatus,
r.DueDate as RequirementDueDate,
r.CurrentStepDueDate,
r.AssignedUserId,
r.AssignedUserEmail,
r.RequestedBy,
r.BusinessOwner,
r.TechnicalOwner,
r.CurrentWorkflowStep as WorkflowStep,

-- Computed fields
CASE
WHEN r.CurrentStepDueDate < GETDATE() AND r.Status NOT IN ('Completed', 'Cancelled') THEN 1
ELSE 0
END as IsOverdue,

CASE
WHEN r.CurrentStepDueDate BETWEEN GETDATE() AND DATEADD(DAY, 7, GETDATE()) THEN 1
ELSE 0
END as IsDueSoon

FROM Requirements r
WHERE r.CurrentStepDueDate IS NOT NULL
AND r.CurrentWorkflowStep IS NOT NULL;

-- Combined Calendar View (All Events)
CREATE VIEW AllCalendarEvents AS
SELECT * FROM CalendarEventsWithRequirements
UNION ALL
SELECT
EventId, EventTitle, EventDescription, EventType, StartDate, EndDate, StartTime, EndTime, AllDay,
EventStatus, EventPriority, Organizer, Location, MeetingUrl,
RequirementId, RequirementNumber, RequirementTitle, RequirementType, RequirementPriority, RequirementStatus,
RequirementDueDate, CurrentStepDueDate, AssignedUserId, AssignedUserEmail, RequestedBy, BusinessOwner, TechnicalOwner,
IsOverdue, IsDueSoon
FROM RequirementDeadlines
UNION ALL
SELECT
EventId, EventTitle, EventDescription, EventType, StartDate, EndDate, StartTime, EndTime, AllDay,
EventStatus, EventPriority, Organizer, Location, MeetingUrl,
RequirementId, RequirementNumber, RequirementTitle, RequirementType, RequirementPriority, RequirementStatus,
RequirementDueDate, CurrentStepDueDate, AssignedUserId, AssignedUserEmail, RequestedBy, BusinessOwner, TechnicalOwner,
IsOverdue, IsDueSoon
FROM WorkflowStepDeadlines;

-- ====================================
-- 6. STORED PROCEDURES FOR CALENDAR OPERATIONS
-- ====================================

-- Procedure to get calendar events for a date range
CREATE PROCEDURE GetCalendarEvents
@StartDate DATETIME2,
@EndDate DATETIME2,
@UserId NVARCHAR(255) = NULL,
@RequirementTypes NVARCHAR(MAX) = NULL,
@EventTypes NVARCHAR(MAX) = NULL,
@Priorities NVARCHAR(MAX) = NULL,
@ShowOverdue BIT = 1,
@ShowUpcoming BIT = 1
AS
BEGIN
SET NOCOUNT ON;

SELECT
EventId,
EventTitle,
EventDescription,
EventType,
StartDate,
EndDate,
StartTime,
EndTime,
AllDay,
EventStatus,
EventPriority,
Organizer,
Location,
MeetingUrl,
RequirementId,
RequirementNumber,
RequirementTitle,
RequirementType,
RequirementPriority,
RequirementStatus,
RequirementDueDate,
CurrentStepDueDate,
AssignedUserId,
AssignedUserEmail,
RequestedBy,
BusinessOwner,
TechnicalOwner,
IsOverdue,
IsDueSoon
FROM AllCalendarEvents
WHERE StartDate BETWEEN @StartDate AND @EndDate
AND (@UserId IS NULL OR AssignedUserId = @UserId OR RequestedBy = @UserId)
AND (@RequirementTypes IS NULL OR RequirementType IN (SELECT value FROM STRING_SPLIT(@RequirementTypes, ',')))
AND (@EventTypes IS NULL OR EventType IN (SELECT value FROM STRING_SPLIT(@EventTypes, ',')))
AND (@Priorities IS NULL OR EventPriority IN (SELECT value FROM STRING_SPLIT(@Priorities, ',')))
AND ((@ShowOverdue = 1 AND IsOverdue = 1) OR (@ShowUpcoming = 1 AND IsOverdue = 0))
ORDER BY StartDate, StartTime;
END;

-- Procedure to get calendar statistics
CREATE PROCEDURE GetCalendarStatistics
@UserId NVARCHAR(255) = NULL,
@StartDate DATETIME2 = NULL,
@EndDate DATETIME2 = NULL
AS
BEGIN
SET NOCOUNT ON;

DECLARE @DefaultEndDate DATETIME2 = ISNULL(@EndDate, DATEADD(MONTH, 3, GETDATE()));
DECLARE @DefaultStartDate DATETIME2 = ISNULL(@StartDate, DATEADD(MONTH, -1, GETDATE()));

SELECT
COUNT(*) as TotalEvents,
SUM(CASE WHEN IsOverdue = 1 THEN 1 ELSE 0 END) as OverdueCount,
SUM(CASE WHEN IsDueSoon = 1 THEN 1 ELSE 0 END) as DueSoonCount,
SUM(CASE WHEN RequirementType = 'AWS-Release' THEN 1 ELSE 0 END) as AwsReleaseCount,
SUM(CASE WHEN RequirementType = 'AWG-Release' THEN 1 ELSE 0 END) as AwgReleaseCount,
SUM(CASE WHEN EventPriority = 'Critical' THEN 1 ELSE 0 END) as CriticalCount,
SUM(CASE WHEN EventPriority = 'High' THEN 1 ELSE 0 END) as HighCount,
SUM(CASE WHEN StartDate BETWEEN GETDATE() AND DATEADD(DAY, 7, GETDATE()) THEN 1 ELSE 0 END) as ThisWeekCount
FROM AllCalendarEvents
WHERE StartDate BETWEEN @DefaultStartDate AND @DefaultEndDate
AND (@UserId IS NULL OR AssignedUserId = @UserId OR RequestedBy = @UserId);
END;

-- ====================================
-- 7. INDEXES FOR PERFORMANCE
-- ====================================

-- Additional indexes for complex calendar queries
CREATE INDEX IX_Requirements_Calendar_Complex ON Requirements (
RequirementType, Status, Priority, DueDate, CurrentStepDueDate, AssignedUserId
) WHERE DueDate IS NOT NULL OR CurrentStepDueDate IS NOT NULL;

CREATE INDEX IX_CalendarEvents_Complex ON CalendarEvents (
EventType, Status, Priority, StartDate, EndDate, IsDeleted
) WHERE IsDeleted = 0;

-- ====================================
-- 8. TRIGGERS FOR AUTOMATIC NOTIFICATIONS
-- ====================================

-- Trigger to create notifications when deadlines are approaching
CREATE TRIGGER TR_Requirements_DeadlineNotification
ON Requirements
AFTER INSERT, UPDATE
AS
BEGIN
SET NOCOUNT ON;

-- Create notifications for approaching deadlines
INSERT INTO CalendarNotifications (
NotificationType,
RequirementId,
UserId,
UserEmail,
Subject,
Message,
DeliveryMethod,
ScheduledFor
)
SELECT
'DeadlineReminder',
i.Id,
i.AssignedUserId,
i.AssignedUserEmail,
CONCAT('Deadline Reminder: ', i.Title),
CONCAT('Your requirement “', i.Title, '” (', i.RequirementNumber, ') is due on ', FORMAT(i.DueDate, 'yyyy-MM-dd')),
'Email',
DATEADD(DAY, -1, i.DueDate) -- Remind 1 day before
FROM inserted i
WHERE i.DueDate IS NOT NULL
AND i.AssignedUserId IS NOT NULL
AND i.AssignedUserEmail IS NOT NULL
AND i.DueDate > GETDATE()
AND NOT EXISTS (
SELECT 1 FROM CalendarNotifications cn
WHERE cn.RequirementId = i.Id
AND cn.NotificationType = 'DeadlineReminder'
AND cn.Status = 'Pending'
);
END;

-- ====================================
-- 9. SAMPLE DATA FOR TESTING
-- ====================================

-- Update some existing requirements with calendar data
UPDATE Requirements
SET
DueDate = DATEADD(DAY, 30, GETDATE()),
CurrentStepDueDate = DATEADD(DAY, 7, GETDATE()),
AssignedUserId = 'thomas.wagner@company.com',
AssignedUserEmail = 'thomas.wagner@company.com',
IsPublic = 1
WHERE RequirementNumber = 'REQ-2025-001';

UPDATE Requirements
SET
DueDate = DATEADD(DAY, 5, GETDATE()),
CurrentStepDueDate = DATEADD(DAY, 2, GETDATE()),
AssignedUserId = 'anna.schmidt@company.com',
AssignedUserEmail = 'anna.schmidt@company.com',
IsPublic = 1
WHERE RequirementNumber = 'REQ-2025-002';

-- Insert some sample calendar events
INSERT INTO CalendarEvents (
Title, Description, EventType, StartDate, StartTime, EndTime,
RequirementId, Category, Priority, Organizer, Attendees, Location, CreatedBy
)
SELECT
CONCAT('Review Meeting: ', r.Title),
CONCAT('Review meeting for requirement ', r.RequirementNumber),
'meeting',
DATEADD(DAY, 3, GETDATE()),
'10:00:00',
'11:00:00',
r.Id,
'Requirements Review',
'High',
'thomas.wagner@company.com',
'[“thomas.wagner@company.com”, “anna.schmidt@company.com”, “max.mustermann@company.com”]',
'Meeting Room A',
'system'
FROM Requirements r
WHERE r.RequirementNumber = 'REQ-2025-001';

-- Insert sample user subscriptions
INSERT INTO CalendarSubscriptions (
UserId, UserEmail, SubscriptionType, RequirementTypes, EventTypes, Priorities
)
VALUES
('thomas.wagner@company.com', 'thomas.wagner@company.com', 'MyTasks',
'[“AWS-Release”, “AWG-Release”, “Großanforderung”]',
'[“deadline”, “milestone”, “meeting”]',
'[“High”, “Critical”]'),
('anna.schmidt@company.com', 'anna.schmidt@company.com', 'TeamTasks',
'[“Kleinanforderung”, “TIA-Anforderung”]',
'[“deadline”, “review”]',
'[“Medium”, “High”, “Critical”]');
go
-- ====================================
-- 10. UTILITY FUNCTIONS
-- ====================================

-- Function to check if a user has calendar access to a requirement
CREATE FUNCTION HasCalendarAccess(@UserId NVARCHAR(255), @RequirementId UNIQUEIDENTIFIER)
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

-- ====================================
-- 10. UTILITY FUNCTIONS
-- ====================================

-- Function to check if a user has calendar access to a requirement
CREATE FUNCTION HasCalendarAccess(@UserId NVARCHAR(255), @RequirementId UNIQUEIDENTIFIER)
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
