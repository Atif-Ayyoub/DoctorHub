import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { Calendar, Pill, MapPin, Users, Clock, MessageSquare, User } from 'lucide-react';

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

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/appointments/doctor').then(r => setAppointments(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    pending: appointments.filter(a => a.status === 'pending_payment').length,
  };

  const today = new Date().toDateString();
  const todayAppts = appointments.filter(a => new Date(a.scheduled_at).toDateString() === today);

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Welcome, Dr. {user?.full_name} 👨‍⚕️</h1>
          <p>Manage your appointments and patients</p>
        </div>

        <div className="stats-grid">
          <StatCard title="Total Appointments" value={stats.total} icon={Calendar} color="blue" />
          <StatCard title="Confirmed" value={stats.confirmed} icon={Calendar} color="green" />
          <StatCard title="Completed" value={stats.completed} icon={Pill} color="purple" />
          <StatCard title="Today's Appointments" value={todayAppts.length} icon={Clock} color="yellow" />
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Today's Schedule</h2>
            <Link to="/doctor/appointments" className="btn-outline btn-sm">All Appointments</Link>
          </div>
          {loading ? <div className="spinner" /> : (
            todayAppts.length === 0 ? (
              <div className="empty-state"><Calendar size={40} /><h3>No appointments today</h3></div>
            ) : (
              <div className="appointments-list">
                {todayAppts.map(a => (
                  <div key={a.id} className="appointment-card">
                    <div className="appt-main">
                      <div className="doctor-avatar-sm">{a.patient_name?.charAt(0)}</div>
                      <div>
                        <strong>{a.patient_name}</strong>
                        <p>{a.clinic_name}</p>
                      </div>
                      <div className="appt-time"><Clock size={14} />{new Date(a.scheduled_at).toLocaleTimeString()}</div>
                      <span className={`status-badge status-${a.status}`}>{a.status.replace(/_/g,' ')}</span>
                    </div>
                    <div className="appt-actions">
                      {a.status === 'confirmed' && (
                        <Link to={`/doctor/prescriptions/new/${a.id}`} className="btn-primary btn-xs">
                          <Pill size={14} /> Add Prescription
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
