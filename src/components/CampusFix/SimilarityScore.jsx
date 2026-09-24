import React from 'react';
import { Badge } from '../Base/Badge';
import styles from './SimilarityScore.module.css';

export function SimilarityScore({ score, size = 'normal', showLabel = false, className = '' }) {
  const percentage = Math.round(score * 100);
  
  const getVariant = (score) => {
    if (score >= 0.85) return 'success';
    if (score >= 0.70) return 'warning';
    if (score >= 0.50) return 'info';
    return 'muted';
  };

  const getLabel = (score) => {
    if (score >= 0.85) return 'Very High';
    if (score >= 0.70) return 'High';
    if (score >= 0.50) return 'Medium';
    return 'Low';
  };

  const variant = getVariant(score);
  const label = getLabel(score);

  const sizeClasses = {
    small: styles.small,
    normal: styles.normal,
    large: styles.large,
    compact: styles.compact
  };

  if (size === 'compact') {
    return (
      <div className={`${styles.compact} ${className}`}>
        <span className={`${styles.bar} ${styles[variant]}`} style={{ width: `${percentage}%` }}></span>
        <span className={styles.percentage}>{percentage}%</span>
      </div>
    );
  }

  return (
    <div className={`${styles.score} ${sizeClasses[size] || sizeClasses.normal} ${className}`}>
      {showLabel && <span className={styles.label}>{label}</span>}
      <Badge variant={variant} className={styles.badge}>
        {percentage}%
      </Badge>
    </div>
  );
}