import React, { useState, useMemo } from 'react';
import { useComplaints } from '../../context/useComplaints';
import { StatCard } from '../Base/StatCard';
import { Button } from '../Base/Button';
import { Select, Input } from '../Base/Forms';
import { ComplaintQueueTable } from './ComplaintQueueTable';
import { ComplaintDetailModal } from './ComplaintDetailModal';
import { ResolutionModal } from './ResolutionModal';
import { ComplaintCard } from '../CampusFix/ComplaintCard';
import { COMPLAINT_STATUS } from '../../services/workflowEngine';
import { SLA_STATES, getSLAState } from '../../services/slaConfig';
import { STAFF_ROSTER } from '../../services/assignmentEngine';
import styles from './StaffDashboard.module.css';

export function StaffDashboard() {
  const {
    complaints,
    activeRole,
    currentUser,
    acknowledgeComplaint,
    startProgress,
    resolveComplaint,
    reopenComplaint,
    assignStaffToComplaint,
    addComplaint,
    checkSLABreaches
  } = useComplaints();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [slaStateFilter, setSlaStateFilter] = useState('ALL');
  const [staffFilter, setStaffFilter] = useState('ALL');
  const [quickFilter, setQuickFilter] = useState('ALL');

  // Modals state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolvingComplaint, setResolvingComplaint] = useState(null);
  const [showNewSimModal, setShowNewSimModal] = useState(false);

  // New Complaint Simulation Form State
  const [simTitle, setSimTitle] = useState('');
  const [simDesc, setSimDesc] = useState('');
  const [simCategory, setSimCategory] = useState('Safety & Security');
  const [simLocation, setSimLocation] = useState('');
  const [simImpact, setSimImpact] = useState('CRITICAL');

  // Derive stats dynamically from live complaints array
  const stats = useMemo(() => {
    let totalAssigned = 0;
    let newReceived = 0;
    let acknowledged = 0;
    let inProgress = 0;
    let resolved = 0;
    let atRisk = 0;
    let breached = 0;
    let critical = 0;
    let highImpact = 0;

    complaints.forEach(c => {
      const slaState = getSLAState(c.slaDeadline, c.status, c.resolution?.resolvedAt);

      if (c.assignedStaff?.id === currentUser?.id) {
        totalAssigned++;
      }
      if (c.status === COMPLAINT_STATUS.RECEIVED) newReceived++;
      if (c.status === COMPLAINT_STATUS.ACKNOWLEDGED) acknowledged++;
      if (c.status === COMPLAINT_STATUS.IN_PROGRESS) inProgress++;
      if (c.status === COMPLAINT_STATUS.RESOLVED) resolved++;
      if (slaState === SLA_STATES.AT_RISK) atRisk++;
      if (slaState === SLA_STATES.SLA_BREACHED || c.escalationState === 'ESCALATED') breached++;
      if (c.priority === 'CRITICAL') critical++;
      if ((c.impact || '').toUpperCase().includes('HIGH') || (c.impact || '').toUpperCase().includes('CRITICAL')) {
        highImpact++;
      }
    });

    return {
      totalAssigned,
      newReceived,
      acknowledged,
      inProgress,
      resolved,
      atRisk,
      breached,
      critical,
      highImpact
    };
  }, [complaints, currentUser]);

  // Categories and departments for dropdowns
  const categories = useMemo(() => {
    return Array.from(new Set(complaints.map(c => c.category))).filter(Boolean);
  }, [complaints]);

  const departments = useMemo(() => {
    return Array.from(new Set(complaints.map(c => c.department))).filter(Boolean);
  }, [complaints]);

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = c.id.toLowerCase().includes(query);
        const matchesTitle = c.title.toLowerCase().includes(query);
        const matchesDesc = (c.description || '').toLowerCase().includes(query);
        const matchesLoc = (c.location || '').toLowerCase().includes(query);
        const matchesStudent = !c.isAnonymous && (c.student?.name || '').toLowerCase().includes(query);
        if (!matchesId && !matchesTitle && !matchesDesc && !matchesLoc && !matchesStudent) {
          return false;
        }
      }

      // 2. Quick Filter
      const slaState = getSLAState(c.slaDeadline, c.status, c.resolution?.resolvedAt);
      if (quickFilter === 'MY_QUEUE' && c.assignedStaff?.id !== currentUser?.id) return false;
      if (quickFilter === 'BREACHED' && slaState !== SLA_STATES.SLA_BREACHED && c.escalationState !== 'ESCALATED') return false;
      if (quickFilter === 'AT_RISK' && slaState !== SLA_STATES.AT_RISK) return false;
      if (quickFilter === 'CRITICAL' && c.priority !== 'CRITICAL') return false;
      if (quickFilter === 'NEW' && c.status !== COMPLAINT_STATUS.RECEIVED) return false;
      if (quickFilter === 'RESOLVED' && c.status !== COMPLAINT_STATUS.RESOLVED) return false;

      // 3. Status filter
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;

      // 4. Priority filter
      if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) return false;

      // 5. Category filter
      if (categoryFilter !== 'ALL' && c.category !== categoryFilter) return false;

      // 6. Department filter
      if (departmentFilter !== 'ALL' && c.department !== departmentFilter) return false;

      // 7. SLA State filter
      if (slaStateFilter !== 'ALL' && slaState !== slaStateFilter) return false;

      // 8. Assigned Staff filter
      if (staffFilter === 'ME') {
        if (c.assignedStaff?.id !== currentUser?.id) return false;
      } else if (staffFilter === 'UNASSIGNED') {
        if (c.assignedStaff) return false;
      } else if (staffFilter !== 'ALL') {
        if (c.assignedStaff?.id !== staffFilter) return false;
      }

      return true;
    });
  }, [
    complaints,
    searchQuery,
    quickFilter,
    statusFilter,
    priorityFilter,
    categoryFilter,
    departmentFilter,
    slaStateFilter,
    staffFilter,
    currentUser
  ]);

  // Recent complaints (last 4 created or updated)
  const recentComplaints = useMemo(() => {
    return [...complaints]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [complaints]);

  // Handler for creating a simulated complaint
  const handleSimulateSubmit = (e) => {
    e.preventDefault();
    if (!simTitle.trim()) return;

    addComplaint({
      title: simTitle.trim(),
      description: simDesc.trim() || 'Simulated user complaint for priority engine testing.',
      category: simCategory,
      department: simCategory === 'Electrical' ? 'Electrical' : simCategory === 'IT Services' ? 'IT Services' : 'Safety & Security',
      location: simLocation.trim() || 'Main Campus Plaza',
      impact: simImpact,
      supportCount: Math.floor(Math.random() * 20) + 1,
      clusterSize: 1,
      isAnonymous: false,
      isSensitive: false,
      student: {
        id: 'STU-SIM',
        name: 'Simulated Student',
        email: 'student.test@campus.edu',
        room: 'Campus Hostels'
      }
    });

    setSimTitle('');
    setSimDesc('');
    setSimLocation('');
    setShowNewSimModal(false);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setCategoryFilter('ALL');
    setDepartmentFilter('ALL');
    setSlaStateFilter('ALL');
    setStaffFilter('ALL');
    setQuickFilter('ALL');
  };

  // Sync selectedComplaint if modified in context
  const activeSelectedComplaint = selectedComplaint 
    ? complaints.find(c => c.id === selectedComplaint.id) || selectedComplaint 
    : null;

  return (
    <div className={styles.dashboard}>
      {/* Top Banner Notice for Staff Portal */}
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeText}>
          <h2>CampusFix Staff Operations Center</h2>
          <p>
            Real-time complaint triage, explainable AI priority dispatch, SLA tracking, and workflow management.
          </p>
        </div>
        <div className={styles.welcomeActions}>
          <Button 
            variant="outline"
            onClick={checkSLABreaches}
            title="Scan active tickets against deadline clock"
          >
            ⏱ Check SLA Breaches
          </Button>
          <Button 
            variant="primary"
            onClick={() => setShowNewSimModal(true)}
          >
            + Test Priority Engine
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className={styles.statsGrid}>
        <StatCard 
          title="Assigned to You" 
          value={stats.totalAssigned} 
          icon="👤"
          className={styles.statAssigned}
        />
        <StatCard 
          title="New Received" 
          value={stats.newReceived} 
          icon="📥" 
        />
        <StatCard 
          title="Acknowledged" 
          value={stats.acknowledged} 
          icon="👁" 
        />
        <StatCard 
          title="In Progress" 
          value={stats.inProgress} 
          icon="⚙️" 
        />
        <StatCard 
          title="Resolved" 
          value={stats.resolved} 
          icon="✅" 
        />
        <StatCard 
          title="SLA At Risk" 
          value={stats.atRisk} 
          icon="⏳"
          className={stats.atRisk > 0 ? styles.statWarning : ''}
        />
        <StatCard 
          title="SLA Breached" 
          value={stats.breached} 
          icon="🚨"
          className={stats.breached > 0 ? styles.statDanger : ''}
        />
        <StatCard 
          title="Critical Priority" 
          value={stats.critical} 
          icon="🔥"
          className={stats.critical > 0 ? styles.statDanger : ''}
        />
        <StatCard 
          title="High Impact" 
          value={stats.highImpact} 
          icon="👥" 
        />
      </div>

      {/* Quick Filter Chips */}
      <div className={styles.quickChipsBar}>
        <span className={styles.quickLabel}>Quick Filters:</span>
        <button
          className={`${styles.chip} ${quickFilter === 'ALL' ? styles.chipActive : ''}`}
          onClick={() => setQuickFilter('ALL')}
        >
          All Complaints ({complaints.length})
        </button>
        <button
          className={`${styles.chip} ${quickFilter === 'MY_QUEUE' ? styles.chipActive : ''}`}
          onClick={() => setQuickFilter('MY_QUEUE')}
        >
          👤 My Assigned ({stats.totalAssigned})
        </button>
        <button
          className={`${styles.chip} ${styles.chipDanger} ${quickFilter === 'BREACHED' ? styles.chipActive : ''}`}
          onClick={() => setQuickFilter('BREACHED')}
        >
          🚨 SLA Breached ({stats.breached})
        </button>
        <button
          className={`${styles.chip} ${styles.chipWarning} ${quickFilter === 'AT_RISK' ? styles.chipActive : ''}`}
          onClick={() => setQuickFilter('AT_RISK')}
        >
          ⏳ SLA At Risk ({stats.atRisk})
        </button>
        <button
          className={`${styles.chip} ${quickFilter === 'CRITICAL' ? styles.chipActive : ''}`}
          onClick={() => setQuickFilter('CRITICAL')}
        >
          🔥 Critical ({stats.critical})
        </button>
        <button
          className={`${styles.chip} ${quickFilter === 'NEW' ? styles.chipActive : ''}`}
          onClick={() => setQuickFilter('NEW')}
        >
          📥 New ({stats.newReceived})
        </button>
        <button
          className={`${styles.chip} ${quickFilter === 'RESOLVED' ? styles.chipActive : ''}`}
          onClick={() => setQuickFilter('RESOLVED')}
        >
          ✓ Resolved ({stats.resolved})
        </button>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className={styles.filterToolbar}>
        <div className={styles.searchWrapper}>
          <Input 
            placeholder="Search by ID, keyword, location, or reporter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: COMPLAINT_STATUS.RECEIVED, label: 'Received' },
              { value: COMPLAINT_STATUS.ACKNOWLEDGED, label: 'Acknowledged' },
              { value: COMPLAINT_STATUS.IN_PROGRESS, label: 'In Progress' },
              { value: COMPLAINT_STATUS.RESOLVED, label: 'Resolved' }
            ]}
          />

          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Priorities' },
              { value: 'CRITICAL', label: 'Critical' },
              { value: 'HIGH', label: 'High' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'LOW', label: 'Low' }
            ]}
          />

          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Categories' },
              ...categories.map(c => ({ value: c, label: c }))
            ]}
          />

          <Select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Departments' },
              ...departments.map(d => ({ value: d, label: d }))
            ]}
          />

          <Select
            value={slaStateFilter}
            onChange={(e) => setSlaStateFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All SLA States' },
              { value: SLA_STATES.ON_TRACK, label: 'On Track' },
              { value: SLA_STATES.AT_RISK, label: 'At Risk' },
              { value: SLA_STATES.SLA_BREACHED, label: 'SLA Breached' },
              { value: SLA_STATES.RESOLVED, label: 'Resolved' }
            ]}
          />

          <Select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Staff' },
              { value: 'ME', label: 'Assigned to Me' },
              { value: 'UNASSIGNED', label: 'Unassigned' },
              ...STAFF_ROSTER.map(s => ({ value: s.id, label: s.name }))
            ]}
          />

          <Button 
            variant="ghost" 
            onClick={clearAllFilters}
            className={styles.resetBtn}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Main Complaint Queue Section */}
      <div className={styles.queueSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className="section-title">Complaint Queue</h3>
            <span className={styles.resultsCount}>
              Showing {filteredComplaints.length} complaint{filteredComplaints.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <ComplaintQueueTable
          complaints={filteredComplaints}
          onSelectComplaint={(complaint) => setSelectedComplaint(complaint)}
        />
      </div>

      {/* Recent Complaints Showcase Grid */}
      <div className={styles.recentSection}>
        <h3 className="section-title" style={{ marginBottom: 'var(--spacing-md)' }}>
          Recent Activity & Complaints
        </h3>
        <div className={styles.recentGrid}>
          {recentComplaints.map(c => (
            <ComplaintCard
              key={c.id}
              complaint={c}
              onActionClick={(item) => setSelectedComplaint(item)}
            />
          ))}
        </div>
      </div>

      {/* Complaint Detail Modal */}
      {activeSelectedComplaint && (
        <ComplaintDetailModal
          isOpen={!!activeSelectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          complaint={activeSelectedComplaint}
          currentUser={currentUser}
          activeRole={activeRole}
          onAcknowledge={acknowledgeComplaint}
          onStartProgress={startProgress}
          onOpenResolveModal={(complaint) => {
            setResolvingComplaint(complaint);
          }}
          onReopen={reopenComplaint}
          onAssignStaff={assignStaffToComplaint}
        />
      )}

      {/* Resolution Submission Modal */}
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

      {/* Simulation / Test Modal for testing new complaints & Priority Engine live */}
      {showNewSimModal && (
        <div className={styles.simModalOverlay} onClick={() => setShowNewSimModal(false)}>
          <div className={styles.simModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.simHeader}>
              <h3>Test AI Priority Engine & SLA Dispatch</h3>
              <button className={styles.simClose} onClick={() => setShowNewSimModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSimulateSubmit} className={styles.simForm}>
              <p className={styles.simHelp}>
                Submit a test complaint to see the explainable Priority Engine calculate scores from keywords, location, and impact in real time:
              </p>
              
              <div className={styles.quickPresetButtons}>
                <span className={styles.presetLabel}>Quick Presets:</span>
                <button 
                  type="button" 
                  className={styles.presetBtn}
                  onClick={() => {
                    setSimTitle('Gas leak detected near hostel mess kitchen');
                    setSimDesc('Immediate smell of leaking LPG cylinders near commercial burners. Danger of explosion.');
                    setSimCategory('Safety & Security');
                    setSimLocation('Hostel Block A Kitchen');
                    setSimImpact('CRITICAL');
                  }}
                >
                  🔥 Emergency: Gas Leak (Critical, 2h SLA)
                </button>
                <button 
                  type="button" 
                  className={styles.presetBtn}
                  onClick={() => {
                    setSimTitle('Classroom projector HDMI port loose in LH-102');
                    setSimDesc('Cable needs to be held at angle to project slides during seminar.');
                    setSimCategory('IT Services');
                    setSimLocation('Lecture Hall 102');
                    setSimImpact('LOW');
                  }}
                >
                  📽 Routine: Projector (Low, 48h SLA)
                </button>
              </div>

              <Input
                label="Complaint Title *"
                placeholder="e.g. Electrical hazard in chemistry lab"
                value={simTitle}
                onChange={(e) => setSimTitle(e.target.value)}
                required
              />

              <Input
                label="Description"
                placeholder="Details of the hazard or grievance..."
                value={simDesc}
                onChange={(e) => setSimDesc(e.target.value)}
              />

              <div className={styles.simGrid}>
                <Select
                  label="Category"
                  value={simCategory}
                  onChange={(e) => setSimCategory(e.target.value)}
                  options={[
                    { value: 'Safety & Security', label: 'Safety & Security' },
                    { value: 'Electrical', label: 'Electrical' },
                    { value: 'Plumbing', label: 'Plumbing' },
                    { value: 'IT Services', label: 'IT Services' },
                    { value: 'Hostel', label: 'Hostel' },
                    { value: 'Sanitation', label: 'Sanitation' },
                    { value: 'Academic', label: 'Academic' }
                  ]}
                />

                <Input
                  label="Location"
                  placeholder="e.g. Hostel Kitchen, Main Server Room"
                  value={simLocation}
                  onChange={(e) => setSimLocation(e.target.value)}
                />
              </div>

              <Select
                label="Reported Impact"
                value={simImpact}
                onChange={(e) => setSimImpact(e.target.value)}
                options={[
                  { value: 'CRITICAL', label: 'CRITICAL (Severe hazard / mass impact)' },
                  { value: 'HIGH', label: 'HIGH (Significant disruption)' },
                  { value: 'MEDIUM', label: 'MEDIUM (Normal operational issue)' },
                  { value: 'LOW', label: 'LOW (Minor inconvenience)' }
                ]}
              />

              <div className={styles.simActions}>
                <Button variant="outline" type="button" onClick={() => setShowNewSimModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Evaluate & Create Complaint
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
