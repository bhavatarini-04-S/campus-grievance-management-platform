import { getSlaState } from '../services/slaService';
import { evaluateEscalation } from '../services/escalationService';

let mockComplaints = [
  {
    id: 'CMP-2023-001',
    student_id: 'STU-123',
    title: 'Wi-Fi completely down in North Campus Library',
    description: 'No internet access in the entire building. This is a major outage affecting everyone.',
    category: 'IT Infrastructure',
    location: 'North Campus Library - All Floors',
    department: 'IT Support',
    priority: 'HIGH',
    priority_score: 85,
    priority_reasons: ['High risk keyword detected: major outage', 'Community impact (42 students)'],
    status: 'IN_PROGRESS',
    is_anonymous: false,
    is_sensitive: false,
    support_count: 42,
    assigned_to: 'STAFF-1',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    sla_deadline: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    escalation_status: null
  },
  {
    id: 'CMP-2023-002',
    student_id: 'STU-124',
    title: 'Water leakage in Block B',
    description: 'There is severe water leakage from the ceiling on the second floor.',
    category: 'Maintenance',
    location: 'Block B, 2nd Floor',
    department: 'Facilities',
    priority: 'HIGH',
    priority_score: 75,
    priority_reasons: ['High risk keyword detected: water leakage'],
    status: 'RECEIVED',
    is_anonymous: false,
    is_sensitive: false,
    support_count: 5,
    assigned_to: null,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
    sla_deadline: new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString(),
    escalation_status: null
  },
  {
    id: 'CMP-2023-003',
    student_id: 'STU-125',
    title: 'Fire alarm sounding randomly',
    description: 'The fire alarm in the dorm is going off without reason. It is a danger if people ignore it.',
    category: 'Safety',
    location: 'Student Dorms',
    department: 'Security',
    priority: 'CRITICAL',
    priority_score: 95,
    priority_reasons: ['Critical emergency keyword detected: fire', 'Critical emergency keyword detected: danger'],
    status: 'ACKNOWLEDGED',
    is_anonymous: true,
    is_sensitive: false,
    support_count: 12,
    assigned_to: 'STAFF-1',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago, SLA breached
    sla_deadline: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Breached 2 hours ago
    escalation_status: 'LEVEL_1'
  }
];

export async function getStaffDashboardData(staffId) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Re-evaluate escalations
  mockComplaints = mockComplaints.map(evaluateEscalation);

  const assigned = mockComplaints.filter(c => c.assigned_to === staffId);
  const newComplaints = mockComplaints.filter(c => c.status === 'RECEIVED');

  return {
    totalAssigned: assigned.length,
    newReceived: newComplaints.length,
    acknowledged: mockComplaints.filter(c => c.status === 'ACKNOWLEDGED').length,
    inProgress: mockComplaints.filter(c => c.status === 'IN_PROGRESS').length,
    resolved: mockComplaints.filter(c => c.status === 'RESOLVED').length,
    slaAtRisk: mockComplaints.filter(c => getSlaState(c.sla_deadline) === 'AT_RISK' && c.status !== 'RESOLVED').length,
    slaBreached: mockComplaints.filter(c => (getSlaState(c.sla_deadline) === 'BREACHED' || c.status === 'SLA_BREACHED') && c.status !== 'RESOLVED').length,
    criticalHigh: mockComplaints.filter(c => (c.priority === 'CRITICAL' || c.priority === 'HIGH') && c.status !== 'RESOLVED').length,
    recentComplaints: [...mockComplaints].sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
  };
}

export async function getAssignedComplaints(staffId) {
  await new Promise(resolve => setTimeout(resolve, 500));
  mockComplaints = mockComplaints.map(evaluateEscalation);
  return mockComplaints.filter(c => c.assigned_to === staffId || !c.assigned_to);
}

export async function getStaffComplaintDetail(id) {
  await new Promise(resolve => setTimeout(resolve, 500));
  mockComplaints = mockComplaints.map(evaluateEscalation);
  return mockComplaints.find(c => c.id === id);
}

export async function updateComplaintStatus(id, status) {
  await new Promise(resolve => setTimeout(resolve, 300));
  const validTransitions = {
    'RECEIVED': ['ACKNOWLEDGED', 'RESOLVED'],
    'ACKNOWLEDGED': ['IN_PROGRESS', 'RESOLVED'],
    'IN_PROGRESS': ['RESOLVED'],
    'SLA_BREACHED': ['ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'],
    'RESOLVED': []
  };

  const complaint = mockComplaints.find(c => c.id === id);
  if (!complaint) throw new Error('Complaint not found');

  if (complaint.status !== 'SLA_BREACHED' && !validTransitions[complaint.status].includes(status)) {
    throw new Error(`Invalid status transition from ${complaint.status} to ${status}`);
  }

  complaint.status = status;
  if (status === 'RESOLVED') {
    complaint.resolved_at = new Date().toISOString();
  }

  return complaint;
}

export async function assignComplaint(id, staffId) {
  await new Promise(resolve => setTimeout(resolve, 300));
  const complaint = mockComplaints.find(c => c.id === id);
  if (complaint) {
    complaint.assigned_to = staffId;
    if (complaint.status === 'RECEIVED') {
      complaint.status = 'ACKNOWLEDGED';
    }
  }
  return complaint;
}

export async function addComplaintNote(id, note) {
  await new Promise(resolve => setTimeout(resolve, 300));
  // Provide mock notification
  console.log(`Notification: Note added to ${id}: ${note}`);
  return true;
}

export async function resolveComplaint(id, resolutionNote) {
  await addComplaintNote(id, `Resolution: ${resolutionNote}`);
  return updateComplaintStatus(id, 'RESOLVED');
}

export async function getSlaStatus(id) {
  const complaint = mockComplaints.find(c => c.id === id);
  if (!complaint) return null;
  return getSlaState(complaint.sla_deadline);
}

export async function getEscalations() {
  await new Promise(resolve => setTimeout(resolve, 500));
  mockComplaints = mockComplaints.map(evaluateEscalation);
  return mockComplaints.filter(c => c.escalation_status !== null);
}
