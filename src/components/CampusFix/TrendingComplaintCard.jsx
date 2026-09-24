import React from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '../Base/Card';
import { Badge } from '../Base/Badge';
import { Button } from '../Base/Button';
import { ImpactBadge } from './ImpactBadge';
import { SimilarityScore } from './SimilarityScore';
import styles from './TrendingComplaintCard.module.css';

export function TrendingComplaintCard({ complaint, rank, onViewDetails, onSupport, className = '' }) {
  const { 
    trending_score, 
    impact_score, 
    upvote_count, 
    duplicate_count,
    impact 
  } = complaint;

  const getRankColor = (rank) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return 'default';
  };

  const rankColor = getRankColor(rank);

  return (
    <Card className={`${styles.trendingCard} ${className}`}>
      <CardHeader className={styles.header}>
        <div className={styles.headerRow}>
          <div className={`${styles.rank} ${styles[rankColor]}`}>
            #{rank}
          </div>
          <div className={styles.headerContent}>
            <h3 className={styles.title}>{complaint.title}</h3>
            <div className={styles.metaBadges}>
              <Badge variant="info" className={styles.categoryBadge}>
                {complaint.category}
              </Badge>
              <Badge variant="muted" className={styles.locationBadge}>
                {complaint.location}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardBody className={styles.body}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Trending Score</span>
            <SimilarityScore score={trending_score} size="small" />
          </div>
          
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Impact</span>
            <ImpactBadge impact={impact || { score: impact_score, level: 'Medium' }} size="small" />
          </div>
          
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Supporters</span>
            <span className={styles.statValue}>{upvote_count}</span>
          </div>
          
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Related</span>
            <span className={styles.statValue}>{duplicate_count}</span>
          </div>
        </div>

        <div className={styles.activityInfo}>
          <div className={styles.activityItem}>
            <span className={styles.activityIcon}>📈</span>
            <span className={styles.activityText}>
              {upvote_count + duplicate_count + 1} total reports
            </span>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.activityIcon}>⏰</span>
            <span className={styles.activityText}>
              {new Date(complaint.createdAt || complaint.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardBody>

      <CardFooter className={styles.footer}>
        <Button 
          variant="outline" 
          onClick={() => onViewDetails(complaint)}
          className={styles.viewButton}
        >
          View Details
        </Button>
        <Button 
          variant="primary" 
          onClick={() => onSupport(complaint)}
          className={styles.supportButton}
        >
          Support Issue
        </Button>
      </CardFooter>
    </Card>
  );
}