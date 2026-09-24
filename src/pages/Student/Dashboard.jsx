import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/Layout/PageHeader';
import { StatCard } from '../../components/Base/StatCard';
import { Button } from '../../components/Base/Button';
import { ComplaintCard } from '../../components/CampusFix/ComplaintCard';
import { studentApi } from '../../api/studentMockApi';
import { useAuth } from '../../contexts/AuthContext';

export function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.getStudentDashboardData(user.id)
      .then(setData)
      .finally(() => setLoading(false));
  }, [user.id]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading dashboard...</div>;
  if (!data) return <div style={{ padding: '2rem' }}>Error loading dashboard.</div>;

  return (
    <div>
      <PageHeader 
        title="Student Dashboard" 
        description="Overview of your complaints and campus trends"
        actions={
          <Link to="/student/complaints/new">
            <Button variant="primary">New Complaint</Button>
          </Link>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
        <StatCard title="Total Submitted" value={data.total} icon="📋" />
        <StatCard title="Open/In-Progress" value={data.open + data.inProgress} icon="🔄" />
        <StatCard title="Resolved" value={data.resolved} icon="✅" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-lg)' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
            <h3 className="section-title">Your Recent Complaints</h3>
            <Link to="/student/complaints" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>View All</Link>
          </div>
          {data.recent.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
              You haven't submitted any complaints yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {data.recent.map(complaint => (
                <Link key={complaint.id} to={`/student/complaints/${complaint.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <ComplaintCard complaint={complaint} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="section-title" style={{ marginBottom: 'var(--spacing-md)' }}>Trending on Campus</h3>
          {data.trending.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
              No trending complaints at the moment.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {data.trending.map(complaint => (
                <Link key={complaint.id} to={`/student/complaints/${complaint.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <ComplaintCard complaint={complaint} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
