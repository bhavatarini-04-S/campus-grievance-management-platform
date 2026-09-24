import React from 'react';
import styles from './LoadingState.module.css';

export function LoadingState({ message = 'Loading...', size = 'medium', className = '' }) {
  return (
    <div className={`${styles.container} ${styles[size]} ${className}`} role="status" aria-live="polite">
      <div className={styles.spinner}></div>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
