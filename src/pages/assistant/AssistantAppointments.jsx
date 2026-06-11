import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Sidebar from '../../components/common/Sidebar';
import { Calendar, CreditCard } from 'lucide-react';

const sidebarLinks = [
  { to: '/assistant', icon: Calendar, label: 'Dashboard' },
  { to: '/assistant/payments', icon: CreditCard, label: 'Payment Verification' },
  { to: '/assistant/appointments', icon: Calendar, label: 'Appointments' },
];

export default function AssistantAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    API.get('/appointments/assistant').then(r => setAppointments(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />
      <main className="dashboard-main">
        <div className="dashboard-header"><h1>All Appointments</h1></div>
        <div className="filter-tabs">
          {['all','pending_payment','confirmed','completed','cancelled'].map(s => (
            <button key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s.replace(/_/g,' ')}
            </button>
          ))}
        </div>
        {loading ? <div className="spinner-center"><div className="spinner" /></div> : (
          <div className="appointments-list">
            {filtered.map(a => (
              <div key={a.id} className="appointment-card">
                <div className="appt-main">
                  <div className="doctor-avatar-sm">{a.patient_name?.charAt(0)}</div>
                  <div><strong>{a.patient_name}</strong><p>{a.clinic_name}</p></div>
                  <div className="appt-time"><Calendar size={14} />{new Date(a.scheduled_at).toLocaleString()}</div>
                  <span className={`status-badge status-${a.status}`}>{a.status.replace(/_/g,' ')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
