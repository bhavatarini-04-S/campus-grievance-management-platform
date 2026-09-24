import React, { useState } from 'react';
import { useComplaints } from '../../context/useComplaints';
import { StatCard } from '../Base/StatCard';
import { Button } from '../Base/Button';
import { LoadingState } from '../Base/LoadingState';
import { ErrorState } from '../Base/ErrorState';
import { EmptyState } from '../Base/EmptyState';
import { ComplaintCard } from '../CampusFix/ComplaintCard';
import { ComplaintDetailModal } from '../Staff/ComplaintDetailModal';
import { Input, Textarea, Select } from '../Base/Forms';
import styles from './StudentDashboard.module.css';

export function StudentDashboard() {
  const {
    complaints,
    isLoading,
    loading,
    error,
    refreshData,
    currentUser,
    activeRole,
    addComplaint
  } = useComplaints();

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Hostel');
  const [location, setLocation] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Loading state
  if (isLoading || loading) {
    return <LoadingState message="Loading your student portal and grievance history..." size="large" />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState 
        title="Failed to Load Student Portal" 
        message={error} 
        onRetry={refreshData} 
      />
    );
  }

  // Student's complaints (either submitted by them or general campus complaints)
  const myComplaints = complaints.filter(c => 
    c.student?.id === currentUser?.id || 
    c.student?.name === currentUser?.name ||
    c.category === 'Hostel' ||
    c.category === 'IT Services'
  );

  const handleSubmitNew = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addComplaint({
      title: title.trim(),
      description: desc.trim() || 'Student reported issue.',
      category,
      department: category === 'Electrical' ? 'Electrical' : category === 'IT Services' ? 'IT Services' : 'Hostel Administration',
      location: location.trim() || 'Student Hostel Block',
      impact: 'MEDIUM',
      supportCount: 1,
      clusterSize: 1,
      isAnonymous,
      isSensitive: false,
      student: {
        id: currentUser?.id || 'STU-STUDENT',
        name: currentUser?.name || 'Student Reporter',
        email: currentUser?.email || 'student@campus.edu',
        room: 'Campus Resident'
      }
    });

    setTitle('');
    setDesc('');
    setLocation('');
    setShowSubmitModal(false);
  };

  return (
    <div className={styles.container}>
      {/* Student Welcome Header */}
      <div className={styles.header}>
        <div>
          <h2>Student Grievance & Support Center</h2>
          <p>Report maintenance or safety issues, track real-time resolution SLA, and support fellow student requests.</p>
        </div>
        <Button variant="primary" onClick={() => setShowSubmitModal(true)}>
          + Report New Issue
        </Button>
      </div>

      {/* Quick Summary Cards */}
      <div className={styles.statsGrid}>
        <StatCard title="My Active Issues" value={myComplaints.filter(c => c.status !== 'RESOLVED').length} icon="📋" />
        <StatCard title="Resolved Issues" value={myComplaints.filter(c => c.status === 'RESOLVED').length} icon="✅" />
        <StatCard title="Total Campus Reports" value={complaints.length} icon="🏛️" />
      </div>

      {/* Main Student Complaint Feed */}
      <div className={styles.feedSection}>
        <h3 className="section-title">My Tracked Grievances</h3>
        {myComplaints.length === 0 ? (
          <EmptyState
            title="No grievances reported yet"
            description="You currently have no open or resolved grievances. Need something fixed in your hostel or department?"
            action={
              <Button variant="primary" onClick={() => setShowSubmitModal(true)}>
                + Submit Your First Grievance
              </Button>
            }
          />
        ) : (
          <div className={styles.grid}>
            {myComplaints.map(c => (
              <ComplaintCard
                key={c.id}
                complaint={c}
                onActionClick={(item) => setSelectedComplaint(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <ComplaintDetailModal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          complaint={selectedComplaint}
          currentUser={currentUser}
          activeRole={activeRole}
          onAcknowledge={() => ({ success: false, error: 'Students cannot acknowledge complaints.' })}
          onStartProgress={() => ({ success: false, error: 'Students cannot alter progress states.' })}
          onOpenResolveModal={() => {}}
          onReopen={() => ({ success: false, error: 'Only supervisors can reopen tickets.' })}
          onAssignStaff={() => ({ success: false, error: 'Students cannot assign staff.' })}
        />
      )}

      {/* Submit Grievance Modal */}
      {showSubmitModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSubmitModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Report a Campus Issue</h3>
              <button className={styles.closeBtn} onClick={() => setShowSubmitModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmitNew} className={styles.form}>
              <Input
                label="Problem Title *"
                placeholder="e.g. Broken water tap in Block B 2nd floor restroom"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Textarea
                label="Detailed Description"
                placeholder="Explain the problem and any immediate safety hazards..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
              />
              <div className={styles.formRow}>
                <Select
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={[
                    { value: 'Hostel', label: 'Hostel' },
                    { value: 'Electrical', label: 'Electrical' },
                    { value: 'Plumbing', label: 'Plumbing' },
                    { value: 'IT Services', label: 'IT Services / Wi-Fi' },
                    { value: 'Sanitation', label: 'Sanitation & Mess' },
                    { value: 'Safety & Security', label: 'Safety & Security' }
                  ]}
                />
                <Input
                  label="Exact Location"
                  placeholder="e.g. Hostel B Room 204 or Library 2nd Floor"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className={styles.checkboxRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <span>Submit Anonymously (Hide my name and room number from ordinary maintenance staff)</span>
                </label>
              </div>
              <div className={styles.modalActions}>
                <Button variant="outline" type="button" onClick={() => setShowSubmitModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Submit Grievance
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
