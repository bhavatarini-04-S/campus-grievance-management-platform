import React, { useState } from 'react';
import { PageHeader } from '../../components/Layout/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/Base/Card';
import { Select } from '../../components/Base/Forms';
import { getComplaints } from '../../api/mockData';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#2563EB', '#F59E0B', '#16A34A', '#DC2626', '#0F172A', '#64748B'];

export function Analytics() {
  const [timeRange, setTimeRange] = useState(30);
  const [department, setDepartment] = useState('ALL');
  
  const complaints = getComplaints({ timeRange, includeSensitive: false });
  const filtered = department === 'ALL' ? complaints : complaints.filter(c => c.department === department);

  // Grouping functions
  const countBy = (arr, key) => arr.reduce((acc, obj) => {
    acc[obj[key]] = (acc[obj[key]] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(countBy(filtered, 'status')).map(([name, value]) => ({ name, value }));
  const categoryData = Object.entries(countBy(filtered, 'category')).map(([name, value]) => ({ name, value }));
  const deptData = Object.entries(countBy(filtered, 'department')).map(([name, value]) => ({ name, value }));
  const priorityData = Object.entries(countBy(filtered, 'priority')).map(([name, value]) => ({ name, value }));
  const locData = Object.entries(countBy(filtered, 'location')).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <PageHeader 
        title="Analytics" 
        description="Insights and operational metrics"
        actions={
          <div className="flex gap-sm">
            <Select 
              options={[
                { label: 'All Departments', value: 'ALL' },
                { label: 'IT', value: 'IT' },
                { label: 'Maintenance', value: 'Maintenance' },
                { label: 'Security', value: 'Security' },
              ]}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <Select 
              options={[
                { label: 'Last 7 Days', value: 7 },
                { label: 'Last 30 Days', value: 30 },
                { label: 'Last 90 Days', value: 90 },
              ]}
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
            />
          </div>
        }
      />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-lg)' }}>
        
        <Card>
          <CardHeader title="Complaints by Status" />
          <CardBody style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Complaints by Category" />
          <CardBody style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="var(--color-primary)" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Complaints by Department" />
          <CardBody style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="value" fill="var(--color-secondary)" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Complaints by Location" />
          <CardBody style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="var(--color-info)" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
