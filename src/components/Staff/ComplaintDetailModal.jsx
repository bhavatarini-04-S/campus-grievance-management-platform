import React, { useState } from 'react';
import { Modal } from '../Base/Modal';
import { Button } from '../Base/Button';
import { StatusBadge } from '../CampusFix/StatusBadge';
import { PriorityBadge } from '../CampusFix/PriorityBadge';
import { SLATimer } from '../CampusFix/SLATimer';
import { SLAStateBadge } from '../CampusFix/SLAStateBadge';
import { EscalationBadge } from '../CampusFix/EscalationBadge';
import { ComplaintTimeline } from '../CampusFix/ComplaintTimeline';
import { Select } from '../Base/Forms';
import { ROLES, COMPLAINT_STATUS } from '../../services/workflowEngine';
import { getSLAState } from '../../services/slaConfig';
import { canAssignComplaint, getAssignableStaff } from '../../services/assignmentEngine';
import styles from './ComplaintDetailModal.module.css';

export function ComplaintDetailModal({
  isOpen,
  onClose,
  complaint,
  currentUser,
  activeRole,
  onAcknowledge,
  onStartProgress,
  onOpenResolveModal,
  onReopen,
  onAssignStaff
}) {
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [showReassignBox, setShowReassignBox] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenBox, setShowReopenBox] = useState(false);
  const [actionError, setActionError] = useState('');

  if (!complaint) return null;

  const currentSLAState = getSLAState(complaint.slaDeadline, complaint.status, complaint.resolution?.resolvedAt);

  // Privacy rules
  const canViewStudentIdentity = !complaint.isAnonymous || [ROLES.GRIEVANCE_OFFICER, ROLES.ADMIN].includes(activeRole);
  const canViewSensitiveDetails = !complaint.isSensitive || [ROLES.GRIEVANCE_OFFICER, ROLES.SUPERVISOR, ROLES.ADMIN].includes(activeRole) || (complaint.assignedStaff?.id === currentUser?.id);
  const canReassign = canAssignComplaint(activeRole, complaint.assignedStaff?.id, currentUser?.id);
  const canReopenComplaint = complaint.status === COMPLAINT_STATUS.RESOLVED && [ROLES.SUPERVISOR, ROLES.ADMIN, ROLES.GRIEVANCE_OFFICER].includes(activeRole);

  const assignableStaffList = getAssignableStaff(complaint.department, activeRole);

  const handleAcknowledge = () => {
    setActionError('');
    const res = onAcknowledge(complaint.id);
    if (!res.success) setActionError(res.error);
  };

  const handleStartProgress = () => {
    setActionError('');
    const res = onStartProgress(complaint.id);
    if (!res.success) setActionError(res.error);
  };

  const handleReopenSubmit = (e) => {
    e.preventDefault();
    if (!reopenReason.trim() || reopenReason.trim().length < 5) {
      setActionError('Please provide a descriptive reason for reopening (min 5 characters).');
      return;
    }
    const res = onReopen(complaint.id, reopenReason);
    if (res.success) {
      setShowReopenBox(false);
      setReopenReason('');
      setActionError('');
    } else {
      setActionError(res.error);
    }
  };

  const handleReassignSubmit = () => {
    if (!selectedStaffId) return;
    const target = assignableStaffList.find(s => s.id === selectedStaffId);
    if (target) {
      const res = onAssignStaff(complaint.id, target);
      if (res.success) {
        setShowReassignBox(false);
        setActionError('');
      } else {
        setActionError(res.error);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className={styles.modalHeaderTitle}>
          <span className={styles.ticketId}>{complaint.id}</span>
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} score={complaint.priorityScore} showScore={true} />
        </div>
      }
      footer={
        <div className={styles.footerContainer}>
          <div className={styles.footerLeft}>
            <span className={styles.userRoleNotice}>
              Acting as: <strong>{currentUser?.name}</strong> ({activeRole})
            </span>
          </div>
          <div className={styles.footerRight}>
            <Button variant="outline" onClick={onClose}>Close</Button>
            
            {/* Status Transition Action Buttons */}
            {complaint.status === COMPLAINT_STATUS.RECEIVED && activeRole !== ROLES.STUDENT && (
              <Button variant="primary" onClick={handleAcknowledge}>
                ✓ Acknowledge Complaint
              </Button>
            )}

            {complaint.status === COMPLAINT_STATUS.ACKNOWLEDGED && activeRole !== ROLES.STUDENT && (
              <Button variant="primary" onClick={handleStartProgress}>
                ⚡ Start Work (In Progress)
              </Button>
            )}

            {complaint.status === COMPLAINT_STATUS.IN_PROGRESS && activeRole !== ROLES.STUDENT && (
              <Button 
                variant="primary" 
                style={{ backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                onClick={() => onOpenResolveModal(complaint)}
              >
                🏁 Mark as Resolved
              </Button>
            )}

            {canReopenComplaint && !showReopenBox && (
              <Button variant="outline" onClick={() => setShowReopenBox(true)}>
                🔄 Reopen Complaint
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className={styles.detailContainer}>
        {actionError && (
          <div className={styles.errorBanner}>
            ⚠️ {actionError}
          </div>
        )}

        {/* Escalation Alert Banner if Breached or Escalated */}
        {complaint.escalationState === 'ESCALATED' && (
          <div className={styles.escalationBanner}>
            <div className={styles.escalationIcon}>🚨</div>
            <div className={styles.escalationText}>
              <strong>SLA Breached & Escalated to Supervisor</strong>
              <p>{complaint.escalationDetails?.reason || 'SLA deadline exceeded. Supervisor notified.'}</p>
              <span className={styles.escalatedTo}>
                Escalated To: <strong>{complaint.escalationDetails?.escalatedTo || 'Department Supervisor'}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Sensitive Grievance Notice */}
        {complaint.isSensitive && (
          <div className={styles.sensitiveBanner}>
            <span className={styles.sensitiveBadge}>🔒 CONFIDENTIAL GRIEVANCE</span>
            <p className={styles.sensitiveText}>
              This complaint is flagged as sensitive under campus protection policies.
              {!canViewSensitiveDetails && (
                <strong> Access to detailed description is restricted to Grievance Officers and authorized supervisors.</strong>
              )}
            </p>
          </div>
        )}

        {/* Header Summary Cards */}
        <div className={styles.gridSummary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Category & Department</span>
            <span className={styles.summaryVal}>{complaint.category} • {complaint.department}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Location</span>
            <span className={styles.summaryVal}>📍 {complaint.location}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>SLA Status & Deadline</span>
            <div className={styles.slaRow}>
              <SLATimer 
                deadline={complaint.slaDeadline} 
                status={complaint.status} 
                resolvedAt={complaint.resolution?.resolvedAt} 
              />
              <SLAStateBadge state={currentSLAState} />
            </div>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Escalation State</span>
            <EscalationBadge state={complaint.escalationState} />
          </div>
        </div>

        {/* Main Complaint Description */}
        <div className={styles.section}>
          <h3 className={styles.sectionHeader}>{complaint.title}</h3>
          <div className={styles.descriptionBox}>
            {canViewSensitiveDetails ? (
              <p className={styles.descText}>{complaint.description}</p>
            ) : (
              <p className={styles.redactedText}>
                [RESTRICTED CONTENT: You do not possess the GRIEVANCE_OFFICER or SUPERVISOR role required to read sensitive grievance text.]
              </p>
            )}
          </div>
        </div>

        {/* Priority Engine Explainability Breakdown */}
        <div className={styles.section}>
          <div className={styles.sectionHeaderWithAction}>
            <h4 className={styles.subTitle}>AI Priority Engine Evaluation</h4>
            <div className={styles.scorePill}>
              Score: <strong>{complaint.priorityScore} / 100</strong>
            </div>
          </div>
          <div className={styles.priorityBox}>
            <div className={styles.priorityMeta}>
              <span>Evaluated Priority: <strong>{complaint.priority}</strong></span>
              <span>Impact Level: <strong>{complaint.impact}</strong></span>
              <span>Community Support / Upvotes: <strong>{complaint.supportCount || 0} students</strong></span>
            </div>
            <div className={styles.reasonsList}>
              <span className={styles.reasonsTitle}>Explainable Scoring Factors:</span>
              <ul>
                {complaint.priorityReasons && complaint.priorityReasons.length > 0 ? (
                  complaint.priorityReasons.map((reason, idx) => (
                    <li key={idx} className={styles.reasonItem}>
                      <span className={styles.reasonBullet}>✓</span>
                      <span>{reason}</span>
                    </li>
                  ))
                ) : (
                  <li className={styles.reasonItem}>Standard ticket processing</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Duplicate / Cluster Information */}
        {complaint.clusterSize > 1 && (
          <div className={styles.section}>
            <h4 className={styles.subTitle}>Duplicate Cluster Intelligence</h4>
            <div className={styles.clusterBox}>
              <div className={styles.clusterBadge}>
                🔄 Cluster Size: {complaint.clusterSize} Reports Merged
              </div>
              <p className={styles.clusterDesc}>
                CampusFix AI clustered <strong>{complaint.clusterSize}</strong> related complaints reported around <em>{complaint.location}</em> to avoid redundant work.
              </p>
              {complaint.relatedComplaints && complaint.relatedComplaints.length > 0 && (
                <div className={styles.relatedTickets}>
                  Linked ticket IDs: {complaint.relatedComplaints.map(id => (
                    <span key={id} className={styles.linkedChip}>{id}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Student & Handler Information */}
        <div className={styles.twoColumn}>
          <div className={styles.infoCard}>
            <h4 className={styles.cardHeader}>Student Reporter Information</h4>
            {complaint.isAnonymous ? (
              <div className={styles.anonymousBox}>
                <span className={styles.anonIcon}>🕵️</span>
                <div>
                  <strong>Anonymous Student (Identity Protected)</strong>
                  <p className={styles.anonNote}>
                    {canViewStudentIdentity ? (
                      <span className={styles.unmaskedIdentity}>
                        [Officer Unmask]: {complaint.student?.name} ({complaint.student?.email}) - {complaint.student?.room}
                      </span>
                    ) : (
                      'Personal identification is hidden in accordance with campus grievance privacy rules.'
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className={styles.metaDataList}>
                <div className={styles.dataRow}>
                  <span className={styles.metaLabel}>Name:</span>
                  <span className={styles.metaVal}>{complaint.student?.name}</span>
                </div>
                <div className={styles.dataRow}>
                  <span className={styles.metaLabel}>Email:</span>
                  <span className={styles.metaVal}>{complaint.student?.email}</span>
                </div>
                <div className={styles.dataRow}>
                  <span className={styles.metaLabel}>Room / Dept:</span>
                  <span className={styles.metaVal}>{complaint.student?.room}</span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.infoCard}>
            <div className={styles.cardHeaderWithAction}>
              <h4 className={styles.cardHeader}>Assigned Staff Handler</h4>
              {canReassign && (
                <button 
                  className={styles.smallActionBtn}
                  onClick={() => setShowReassignBox(!showReassignBox)}
                >
                  {showReassignBox ? 'Cancel' : 'Change Assignment'}
                </button>
              )}
            </div>

            {showReassignBox ? (
              <div className={styles.reassignForm}>
                <Select
                  label="Select Staff Member"
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  options={[
                    { value: '', label: '-- Choose staff member --' },
                    ...assignableStaffList.map(s => ({
                      value: s.id,
                      label: `${s.name} (${s.department} - ${s.title})`
                    }))
                  ]}
                />
                <Button 
                  variant="primary" 
                  onClick={handleReassignSubmit} 
                  disabled={!selectedStaffId}
                  style={{ marginTop: 'var(--spacing-xs)' }}
                >
                  Confirm Reassignment
                </Button>
              </div>
            ) : complaint.assignedStaff ? (
              <div className={styles.metaDataList}>
                <div className={styles.dataRow}>
                  <span className={styles.metaLabel}>Staff Name:</span>
                  <span className={styles.metaVal}><strong>{complaint.assignedStaff.name}</strong></span>
                </div>
                <div className={styles.dataRow}>
                  <span className={styles.metaLabel}>Title / Dept:</span>
                  <span className={styles.metaVal}>{complaint.assignedStaff.title || complaint.assignedStaff.role} ({complaint.assignedStaff.department})</span>
                </div>
                <div className={styles.dataRow}>
                  <span className={styles.metaLabel}>Contact:</span>
                  <span className={styles.metaVal}>{complaint.assignedStaff.email}</span>
                </div>
              </div>
            ) : (
              <div className={styles.unassignedBox}>
                <span className={styles.unassignedText}>Currently unassigned.</span>
                {canReassign && (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowReassignBox(true)}
                    style={{ marginTop: 'var(--spacing-xs)' }}
                  >
                    Assign Staff Now
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Resolution Details (if resolved) */}
        {complaint.resolution && (
          <div className={styles.resolutionContainer}>
            <div className={styles.resolutionHeader}>
              <span className={styles.resolutionIcon}>✓</span>
              <h4>Resolution Record</h4>
              <span className={styles.resolvedDate}>
                {new Date(complaint.resolution.resolvedAt).toLocaleString()}
              </span>
            </div>
            <div className={styles.resolutionBody}>
              <p className={styles.resolutionNote}>{complaint.resolution.note}</p>
              <div className={styles.resolvedByRow}>
                <span>Resolved By: <strong>{complaint.resolution.resolvedBy?.name}</strong> ({complaint.resolution.resolvedBy?.role})</span>
                {complaint.resolution.attachment && (
                  <span className={styles.attachmentPill}>
                    📎 {complaint.resolution.attachment.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reopen Box (if Supervisor/Admin chooses to reopen) */}
        {showReopenBox && (
          <div className={styles.reopenContainer}>
            <h4 className={styles.reopenTitle}>Reopen Resolved Complaint</h4>
            <p className={styles.reopenDesc}>
              Reopening will return this complaint to IN_PROGRESS. Please provide an explicit reason for reopening.
            </p>
            <textarea
              className={styles.reopenTextarea}
              placeholder="State reason why student or supervisor requested reopening..."
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              rows={3}
            />
            <div className={styles.reopenActions}>
              <Button variant="ghost" onClick={() => setShowReopenBox(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleReopenSubmit}>Confirm Reopening</Button>
            </div>
          </div>
        )}

        {/* Audit Timeline */}
        <div className={styles.section}>
          <h4 className={styles.subTitle}>Audit Trail & Lifecycle Timeline</h4>
          <div className={styles.timelineWrapper}>
            <ComplaintTimeline events={complaint.timeline || []} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
