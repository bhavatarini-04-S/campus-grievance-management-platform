import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Sidebar.module.css';

export function Sidebar({ isOpen, onClose, links, className = '' }) {
  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose}></div>}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${className}`}>
        <nav className={styles.nav}>
          {links.map((link, idx) => {
            const LinkComponent = link.href.startsWith('http') ? 'a' : Link;
            return (
              <LinkComponent
                key={idx}
                to={!link.href.startsWith('http') ? link.href : undefined}
                href={link.href.startsWith('http') ? link.href : undefined}
                className={`${styles.link} ${link.active ? styles.active : ''}`}
                onClick={onClose}
              >
                <span className={styles.icon}>{link.icon}</span>
                <span className={styles.label}>{link.label}</span>
              </LinkComponent>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
