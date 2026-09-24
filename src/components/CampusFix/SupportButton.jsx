import React, { useState } from 'react';
import { Button } from '../Base/Button';
import { Badge } from '../Base/Badge';
import styles from './SupportButton.module.css';

export function SupportButton({ 
  complaint, 
  userId, 
  onUpvote, 
  onRemoveUpvote, 
  showCount = true,
  variant = 'primary',
  className = '' 
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const supportCount = complaint.support_count || 0;
  const hasUpvoted = complaint.user_has_upvoted || false;

  const handleUpvote = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    
    if (hasUpvoted) {
      onRemoveUpvote?.(complaint.id, userId);
    } else {
      onUpvote?.(complaint.id, userId);
    }
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <Button 
        variant={hasUpvoted ? 'success' : variant}
        onClick={handleUpvote}
        className={`${styles.button} ${isAnimating ? styles.animating : ''} ${hasUpvoted ? styles.upvoted : ''}`}
        disabled={!userId}
      >
        <span className={styles.icon}>
          {hasUpvoted ? '✓' : '👍'}
        </span>
        <span className={styles.text}>
          {hasUpvoted ? 'Supported' : 'Support'}
        </span>
      </Button>
      
      {showCount && supportCount > 0 && (
        <Badge variant={hasUpvoted ? 'success' : 'muted'} className={styles.countBadge}>
          {supportCount}
        </Badge>
      )}
    </div>
  );
}