import React from 'react';
import { Card } from './Card';
import styles from './StatCard.module.css';

export function StatCard({ title, value, trend, icon, className = '' }) {
  return (
    <Card className={`${styles.statCard} ${className}`}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
      <div className={styles.body}>
        <span className={styles.value}>{value}</span>
        {trend && (
          <span className={`${styles.trend} ${trend > 0 ? styles.positive : styles.negative}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </Card>
  );
}
