import React from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '../Base/Card';
import { Button } from '../Base/Button';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { SLATimer } from './SLATimer';
import styles from './ComplaintCard.module.css';

export function ComplaintCard({ complaint, onActionClick, className = '' }) {
  return (
    <Card className={className}>
      <CardHeader className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.id}>{complaint.id}</span>
          <StatusBadge status={complaint.status} />
        </div>
        <h3 className={styles.title}>{complaint.title}</h3>
      </CardHeader>
      
      <CardBody className={styles.body}>
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.label}>Category:</span>
            <span>{complaint.category}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.label}>Location:</span>
            <span>{complaint.location}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.label}>Impact:</span>
            <span>{complaint.impact}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.label}>Priority:</span>
            <PriorityBadge 
              priority={complaint.priority} 
              score={complaint.priorityScore} 
              showScore={true} 
            />
          </div>
        </div>
      </CardBody>

      <CardFooter className={styles.footer}>
        <SLATimer 
          deadline={complaint.slaDeadline} 
          status={complaint.status} 
          resolvedAt={complaint.resolution?.resolvedAt} 
        />
        <Button variant="outline" onClick={() => onActionClick && onActionClick(complaint)}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
