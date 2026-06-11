import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Sidebar from '../../components/common/Sidebar';
import toast from 'react-hot-toast';
import { Users, UserPlus, BarChart2 } from 'lucide-react';
import PasswordInput from '../../components/common/PasswordInput';

const sidebarLinks = [
  { to: '/admin', icon: BarChart2, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Manage Users' },
  { to: '/admin/doctors', icon: UserPlus, label: 'Add Doctor' },
  { to: '/admin/reports', icon: BarChart2, label: 'Reports' },
];

export default function AddDoctor() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', specialisation: '', treatment_type: '', bio: '', consultation_fee: 0, experience_years: 0 });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post('/admin/doctors', form);
      toast.success('Doctor account created');
      navigate('/admin/users');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />
      <main className="dashboard-main">
        <div className="dashboard-header"><h1>Add Doctor Account</h1></div>
        <div className="form-card">
          <form onSubmit={submit}>
            <h3>Account Details</h3>
            <div className="form-grid">
              <div className="form-group"><label>Full Name *</label><input required value={form.full_name} onChange={e => setForm({...form,full_name:e.target.value})} /></div>
              <div className="form-group"><label>Email *</label><input type="email" required value={form.email} onChange={e => setForm({...form,email:e.target.value})} /></div>
              <div className="form-group"><label>Password *</label><PasswordInput required minLength={8} value={form.password} onChange={e => setForm({...form,password:e.target.value})} /></div>
              <div className="form-group"><label>Phone (E.164) *</label><input required placeholder="+12125551234" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} /></div>
            </div>
            <h3 style={{ marginTop:24 }}>Professional Details</h3>
            <div className="form-grid">
              <div className="form-group"><label>Specialisation</label><input value={form.specialisation} onChange={e => setForm({...form,specialisation:e.target.value})} /></div>
              <div className="form-group">
                <label>Treatment Type</label>
                <select value={form.treatment_type} onChange={e => setForm({...form,treatment_type:e.target.value})}>
                  <option value="">Select type</option>
                  <option value="Allopathic">Allopathic</option>
                  <option value="Homeopathic">Homeopathic</option>
                  <option value="Herbal">Herbal</option>
                </select>
              </div>
              <div className="form-group"><label>Consultation Fee (PKR)</label><input type="number" min={0} value={form.consultation_fee} onChange={e => setForm({...form,consultation_fee:e.target.value})} /></div>
              <div className="form-group"><label>Experience (Years)</label><input type="number" min={0} value={form.experience_years} onChange={e => setForm({...form,experience_years:e.target.value})} /></div>
              <div className="form-group full-width"><label>Bio</label><textarea rows={3} value={form.bio} onChange={e => setForm({...form,bio:e.target.value})} /></div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-outline" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Doctor'}</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
