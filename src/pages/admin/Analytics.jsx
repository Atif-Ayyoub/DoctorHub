import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart2, LineChart, Users, UserPlus } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import ChartCard from '../../components/analytics/ChartCard';
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

const roleColors = {
  Patients: '#2563eb',
  Doctors: '#16a36a',
  Assistants: '#f2a93b',
  Admins: '#8b5cf6',
};

const currency = (value) => `$${Number(value || 0).toLocaleString()}`;

export default function Analytics() {
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

  const distribution = useMemo(() => {
    if (!state.data) return [];
    const roles = state.data.user_distribution;
    return [
      { name: 'Patients', value: roles.patient },
      { name: 'Doctors', value: roles.doctor },
      { name: 'Assistants', value: roles.assistant },
      { name: 'Admins', value: roles.admin + roles.super_admin },
    ];
  }, [state.data]);

  if (state.loading) {
    return <div className="dashboard-layout"><Sidebar links={navLinks} /><main className="dashboard-main"><div className="spinner-center"><div className="spinner" /></div></main></div>;
  }

  const data = state.data;
  const latestUsers = data.monthly_user_growth.at(-1)?.users || 0;

  return (
    <div className="dashboard-layout">
      <Sidebar links={navLinks} />
      <main className="dashboard-main analytics-page">
        <div className="dashboard-header analytics-heading">
          <div>
            <span className="page-kicker">Platform intelligence</span>
            <h1>Analytics Dashboard</h1>
            <p>Monitor user growth, revenue, platform mix, and appointment activity.</p>
          </div>
        </div>

        <div className="analytics-grid">
          <ChartCard title="User Growth" subtitle={`${latestUsers} new users`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly_user_growth} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <defs><linearGradient id="usersFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} /><stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf3" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={3} fill="url(#usersFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Revenue" subtitle={`${currency(data.payment_analytics.current_month_revenue)} this month`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly_revenue} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf3" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => currency(value)} />
                <Bar dataKey="revenue" fill="#16a36a" radius={[7, 7, 2, 2]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="User Distribution" subtitle="Active platform roles">
            <div className="distribution-chart-wrap">
              <div className="distribution-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distribution} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={3}>
                      {distribution.map((entry) => <Cell key={entry.name} fill={roleColors[entry.name]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="distribution-legend">
                {distribution.map((entry) => (
                  <div key={entry.name}><span style={{ background: roleColors[entry.name] }} /><p>{entry.name}</p><strong>{entry.value}</strong></div>
                ))}
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Appointments Trend" subtitle={`${data.appointment_summary.total} total appointments`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly_appointments} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <defs><linearGradient id="appointmentsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0891b2" stopOpacity={0.3} /><stop offset="100%" stopColor="#0891b2" stopOpacity={0.02} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf3" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="appointments" stroke="#0891b2" strokeWidth={3} fill="url(#appointmentsFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </main>
    </div>
  );
}
