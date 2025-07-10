using System;
using System.Collections.Generic;

namespace TicketApi.Shared.Models.Entities;

public partial class RequirementComment
{
    public Guid Id { get; set; }

    public Guid RequirementId { get; set; }

    public string Comment { get; set; } = null!;

    public string? CommentType { get; set; }

    public string? WorkflowStep { get; set; }

    public string? PreviousStatus { get; set; }

    public string? NewStatus { get; set; }

    public string CreatedBy { get; set; } = null!;

    public bool? IsInternal { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Requirement Requirement { get; set; } = null!;
}
