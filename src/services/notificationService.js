/**
 * CampusFix AI In-App Notification Service
 * Manages event-driven notifications for staff, supervisors, and officers.
 */

export const NOTIFICATION_TYPES = {
  ASSIGNED: 'ASSIGNED',
  CRITICAL: 'CRITICAL',
  SLA_WARNING: 'SLA_WARNING',
  SLA_BREACHED: 'SLA_BREACHED',
  RESOLVED: 'RESOLVED',
  ESCALATED: 'ESCALATED'
};

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-01',
    type: NOTIFICATION_TYPES.SLA_BREACHED,
    title: 'SLA Breached & Escalated',
    message: 'Complaint CMP-2023-002 (Live wire in Academic Block) exceeded 6h SLA. Auto-escalated to Supervisor Dr. K. Sharma.',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    complaintId: 'CMP-2023-002',
    read: false,
    priority: 'CRITICAL'
  },
  {
    id: 'NOTIF-02',
    type: NOTIFICATION_TYPES.CRITICAL,
    title: 'Critical Emergency Alert',
    message: 'CMP-2023-001 (Gas leak near hostel kitchen) detected with CRITICAL priority (Score: 95). Immediate response required!',
    timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    complaintId: 'CMP-2023-001',
    read: false,
    priority: 'CRITICAL'
  },
  {
    id: 'NOTIF-03',
    type: NOTIFICATION_TYPES.ASSIGNED,
    title: 'New Complaint Assigned',
    message: 'You have been assigned to CMP-2023-004 (Main water pipe burst) in Central Library.',
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    complaintId: 'CMP-2023-004',
    read: true,
    priority: 'HIGH'
  }
];

export function createNotification({
  type,
  title,
  message,
  complaintId,
  priority = 'MEDIUM'
}) {
  return {
    id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    title,
    message,
    complaintId,
    timestamp: new Date().toISOString(),
    read: false,
    priority
  };
}
