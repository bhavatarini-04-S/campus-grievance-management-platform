import React from 'react';
import styles from './Card.module.css';

export function Card({ children, className = '', ...props }) {
  return <div className={`${styles.card} ${className}`} {...props}>{children}</div>;
}

export function CardHeader({ title, children, className = '', ...props }) {
  return (
    <div className={`${styles.header} ${className}`} {...props}>
      {title && <h3 className={styles.title}>{title}</h3>}
      {children}
    </div>
  );
}

export function CardBody({ children, className = '', ...props }) {
  return <div className={`${styles.body} ${className}`} {...props}>{children}</div>;
}

export function CardFooter({ children, className = '', ...props }) {
  return <div className={`${styles.footer} ${className}`} {...props}>{children}</div>;
}
