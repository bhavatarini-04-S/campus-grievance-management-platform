import React from 'react';
import styles from './Navbar.module.css';

export function Navbar({ onMenuClick, title = "CampusFix AI", className = '' }) {
  return (
    <header className={`${styles.navbar} ${className}`}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenuClick}>
          ☰
        </button>
        <h1 className={styles.brand}>{title}</h1>
      </div>
      <div className={styles.right}>
        <button className={styles.profileBtn}>
          <div className={styles.avatar}>U</div>
        </button>
      </div>
    </header>
  );
}
