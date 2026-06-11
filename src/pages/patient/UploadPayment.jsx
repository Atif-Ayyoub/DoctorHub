import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Sidebar from '../../components/common/Sidebar';
import toast from 'react-hot-toast';
import { Upload, Calendar, FileText, Pill, Search, MessageSquare } from 'lucide-react';

const sidebarLinks = [
  { to: '/patient', icon: Calendar, label: 'Dashboard' },
  { to: '/patient/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/patient/book', icon: Search, label: 'Find & Book Doctor' },
  { to: '/patient/prescriptions', icon: Pill, label: 'Prescriptions' },
  { to: '/patient/history', icon: FileText, label: 'Medical History' },
  { to: '/patient/messages', icon: MessageSquare, label: 'Messages' },
];

export default function UploadPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f && f.type.startsWith('image/')) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');
    const formData = new FormData();
    formData.append('payment_file', file);
    formData.append('appointment_id', id);
    setLoading(true);
    try {
      await API.post('/payments/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Payment uploaded! Awaiting verification.');
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Upload Payment Proof</h1>
          <p>Upload a screenshot or receipt of your payment</p>
        </div>
        <div className="form-card">
          <form onSubmit={submit}>
            <div className="upload-area" onClick={() => document.getElementById('fileInput').click()}>
              {preview ? (
                <img src={preview} alt="Payment proof preview before upload" className="upload-preview" loading="lazy" width="320" height="220" />
              ) : (
                <>
                  <Upload size={40} />
                  <h3>Click to upload payment screenshot</h3>
                  <p>JPEG, PNG or PDF · Max 5MB</p>
                </>
              )}
              <input id="fileInput" type="file" accept="image/jpeg,image/png,application/pdf"
                onChange={handleFile} hidden />
            </div>
            {file && (
              <div className="file-info">
                <span>📄 {file.name}</span>
                <span>({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
            <div className="form-actions">
              <button type="button" className="btn-outline" onClick={() => navigate('/patient/appointments')}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading || !file}>
                <Upload size={16} /> {loading ? 'Uploading...' : 'Submit Payment'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
