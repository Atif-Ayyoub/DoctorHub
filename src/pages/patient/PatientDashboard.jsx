import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { Calendar, FileText, Pill, Search, MessageSquare, Upload } from 'lucide-react';

const sidebarLinks = [
  { to: '/patient', icon: Calendar, label: 'Dashboard' },
  { to: '/patient/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/patient/book', icon: Search, label: 'Find & Book Doctor' },
  { to: '/patient/prescriptions', icon: Pill, label: 'Prescriptions' },
  { to: '/patient/history', icon: FileText, label: 'Medical History' },
  { to: '/patient/messages', icon: MessageSquare, label: 'Messages' },
];

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/appointments/my').then(r => setAppointments(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status === 'pending_payment').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };

  const recent = appointments.slice(0, 5);

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Welcome, {user?.full_name} 👋</h1>
          <p>Here's your health overview</p>
        </div>

        <div className="stats-grid">
          <StatCard title="Total Appointments" value={stats.total} icon={Calendar} color="blue" />
          <StatCard title="Confirmed" value={stats.confirmed} icon={Calendar} color="green" />
          <StatCard title="Pending Payment" value={stats.pending} icon={Upload} color="yellow" />
          <StatCard title="Completed" value={stats.completed} icon={FileText} color="purple" />
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Appointments</h2>
            <Link to="/patient/appointments" className="btn-outline btn-sm">View All</Link>
          </div>
          {loading ? <div className="spinner" /> : (
            <div className="table-wrap">
              {recent.length === 0 ? (
                <div className="empty-state">
                  <Calendar size={40} />
                  <h3>No appointments yet</h3>
                  <Link to="/patient/book" className="btn-primary btn-sm">Book your first appointment</Link>
                </div>
              ) : (
                <table className="data-table">
                  <thead><tr><th>Doctor</th><th>Clinic</th><th>Date & Time</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {recent.map(a => (
                      <tr key={a.id}>
                        <td>{a.doctor_name}</td>
                        <td>{a.clinic_name}</td>
                        <td>{new Date(a.scheduled_at).toLocaleString()}</td>
                        <td><span className={`status-badge status-${a.status}`}>{a.status.replace('_', ' ')}</span></td>
                        <td>
                          {a.status === 'pending_payment' && (
                            <Link to={`/patient/payments/${a.id}`} className="btn-primary btn-xs">Pay Now</Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            <Link to="/patient/book" className="quick-action-card">
              <Search size={24} />
              <span>Find a Doctor</span>
            </Link>
            <Link to="/patient/appointments" className="quick-action-card">
              <Calendar size={24} />
              <span>My Appointments</span>
            </Link>
            <Link to="/patient/history" className="quick-action-card">
              <FileText size={24} />
              <span>Medical History</span>
            </Link>
            <Link to="/patient/prescriptions" className="quick-action-card">
              <Pill size={24} />
              <span>Prescriptions</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
