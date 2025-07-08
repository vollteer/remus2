using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using YourProject.Data;
using YourProject.Models.Entities;
using YourProject.Services.Interfaces;

namespace YourProject.Services.Implementation
{
    // ====================================
    // FORM CONFIGURATION SERVICE IMPLEMENTATION
    // ====================================

    public class FormConfigurationService : IFormConfigurationService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<FormConfigurationService> _logger;
        private readonly ICurrentUserService _currentUserService;

        public FormConfigurationService(
            ApplicationDbContext context,
            ILogger<FormConfigurationService> logger,
            ICurrentUserService currentUserService)
        {
            _context = context;
            _logger = logger;
            _currentUserService = currentUserService;
        }

        // ==================== FORM CONFIGURATION CRUD ====================

        public async Task<FormConfiguration?> GetFormConfigurationAsync(
            string requirementType, 
            List<string> userRoles, 
            string currentUserId)
        {
            _logger.LogInformation("Getting form configuration for requirement type: {RequirementType}, user: {UserId}", 
                requirementType, currentUserId);

            var config = await _context.FormConfigurations
                .Where(fc => fc.RequirementType == requirementType && fc.IsActive)
                .OrderByDescending(fc => fc.Version)
                .FirstOrDefaultAsync();

            if (config != null)
            {
                // Apply role-based filtering to configuration data
                config.ConfigurationData = ApplyPermissionFiltering(config.ConfigurationData, userRoles);
                
                _logger.LogInformation("Found form configuration: {FormId} for requirement type: {RequirementType}", 
                    config.Id, requirementType);
            }
            else
            {
                _logger.LogInformation("No form configuration found for requirement type: {RequirementType}", requirementType);
            }

            return config;
        }

        public async Task<FormConfiguration?> GetFormConfigurationByIdAsync(Guid id, string currentUserId)
        {
            _logger.LogInformation("Getting form configuration by ID: {FormId}, user: {UserId}", id, currentUserId);

            var config = await _context.FormConfigurations
                .Include(fc => fc.Deployments)
                .FirstOrDefaultAsync(fc => fc.Id == id);

            if (config != null)
            {
                _logger.LogInformation("Found form configuration: {FormId}", id);
            }
            else
            {
                _logger.LogWarning("Form configuration not found: {FormId}", id);
            }

            return config;
        }

        public async Task<FormConfiguration> CreateFormConfigurationAsync(FormConfiguration formConfiguration)
        {
            _logger.LogInformation("Creating form configuration: {FormName} for requirement type: {RequirementType}", 
                formConfiguration.Name, formConfiguration.RequirementType);

            // Validate configuration data
            var validationResult = await ValidateFormConfigurationAsync(formConfiguration.ConfigurationData);
            if (!validationResult.IsValid)
            {
                var errorMessage = $"Form configuration is invalid: {string.Join(", ", validationResult.Errors.Select(e => e.Message))}";
                _logger.LogError("Validation failed for form configuration: {ErrorMessage}", errorMessage);
                throw new InvalidOperationException(errorMessage);
            }

            // Set creation timestamps
            formConfiguration.CreatedAt = DateTime.UtcNow;
            formConfiguration.ModifiedAt = DateTime.UtcNow;

            _context.FormConfigurations.Add(formConfiguration);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully created form configuration: {FormId} for requirement type: {RequirementType}",
                formConfiguration.Id, formConfiguration.RequirementType);

