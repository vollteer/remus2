using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;
using System.Security.Claims;

namespace YourProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Adjust based on your auth setup
    public class FormsController : ControllerBase
    {
        private readonly IFormConfigurationService _formService;
        private readonly IWorkflowService _workflowService;
        private readonly ILogger<FormsController> _logger;
        private readonly ICurrentUserService _currentUserService;

        public FormsController(
            IFormConfigurationService formService,
            IWorkflowService workflowService,
            ILogger<FormsController> logger,
            ICurrentUserService currentUserService)
        {
            _formService = formService;
            _workflowService = workflowService;
            _logger = logger;
            _currentUserService = currentUserService;
        }

        // ====================================
        // FORM CONFIGURATION CRUD
        // ====================================

        /// <summary>
        /// Get form configuration by requirement type
        /// </summary>
        [HttpGet("configuration")]
        public async Task<ActionResult<ApiResponse<FormConfigurationDto>>> GetFormConfiguration(
            [Required] string requirementType,
            string? userRoles = null)
        {
            try
            {
                _logger.LogInformation("Getting form configuration for requirement type: {RequirementType}", requirementType);

                var userRolesList = string.IsNullOrEmpty(userRoles) 
                    ? new List<string>() 
                    : userRoles.Split(',').ToList();

                var currentUserId = _currentUserService.GetCurrentUserId();
                var config = await _formService.GetFormConfigurationAsync(requirementType, userRolesList, currentUserId);

                if (config == null)
                {
                    return Ok(ApiResponse<FormConfigurationDto>.Success(null, "No form configuration found"));
                }

                var dto = MapToDto(config);
                return Ok(ApiResponse<FormConfigurationDto>.Success(dto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting form configuration for requirement type: {RequirementType}", requirementType);
                return StatusCode(500, ApiResponse<FormConfigurationDto>.Error("Internal server error"));
            }
        }

        /// <summary>
        /// Get form configuration by ID
        /// </summary>
        [HttpGet("configuration/{id:guid}")]
        public async Task<ActionResult<ApiResponse<FormConfigurationDto>>> GetFormConfigurationById(Guid id)
        {
            try
            {
                var currentUserId = _currentUserService.GetCurrentUserId();
                var config = await _formService.GetFormConfigurationByIdAsync(id, currentUserId);

                if (config == null)
                {
                    return NotFound(ApiResponse<FormConfigurationDto>.Error("Form configuration not found"));
                }

                var dto = MapToDto(config);
                return Ok(ApiResponse<FormConfigurationDto>.Success(dto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting form configuration by ID: {Id}", id);
                return StatusCode(500, ApiResponse<FormConfigurationDto>.Error("Internal server error"));
            }
        }

        /// <summary>
        /// Create new form configuration
        /// </summary>
        [HttpPost("configuration")]
        public async Task<ActionResult<ApiResponse<FormConfigurationDto>>> CreateFormConfiguration(
            [FromBody] CreateFormConfigurationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(ApiResponse<FormConfigurationDto>.Error("Validation failed", errors));
                }

                var currentUserId = _currentUserService.GetCurrentUserId();
                var currentUserName = _currentUserService.GetCurrentUserName();

                // Map request to entity
                var entity = new FormConfiguration
                {
                    Id = Guid.NewGuid(),
                    RequirementType = request.RequirementType,
                    Name = request.Name,
                    Description = request.Description,
                    WorkflowStepId = request.WorkflowStepId,
                    ConfigurationData = JsonConvert.SerializeObject(new
                    {
                        sections = request.Sections,
                        fields = request.Fields,
                        permissions = request.Permissions,
                        lightMode = request.LightMode
                    }),
                    Version = 1,
                    IsActive = request.IsActive,
                    HasLightMode = request.HasLightMode,
                    CreatedAt = DateTime.UtcNow,
                    ModifiedAt = DateTime.UtcNow,
                    CreatedBy = currentUserName
                };

                var savedConfig = await _formService.CreateFormConfigurationAsync(entity);
                var dto = MapToDto(savedConfig);

                _logger.LogInformation("Created form configuration: {Id} for requirement type: {RequirementType}", 
                    savedConfig.Id, savedConfig.RequirementType);

                return CreatedAtAction(
                    nameof(GetFormConfigurationById), 
                    new { id = savedConfig.Id }, 
                    ApiResponse<FormConfigurationDto>.Success(dto, "Form configuration created successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating form configuration");
                return StatusCode(500, ApiResponse<FormConfigurationDto>.Error("Internal server error"));
            }
        }

        /// <summary>
        /// Update existing form configuration
        /// </summary>
        [HttpPut("configuration/{id:guid}")]
        public async Task<ActionResult<ApiResponse<FormConfigurationDto>>> UpdateFormConfiguration(
            Guid id, 
            [FromBody] UpdateFormConfigurationRequest request)
        {
            try
            {
                if (id != request.Id)
                {
                    return BadRequest(ApiResponse<FormConfigurationDto>.Error("ID mismatch"));
                }

                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(ApiResponse<FormConfigurationDto>.Error("Validation failed", errors));
                }

                var currentUserId = _currentUserService.GetCurrentUserId();
                var currentUserName = _currentUserService.GetCurrentUserName();

                var existingConfig = await _formService.GetFormConfigurationByIdAsync(id, currentUserId);
                if (existingConfig == null)
                {
                    return NotFound(ApiResponse<FormConfigurationDto>.Error("Form configuration not found"));
                }

                // Version check for optimistic concurrency
                if (existingConfig.Version != request.Version)
                {
                    return Conflict(ApiResponse<FormConfigurationDto>.Error(
                        "Configuration has been modified by another user. Please refresh and try again."));
                }

                // Update entity
                existingConfig.Name = request.Name ?? existingConfig.Name;
                existingConfig.Description = request.Description ?? existingConfig.Description;
                existingConfig.WorkflowStepId = request.WorkflowStepId ?? existingConfig.WorkflowStepId;
                existingConfig.HasLightMode = request.HasLightMode ?? existingConfig.HasLightMode;
                existingConfig.ModifiedAt = DateTime.UtcNow;
                existingConfig.Version++;

                // Update configuration data if provided
                if (request.Sections != null || request.Fields != null || 
                    request.Permissions != null || request.LightMode != null)
                {
                    var configData = JsonConvert.DeserializeObject<dynamic>(existingConfig.ConfigurationData) ?? new { };
                    
                    existingConfig.ConfigurationData = JsonConvert.SerializeObject(new
                    {
                        sections = request.Sections ?? ((dynamic)configData).sections,
                        fields = request.Fields ?? ((dynamic)configData).fields,
                        permissions = request.Permissions ?? ((dynamic)configData).permissions,
                        lightMode = request.LightMode ?? ((dynamic)configData).lightMode
                    });
                }

                var updatedConfig = await _formService.UpdateFormConfigurationAsync(existingConfig);
                var dto = MapToDto(updatedConfig);

                _logger.LogInformation("Updated form configuration: {Id}", id);

                return Ok(ApiResponse<FormConfigurationDto>.Success(dto, "Form configuration updated successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating form configuration: {Id}", id);
                return StatusCode(500, ApiResponse<FormConfigurationDto>.Error("Internal server error"));
            }
        }

        /// <summary>
        /// Delete form configuration
        /// </summary>
        [HttpDelete("configuration/{id:guid}")]
        public async Task<ActionResult<ApiResponse<object>>> DeleteFormConfiguration(Guid id)
        {
            try
            {
                var currentUserId = _currentUserService.GetCurrentUserId();
                var existingConfig = await _formService.GetFormConfigurationByIdAsync(id, currentUserId);
                
                if (existingConfig == null)
                {
                    return NotFound(ApiResponse<object>.Error("Form configuration not found"));
                }

                // Check if form has submissions or deployments
                var hasSubmissions = await _formService.HasSubmissionsAsync(id);
                if (hasSubmissions)
                {
                    return BadRequest(ApiResponse<object>.Error(
                        "Cannot delete form configuration with existing submissions. Please archive instead."));
                }

                await _formService.DeleteFormConfigurationAsync(id);

                _logger.LogInformation("Deleted form configuration: {Id}", id);

                return Ok(ApiResponse<object>.Success(null, "Form configuration deleted successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting form configuration: {Id}", id);
                return StatusCode(500, ApiResponse<object>.Error("Internal server error"));
            }
        }

        // ====================================
        // DEPLOYMENT OPERATIONS (4-Eyes Principle)
        // ====================================

        /// <summary>
        /// Deploy form configuration (4-Eyes Principle)
        /// </summary>
        [HttpPost("configuration/{id:guid}/deploy")]
        public async Task<ActionResult<ApiResponse<FormDeploymentDto>>> DeployFormConfiguration(
            Guid id,
            [FromBody] DeployFormConfigurationRequest request)
        {
            try
            {
                var currentUserId = _currentUserService.GetCurrentUserId();
                var currentUserName = _currentUserService.GetCurrentUserName();

                var formConfig = await _formService.GetFormConfigurationByIdAsync(id, currentUserId);
                if (formConfig == null)
                {
                    return NotFound(ApiResponse<FormDeploymentDto>.Error("Form configuration not found"));
                }

                // Validate version
                if (formConfig.Version != request.Version)
                {
                    return BadRequest(ApiResponse<FormDeploymentDto>.Error("Version mismatch"));
                }

                // Create deployment record
                var deployment = new FormDeployment
                {
                    Id = Guid.NewGuid(),
                    FormConfigurationId = id,
                    Version = request.Version,
                    TargetEnvironment = request.TargetEnvironment ?? "production",
                    Status = "pending_review",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = currentUserName,
                    ReviewComment = request.ReviewComment
                };

                var savedDeployment = await _formService.CreateDeploymentAsync(deployment);
                var dto = MapDeploymentToDto(savedDeployment);

                _logger.LogInformation("Created deployment for form configuration: {FormId}, Deployment: {DeploymentId}", 
                    id, savedDeployment.Id);

                return Ok(ApiResponse<FormDeploymentDto>.Success(dto, "Deployment created and pending review"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating deployment for form configuration: {Id}", id);
                return StatusCode(500, ApiResponse<FormDeploymentDto>.Error("Internal server error"));
            }
        }

        /// <summary>
        /// Review deployment (for 4-Eyes process)
        /// </summary>
        [HttpPatch("deployment/{deploymentId:guid}/review")]
        public async Task<ActionResult<ApiResponse<FormDeploymentDto>>> ReviewDeployment(
            Guid deploymentId,
            [FromBody] ReviewDeploymentRequest request)
        {
            try
            {
                var currentUserId = _currentUserService.GetCurrentUserId();
                var currentUserName = _currentUserService.GetCurrentUserName();

                var deployment = await _formService.GetDeploymentByIdAsync(deploymentId);
                if (deployment == null)
                {
                    return NotFound(ApiResponse<FormDeploymentDto>.Error("Deployment not found"));
                }

                // 4-Eyes check: reviewer cannot be the same as creator
                if (deployment.CreatedBy == currentUserName)
                {
                    return BadRequest(ApiResponse<FormDeploymentDto>.Error(
                        "You cannot review your own deployment (4-Eyes principle)"));
                }

                if (deployment.Status != "pending_review")
                {
                    return BadRequest(ApiResponse<FormDeploymentDto>.Error(
                        $"Deployment cannot be reviewed in current status: {deployment.Status}"));
                }

                // Update deployment
                deployment.ReviewedAt = DateTime.UtcNow;
                deployment.ReviewedBy = currentUserName;
                deployment.ReviewComment = request.Comment;
                deployment.Status = request.Approved ? "approved" : "rejected";

                var updatedDeployment = await _formService.UpdateDeploymentAsync(deployment);

                // If approved, proceed with actual deployment
                if (request.Approved)
                {
                    await _formService.ExecuteDeploymentAsync(deploymentId);
                    updatedDeployment.Status = "deployed";
                    updatedDeployment.DeployedAt = DateTime.UtcNow;
                    updatedDeployment = await _formService.UpdateDeploymentAsync(updatedDeployment);
                }

                var dto = MapDeploymentToDto(updatedDeployment);

                _logger.LogInformation("Reviewed deployment: {DeploymentId}, Approved: {Approved}", 
                    deploymentId, request.Approved);

                return Ok(ApiResponse<FormDeploymentDto>.Success(dto, 
                    request.Approved ? "Deployment approved and executed" : "Deployment rejected"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reviewing deployment: {DeploymentId}", deploymentId);
                return StatusCode(500, ApiResponse<FormDeploymentDto>.Error("Internal server error"));
            }
        }

        /// <summary>
        /// Get deployment history for a form configuration
        /// </summary>
        [HttpGet("configuration/{id:guid}/deployments")]
        public async Task<ActionResult<ApiResponse<List<FormDeploymentDto>>>> GetDeploymentHistory(Guid id)
        {
            try
            {
                var deployments = await _formService.GetDeploymentHistoryAsync(id);
                var dtos = deployments.Select(MapDeploymentToDto).ToList();

                return Ok(ApiResponse<List<FormDeploymentDto>>.Success(dtos));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting deployment history for form: {Id}", id);
                return StatusCode(500, ApiResponse<List<FormDeploymentDto>>.Error("Internal server error"));
            }
        }

        // ====================================
        // FORM SUBMISSIONS
        // ====================================

        /// <summary>
        /// Submit form data
        /// </summary>
        [HttpPost("configuration/{id:guid}/submit")]
        public async Task<ActionResult<ApiResponse<FormSubmissionDto>>> SubmitForm(
            Guid id,
            [FromBody] SubmitFormRequest request)
        {
            try
            {
                var currentUserId = _currentUserService.GetCurrentUserId();
                var currentUserName = _currentUserService.GetCurrentUserName();

                var formConfig = await _formService.GetFormConfigurationByIdAsync(id, currentUserId);
                if (formConfig == null)
                {
                    return NotFound(ApiResponse<FormSubmissionDto>.Error("Form configuration not found"));
                }

                // Validate submission data against form configuration
                var validationResult = await _formService.ValidateSubmissionAsync(id, request.FieldValues);
                if (!validationResult.IsValid)
                {
                    return BadRequest(ApiResponse<FormSubmissionDto>.Error("Validation failed", 
                        validationResult.Errors.Select(e => e.Message).ToList()));
                }

                // Create submission
                var submission = new FormSubmission
                {
                    Id = Guid.NewGuid(),
                    RequirementId = request.RequirementId,
                    FormConfigurationId = id,
                    WorkflowStepId = request.WorkflowStepId,
                    SubmissionData = JsonConvert.SerializeObject(new
                    {
                        fieldValues = request.FieldValues,
                        metadata = new
                        {
                            submittedInLightMode = request.IsLightMode ?? false,
                            workflowStep = request.WorkflowStepId,
                            submissionTime = DateTime.UtcNow,
                            userAgent = Request.Headers["User-Agent"].ToString(),
                            formVersion = formConfig.Version
                        },
                        validationResults = validationResult
                    }),
                    Status = "submitted",
                    IsLightMode = request.IsLightMode ?? false,
                    SubmittedAt = DateTime.UtcNow,
                    SubmittedBy = currentUserName,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = currentUserName
                };

                var savedSubmission = await _formService.CreateSubmissionAsync(submission);
                var dto = MapSubmissionToDto(savedSubmission);

                _logger.LogInformation("Created form submission: {SubmissionId} for requirement: {RequirementId}", 
                    savedSubmission.Id, request.RequirementId);

                return Ok(ApiResponse<FormSubmissionDto>.Success(dto, "Form submitted successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting form: {FormId}", id);
                return StatusCode(500, ApiResponse<FormSubmissionDto>.Error("Internal server error"));
            }
        }

        /// <summary>
        /// Get form submission by ID
        /// </summary>
        [HttpGet("submission/{id:guid}")]
        public async Task<ActionResult<ApiResponse<FormSubmissionDto>>> GetFormSubmission(Guid id)
        {
            try
            {
                var currentUserId = _currentUserService.GetCurrentUserId();
                var submission = await _formService.GetSubmissionByIdAsync(id, currentUserId);

                if (submission == null)
                {
                    return NotFound(ApiResponse<FormSubmissionDto>.Error("Form submission not found"));
                }

                var dto = MapSubmissionToDto(submission);
                return Ok(ApiResponse<FormSubmissionDto>.Success(dto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting form submission: {Id}", id);
                return StatusCode(500, ApiResponse<FormSubmissionDto>.Error("Internal server error"));
            }
        }

        // ====================================
        // VALIDATION
        // ====================================

        /// <summary>
        /// Validate form configuration
        /// </summary>
        [HttpPost("configuration/validate")]
        public async Task<ActionResult<ApiResponse<FormValidationResultDto>>> ValidateFormConfiguration(
            [FromBody] object formData)
        {
            try
            {
                var validationResult = await _formService.ValidateFormConfigurationAsync(formData);
                var dto = MapValidationResultToDto(validationResult);

                return Ok(ApiResponse<FormValidationResultDto>.Success(dto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating form configuration");
                return StatusCode(500, ApiResponse<FormValidationResultDto>.Error("Internal server error"));
            }
        }

        // ====================================
        // WORKFLOW INTEGRATION
        // ====================================

        /// <summary>
        /// Get workflow steps for requirement type
        /// </summary>
        [HttpGet("/api/workflows/requirement-type/{requirementType}/steps")]
        public async Task<ActionResult<ApiResponse<List<WorkflowStepDto>>>> GetWorkflowSteps(string requirementType)
        {
            try
            {
                var steps = await _workflowService.GetWorkflowStepsAsync(requirementType);
                var dtos = steps.Select(s => new WorkflowStepDto { Id = s.Id, Name = s.Name }).ToList();

                return Ok(ApiResponse<List<WorkflowStepDto>>.Success(dtos));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting workflow steps for requirement type: {RequirementType}", requirementType);
                return StatusCode(500, ApiResponse<List<WorkflowStepDto>>.Error("Internal server error"));
            }
        }

        // ====================================
        // HELPER METHODS
        // ====================================

        private FormConfigurationDto MapToDto(FormConfiguration entity)
        {
            var configData = JsonConvert.DeserializeObject<dynamic>(entity.ConfigurationData);
            
            return new FormConfigurationDto
            {
                Id = entity.Id.ToString(),
                Name = entity.Name,
                Description = entity.Description,
                RequirementType = entity.RequirementType,
                WorkflowStepId = entity.WorkflowStepId,
                Sections = JsonConvert.DeserializeObject<List<FormSectionDto>>(configData?.sections?.ToString() ?? "[]"),
                Fields = JsonConvert.DeserializeObject<List<FormFieldDto>>(configData?.fields?.ToString() ?? "[]"),
                Version = entity.Version,
                IsActive = entity.IsActive,
                HasLightMode = entity.HasLightMode,
                CreatedAt = entity.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                ModifiedAt = entity.ModifiedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                CreatedBy = entity.CreatedBy,
                Permissions = JsonConvert.DeserializeObject<FormPermissionsDto>(configData?.permissions?.ToString() ?? "{}"),
                LightMode = JsonConvert.DeserializeObject<LightModeConfigDto>(configData?.lightMode?.ToString() ?? "{}")
            };
        }

        private FormDeploymentDto MapDeploymentToDto(FormDeployment entity)
        {
            return new FormDeploymentDto
            {
                Id = entity.Id.ToString(),
                FormConfigurationId = entity.FormConfigurationId.ToString(),
                Version = entity.Version,
                Status = entity.Status,
                TargetEnvironment = entity.TargetEnvironment,
                CreatedAt = entity.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                CreatedBy = entity.CreatedBy,
                ReviewedAt = entity.ReviewedAt?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                ReviewedBy = entity.ReviewedBy,
                ReviewComment = entity.ReviewComment,
                DeployedAt = entity.DeployedAt?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            };
        }

        private FormSubmissionDto MapSubmissionToDto(FormSubmission entity)
        {
            return new FormSubmissionDto
            {
                Id = entity.Id.ToString(),
                RequirementId = entity.RequirementId.ToString(),
                FormConfigurationId = entity.FormConfigurationId.ToString(),
                WorkflowStepId = entity.WorkflowStepId,
                SubmissionData = entity.SubmissionData,
                Status = entity.Status,
                IsLightMode = entity.IsLightMode,
                SubmittedAt = entity.SubmittedAt?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                SubmittedBy = entity.SubmittedBy,
                CreatedAt = entity.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            };
        }

        private FormValidationResultDto MapValidationResultToDto(ValidationResult result)
        {
            return new FormValidationResultDto
            {
                IsValid = result.IsValid,
                Errors = result.Errors.Select(e => new ValidationErrorDto
                {
                    Field = e.Field,
                    Message = e.Message,
                    Code = e.Code,
                    Severity = e.Severity
                }).ToList(),
                Warnings = result.Warnings.Select(w => new ValidationErrorDto
                {
                    Field = w.Field,
                    Message = w.Message,
                    Code = w.Code,
                    Severity = w.Severity
                }).ToList(),
                Suggestions = result.Suggestions.Select(s => new ValidationErrorDto
                {
                    Field = s.Field,
                    Message = s.Message,
                    Code = s.Code,
                    Severity = s.Severity
                }).ToList()
            };
        }
    }
}
