/**
 * CampusFix AI SLA Configuration & Calculation Engine
 * Single source of truth for SLA targets, deadline calculations,
 * and state evaluations based on actual timestamps.
 */

export const SLA_TARGETS_HOURS = {
  CRITICAL: 2,   // 2 hours
  HIGH: 6,       // 6 hours
  MEDIUM: 24,    // 24 hours
  LOW: 48        // 48 hours
};

export const SLA_STATES = {
  ON_TRACK: 'On Track',
  AT_RISK: 'At Risk',
  SLA_BREACHED: 'SLA Breached',
  RESOLVED: 'Resolved'
};

/**
 * Gets the SLA target in hours for a given priority.
 * @param {string} priority 
 * @returns {number} Hours
 */
export function getSLATargetHours(priority = 'MEDIUM') {
  return SLA_TARGETS_HOURS[priority?.toUpperCase()] || SLA_TARGETS_HOURS.MEDIUM;
}

/**
 * Calculates the SLA deadline ISO string based on creation time and priority.
 * @param {string|number|Date} createdAt 
 * @param {string} priority 
 * @returns {string} ISO Date string of SLA deadline
 */
export function calculateSLADeadline(createdAt = new Date(), priority = 'MEDIUM') {
  const start = new Date(createdAt).getTime();
  const hours = getSLATargetHours(priority);
  const deadlineTime = start + (hours * 60 * 60 * 1000);
  return new Date(deadlineTime).toISOString();
}

/**
 * Evaluates current SLA state based on deadline, status, and resolution timestamp.
 * @param {string|number|Date} slaDeadline 
 * @param {string} status 
 * @param {string|number|Date} [resolvedAt] 
 * @returns {'On Track' | 'At Risk' | 'SLA Breached' | 'Resolved'}
 */
export function getSLAState(slaDeadline, status, _resolvedAt = null) {
  if (status === 'RESOLVED') {
    return SLA_STATES.RESOLVED;
  }

  if (!slaDeadline) return SLA_STATES.ON_TRACK;

  const now = Date.now();
  const deadline = new Date(slaDeadline).getTime();
  const diff = deadline - now;

  // Deadline has passed
  if (diff < 0) {
    return SLA_STATES.SLA_BREACHED;
  }

  // At Risk if less than 2 hours remaining, or less than 25% of a 2h critical window (30 mins)
  if (diff <= 2 * 60 * 60 * 1000) {
    return SLA_STATES.AT_RISK;
  }

  return SLA_STATES.ON_TRACK;
}

/**
 * Formats the SLA countdown / status for display.
 * @param {string|number|Date} slaDeadline 
 * @param {string} status 
 * @param {string|number|Date} [_resolvedAt] 
 * @returns {string} e.g. "1h 32m remaining", "2h 10m overdue", "Resolved"
 */
export function formatSLACountdown(slaDeadline, status, _resolvedAt = null) {
  if (status === 'RESOLVED') {
    return 'Resolved';
  }

  if (!slaDeadline) return 'No SLA';

  const now = Date.now();
  const deadline = new Date(slaDeadline).getTime();
  const diff = deadline - now;

  if (diff < 0) {
    // Overdue
    const overdueMs = Math.abs(diff);
    let hours = Math.floor(overdueMs / (1000 * 60 * 60));
    let minutes = Math.round((overdueMs % (1000 * 60 * 60)) / (1000 * 60));

    if (minutes === 60) {
      hours += 1;
      minutes = 0;
    }

    if (hours === 0 && minutes === 0) {
      return 'Just overdue';
    }
    if (hours === 0) {
      return `${minutes}m overdue`;
    }
    return `${hours}h ${minutes}m overdue`;
  }

  // Remaining
  let remainingHours = Math.floor(diff / (1000 * 60 * 60));
  let remainingMinutes = Math.round((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (remainingMinutes === 60) {
    remainingHours += 1;
    remainingMinutes = 0;
  }

  if (remainingHours > 24) {
    const days = Math.floor(remainingHours / 24);
    const remH = remainingHours % 24;
    return `Due in ${days}d ${remH}h`;
  }

  if (remainingHours >= 5 && remainingMinutes === 0) {
    return `Due in ${remainingHours}h`;
  }

  if (remainingHours === 0) {
    return `${remainingMinutes}m remaining`;
  }

  return `${remainingHours}h ${remainingMinutes}m remaining`;
}
