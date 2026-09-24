import React from 'react';
import styles from './PageHeader.module.css';

export function PageHeader({ title, description, actions, className = '' }) {
  return (
    <div className={`${styles.header} ${className}`}>
      <div className={styles.titleSection}>
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
