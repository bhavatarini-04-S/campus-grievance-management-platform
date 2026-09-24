import React from 'react';
import { Card, CardHeader, CardBody } from '../Base/Card';
import { Badge } from '../Base/Badge';
import { Button } from '../Base/Button';
import { ComplaintCard } from './ComplaintCard';
import styles from './ComplaintCluster.module.css';

export function ComplaintCluster({ cluster, complaints, onComplaintClick, className = '' }) {
  if (!cluster || !complaints || complaints.length === 0) {
    return null;
  }

  const primaryComplaint = complaints.find(c => c.is_primary);
  const relatedComplaints = complaints.filter(c => !c.is_primary);

  return (
    <Card className={`${styles.cluster} ${className}`}>
      <CardHeader className={styles.header}>
        <div className={styles.headerRow}>
          <div>
            <h3 className={styles.title}>Complaint Cluster</h3>
            <span className={styles.clusterId}>{cluster.id}</span>
          </div>
          <Badge variant="info" className={styles.countBadge}>
            {complaints.length} Complaints
          </Badge>
        </div>
      </CardHeader>
      
      <CardBody className={styles.body}>
        {primaryComplaint && (
          <div className={styles.primarySection}>
            <div className={styles.sectionHeader}>
              <h4 className={styles.sectionTitle}>Primary Complaint</h4>
              <Badge variant="success" className={styles.primaryBadge}>Representative</Badge>
            </div>
            <ComplaintCard 
              complaint={primaryComplaint} 
              onActionClick={onComplaintClick}
              className={styles.primaryCard}
            />
          </div>
        )}

        {relatedComplaints.length > 0 && (
          <div className={styles.relatedSection}>
            <h4 className={styles.sectionTitle}>
              Related Complaints ({relatedComplaints.length})
            </h4>
            <div className={styles.relatedList}>
              {relatedComplaints.map((complaint) => (
                <div key={complaint.id} className={styles.relatedItem}>
                  <div className={styles.relatedHeader}>
                    <span className={styles.relatedId}>{complaint.id}</span>
                    <span className={styles.relatedTitle}>{complaint.title}</span>
                  </div>
                  <div className={styles.relatedMeta}>
                    <span className={styles.relatedMetaItem}>{complaint.category}</span>
                    <span className={styles.relatedMetaItem}>{complaint.location}</span>
                    <span className={styles.relatedMetaItem}>{complaint.status}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="small"
                    onClick={() => onComplaintClick(complaint)}
                    className={styles.viewButton}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.clusterInfo}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Total Reports:</span>
            <span className={styles.infoValue}>{complaints.length}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Created:</span>
            <span className={styles.infoValue}>
              {new Date(cluster.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}