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
import styles from './SupervisorDashboard.module.css';

export function SupervisorDashboard() {
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
    assignStaffToComplaint,
    checkSLABreaches
  } = useComplaints();

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolvingComplaint, setResolvingComplaint] = useState(null);
  const [filterType, setFilterType] = useState('ESCALATED'); // 'ESCALATED' | 'ALL'

  // Loading state
  if (isLoading || loading) {
    return <LoadingState message="Loading supervisor escalation operations..." size="large" />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState 
        title="Failed to Load Supervisor Center" 
        message={error} 
        onRetry={refreshData} 
      />
    );
  }

  // Empty state
  if (!complaints || complaints.length === 0) {
    return (
      <EmptyState
        title="No campus complaints registered"
        description="The complaint database is currently empty."
      />
    );
  }

  const escalatedComplaints = complaints.filter(c => 
    c.escalationState === 'ESCALATED' || 
    c.escalationState === 'AT_RISK' ||
    c.status === 'SLA_BREACHED'
  );

  const displayedComplaints = filterType === 'ESCALATED' ? escalatedComplaints : complaints;

  const activeSelectedComplaint = selectedComplaint 
    ? complaints.find(c => c.id === selectedComplaint.id) || selectedComplaint 
    : null;

  return (
    <div className={styles.container}>
      {/* Supervisor Header */}
      <div className={styles.header}>
        <div>
          <h2>Supervisor Operations & Escalation Center</h2>
          <p>
            Department oversight, Level 1 SLA breach triage, cross-team reassignments, and ticket reopening authorizations.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" onClick={checkSLABreaches}>
            ⏱ Scan SLA Breaches
          </Button>
          <Button variant="primary" onClick={refreshData}>
            🔄 Refresh Data
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.statsGrid}>
        <StatCard 
          title="Escalated Incidents" 
          value={complaints.filter(c => c.escalationState === 'ESCALATED').length} 
          icon="🚨" 
        />
        <StatCard 
          title="SLA At Risk" 
          value={complaints.filter(c => c.escalationState === 'AT_RISK').length} 
          icon="⏳" 
        />
        <StatCard 
          title="Critical Incidents" 
          value={complaints.filter(c => c.priority === 'CRITICAL').length} 
          icon="🔥" 
        />
        <StatCard 
          title="Total Campus Tickets" 
          value={complaints.length} 
          icon="📋" 
        />
      </div>

      {/* Filter Tabs */}
      <div className={styles.tabsRow}>
        <button
          className={`${styles.tabBtn} ${filterType === 'ESCALATED' ? styles.activeTab : ''}`}
          onClick={() => setFilterType('ESCALATED')}
        >
          🚨 Escalations & At-Risk Queue ({escalatedComplaints.length})
        </button>
        <button
          className={`${styles.tabBtn} ${filterType === 'ALL' ? styles.activeTab : ''}`}
          onClick={() => setFilterType('ALL')}
        >
          📋 All Department Tickets ({complaints.length})
        </button>
      </div>

      {/* Queue Table */}
      <div className={styles.tableSection}>
        {displayedComplaints.length === 0 ? (
          <EmptyState
            title="No Escalated Tickets"
            description="All campus tickets are currently within their SLA response windows. No supervisor intervention is required."
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
