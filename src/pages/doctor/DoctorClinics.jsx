import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Sidebar from '../../components/common/Sidebar';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { MapPin, Plus, Edit2, Trash2, Calendar, Pill, Clock, Users, MessageSquare, User, Phone, Building2 } from 'lucide-react';

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

const empty = { name: '', address: '', city: '', phone: '' };

export default function DoctorClinics() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    setLoading(true);
    API.get('/doctors/clinics/mine').then(r => setClinics(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setShowModal(true); };
  const openEdit = (c) => { setEditing(c.id); setForm({ name: c.name, address: c.address, city: c.city, phone: c.phone || '' }); setShowModal(true); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await API.put(`/doctors/clinics/${editing}`, form);
      else await API.post('/doctors/clinics', form);
      toast.success(editing ? 'Clinic updated' : 'Clinic created');
      setShowModal(false);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this clinic?')) return;
    try {
      await API.delete(`/doctors/clinics/${id}`);
      toast.success('Clinic deleted');
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot delete'); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />
      <main className="dashboard-main">
        <div className="dashboard-header panel-hero-header">
          <div>
            <h1>My Clinics</h1>
            <p>Manage the locations patients can book and connect schedules to each clinic.</p>
          </div>
          <button className="btn-primary btn-sm" onClick={openAdd}><Plus size={16} /> Add Clinic</button>
        </div>
        {loading ? <div className="spinner-center"><div className="spinner" /></div> : (
          clinics.length === 0 ? (
            <div className="empty-state clinic-empty"><MapPin size={48} /><h3>No clinics yet</h3><p>Add your first clinic before creating schedules.</p><button className="btn-primary btn-sm" onClick={openAdd}>Add First Clinic</button></div>
          ) : (
            <div className="clinics-grid">
              {clinics.map(c => (
                <div key={c.id} className="clinic-card">
                  <div className="clinic-card-header">
                    <div className="clinic-icon"><Building2 size={22} /></div>
                    <div>
                      <h3>{c.name}</h3>
                      <span className="badge badge-blue">Active location</span>
                    </div>
                  </div>
                  <div className="clinic-detail"><MapPin size={16} /><span>{c.address}</span></div>
                  <div className="clinic-detail"><span className="clinic-dot" /><span>{c.city}</span></div>
                  {c.phone && <div className="clinic-detail"><Phone size={16} /><span>{c.phone}</span></div>}
                  <div className="card-actions">
                    <button className="btn-outline btn-sm" onClick={() => openEdit(c)}><Edit2 size={14} /> Edit</button>
                    <button className="btn-danger btn-sm" onClick={() => remove(c.id)}><Trash2 size={14} /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {showModal && (
          <Modal title={editing ? 'Edit Clinic' : 'Add New Clinic'} onClose={() => setShowModal(false)}>
            <form onSubmit={save}>
              <div className="form-group"><label>Clinic Name *</label><input required value={form.name} onChange={e => setForm({...form,name:e.target.value})} /></div>
              <div className="form-group"><label>Address *</label><input required value={form.address} onChange={e => setForm({...form,address:e.target.value})} /></div>
              <div className="form-group"><label>City *</label><input required value={form.city} onChange={e => setForm({...form,city:e.target.value})} /></div>
              <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} /></div>
              <div className="form-actions">
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </Modal>
        )}
      </main>
    </div>
  );
}
