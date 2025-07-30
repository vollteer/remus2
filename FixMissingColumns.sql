-- =====================================================
-- Fix Missing Columns in Requirements Database
-- Specifically addresses ModifiedBy and WorkflowStep columns
-- =====================================================

USE REQUIREMENTS;
GO

PRINT '==============================================';
PRINT 'Fixing Missing Columns in Requirements Database';
PRINT '==============================================';
PRINT 'Current Database: ' + DB_NAME();
PRINT 'Execution Time: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '';

-- =====================================================
-- Check current schema first
-- =====================================================

PRINT 'Current FormConfigurations columns:';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'FormConfigurations'
ORDER BY ORDINAL_POSITION;

PRINT '';

-- =====================================================
-- Fix FormConfigurations table
-- =====================================================

PRINT 'Checking FormConfigurations table...';

-- Check if ModifiedBy column exists
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'FormConfigurations' 
    AND COLUMN_NAME = 'ModifiedBy'
    AND TABLE_SCHEMA = 'dbo'
)
BEGIN
    PRINT 'Adding ModifiedBy column to FormConfigurations...';
    ALTER TABLE [dbo].[FormConfigurations] 
    ADD [ModifiedBy] [nvarchar](100) NULL;
    PRINT '✓ ModifiedBy column added successfully';
END
ELSE
BEGIN
    PRINT '✓ ModifiedBy column already exists';
END

-- Check if WorkflowStep column exists
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'FormConfigurations' 
    AND COLUMN_NAME = 'WorkflowStep'
    AND TABLE_SCHEMA = 'dbo'
)
BEGIN
    PRINT 'Adding WorkflowStep column to FormConfigurations...';
    ALTER TABLE [dbo].[FormConfigurations] 
    ADD [WorkflowStep] [nvarchar](100) NOT NULL DEFAULT ('step-1');
    PRINT '✓ WorkflowStep column added successfully';
END
ELSE
BEGIN
    PRINT '✓ WorkflowStep column already exists';
END

-- Check if CreatedBy column exists
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'FormConfigurations' 
    AND COLUMN_NAME = 'CreatedBy'
    AND TABLE_SCHEMA = 'dbo'
)
BEGIN
    PRINT 'Adding CreatedBy column to FormConfigurations...';
    ALTER TABLE [dbo].[FormConfigurations] 
    ADD [CreatedBy] [nvarchar](100) NOT NULL DEFAULT ('system');
    PRINT '✓ CreatedBy column added successfully';
END
ELSE
BEGIN
    PRINT '✓ CreatedBy column already exists';
END

-- Check if IsActive column exists
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'FormConfigurations' 
    AND COLUMN_NAME = 'IsActive'
    AND TABLE_SCHEMA = 'dbo'
)
BEGIN
    PRINT 'Adding IsActive column to FormConfigurations...';
    ALTER TABLE [dbo].[FormConfigurations] 
    ADD [IsActive] [bit] NOT NULL DEFAULT (1);
    PRINT '✓ IsActive column added successfully';
END
ELSE
BEGIN
    PRINT '✓ IsActive column already exists';
END

-- Check if Version column exists
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'FormConfigurations' 
    AND COLUMN_NAME = 'Version'
    AND TABLE_SCHEMA = 'dbo'
)
BEGIN
    PRINT 'Adding Version column to FormConfigurations...';
    ALTER TABLE [dbo].[FormConfigurations] 
    ADD [Version] [int] NOT NULL DEFAULT (1);
    PRINT '✓ Version column added successfully';
END
ELSE
BEGIN
    PRINT '✓ Version column already exists';
END

-- Check if CreatedAt column exists
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'FormConfigurations' 
    AND COLUMN_NAME = 'CreatedAt'
    AND TABLE_SCHEMA = 'dbo'
)
BEGIN
    PRINT 'Adding CreatedAt column to FormConfigurations...';
    ALTER TABLE [dbo].[FormConfigurations] 
    ADD [CreatedAt] [datetime2](7) NOT NULL DEFAULT (GETUTCDATE());
    PRINT '✓ CreatedAt column added successfully';
END
ELSE
BEGIN
    PRINT '✓ CreatedAt column already exists';
END

-- Check if ModifiedAt column exists
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'FormConfigurations' 
    AND COLUMN_NAME = 'ModifiedAt'
    AND TABLE_SCHEMA = 'dbo'
)
BEGIN
    PRINT 'Adding ModifiedAt column to FormConfigurations...';
    ALTER TABLE [dbo].[FormConfigurations] 
    ADD [ModifiedAt] [datetime2](7) NOT NULL DEFAULT (GETUTCDATE());
    PRINT '✓ ModifiedAt column added successfully';
END
ELSE
BEGIN
    PRINT '✓ ModifiedAt column already exists';
