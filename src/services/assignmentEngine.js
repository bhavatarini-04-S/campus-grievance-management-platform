/**
 * CampusFix AI Assignment Engine & Staff Roster
 * Handles department staffing, assignment eligibility, and role permissions.
 */

import { ROLES } from './workflowEngine';

export const STAFF_ROSTER = [
  {
    id: 'STF-01',
    name: 'Rajesh Kumar',
    department: 'Electrical',
    role: 'STAFF',
    title: 'Senior Electrician',
    email: 'rajesh.k@campus.edu',
    activeTickets: 3
  },
  {
    id: 'STF-02',
    name: 'Suresh Patel',
    department: 'Electrical',
    role: 'STAFF',
    title: 'Junior Electrician',
    email: 'suresh.p@campus.edu',
    activeTickets: 2
  },
  {
    id: 'STF-03',
    name: 'Manoj Verma',
    department: 'Plumbing',
    role: 'STAFF',
    title: 'Plumbing Specialist',
    email: 'manoj.v@campus.edu',
    activeTickets: 1
  },
  {
    id: 'STF-04',
    name: 'Priya Sundaram',
    department: 'IT Services',
    role: 'STAFF',
    title: 'Network Systems Engineer',
    email: 'priya.s@campus.edu',
    activeTickets: 4
  },
  {
    id: 'STF-05',
    name: 'Arun Prakash',
    department: 'IT Services',
    role: 'STAFF',
    title: 'Hardware & Lab Tech',
    email: 'arun.p@campus.edu',
    activeTickets: 2
  },
  {
    id: 'STF-06',
    name: 'Inspector Balwant Singh',
    department: 'Safety & Security',
    role: 'STAFF',
    title: 'Campus Security Officer',
    email: 'balwant.s@campus.edu',
    activeTickets: 1
  },
  {
    id: 'STF-07',
    name: 'Mrs. Geeta Roy',
    department: 'Hostel',
    role: 'STAFF',
    title: 'Hostel Caretaker Block A',
    email: 'geeta.r@campus.edu',
    activeTickets: 3
  },
  {
    id: 'SUP-01',
    name: 'Dr. K. Sharma',
    department: 'Estate Maintenance',
    role: 'SUPERVISOR',
    title: 'Chief Estate Supervisor',
    email: 'k.sharma@campus.edu',
    activeTickets: 0
  },
  {
    id: 'GRO-01',
    name: 'Prof. Menon',
    department: 'Dean Office',
    role: 'GRIEVANCE_OFFICER',
    title: 'Student Grievance Officer',
    email: 'menon.gro@campus.edu',
    activeTickets: 0
  },
  {
    id: 'ADM-01',
    name: 'Dean Admin',
    department: 'Administration',
    role: 'ADMIN',
    title: 'Campus Administrator',
    email: 'dean.admin@campus.edu',
    activeTickets: 0
  }
];

/**
 * Checks if a user is permitted to assign/reassign a complaint.
 * @param {string} userRole 
 * @param {string} currentAssignedStaffId 
 * @param {string} currentUserId 
 * @returns {boolean}
 */
export function canAssignComplaint(userRole, currentAssignedStaffId = null, currentUserId = null) {
  if (userRole === ROLES.STUDENT) return false;
  if ([ROLES.SUPERVISOR, ROLES.ADMIN, ROLES.GRIEVANCE_OFFICER].includes(userRole)) return true;

  // Ordinary staff can self-assign if ticket is unassigned
  if (userRole === ROLES.STAFF) {
    if (!currentAssignedStaffId) return true;
    if (currentAssignedStaffId === currentUserId) return true;
  }

  return false;
}

/**
 * Returns available staff members filtered by category/department or all for supervisors.
 * @param {string} [department] 
 * @param {string} [userRole] 
 * @returns {Array} List of staff
 */
export function getAssignableStaff(department = null, userRole = ROLES.STAFF) {
  if ([ROLES.SUPERVISOR, ROLES.ADMIN, ROLES.GRIEVANCE_OFFICER].includes(userRole)) {
    return STAFF_ROSTER;
  }

  if (!department) return STAFF_ROSTER.filter(s => s.role === ROLES.STAFF);

  return STAFF_ROSTER.filter(s => s.department === department || s.role === ROLES.STAFF);
}
