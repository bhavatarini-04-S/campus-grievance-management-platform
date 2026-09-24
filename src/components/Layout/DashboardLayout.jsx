import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import styles from './DashboardLayout.module.css';

export function DashboardLayout({ children, sidebarLinks, navbarActions }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Navbar onMenuClick={() => setSidebarOpen(true)} actions={navbarActions} />
      <div className={styles.container}>
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          links={sidebarLinks} 
        />
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
