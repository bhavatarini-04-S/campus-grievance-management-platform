import React from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '../Base/Card';
import { Badge } from '../Base/Badge';
import { Button } from '../Base/Button';
import { SimilarityScore } from './SimilarityScore';
import styles from './DuplicateMatchCard.module.css';

export function DuplicateMatchCard({ match, complaint, onSelect, className = '' }) {
  if (!match || !complaint) {
    return null;
  }

  const { similarity_score, location_score, time_score, overall_score, category_match } = match;

  return (
    <Card className={`${styles.matchCard} ${className}`}>
      <CardHeader className={styles.header}>
        <div className={styles.headerRow}>
          <span className={styles.complaintId}>{complaint.id}</span>
          <SimilarityScore score={overall_score} size="small" />
        </div>
        <h3 className={styles.title}>{complaint.title}</h3>
      </CardHeader>
      
      <CardBody className={styles.body}>
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.label}>Category:</span>
            <span>{complaint.category}</span>
            {category_match && <Badge variant="success" className={styles.matchBadge}>Match</Badge>}
          </div>
          <div className={styles.metaItem}>
            <span className={styles.label}>Location:</span>
            <span>{complaint.location}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.label}>Status:</span>
            <span className={styles.status}>{complaint.status}</span>
          </div>
        </div>

        <div className={styles.scoreBreakdown}>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Text Similarity</span>
            <SimilarityScore score={similarity_score} size="compact" />
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Location Match</span>
            <SimilarityScore score={location_score} size="compact" />
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Time Proximity</span>
            <SimilarityScore score={time_score} size="compact" />
          </div>
        </div>
      </CardBody>

      <CardFooter className={styles.footer}>
        <Button 
          variant="primary" 
          onClick={() => onSelect(complaint.id)}
          className={styles.selectButton}
        >
          View This Complaint
        </Button>
      </CardFooter>
    </Card>
  );
}