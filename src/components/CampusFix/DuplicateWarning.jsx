import React from 'react';
import { Card, CardHeader, CardBody } from '../Base/Card';
import { Badge } from '../Base/Badge';
import { Button } from '../Base/Button';
import styles from './DuplicateWarning.module.css';

export function DuplicateWarning({ duplicateCheck, onContinue, onViewExisting, onMerge, className = '' }) {
  if (!duplicateCheck || !duplicateCheck.is_duplicate) {
    return null;
  }

  const { matches } = duplicateCheck;
  const topMatch = matches[0];

  if (!topMatch) {
    return null;
  }

  const getSeverity = (score) => {
    if (score >= 0.90) return { variant: 'danger', label: 'Very Likely Duplicate' };
    if (score >= 0.85) return { variant: 'warning', label: 'Likely Duplicate' };
    return { variant: 'info', label: 'Possible Duplicate' };
  };

  const severity = getSeverity(topMatch.overall_score);

  return (
    <Card className={`${styles.warning} ${className}`}>
      <CardHeader className={styles.header}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>⚠️ Potential Duplicate Detected</h3>
          <Badge variant={severity.variant}>{severity.label}</Badge>
        </div>
      </CardHeader>
      
      <CardBody className={styles.body}>
        <p className={styles.message}>
          We found existing complaints that may be describing the same issue.
          Please review before submitting.
        </p>
        
        <div className={styles.matchInfo}>
          <div className={styles.scoreRow}>
            <span className={styles.label}>Similarity Score:</span>
            <span className={styles.score}>{Math.round(topMatch.overall_score * 100)}%</span>
          </div>
          <div className={styles.explanation}>
            {topMatch.explanation}
          </div>
        </div>

        <div className={styles.actions}>
          <Button 
            variant="outline" 
            onClick={onViewExisting}
            className={styles.secondaryAction}
          >
            View Existing Complaint
          </Button>
          <Button 
            variant="primary" 
            onClick={onContinue}
            className={styles.primaryAction}
          >
            Submit Anyway
          </Button>
          {onMerge && (
            <Button 
              variant="secondary" 
              onClick={() => onMerge(topMatch.complaint_id)}
              className={styles.mergeAction}
            >
              Merge with Existing
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}