import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/Layout/PageHeader';
import { StatCard } from '../../components/Base/StatCard';
import { Table } from '../../components/Base/Table';
import { Button } from '../../components/Base/Button';
import { StatusBadge } from '../../components/CampusFix/StatusBadge';
import { PriorityBadge } from '../../components/CampusFix/PriorityBadge';
import { Input, Select } from '../../components/Base/Forms';
import { getStaffDashboardData } from '../../api/staffMockApi';
import { useAuth } from '../../contexts/AuthContext';

export function StaffDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const dashboardData = await getStaffDashboardData(user.id);
      setData(dashboardData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'ID', render: (row) => <Link to={`/staff/complaints/${row.id}`} style={{color: 'var(--color-primary)', fontWeight: 500}}>{row.id}</Link> },
    { header: 'Title', accessor: 'title' },
    { header: 'Category', accessor: 'category' },
    { header: 'Priority', render: (row) => <PriorityBadge priority={row.priority} /> },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Action', render: (row) => (
      <Button variant="outline" onClick={() => navigate(`/staff/complaints/${row.id}`)} style={{padding: 'var(--spacing-xs) var(--spacing-sm)'}}>
        View
      </Button>
    ) }
  ];

  if (loading) return <div style={{padding: 'var(--spacing-xl)', textAlign: 'center'}}>Loading dashboard...</div>;
  if (error) return <div style={{padding: 'var(--spacing-xl)', color: 'var(--color-danger)'}}>Error: {error}</div>;

  let filteredComplaints = data?.recentComplaints || [];
  if (filterStatus !== 'ALL') {
    filteredComplaints = filteredComplaints.filter(c => c.status === filterStatus);
  }
  if (search) {
    const q = search.toLowerCase();
    filteredComplaints = filteredComplaints.filter(c => c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
  }

  return (
    <div>
      <PageHeader
        title={`Staff Dashboard: ${user.name}`}
        description="Manage assigned complaints and SLAs"
        actions={
          <Button variant="primary" onClick={loadData}>Refresh Data</Button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
        <StatCard title="Total Assigned" value={data.totalAssigned} icon="📋" />
        <StatCard title="New / Unassigned" value={data.newReceived} icon="📨" />
        <StatCard title="SLA At Risk" value={data.slaAtRisk} icon="⚠️" />
        <StatCard title="SLA Breached" value={data.slaBreached} icon="🚨" />
      </div>

      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h3 className="section-title" style={{ marginBottom: 'var(--spacing-md)' }}>Complaint Queue</h3>

        <div className="flex gap-md" style={{ marginBottom: 'var(--spacing-md)' }}>
          <Input
            placeholder="Search by ID or title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <Select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            options={[
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Received', value: 'RECEIVED' },
              { label: 'Acknowledged', value: 'ACKNOWLEDGED' },
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'SLA Breached', value: 'SLA_BREACHED' },
              { label: 'Resolved', value: 'RESOLVED' }
            ]}
          />
        </div>

        <Table columns={columns} data={filteredComplaints} />
      </div>
    </div>
  );
}
