import React, { useState } from 'react';
import { PageHeader } from '../../components/Layout/PageHeader';
import { StatCard } from '../../components/Base/StatCard';
import { Card, CardHeader, CardBody } from '../../components/Base/Card';
import { Select } from '../../components/Base/Forms';
import { getComplaints } from '../../api/mockData';
import { useAuth } from '../../contexts/AuthContext';

export function Dashboard() {
  const { user, hasRole } = useAuth();
  const [timeRange, setTimeRange] = useState(30);

  const complaints = getComplaints({ timeRange, includeSensitive: hasRole(['ADMIN', 'GRIEVANCE_OFFICER']) });

  const total = complaints.length;
  const open = complaints.filter(c => ['RECEIVED', 'ACKNOWLEDGED'].includes(c.status)).length;
  const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolved = complaints.filter(c => c.status === 'RESOLVED').length;
  
  const slaBreached = complaints.filter(c => {
    return c.status !== 'RESOLVED' && new Date(c.slaDeadline) < new Date();
  }).length;
  
  const critical = complaints.filter(c => c.priority === 'CRITICAL').length;
  const escalated = complaints.filter(c => c.status === 'ESCALATED').length;
  const sensitive = complaints.filter(c => c.isSensitive).length;
  
  const clusters = [...new Set(complaints.filter(c => c.clusterId).map(c => c.clusterId))].length;

  return (
    <div>
      <PageHeader 
        title="Admin Dashboard" 
        description="Campus-wide operational view"
        actions={
          <Select 
            options={[
              { label: 'Today', value: 1 },
              { label: 'Last 7 Days', value: 7 },
              { label: 'Last 30 Days', value: 30 },
              { label: 'Last 90 Days', value: 90 },
            ]}
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
          />
        }
      />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)' }}>
        <StatCard title="Total Complaints" value={total} icon="📋" />
        <StatCard title="Open" value={open} icon="📥" />
        <StatCard title="In Progress" value={inProgress} icon="⏳" />
        <StatCard title="Resolved" value={resolved} icon="✅" />
        <StatCard title="SLA Breached" value={slaBreached} icon="⚠️" />
        <StatCard title="Critical" value={critical} icon="🚨" />
        <StatCard title="Escalated" value={escalated} icon="⬆️" />
        <StatCard title="Duplicate Clusters" value={clusters} icon="🔗" />
        {hasRole(['ADMIN', 'GRIEVANCE_OFFICER']) && (
          <StatCard title="Sensitive" value={sensitive} icon="🔒" />
        )}
      </div>
    </div>
  );
}
