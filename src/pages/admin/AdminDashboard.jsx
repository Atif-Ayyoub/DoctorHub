import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import toast from 'react-hot-toast';
import { Users, UserPlus, BarChart2, Settings } from 'lucide-react';

const sidebarLinks = [
  { to: '/admin', icon: BarChart2, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Manage Users' },
  { to: '/admin/doctors', icon: UserPlus, label: 'Add Doctor' },
  { to: '/admin/reports', icon: BarChart2, label: 'Reports' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    API.get('/admin/reports').then(r => setReports(r.data.data)).catch(() => {});
    API.get('/admin/users?page_size=5').then(r => setUsers(r.data.data?.users || [])).catch(() => {});
  }, []);

  const deactivate = async (id) => {
    if (!window.confirm('Deactivate this account?')) return;
    try { await API.patch(`/admin/users/${id}/deactivate`); toast.success('Deactivated'); window.location.reload(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const apptTotal = reports?.appointments_by_status?.reduce((s, a) => s + Number(a.count), 0) || 0;
  const userTotal = reports?.users_by_role?.reduce((s, a) => s + Number(a.count), 0) || 0;

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Platform overview</p>
        </div>
        <div className="stats-grid">
          <StatCard title="Total Users" value={userTotal} icon={Users} color="blue" />
          <StatCard title="Total Doctors" value={reports?.total_doctors || '—'} icon={UserPlus} color="green" />
          <StatCard title="Total Patients" value={reports?.total_patients || '—'} icon={Users} color="purple" />
          <StatCard title="Total Appointments" value={apptTotal} icon={BarChart2} color="yellow" />
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Users</h2>
            <Link to="/admin/users" className="btn-outline btn-sm">View All</Link>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td><span className="badge badge-blue">{u.role}</span></td>
                    <td><span className={`status-badge status-${u.status === 'active' ? 'confirmed' : 'cancelled'}`}>{u.status}</span></td>
                    <td>
                      {u.status === 'active' && !['admin','super_admin'].includes(u.role) && (
                        <button className="btn-danger btn-xs" onClick={() => deactivate(u.id)}>Deactivate</button>
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
