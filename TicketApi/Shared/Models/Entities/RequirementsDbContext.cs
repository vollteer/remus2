using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace TicketApi.Shared.Models.Entities;

public partial class RequirementsDbContext : DbContext
{
    public RequirementsDbContext()
    {
    }

    public RequirementsDbContext(DbContextOptions<RequirementsDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<ActiveWorkflowDeployment> ActiveWorkflowDeployments { get; set; }

    public virtual DbSet<ConfigurationExport> ConfigurationExports { get; set; }

    public virtual DbSet<ConfigurationImport> ConfigurationImports { get; set; }

    public virtual DbSet<FormConfiguration> FormConfigurations { get; set; }

    public virtual DbSet<FormDeployment> FormDeployments { get; set; }

    public virtual DbSet<FormSubmission> FormSubmissions { get; set; }

    public virtual DbSet<Requirement> Requirements { get; set; }

    public virtual DbSet<RequirementAttachment> RequirementAttachments { get; set; }

    public virtual DbSet<RequirementComment> RequirementComments { get; set; }

    public virtual DbSet<RequirementOverview> RequirementOverviews { get; set; }

    public virtual DbSet<UserRole> UserRoles { get; set; }

    public virtual DbSet<UserRoleAssignment> UserRoleAssignments { get; set; }

    public virtual DbSet<WorkflowConfiguration> WorkflowConfigurations { get; set; }

    public virtual DbSet<WorkflowDeployment> WorkflowDeployments { get; set; }

    public virtual DbSet<WorkflowStepInstance> WorkflowStepInstances { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=HLB1W01AWSE0027.hlbent.helaba.de;Database=REQUIREMENTS;Trusted_Connection=true;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ActiveWorkflowDeployment>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("ActiveWorkflowDeployments");

            entity.Property(e => e.ApprovedBy).HasMaxLength(255);
            entity.Property(e => e.CreatedBy).HasMaxLength(255);
            entity.Property(e => e.DeployedBy).HasMaxLength(255);
            entity.Property(e => e.DeploymentType).HasMaxLength(50);
            entity.Property(e => e.Environment).HasMaxLength(50);
            entity.Property(e => e.RequirementType).HasMaxLength(100);
            entity.Property(e => e.ReviewStatus).HasMaxLength(50);
            entity.Property(e => e.ReviewedBy).HasMaxLength(255);
            entity.Property(e => e.Version).HasMaxLength(20);
            entity.Property(e => e.WorkflowName).HasMaxLength(255);
        });

        modelBuilder.Entity<ConfigurationExport>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Configur__3214EC07722C2C79");

            entity.HasIndex(e => e.CreatedAt, "IX_ConfigurationExports_Created");

            entity.HasIndex(e => e.ExportedBy, "IX_ConfigurationExports_ExportedBy");

