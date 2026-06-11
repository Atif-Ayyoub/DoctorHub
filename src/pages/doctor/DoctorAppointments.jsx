import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Sidebar from '../../components/common/Sidebar';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { Calendar, Pill, MapPin, Users, Clock, MessageSquare, User, CreditCard, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { fileUrl } from '../../utils/fileUrl';

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

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [rejectingPayment, setRejectingPayment] = useState(null);
  const [reason, setReason] = useState('');

  const fetch = () => {
    setLoading(true);
    Promise.all([
      API.get('/appointments/doctor'),
      API.get('/payments/all')
    ])
      .then(([apptRes, paymentRes]) => {
        setAppointments(apptRes.data.data || []);
        setPayments(paymentRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const complete = async (id) => {
    try {
      await API.patch(`/appointments/${id}/complete`);
      toast.success('Marked as completed');
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const verifyPayment = async (id) => {
    try {
      await API.patch(`/payments/${id}/verify`);
      toast.success('Payment confirmed');
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const rejectPayment = async () => {
    if (!reason.trim()) return toast.error('Reason required');
    try {
      await API.patch(`/payments/${rejectingPayment}/reject`, { rejection_reason: reason });
      toast.success('Payment rejected');
      setRejectingPayment(null);
      setReason('');
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);
  const paymentByAppointment = new Map(payments.map((p) => [p.appointment_id, p]));

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
          filtered.length === 0 ? (
            <div className="empty-state"><Calendar size={48} /><h3>No appointments found</h3></div>
          ) : (
            <div className="appointments-list">
              {filtered.map(a => {
                const payment = paymentByAppointment.get(a.id);
                return (
                  <div key={a.id} className="appointment-card appointment-card-rich">
                    <div className="appt-main">
                      <div className="doctor-avatar-sm">{a.patient_name?.charAt(0)}</div>
                      <div>
                        <strong>{a.patient_name}</strong>
                        <p>{a.clinic_name}</p>
                      </div>
                      <div className="appt-time"><Calendar size={14} />{new Date(a.scheduled_at).toLocaleString()}</div>
                      <span className={`status-badge status-${a.status}`}>{a.status.replace(/_/g,' ')}</span>
                    </div>
                    <div className="appt-actions">
                      {a.status === 'pending_payment' && (
                        payment ? (
                          <div className="payment-inline-panel">
                            <div>
                              <span className={`status-badge status-${payment.status}`}>{payment.status.replace(/_/g, ' ')}</span>
                              <p className="muted">Patient has uploaded payment proof.</p>
                            </div>
                            <a href={fileUrl(payment.file_path)} target="_blank" rel="noreferrer" className="btn-outline btn-xs">
                              <ExternalLink size={14} /> View Proof
                            </a>
                            {payment.status === 'pending_verification' && (
                              <>
                                <button className="btn-success btn-xs" onClick={() => verifyPayment(payment.id)}><CheckCircle size={14} /> Confirm Payment</button>
                                <button className="btn-danger btn-xs" onClick={() => { setRejectingPayment(payment.id); setReason(''); }}><XCircle size={14} /> Reject</button>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="payment-inline-panel muted">
                            <CreditCard size={16} />
                            Waiting for patient payment proof
                          </div>
                        )
                      )}
                      {['confirmed', 'completed'].includes(a.status) && (
                        <Link to="/doctor/messages" className="btn-outline btn-xs"><MessageSquare size={14} /> Message</Link>
                      )}
                      {a.status === 'confirmed' && (
                        <>
                          <Link to={`/doctor/prescriptions/new/${a.id}`} className="btn-primary btn-xs"><Pill size={14} /> Prescribe</Link>
                          <button onClick={() => complete(a.id)} className="btn-outline btn-xs">Complete</button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </main>
      {rejectingPayment && (
        <Modal title="Reject Payment" onClose={() => setRejectingPayment(null)}>
          <div className="form-group">
            <label>Reason *</label>
            <textarea rows={3} placeholder="Explain what the patient needs to correct..." value={reason} onChange={e => setReason(e.target.value)} />
          </div>
          <div className="form-actions">
            <button className="btn-outline" onClick={() => setRejectingPayment(null)}>Cancel</button>
            <button className="btn-danger" onClick={rejectPayment}>Reject Payment</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
