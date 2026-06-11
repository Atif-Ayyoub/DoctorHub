import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Sidebar from '../../components/common/Sidebar';
import PasswordInput from '../../components/common/PasswordInput';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Users, UserPlus, BarChart2, Shield, Mail, Phone } from 'lucide-react';

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

export default function ManageUsers() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({ full_name: '', email: '', password: '', phone: '' });

  const fetchUsers = () => {
    setLoading(true);
    API.get(`/admin/users?page=${page}&page_size=20`).then(r => {
      setUsers(r.data.data?.users || []);
      setTotal(r.data.data?.total || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const createAdmin = async (e) => {
    e.preventDefault();
    setSavingAdmin(true);
    try {
      await API.post('/admin/admins', adminForm);
      toast.success('Admin account created');
      setAdminForm({ full_name: '', email: '', password: '', phone: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setSavingAdmin(false);
    }
  };

  const deactivate = async (id) => {
    if (!window.confirm('Deactivate this account?')) return;
    try { await API.patch(`/admin/users/${id}/deactivate`); toast.success('Deactivated'); fetchUsers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const activate = async (id) => {
    try { await API.patch(`/admin/users/${id}/activate`); toast.success('Activated'); fetchUsers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const canDeactivate = (target) => {
    if (target.id === user?.id || target.status !== 'active') return false;
    if (isSuperAdmin) return target.role !== 'super_admin';
    return !['admin', 'super_admin'].includes(target.role);
  };

  const filtered = roleFilter ? users.filter(u => u.role === roleFilter) : users;
  const navLinks = isSuperAdmin ? superAdminLinks : adminLinks;

  return (
    <div className="dashboard-layout">
      <Sidebar links={navLinks} />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>{isSuperAdmin ? 'All Users' : 'Manage Users'}</h1>
            <p>{total} total users</p>
          </div>
        </div>

        {isSuperAdmin && (
          <div className="form-card admin-create-card">
            <div className="section-header">
              <div>
                <h2>Create Admin Account</h2>
                <p className="muted">Add trusted administrators who can manage doctors, users, and platform reports.</p>
              </div>
              <Shield size={34} />
            </div>
            <form onSubmit={createAdmin}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input required value={adminForm.full_name} onChange={e => setAdminForm({ ...adminForm, full_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <div className="input-icon-wrap">
                    <Mail size={18} />
                    <input type="email" required value={adminForm.email} onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <PasswordInput required minLength={8} value={adminForm.password} onChange={e => setAdminForm({ ...adminForm, password: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Phone (E.164) *</label>
                  <div className="input-icon-wrap">
                    <Phone size={18} />
                    <input required placeholder="+12125551234" value={adminForm.phone} onChange={e => setAdminForm({ ...adminForm, phone: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={savingAdmin}>
                  <UserPlus size={18} />
                  {savingAdmin ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="filter-row">
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="assistant">Assistant</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>

        {loading ? <div className="spinner-center"><div className="spinner" /></div> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th><th>Action</th></tr></thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td><span className="badge badge-blue">{u.role.replace('_', ' ')}</span></td>
                    <td><span className={`status-badge status-${u.status === 'active' ? 'confirmed' : 'cancelled'}`}>{u.status}</span></td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      {canDeactivate(u) && (
                        <button className="btn-danger btn-xs" onClick={() => deactivate(u.id)}>Deactivate</button>
                      )}
                      {u.status !== 'active' && isSuperAdmin && u.role !== 'super_admin' && (
                        <button className="btn-success btn-xs" onClick={() => activate(u.id)}>Activate</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span>Page {page}</span>
          <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      </main>
    </div>
  );
}
