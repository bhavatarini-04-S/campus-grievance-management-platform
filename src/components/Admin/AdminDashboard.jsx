import React, { useState } from 'react';
import { useComplaints } from '../../context/useComplaints';
import { StatCard } from '../Base/StatCard';
import { Button } from '../Base/Button';
import { LoadingState } from '../Base/LoadingState';
import { ErrorState } from '../Base/ErrorState';
import { EmptyState } from '../Base/EmptyState';
import { ComplaintQueueTable } from '../Staff/ComplaintQueueTable';
import { ComplaintDetailModal } from '../Staff/ComplaintDetailModal';
import { ResolutionModal } from '../Staff/ResolutionModal';
import styles from './AdminDashboard.module.css';

export function AdminDashboard() {
  const {
    complaints,
    isLoading,
    loading,
    error,
    refreshData,
    currentUser,
    activeRole,
    acknowledgeComplaint,
    startProgress,
    resolveComplaint,
    reopenComplaint,
    assignStaffToComplaint
  } = useComplaints();

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolvingComplaint, setResolvingComplaint] = useState(null);

  // Loading state
  if (isLoading || loading) {
    return <LoadingState message="Loading campus administrative analytics and audit logs..." size="large" />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState 
        title="Failed to Load Admin Center" 
        message={error} 
        onRetry={refreshData} 
      />
    );
  }

  // Empty state
  if (!complaints || complaints.length === 0) {
    return (
      <EmptyState
        title="No Campus Complaints Found"
        description="The campus management database currently contains no complaint records."
      />
    );
  }

  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;
  const complianceRate = complaints.length > 0 
    ? Math.round(((complaints.length - complaints.filter(c => c.escalationState === 'ESCALATED').length) / complaints.length) * 100)
    : 100;

  const activeSelectedComplaint = selectedComplaint 
    ? complaints.find(c => c.id === selectedComplaint.id) || selectedComplaint 
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Campus Administration & Executive Analytics</h2>
          <p>Global oversight of university operations, SLA target compliance, and full audit accountability.</p>
        </div>
        <Button variant="primary" onClick={refreshData}>
          🔄 Refresh Operations
        </Button>
      </div>

      <div className={styles.statsGrid}>
        <StatCard title="System Complaints" value={complaints.length} icon="🏛️" />
        <StatCard title="Resolved Issues" value={resolvedCount} icon="✅" />
        <StatCard title="SLA Compliance Rate" value={`${complianceRate}%`} icon="📈" />
        <StatCard title="Active Escalations" value={complaints.filter(c => c.escalationState === 'ESCALATED').length} icon="🚨" />
      </div>

      <div className={styles.tableSection}>
        <h3 className="section-title">All Campus Operations Tickets</h3>
        <ComplaintQueueTable
          complaints={complaints}
          onSelectComplaint={(c) => setSelectedComplaint(c)}
        />
      </div>

      {activeSelectedComplaint && (
        <ComplaintDetailModal
          isOpen={!!activeSelectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          complaint={activeSelectedComplaint}
          currentUser={currentUser}
          activeRole={activeRole}
          onAcknowledge={acknowledgeComplaint}
          onStartProgress={startProgress}
          onOpenResolveModal={(complaint) => setResolvingComplaint(complaint)}
          onReopen={reopenComplaint}
          onAssignStaff={assignStaffToComplaint}
        />
      )}

      {resolvingComplaint && (
        <ResolutionModal
          isOpen={!!resolvingComplaint}
          onClose={() => setResolvingComplaint(null)}
          complaint={resolvingComplaint}
          currentUser={currentUser}
          onSubmit={(complaintId, resolutionData) => {
            resolveComplaint(complaintId, resolutionData);
          }}
        />
      )}
    </div>
  );
}
