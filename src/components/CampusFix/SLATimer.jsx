import React, { useEffect, useState } from 'react';
import { formatSLACountdown, getSLAState, SLA_STATES } from '../../services/slaConfig';
import styles from './SLATimer.module.css';

/**
 * Reusable SLATimer component displaying real-time countdown / overdue state.
 * @param {Object} props
 * @param {string|Date} props.deadline - ISO timestamp of SLA target
 * @param {string} [props.status] - Complaint status (e.g. RECEIVED, IN_PROGRESS, RESOLVED)
 * @param {string|Date} [props.resolvedAt] - Resolution timestamp if resolved
 * @param {string} [props.className] - Optional extra class
 * @param {boolean} [props.showIcon] - Whether to show the status icon
 */
export function SLATimer({ 
  deadline, 
  status = 'RECEIVED', 
  resolvedAt = null, 
  className = '',
  showIcon = true 
}) {
  const [displayText, setDisplayText] = useState(() => formatSLACountdown(deadline, status, resolvedAt));
  const [slaState, setSlaState] = useState(() => getSLAState(deadline, status, resolvedAt));

  useEffect(() => {
    const update = () => {
      setDisplayText(formatSLACountdown(deadline, status, resolvedAt));
      setSlaState(getSLAState(deadline, status, resolvedAt));
    };

    update();
    // Update every 10 seconds for real-time fidelity
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, [deadline, status, resolvedAt]);

  let statusClass = styles.normal;
  let icon = '⏱';

  if (slaState === SLA_STATES.RESOLVED) {
    statusClass = styles.resolved;
    icon = '✓';
  } else if (slaState === SLA_STATES.SLA_BREACHED) {
    statusClass = styles.breached;
    icon = '🚨';
  } else if (slaState === SLA_STATES.AT_RISK) {
    statusClass = styles.warning;
    icon = '⚠️';
  }

  const tooltip = deadline ? `SLA Deadline: ${new Date(deadline).toLocaleString()}` : '';

  return (
    <div 
      className={`${styles.timer} ${statusClass} ${className}`} 
      title={tooltip}
      data-testid="sla-timer"
    >
      {showIcon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.text}>{displayText}</span>
    </div>
  );
}
