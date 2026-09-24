import React from 'react';
import styles from './LoadingState.module.css';

export function LoadingState({ message = 'Loading...', size = 'medium', className = '' }) {
  const sizeClass = styles[size] || styles.medium || '';

  return (
    <div 
      className={`${styles.container} ${sizeClass} ${className}`} 
      role="status" 
      aria-live="polite"
      data-testid="loading-state"
    >
      <div className={styles.spinner}></div>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
