import React from 'react';
import styles from './ComplaintTimeline.module.css';

export function ComplaintTimeline({ events, className = '' }) {
  return (
    <div className={`${styles.timeline} ${className}`}>
      {events.map((event, idx) => (
        <div key={idx} className={styles.item}>
          <div className={styles.connector}>
            <div className={styles.dot}></div>
            {idx !== events.length - 1 && <div className={styles.line}></div>}
          </div>
          <div className={styles.content}>
            <div className={styles.header}>
              <span className={styles.title}>{event.title}</span>
              <span className={styles.time}>{new Date(event.timestamp).toLocaleString()}</span>
            </div>
            {event.description && <p className={styles.description}>{event.description}</p>}
            {event.author && <span className={styles.author}>by {event.author}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
