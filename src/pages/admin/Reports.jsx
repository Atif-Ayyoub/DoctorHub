import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import toast from 'react-hot-toast';
import { Users, UserPlus, BarChart2, Calendar, CreditCard, MapPin, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const adminLinks = [
  { to: '/admin', icon: BarChart2, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Manage Users' },
  { to: '/admin/doctors', icon: UserPlus, label: 'Add Doctor' },
  { to: '/admin/reports', icon: BarChart2, label: 'Reports' },
];

const superAdminLinks = [
  { to: '/superadmin', icon: BarChart2, label: 'Dashboard' },
  { to: '/superadmin/users', icon: Users, label: 'All Users' },
  { to: '/admin/doctors', icon: UserPlus, label: 'Add Doctor' },
  { to: '/superadmin/reports', icon: BarChart2, label: 'Reports' },
];

export default function Reports() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navLinks = user?.role === 'super_admin' ? superAdminLinks : adminLinks;

  useEffect(() => {
    API.get('/admin/reports').then(r => setData(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const generateReport = () => {
    if (!data) {
      toast.error('Report data is not ready');
      return;
    }

    const totalUsers = (data.users_by_role || []).reduce((sum, row) => sum + Number(row.count || 0), 0);
    const section = (title, rows, labelKey) => [
      title,
      ...(rows?.length ? rows.map(row => `- ${String(row[labelKey]).replace(/_/g, ' ')}: ${row.count}`) : ['- No data'])
    ].join('\n');

    const report = [
      'Doctor Hub Platform Report',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'Summary',
      `- Total users: ${totalUsers}`,
      `- Total doctors: ${data.total_doctors || 0}`,
      `- Total patients: ${data.total_patients || 0}`,
      `- Total clinics: ${data.total_clinics || 0}`,
      '',
      section('Users by Role', data.users_by_role, 'role'),
      '',
      section('Appointments by Status', data.appointments_by_status, 'status'),
      '',
      section('Payments by Status', data.payments_by_status, 'status')
    ].join('\n');

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `doctor-hub-report-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success('Report generated');
  };

  if (loading) return <div className="dashboard-layout"><Sidebar links={navLinks} /><main className="dashboard-main"><div className="spinner-center"><div className="spinner" /></div></main></div>;

  return (
    <div className="dashboard-layout">
      <Sidebar links={navLinks} />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Platform Reports</h1>
            <p>Generate a live operational report for users, appointments, payments, and clinics.</p>
          </div>
          <button className="btn-primary" onClick={generateReport}>
            <Download size={18} />
            Generate Report
          </button>
        </div>

        <div className="stats-grid">
          <StatCard title="Total Doctors" value={data?.total_doctors} icon={UserPlus} color="blue" />
          <StatCard title="Total Patients" value={data?.total_patients} icon={Users} color="green" />
          <StatCard title="Total Clinics" value={data?.total_clinics} icon={MapPin} color="purple" />
        </div>

        <div className="reports-grid">
          <div className="report-card">
            <h3><Users size={20} /> Users by Role</h3>
            <table className="data-table">
              <thead><tr><th>Role</th><th>Count</th></tr></thead>
              <tbody>{data?.users_by_role?.map(r => <tr key={r.role}><td className="capitalize">{r.role.replace('_',' ')}</td><td><strong>{r.count}</strong></td></tr>)}</tbody>
            </table>
          </div>

          <div className="report-card">
            <h3><Calendar size={20} /> Appointments by Status</h3>
            <table className="data-table">
              <thead><tr><th>Status</th><th>Count</th></tr></thead>
              <tbody>{data?.appointments_by_status?.map(r => <tr key={r.status}><td><span className={`status-badge status-${r.status}`}>{r.status.replace(/_/g,' ')}</span></td><td><strong>{r.count}</strong></td></tr>)}</tbody>
            </table>
          </div>

          <div className="report-card">
            <h3><CreditCard size={20} /> Payments by Status</h3>
            <table className="data-table">
              <thead><tr><th>Status</th><th>Count</th></tr></thead>
              <tbody>{data?.payments_by_status?.map(r => <tr key={r.status}><td className="capitalize">{r.status.replace(/_/g,' ')}</td><td><strong>{r.count}</strong></td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
