import React from 'react';
import { PageHeader } from '../../components/Layout/PageHeader';
import { Table } from '../../components/Base/Table';
import { auditLogs } from '../../api/mockData';
import { useAuth } from '../../contexts/AuthContext';

export function AuditLogs() {
  const { hasRole } = useAuth();

  if (!hasRole(['ADMIN'])) {
    return <div>Access Denied. Admins only.</div>;
  }

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Action', accessor: 'action' },
    { header: 'Actor', accessor: 'actor' },
    { header: 'Target ID', accessor: 'targetId' },
    { header: 'Timestamp', render: (row) => new Date(row.timestamp).toLocaleString() },
    { header: 'Details', accessor: 'details' },
  ];

  return (
    <div>
      <PageHeader 
        title="Audit Logs" 
        description="System-wide action tracking and monitoring"
      />
      <Table columns={columns} data={auditLogs} />
    </div>
  );
}
