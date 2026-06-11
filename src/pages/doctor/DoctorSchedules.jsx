import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Sidebar from '../../components/common/Sidebar';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { Clock, Plus, Calendar, Pill, MapPin, Users, MessageSquare, User, Edit2 } from 'lucide-react';

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

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const emptyForm = { clinic_id: '', days: ['Monday'], start_time: '09:00', end_time: '17:00', slot_duration: 30, is_active: true };

export default function DoctorSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    API.get('/doctors/schedules/mine').then(r => setSchedules(r.data.data || [])).catch(() => {});
    API.get('/doctors/clinics/mine').then(r => setClinics(r.data.data || [])).catch(() => {});
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, clinic_id: clinics[0]?.id || '' });
    setShowModal(true);
  };

  const openEdit = (schedule) => {
    setEditing(schedule.id);
    setForm({
      clinic_id: schedule.clinic_id,
      days: [schedule.day_of_week],
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      slot_duration: schedule.slot_duration,
      is_active: schedule.is_active,
    });
    setShowModal(true);
  };

  const toggleDay = (day) => {
    setForm((current) => {
      if (editing) return { ...current, days: [day] };
      const hasDay = current.days.includes(day);
      const days = hasDay ? current.days.filter((d) => d !== day) : [...current.days, day];
      return { ...current, days };
    });
  };

  const save = async (e) => {
    e.preventDefault();
    if (form.days.length === 0) return toast.error('Select at least one day');
    setSaving(true);
    try {
      const payload = {
        clinic_id: form.clinic_id,
        start_time: form.start_time,
        end_time: form.end_time,
        slot_duration: Number(form.slot_duration),
      };

      if (editing) {
        await API.put(`/doctors/schedules/${editing}`, {
          ...payload,
          day_of_week: form.days[0],
          is_active: form.is_active,
        });
        toast.success('Schedule updated');
      } else {
        await Promise.all(form.days.map((day) => API.post('/doctors/schedules', {
          ...payload,
          day_of_week: day,
        })));
        toast.success(form.days.length === 1 ? 'Schedule created' : 'Schedules created');
      }

      setShowModal(false);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const toggle = async (id, is_active) => {
    try {
      await API.put(`/doctors/schedules/${id}`, { is_active: !is_active });
      toast.success('Schedule updated');
      fetch();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />
      <main className="dashboard-main">
        <div className="dashboard-header panel-hero-header">
          <div>
            <h1>Availability Schedules</h1>
            <p>Select one or multiple days, then manage clinic hours without rebuilding the schedule from scratch.</p>
          </div>
          <button className="btn-primary btn-sm" onClick={openAdd}><Plus size={16} /> Add Schedule</button>
        </div>
        {schedules.length === 0 ? (
          <div className="empty-state"><Clock size={48} /><h3>No schedules</h3><p>Create availability before patients can book appointments.</p><button className="btn-primary btn-sm" onClick={openAdd}>Add First Schedule</button></div>
        ) : (
          <div className="schedules-grid">
            {schedules.map(s => {
              const clinic = clinics.find(c => c.id === s.clinic_id);
              return (
                <div key={s.id} className={`schedule-card ${s.is_active ? '' : 'inactive'}`}>
                  <div className="schedule-card-top">
                    <div className="schedule-day">{s.day_of_week}</div>
                    <span className={`status-badge ${s.is_active ? 'status-confirmed' : 'status-cancelled'}`}>{s.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="schedule-time">{s.start_time} - {s.end_time}</div>
                  <div className="schedule-slot">{s.slot_duration} min/slot</div>
                  {clinic && <div className="schedule-clinic"><MapPin size={12} />{clinic.name}</div>}
                  <div className="card-actions">
                    <button className="btn-outline btn-xs" onClick={() => openEdit(s)}><Edit2 size={14} /> Edit</button>
                    <button className={`btn-xs ${s.is_active ? 'btn-danger' : 'btn-primary'}`} onClick={() => toggle(s.id, s.is_active)}>
                      {s.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showModal && (
          <Modal title={editing ? 'Edit Schedule' : 'Add Schedule'} onClose={() => setShowModal(false)}>
            <form onSubmit={save}>
              <div className="form-group">
                <label>Clinic *</label>
                <select required value={form.clinic_id} onChange={e => setForm({...form,clinic_id:e.target.value})}>
                  <option value="">Select clinic</option>
                  {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>{editing ? 'Day *' : 'Days *'}</label>
                <div className="day-checkbox-grid">
                  {DAYS.map((day) => (
                    <label key={day} className={`day-check ${form.days.includes(day) ? 'selected' : ''}`}>
                      <input type="checkbox" checked={form.days.includes(day)} onChange={() => toggleDay(day)} />
                      <span>{day.slice(0, 3)}</span>
                    </label>
                  ))}
                </div>
                {editing && <p className="muted">Editing changes this schedule only. Create a new schedule to apply the same time to multiple days.</p>}
              </div>
              <div className="form-grid-2">
                <div className="form-group"><label>Start Time</label><input type="time" value={form.start_time} onChange={e => setForm({...form,start_time:e.target.value})} /></div>
                <div className="form-group"><label>End Time</label><input type="time" value={form.end_time} onChange={e => setForm({...form,end_time:e.target.value})} /></div>
              </div>
              <div className="form-group">
                <label>Slot Duration (minutes)</label>
                <input type="number" min={10} max={120} value={form.slot_duration} onChange={e => setForm({...form,slot_duration:e.target.value})} />
              </div>
              {editing && (
                <label className="toggle-row">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form,is_active:e.target.checked})} />
                  <span>Schedule is active and visible for bookings</span>
                </label>
              )}
              <div className="form-actions">
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Create'}</button>
              </div>
            </form>
          </Modal>
        )}
      </main>
    </div>
  );
}
