import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Sidebar from '../../components/common/Sidebar';
import toast from 'react-hot-toast';
import { Calendar, FileText, Pill, Search, MessageSquare, Upload } from 'lucide-react';

const sidebarLinks = [
  { to: '/patient', icon: Calendar, label: 'Dashboard' },
  { to: '/patient/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/patient/book', icon: Search, label: 'Find & Book Doctor' },
  { to: '/patient/prescriptions', icon: Pill, label: 'Prescriptions' },
  { to: '/patient/history', icon: FileText, label: 'Medical History' },
  { to: '/patient/messages', icon: MessageSquare, label: 'Messages' },
];

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetch = () => {
    setLoading(true);
    API.get('/appointments/my').then(r => setAppointments(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await API.delete(`/appointments/${id}`);
      toast.success('Appointment cancelled');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel');
    }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>My Appointments</h1>
          <Link to="/patient/book" className="btn-primary btn-sm"><Search size={16} /> Book New</Link>
        </div>

        <div className="filter-tabs">
          {['all','pending_payment','confirmed','completed','cancelled'].map(s => (
            <button key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? <div className="spinner-center"><div className="spinner" /></div> : (
          <div className="appointments-list">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <Calendar size={48} />
                <h3>No appointments found</h3>
                <Link to="/patient/book" className="btn-primary btn-sm">Book Appointment</Link>
              </div>
            ) : filtered.map(a => (
              <div key={a.id} className="appointment-card">
                <div className="appt-main">
                  <div className="appt-doctor">
                    <div className="doctor-avatar-sm">{a.doctor_name?.charAt(0)}</div>
                    <div>
                      <strong>{a.doctor_name}</strong>
                      <p>{a.clinic_name}</p>
                    </div>
                  </div>
                  <div className="appt-time">
                    <Calendar size={16} />
                    <span>{new Date(a.scheduled_at).toLocaleString()}</span>
                  </div>
                  <span className={`status-badge status-${a.status}`}>{a.status.replace(/_/g,' ')}</span>
                </div>
                <div className="appt-actions">
                  {a.status === 'pending_payment' && (
                    <>
                      <Link to={`/patient/payments/${a.id}`} className="btn-primary btn-xs"><Upload size={14} /> Upload Payment</Link>
                      <button onClick={() => cancel(a.id)} className="btn-danger btn-xs">Cancel</button>
                    </>
                  )}
                  {a.status === 'confirmed' && (
                    <>
                      <Link to="/patient/messages" className="btn-outline btn-xs"><MessageSquare size={14} /> Message Doctor</Link>
                      <button onClick={() => cancel(a.id)} className="btn-danger btn-xs">Cancel</button>
                    </>
                  )}
                  {a.status === 'completed' && (
                    <Link to="/patient/messages" className="btn-outline btn-xs"><MessageSquare size={14} /> Message Doctor</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
