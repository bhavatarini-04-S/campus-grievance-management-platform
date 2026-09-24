import React from 'react';
import { Card, CardHeader, CardBody } from '../Base/Card';
import { PriorityBadge } from '../CampusFix/PriorityBadge';
import { SLA_TARGETS_HOURS } from '../../services/slaConfig';
import { DEPARTMENT_SUPERVISORS } from '../../services/escalationEngine';
import styles from './SLAMatrixView.module.css';

export function SLAMatrixView() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>CampusFix AI Operations & SLA Configuration</h2>
        <p>Configurable SLA response windows, explainable priority formulas, and automatic escalation hierarchies.</p>
      </div>

      <div className={styles.grid}>
        {/* SLA Targets Card */}
        <Card className={styles.card}>
          <CardHeader>
            <h3 className={styles.cardTitle}>⏱ Configured SLA Target Windows</h3>
          </CardHeader>
          <CardBody>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Priority Level</th>
                  <th>SLA Resolution Target</th>
                  <th>Warning Window (At Risk)</th>
                  <th>Breach Escalation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><PriorityBadge priority="CRITICAL" /></td>
                  <td><strong>{SLA_TARGETS_HOURS.CRITICAL} Hours</strong></td>
                  <td>&lt; 30 Minutes</td>
                  <td>Auto-escalate Level 1</td>
                </tr>
                <tr>
                  <td><PriorityBadge priority="HIGH" /></td>
                  <td><strong>{SLA_TARGETS_HOURS.HIGH} Hours</strong></td>
                  <td>&lt; 2 Hours</td>
                  <td>Auto-escalate Level 1</td>
                </tr>
                <tr>
                  <td><PriorityBadge priority="MEDIUM" /></td>
                  <td><strong>{SLA_TARGETS_HOURS.MEDIUM} Hours</strong></td>
                  <td>&lt; 4 Hours</td>
                  <td>Auto-escalate Level 1</td>
                </tr>
                <tr>
                  <td><PriorityBadge priority="LOW" /></td>
                  <td><strong>{SLA_TARGETS_HOURS.LOW} Hours</strong></td>
                  <td>&lt; 8 Hours</td>
                  <td>Auto-escalate Level 1</td>
                </tr>
              </tbody>
            </table>
          </CardBody>
        </Card>

        {/* Priority Engine Formula Card */}
        <Card className={styles.card}>
          <CardHeader>
            <h3 className={styles.cardTitle}>🧠 Explainable Priority Engine Criteria</h3>
          </CardHeader>
          <CardBody>
            <p className={styles.p}>
              Priority is calculated from multidimensional risk factors rather than category alone:
            </p>
            <div className={styles.factorList}>
              <div className={styles.factorItem}>
                <span className={styles.factorTag}>Keywords (+25 to +45)</span>
                <span>Scans text for urgent hazard words (e.g. <em>gas leak, fire, injury, live wire, explosion</em>)</span>
              </div>
              <div className={styles.factorItem}>
                <span className={styles.factorTag}>Location (+10 to +15)</span>
                <span>Critical shared hubs (Hostel Kitchens, Chemistry Labs, Datacenter, Central Mess)</span>
              </div>
              <div className={styles.factorItem}>
                <span className={styles.factorTag}>Student Impact (+8 to +25)</span>
                <span>Scaled according to community upvotes and affected student population</span>
              </div>
              <div className={styles.factorItem}>
                <span className={styles.factorTag}>Cluster Multiplier (+8 to +15)</span>
                <span>Clusters of 3+ or 5+ duplicate tickets received for same incident</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Escalation Hierarchy Card */}
        <Card className={styles.card}>
          <CardHeader>
            <h3 className={styles.cardTitle}>🚨 Escalation Hierarchy & Supervisors</h3>
          </CardHeader>
          <CardBody>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Designated Authority</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(DEPARTMENT_SUPERVISORS).map(([dept, sup]) => (
                  <tr key={dept}>
                    <td><strong>{dept}</strong></td>
                    <td>{sup.name}</td>
                    <td className={styles.mutedText}>{sup.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>

        {/* Role Authorization Matrix Card */}
        <Card className={styles.card}>
          <CardHeader>
            <h3 className={styles.cardTitle}>🛡 Role Authorization Matrix</h3>
          </CardHeader>
          <CardBody>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Student</th>
                  <th>Staff</th>
                  <th>Supervisor</th>
                  <th>Grievance Officer</th>
                  <th>Admin</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>View General Queue</td>
                  <td>—</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <td>Acknowledge / Progress</td>
                  <td>—</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <td>Resolve Complaint</td>
                  <td>—</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <td>Cross-Dept Reassign</td>
                  <td>—</td>
                  <td>—</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <td>Reopen Resolved</td>
                  <td>—</td>
                  <td>—</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <td>View Sensitive Grievance</td>
                  <td>—</td>
                  <td>—</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <td>Unmask Anonymous ID</td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
