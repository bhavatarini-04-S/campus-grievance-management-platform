/**
 * CampusFix AI Escalation Engine
 * Handles SLA breach detection, supervisor escalation assignment,
 * notification generation, and escalation audit records.
 */

export const ESCALATION_STATES = {
  NONE: 'NONE',
  AT_RISK: 'AT_RISK',
  ESCALATED: 'ESCALATED',
  RESOLVED_AFTER_ESCALATION: 'RESOLVED_AFTER_ESCALATION'
};

// Department supervisor mapping for automated escalation
export const DEPARTMENT_SUPERVISORS = {
  'Safety & Security': {
    name: 'Col. V. Raghavan',
    title: 'Chief Security Officer',
    department: 'Safety & Security',
    email: 'cso@campus.edu'
  },
  'Electrical': {
    name: 'Dr. K. Sharma',
    title: 'Executive Engineer (Electrical)',
    department: 'Estate Maintenance',
    email: 'ee.elec@campus.edu'
  },
  'Plumbing': {
    name: 'Er. Rajesh Bansal',
    title: 'Superintendent (Civil/Plumbing)',
    department: 'Estate Maintenance',
    email: 'civil.sup@campus.edu'
  },
  'IT Services': {
    name: 'Prof. Alok Mukherjee',
    title: 'Head of Campus IT & Network',
    department: 'IT Services',
    email: 'head.it@campus.edu'
  },
  'Hostel': {
    name: 'Dr. Sunita Deshmukh',
    title: 'Chief Warden (Hostels)',
    department: 'Hostel Administration',
    email: 'chiefwarden@campus.edu'
  },
  'Sanitation': {
    name: 'Mrs. Geeta Roy',
    title: 'Campus Health & Sanitation Officer',
    department: 'Sanitation',
    email: 'sanitation@campus.edu'
  },
  'Academic': {
    name: 'Prof. Menon',
    title: 'Dean of Academic Affairs',
    department: 'Dean Office',
    email: 'dean.acad@campus.edu'
  },
  'General': {
    name: 'Dr. K. Sharma',
    title: 'Chief Estate Supervisor',
    department: 'Estate Office',
    email: 'estate.supervisor@campus.edu'
  }
};

/**
 * Checks a complaint for SLA breach and generates an escalation if breached.
 * @param {Object} complaint 
 * @returns {{ isBreached: boolean, shouldEscalate: boolean, escalationUpdate?: Object }}
 */
export function evaluateEscalation(complaint) {
  if (!complaint || complaint.status === 'RESOLVED') {
    // If complaint was previously escalated and now resolved
    if (complaint?.escalationState === ESCALATION_STATES.ESCALATED) {
      return {
        isBreached: false,
        shouldEscalate: false,
        escalationUpdate: {
          escalationState: ESCALATION_STATES.RESOLVED_AFTER_ESCALATION
        }
      };
    }
    return { isBreached: false, shouldEscalate: false };
  }

  const now = Date.now();
  const deadline = new Date(complaint.slaDeadline).getTime();
  const isBreached = deadline < now;

  if (isBreached && complaint.escalationState !== ESCALATION_STATES.ESCALATED) {
    const supervisor = DEPARTMENT_SUPERVISORS[complaint.category] || DEPARTMENT_SUPERVISORS['General'];
    
    return {
      isBreached: true,
      shouldEscalate: true,
      escalationUpdate: {
        escalationState: ESCALATION_STATES.ESCALATED,
        escalationDetails: {
          escalatedAt: new Date().toISOString(),
          escalatedTo: `${supervisor.name} (${supervisor.title})`,
          reason: `SLA deadline (${new Date(complaint.slaDeadline).toLocaleTimeString()}) exceeded without resolution. Automatic level 1 supervisor escalation invoked.`,
          level: 1
        }
      }
    };
  }

  // Check if approaching deadline (within 2 hours)
  const isAtRisk = (deadline - now) > 0 && (deadline - now) <= (2 * 60 * 60 * 1000);
  if (isAtRisk && complaint.escalationState === ESCALATION_STATES.NONE) {
    return {
      isBreached: false,
      shouldEscalate: false,
      escalationUpdate: {
        escalationState: ESCALATION_STATES.AT_RISK
      }
    };
  }

  return { isBreached, shouldEscalate: false };
}
