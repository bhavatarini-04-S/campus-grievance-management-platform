import React, { useState } from 'react';
import { useComplaints } from '../../context/useComplaints';
import { ROLES } from '../../services/workflowEngine';
import styles from './StaffNavbarControls.module.css';

export function StaffNavbarControls() {
  const {
    activeRole,
    switchRole,
    currentUser,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setSelectedComplaintId
  } = useComplaints();

  const [showNotifications, setShowNotifications] = useState(false);

  const roleLabels = {
    [ROLES.STAFF]: 'Staff (Rajesh - Electrician)',
    [ROLES.SUPERVISOR]: 'Supervisor (Dr. Sharma)',
    [ROLES.GRIEVANCE_OFFICER]: 'Grievance Officer (Prof. Menon)',
    [ROLES.ADMIN]: 'Admin (Dean Admin)',
    [ROLES.STUDENT]: 'Student (Ananya)'
  };

  return (
    <div className={styles.container}>
      {/* Role Switcher */}
      <div className={styles.roleSwitcher}>
        <span className={styles.roleLabel}>Active Role:</span>
        <select
          className={styles.roleSelect}
          value={activeRole}
          onChange={(e) => switchRole(e.target.value)}
          aria-label="Switch Role"
        >
          <option value={ROLES.STAFF}>{roleLabels[ROLES.STAFF]}</option>
          <option value={ROLES.SUPERVISOR}>{roleLabels[ROLES.SUPERVISOR]}</option>
          <option value={ROLES.GRIEVANCE_OFFICER}>{roleLabels[ROLES.GRIEVANCE_OFFICER]}</option>
          <option value={ROLES.ADMIN}>{roleLabels[ROLES.ADMIN]}</option>
          <option value={ROLES.STUDENT}>{roleLabels[ROLES.STUDENT]}</option>
        </select>
      </div>

      {/* Notifications Bell */}
      <div className={styles.notifWrapper}>
        <button
          className={styles.bellButton}
          onClick={() => setShowNotifications(!showNotifications)}
          aria-label="Notifications"
          title="Notifications"
        >
          <span className={styles.bellIcon}>🔔</span>
          {unreadNotificationsCount > 0 && (
            <span className={styles.badge}>{unreadNotificationsCount}</span>
          )}
        </button>

        {showNotifications && (
          <div className={styles.notifDropdown}>
            <div className={styles.notifHeader}>
              <span className={styles.notifTitle}>Notifications</span>
              {unreadNotificationsCount > 0 && (
                <button 
                  className={styles.markAllBtn}
                  onClick={markAllNotificationsAsRead}
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className={styles.notifList}>
              {notifications.length === 0 ? (
                <div className={styles.emptyNotif}>No notifications</div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className={`${styles.notifItem} ${!n.read ? styles.unread : ''}`}
                    onClick={() => {
                      markNotificationAsRead(n.id);
                      if (n.complaintId) {
                        setSelectedComplaintId(n.complaintId);
                        setShowNotifications(false);
                      }
                    }}
                  >
                    <div className={styles.notifItemHeader}>
                      <span className={styles.itemTitle}>{n.title}</span>
                      <span className={styles.itemTime}>
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={styles.itemMsg}>{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Avatar & Info */}
      <div className={styles.userProfile}>
        <div className={styles.avatar}>
          {currentUser?.name ? currentUser.name[0] : 'U'}
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{currentUser?.name || 'Staff User'}</span>
          <span className={styles.userRoleTag}>{activeRole}</span>
        </div>
      </div>
    </div>
  );
}
