import React from 'react';
import { PageHeader } from '../../components/Layout/PageHeader';
import { ComplaintCard } from '../../components/CampusFix/ComplaintCard';
import { getComplaints } from '../../api/mockData';
import { useAuth } from '../../contexts/AuthContext';

export function SensitiveComplaints() {
  const { hasRole } = useAuth();

  if (!hasRole(['ADMIN', 'GRIEVANCE_OFFICER', 'SUPERVISOR'])) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-danger)' }}>Access Denied</h2>
        <p>You do not have authorization to view sensitive complaints.</p>
      </div>
    );
  }

  // Passing includeSensitive explicitly for this view
  const complaints = getComplaints({ includeSensitive: true }).filter(c => c.isSensitive);

  return (
    <div>
      <PageHeader 
        title="Sensitive Complaints" 
        description="Restricted access area. Information here must be handled confidentially."
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        {complaints.length === 0 ? (
          <p>No sensitive complaints found.</p>
        ) : (
          complaints.map(c => (
            <ComplaintCard key={c.id} complaint={c} />
          ))
        )}
      </div>
    </div>
  );
}
