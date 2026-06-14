import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import toast from 'react-hot-toast';
import { Users, BarChart2, LineChart, UserPlus } from 'lucide-react';

const sidebarLinks = [
  { to: '/superadmin', icon: BarChart2, label: 'Dashboard' },
  { to: '/superadmin/analytics', icon: LineChart, label: 'Analytics' },
  { to: '/superadmin/users', icon: Users, label: 'All Users' },
  { to: '/superadmin/reports', icon: BarChart2, label: 'Reports' },
  { to: '/admin/doctors', icon: UserPlus, label: 'Add Doctor' },
];

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    API.get('/admin/reports').then(r => setReports(r.data.data)).catch(() => {});
    API.get('/admin/users?page_size=10').then(r => setUsers(r.data.data?.users || [])).catch(() => {});
  }, []);

  const deactivate = async (id) => {
    if (!window.confirm('Deactivate this account?')) return;
    try { await API.patch(`/admin/users/${id}/deactivate`); toast.success('Deactivated'); window.location.reload(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const activate = async (id) => {
    try { await API.patch(`/admin/users/${id}/activate`); toast.success('Activated'); window.location.reload(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const userTotal = reports?.users_by_role?.reduce((s, a) => s + Number(a.count), 0) || 0;

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Super Admin 🛡️</h1>
          <p>Full system control</p>
        </div>

        <div className="stats-grid">
          <StatCard title="Total Users" value={userTotal} icon={Users} color="blue" />
          <StatCard title="Doctors" value={reports?.total_doctors} icon={UserPlus} color="green" />
          <StatCard title="Patients" value={reports?.total_patients} icon={Users} color="purple" />
          <StatCard title="Clinics" value={reports?.total_clinics} icon={BarChart2} color="yellow" />
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>All Users</h2>
            <Link to="/superadmin/users" className="btn-outline btn-sm">View All</Link>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td><span className="badge badge-blue">{u.role.replace('_',' ')}</span></td>
                    <td><span className={`status-badge status-${u.status === 'active' ? 'confirmed' : 'cancelled'}`}>{u.status}</span></td>
                    <td>
                      {u.id !== user?.id && (
                        u.status === 'active'
                          ? <button className="btn-danger btn-xs" onClick={() => deactivate(u.id)}>Deactivate</button>
                          : <button className="btn-success btn-xs" onClick={() => activate(u.id)}>Activate</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