            return formConfiguration;
        }

        public async Task<FormConfiguration> UpdateFormConfigurationAsync(FormConfiguration formConfiguration)
        {
            _logger.LogInformation("Updating form configuration: {FormId}", formConfiguration.Id);

            // Validate configuration data
            var validationResult = await ValidateFormConfigurationAsync(formConfiguration.ConfigurationData);
            if (!validationResult.IsValid)
            {
                var errorMessage = $"Form configuration is invalid: {string.Join(", ", validationResult.Errors.Select(e => e.Message))}";
                _logger.LogError("Validation failed for form configuration update: {ErrorMessage}", errorMessage);
                throw new InvalidOperationException(errorMessage);
            }

            // Update modification timestamp
            formConfiguration.ModifiedAt = DateTime.UtcNow;

            _context.FormConfigurations.Update(formConfiguration);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully updated form configuration: {FormId}", formConfiguration.Id);

            return formConfiguration;
        }

        public async Task DeleteFormConfigurationAsync(Guid id)
        {
            _logger.LogInformation("Deleting form configuration: {FormId}", id);

            var config = await _context.FormConfigurations.FindAsync(id);
            if (config == null)
            {
                _logger.LogWarning("Form configuration not found for deletion: {FormId}", id);
                throw new InvalidOperationException("Form configuration not found");
            }

            // Check if there are any submissions
            var hasSubmissions = await _context.FormSubmissions.AnyAsync(fs => fs.FormConfigurationId == id);
            if (hasSubmissions)
            {
                _logger.LogWarning("Cannot delete form configuration with existing submissions: {FormId}", id);
                throw new InvalidOperationException("Cannot delete form configuration with existing submissions");
            }

            _context.FormConfigurations.Remove(config);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully deleted form configuration: {FormId}", id);
        }

        public async Task<List<FormConfiguration>> GetAllFormConfigurationsAsync(string? requirementType = null, bool includeInactive = false)
        {
            _logger.LogInformation("Getting all form configurations. RequirementType: {RequirementType}, IncludeInactive: {IncludeInactive}", 
                requirementType, includeInactive);

            var query = _context.FormConfigurations.AsQueryable();

            if (!string.IsNullOrEmpty(requirementType))
            {
                query = query.Where(fc => fc.RequirementType == requirementType);
            }

            if (!includeInactive)
            {
                query = query.Where(fc => fc.IsActive);
            }

            var configurations = await query
                .OrderBy(fc => fc.RequirementType)
                .ThenBy(fc => fc.Name)
                .ToListAsync();

            _logger.LogInformation("Found {Count} form configurations", configurations.Count);

            return configurations;
        }

        // ==================== DEPLOYMENTS (4-Eyes Principle) ====================

        public async Task<FormDeployment> CreateDeploymentAsync(FormDeployment deployment)
        {
            _logger.LogInformation("Creating deployment for form configuration: {FormId}, version: {Version}", 
                deployment.FormConfigurationId, deployment.Version);

            deployment.CreatedAt = DateTime.UtcNow;
            deployment.Status = "pending_review";

            _context.FormDeployments.Add(deployment);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully created deployment: {DeploymentId} for form: {FormId}",
                deployment.Id, deployment.FormConfigurationId);

            return deployment;
        }

        public async Task<FormDeployment> UpdateDeploymentAsync(FormDeployment deployment)
        {
            _logger.LogInformation("Updating deployment: {DeploymentId}", deployment.Id);

            _context.FormDeployments.Update(deployment);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully updated deployment: {DeploymentId}", deployment.Id);

            return deployment;
        }

        public async Task<FormDeployment?> GetDeploymentByIdAsync(Guid deploymentId)
        {
            _logger.LogInformation("Getting deployment by ID: {DeploymentId}", deploymentId);

            var deployment = await _context.FormDeployments
                .Include(fd => fd.FormConfiguration)
                .FirstOrDefaultAsync(fd => fd.Id == deploymentId);

            if (deployment != null)
            {
                _logger.LogInformation("Found deployment: {DeploymentId}", deploymentId);
            }
            else
            {
                _logger.LogWarning("Deployment not found: {DeploymentId}", deploymentId);
            }

            return deployment;
        }

        public async Task<List<FormDeployment>> GetDeploymentHistoryAsync(Guid formConfigurationId)
        {
            _logger.LogInformation("Getting deployment history for form configuration: {FormId}", formConfigurationId);

            var deployments = await _context.FormDeployments
                .Where(fd => fd.FormConfigurationId == formConfigurationId)
                .OrderByDescending(fd => fd.CreatedAt)
                .ToListAsync();

            _logger.LogInformation("Found {Count} deployments for form configuration: {FormId}", 
                deployments.Count, formConfigurationId);

            return deployments;
        }

        public async Task ExecuteDeploymentAsync(Guid deploymentId)
        {
            _logger.LogInformation("Executing deployment: {DeploymentId}", deploymentId);

            var deployment = await GetDeploymentByIdAsync(deploymentId);
            if (deployment == null)
            {
                _logger.LogError("Deployment not found for execution: {DeploymentId}", deploymentId);
                throw new InvalidOperationException("Deployment not found");
            }

            if (deployment.Status != "approved")
            {
                _logger.LogError("Deployment must be approved before execution: {DeploymentId}, current status: {Status}", 
                    deploymentId, deployment.Status);
                throw new InvalidOperationException("Deployment must be approved before execution");
            }

            try
            {
                // Here you would implement the actual deployment logic
                // For example: sync to production database, update caches, etc.
                
                _logger.LogInformation("Starting deployment execution: {DeploymentId}", deploymentId);
                
                // Simulate deployment process
                await Task.Delay(1000);

                // Mark as deployed
                deployment.Status = "deployed";
                deployment.DeployedAt = DateTime.UtcNow;

                await UpdateDeploymentAsync(deployment);

                _logger.LogInformation("Successfully executed deployment: {DeploymentId}", deploymentId);
            }
            catch (Exception ex)
            {
                deployment.Status = "failed";
                deployment.ErrorMessage = ex.Message;
                await UpdateDeploymentAsync(deployment);

                _logger.LogError(ex, "Failed to execute deployment: {DeploymentId}", deploymentId);
                throw;
            }
        }

        // ==================== FORM SUBMISSIONS ====================

        public async Task<FormSubmission> CreateSubmissionAsync(FormSubmission submission)
        {
            _logger.LogInformation("Creating form submission for requirement: {RequirementId}, form: {FormId}", 
                submission.RequirementId, submission.FormConfigurationId);

            submission.CreatedAt = DateTime.UtcNow;
            submission.ModifiedAt = DateTime.UtcNow;

            _context.FormSubmissions.Add(submission);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully created form submission: {SubmissionId} for requirement: {RequirementId}",
                submission.Id, submission.RequirementId);

            return submission;
        }

        public async Task<FormSubmission?> GetSubmissionByIdAsync(Guid submissionId, string currentUserId)
        {
            _logger.LogInformation("Getting form submission by ID: {SubmissionId}, user: {UserId}", 
                submissionId, currentUserId);

            var submission = await _context.FormSubmissions
                .Include(fs => fs.FormConfiguration)
                .FirstOrDefaultAsync(fs => fs.Id == submissionId);

            if (submission != null)
            {
                _logger.LogInformation("Found form submission: {SubmissionId}", submissionId);
            }
            else
            {
                _logger.LogWarning("Form submission not found: {SubmissionId}", submissionId);
            }

            return submission;
        }

        public async Task<List<FormSubmission>> GetSubmissionsByRequirementAsync(Guid requirementId)
        {
            _logger.LogInformation("Getting form submissions for requirement: {RequirementId}", requirementId);

            var submissions = await _context.FormSubmissions
                .Where(fs => fs.RequirementId == requirementId)
                .OrderByDescending(fs => fs.CreatedAt)
                .ToListAsync();

            _logger.LogInformation("Found {Count} form submissions for requirement: {RequirementId}", 
                submissions.Count, requirementId);

            return submissions;
        }

        public async Task<bool> HasSubmissionsAsync(Guid formConfigurationId)
        {
            var hasSubmissions = await _context.FormSubmissions
                .AnyAsync(fs => fs.FormConfigurationId == formConfigurationId);

            _logger.LogInformation("Form configuration {FormId} has submissions: {HasSubmissions}", 
                formConfigurationId, hasSubmissions);

            return hasSubmissions;
        }

        // ==================== VALIDATION ====================

        public async Task<ValidationResult> ValidateFormConfigurationAsync(object formData)
        {
            _logger.LogInformation("Validating form configuration");

            var result = new ValidationResult { IsValid = true };

            try
            {
                // Parse configuration data
                dynamic config;
                if (formData is string jsonString)
                {
                    config = JsonConvert.DeserializeObject(jsonString);
                }
                else
                {
                    config = formData;
                }

                // Validate structure
                if (config?.fields == null)
                {
                    result.Errors.Add(new ValidationError
                    {
                        Field = "fields",
                        Message = "Form must have at least one field",
                        Code = "MISSING_FIELDS"
                    });
                    result.IsValid = false;
                }

                if (config?.sections == null)
                {
                    result.Errors.Add(new ValidationError
                    {
                        Field = "sections",
                        Message = "Form must have at least one section",
                        Code = "MISSING_SECTIONS"
                    });
                    result.IsValid = false;
                }

                // Validate field types and names
                if (config?.fields != null)
                {
                    var fieldNames = new HashSet<string>();
                    foreach (var field in config.fields)
                    {
                        // Check for duplicate field names
                        var fieldName = field.name?.ToString();
                        if (!string.IsNullOrEmpty(fieldName))
                        {
                            if (fieldNames.Contains(fieldName))
                            {
                                result.Errors.Add(new ValidationError
                                {
                                    Field = "fields",
                                    Message = $"Duplicate field name: {fieldName}",
                                    Code = "DUPLICATE_FIELD_NAME"
                                });
                                result.IsValid = false;
                            }
                            fieldNames.Add(fieldName);
                        }
                        else
                        {
                            result.Errors.Add(new ValidationError
                            {
                                Field = "fields",
                                Message = "All fields must have a name",
                                Code = "MISSING_FIELD_NAME"
                            });
                            result.IsValid = false;
                        }

                        // Validate field type
                        var fieldType = field.type?.ToString();
                        var validTypes = new[] { "text", "textarea", "number", "email", "phone", "date", "datetime", "select", "multiselect", "radio", "checkbox", "checkboxGroup", "file", "currency", "percentage", "url", "divider", "heading" };
                        if (string.IsNullOrEmpty(fieldType) || !validTypes.Contains(fieldType))
                        {
                            result.Errors.Add(new ValidationError
                            {
                                Field = "fields",
                                Message = $"Invalid field type: {fieldType}",
                                Code = "INVALID_FIELD_TYPE"
                            });
                            result.IsValid = false;
                        }
                    }
                }

                if (result.IsValid)
                {
                    _logger.LogInformation("Form configuration validation passed");
                }
                else
                {
                    _logger.LogWarning("Form configuration validation failed with {ErrorCount} errors", result.Errors.Count);
                }
                
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during form configuration validation");
                
                result.Errors.Add(new ValidationError
                {
                    Field = "configuration",
                    Message = $"Invalid configuration format: {ex.Message}",
                    Code = "INVALID_FORMAT"
                });
                result.IsValid = false;
            }

            return result;
        }

        public async Task<ValidationResult> ValidateSubmissionAsync(Guid formConfigurationId, Dictionary<string, object> fieldValues)
        {
            _logger.LogInformation("Validating form submission for form: {FormId}", formConfigurationId);

            var result = new ValidationResult { IsValid = true };

            var formConfig = await GetFormConfigurationByIdAsync(formConfigurationId, _currentUserService.GetCurrentUserId());
            if (formConfig == null)
            {
                result.Errors.Add(new ValidationError
                {
                    Field = "form",
                    Message = "Form configuration not found",
                    Code = "FORM_NOT_FOUND"
                });
                result.IsValid = false;
                return result;
            }

            try
            {
                var configData = JsonConvert.DeserializeObject<dynamic>(formConfig.ConfigurationData);
                var fields = JsonConvert.DeserializeObject<List<dynamic>>(configData?.fields?.ToString() ?? "[]");

                // Validate required fields
                foreach (var field in fields)
                {
                    var fieldName = field.name?.ToString();
                    var isRequired = field.required ?? false;
                    var fieldLabel = field.label?.ToString() ?? fieldName;

                    if (isRequired && !string.IsNullOrEmpty(fieldName))
                    {
                        if (!fieldValues.ContainsKey(fieldName) || 
                            fieldValues[fieldName] == null || 
                            string.IsNullOrWhiteSpace(fieldValues[fieldName].ToString()))
                        {
                            result.Errors.Add(new ValidationError
                            {
                                Field = fieldName,
                                Message = $"Field '{fieldLabel}' is required",
                                Code = "REQUIRED_FIELD_MISSING"
                            });
                            result.IsValid = false;
                        }
                    }

                    // Validate field type specific rules
                    if (!string.IsNullOrEmpty(fieldName) && fieldValues.ContainsKey(fieldName))
                    {
                        var fieldType = field.type?.ToString();
                        var fieldValue = fieldValues[fieldName];

                        switch (fieldType)
                        {
                            case "email":
                                if (fieldValue != null && !IsValidEmail(fieldValue.ToString()))
                                {
                                    result.Errors.Add(new ValidationError
                                    {
                                        Field = fieldName,
                                        Message = $"'{fieldLabel}' must be a valid email address",
                                        Code = "INVALID_EMAIL"
                                    });
                                    result.IsValid = false;
                                }
                                break;

                            case "number":
                            case "currency":
                            case "percentage":
                                if (fieldValue != null && !IsNumeric(fieldValue.ToString()))
                                {
                                    result.Errors.Add(new ValidationError
                                    {
                                        Field = fieldName,
                                        Message = $"'{fieldLabel}' must be a valid number",
                                        Code = "INVALID_NUMBER"
                                    });
                                    result.IsValid = false;
                                }
                                break;

                            case "url":
                                if (fieldValue != null && !IsValidUrl(fieldValue.ToString()))
                                {
                                    result.Errors.Add(new ValidationError
                                    {
                                        Field = fieldName,
                                        Message = $"'{fieldLabel}' must be a valid URL",
                                        Code = "INVALID_URL"
                                    });
                                    result.IsValid = false;
                                }
                                break;
                        }
                    }
                }

                if (result.IsValid)
                {
                    _logger.LogInformation("Form submission validation passed for form: {FormId}", formConfigurationId);
                }
                else
                {
                    _logger.LogWarning("Form submission validation failed for form: {FormId} with {ErrorCount} errors", 
                        formConfigurationId, result.Errors.Count);
                }

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during form submission validation for form: {FormId}", formConfigurationId);
                
                result.Errors.Add(new ValidationError
                {
                    Field = "submission",
                    Message = $"Validation error: {ex.Message}",
                    Code = "VALIDATION_ERROR"
                });
                result.IsValid = false;
            }

            return result;
        }

        // ==================== ANALYTICS & USAGE ====================

        public async Task<object> GetFormUsageStatsAsync(Guid formConfigurationId, DateTime? startDate = null, DateTime? endDate = null)
        {
            _logger.LogInformation("Getting usage stats for form: {FormId}", formConfigurationId);

            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;

            var submissions = await _context.FormSubmissions
                .Where(fs => fs.FormConfigurationId == formConfigurationId 
                    && fs.CreatedAt >= start 
                    && fs.CreatedAt <= end)
                .ToListAsync();

            var stats = new
            {
                formConfigurationId = formConfigurationId.ToString(),
                totalSubmissions = submissions.Count,
                uniqueUsers = submissions.Select(s => s.CreatedBy).Distinct().Count(),
                averageCompletionTime = 0, // Would calculate from submission data
                abandonmentRate = 0.0,
                conversionRate = submissions.Count > 0 ? submissions.Count(s => s.Status == "submitted") / (double)submissions.Count * 100 : 0,
                lightModeUsage = submissions.Count > 0 ? submissions.Count(s => s.IsLightMode) / (double)submissions.Count * 100 : 0,
                fieldAnalytics = new List<object>(),
                mostUsedFields = new List<string>(),
                leastUsedFields = new List<string>(),
                errorFrequency = new List<object>(),
                usageTrend = new List<object>(),
                deviceBreakdown = new { desktop = 70, mobile = 25, tablet = 5 },
                browserBreakdown = new Dictionary<string, int>()
            };

            _logger.LogInformation("Generated usage stats for form: {FormId} with {SubmissionCount} submissions", 
                formConfigurationId, submissions.Count);

            return stats;
        }

        // ==================== TEMPLATES ====================

        public async Task<List<object>> GetFormTemplatesAsync(string? category = null)
        {
            _logger.LogInformation("Getting form templates. Category: {Category}", category);

            // This would typically come from a templates table
            // For now, return some mock templates
            var templates = new List<object>
            {
                new
                {
                    id = "template-basic",
                    name = "Basic Request Form",
                    description = "Standard form for basic requirements",
                    category = "standard",
                    requirementType = "Kleinanforderung",
                    usageCount = 25,
                    isPublic = true
                },
                new
                {
                    id = "template-advanced",
                    name = "Advanced Request Form",
                    description = "Comprehensive form for complex requirements",
                    category = "advanced",
                    requirementType = "Großanforderung",
                    usageCount = 12,
                    isPublic = true
                }
            };

            var filteredTemplates = category == null ? templates : templates.Where(t => ((dynamic)t).category == category).ToList();

            _logger.LogInformation("Found {Count} form templates", filteredTemplates.Count);

            return filteredTemplates;
        }

        public async Task<FormConfiguration> CreateFormFromTemplateAsync(
            Guid templateId, 
            string name, 
            string requirementType, 
            Dictionary<string, object>? fieldMappings = null)
        {
            _logger.LogInformation("Creating form from template: {TemplateId}, name: {Name}, type: {RequirementType}", 
                templateId, name, requirementType);

            // Load template and create new form configuration
            // This is a simplified implementation
            var newConfig = new FormConfiguration
            {
                Id = Guid.NewGuid(),
                Name = name,
                RequirementType = requirementType,
                ConfigurationData = "{}",
                Version = 1,
                IsActive = true,
                HasLightMode = true,
                CreatedAt = DateTime.UtcNow,
                ModifiedAt = DateTime.UtcNow,
                CreatedBy = _currentUserService.GetCurrentUserName()
            };

            var createdConfig = await CreateFormConfigurationAsync(newConfig);

            _logger.LogInformation("Successfully created form from template: {FormId}", createdConfig.Id);

            return createdConfig;
        }

        // ==================== PERMISSIONS ====================

        public async Task<object> GetFormPermissionsAsync(Guid formConfigurationId, string currentUserId)
        {
            _logger.LogInformation("Getting form permissions for form: {FormId}, user: {UserId}", 
                formConfigurationId, currentUserId);

            var userRoles = _currentUserService.GetCurrentUserRoles();
            
            // This would typically check against the form's permission configuration
            // and the user's roles to determine what they can do
            var permissions = new
            {
                canView = true,
                canEdit = userRoles.Contains("Administrator") || userRoles.Contains("Manager"),
                canDeploy = userRoles.Contains("Administrator") || userRoles.Contains("Approver"),
                canDelete = userRoles.Contains("Administrator"),
                restrictedFields = new List<string>()
            };

            _logger.LogInformation("Generated permissions for form: {FormId}, user: {UserId}. CanEdit: {CanEdit}, CanDeploy: {CanDeploy}", 
                formConfigurationId, currentUserId, permissions.canEdit, permissions.canDeploy);

            return permissions;
        }

        // ==================== IMPORT/EXPORT ====================

        public async Task<byte[]> ExportFormConfigurationAsync(Guid formConfigurationId, string format)
        {
            _logger.LogInformation("Exporting form configuration: {FormId} in format: {Format}", 
                formConfigurationId, format);

            var config = await GetFormConfigurationByIdAsync(formConfigurationId, _currentUserService.GetCurrentUserId());
            if (config == null)
            {
                _logger.LogError("Form configuration not found for export: {FormId}", formConfigurationId);
                throw new InvalidOperationException("Form configuration not found");
            }

            if (format.ToLower() == "json")
            {
                var jsonString = JsonConvert.SerializeObject(config, Formatting.Indented);
                var bytes = System.Text.Encoding.UTF8.GetBytes(jsonString);
                
                _logger.LogInformation("Successfully exported form configuration: {FormId} as JSON ({ByteCount} bytes)", 
                    formConfigurationId, bytes.Length);
                
                return bytes;
            }
            else if (format.ToLower() == "excel")
            {
                // Would implement Excel export here
                _logger.LogError("Excel export not yet implemented for form: {FormId}", formConfigurationId);
                throw new NotImplementedException("Excel export not yet implemented");
            }

            _logger.LogError("Unsupported export format: {Format} for form: {FormId}", format, formConfigurationId);
            throw new ArgumentException($"Unsupported export format: {format}");
        }

        public async Task<object> ImportFormConfigurationAsync(Stream fileStream, bool overwriteExisting, bool validateOnly)
        {
            _logger.LogInformation("Importing form configurations. OverwriteExisting: {OverwriteExisting}, ValidateOnly: {ValidateOnly}", 
                overwriteExisting, validateOnly);

            var importedForms = new List<FormConfiguration>();
            var errors = new List<string>();

            try
            {
                using var reader = new StreamReader(fileStream);
                var content = await reader.ReadToEndAsync();
                
                var importedData = JsonConvert.DeserializeObject<FormConfiguration[]>(content);
                
                if (importedData == null)
                {
                    errors.Add("Invalid file format");
                    _logger.LogWarning("Import failed: Invalid file format");
                    return new { isSuccess = false, importedForms, errors };
                }

                foreach (var config in importedData)
                {
                    try
                    {
                        // Validate configuration
                        var validationResult = await ValidateFormConfigurationAsync(config.ConfigurationData);
                        if (!validationResult.IsValid)
                        {
                            var errorMessage = $"Validation failed for '{config.Name}': {string.Join(", ", validationResult.Errors.Select(e => e.Message))}";
                            errors.Add(errorMessage);
                            _logger.LogWarning("Import validation failed for form: {FormName}. Errors: {Errors}", 
                                config.Name, errorMessage);
                            continue;
                        }

                        if (!validateOnly)
                        {
                            // Check if exists
                            var existing = await _context.FormConfigurations
                                .FirstOrDefaultAsync(fc => fc.RequirementType == config.RequirementType && fc.Name == config.Name);

                            if (existing != null && !overwriteExisting)
                            {
                                var errorMessage = $"Form '{config.Name}' already exists for requirement type '{config.RequirementType}'";
                                errors.Add(errorMessage);
                                _logger.LogWarning("Import skipped existing form: {FormName}, RequirementType: {RequirementType}", 
                                    config.Name, config.RequirementType);
                                continue;
                            }

                            // Create or update
                            config.Id = Guid.NewGuid();
                            config.CreatedAt = DateTime.UtcNow;
                            config.ModifiedAt = DateTime.UtcNow;
                            config.CreatedBy = _currentUserService.GetCurrentUserName();

                            if (existing != null)
                            {
                                // Update existing
                                existing.ConfigurationData = config.ConfigurationData;
                                existing.ModifiedAt = DateTime.UtcNow;
                                existing.Version++;
                                importedForms.Add(existing);
                                
                                _logger.LogInformation("Updated existing form during import: {FormName}", config.Name);
                            }
                            else
                            {
                                // Create new
                                var created = await CreateFormConfigurationAsync(config);
                                importedForms.Add(created);
                                
                                _logger.LogInformation("Created new form during import: {FormName}", config.Name);
                            }
                        }
                        else
                        {
                            importedForms.Add(config);
                        }
                    }
                    catch (Exception ex)
                    {
                        var errorMessage = $"Error processing '{config.Name}': {ex.Message}";
                        errors.Add(errorMessage);
                        _logger.LogError(ex, "Error processing form during import: {FormName}", config.Name);
                    }
                }

                var result = new
                {
                    isSuccess = errors.Count == 0,
                    importedForms,
                    errors
                };

                _logger.LogInformation("Import completed. Success: {IsSuccess}, Imported: {ImportedCount}, Errors: {ErrorCount}", 
                    result.isSuccess, importedForms.Count, errors.Count);

                return result;
            }
            catch (Exception ex)
            {
                var errorMessage = $"Import failed: {ex.Message}";
                errors.Add(errorMessage);
                _logger.LogError(ex, "Import operation failed");
                return new { isSuccess = false, importedForms, errors };
            }
        }

        // ==================== HELPER METHODS ====================

        private string ApplyPermissionFiltering(string configurationData, List<string> userRoles)
        {
            try
            {
                var config = JsonConvert.DeserializeObject<dynamic>(configurationData);
                
                // Filter fields based on user roles
                if (config?.fields != null)
                {
                    var filteredFields = new List<dynamic>();
                    foreach (var field in config.fields)
                    {
                        var permissions = field.permissions;
                        if (permissions != null)
                        {
                            var allowedRoles = JsonConvert.DeserializeObject<List<string>>(permissions.allowedRoles?.ToString() ?? "[]");
                            var hideFromRoles = JsonConvert.DeserializeObject<List<string>>(permissions.hideFromRoles?.ToString() ?? "[]");
                            
                            // Check if user should see this field
                            var hasAllowedRole = allowedRoles.Count == 0 || allowedRoles.Any(role => userRoles.Contains(role));
                            var isHidden = hideFromRoles.Any(role => userRoles.Contains(role));
                            
                            if (hasAllowedRole && !isHidden)
                            {
                                // Check if field should be read-only
                                var readOnlyRoles = JsonConvert.DeserializeObject<List<string>>(permissions.readOnlyRoles?.ToString() ?? "[]");
                                if (readOnlyRoles.Any(role => userRoles.Contains(role)))
                                {
                                    field.disabled = true;
                                }
                                
                                filteredFields.Add(field);
                            }
                        }
                        else
                        {
                            filteredFields.Add(field);
                        }
                    }
                    config.fields = filteredFields;
                }

                return JsonConvert.SerializeObject(config);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to apply permission filtering, returning original configuration");
                return configurationData;
            }
        }

        private static bool IsValidEmail(string? email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        private static bool IsNumeric(string? value)
        {
            return double.TryParse(value, out _);
        }

        private static bool IsValidUrl(string? url)
        {
            return Uri.TryCreate(url, UriKind.Absolute, out _);
        }
    }

    // ====================================
    // CURRENT USER SERVICE IMPLEMENTATION
    // ====================================

    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<CurrentUserService> _logger;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor, ILogger<CurrentUserService> logger)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public string GetCurrentUserId()
        {
            var context = _httpContextAccessor.HttpContext;
            var userId = context?.User?.FindFirst("sub")?.Value 
                ?? context?.User?.FindFirst("id")?.Value 
                ?? context?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                ?? "unknown";

            _logger.LogDebug("Current user ID: {UserId}", userId);
            return userId;
        }

        public string GetCurrentUserName()
        {
            var context = _httpContextAccessor.HttpContext;
            var userName = context?.User?.FindFirst("name")?.Value 
                ?? context?.User?.FindFirst("username")?.Value 
                ?? context?.User?.Identity?.Name 
                ?? "Unknown User";

            _logger.LogDebug("Current user name: {UserName}", userName);
            return userName;
        }

        public List<string> GetCurrentUserRoles()
        {
            var context = _httpContextAccessor.HttpContext;
            var roles = context?.User?.FindAll("role")?.Select(c => c.Value).ToList() 
                ?? context?.User?.FindAll(System.Security.Claims.ClaimTypes.Role)?.Select(c => c.Value).ToList()
                ?? new List<string>();

            _logger.LogDebug("Current user roles: {Roles}", string.Join(", ", roles));
            return roles;
        }
    }
}
