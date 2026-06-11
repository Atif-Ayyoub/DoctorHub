import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Calendar, Pill, MapPin, Clock, Users, MessageSquare } from 'lucide-react';

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

export default function DoctorProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ specialisation: '', treatment_type: '', bio: '', consultation_fee: 0, experience_years: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get('/doctors/profile/me').then(r => {
      const d = r.data.data;
      setForm({ specialisation: d.specialisation || '', treatment_type: d.treatment_type || '', bio: d.bio || '', consultation_fee: d.consultation_fee || 0, experience_years: d.experience_years || 0 });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put('/doctors/profile/me', form);
      toast.success('Profile updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="dashboard-layout"><Sidebar links={sidebarLinks} /><main className="dashboard-main"><div className="spinner-center"><div className="spinner" /></div></main></div>;

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>My Profile</h1>
          <p>Update your professional information</p>
        </div>
        <div className="profile-info-card">
          <div className="doctor-avatar-lg">{user?.full_name?.charAt(0)}</div>
          <div>
            <h2>{user?.full_name}</h2>
            <p>{user?.email}</p>
          </div>
        </div>
        <div className="form-card">
          <form onSubmit={save}>
            <div className="form-grid">
              <div className="form-group">
                <label>Specialisation</label>
                <input placeholder="e.g. Fever, Diabetes, General Physician"
                  value={form.specialisation} onChange={e => setForm({...form, specialisation: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Treatment Type</label>
                <select value={form.treatment_type} onChange={e => setForm({...form, treatment_type: e.target.value})}>
                  <option value="">Select type</option>
                  <option value="Allopathic">Allopathic</option>
                  <option value="Homeopathic">Homeopathic</option>
                  <option value="Herbal">Herbal</option>
                </select>
              </div>
              <div className="form-group">
                <label>Consultation Fee (PKR)</label>
                <input type="number" min={0} value={form.consultation_fee}
                  onChange={e => setForm({...form, consultation_fee: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Experience (Years)</label>
                <input type="number" min={0} value={form.experience_years}
                  onChange={e => setForm({...form, experience_years: e.target.value})} />
              </div>
              <div className="form-group full-width">
                <label>Bio</label>
                <textarea rows={4} placeholder="Tell patients about yourself..."
                  value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} maxLength={1000} />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
