import React from 'react';
import styles from './Badge.module.css';

export function Badge({ 
  children, 
  variant = 'muted', 
  className = '', 
  ...props 
}) {
  const classes = `${styles.badge} ${styles[variant] || styles.muted} ${className}`;
  
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
