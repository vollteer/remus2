// src/routes/requirements/[id]/index.tsx
import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { useParams, Link } from '@builder.io/qwik-city';
import { MockApiService } from '../../../services/mock-service';

interface Requirement {
  id: string;
  requirementNumber: string;
  title: string;
  description: string;
  requirementType: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Draft' | 'Submitted' | 'InProgress' | 'Completed' | 'Rejected' | 'OnHold';
  requestedBy: string;
  businessOwner?: string;
  technicalOwner?: string;
  department?: string;
  estimatedCost?: number;
  approvedBudget?: number;
  actualCost?: number;
  currency: string;
  requestedDate: string;
  requiredByDate?: string;
  startDate?: string;
  completedDate?: string;
  currentWorkflowStep?: string;
  currentAssignee?: string;
  currentStepDueDate?: string;
  attachmentCount: number;
  commentCount: number;
  workflowName?: string;
  formName?: string;
  hasPersonalData: boolean;
  securityClassification: string;
  formData?: any;
}

interface WorkflowStep {
  id: string;
  name: string;
  order: number;
  status: 'completed' | 'current' | 'pending' | 'skipped';
  assignedTo?: string;
  completedAt?: string;
  dueDate?: string;
  comments?: string;
}

interface RequirementComment {
  id: string;
  comment: string;
  commentType: 'General' | 'StatusChange' | 'Approval' | 'Technical';
  workflowStep?: string;
  createdBy: string;
  createdAt: string;
  isInternal: boolean;
}

interface RequirementAttachment {
  id: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  description?: string;
  category: string;
  uploadedBy: string;
  createdAt: string;
}

