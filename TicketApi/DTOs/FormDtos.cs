using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace YourProject.Models.Forms
{
    // ====================================
    // API RESPONSE WRAPPER
    // ====================================

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string? Message { get; set; }
        public List<string>? Errors { get; set; }
        public ResponseMetadata? Metadata { get; set; }

        public static ApiResponse<T> Success(T? data, string? message = null)
        {
            return new ApiResponse<T>
            {
                Success = true,
                Data = data,
                Message = message,
                Metadata = new ResponseMetadata
                {
                    RequestId = Guid.NewGuid().ToString(),
                    Timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    Version = "1.0.0"
                }
            };
        }

        public static ApiResponse<T> Error(string message, List<string>? errors = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Errors = errors ?? new List<string>(),
                Metadata = new ResponseMetadata
                {
                    RequestId = Guid.NewGuid().ToString(),
                    Timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    Version = "1.0.0"
                }
            };
        }
    }

    public class ResponseMetadata
    {
        public string RequestId { get; set; } = string.Empty;
        public string Timestamp { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public long ProcessingTimeMs { get; set; }
    }

    // ====================================
    // FORM CONFIGURATION DTOs
    // ====================================

    public class FormConfigurationDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string RequirementType { get; set; } = string.Empty;
        public string? WorkflowStepId { get; set; }
        public List<FormSectionDto> Sections { get; set; } = new();
        public List<FormFieldDto> Fields { get; set; } = new();
        public int Version { get; set; }
        public bool IsActive { get; set; }
        public bool HasLightMode { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
        public string ModifiedAt { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public FormPermissionsDto? Permissions { get; set; }
        public LightModeConfigDto? LightMode { get; set; }
    }

    public class FormSectionDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool Collapsible { get; set; }
        public bool Collapsed { get; set; }
        public int Order { get; set; }
        public FormPermissionsDto? Permissions { get; set; }
        public List<string>? WorkflowStepBinding { get; set; }
    }

    public class FormFieldDto
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string? Placeholder { get; set; }
        public string? Description { get; set; }
        public bool Required { get; set; }
        public bool Disabled { get; set; }
        public object? DefaultValue { get; set; }
        public List<FieldOptionDto>? Options { get; set; }
        public int Order { get; set; }
        public string Width { get; set; } = "full";
        public string? Section { get; set; }
        public bool LightModeVisible { get; set; }
        public List<string>? WorkflowStepBinding { get; set; }
        public FieldPermissionsDto? Permissions { get; set; }
    }

    public class FieldOptionDto
    {
        public string Value { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public bool Disabled { get; set; }
    }

    public class FormPermissionsDto
    {
        public List<string> AllowedRoles { get; set; } = new();
        public List<string> DenyRoles { get; set; } = new();
        public List<string> AdminRoles { get; set; } = new();
    }

    public class FieldPermissionsDto
    {
        public List<string> AllowedRoles { get; set; } = new();
        public List<string> AllowedUsers { get; set; } = new();
        public List<string> ReadOnlyRoles { get; set; } = new();
        public List<string> HideFromRoles { get; set; } = new();
    }

    public class LightModeConfigDto
    {
        public bool Enabled { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool ShowOnlyRequired { get; set; }
    }

    // ====================================
    // REQUEST DTOs
    // ====================================

    public class CreateFormConfigurationRequest
    {
        [Required]
        [StringLength(255)]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Description { get; set; }

        [Required]
        [StringLength(100)]
        public string RequirementType { get; set; } = string.Empty;

        [StringLength(100)]
        public string? WorkflowStepId { get; set; }

        [Required]
        public List<FormSectionDto> Sections { get; set; } = new();

        [Required]
        public List<FormFieldDto> Fields { get; set; } = new();

        public bool IsActive { get; set; } = true;
        public bool HasLightMode { get; set; } = true;
        public FormPermissionsDto? Permissions { get; set; }
        public LightModeConfigDto? LightMode { get; set; }
    }

    public class UpdateFormConfigurationRequest
    {
        [Required]
        public Guid Id { get; set; }

        [Required]
        public int Version { get; set; }

        [StringLength(255)]
        public string? Name { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }

        [StringLength(100)]
        public string? WorkflowStepId { get; set; }

        public List<FormSectionDto>? Sections { get; set; }
        public List<FormFieldDto>? Fields { get; set; }
        public bool? HasLightMode { get; set; }
        public FormPermissionsDto? Permissions { get; set; }
        public LightModeConfigDto? LightMode { get; set; }
    }

    // ====================================
    // DEPLOYMENT DTOs
    // ====================================

    public class FormDeploymentDto
    {
        public string Id { get; set; } = string.Empty;
        public string FormConfigurationId { get; set; } = string.Empty;
        public int Version { get; set; }
        public string Status { get; set; } = string.Empty;
        public string TargetEnvironment { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public string? ReviewedAt { get; set; }
        public string? ReviewedBy { get; set; }
        public string? ReviewComment { get; set; }
        public string? DeployedAt { get; set; }
    }

    public class DeployFormConfigurationRequest
    {
        [Required]
        public int Version { get; set; }

        [StringLength(1000)]
        public string? ReviewComment { get; set; }

        [StringLength(50)]
        public string? TargetEnvironment { get; set; } = "production";
    }

    public class ReviewDeploymentRequest
    {
        [Required]
        public bool Approved { get; set; }

        [StringLength(1000)]
        public string? Comment { get; set; }
    }

    // ====================================
    // SUBMISSION DTOs
    // ====================================

    public class FormSubmissionDto
    {
        public string Id { get; set; } = string.Empty;
        public string RequirementId { get; set; } = string.Empty;
        public string FormConfigurationId { get; set; } = string.Empty;
        public string? WorkflowStepId { get; set; }
        public string SubmissionData { get; set; } = string.Empty; // JSON
        public string Status { get; set; } = string.Empty;
        public bool IsLightMode { get; set; }
        public string? SubmittedAt { get; set; }
        public string SubmittedBy { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
    }

    public class SubmitFormRequest
    {
        [Required]
        public Guid RequirementId { get; set; }

        [Required]
        public Dictionary<string, object> FieldValues { get; set; } = new();

        public bool? IsLightMode { get; set; }
        public string? WorkflowStepId { get; set; }
    }

    // ====================================
    // VALIDATION DTOs
    // ====================================

    public class FormValidationResultDto
    {
        public bool IsValid { get; set; }
        public List<ValidationErrorDto> Errors { get; set; } = new();
        public List<ValidationErrorDto> Warnings { get; set; } = new();
        public List<ValidationErrorDto> Suggestions { get; set; } = new();
    }

    public class ValidationErrorDto
    {
        public string Field { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
    }

    // ====================================
    // WORKFLOW INTEGRATION DTOs
    // ====================================

    public class WorkflowStepDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

    // ====================================
    // SEARCH & FILTERING DTOs
    // ====================================

    public class SearchFormConfigurationsRequest
    {
        public string? Query { get; set; }
        public List<string>? RequirementTypes { get; set; }
        public bool? IncludeInactive { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; } = "asc";
    }

    public class PaginatedResponse<T>
    {
        public bool Success { get; set; }
        public List<T>? Data { get; set; }
        public string? Message { get; set; }
        public List<string>? Errors { get; set; }
        public ResponseMetadata? Metadata { get; set; }
        public PaginationInfo Pagination { get; set; } = new();

        public static PaginatedResponse<T> Success(
            List<T> data, 
            int page, 
            int pageSize, 
            int totalCount,
            string? message = null)
        {
            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
            
            return new PaginatedResponse<T>
            {
                Success = true,
                Data = data,
                Message = message,
                Pagination = new PaginationInfo
                {
                    Page = page,
                    PageSize = pageSize,
                    TotalCount = totalCount,
                    TotalPages = totalPages,
                    HasNext = page < totalPages,
                    HasPrevious = page > 1
                },
                Metadata = new ResponseMetadata
                {
                    RequestId = Guid.NewGuid().ToString(),
                    Timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    Version = "1.0.0"
                }
            };
        }

        public static PaginatedResponse<T> Error(string message, List<string>? errors = null)
        {
            return new PaginatedResponse<T>
            {
                Success = false,
                Message = message,
                Errors = errors ?? new List<string>(),
                Data = new List<T>(),
                Pagination = new PaginationInfo(),
                Metadata = new ResponseMetadata
                {
                    RequestId = Guid.NewGuid().ToString(),
                    Timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    Version = "1.0.0"
                }
            };
        }
    }

    public class PaginationInfo
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }
        public bool HasNext { get; set; }
        public bool HasPrevious { get; set; }
    }

    // ====================================
    // SEARCH & FILTERING DTOs
    // ====================================

    public class SearchFormConfigurationsRequest
    {
        public string? Query { get; set; }
        public List<string>? RequirementTypes { get; set; }
        public bool? IncludeInactive { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; } = "asc";
    }

    // ====================================
    // ANALYTICS DTOs
    // ====================================

    public class FormUsageStatsDto
    {
        public string FormConfigurationId { get; set; } = string.Empty;
        public int TotalSubmissions { get; set; }
        public int UniqueUsers { get; set; }
        public double AverageCompletionTime { get; set; }
        public double AbandonmentRate { get; set; }
        public double ConversionRate { get; set; }
        public double LightModeUsage { get; set; }
        public List<FieldAnalyticsDto> FieldAnalytics { get; set; } = new();
        public List<string> MostUsedFields { get; set; } = new();
        public List<string> LeastUsedFields { get; set; } = new();
        public Dictionary<string, int> DeviceBreakdown { get; set; } = new();
        public Dictionary<string, int> BrowserBreakdown { get; set; } = new();
        public List<TrendDataDto> UsageTrend { get; set; } = new();
    }

    public class FieldAnalyticsDto
    {
        public string FieldId { get; set; } = string.Empty;
        public string FieldName { get; set; } = string.Empty;
        public int CompletionCount { get; set; }
        public double CompletionRate { get; set; }
        public double AverageTimeSpent { get; set; }
        public int ErrorCount { get; set; }
        public List<string> CommonValues { get; set; } = new();
    }

    public class TrendDataDto
    {
        public string Date { get; set; } = string.Empty;
        public int Value { get; set; }
        public string? Label { get; set; }
    }

    // ====================================
    // TEMPLATE DTOs
    // ====================================

    public class FormTemplateDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public string RequirementType { get; set; } = string.Empty;
        public FormConfigurationDto TemplateData { get; set; } = new();
        public int UsageCount { get; set; }
        public string? LastUsedAt { get; set; }
        public bool IsPublic { get; set; }
    }

    public class CreateFormFromTemplateRequest
    {
        [Required]
        [StringLength(255)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string RequirementType { get; set; } = string.Empty;

        public Dictionary<string, object>? FieldMappings { get; set; }
    }

    // ====================================
    // IMPORT/EXPORT DTOs
    // ====================================

    public class ExportFormConfigurationRequest
    {
        public string Format { get; set; } = "json"; // json, excel
        public bool IncludeSubmissions { get; set; }
        public bool IncludeAnalytics { get; set; }
    }

    public class ImportFormConfigurationRequest
    {
        [Required]
        public IFormFile File { get; set; } = null!;

        public bool OverwriteExisting { get; set; }
        public bool ValidateOnly { get; set; }
    }

    public class ImportFormConfigurationResult
    {
        public bool Success { get; set; }
        public List<FormConfigurationDto> ImportedForms { get; set; } = new();
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
        public ImportStatistics Statistics { get; set; } = new();
    }

    public class ImportStatistics
    {
        public int TotalProcessed { get; set; }
        public int SuccessfulImports { get; set; }
        public int FailedImports { get; set; }
        public int SkippedDuplicates { get; set; }
        public TimeSpan ProcessingTime { get; set; }
    }
}
