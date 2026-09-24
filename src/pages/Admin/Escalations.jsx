import React from 'react';
import { PageHeader } from '../../components/Layout/PageHeader';
import { Table } from '../../components/Base/Table';
import { StatusBadge } from '../../components/CampusFix/StatusBadge';
import { PriorityBadge } from '../../components/CampusFix/PriorityBadge';
import { Button } from '../../components/Base/Button';
import { escalations } from '../../api/mockData';
import { useAuth } from '../../contexts/AuthContext';

export function Escalations() {
  const { hasRole } = useAuth();

  if (!hasRole(['ADMIN', 'SUPERVISOR'])) {
    return <div>Access Denied. Admins and Supervisors only.</div>;
  }

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Complaint ID', accessor: 'complaintId' },
    { header: 'Priority', render: (row) => <PriorityBadge priority={row.priority} /> },
    { header: 'SLA State', render: (row) => <StatusBadge status={row.slaState === 'BREACHED' ? 'SLA_BREACHED' : 'IN_PROGRESS'} /> },
    { header: 'Assigned To', accessor: 'assignedTo' },
    { header: 'Department', accessor: 'department' },
    { header: 'Current Status', accessor: 'currentStatus' },
    { header: 'Action', render: () => <Button variant="outline">Review</Button> },
  ];

  return (
    <div>
      <PageHeader 
        title="Escalation Management" 
        description="Review and manage escalated complaints"
      />
      <Table columns={columns} data={escalations} />
    </div>
  );
}
