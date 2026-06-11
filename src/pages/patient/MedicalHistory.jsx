import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Sidebar from '../../components/common/Sidebar';
import toast from 'react-hot-toast';
import { FileText, Upload, Calendar, Pill, Search, MessageSquare } from 'lucide-react';
import { fileUrl } from '../../utils/fileUrl';

const sidebarLinks = [
  { to: '/patient', icon: Calendar, label: 'Dashboard' },
  { to: '/patient/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/patient/book', icon: Search, label: 'Find & Book Doctor' },
  { to: '/patient/prescriptions', icon: Pill, label: 'Prescriptions' },
  { to: '/patient/history', icon: FileText, label: 'Medical History' },
  { to: '/patient/messages', icon: MessageSquare, label: 'Messages' },
];

const typeIcon = { prescription: '💊', note: '📝', report: '📄' };
const typeColor = { prescription: 'blue', note: 'green', report: 'purple' };

export default function MedicalHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');

  const fetch = () => {
    setLoading(true);
    API.get('/history/my').then(r => setHistory(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const uploadReport = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Select a file');
    const fd = new FormData();
    fd.append('report', file);
    fd.append('title', title || file.name);
    setUploading(true);
    try {
      await API.post('/history/reports', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Report uploaded');
      setFile(null); setTitle('');
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />
      <main className="dashboard-main">
        <div className="dashboard-header"><h1>Medical History</h1></div>

        {/* Upload report form */}
        <div className="form-card" style={{ marginBottom: 24 }}>
          <h3>📤 Upload Medical Report</h3>
          <form onSubmit={uploadReport} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
            <input type="text" placeholder="Report title (optional)" value={title}
              onChange={e => setTitle(e.target.value)} className="form-input" style={{ flex: 1, minWidth: 200 }} />
            <input type="file" accept="image/jpeg,image/png,application/pdf"
              onChange={e => setFile(e.target.files[0])} />
            <button type="submit" className="btn-primary btn-sm" disabled={uploading || !file}>
              <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </div>

        {loading ? <div className="spinner-center"><div className="spinner" /></div> : (
          history.length === 0 ? (
            <div className="empty-state"><FileText size={48} /><h3>No history records</h3></div>
          ) : (
            <div className="history-list">
              {history.map(h => (
                <div key={h.id} className={`history-card history-${typeColor[h.record_type]}`}>
                  <div className="history-icon">{typeIcon[h.record_type]}</div>
                  <div className="history-body">
                    <h4>{h.title}</h4>
                    {h.doctor_name && <p>By Dr. {h.doctor_name}</p>}
                    {h.content && <p className="history-content">{h.content}</p>}
                    {h.file_path && <a href={fileUrl(h.file_path)} target="_blank" rel="noreferrer" className="btn-outline btn-xs">📄 View File</a>}
                  </div>
                  <div className="history-date">{new Date(h.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
