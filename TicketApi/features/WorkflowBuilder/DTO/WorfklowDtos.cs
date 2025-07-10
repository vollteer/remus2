namespace TicketApi.Features.WorkflowBuilder.DTO
{
    using System.ComponentModel.DataAnnotations;

    namespace RequirementsApi.DTOs
    {
        public class WorkflowConfigurationDto
        {
            public Guid Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public string Type { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public bool? IsActive { get; set; }
            public int? Version { get; set; }
            public DateTime? CreatedAt { get; set; }
            public DateTime? ModifiedAt { get; set; }
            public string CreatedBy { get; set; } = string.Empty;
            public string ModifiedBy { get; set; } = string.Empty;
            public List<WorkflowStepDto> Steps { get; set; } = new();
            public WorkflowMetadataDto Metadata { get; set; } = new();
        }


public class WorkflowStepDto
        {
            public string Id { get; set; } = string.Empty;
            public string Title { get; set; } = string.Empty;
            public string Type { get; set; } = string.Empty; // TASK, APPROVAL, DECISION
            public string Responsible { get; set; } = string.Empty; // AG, AN, SYSTEM
            public string Description { get; set; } = string.Empty;
            public int EstimatedDays { get; set; }
            public bool Required { get; set; }
            public int Order { get; set; }
            public List<WorkflowConditionDto> Conditions { get; set; } = new();
            public WorkflowStepPermissionsDto Permissions { get; set; } = new();
            public string? FormBinding { get; set; }
            public Dictionary<string, string>? Branches { get; set; }
        }

        public class WorkflowConditionDto
        {
            public string Field { get; set; } = string.Empty;
            public string Operator { get; set; } = string.Empty; // equals, greaterThan, lessThan, contains
            public object Value { get; set; } = new();
            public string Action { get; set; } = string.Empty; // show, hide, require, skip
        }

        public class WorkflowStepPermissionsDto
        {
            public List<string> AllowedRoles { get; set; } = new();
            public List<string> AllowedUsers { get; set; } = new();
            public List<string> DenyRoles { get; set; } = new();
            public string? RequiresRole { get; set; }
        }

        public class WorkflowMetadataDto
        {
            public string Version { get; set; } = "1.0";
            public string CreatedBy { get; set; } = string.Empty;
            public int TotalEstimatedDays { get; set; }
            public Dictionary<string, object> CustomProperties { get; set; } = new();
        }

        public class CreateWorkflowConfigurationDto
        {
            [Required]
            [StringLength(100)]
            public string Name { get; set; } = string.Empty;

            [Required]
            [StringLength(50)]
            public string Type { get; set; } = string.Empty;

            [StringLength(500)]
            public string Description { get; set; } = string.Empty;

            [Required]
            public List<WorkflowStepDto> Steps { get; set; } = new();

            public WorkflowMetadataDto Metadata { get; set; } = new();
        }

        public class UpdateWorkflowConfigurationDto
        {
            [StringLength(100)]
            public string? Name { get; set; }

            [StringLength(500)]
            public string? Description { get; set; }

            public bool? IsActive { get; set; }
            public List<WorkflowStepDto>? Steps { get; set; }
            public WorkflowMetadataDto? Metadata { get; set; }
        }

        public class WorkflowValidationResultDto
        {
            public bool IsValid { get; set; }
            public List<string> Errors { get; set; } = new();
            public List<string> Warnings { get; set; } = new();
            public WorkflowStatisticsDto Statistics { get; set; } = new();
        }

        public class WorkflowStatisticsDto
        {
            public int TotalSteps { get; set; }
            public int TotalEstimatedDays { get; set; }
            public Dictionary<string, int> StepsByType { get; set; } = new();
            public Dictionary<string, int> StepsByResponsible { get; set; } = new();
            public List<string> RequiredRoles { get; set; } = new();
            public bool HasApprovalSteps { get; set; }
            public bool HasConditionalSteps { get; set; }
        }

}


}
