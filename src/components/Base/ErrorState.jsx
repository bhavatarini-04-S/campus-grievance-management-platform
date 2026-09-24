import React from 'react';
import { Button } from './Button';
import styles from './ErrorState.module.css';

export function ErrorState({ 
  title = 'Something went wrong', 
  message = 'An unexpected error occurred while processing this request.', 
  onRetry = null,
  className = '' 
}) {
  return (
    <div className={`${styles.container} ${className}`} role="alert">
      <div className={styles.icon}>⚠️</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className={styles.retryBtn}>
          Try Again
        </Button>
      )}
    </div>
  );
}
