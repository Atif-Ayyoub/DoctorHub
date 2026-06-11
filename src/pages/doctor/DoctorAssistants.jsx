import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Sidebar from '../../components/common/Sidebar';
import toast from 'react-hot-toast';
import { Mail, Users, Plus, Trash2, Calendar, Pill, MapPin, Clock, MessageSquare, User } from 'lucide-react';
import PasswordInput from '../../components/common/PasswordInput';

const sidebarLinks = [
  { to: '/doctor', icon: Calendar, label: 'Dashboard' },
  { to: '/doctor/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/doctor/prescriptions', icon: Pill, label: 'Prescriptions' },
  { to: '/doctor/clinics', icon: MapPin, label: 'Clinics' },
  { to: '/doctor/schedules', icon: Clock, label: 'Schedules' },
  { to: '/doctor/assistants', icon: Users, label: 'Assistants' },
  { to: '/doctor/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/doctor/profile', icon: User, label: 'Profile' },
];

export default function DoctorAssistants() {
  const [assistants, setAssistants] = useState([]);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' });
  const [adding, setAdding] = useState(false);

  const fetch = () => API.get('/doctors/assistants/mine').then(r => setAssistants(r.data.data || [])).catch(() => {});

  useEffect(() => { fetch(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim() || !form.phone.trim() || !form.password.trim()) return;
    setAdding(true);
    try {
      await API.post('/doctors/assistants', form);
      toast.success('Assistant account created and assigned');
      setForm({ full_name: '', email: '', phone: '', password: '' });
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setAdding(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this assistant?')) return;
    try {
      await API.delete(`/doctors/assistants/${id}`);
      toast.success('Removed');
      fetch();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />
      <main className="dashboard-main">
        <div className="dashboard-header"><h1>My Assistants</h1></div>

        <div className="form-card assistant-invite-card">
          <div>
            <h3>Create Assistant Account</h3>
            <p className="muted">Create login details for your assistant. They can sign in with this email and password.</p>
          </div>
          <form onSubmit={add}>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input placeholder="Assistant name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" placeholder="assistant@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Phone (E.164) *</label>
                <input placeholder="+12125551234" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Temporary Password *</label>
                <PasswordInput placeholder="Min 8 characters" minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={adding}>
                <Plus size={16} /> {adding ? 'Creating...' : 'Create Assistant'}
              </button>
            </div>
          </form>
          <div className="helper-strip">
            <span>No public assistant signup</span>
            <p>Only doctors create assistant accounts. Patients are the only public registration role.</p>
          </div>
        </div>

        {assistants.length === 0 ? (
          <div className="empty-state"><Users size={48} /><h3>No assistants yet</h3></div>
        ) : (
          <div className="assistants-list">
            {assistants.map(a => (
              <div key={a.id} className="assistant-card">
                <div className="doctor-avatar-sm">{a.full_name?.charAt(0)}</div>
                <div>
                  <strong>{a.full_name}</strong>
                  <p>{a.email}</p>
                  <p>{a.phone}</p>
                </div>
                <div className="appt-actions">
                  <a className="btn-outline btn-sm" href={`mailto:${a.email}`}><Mail size={14} /> Email</a>
                  <button className="btn-danger btn-sm" onClick={() => remove(a.id)}><Trash2 size={14} /> Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
