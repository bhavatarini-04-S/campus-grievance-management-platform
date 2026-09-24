import React, { useEffect, useState } from 'react';
import styles from './SLATimer.module.css';

export function SLATimer({ deadline, className = '' }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [status, setStatus] = useState('normal'); // normal, warning, breached

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(deadline).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('SLA breached');
        setStatus('breached');
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      if (hours < 2) {
        setStatus('warning');
        if (hours === 0 && minutes < 30) setTimeLeft('SLA approaching');
        else setTimeLeft(`${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m remaining`);
      } else {
        setStatus('normal');
        setTimeLeft(`${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m remaining`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <div className={`${styles.timer} ${styles[status]} ${className}`}>
      <span className={styles.icon}>⏱</span>
      <span>{timeLeft}</span>
    </div>
  );
}
