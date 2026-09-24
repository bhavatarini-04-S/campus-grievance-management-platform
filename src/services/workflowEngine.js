/**
 * CampusFix AI Status & Workflow Engine
 * Enforces strictly valid state transitions, validations,
 * role authorization, and audit log generation.
 */

export const COMPLAINT_STATUS = {
  RECEIVED: 'RECEIVED',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  SLA_BREACHED: 'SLA_BREACHED'
};

export const ROLES = {
  STUDENT: 'STUDENT',
  STAFF: 'STAFF',
  SUPERVISOR: 'SUPERVISOR',
  ADMIN: 'ADMIN',
  GRIEVANCE_OFFICER: 'GRIEVANCE_OFFICER'
};

// Allowed forward transitions
export const ALLOWED_TRANSITIONS = {
  RECEIVED: ['ACKNOWLEDGED'],
  ACKNOWLEDGED: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['IN_PROGRESS'] // Controlled explicit reopen only
};

/**
 * Checks if a status transition is permitted from current status to next status.
 * @param {string} currentStatus 
 * @param {string} nextStatus 
 * @param {string} userRole 
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function canTransitionStatus(currentStatus, nextStatus, userRole = ROLES.STAFF) {
  // Prevent transitions if same
  if (currentStatus === nextStatus) {
    return { allowed: false, reason: `Complaint is already in ${currentStatus} state.` };
  }

  // Prevent silent reversion from RESOLVED to RECEIVED
  if (currentStatus === COMPLAINT_STATUS.RESOLVED && nextStatus === COMPLAINT_STATUS.RECEIVED) {
    return { 
      allowed: false, 
      reason: 'Resolved complaints cannot be reverted to Received. If work is still needed, reopen to In Progress.' 
    };
  }

  // Reopening a resolved complaint requires SUPERVISOR, ADMIN, or GRIEVANCE_OFFICER
  if (currentStatus === COMPLAINT_STATUS.RESOLVED && nextStatus === COMPLAINT_STATUS.IN_PROGRESS) {
    const isAuthorized = [ROLES.SUPERVISOR, ROLES.ADMIN, ROLES.GRIEVANCE_OFFICER].includes(userRole);
    if (!isAuthorized) {
      return { 
        allowed: false, 
        reason: 'Only Supervisors, Grievance Officers, or Admins have permission to reopen a resolved complaint.' 
      };
    }
    return { allowed: true };
  }

  // General forward transitions
  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(nextStatus)) {
    return { 
      allowed: false, 
      reason: `Illegal transition: Cannot transition directly from ${currentStatus} to ${nextStatus}.` 
    };
  }

  // Role checks for normal workflow
  if (userRole === ROLES.STUDENT) {
    return { allowed: false, reason: 'Students cannot alter staff complaint workflow states.' };
  }

  return { allowed: true };
}

/**
 * Validates resolution data before marking a complaint as RESOLVED.
 * @param {Object} resolutionData 
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateResolution(resolutionData) {
  const errors = [];

  if (!resolutionData) {
    return { valid: false, errors: ['Resolution information is mandatory.'] };
  }

  if (!resolutionData.note || resolutionData.note.trim().length < 5) {
    errors.push('A descriptive resolution note (minimum 5 characters) is required.');
  }

  if (!resolutionData.resolvedBy || !resolutionData.resolvedBy.name) {
    errors.push('Resolving staff identifier is required.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Creates an audit timeline entry for any workflow event.
 * @param {Object} params
 * @returns {Object} Timeline event item
 */
export function createAuditEvent({
  action,
  title,
  description = '',
  author = 'System',
  role = 'SYSTEM',
  metadata = {}
}) {
  return {
    id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action,
    title,
    description,
    author,
    role,
    timestamp: new Date().toISOString(),
    metadata
  };
}
