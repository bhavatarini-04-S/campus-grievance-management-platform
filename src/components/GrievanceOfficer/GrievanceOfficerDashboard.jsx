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
import styles from './GrievanceOfficerDashboard.module.css';

export function GrievanceOfficerDashboard() {
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
  const [filterMode, setFilterMode] = useState('SENSITIVE'); // 'SENSITIVE' | 'ANONYMOUS' | 'ALL'

  // Loading state
  if (isLoading || loading) {
    return <LoadingState message="Loading Student Grievance & Protection Portal..." size="large" />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState 
        title="Failed to Load Grievance Center" 
        message={error} 
        onRetry={refreshData} 
      />
    );
  }

  // Empty state
  if (!complaints || complaints.length === 0) {
    return (
      <EmptyState
        title="No Grievance Records"
        description="There are currently no recorded grievances in the campus system."
      />
    );
  }

  const sensitiveComplaints = complaints.filter(c => c.isSensitive);
  const anonymousComplaints = complaints.filter(c => c.isAnonymous);

  const displayedComplaints = filterMode === 'SENSITIVE' 
    ? sensitiveComplaints 
    : filterMode === 'ANONYMOUS' 
    ? anonymousComplaints 
    : complaints;

  const activeSelectedComplaint = selectedComplaint 
    ? complaints.find(c => c.id === selectedComplaint.id) || selectedComplaint 
    : null;

  return (
    <div className={styles.container}>
      {/* Officer Header */}
      <div className={styles.header}>
        <div>
          <h2>Student Grievance & Sensitive Cases Portal</h2>
          <p>
            Confidential case oversight, anti-ragging intervention, and authorized identity verification under university protection policies.
          </p>
        </div>
        <Button variant="primary" onClick={refreshData}>
          🔄 Refresh Inquiries
        </Button>
      </div>

      {/* KPI Cards */}
      <div className={styles.statsGrid}>
        <StatCard title="Confidential Cases" value={sensitiveComplaints.length} icon="🔒" />
        <StatCard title="Anonymous Reports" value={anonymousComplaints.length} icon="🕵️" />
        <StatCard title="Critical Safety Inquiries" value={complaints.filter(c => c.priority === 'CRITICAL').length} icon="🔥" />
        <StatCard title="Total Campus Tickets" value={complaints.length} icon="📋" />
      </div>

      {/* Category Tabs */}
      <div className={styles.tabsRow}>
        <button
          className={`${styles.tabBtn} ${filterMode === 'SENSITIVE' ? styles.activeTab : ''}`}
          onClick={() => setFilterMode('SENSITIVE')}
        >
          🔒 Confidential & Sensitive Cases ({sensitiveComplaints.length})
        </button>
        <button
          className={`${styles.tabBtn} ${filterMode === 'ANONYMOUS' ? styles.activeTab : ''}`}
          onClick={() => setFilterMode('ANONYMOUS')}
        >
          🕵️ Anonymous Reports ({anonymousComplaints.length})
        </button>
        <button
          className={`${styles.tabBtn} ${filterMode === 'ALL' ? styles.activeTab : ''}`}
          onClick={() => setFilterMode('ALL')}
        >
          📋 All Campus Tickets ({complaints.length})
        </button>
      </div>

      {/* Table Section */}
      <div className={styles.tableSection}>
        {displayedComplaints.length === 0 ? (
          <EmptyState
            title="No Matching Grievance Cases"
            description="No active cases match this confidentiality filter."
          />
        ) : (
          <ComplaintQueueTable
            complaints={displayedComplaints}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
          />
        )}
      </div>

      {/* Detail Modal */}
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

      {/* Resolution Modal */}
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
