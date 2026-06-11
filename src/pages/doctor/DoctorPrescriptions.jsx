import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Sidebar from '../../components/common/Sidebar';
import toast from 'react-hot-toast';
import { Pill, Calendar, MapPin, Clock, Users, MessageSquare, User } from 'lucide-react';

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

export default function DoctorPrescriptions() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ medications: '', dosage_instructions: '', diagnosis_notes: '' });
  const [saving, setSaving] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(appointmentId || '');

  useEffect(() => {
    API.get('/appointments/doctor').then(r => {
      const confirmed = (r.data.data || []).filter(a => a.status === 'confirmed');
      setAppointments(confirmed);
      if (appointmentId) setSelected(appointmentId);
    }).catch(() => {});
  }, [appointmentId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!selected) return toast.error('Select an appointment');
    setSaving(true);
    try {
      await API.post('/prescriptions', { appointment_id: selected, ...form });
      toast.success('Prescription created');
      navigate('/doctor/appointments');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />
      <main className="dashboard-main">
        <div className="dashboard-header"><h1>Write Prescription</h1></div>
        <div className="form-card">
          <form onSubmit={submit}>
            <div className="form-group">
              <label>Select Appointment *</label>
              <select required value={selected} onChange={e => setSelected(e.target.value)}>
                <option value="">Choose confirmed appointment</option>
                {appointments.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.patient_name} — {new Date(a.scheduled_at).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Diagnosis Notes *</label>
              <textarea rows={3} required value={form.diagnosis_notes}
                onChange={e => setForm({...form, diagnosis_notes: e.target.value})}
                placeholder="Patient diagnosis and observations..." maxLength={2000} />
            </div>
            <div className="form-group">
              <label>Medications *</label>
              <textarea rows={3} required value={form.medications}
                onChange={e => setForm({...form, medications: e.target.value})}
                placeholder="List of medications (e.g. Paracetamol 500mg, Amoxicillin 250mg)" />
            </div>
            <div className="form-group">
              <label>Dosage Instructions *</label>
              <textarea rows={3} required value={form.dosage_instructions}
                onChange={e => setForm({...form, dosage_instructions: e.target.value})}
                placeholder="How and when to take the medicines..." maxLength={1000} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-outline" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                <Pill size={16} /> {saving ? 'Saving...' : 'Create Prescription'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
