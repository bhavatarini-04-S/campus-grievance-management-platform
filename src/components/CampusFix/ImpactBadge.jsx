import React from 'react';
import { Badge } from '../Base/Badge';
import styles from './ImpactBadge.module.css';

export function ImpactBadge({ impact, showScore = false, showExplanation = false, className = '' }) {
  if (!impact) {
    return null;
  }

  const { score, level, explanation } = impact;

  const getVariant = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'muted';
      default:
        return 'muted';
    }
  };

  const getIcon = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const variant = getVariant(level);
  const icon = getIcon(level);

  return (
    <div className={`${styles.container} ${className}`}>
      <Badge variant={variant} className={styles.badge}>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.level}>{level}</span>
        {showScore && <span className={styles.score}>({Math.round(score * 100)}%)</span>}
      </Badge>
      
      {showExplanation && explanation && (
        <div className={styles.explanation}>
          {explanation}
        </div>
      )}
    </div>
  );
}