END

PRINT '';

-- =====================================================
-- Fix WorkflowDefinitions table (if exists)
-- =====================================================

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'WorkflowDefinitions')
BEGIN
    PRINT 'Checking WorkflowDefinitions table...';
    
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'WorkflowDefinitions' 
        AND COLUMN_NAME = 'ModifiedBy'
        AND TABLE_SCHEMA = 'dbo'
    )
    BEGIN
        PRINT 'Adding ModifiedBy column to WorkflowDefinitions...';
        ALTER TABLE [dbo].[WorkflowDefinitions] 
        ADD [ModifiedBy] [nvarchar](100) NULL;
        PRINT '✓ ModifiedBy column added to WorkflowDefinitions';
    END
    
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'WorkflowDefinitions' 
        AND COLUMN_NAME = 'CreatedBy'
        AND TABLE_SCHEMA = 'dbo'
    )
    BEGIN
        PRINT 'Adding CreatedBy column to WorkflowDefinitions...';
        ALTER TABLE [dbo].[WorkflowDefinitions] 
        ADD [CreatedBy] [nvarchar](100) NOT NULL DEFAULT ('system');
        PRINT '✓ CreatedBy column added to WorkflowDefinitions';
    END
END

-- =====================================================
-- Fix Requirements table (if exists)
-- =====================================================

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Requirements')
BEGIN
    PRINT 'Checking Requirements table...';
    
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'Requirements' 
        AND COLUMN_NAME = 'ModifiedBy'
        AND TABLE_SCHEMA = 'dbo'
    )
    BEGIN
        PRINT 'Adding ModifiedBy column to Requirements...';
        ALTER TABLE [dbo].[Requirements] 
        ADD [ModifiedBy] [nvarchar](100) NULL;
        PRINT '✓ ModifiedBy column added to Requirements';
    END
    
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'Requirements' 
        AND COLUMN_NAME = 'CreatedBy'
        AND TABLE_SCHEMA = 'dbo'
    )
    BEGIN
        PRINT 'Adding CreatedBy column to Requirements...';
        ALTER TABLE [dbo].[Requirements] 
        ADD [CreatedBy] [nvarchar](100) NOT NULL DEFAULT ('system');
        PRINT '✓ CreatedBy column added to Requirements';
    END
END

-- =====================================================
-- Fix WorkflowInstances table (if exists)
-- =====================================================

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'WorkflowInstances')
BEGIN
    PRINT 'Checking WorkflowInstances table...';
    
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'WorkflowInstances' 
        AND COLUMN_NAME = 'ModifiedBy'
        AND TABLE_SCHEMA = 'dbo'
    )
    BEGIN
        PRINT 'Adding ModifiedBy column to WorkflowInstances...';
        ALTER TABLE [dbo].[WorkflowInstances] 
        ADD [ModifiedBy] [nvarchar](100) NULL;
        PRINT '✓ ModifiedBy column added to WorkflowInstances';
    END
    
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'WorkflowInstances' 
        AND COLUMN_NAME = 'CreatedBy'
        AND TABLE_SCHEMA = 'dbo'
    )
    BEGIN
        PRINT 'Adding CreatedBy column to WorkflowInstances...';
        ALTER TABLE [dbo].[WorkflowInstances] 
        ADD [CreatedBy] [nvarchar](100) NOT NULL DEFAULT ('system');
        PRINT '✓ CreatedBy column added to WorkflowInstances';
    END
END

PRINT '';

-- =====================================================
-- Verify the fixes by showing updated schema
-- =====================================================

PRINT '==============================================';
PRINT 'Updated FormConfigurations Schema:';
PRINT '==============================================';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'FormConfigurations'
ORDER BY ORDINAL_POSITION;

PRINT '';

-- =====================================================
-- Test the columns by running a simple query
-- =====================================================

PRINT 'Testing the columns with a sample query...';

BEGIN TRY
    -- Test if we can select from all the new columns
    SELECT TOP 1
        Id,
        RequirementType,
        Name,
        WorkflowStep,
        ModifiedBy,
        CreatedBy,
        IsActive,
        Version,
        CreatedAt,
        ModifiedAt
    FROM [dbo].[FormConfigurations];
    
    PRINT '✓ All columns are accessible - schema update successful!';
END TRY
BEGIN CATCH
    PRINT '❌ Error testing columns: ' + ERROR_MESSAGE();
    PRINT 'Some columns might still be missing.';
END CATCH

PRINT '';
PRINT '==============================================';
PRINT 'Column Fix Completed!';
PRINT '==============================================';
PRINT 'The ModifiedBy and WorkflowStep columns should now exist.';
PRINT 'Your Requirements API should work correctly now.';
PRINT '';