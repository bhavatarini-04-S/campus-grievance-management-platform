import React, { useState } from 'react';
import styles from './Tabs.module.css';

export function Tabs({ tabs, defaultTab, className = '' }) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id);

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.tabList}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.tabPanel}>
        {tabs.find(t => t.id === activeTab)?.content}
      </div>
    </div>
  );
}
