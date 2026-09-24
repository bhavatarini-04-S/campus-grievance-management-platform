import React from 'react';
import styles from './EmptyState.module.css';

export function EmptyState({ 
  icon = '📂', 
  title = 'No complaints found', 
  description = 'Try changing your search terms or clearing some filters.',
  action = null,
  className = '' 
}) {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
