using System;
using System.Collections.Generic;

namespace TicketApi.Shared.Models.Entities;

public partial class FormDeployment
{
    public Guid Id { get; set; }

    public Guid FormConfigurationId { get; set; }

    public string Version { get; set; } = null!;

    public string DeploymentType { get; set; } = null!;

    public string? Environment { get; set; }

    public string CreatedBy { get; set; } = null!;

    public string? ReviewedBy { get; set; }

    public string? ApprovedBy { get; set; }

    public string? DeployedBy { get; set; }

    public string? ReviewStatus { get; set; }

    public string? ReviewComments { get; set; }

    public DateTime? ReviewDate { get; set; }

    public DateTime? ApprovalDate { get; set; }

    public DateTime? DeploymentDate { get; set; }

    public string ConfigurationSnapshot { get; set; } = null!;

    public string? ChangesSummary { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? ModifiedAt { get; set; }

    public virtual FormConfiguration FormConfiguration { get; set; } = null!;

    //errors 
    public string? DeploymentErrors { get; set; } 
    public string? ValidationErrors { get; set; }
    public string? ErrorMessage { get; set; }

    public string? LastError { get; set; }
    public int ErrorCount { get; set; } 
    public bool HasErrors   { get; set; }

    // deployment enhanced
    public string? RollbackReason { get; set; } 
    public string? DeploymentNotes  { get; set; }
    public int AffectedRequirements { get; set; } = 0;
    public bool CanRollback { get; set; } = true;



}
