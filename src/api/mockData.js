// mockData.js
export const complaints = [
  { id: 'CMP-001', title: 'Wi-Fi slow in Block C', category: 'Wi-Fi', location: 'Block C', department: 'IT', priority: 'HIGH', status: 'IN_PROGRESS', isSensitive: false, slaDeadline: new Date(Date.now() - 3600000).toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString(), studentId: 'S1', clusterId: 'C1' },
  { id: 'CMP-002', title: 'Block C network issue', category: 'Wi-Fi', location: 'Block C', department: 'IT', priority: 'MEDIUM', status: 'ACKNOWLEDGED', isSensitive: false, slaDeadline: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date(Date.now() - 40000000).toISOString(), studentId: 'S2', clusterId: 'C1' },
  { id: 'CMP-003', title: 'Water cooler broken', category: 'Water', location: 'Hostel A', department: 'Maintenance', priority: 'MEDIUM', status: 'RECEIVED', isSensitive: false, slaDeadline: new Date(Date.now() + 172800000).toISOString(), createdAt: new Date(Date.now() - 10000000).toISOString(), studentId: 'S3', clusterId: null },
  { id: 'CMP-004', title: 'Harassment by staff', category: 'Safety', location: 'Lab 2', department: 'Security', priority: 'CRITICAL', status: 'IN_PROGRESS', isSensitive: true, slaDeadline: new Date(Date.now() + 3600000).toISOString(), createdAt: new Date(Date.now() - 2000000).toISOString(), studentId: 'S4', clusterId: null },
  { id: 'CMP-005', title: 'Electricity out in Block B', category: 'Electricity', location: 'Block B', department: 'Maintenance', priority: 'CRITICAL', status: 'RESOLVED', isSensitive: false, slaDeadline: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date(Date.now() - 259200000).toISOString(), studentId: 'S5', clusterId: null },
  { id: 'CMP-006', title: 'Exam server down', category: 'Academic', location: 'Block A', department: 'IT', priority: 'CRITICAL', status: 'ESCALATED', isSensitive: false, slaDeadline: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 172800000).toISOString(), studentId: 'S6', clusterId: null, assignedStaff: 'Prof. X' },
];

export const escalations = [
  { id: 'ESC-001', complaintId: 'CMP-006', priority: 'CRITICAL', slaState: 'BREACHED', currentStatus: 'Reviewing', assignedTo: 'Admin Y', department: 'IT', escalatedAt: new Date(Date.now() - 50000000).toISOString() }
];

export const auditLogs = [
  { id: 'LOG-001', action: 'Complaint Created', actor: 'Student (S1)', targetId: 'CMP-001', timestamp: new Date(Date.now() - 86400000).toISOString(), details: 'New Wi-Fi issue' },
  { id: 'LOG-002', action: 'Status Changed', actor: 'IT Staff', targetId: 'CMP-001', timestamp: new Date(Date.now() - 40000000).toISOString(), details: 'RECEIVED -> IN_PROGRESS' },
  { id: 'LOG-003', action: 'Sensitive Accessed', actor: 'Grievance Officer (G1)', targetId: 'CMP-004', timestamp: new Date(Date.now() - 1000000).toISOString(), details: 'Viewed sensitive details' },
];

export const getComplaints = (filters = {}) => {
  let filtered = complaints;
  if (!filters.includeSensitive) {
    filtered = filtered.filter(c => !c.isSensitive);
  }
  if (filters.status) filtered = filtered.filter(c => c.status === filters.status);
  if (filters.department) filtered = filtered.filter(c => c.department === filters.department);
  if (filters.timeRange) {
    const cutoff = new Date(Date.now() - filters.timeRange * 24 * 60 * 60 * 1000);
    filtered = filtered.filter(c => new Date(c.createdAt) >= cutoff);
  }
  return filtered;
};
