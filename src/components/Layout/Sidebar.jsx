import React from 'react';
import styles from './Sidebar.module.css';

export function Sidebar({ isOpen, onClose, links, className = '' }) {
  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose}></div>}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${className}`}>
        <nav className={styles.nav}>
          {links.map((link, idx) => (
            <a key={idx} href={link.href} className={`${styles.link} ${link.active ? styles.active : ''}`}>
              <span className={styles.icon}>{link.icon}</span>
              <span className={styles.label}>{link.label}</span>
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}
