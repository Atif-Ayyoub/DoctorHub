import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Sidebar from '../../components/common/Sidebar';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { CheckCircle, XCircle, Calendar, CreditCard } from 'lucide-react';
import { fileUrl } from '../../utils/fileUrl';

const sidebarLinks = [
  { to: '/assistant', icon: Calendar, label: 'Dashboard' },
  { to: '/assistant/payments', icon: CreditCard, label: 'Payment Verification' },
  { to: '/assistant/appointments', icon: Calendar, label: 'Appointments' },
];

export default function AssistantPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReject, setShowReject] = useState(null);
  const [reason, setReason] = useState('');
  const [tab, setTab] = useState('pending');

  const fetch = () => {
    setLoading(true);
    API.get('/payments/all').then(r => setPayments(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const verify = async (id) => {
    try { await API.patch(`/payments/${id}/verify`); toast.success('Verified!'); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const reject = async () => {
    if (!reason.trim()) return toast.error('Reason required');
    try { await API.patch(`/payments/${showReject}/reject`, { rejection_reason: reason }); toast.success('Rejected'); setShowReject(null); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const filtered = tab === 'all' ? payments : payments.filter(p => p.status === tab);

  const statusColor = { pending_verification: 'yellow', verified: 'green', rejected: 'red' };

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />
      <main className="dashboard-main">
        <div className="dashboard-header"><h1>Payment Verification</h1></div>
        <div className="filter-tabs">
          {['pending_verification','verified','rejected','all'].map(s => (
            <button key={s} className={`tab ${tab === s ? 'active' : ''}`} onClick={() => setTab(s)}>
              {s.replace(/_/g,' ')}
            </button>
          ))}
        </div>
        {loading ? <div className="spinner-center"><div className="spinner" /></div> : (
          filtered.length === 0 ? <div className="empty-state"><CreditCard size={48} /><h3>No payments</h3></div> : (
            <div className="payments-list">
              {filtered.map(p => (
                <div key={p.id} className="payment-card">
                  <div className="payment-info">
                    <div className="doctor-avatar-sm">{p.patient_name?.charAt(0)}</div>
                    <div>
                      <strong>{p.patient_name}</strong>
                      <p>{new Date(p.scheduled_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`status-badge status-${statusColor[p.status] || 'gray'}`}>{p.status.replace(/_/g,' ')}</span>
                  <a href={fileUrl(p.file_path)} target="_blank" rel="noreferrer" className="btn-outline btn-sm">View Proof</a>
                  {p.status === 'pending_verification' && (
                    <div className="payment-actions">
                      <button className="btn-success btn-sm" onClick={() => verify(p.id)}><CheckCircle size={14} /> Verify</button>
                      <button className="btn-danger btn-sm" onClick={() => { setShowReject(p.id); setReason(''); }}><XCircle size={14} /> Reject</button>
                    </div>
                  )}
                  {p.status === 'rejected' && p.rejection_reason && <p className="muted">Reason: {p.rejection_reason}</p>}
                </div>
              ))}
            </div>
          )
        )}
      </main>
      {showReject && (
        <Modal title="Reject Payment" onClose={() => setShowReject(null)}>
          <div className="form-group"><label>Reason *</label><textarea rows={3} value={reason} onChange={e => setReason(e.target.value)} /></div>
          <div className="form-actions">
            <button className="btn-outline" onClick={() => setShowReject(null)}>Cancel</button>
            <button className="btn-danger" onClick={reject}>Reject</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
