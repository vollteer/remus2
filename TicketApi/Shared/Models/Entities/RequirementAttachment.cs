using System;
using System.Collections.Generic;

namespace TicketApi.Shared.Models.Entities;

public partial class RequirementAttachment
{
    public Guid Id { get; set; }

    public Guid RequirementId { get; set; }

    public string FileName { get; set; } = null!;

    public string OriginalFileName { get; set; } = null!;

    public int FileSize { get; set; }

    public string ContentType { get; set; } = null!;

    public string? StoragePath { get; set; }

    public string? StorageType { get; set; }

    public string UploadedBy { get; set; } = null!;

    public string? Description { get; set; }

    public string? Category { get; set; }

    public bool? IsPublic { get; set; }

    public bool? RequiresPermission { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Requirement Requirement { get; set; } = null!;
}
