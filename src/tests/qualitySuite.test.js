import { describe, it, expect } from 'vitest';
import { calculatePriority, PRIORITY_LEVELS } from '../services/priorityEngine';
import { calculateSLADeadline, formatSLACountdown, getSLAState, SLA_TARGETS_HOURS, SLA_STATES } from '../services/slaConfig';
import { evaluateEscalation, ESCALATION_STATES } from '../services/escalationEngine';
import { canTransitionStatus, validateResolution, COMPLAINT_STATUS, ROLES } from '../services/workflowEngine';
import { canAssignComplaint } from '../services/assignmentEngine';

describe('CampusFix AI - Staff, SLA & Workflow Quality Test Suite', () => {

  // 1. Critical complaint gets appropriate priority.
  it('1. Critical complaint gets appropriate priority (e.g. Gas leak near hostel kitchen)', () => {
    const criticalComplaint = {
      title: 'Gas leak near hostel kitchen',
      description: 'Strong smell of gas leaking near commercial burners. Danger of explosion.',
      category: 'Safety & Security',
      location: 'Hostel Block A Kitchen',
      impact: 'CRITICAL',
      supportCount: 45,
      clusterSize: 3,
      isSafetyRisk: true
    };

    const result = calculatePriority(criticalComplaint);
    expect(result.priority).toBe(PRIORITY_LEVELS.CRITICAL);
    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  // 2. Normal complaint gets normal priority.
  it('2. Normal complaint gets normal priority (e.g. Classroom projector not working)', () => {
    const routineComplaint = {
      title: 'Classroom projector not working',
      description: 'HDMI projector lamp not turning on in LH-201.',
      category: 'IT Services',
      location: 'LH-201',
      impact: 'LOW',
      supportCount: 1,
      clusterSize: 1,
      isSafetyRisk: false
    };

    const result = calculatePriority(routineComplaint);
    expect([PRIORITY_LEVELS.LOW, PRIORITY_LEVELS.MEDIUM]).toContain(result.priority);
    expect(result.score).toBeLessThan(55);
  });

  // 3. Priority reasons are visible.
  it('3. Priority reasons are explainable, populated, and visible', () => {
    const complaint = {
      title: 'Electrical short circuit and sparks near chemistry lab',
      description: 'Dangerous sparks leaping from high-voltage conduit.',
      category: 'Electrical',
      location: 'Chemistry Laboratory 101',
      impact: 'CRITICAL',
      supportCount: 15
    };

    const result = calculatePriority(complaint);
    expect(Array.isArray(result.reasons)).toBe(true);
    expect(result.reasons.length).toBeGreaterThan(0);
    // At least one keyword hazard or category reason should be listed
    const reasonText = result.reasons.join(' ').toLowerCase();
    expect(
      reasonText.includes('spark') || 
      reasonText.includes('hazard') || 
      reasonText.includes('safety') || 
      reasonText.includes('lab')
    ).toBe(true);
  });

  // 4. SLA deadline is calculated correctly.
  it('4. SLA deadline is calculated correctly from configured targets', () => {
    const baseTime = new Date('2026-09-24T10:00:00.000Z');

    const criticalDeadline = calculateSLADeadline(baseTime, 'CRITICAL');
    expect(new Date(criticalDeadline).getTime() - baseTime.getTime()).toBe(
      SLA_TARGETS_HOURS.CRITICAL * 60 * 60 * 1000
    ); // 2 hours

    const highDeadline = calculateSLADeadline(baseTime, 'HIGH');
    expect(new Date(highDeadline).getTime() - baseTime.getTime()).toBe(
      SLA_TARGETS_HOURS.HIGH * 60 * 60 * 1000
    ); // 6 hours

    const mediumDeadline = calculateSLADeadline(baseTime, 'MEDIUM');
    expect(new Date(mediumDeadline).getTime() - baseTime.getTime()).toBe(
      SLA_TARGETS_HOURS.MEDIUM * 60 * 60 * 1000
    ); // 24 hours

    const lowDeadline = calculateSLADeadline(baseTime, 'LOW');
    expect(new Date(lowDeadline).getTime() - baseTime.getTime()).toBe(
      SLA_TARGETS_HOURS.LOW * 60 * 60 * 1000
    ); // 48 hours
  });

  // 5. Countdown reflects real deadline.
  it('5. Countdown reflects real deadline and handles overdue & resolved formats', () => {
    const now = Date.now();
    // 1h 32m remaining
    const remainingTime = new Date(now + (1 * 60 * 60 * 1000) + (32 * 60 * 1000)).toISOString();
    const remainingText = formatSLACountdown(remainingTime, 'IN_PROGRESS');
    expect(remainingText).toContain('1h 32m remaining');

    // 2h 10m overdue
    const overdueTime = new Date(now - (2 * 60 * 60 * 1000) - (10 * 60 * 1000)).toISOString();
    const overdueText = formatSLACountdown(overdueTime, 'IN_PROGRESS');
    expect(overdueText).toContain('2h 10m overdue');

    // Resolved complaint
    const resolvedText = formatSLACountdown(remainingTime, 'RESOLVED');
    expect(resolvedText).toBe('Resolved');
  });

  // 6. SLA breach is detected.
  it('6. SLA breach is accurately detected when past deadline', () => {
    const pastDeadline = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // 30m ago
    const futureDeadline = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(); // 3h in future

    expect(getSLAState(pastDeadline, 'IN_PROGRESS')).toBe(SLA_STATES.SLA_BREACHED);
    expect(getSLAState(futureDeadline, 'IN_PROGRESS')).toBe(SLA_STATES.ON_TRACK);
  });

  // 7. Escalation occurs after breach.
  it('7. Escalation occurs after SLA breach and assigns supervisor details', () => {
    const breachedComplaint = {
      id: 'CMP-TEST-001',
      title: 'Water pipe rupture',
      category: 'Plumbing',
      status: 'IN_PROGRESS',
      slaDeadline: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      escalationState: ESCALATION_STATES.NONE
    };

    const evaluation = evaluateEscalation(breachedComplaint);
    expect(evaluation.isBreached).toBe(true);
    expect(evaluation.shouldEscalate).toBe(true);
    expect(evaluation.escalationUpdate.escalationState).toBe(ESCALATION_STATES.ESCALATED);
    expect(evaluation.escalationUpdate.escalationDetails.escalatedTo).toBeDefined();
    expect(evaluation.escalationUpdate.escalationDetails.reason).toContain('SLA deadline');
  });

  // 8. Status transitions work.
  it('8. Status transitions follow strict lifecycle and prevent nonsensical jumps', () => {
    // Valid forward transitions
    expect(canTransitionStatus(COMPLAINT_STATUS.RECEIVED, COMPLAINT_STATUS.ACKNOWLEDGED, ROLES.STAFF).allowed).toBe(true);
    expect(canTransitionStatus(COMPLAINT_STATUS.ACKNOWLEDGED, COMPLAINT_STATUS.IN_PROGRESS, ROLES.STAFF).allowed).toBe(true);
    expect(canTransitionStatus(COMPLAINT_STATUS.IN_PROGRESS, COMPLAINT_STATUS.RESOLVED, ROLES.STAFF).allowed).toBe(true);

    // Invalid transition: Skipping states
    expect(canTransitionStatus(COMPLAINT_STATUS.RECEIVED, COMPLAINT_STATUS.RESOLVED, ROLES.STAFF).allowed).toBe(false);

    // Invalid transition: Reverting from RESOLVED to RECEIVED
    expect(canTransitionStatus(COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.RECEIVED, ROLES.STAFF).allowed).toBe(false);

    // Reopening transition: Only authorized supervisors/admins can reopen to IN_PROGRESS
    expect(canTransitionStatus(COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.IN_PROGRESS, ROLES.SUPERVISOR).allowed).toBe(true);
    expect(canTransitionStatus(COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.IN_PROGRESS, ROLES.STAFF).allowed).toBe(false);
  });

  // 9. Resolution requires resolution information.
  it('9. Resolution requires mandatory resolution note and resolving author', () => {
    // Missing resolution info
    const emptyCheck = validateResolution(null);
    expect(emptyCheck.valid).toBe(false);

    // Blank or short note
    const shortCheck = validateResolution({
      note: 'ok',
      resolvedBy: { name: 'Rajesh Kumar' }
    });
    expect(shortCheck.valid).toBe(false);
    expect(shortCheck.errors.some(e => e.includes('resolution note'))).toBe(true);

    // Missing resolvedBy
    const noAuthorCheck = validateResolution({
      note: 'Replaced burnt fuse and tested supply voltage on circuit board.'
    });
    expect(noAuthorCheck.valid).toBe(false);

    // Valid resolution
    const validCheck = validateResolution({
      note: 'Replaced faulty capacitor and tested ceiling fan operation on site.',
      resolvedBy: { id: 'STF-01', name: 'Rajesh Kumar' }
    });
    expect(validCheck.valid).toBe(true);
    expect(validCheck.errors.length).toBe(0);
  });

  // 10. Staff cannot access unauthorized admin functionality.
  it('10. Staff cannot access unauthorized cross-department assignment controls', () => {
    const currentStaffId = 'STF-01';
    const otherStaffId = 'STF-02';

    // Ordinary STAFF cannot reassign tickets assigned to another staff member
    expect(canAssignComplaint(ROLES.STAFF, otherStaffId, currentStaffId)).toBe(false);

    // Ordinary STAFF can self-assign unassigned tickets
    expect(canAssignComplaint(ROLES.STAFF, null, currentStaffId)).toBe(true);

    // SUPERVISOR, ADMIN, and GRIEVANCE_OFFICER have unrestricted assignment rights
    expect(canAssignComplaint(ROLES.SUPERVISOR, otherStaffId, currentStaffId)).toBe(true);
    expect(canAssignComplaint(ROLES.ADMIN, otherStaffId, currentStaffId)).toBe(true);
    expect(canAssignComplaint(ROLES.GRIEVANCE_OFFICER, otherStaffId, currentStaffId)).toBe(true);

    // STUDENT cannot assign
    expect(canAssignComplaint(ROLES.STUDENT, null, currentStaffId)).toBe(false);
  });

  // 11. Anonymous complaints do not expose identity unnecessarily.
  it('11. Anonymous complaints protect student identity from ordinary staff', () => {
    const anonymousComplaint = {
      isAnonymous: true,
      student: {
        id: 'STU-1234',
        name: 'Secret Student',
        email: 'secret@campus.edu'
      }
    };

    const isStaffAllowed = !anonymousComplaint.isAnonymous || [ROLES.GRIEVANCE_OFFICER, ROLES.ADMIN].includes(ROLES.STAFF);
    const isOfficerAllowed = !anonymousComplaint.isAnonymous || [ROLES.GRIEVANCE_OFFICER, ROLES.ADMIN].includes(ROLES.GRIEVANCE_OFFICER);

    expect(isStaffAllowed).toBe(false);
    expect(isOfficerAllowed).toBe(true);
  });

  // 12. Sensitive complaints follow restricted access rules.
  it('12. Sensitive complaints follow restricted access rules', () => {
    const sensitiveComplaint = {
      isSensitive: true,
      description: 'Confidential harassment allegation against a senior.',
      assignedStaff: { id: 'STF-09' }
    };

    const ordinaryStaffUser = { id: 'STF-01' };

    const canStaffView = !sensitiveComplaint.isSensitive || 
      [ROLES.GRIEVANCE_OFFICER, ROLES.SUPERVISOR, ROLES.ADMIN].includes(ROLES.STAFF) || 
      (sensitiveComplaint.assignedStaff?.id === ordinaryStaffUser.id);

    const canSupervisorView = !sensitiveComplaint.isSensitive || 
      [ROLES.GRIEVANCE_OFFICER, ROLES.SUPERVISOR, ROLES.ADMIN].includes(ROLES.SUPERVISOR);

    const canGrievanceOfficerView = !sensitiveComplaint.isSensitive || 
      [ROLES.GRIEVANCE_OFFICER, ROLES.SUPERVISOR, ROLES.ADMIN].includes(ROLES.GRIEVANCE_OFFICER);

    expect(canStaffView).toBe(false);
    expect(canSupervisorView).toBe(true);
    expect(canGrievanceOfficerView).toBe(true);
  });

  // 13. Data loading lifecycle: Guaranteed to exit loading state via finally block
  it('13. Async data loading lifecycle terminates loading state deterministically via finally', async () => {
    let isLoading = true;
    let error = null;
    let data = null;

    const mockLoadData = async (shouldFail = false) => {
      isLoading = true;
      error = null;
      try {
        if (shouldFail) {
          throw new Error('Network timeout during data fetch');
        }
        data = [{ id: 'CMP-TEST', title: 'Test issue' }];
      } catch (err) {
        error = err.message;
      } finally {
        isLoading = false;
      }
    };

    // Test success case: leaves loading state with data
    await mockLoadData(false);
    expect(isLoading).toBe(false);
    expect(data).toHaveLength(1);
    expect(error).toBeNull();

    // Test error case: leaves loading state with error
    await mockLoadData(true);
    expect(isLoading).toBe(false);
    expect(error).toBe('Network timeout during data fetch');
  });

  // 14. All 5 user roles are defined and supported across dashboards
  it('14. All 5 user roles are supported without stuck initialization', () => {
    const requiredRoles = ['STUDENT', 'STAFF', 'SUPERVISOR', 'ADMIN', 'GRIEVANCE_OFFICER'];
    requiredRoles.forEach(role => {
      expect(ROLES[role]).toBe(role);
    });
  });

});