            entity.HasIndex(e => e.ExportType, "IX_ConfigurationExports_Type");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Checksum).HasMaxLength(64);
            entity.Property(e => e.ConfigurationVersion).HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.ExportFormat)
                .HasMaxLength(20)
                .HasDefaultValue("JSON");
            entity.Property(e => e.ExportType).HasMaxLength(50);
            entity.Property(e => e.ExportVersion).HasMaxLength(20);
            entity.Property(e => e.ExportedBy).HasMaxLength(255);
            entity.Property(e => e.FileName).HasMaxLength(255);
            entity.Property(e => e.RequirementType).HasMaxLength(100);
            entity.Property(e => e.TargetEnvironment).HasMaxLength(50);

            entity.HasOne(d => d.FormConfiguration).WithMany(p => p.ConfigurationExports)
                .HasForeignKey(d => d.FormConfigurationId)
                .HasConstraintName("FK__Configura__FormC__6E01572D");

            entity.HasOne(d => d.WorkflowConfiguration).WithMany(p => p.ConfigurationExports)
                .HasForeignKey(d => d.WorkflowConfigurationId)
                .HasConstraintName("FK__Configura__Workf__6D0D32F4");
        });

        modelBuilder.Entity<ConfigurationImport>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Configur__3214EC07AA888850");

            entity.HasIndex(e => e.ImportedBy, "IX_ConfigurationImports_ImportedBy");

            entity.HasIndex(e => e.ImportStatus, "IX_ConfigurationImports_Status");

            entity.HasIndex(e => e.ImportType, "IX_ConfigurationImports_Type");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.AffectedRequirementsCount).HasDefaultValue(0);
            entity.Property(e => e.Checksum).HasMaxLength(64);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.FileName).HasMaxLength(255);
            entity.Property(e => e.ImportStatus)
                .HasMaxLength(50)
                .HasDefaultValue("Pending");
            entity.Property(e => e.ImportType).HasMaxLength(50);
            entity.Property(e => e.ImportedBy).HasMaxLength(255);
            entity.Property(e => e.RequiresReview).HasDefaultValue(true);

            entity.HasOne(d => d.SourceExport).WithMany(p => p.ConfigurationImports)
                .HasForeignKey(d => d.SourceExportId)
                .HasConstraintName("FK__Configura__Sourc__75A278F5");
        });

        modelBuilder.Entity<FormConfiguration>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__FormConf__3214EC07F35F3693");

            entity.HasIndex(e => e.IsActive, "IX_FormConfigurations_IsActive");

            entity.HasIndex(e => e.RequirementType, "IX_FormConfigurations_RequirementType");

            entity.HasIndex(e => e.WorkflowStepId, "IX_FormConfigurations_WorkflowStep");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.CreatedBy).HasMaxLength(255);
            entity.Property(e => e.HasLightMode).HasDefaultValue(true);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.ModifiedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.RequirementType).HasMaxLength(100);
            entity.Property(e => e.Version).HasDefaultValue(1);
            entity.Property(e => e.WorkflowStepId).HasMaxLength(100);
        });

        modelBuilder.Entity<FormDeployment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__FormDepl__3214EC07A4EF561F");

            entity.HasIndex(e => e.IsActive, "IX_FormDeployments_Active");

            entity.HasIndex(e => e.FormConfigurationId, "IX_FormDeployments_Config");

            entity.HasIndex(e => e.ReviewStatus, "IX_FormDeployments_Status");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.ApprovedBy).HasMaxLength(255);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.CreatedBy).HasMaxLength(255);
            entity.Property(e => e.DeployedBy).HasMaxLength(255);
            entity.Property(e => e.DeploymentType).HasMaxLength(50);
            entity.Property(e => e.Environment)
                .HasMaxLength(50)
                .HasDefaultValue("Production");
            entity.Property(e => e.IsActive).HasDefaultValue(false);
            entity.Property(e => e.ModifiedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.ReviewStatus)
                .HasMaxLength(50)
                .HasDefaultValue("Pending");
            entity.Property(e => e.ReviewedBy).HasMaxLength(255);
            entity.Property(e => e.Version).HasMaxLength(20);

            entity.HasOne(d => d.FormConfiguration).WithMany(p => p.FormDeployments)
                .HasForeignKey(d => d.FormConfigurationId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__FormDeplo__FormC__6754599E");
        });

        modelBuilder.Entity<FormSubmission>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__FormSubm__3214EC0738C856AE");

            entity.HasIndex(e => e.RequirementId, "IX_FormSubmissions_RequirementId");

            entity.HasIndex(e => e.Status, "IX_FormSubmissions_Status");

            entity.HasIndex(e => e.SubmittedBy, "IX_FormSubmissions_SubmittedBy");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.IsLightMode).HasDefaultValue(false);
            entity.Property(e => e.ReviewedBy).HasMaxLength(255);
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Draft");
            entity.Property(e => e.SubmittedBy).HasMaxLength(255);
            entity.Property(e => e.WorkflowStepId).HasMaxLength(100);

            entity.HasOne(d => d.FormConfiguration).WithMany(p => p.FormSubmissions)
                .HasForeignKey(d => d.FormConfigurationId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__FormSubmi__FormC__34C8D9D1");
        });

        modelBuilder.Entity<Requirement>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Requirem__3214EC07CCA78C67");

            entity.HasIndex(e => new { e.RequestedDate, e.RequiredByDate }, "IX_Requirements_Dates");

            entity.HasIndex(e => e.RequirementNumber, "IX_Requirements_Number");

            entity.HasIndex(e => e.RequestedBy, "IX_Requirements_RequestedBy");

            entity.HasIndex(e => e.Status, "IX_Requirements_Status");

            entity.HasIndex(e => e.RequirementType, "IX_Requirements_Type");

            entity.HasIndex(e => e.RequirementNumber, "UQ__Requirem__43038039FF12B8F6").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.ActualCost).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.ApprovedBudget).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.BusinessOwner).HasMaxLength(255);
            entity.Property(e => e.CostCenter).HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.CreatedBy).HasMaxLength(255);
            entity.Property(e => e.Currency)
                .HasMaxLength(3)
                .HasDefaultValue("EUR");
            entity.Property(e => e.CurrentWorkflowStep).HasMaxLength(100);
            entity.Property(e => e.Department).HasMaxLength(100);
            entity.Property(e => e.EstimatedCost).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.HasPersonalData).HasDefaultValue(false);
            entity.Property(e => e.ModifiedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.ModifiedBy).HasMaxLength(255);
            entity.Property(e => e.Priority)
                .HasMaxLength(50)
                .HasDefaultValue("Medium");
            entity.Property(e => e.RequestedBy).HasMaxLength(255);
            entity.Property(e => e.RequestedDate).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.RequirementNumber).HasMaxLength(50);
            entity.Property(e => e.RequirementType).HasMaxLength(100);
            entity.Property(e => e.SecurityClassification)
                .HasMaxLength(50)
                .HasDefaultValue("Internal");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Draft");
            entity.Property(e => e.TechnicalOwner).HasMaxLength(255);
            entity.Property(e => e.Title).HasMaxLength(255);

            entity.HasOne(d => d.CurrentWorkflowConfig).WithMany(p => p.Requirements)
                .HasForeignKey(d => d.CurrentWorkflowConfigId)
                .HasConstraintName("FK__Requireme__Curre__5165187F");

            entity.HasOne(d => d.FormConfiguration).WithMany(p => p.Requirements)
                .HasForeignKey(d => d.FormConfigurationId)
                .HasConstraintName("FK__Requireme__FormC__52593CB8");
        });

        modelBuilder.Entity<RequirementAttachment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Requirem__3214EC07C337448F");

            entity.HasIndex(e => e.RequirementId, "IX_RequirementAttachments_Requirement");

            entity.HasIndex(e => e.UploadedBy, "IX_RequirementAttachments_UploadedBy");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.ContentType).HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.FileName).HasMaxLength(255);
            entity.Property(e => e.IsPublic).HasDefaultValue(false);
            entity.Property(e => e.OriginalFileName).HasMaxLength(255);
            entity.Property(e => e.RequiresPermission).HasDefaultValue(true);
            entity.Property(e => e.StoragePath).HasMaxLength(500);
            entity.Property(e => e.StorageType)
                .HasMaxLength(50)
                .HasDefaultValue("FileSystem");
            entity.Property(e => e.UploadedBy).HasMaxLength(255);

            entity.HasOne(d => d.Requirement).WithMany(p => p.RequirementAttachments)
                .HasForeignKey(d => d.RequirementId)
                .HasConstraintName("FK__Requireme__Requi__01142BA1");
        });

        modelBuilder.Entity<RequirementComment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Requirem__3214EC073854ABDD");

            entity.HasIndex(e => e.CreatedAt, "IX_RequirementComments_Created");

            entity.HasIndex(e => e.RequirementId, "IX_RequirementComments_Requirement");

            entity.HasIndex(e => e.CommentType, "IX_RequirementComments_Type");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CommentType)
                .HasMaxLength(50)
                .HasDefaultValue("General");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.CreatedBy).HasMaxLength(255);
            entity.Property(e => e.IsInternal).HasDefaultValue(false);
            entity.Property(e => e.NewStatus).HasMaxLength(50);
            entity.Property(e => e.PreviousStatus).HasMaxLength(50);
            entity.Property(e => e.WorkflowStep).HasMaxLength(100);

            entity.HasOne(d => d.Requirement).WithMany(p => p.RequirementComments)
                .HasForeignKey(d => d.RequirementId)
                .HasConstraintName("FK__Requireme__Requi__07C12930");
        });

        modelBuilder.Entity<RequirementOverview>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("RequirementOverview");

            entity.Property(e => e.ActualCost).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.ApprovedBudget).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.BusinessOwner).HasMaxLength(255);
            entity.Property(e => e.CostCenter).HasMaxLength(50);
            entity.Property(e => e.CreatedBy).HasMaxLength(255);
            entity.Property(e => e.Currency).HasMaxLength(3);
            entity.Property(e => e.CurrentAssignee).HasMaxLength(255);
            entity.Property(e => e.CurrentStepStatus).HasMaxLength(50);
            entity.Property(e => e.CurrentWorkflowStep).HasMaxLength(100);
            entity.Property(e => e.Department).HasMaxLength(100);
            entity.Property(e => e.EstimatedCost).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.FormName).HasMaxLength(255);
            entity.Property(e => e.ModifiedBy).HasMaxLength(255);
            entity.Property(e => e.Priority).HasMaxLength(50);
            entity.Property(e => e.RequestedBy).HasMaxLength(255);
            entity.Property(e => e.RequirementNumber).HasMaxLength(50);
            entity.Property(e => e.RequirementType).HasMaxLength(100);
            entity.Property(e => e.SecurityClassification).HasMaxLength(50);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.TechnicalOwner).HasMaxLength(255);
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.WorkflowName).HasMaxLength(255);
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__UserRole__3214EC072E8750AB");

            entity.HasIndex(e => e.RoleName, "UQ__UserRole__8A2B61603472EDA3").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.RoleName).HasMaxLength(100);
        });

        modelBuilder.Entity<UserRoleAssignment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__UserRole__3214EC07F4F48065");

            entity.HasIndex(e => e.UserId, "IX_UserRoleAssignments_UserId");

            entity.HasIndex(e => new { e.UserId, e.RoleId }, "UQ__UserRole__AF2760ACD6F10068").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.AssignedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.AssignedBy).HasMaxLength(255);
            entity.Property(e => e.UserId).HasMaxLength(255);

            entity.HasOne(d => d.Role).WithMany(p => p.UserRoleAssignments)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__UserRoleA__RoleI__403A8C7D");
        });

        modelBuilder.Entity<WorkflowConfiguration>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Workflow__3214EC07639E541B");

            entity.HasIndex(e => e.IsActive, "IX_WorkflowConfigurations_IsActive");

            entity.HasIndex(e => e.RequirementType, "IX_WorkflowConfigurations_RequirementType");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.CreatedBy).HasMaxLength(255);
            entity.Property(e => e.ModifiedBy).HasMaxLength(255);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.ModifiedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.RequirementType).HasMaxLength(100);
            entity.Property(e => e.Version).HasDefaultValue(1);
        });

        modelBuilder.Entity<WorkflowDeployment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Workflow__3214EC07507B93E9");

            entity.HasIndex(e => e.IsActive, "IX_WorkflowDeployments_Active");

            entity.HasIndex(e => e.WorkflowConfigurationId, "IX_WorkflowDeployments_Config");

            entity.HasIndex(e => e.ReviewStatus, "IX_WorkflowDeployments_Status");

            entity.HasIndex(e => e.Version, "IX_WorkflowDeployments_Version");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.AffectedRequirements).HasDefaultValue(0);
            entity.Property(e => e.ApprovedBy).HasMaxLength(255);
            entity.Property(e => e.CanRollback).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.CreatedBy).HasMaxLength(255);
            entity.Property(e => e.DeployedBy).HasMaxLength(255);
            entity.Property(e => e.DeploymentType).HasMaxLength(50);
            entity.Property(e => e.Environment)
                .HasMaxLength(50)
                .HasDefaultValue("Production");
            entity.Property(e => e.IsActive).HasDefaultValue(false);
            entity.Property(e => e.ModifiedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.ReviewStatus)
                .HasMaxLength(50)
                .HasDefaultValue("Pending");
            entity.Property(e => e.ReviewedBy).HasMaxLength(255);
            entity.Property(e => e.Version).HasMaxLength(20);

            entity.HasOne(d => d.WorkflowConfiguration).WithMany(p => p.WorkflowDeployments)
                .HasForeignKey(d => d.WorkflowConfigurationId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__WorkflowD__Workf__5DCAEF64");
        });

        modelBuilder.Entity<WorkflowStepInstance>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Workflow__3214EC07190F713D");

            entity.HasIndex(e => e.AssignedTo, "IX_WorkflowStepInstances_AssignedTo");

            entity.HasIndex(e => e.RequirementId, "IX_WorkflowStepInstances_RequirementId");

            entity.HasIndex(e => e.Status, "IX_WorkflowStepInstances_Status");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.AssignedTo).HasMaxLength(255);
            entity.Property(e => e.AutoAssigned).HasDefaultValue(false);
            entity.Property(e => e.EscalationLevel).HasDefaultValue(0);
            entity.Property(e => e.StartedBySystem).HasDefaultValue(false);
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Pending");
            entity.Property(e => e.StepId).HasMaxLength(100);

            entity.HasOne(d => d.Deployment).WithMany(p => p.WorkflowStepInstances)
                .HasForeignKey(d => d.DeploymentId)
                .HasConstraintName("FK__WorkflowS__Deplo__797309D9");

            entity.HasOne(d => d.WorkflowConfiguration).WithMany(p => p.WorkflowStepInstances)
                .HasForeignKey(d => d.WorkflowConfigurationId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__WorkflowS__Workf__44FF419A");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
