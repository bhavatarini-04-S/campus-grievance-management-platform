import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Sidebar.module.css';

export function Sidebar({ isOpen, onClose, links, onNavigate, className = '' }) {
  const handleLinkClick = (e, link) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(link.href);
    }
    if (onClose) onClose();
  };

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose}></div>}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${className}`}>
        <nav className={styles.nav}>
          {links.map((link, idx) => (
            <Link 
              key={idx} 
              to={link.href || '#'} 
              className={`${styles.link} ${link.active ? styles.active : ''}`}
              onClick={(e) => handleLinkClick(e, link)}
            >
              <span className={styles.icon}>{link.icon}</span>
              <span className={styles.label}>{link.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
