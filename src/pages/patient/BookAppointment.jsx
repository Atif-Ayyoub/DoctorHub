import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../api/axios';
import Sidebar from '../../components/common/Sidebar';
import toast from 'react-hot-toast';
import { Search, Calendar, FileText, Pill, MessageSquare, Clock } from 'lucide-react';

const sidebarLinks = [
  { to: '/patient', icon: Calendar, label: 'Dashboard' },
  { to: '/patient/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/patient/book', icon: Search, label: 'Find & Book Doctor' },
  { to: '/patient/prescriptions', icon: Pill, label: 'Prescriptions' },
  { to: '/patient/history', icon: FileText, label: 'Medical History' },
  { to: '/patient/messages', icon: MessageSquare, label: 'Messages' },
];

function generateSlots(date, start, end, duration) {
  const slots = [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let cur = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (cur + duration <= endMin) {
    const h = Math.floor(cur / 60).toString().padStart(2, '0');
    const m = (cur % 60).toString().padStart(2, '0');
    slots.push(`${date}T${h}:${m}:00`);
    cur += duration;
  }
  return slots;
}

export default function BookAppointment() {
  const navigate = useNavigate();
  const { id: doctorId } = useParams();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState({ treatment_type: '', disease: '' });
  const [doctors, setDoctors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [clinicId, setClinicId] = useState('');
  const [scheduleId, setScheduleId] = useState('');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState([]);

  const searchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.treatment_type) params.append('treatment_type', search.treatment_type);
      if (search.disease) params.append('disease', search.disease);
      const res = await API.get(`/doctors?${params}`);
      setDoctors(res.data.data.doctors || []);
    } catch { setDoctors([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const loadDoctors = async () => {
      if (doctorId) {
        setLoading(true);
        try {
          const full = await API.get(`/doctors/${doctorId}`);
          setSelected(full.data.data);
          setStep(2);
        } catch {
          toast.error('Doctor not found');
          setSelected(null);
          setStep(1);
        } finally {
          setLoading(false);
        }
        return;
      }

      searchDoctors();
    };

    loadDoctors();
  }, [doctorId]);

  const selectDoctor = async (doc) => {
    const full = await API.get(`/doctors/${doc.id}`);
    setSelected(full.data.data);
    setStep(2);
  };

  const computeSlots = () => {
    if (!date || !scheduleId || !selected) return;
    const sch = selected.schedules?.find(s => s.id === scheduleId);
    if (!sch) return;
    const dayName = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
    if (sch.day_of_week !== dayName) { toast.error(`Selected schedule is for ${sch.day_of_week}, but date is ${dayName}`); setSlots([]); return; }
    setSlots(generateSlots(date, sch.start_time, sch.end_time, sch.slot_duration));
  };

  useEffect(() => { computeSlots(); }, [date, scheduleId]);

  const book = async () => {
    if (!clinicId || !slot) return toast.error('Please select clinic and slot');
    setLoading(true);
    try {
      await API.post('/appointments', { doctor_id: selected.id, clinic_id: clinicId, scheduled_at: slot, notes });
      toast.success('Appointment booked! Please upload payment.');
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Book an Appointment</h1>
        </div>

        {/* Step indicators */}
        <div className="steps">
          {['Find Doctor','Select Slot','Confirm'].map((s, i) => (
            <div key={i} className={`step ${step > i ? 'done' : step === i+1 ? 'active' : ''}`}>
              <span>{i+1}</span><label>{s}</label>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <div className="search-bar-row">
              <div className="search-input-wrap">
                <Search size={18} />
                <input placeholder="Disease / condition..." value={search.disease}
                  onChange={e => setSearch({ ...search, disease: e.target.value })} />
              </div>
              <select value={search.treatment_type}
                onChange={e => setSearch({ ...search, treatment_type: e.target.value })}>
                <option value="">All Types</option>
                <option value="Allopathic">Allopathic</option>
                <option value="Homeopathic">Homeopathic</option>
                <option value="Herbal">Herbal</option>
              </select>
              <button className="btn-primary" onClick={searchDoctors} disabled={loading}>Search</button>
            </div>

            {loading ? <div className="spinner-center"><div className="spinner" /></div> : (
              <div className="doctors-grid">
                {doctors.map(doc => (
                  <div key={doc.id} className="doctor-card">
                    <div className="doctor-card-header">
                      <div className="doctor-avatar">{doc.full_name?.charAt(0)}</div>
                      <div>
                        <h3>{doc.full_name}</h3>
                        <span className="badge badge-blue">{doc.treatment_type}</span>
                      </div>
                    </div>
                    <div className="doctor-card-body">
                      {doc.specialisation && <p>{doc.specialisation}</p>}
                      {doc.consultation_fee > 0 && <p>PKR {doc.consultation_fee}</p>}
                    </div>
                    <button className="btn-primary btn-full" onClick={() => selectDoctor(doc)}>
                      Select Doctor
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && selected && (
          <div className="book-step2">
            <div className="selected-doctor-card">
              <div className="doctor-avatar-lg">{selected.full_name?.charAt(0)}</div>
              <div>
                <h2>{selected.full_name}</h2>
                <p>{selected.treatment_type} · {selected.specialisation}</p>
              </div>
              <button className="btn-outline btn-sm" onClick={() => setStep(1)}>Change Doctor</button>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Select Clinic</label>
                <select value={clinicId} onChange={e => setClinicId(e.target.value)}>
                  <option value="">Choose a clinic</option>
                  {selected.clinics?.map(c => (
                    <option key={c.id} value={c.id}>{c.name} — {c.city}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Schedule</label>
                <select value={scheduleId} onChange={e => setScheduleId(e.target.value)}>
                  <option value="">Choose availability</option>
                  {selected.schedules?.map(s => (
                    <option key={s.id} value={s.id}>{s.day_of_week}: {s.start_time}–{s.end_time} ({s.slot_duration}min slots)</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Date</label>
                <input type="date" value={date} min={new Date().toISOString().split('T')[0]}
                  onChange={e => setDate(e.target.value)} />
              </div>

              {slots.length > 0 && (
                <div className="form-group full-width">
                  <label>Select Time Slot</label>
                  <div className="slots-grid">
                    {slots.map(s => (
                      <button key={s}
                        className={`slot-btn ${slot === s ? 'selected' : ''}`}
                        onClick={() => setSlot(s)}>
                        <Clock size={12} /> {s.split('T')[1].slice(0,5)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group full-width">
                <label>Notes (optional)</label>
                <textarea rows={3} placeholder="Symptoms or special notes..." value={notes}
                  onChange={e => setNotes(e.target.value)} />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-outline" onClick={() => setStep(1)}>Back</button>
              <button className="btn-primary" onClick={book} disabled={loading || !slot}>
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
