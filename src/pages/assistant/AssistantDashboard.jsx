import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { CheckCircle, XCircle, Calendar, CreditCard } from 'lucide-react';
import { fileUrl } from '../../utils/fileUrl';

const sidebarLinks = [
  { to: '/assistant', icon: Calendar, label: 'Dashboard' },
  { to: '/assistant/payments', icon: CreditCard, label: 'Payment Verification' },
  { to: '/assistant/appointments', icon: Calendar, label: 'Appointments' },
];

export default function AssistantDashboard() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReject, setShowReject] = useState(null);
  const [reason, setReason] = useState('');

  const fetch = () => {
    setLoading(true);
    API.get('/payments/pending').then(r => setPayments(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const verify = async (id) => {
    try {
      await API.patch(`/payments/${id}/verify`);
      toast.success('Payment verified! Appointment confirmed.');
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const reject = async () => {
    if (!reason.trim()) return toast.error('Please enter a rejection reason');
    try {
      await API.patch(`/payments/${showReject}/reject`, { rejection_reason: reason });
      toast.success('Payment rejected');
      setShowReject(null); setReason('');
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Welcome, {user?.full_name} 🧑‍💼</h1>
          <p>Payment verification dashboard</p>
        </div>
        <div className="stats-grid">
          <StatCard title="Pending Payments" value={payments.length} icon={CreditCard} color="yellow" />
        </div>

        <div className="dashboard-section">
          <h2>Pending Payment Verifications</h2>
          {loading ? <div className="spinner-center"><div className="spinner" /></div> : (
            payments.length === 0 ? (
              <div className="empty-state"><CheckCircle size={48} /><h3>All payments verified!</h3></div>
            ) : (
              <div className="payments-list">
                {payments.map(p => (
                  <div key={p.id} className="payment-card">
                    <div className="payment-info">
                      <div className="doctor-avatar-sm">{p.patient_name?.charAt(0)}</div>
                      <div>
                        <strong>{p.patient_name}</strong>
                        <p>Appointment: {new Date(p.scheduled_at).toLocaleString()}</p>
                        <p className="muted">Uploaded: {new Date(p.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="payment-file">
                      <a href={fileUrl(p.file_path)} target="_blank" rel="noreferrer" className="btn-outline btn-sm">
                        📄 View Proof
                      </a>
                    </div>
                    <div className="payment-actions">
                      <button className="btn-success btn-sm" onClick={() => verify(p.id)}>
                        <CheckCircle size={16} /> Verify
                      </button>
                      <button className="btn-danger btn-sm" onClick={() => { setShowReject(p.id); setReason(''); }}>
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>

      {showReject && (
        <Modal title="Reject Payment" onClose={() => setShowReject(null)}>
          <div className="form-group">
            <label>Rejection Reason *</label>
            <textarea rows={3} placeholder="Why is this payment being rejected?" value={reason}
              onChange={e => setReason(e.target.value)} />
          </div>
          <div className="form-actions">
            <button className="btn-outline" onClick={() => setShowReject(null)}>Cancel</button>
            <button className="btn-danger" onClick={reject}>Confirm Rejection</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
