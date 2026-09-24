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
            const isExternal = link.href && link.href.startsWith('http');
            const useAnchor = isExternal || !link.href || link.href === '#';
            const LinkComponent = useAnchor ? 'a' : Link;

            return (
              <LinkComponent
                key={idx}
                to={!useAnchor ? link.href : undefined}
                href={useAnchor ? (link.href || '#') : undefined}
                className={`${styles.link} ${link.active ? styles.active : ''}`}
                onClick={(e) => {
                  if (link.onClick) {
                    link.onClick(e);
                  }
                  if (onClose) onClose();
                }}
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
