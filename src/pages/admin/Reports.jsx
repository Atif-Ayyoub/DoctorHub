import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { BarChart2, CalendarDays, CreditCard, Download, LineChart, TrendingUp, Users, UserPlus } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import ReportCard from '../../components/analytics/ReportCard';
import StatItem from '../../components/analytics/StatItem';
import { useAuth } from '../../context/AuthContext';
import { loadAnalyticsData } from '../../utils/analyticsData';

const adminLinks = [
  { to: '/admin', icon: BarChart2, label: 'Dashboard' },
  { to: '/admin/analytics', icon: LineChart, label: 'Analytics' },
  { to: '/admin/users', icon: Users, label: 'Manage Users' },
  { to: '/admin/doctors', icon: UserPlus, label: 'Add Doctor' },
  { to: '/admin/reports', icon: BarChart2, label: 'Reports' },
];

const superAdminLinks = [
  { to: '/superadmin', icon: BarChart2, label: 'Dashboard' },
  { to: '/superadmin/analytics', icon: LineChart, label: 'Analytics' },
  { to: '/superadmin/users', icon: Users, label: 'All Users' },
  { to: '/admin/doctors', icon: UserPlus, label: 'Add Doctor' },
  { to: '/superadmin/reports', icon: BarChart2, label: 'Reports' },
];

const currency = (value) => `$${Number(value || 0).toLocaleString()}`;
const number = (value) => Number(value || 0).toLocaleString();

export default function Reports() {
  const { user } = useAuth();
  const [state, setState] = useState({ data: null, isFallback: false, loading: true });
  const navLinks = user?.role === 'super_admin' ? superAdminLinks : adminLinks;

  useEffect(() => {
    let active = true;
    loadAnalyticsData().then((result) => {
      if (active) setState({ ...result, loading: false });
    });
    return () => { active = false; };
  }, []);

  const generateReport = () => {
    const data = state.data;
    if (!data) return toast.error('Report data is not ready');
    const report = [
      'Doctor Hub Platform Report',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `Total revenue: ${currency(data.payment_analytics.total_revenue)}`,
      `Total users: ${Object.values(data.user_distribution).reduce((sum, value) => sum + value, 0)}`,
      `Total appointments: ${data.appointment_summary.total}`,
      `Total payments: ${data.payment_analytics.total}`,
      '',
      `Patients: ${data.user_distribution.patient}`,
      `Doctors: ${data.user_distribution.doctor}`,
      `Assistants: ${data.user_distribution.assistant}`,
      `Admins: ${data.user_distribution.admin + data.user_distribution.super_admin}`,
      '',
      `Pending appointments: ${data.appointment_summary.pending}`,
      `Confirmed appointments: ${data.appointment_summary.confirmed}`,
      `Completed appointments: ${data.appointment_summary.completed}`,
      `Cancelled appointments: ${data.appointment_summary.cancelled}`,
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

  if (state.loading) return <div className="dashboard-layout"><Sidebar links={navLinks} /><main className="dashboard-main"><div className="spinner-center"><div className="spinner" /></div></main></div>;

  const data = state.data;
  const totalUsers = Object.values(data.user_distribution).reduce((sum, value) => sum + value, 0);
  const newUsers = data.monthly_user_growth.at(-1)?.users || 0;
  const change = data.payment_analytics.monthly_change_percent;

  return (
    <div className="dashboard-layout">
      <Sidebar links={navLinks} />
      <main className="dashboard-main analytics-page">
        <div className="dashboard-header analytics-heading">
          <div>
            <span className="page-kicker">Operational reporting</span>
            <h1>Reports</h1>
            <p>Review financial, user, appointment, and payment performance.</p>
          </div>
          <button className="btn-primary" onClick={generateReport}><Download size={18} />Generate Report</button>
        </div>

        {state.isFallback && <div className="analytics-fallback-notice">Live reports are unavailable. Showing clearly marked fallback data.</div>}

        <div className="report-cards-grid">
          <ReportCard title="Monthly Revenue Report" icon={TrendingUp} tone="green" value={currency(data.payment_analytics.total_revenue)} caption="Verified consultation revenue">
            <StatItem label="Current month" value={currency(data.payment_analytics.current_month_revenue)} tone="success" />
            <StatItem label="Previous month" value={currency(data.payment_analytics.previous_month_revenue)} />
            <StatItem label="Monthly comparison" value={`${change >= 0 ? '+' : ''}${change}%`} tone={change >= 0 ? 'success' : 'danger'} />
            <StatItem label="Payment status" value={`${data.payment_analytics.verified} verified / ${data.payment_analytics.pending} pending / ${data.payment_analytics.rejected} rejected`} />
          </ReportCard>

          <ReportCard title="User Growth Report" icon={Users} tone="blue" value={number(totalUsers)} caption={`${number(newUsers)} new users this month`}>
            <StatItem label="Patients" value={number(data.user_distribution.patient)} />
            <StatItem label="Doctors" value={number(data.user_distribution.doctor)} />
            <StatItem label="Assistants" value={number(data.user_distribution.assistant)} />
            <StatItem label="Admins" value={number(data.user_distribution.admin + data.user_distribution.super_admin)} />
          </ReportCard>

          <ReportCard title="Appointment Summary" icon={CalendarDays} tone="teal" value={number(data.appointment_summary.total)} caption="All appointment activity">
            <StatItem label="Pending" value={number(data.appointment_summary.pending)} tone="warning" />
            <StatItem label="Confirmed" value={number(data.appointment_summary.confirmed)} />
            <StatItem label="Completed" value={number(data.appointment_summary.completed)} tone="success" />
            <StatItem label="Cancelled" value={number(data.appointment_summary.cancelled)} tone="danger" />
          </ReportCard>

          <ReportCard title="Payment Analytics" icon={CreditCard} tone="purple" value={number(data.payment_analytics.total)} caption="Payment verification overview">
            <StatItem label="Verified" value={number(data.payment_analytics.verified)} tone="success" />
            <StatItem label="Pending" value={number(data.payment_analytics.pending)} tone="warning" />
            <StatItem label="Rejected" value={number(data.payment_analytics.rejected)} tone="danger" />
          </ReportCard>
        </div>
      </main>
    </div>
  );
}
