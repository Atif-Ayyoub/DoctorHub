import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Sidebar from '../../components/common/Sidebar';
import { Pill, Calendar, FileText, Search, MessageSquare } from 'lucide-react';

const sidebarLinks = [
  { to: '/patient', icon: Calendar, label: 'Dashboard' },
  { to: '/patient/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/patient/book', icon: Search, label: 'Find & Book Doctor' },
  { to: '/patient/prescriptions', icon: Pill, label: 'Prescriptions' },
  { to: '/patient/history', icon: FileText, label: 'Medical History' },
  { to: '/patient/messages', icon: MessageSquare, label: 'Messages' },
];

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/prescriptions/my').then(r => setPrescriptions(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />
      <main className="dashboard-main">
        <div className="dashboard-header"><h1>My Prescriptions</h1></div>
        {loading ? <div className="spinner-center"><div className="spinner" /></div> : (
          prescriptions.length === 0 ? (
            <div className="empty-state"><Pill size={48} /><h3>No prescriptions yet</h3></div>
          ) : (
            <div className="prescriptions-list">
              {prescriptions.map(p => (
                <div key={p.id} className="prescription-card">
                  <div className="prescription-header">
                    <div>
                      <h3>Prescription</h3>
                      <span>Dr. {p.doctor_name}</span>
                    </div>
                    <span className="date-badge">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="prescription-body">
                    <div className="rx-section">
                      <h4>🩺 Diagnosis</h4>
                      <p>{p.diagnosis_notes}</p>
                    </div>
                    <div className="rx-section">
                      <h4>💊 Medications</h4>
                      <p>{typeof p.medications === 'string' ? p.medications : JSON.stringify(p.medications)}</p>
                    </div>
                    <div className="rx-section">
                      <h4>📋 Instructions</h4>
                      <p>{p.dosage_instructions}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
