import React from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '../Base/Card';
import { Button } from '../Base/Button';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { SLATimer } from './SLATimer';
import { ImpactBadge } from './ImpactBadge';
import { SupportButton } from './SupportButton';
import styles from './ComplaintCard.module.css';

export function ComplaintCard({ complaint, onActionClick, onSupport, onRemoveSupport, userId, showAI = false, className = '' }) {
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
          {showAI && complaint.impact ? (
            <div className={styles.metaItem}>
              <span className={styles.label}>Impact:</span>
              <ImpactBadge impact={complaint.impact} />
            </div>
          ) : (
            <div className={styles.metaItem}>
              <span className={styles.label}>Impact:</span>
              <span>{complaint.impact}</span>
            </div>
          )}
          <div className={styles.metaItem}>
            <span className={styles.label}>Priority:</span>
            <PriorityBadge priority={complaint.priority} />
          </div>
        </div>
      </CardBody>

      <CardFooter className={styles.footer}>
        {showAI && (
          <SupportButton
            complaint={complaint}
            userId={userId}
            onUpvote={onSupport}
            onRemoveUpvote={onRemoveSupport}
          />
        )}
        {complaint.slaDeadline && <SLATimer deadline={complaint.slaDeadline} />}
        <Button variant="outline" onClick={() => onActionClick && onActionClick(complaint)}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
