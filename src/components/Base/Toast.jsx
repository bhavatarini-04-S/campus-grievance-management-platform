import React, { useEffect, useState } from 'react';
import styles from './Toast.module.css';

export function Toast({ message, type = 'info', duration = 3000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span className={styles.message}>{message}</span>
      <button className={styles.close} onClick={() => { setVisible(false); if (onClose) onClose(); }}>&times;</button>
    </div>
  );
}

export function ToastContainer({ children }) {
  return <div className={styles.container}>{children}</div>;
}