export default component$(() => {
  const params = useParams();
  const requirementId = params.id;

  // State
  const requirement = useSignal<Requirement | null>(null);
  const workflowSteps = useSignal<WorkflowStep[]>([]);
  const comments = useSignal<RequirementComment[]>([]);
  const attachments = useSignal<RequirementAttachment[]>([]);
  const loading = useSignal(true);
  const activeTab = useSignal<'overview' | 'workflow' | 'comments' | 'attachments' | 'history'>('overview');
  const showFormData = useSignal(false);
  const newComment = useSignal('');
  const isAddingComment = useSignal(false);

  // Load data using your existing service pattern
  useTask$(async () => {
    loading.value = true;
    
    try {
      // Using the same pattern as your dashboard
      const req = await MockApiService.getRequirement(requirementId);
      const steps = await MockApiService.getRequirementWorkflow(requirementId);
      const commentsList = await MockApiService.getRequirementComments(requirementId);
      const attachmentsList = await MockApiService.getRequirementAttachments(requirementId);
      
      requirement.value = req;
      workflowSteps.value = steps;
      comments.value = commentsList;
      attachments.value = attachmentsList;
    } catch (error) {
      console.error('Error loading requirement:', error);
    } finally {
      loading.value = false;
    }
  });

  const addComment = $(async () => {
    if (!newComment.value.trim()) return;
    
    isAddingComment.value = true;
    
    try {
      const comment = await MockApiService.addRequirementComment(requirementId, {
        comment: newComment.value,
        commentType: 'General',
        workflowStep: requirement.value?.currentWorkflowStep
      });
      
      comments.value = [comment, ...comments.value];
      newComment.value = '';
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      isAddingComment.value = false;
    }
  });

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPriorityGradient = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)';
      case 'High': return 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
      case 'Medium': return 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)';
      case 'Low': return 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return '#6b7280';
      case 'Submitted': return '#3b82f6';
      case 'InProgress': return '#f59e0b';
      case 'Completed': return '#10b981';
      case 'Rejected': return '#ef4444';
      case 'OnHold': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'current': return '🔄';
      case 'pending': return '⏳';
      case 'skipped': return '⏭️';
      default: return '⭕';
    }
  };

  if (loading.value) {
    return (
      <div class="animate-fade-in">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-primary mb-2">Anforderung wird geladen...</h1>
            <p class="text-secondary">Einen Moment bitte</p>
          </div>
        </div>

        <div class="stats-grid mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} class="stat-card">
              <div class="animate-pulse">
                <div style="height: 60px; background: #f1f5f9; border-radius: 8px; margin-bottom: 1rem;"></div>
                <div style="height: 20px; background: #f1f5f9; border-radius: 4px; margin-bottom: 0.5rem;"></div>
                <div style="height: 16px; background: #f1f5f9; border-radius: 4px; width: 60%;"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!requirement.value) {
    return (
      <div class="animate-fade-in">
        <div class="text-center py-12">
          <div class="text-4xl mb-4">❌</div>
          <h1 class="text-2xl font-bold text-primary mb-2">Anforderung nicht gefunden</h1>
          <p class="text-secondary mb-4">Die angeforderte Anforderung konnte nicht geladen werden.</p>
          <Link href="/requirements" class="btn btn-primary">Zurück zur Übersicht</Link>
        </div>
      </div>
    );
  }

  return (
    <div class="animate-fade-in">
      {/* Header - matching your dashboard style */}
      <div class="flex justify-between items-center mb-8">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <Link href="/requirements" class="text-primary hover:underline">
              ← Anforderungen
            </Link>
            <span class="text-secondary">/</span>
            <span class="text-secondary font-mono text-sm">{requirement.value.requirementNumber}</span>
          </div>
          <h1 class="text-primary mb-2">{requirement.value.title}</h1>
          <p class="text-secondary">{requirement.value.description}</p>
        </div>
        
        <div class="flex gap-3">
          <Link href={`/requirements/${requirementId}/edit`} class="btn btn-secondary">
            ✏️ Bearbeiten
          </Link>
          <button class="btn btn-primary">
            📊 Export
          </button>
        </div>
      </div>

      {/* Stats Cards - matching your dashboard stats style */}
      <div class="stats-grid mb-8">
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-secondary mb-1">Priorität</p>
              <p class="text-3xl font-bold text-primary">{requirement.value.priority}</p>
              <p class="text-xs text-secondary mt-1">{requirement.value.requirementType}</p>
            </div>
            <div class="stat-icon" style={`background: ${getPriorityGradient(requirement.value.priority)};`}>
              🎯
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-secondary mb-1">Status</p>
              <p class="text-3xl font-bold" style={`color: ${getStatusColor(requirement.value.status)}`}>
                {requirement.value.status}
              </p>
              <p class="text-xs text-secondary mt-1">{requirement.value.currentWorkflowStep}</p>
            </div>
            <div class="stat-icon" style={`background: linear-gradient(135deg, ${getStatusColor(requirement.value.status)} 0%, ${getStatusColor(requirement.value.status)}88 100%);`}>
              🔄
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-secondary mb-1">Budget</p>
              <p class="text-3xl font-bold text-success">{formatCurrency(requirement.value.approvedBudget)}</p>
              <p class="text-xs text-secondary mt-1">Verbraucht: {formatCurrency(requirement.value.actualCost)}</p>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%);">
              💰
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-secondary mb-1">Fällig am</p>
              <p class="text-2xl font-bold text-warning">{formatDate(requirement.value.currentStepDueDate)}</p>
              <p class="text-xs text-secondary mt-1">Aktueller Schritt</p>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);">
              📅
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div class="tab-navigation mb-6">
        {['overview', 'workflow', 'comments', 'attachments', 'history'].map((tab) => (
          <button
            key={tab}
            class={`tab-button ${activeTab.value === tab ? 'active' : ''}`}
            onClick$={() => activeTab.value = tab as any}
          >
            {tab === 'overview' && '📋 Übersicht'}
            {tab === 'workflow' && '🔄 Workflow'}
            {tab === 'comments' && `💬 Kommentare (${comments.value.length})`}
            {tab === 'attachments' && `📎 Anhänge (${attachments.value.length})`}
            {tab === 'history' && '📜 Historie'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab.value === 'overview' && (
        <div class="grid-2 gap-6">
          {/* Main Content */}
          <div class="space-y-6">
            <div class="card">
              <div class="card-header">
                <h3>Beschreibung</h3>
              </div>
              <div class="card-content">
                <p class="text-secondary">{requirement.value.description}</p>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <h3>Formular-Daten</h3>
                <button 
                  class="btn btn-secondary btn-sm"
                  onClick$={() => showFormData.value = !showFormData.value}
                >
                  {showFormData.value ? 'Ausblenden' : 'Anzeigen'}
                </button>
              </div>
              {showFormData.value && requirement.value.formData && (
                <div class="card-content">
                  <pre class="form-data-preview">
                    {JSON.stringify(requirement.value.formData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div class="space-y-6">
            <div class="card">
              <div class="card-header">
                <h3>Details</h3>
              </div>
              <div class="card-content">
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">Anforderungs-Nr.</span>
                    <span class="detail-value font-mono">{requirement.value.requirementNumber}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Typ</span>
                    <span class="detail-value">{requirement.value.requirementType}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Angefordert von</span>
                    <span class="detail-value">{requirement.value.requestedBy}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Fachverantwortlich</span>
                    <span class="detail-value">{requirement.value.businessOwner || '-'}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Technisch verantwortlich</span>
                    <span class="detail-value">{requirement.value.technicalOwner || '-'}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Abteilung</span>
                    <span class="detail-value">{requirement.value.department || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <h3>Termine</h3>
              </div>
              <div class="card-content">
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">Angefordert am</span>
                    <span class="detail-value">{formatDate(requirement.value.requestedDate)}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Benötigt bis</span>
                    <span class="detail-value">{formatDate(requirement.value.requiredByDate)}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Gestartet am</span>
                    <span class="detail-value">{formatDate(requirement.value.startDate)}</span>
                  </div>
                  {requirement.value.completedDate && (
                    <div class="detail-item">
                      <span class="detail-label">Abgeschlossen am</span>
                      <span class="detail-value">{formatDate(requirement.value.completedDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {(requirement.value.hasPersonalData || requirement.value.securityClassification !== 'Public') && (
              <div class="card security-card">
                <div class="card-header">
                  <h3>Sicherheit & Compliance</h3>
                </div>
                <div class="card-content">
                  <div class="space-y-3">
                    {requirement.value.hasPersonalData && (
                      <div class="security-badge">
                        🔒 DSGVO relevant
                      </div>
                    )}
                    <div class="detail-item">
                      <span class="detail-label">Klassifizierung</span>
                      <span class="detail-value">{requirement.value.securityClassification}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab.value === 'workflow' && (
        <div class="card">
          <div class="card-header">
            <h3>Workflow-Fortschritt</h3>
          </div>
          <div class="card-content">
            <div class="workflow-steps">
              {workflowSteps.value.map((step, index) => (
                <div key={step.id} class={`workflow-step ${step.status}`}>
                  <div class="workflow-icon">
                    {getStepIcon(step.status)}
                  </div>
                  <div class="workflow-content">
                    <div class="workflow-header">
                      <h4 class="workflow-title">
                        {step.order}. {step.name}
                      </h4>
                      <span class={`workflow-status ${step.status}`}>
                        {step.status === 'completed' ? 'Abgeschlossen' :
                         step.status === 'current' ? 'Aktuell' : 'Ausstehend'}
                      </span>
                    </div>
                    <div class="workflow-meta">
                      {step.assignedTo && <span>Zuständig: {step.assignedTo}</span>}
                      {step.completedAt && <span> • Abgeschlossen: {formatDate(step.completedAt)}</span>}
                      {step.dueDate && !step.completedAt && <span> • Fällig: {formatDate(step.dueDate)}</span>}
                    </div>
                    {step.comments && (
                      <p class="workflow-comment">"{step.comments}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab.value === 'comments' && (
        <div class="space-y-6">
          {/* Add Comment */}
          <div class="card">
            <div class="card-header">
              <h3>Neuen Kommentar hinzufügen</h3>
            </div>
            <div class="card-content">
              <div class="comment-form">
                <textarea
                  class="comment-textarea"
                  rows={3}
                  placeholder="Kommentar eingeben..."
                  value={newComment.value}
                  onInput$={(e) => newComment.value = (e.target as HTMLTextAreaElement).value}
                />
                <div class="comment-actions">
                  <button 
                    class="btn btn-primary"
                    disabled={!newComment.value.trim() || isAddingComment.value}
                    onClick$={addComment}
                  >
                    {isAddingComment.value ? '💫 Wird hinzugefügt...' : '💬 Kommentar hinzufügen'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div class="comments-list">
            {comments.value.map((comment) => (
              <div key={comment.id} class="card comment-card">
                <div class="comment-header">
                  <div class="activity-avatar">
                    {comment.createdBy.charAt(0).toUpperCase()}
                  </div>
                  <div class="comment-meta">
                    <p class="comment-author">{comment.createdBy}</p>
                    <p class="comment-date">
                      {formatDate(comment.createdAt)} 
                      {comment.workflowStep && ` • ${comment.workflowStep}`}
                    </p>
                  </div>
                  <span class={`comment-type ${comment.commentType.toLowerCase()}`}>
                    {comment.commentType}
                  </span>
                </div>
                <div class="comment-content">
                  <p>{comment.comment}</p>
                  {comment.isInternal && (
                    <span class="internal-badge">
                      Interner Kommentar
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab.value === 'attachments' && (
        <div class="space-y-6">
          {/* Upload Area */}
          <div class="card upload-card">
            <div class="upload-content">
              <div class="upload-icon">📎</div>
              <h3>Dateien hochladen</h3>
              <p class="text-secondary">Ziehen Sie Dateien hierher oder klicken Sie zum Auswählen</p>
              <button class="btn btn-primary">Dateien auswählen</button>
            </div>
          </div>

          {/* Attachments List */}
          <div class="card">
            <div class="card-header">
              <h3>Anhänge ({attachments.value.length})</h3>
            </div>
            <div class="card-content">
              {attachments.value.length === 0 ? (
                <p class="text-secondary">Noch keine Anhänge vorhanden.</p>
              ) : (
                <div class="attachments-list">
                  {attachments.value.map((attachment) => (
                    <div key={attachment.id} class="attachment-item">
                      <div class="attachment-icon">
                        {attachment.category === 'Image' ? '🖼️' :
                         attachment.category === 'Document' ? '📄' :
                         attachment.category === 'Technical' ? '⚙️' :
                         attachment.category === 'Specification' ? '📋' : '📁'}
                      </div>
                      <div class="attachment-info">
                        <p class="attachment-name">{attachment.originalFileName}</p>
                        <p class="attachment-meta">
                          {formatFileSize(attachment.fileSize)} • 
                          {attachment.category} • 
                          von {attachment.uploadedBy} • 
                          {formatDate(attachment.createdAt)}
                        </p>
                        {attachment.description && (
                          <p class="attachment-description">{attachment.description}</p>
                        )}
                      </div>
                      <div class="attachment-actions">
                        <button class="btn btn-secondary btn-sm">
                          👁️ Anzeigen
                        </button>
                        <button class="btn btn-secondary btn-sm">
                          ⬇️ Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab.value === 'history' && (
        <div class="card">
          <div class="card-header">
            <h3>Änderungshistorie</h3>
          </div>
          <div class="card-content">
            <div class="history-timeline">
              <div class="timeline-item">
                <div class="timeline-marker status-change"></div>
                <div class="timeline-content">
                  <p class="timeline-title">Status geändert zu "InProgress"</p>
                  <p class="timeline-meta">von system am {formatDate('2025-02-16')}</p>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-marker created"></div>
                <div class="timeline-content">
                  <p class="timeline-title">Anforderung erstellt</p>
                  <p class="timeline-meta">von {requirement.value.requestedBy} am {formatDate(requirement.value.requestedDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Your existing stat-icon and activity styles plus new ones */
        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .activity-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .tab-navigation {
          display: flex;
          border-bottom: 2px solid var(--border-color);
          gap: 2rem;
        }
        
        .tab-button {
          padding: 0.75rem 0;
          border: none;
          background: none;
          font-weight: 500;
          color: var(--secondary-color);
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .tab-button:hover {
          color: var(--primary-color);
        }
        
        .tab-button.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }
        
        .detail-grid {
          display: grid;
          gap: 1rem;
        }
        
        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border-color);
        }
        
        .detail-item:last-child {
          border-bottom: none;
        }
        
        .detail-label {
          font-size: 0.875rem;
          color: var(--secondary-color);
          font-weight: 500;
        }
        
        .detail-value {
          font-size: 0.875rem;
          color: var(--text-color);
          text-align: right;
        }
        
        .security-card {
          border: 2px solid #f59e0b;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(251, 191, 36, 0.05) 100%);
        }
        
        .security-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .workflow-steps {
          display: grid;
          gap: 1rem;
        }
        
        .workflow-step {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid var(--border-color);
          transition: all 0.2s ease;
        }
        
        .workflow-step:hover {
          background: var(--background-color);
        }
        
        .workflow-step.current {
          border-color: var(--primary-color);
          background: rgba(59, 130, 246, 0.05);
        }
        
        .workflow-icon {
          font-size: 1.5rem;
          line-height: 1;
        }
        
        .workflow-content {
          flex: 1;
        }
        
        .workflow-header {
          display: flex;
          justify-content: between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .workflow-title {
          font-weight: 600;
          color: var(--text-color);
          margin: 0;
        }
        
        .workflow-step.current .workflow-title {
          color: var(--primary-color);
        }
        
        .workflow-status {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .workflow-status.completed {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }
        
        .workflow-status.current {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }
        
        .workflow-status.pending {
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
        }
        
        .workflow-meta {
          font-size: 0.875rem;
          color: var(--secondary-color);
          margin-bottom: 0.5rem;
        }
        
        .workflow-comment {
          font-style: italic;
          color: var(--secondary-color);
          font-size: 0.875rem;
          margin: 0;
        }
        
        .comment-form {
          display: grid;
          gap: 1rem;
        }
        
        .comment-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          resize: none;
          font-family: inherit;
        }
        
        .comment-actions {
          display: flex;
          justify-content: flex-end;
        }
        
        .comments-list {
          display: grid;
          gap: 1rem;
        }
        
        .comment-card {
          padding: 1rem;
        }
        
        .comment-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .comment-meta {
          flex: 1;
        }
        
        .comment-author {
          font-weight: 600;
          margin: 0;
        }
        
        .comment-date {
          font-size: 0.875rem;
          color: var(--secondary-color);
          margin: 0;
        }
        
        .comment-type {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .comment-type.technical {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }
        
        .comment-type.general {
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
        }
        
        .comment-content p {
          margin: 0;
        }
        
        .internal-badge {
          display: inline-block;
          margin-top: 0.5rem;
          padding: 0.25rem 0.75rem;
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          border-radius: 1rem;
          font-size: 0.75rem;
        }
        
        .upload-card {
          border: 2px dashed var(--border-color);
          text-align: center;
        }
        
        .upload-content {
          padding: 3rem 1rem;
        }
        
        .upload-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .upload-content h3 {
          margin: 0 0 0.5rem 0;
        }
        
        .upload-content p {
          margin: 0 0 1.5rem 0;
        }
        
        .attachments-list {
          display: grid;
          gap: 1rem;
        }
        
        .attachment-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
        }
        
        .attachment-icon {
          font-size: 1.5rem;
        }
        
        .attachment-info {
          flex: 1;
        }
        
        .attachment-name {
          font-weight: 600;
          margin: 0 0 0.25rem 0;
        }
        
        .attachment-meta {
          font-size: 0.875rem;
          color: var(--secondary-color);
          margin: 0;
        }
        
        .attachment-description {
          font-size: 0.875rem;
          color: var(--text-color);
          margin: 0.25rem 0 0 0;
        }
        
        .attachment-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .history-timeline {
          position: relative;
          padding-left: 2rem;
        }
        
        .timeline-item {
          position: relative;
          padding-bottom: 2rem;
        }
        
        .timeline-item:not(:last-child)::before {
          content: '';
          position: absolute;
          left: -1.5rem;
          top: 1.5rem;
          bottom: -0.5rem;
          width: 2px;
          background: var(--border-color);
        }
        
        .timeline-marker {
          position: absolute;
          left: -2rem;
          top: 0.25rem;
          width: 1rem;
          height: 1rem;
          border-radius: 50%;
          border: 2px solid var(--background-color);
        }
        
        .timeline-marker.status-change {
          background: #3b82f6;
        }
        
        .timeline-marker.created {
          background: #10b981;
        }
        
        .timeline-title {
          font-weight: 600;
          margin: 0 0 0.25rem 0;
        }
        
        .timeline-meta {
          font-size: 0.875rem;
          color: var(--secondary-color);
          margin: 0;
        }
        
        .form-data-preview {
          background: var(--background-color);
          padding: 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          overflow-x: auto;
        }
        
        .space-y-6 > * + * {
          margin-top: 1.5rem;
        }
        
        .space-y-3 > * + * {
          margin-top: 0.75rem;
        }
      `}</style>
    </div>
  );
});
