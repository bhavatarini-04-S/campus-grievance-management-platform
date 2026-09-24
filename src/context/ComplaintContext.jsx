import React, { useState, useEffect, useCallback } from 'react';
import { ComplaintContext } from './complaintContextDef';
import { calculatePriority } from '../services/priorityEngine';
import { calculateSLADeadline } from '../services/slaConfig';
import { canTransitionStatus, validateResolution, createAuditEvent, COMPLAINT_STATUS, ROLES } from '../services/workflowEngine';
import { evaluateEscalation, ESCALATION_STATES } from '../services/escalationEngine';
import { STAFF_ROSTER, canAssignComplaint } from '../services/assignmentEngine';
import { INITIAL_NOTIFICATIONS, createNotification, NOTIFICATION_TYPES } from '../services/notificationService';

// Initial realistic dataset
const INITIAL_COMPLAINTS = [
  {
    id: 'CMP-2023-001',
    title: 'Gas leak near hostel kitchen',
    description: 'Strong smell of LPG gas leak detected near the primary cooking range in Hostel Block A kitchen. Danger of ignition or explosion if not inspected immediately.',
    category: 'Safety & Security',
    department: 'Safety & Security',
    location: 'Hostel Block A - Main Kitchen',
    status: 'RECEIVED',
    supportCount: 48,
    clusterSize: 4,
    relatedComplaints: ['CMP-2023-014', 'CMP-2023-015', 'CMP-2023-018'],
    impact: 'CRITICAL (Hostel Kitchen Fire Danger)',
    isSafetyRisk: true,
    isAnonymous: false,
    isSensitive: false,
    student: {
      id: 'STU-1042',
      name: 'Aditya Nair',
      email: 'aditya.n@campus.edu',
      room: 'Hostel Block A - 302'
    },
    assignedStaff: null,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
    timeline: [
      {
        id: 'EVT-1',
        action: 'SUBMITTED',
        title: 'Complaint Registered',
        description: 'Student submitted emergency gas leak grievance via campus portal.',
        author: 'Aditya Nair (Student)',
        role: 'STUDENT',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      },
      {
        id: 'EVT-2',
        action: 'PRIORITY_EVALUATION',
        title: 'Priority Engine Calculated CRITICAL',
        description: 'Automated scan detected urgent gas leak keyword and safety risk in shared kitchen.',
        author: 'CampusFix AI Priority Engine',
        role: 'SYSTEM',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      }
    ],
    escalationState: ESCALATION_STATES.NONE,
    escalationDetails: null,
    resolution: null
  },
  {
    id: 'CMP-2023-002',
    title: 'Live electrical wire hanging in corridor',
    description: 'Damaged conduit with exposed live 220V wires hanging at head height near Room 104. Sparks observed during evening humidity.',
    category: 'Electrical',
    department: 'Electrical',
    location: 'Academic Block 3 - 1st Floor Corridor',
    status: 'ACKNOWLEDGED',
    supportCount: 19,
    clusterSize: 2,
    relatedComplaints: ['CMP-2023-009'],
    impact: 'HIGH (Immediate electrocution risk)',
    isSafetyRisk: true,
    isAnonymous: false,
    isSensitive: false,
    student: {
      id: 'STU-2188',
      name: 'Sneha Patel',
      email: 'sneha.p@campus.edu',
      room: 'LH-301'
    },
    assignedStaff: STAFF_ROSTER[0], // Rajesh Kumar (Electrical)
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago (exceeds 6h HIGH SLA)
    timeline: [
      {
        id: 'EVT-10',
        action: 'SUBMITTED',
        title: 'Complaint Registered',
        description: 'Reported exposed wire in 1st floor corridor.',
        author: 'Sneha Patel',
        role: 'STUDENT',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'EVT-11',
        action: 'ACKNOWLEDGED',
        title: 'Acknowledged by Electrical Staff',
        description: 'Assigned to Rajesh Kumar for urgent field inspection.',
        author: 'Rajesh Kumar',
        role: 'STAFF',
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'EVT-12',
        action: 'ESCALATION_TRIGGERED',
        title: 'SLA Breached - Level 1 Escalation',
        description: 'Exceeded 6-hour SLA deadline. Auto-escalated to Supervisor Dr. K. Sharma.',
        author: 'CampusFix SLA Daemon',
        role: 'SYSTEM',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ],
    escalationState: ESCALATION_STATES.ESCALATED,
    escalationDetails: {
      escalatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      escalatedTo: 'Dr. K. Sharma (Executive Engineer - Electrical)',
      reason: 'SLA deadline exceeded for HIGH priority electrical hazard without resolution.',
      level: 1
    },
    resolution: null
  },
  {
    id: 'CMP-2023-003',
    title: 'Classroom projector not working in LH-201',
    description: 'The overhead HDMI projector lamp fails to strike during morning lectures. Professor had to cancel presentation.',
    category: 'IT Services',
    department: 'IT Services',
    location: 'Lecture Hall Complex - LH-201',
    status: 'RECEIVED',
    supportCount: 2,
    clusterSize: 1,
    relatedComplaints: [],
    impact: 'LOW (Single classroom AV issue)',
    isSafetyRisk: false,
    isAnonymous: false,
    isSensitive: false,
    student: {
      id: 'STU-3301',
      name: 'Karan Mehra',
      email: 'karan.m@campus.edu',
      room: 'B.Tech CS Sem 4'
    },
    assignedStaff: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    timeline: [
      {
        id: 'EVT-20',
        action: 'SUBMITTED',
        title: 'Complaint Registered',
        description: 'Routine audio-visual equipment ticket created.',
        author: 'Karan Mehra',
        role: 'STUDENT',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ],
    escalationState: ESCALATION_STATES.NONE,
    escalationDetails: null,
    resolution: null
  },
  {
    id: 'CMP-2023-004',
    title: 'Main water pipe burst flooding basement archival area',
    description: 'Pressurized water main fractured in library basement. 3 inches of standing water accumulating near archive racks.',
    category: 'Plumbing',
    department: 'Plumbing',
    location: 'Central Library - Basement Stack Area',
    status: 'IN_PROGRESS',
    supportCount: 24,
    clusterSize: 3,
    relatedComplaints: ['CMP-2023-005', 'CMP-2023-006'],
    impact: 'HIGH (Infrastructure flood & document risk)',
    isSafetyRisk: false,
    isAnonymous: false,
    isSensitive: false,
    student: {
      id: 'STU-4109',
      name: 'Pooja Iyer',
      email: 'pooja.i@campus.edu',
      room: 'Library Scholar'
    },
    assignedStaff: STAFF_ROSTER[2], // Manoj Verma (Plumbing)
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago (SLA 6h, 3h remaining)
    timeline: [
      {
        id: 'EVT-30',
        action: 'SUBMITTED',
        title: 'Complaint Registered',
        description: 'Flooding in library basement reported.',
        author: 'Pooja Iyer',
        role: 'STUDENT',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'EVT-31',
        action: 'ACKNOWLEDGED',
        title: 'Acknowledged by Civil/Plumbing',
        description: 'Plumbing maintenance team alerted.',
        author: 'Manoj Verma',
        role: 'STAFF',
        timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'EVT-32',
        action: 'IN_PROGRESS',
        title: 'Work In Progress',
        description: 'Main isolation valve turned off; suction pumps deployed to clear standing water.',
        author: 'Manoj Verma',
        role: 'STAFF',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ],
    escalationState: ESCALATION_STATES.NONE,
    escalationDetails: null,
    resolution: null
  },
  {
    id: 'CMP-2023-005',
    title: 'Ceiling fan rattling violently in Room B-104',
    description: 'Overhead ceiling fan wobbling excessively and making squeaking noise, student unable to study during heat.',
    category: 'Electrical',
    department: 'Electrical',
    location: 'Hostel Block B - Room 104',
    status: 'RESOLVED',
    supportCount: 1,
    clusterSize: 1,
    relatedComplaints: [],
    impact: 'MEDIUM',
    isSafetyRisk: false,
    isAnonymous: false,
    isSensitive: false,
    student: {
      id: 'STU-5520',
      name: 'Vikas Rao',
      email: 'vikas.r@campus.edu',
      room: 'Hostel B-104'
    },
    assignedStaff: STAFF_ROSTER[1], // Suresh Patel
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    timeline: [
      {
        id: 'EVT-40',
        action: 'SUBMITTED',
        title: 'Complaint Registered',
        description: 'Fan repair requested.',
        author: 'Vikas Rao',
        role: 'STUDENT',
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'EVT-41',
        action: 'ACKNOWLEDGED',
        title: 'Acknowledged',
        description: 'Work order dispatched to Suresh Patel.',
        author: 'Suresh Patel',
        role: 'STAFF',
        timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'EVT-42',
        action: 'IN_PROGRESS',
        title: 'Technician on Site',
        description: 'Inspecting bearing and capacitor in B-104.',
        author: 'Suresh Patel',
        role: 'STAFF',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'EVT-43',
        action: 'RESOLVED',
        title: 'Complaint Resolved',
        description: 'Replaced faulty capacitor and tightened mounting bracket. Fan is working smoothly and tested in front of student.',
        author: 'Suresh Patel',
        role: 'STAFF',
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
      }
    ],
    escalationState: ESCALATION_STATES.NONE,
    escalationDetails: null,
    resolution: {
      note: 'Replaced faulty capacitor and tightened mounting bracket. Fan is working smoothly and tested in front of student.',
      resolvedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      resolvedBy: {
        id: 'STF-02',
        name: 'Suresh Patel',
        role: 'Junior Electrician'
      },
      attachment: {
        name: 'fan_inspection_check.jpg',
        url: '#'
      }
    }
  },
  {
    id: 'CMP-2023-006',
    title: 'Spoiled milk and unhygienic storage in hostel mess',
    description: 'Morning tea and porridge tasted sour. Several milk packets found stored at room temperature without refrigeration.',
    category: 'Sanitation',
    department: 'Sanitation',
    location: 'Central Mess Hall 2',
    status: 'RECEIVED',
    supportCount: 31,
    clusterSize: 3,
    relatedComplaints: ['CMP-2023-019'],
    impact: 'HIGH (Student food poisoning risk)',
    isSafetyRisk: true,
    isAnonymous: true, // ANONYMOUS
    isSensitive: false,
    student: {
      id: 'STU-7744',
      name: 'Rohan Gupta',
      email: 'rohan.g@campus.edu',
      room: 'Mess Committee Rep'
    },
    assignedStaff: null,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    timeline: [
      {
        id: 'EVT-50',
        action: 'SUBMITTED',
        title: 'Anonymous Complaint Registered',
        description: 'Anonymous student grievance logged regarding kitchen food hygiene.',
        author: 'Anonymous Student (Protected Identity)',
        role: 'STUDENT',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ],
    escalationState: ESCALATION_STATES.NONE,
    escalationDetails: null,
    resolution: null
  },
  {
    id: 'CMP-2023-007',
    title: 'Severe ragging and intimidation in Hostel C common room',
    description: 'Senior students harassing first-year students late at night in common room with verbal abuse and physical intimidation.',
    category: 'Academic', // Grievance / Sensitive
    department: 'Dean Office',
    location: 'Hostel C - 2nd Floor Common Hall',
    status: 'ACKNOWLEDGED',
    supportCount: 6,
    clusterSize: 1,
    relatedComplaints: [],
    impact: 'CRITICAL (Anti-Ragging / Student Welfare Violation)',
    isSafetyRisk: true,
    isAnonymous: true,
    isSensitive: true, // SENSITIVE: restricted to GRIEVANCE_OFFICER, SUPERVISOR, ADMIN
    student: {
      id: 'STU-9901',
      name: 'Confidential First-Year Student',
      email: 'student.confidential@campus.edu',
      room: 'Hostel C'
    },
    assignedStaff: STAFF_ROSTER[8], // Prof. Menon (Grievance Officer)
    createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    timeline: [
      {
        id: 'EVT-60',
        action: 'SUBMITTED',
        title: 'Sensitive Incident Reported',
        description: 'Confidential grievance filed under campus anti-ragging protocol.',
        author: 'Anonymous Student',
        role: 'STUDENT',
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'EVT-61',
        action: 'RESTRICTED_ACCESS',
        title: 'Confidential Access Lock Applied',
        description: 'Case flagged as sensitive. Ordinary staff access locked. Assigned to Student Grievance Officer Prof. Menon.',
        author: 'CampusFix Policy Engine',
        role: 'SYSTEM',
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
      }
    ],
    escalationState: ESCALATION_STATES.NONE,
    escalationDetails: null,
    resolution: null
  },
  {
    id: 'CMP-2023-008',
    title: 'Complete Wi-Fi outage across Girls Hostel Block 1 & 2',
    description: 'Both access switches offline. Over 300 students unable to submit assignment deadlines or access university portals.',
    category: 'IT Services',
    department: 'IT Services',
    location: 'Girls Hostel Blocks 1 & 2',
    status: 'IN_PROGRESS',
    supportCount: 94,
    clusterSize: 8,
    relatedComplaints: ['CMP-2023-010', 'CMP-2023-011', 'CMP-2023-012', 'CMP-2023-013'],
    impact: 'HIGH (Mass residential connectivity outage)',
    isSafetyRisk: false,
    isAnonymous: false,
    isSensitive: false,
    student: {
      id: 'STU-8820',
      name: 'Kavita Sundar',
      email: 'kavita.s@campus.edu',
      room: 'Girls Hostel B1-210'
    },
    assignedStaff: STAFF_ROSTER[3], // Priya Sundaram (IT)
    createdAt: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString(), // 4.5 hours ago (6h SLA -> 1.5h remaining -> AT_RISK!)
    timeline: [
      {
        id: 'EVT-70',
        action: 'SUBMITTED',
        title: 'Complaint Registered',
        description: 'Reported hostel Wi-Fi outage.',
        author: 'Kavita Sundar',
        role: 'STUDENT',
        timestamp: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'EVT-71',
        action: 'IN_PROGRESS',
        title: 'Fiber Splice Team Dispatched',
        description: 'Priya Sundaram dispatched to fiber junction box near Block 1.',
        author: 'Priya Sundaram',
        role: 'STAFF',
        timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString()
      }
    ],
    escalationState: ESCALATION_STATES.AT_RISK,
    escalationDetails: null,
    resolution: null
  }
];

export function ComplaintProvider({ children }) {
  // Pre-calculate priority and SLA for all complaints initially
  const [complaints, setComplaints] = useState(() => {
    return INITIAL_COMPLAINTS.map(c => {
      const priorityInfo = calculatePriority(c);
      const slaDeadline = c.slaDeadline || calculateSLADeadline(c.createdAt, priorityInfo.priority);
      return {
        ...c,
        priority: priorityInfo.priority,
        priorityScore: priorityInfo.score,
        priorityReasons: priorityInfo.reasons,
        slaDeadline
      };
    });
  });

  // Current active role & user (defaults to STAFF Rajesh Kumar)
  const [activeRole, setActiveRole] = useState(ROLES.STAFF);
  const [currentUser, setCurrentUser] = useState(STAFF_ROSTER[0]);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  // Sync current user when active role changes
  const switchRole = useCallback((newRole) => {
    setActiveRole(newRole);
    let user = STAFF_ROSTER.find(s => s.role === newRole);
    if (!user) {
      if (newRole === ROLES.STUDENT) {
        user = {
          id: 'STU-DEMO',
          name: 'Ananya Sharma',
          role: ROLES.STUDENT,
          department: 'Computer Science',
          email: 'ananya.s@campus.edu'
        };
      } else {
        user = STAFF_ROSTER[0];
      }
    }
    setCurrentUser(user);
  }, []);

  // Periodic SLA check to detect SLA breach and trigger escalation
  const checkSLABreaches = useCallback(() => {
    setComplaints(prev => {
      let changed = false;
      const newNotifications = [];

      const updated = prev.map(c => {
        if (c.status === COMPLAINT_STATUS.RESOLVED) return c;

        const escalationCheck = evaluateEscalation(c);

        if (escalationCheck.isBreached && c.escalationState !== ESCALATION_STATES.ESCALATED) {
          changed = true;
          const auditEvent = createAuditEvent({
            action: 'ESCALATION_TRIGGERED',
            title: 'SLA Breached - Escalated to Supervisor',
            description: escalationCheck.escalationUpdate.escalationDetails.reason,
            author: 'CampusFix SLA Daemon',
            role: 'SYSTEM'
          });

          newNotifications.push(createNotification({
            type: NOTIFICATION_TYPES.SLA_BREACHED,
            title: `SLA Breached: ${c.id}`,
            message: `${c.title} has breached its SLA deadline and was escalated to supervisor.`,
            complaintId: c.id,
            priority: 'CRITICAL'
          }));

          return {
            ...c,
            ...escalationCheck.escalationUpdate,
            timeline: [...c.timeline, auditEvent]
          };
        }

        if (!escalationCheck.isBreached && escalationCheck.escalationUpdate?.escalationState === ESCALATION_STATES.AT_RISK && c.escalationState === ESCALATION_STATES.NONE) {
          changed = true;
          return {
            ...c,
            escalationState: ESCALATION_STATES.AT_RISK
          };
        }

        return c;
      });

      if (newNotifications.length > 0) {
        setNotifications(curr => [...newNotifications, ...curr]);
      }

      return changed ? updated : prev;
    });
  }, []);

  // Check SLA on mount and periodically every 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      checkSLABreaches();
    }, 100);
    const interval = setInterval(checkSLABreaches, 15000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [checkSLABreaches]);

  // Workflow Action: Acknowledge Complaint
  const acknowledgeComplaint = useCallback((complaintId, notes = '') => {
    let result = { success: false, error: null };

    setComplaints(prev => {
      const idx = prev.findIndex(c => c.id === complaintId);
      if (idx === -1) {
        result.error = 'Complaint not found';
        return prev;
      }

      const complaint = prev[idx];
      const check = canTransitionStatus(complaint.status, COMPLAINT_STATUS.ACKNOWLEDGED, activeRole);
      if (!check.allowed) {
        result.error = check.reason;
        return prev;
      }

      const auditEvent = createAuditEvent({
        action: 'ACKNOWLEDGED',
        title: 'Complaint Acknowledged',
        description: notes || `Complaint acknowledged by ${currentUser.name} (${currentUser.title || currentUser.role}).`,
        author: currentUser.name,
        role: activeRole
      });

      const updatedComplaint = {
        ...complaint,
        status: COMPLAINT_STATUS.ACKNOWLEDGED,
        assignedStaff: complaint.assignedStaff || (activeRole === ROLES.STAFF ? currentUser : complaint.assignedStaff),
        timeline: [...complaint.timeline, auditEvent],
        updatedAt: new Date().toISOString()
      };

      result.success = true;
      const copy = [...prev];
      copy[idx] = updatedComplaint;
      return copy;
    });

    return result;
  }, [activeRole, currentUser]);

  // Workflow Action: Start In Progress
  const startProgress = useCallback((complaintId, notes = '') => {
    let result = { success: false, error: null };

    setComplaints(prev => {
      const idx = prev.findIndex(c => c.id === complaintId);
      if (idx === -1) {
        result.error = 'Complaint not found';
        return prev;
      }

      const complaint = prev[idx];
      const check = canTransitionStatus(complaint.status, COMPLAINT_STATUS.IN_PROGRESS, activeRole);
      if (!check.allowed) {
        result.error = check.reason;
        return prev;
      }

      const auditEvent = createAuditEvent({
        action: 'IN_PROGRESS',
        title: 'Status: In Progress',
        description: notes || `Work initiated on site by ${currentUser.name}.`,
        author: currentUser.name,
        role: activeRole
      });

      const updatedComplaint = {
        ...complaint,
        status: COMPLAINT_STATUS.IN_PROGRESS,
        assignedStaff: complaint.assignedStaff || currentUser,
        timeline: [...complaint.timeline, auditEvent],
        updatedAt: new Date().toISOString()
      };

      result.success = true;
      const copy = [...prev];
      copy[idx] = updatedComplaint;
      return copy;
    });

    return result;
  }, [activeRole, currentUser]);

  // Workflow Action: Resolve Complaint
  const resolveComplaint = useCallback((complaintId, resolutionData) => {
    let result = { success: false, errors: [] };

    const validation = validateResolution(resolutionData);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    setComplaints(prev => {
      const idx = prev.findIndex(c => c.id === complaintId);
      if (idx === -1) {
        result.errors = ['Complaint not found'];
        return prev;
      }

      const complaint = prev[idx];
      const check = canTransitionStatus(complaint.status, COMPLAINT_STATUS.RESOLVED, activeRole);
      if (!check.allowed) {
        result.errors = [check.reason];
        return prev;
      }

      const auditEvent = createAuditEvent({
        action: 'RESOLVED',
        title: 'Complaint Resolved',
        description: resolutionData.note,
        author: currentUser.name,
        role: activeRole,
        metadata: {
          attachment: resolutionData.attachment?.name || null
        }
      });

      const newEscalationState = complaint.escalationState === ESCALATION_STATES.ESCALATED
        ? ESCALATION_STATES.RESOLVED_AFTER_ESCALATION
        : complaint.escalationState;

      const updatedComplaint = {
        ...complaint,
        status: COMPLAINT_STATUS.RESOLVED,
        escalationState: newEscalationState,
        resolution: {
          note: resolutionData.note,
          resolvedAt: new Date().toISOString(),
          resolvedBy: {
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.title || currentUser.role
          },
          attachment: resolutionData.attachment || null
        },
        timeline: [...complaint.timeline, auditEvent],
        updatedAt: new Date().toISOString()
      };

      // Create notification
      const notif = createNotification({
        type: NOTIFICATION_TYPES.RESOLVED,
        title: `Complaint Resolved: ${complaint.id}`,
        message: `${complaint.title} has been resolved by ${currentUser.name}.`,
        complaintId: complaint.id,
        priority: 'MEDIUM'
      });
      setNotifications(curr => [notif, ...curr]);

      result.success = true;
      const copy = [...prev];
      copy[idx] = updatedComplaint;
      return copy;
    });

    return result;
  }, [activeRole, currentUser]);

  // Workflow Action: Reopen Complaint
  const reopenComplaint = useCallback((complaintId, reason) => {
    let result = { success: false, error: null };

    if (!reason || reason.trim().length < 5) {
      return { success: false, error: 'Reopening reason (minimum 5 characters) is required.' };
    }

    setComplaints(prev => {
      const idx = prev.findIndex(c => c.id === complaintId);
      if (idx === -1) {
        result.error = 'Complaint not found';
        return prev;
      }

      const complaint = prev[idx];
      const check = canTransitionStatus(complaint.status, COMPLAINT_STATUS.IN_PROGRESS, activeRole);
      if (!check.allowed) {
        result.error = check.reason;
        return prev;
      }

      const auditEvent = createAuditEvent({
        action: 'REOPENED',
        title: 'Complaint Reopened',
        description: `Reopened by ${currentUser.name} (${activeRole}). Reason: ${reason}`,
        author: currentUser.name,
        role: activeRole
      });

      const updatedComplaint = {
        ...complaint,
        status: COMPLAINT_STATUS.IN_PROGRESS,
        resolution: null,
        timeline: [...complaint.timeline, auditEvent],
        updatedAt: new Date().toISOString()
      };

      result.success = true;
      const copy = [...prev];
      copy[idx] = updatedComplaint;
      return copy;
    });

    return result;
  }, [activeRole, currentUser]);

  // Assignment Action
  const assignStaffToComplaint = useCallback((complaintId, targetStaff) => {
    let result = { success: false, error: null };

    setComplaints(prev => {
      const idx = prev.findIndex(c => c.id === complaintId);
      if (idx === -1) {
        result.error = 'Complaint not found';
        return prev;
      }

      const complaint = prev[idx];
      const allowed = canAssignComplaint(activeRole, complaint.assignedStaff?.id, currentUser.id);
      if (!allowed) {
        result.error = 'You do not have authorization to reassign this complaint.';
        return prev;
      }

      const auditEvent = createAuditEvent({
        action: 'STAFF_ASSIGNED',
        title: 'Assigned Staff Updated',
        description: `Assigned to ${targetStaff.name} (${targetStaff.department} - ${targetStaff.title}) by ${currentUser.name}.`,
        author: currentUser.name,
        role: activeRole
      });

      const updatedComplaint = {
        ...complaint,
        assignedStaff: targetStaff,
        timeline: [...complaint.timeline, auditEvent],
        updatedAt: new Date().toISOString()
      };

      // Create notification
      const notif = createNotification({
        type: NOTIFICATION_TYPES.ASSIGNED,
        title: `Assigned: ${complaint.id}`,
        message: `${complaint.title} has been assigned to ${targetStaff.name}.`,
        complaintId: complaint.id,
        priority: complaint.priority
      });
      setNotifications(curr => [notif, ...curr]);

      result.success = true;
      const copy = [...prev];
      copy[idx] = updatedComplaint;
      return copy;
    });

    return result;
  }, [activeRole, currentUser]);

  // Create New Complaint (with live Priority Engine & SLA calculation)
  const addComplaint = useCallback((complaintInput) => {
    const priorityResult = calculatePriority(complaintInput);
    const createdAt = new Date().toISOString();
    const slaDeadline = calculateSLADeadline(createdAt, priorityResult.priority);

    const newId = `CMP-2023-${String(complaints.length + 1).padStart(3, '0')}`;

    const newComplaint = {
      id: newId,
      ...complaintInput,
      priority: priorityResult.priority,
      priorityScore: priorityResult.score,
      priorityReasons: priorityResult.reasons,
      status: COMPLAINT_STATUS.RECEIVED,
      createdAt,
      slaDeadline,
      timeline: [
        {
          id: `EVT-${Date.now()}-1`,
          action: 'SUBMITTED',
          title: 'Complaint Registered',
          description: complaintInput.description || 'Grievance submitted',
          author: complaintInput.student?.name || 'Student',
          role: ROLES.STUDENT,
          timestamp: createdAt
        },
        {
          id: `EVT-${Date.now()}-2`,
          action: 'PRIORITY_EVALUATION',
          title: `Priority Engine: ${priorityResult.priority} (Score: ${priorityResult.score})`,
          description: `Identified reasons: ${priorityResult.reasons.join(', ')}`,
          author: 'CampusFix Priority Engine',
          role: 'SYSTEM',
          timestamp: createdAt
        }
      ],
      escalationState: ESCALATION_STATES.NONE,
      escalationDetails: null,
      resolution: null
    };

    setComplaints(prev => [newComplaint, ...prev]);

    // Dispatch notification if CRITICAL
    if (priorityResult.priority === 'CRITICAL') {
      const notif = createNotification({
        type: NOTIFICATION_TYPES.CRITICAL,
        title: `CRITICAL Incident: ${newId}`,
        message: `${newComplaint.title} requires immediate response. SLA target: 2 hours.`,
        complaintId: newId,
        priority: 'CRITICAL'
      });
      setNotifications(curr => [notif, ...curr]);
    }

    return newComplaint;
  }, [complaints.length]);

  // Notification actions
  const markNotificationAsRead = useCallback((notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Currently selected complaint for detail view
  const selectedComplaint = complaints.find(c => c.id === selectedComplaintId) || null;

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        activeRole,
        switchRole,
        currentUser,
        setCurrentUser,
        notifications,
        unreadNotificationsCount: notifications.filter(n => !n.read).length,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        selectedComplaintId,
        setSelectedComplaintId,
        selectedComplaint,
        acknowledgeComplaint,
        startProgress,
        resolveComplaint,
        reopenComplaint,
        assignStaffToComplaint,
        addComplaint,
        checkSLABreaches
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
}
