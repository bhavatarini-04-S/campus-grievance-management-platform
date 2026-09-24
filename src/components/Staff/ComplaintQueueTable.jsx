import React, { useState, useMemo } from 'react';
import { StatusBadge } from '../CampusFix/StatusBadge';
import { PriorityBadge } from '../CampusFix/PriorityBadge';
import { SLATimer } from '../CampusFix/SLATimer';
import { SLAStateBadge } from '../CampusFix/SLAStateBadge';
import { Button } from '../Base/Button';
import { EmptyState } from '../Base/EmptyState';
import { getSLAState } from '../../services/slaConfig';
import styles from './ComplaintQueueTable.module.css';

export function ComplaintQueueTable({ complaints, onSelectComplaint }) {
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Sort complaints
  const sortedComplaints = useMemo(() => {
    return [...complaints].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'slaDeadline') {
        valA = new Date(a.slaDeadline || 0).getTime();
        valB = new Date(b.slaDeadline || 0).getTime();
      } else if (sortField === 'createdAt') {
        valA = new Date(a.createdAt || 0).getTime();
        valB = new Date(b.createdAt || 0).getTime();
      } else if (sortField === 'priorityScore') {
        valA = a.priorityScore || 0;
        valB = b.priorityScore || 0;
      } else if (sortField === 'supportCount') {
        valA = a.supportCount || 0;
        valB = b.supportCount || 0;
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [complaints, sortField, sortDirection]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedComplaints.length / itemsPerPage) || 1;
  const paginatedComplaints = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedComplaints.slice(start, start + itemsPerPage);
  }, [sortedComplaints, currentPage, itemsPerPage]);

  const renderSortArrow = (field) => {
    if (sortField !== field) return <span className={styles.sortMuted}>↕</span>;
    return <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  if (complaints.length === 0) {
    return (
      <EmptyState
        title="No matching complaints in queue"
        description="Try adjusting your filters or search keywords to view campus complaints."
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} className={styles.clickableTh}>
                Complaint ID {renderSortArrow('id')}
              </th>
              <th onClick={() => handleSort('title')} className={styles.clickableTh}>
                Title {renderSortArrow('title')}
              </th>
              <th onClick={() => handleSort('category')} className={styles.clickableTh}>
                Category {renderSortArrow('category')}
              </th>
              <th>Location</th>
              <th onClick={() => handleSort('priorityScore')} className={styles.clickableTh}>
                Priority {renderSortArrow('priorityScore')}
              </th>
              <th onClick={() => handleSort('status')} className={styles.clickableTh}>
                Status {renderSortArrow('status')}
              </th>
              <th onClick={() => handleSort('supportCount')} className={styles.clickableTh}>
                Support {renderSortArrow('supportCount')}
              </th>
              <th>Impact</th>
              <th>Assigned Staff</th>
              <th onClick={() => handleSort('slaDeadline')} className={styles.clickableTh}>
                SLA Deadline {renderSortArrow('slaDeadline')}
              </th>
              <th>SLA State</th>
              <th onClick={() => handleSort('createdAt')} className={styles.clickableTh}>
                Created {renderSortArrow('createdAt')}
              </th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedComplaints.map(complaint => {
              const currentSLAState = getSLAState(
                complaint.slaDeadline, 
                complaint.status, 
                complaint.resolution?.resolvedAt
              );

              return (
                <tr 
                  key={complaint.id} 
                  className={styles.row}
                  onClick={() => onSelectComplaint(complaint)}
                >
                  <td className={styles.idCell}>
                    <span className={styles.idText}>{complaint.id}</span>
                    {complaint.isSensitive && <span title="Sensitive Complaint" className={styles.sensitiveIcon}>🔒</span>}
                    {complaint.isAnonymous && <span title="Anonymous Reporter" className={styles.anonIcon}>🕵️</span>}
                  </td>
                  <td className={styles.titleCell}>
                    <span className={styles.titleText}>{complaint.title}</span>
                    {complaint.clusterSize > 1 && (
                      <span className={styles.clusterTag}>+{complaint.clusterSize - 1} duplicates</span>
                    )}
                  </td>
                  <td>
                    <span className={styles.categoryBadge}>{complaint.category}</span>
                  </td>
                  <td className={styles.locationCell} title={complaint.location}>
                    {complaint.location}
                  </td>
                  <td>
                    <PriorityBadge 
                      priority={complaint.priority} 
                      score={complaint.priorityScore} 
                      showScore={true} 
                    />
                  </td>
                  <td>
                    <StatusBadge status={complaint.status} />
                  </td>
                  <td>
                    <span className={styles.supportBadge}>
                      ▲ {complaint.supportCount || 0}
                    </span>
                  </td>
                  <td className={styles.impactCell}>
                    <span className={styles.impactPill}>{complaint.impact?.split(' ')[0] || 'Standard'}</span>
                  </td>
                  <td>
                    {complaint.assignedStaff ? (
                      <div className={styles.staffPill} title={complaint.assignedStaff.email}>
                        <span className={styles.staffAvatar}>
                          {complaint.assignedStaff.name[0]}
                        </span>
                        <span className={styles.staffName}>
                          {complaint.assignedStaff.name}
                        </span>
                      </div>
                    ) : (
                      <span className={styles.unassignedText}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    <SLATimer 
                      deadline={complaint.slaDeadline} 
                      status={complaint.status} 
                      resolvedAt={complaint.resolution?.resolvedAt} 
                    />
                  </td>
                  <td>
                    <SLAStateBadge state={currentSLAState} />
                  </td>
                  <td className={styles.dateCell}>
                    {new Date(complaint.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="outline" 
                      className={styles.viewBtn}
                      onClick={() => onSelectComplaint(complaint)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className={styles.paginationFooter}>
          <span className={styles.pageInfo}>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedComplaints.length)} of {sortedComplaints.length} complaints
          </span>
          <div className={styles.pageButtons}>
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className={styles.paginationBtn}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`${styles.pageNumber} ${currentPage === i + 1 ? styles.activePage : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className={styles.paginationBtn}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
