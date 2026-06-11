import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import { MapPin, Clock, DollarSign, Star, Calendar } from 'lucide-react';

export default function DoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/doctors/${id}`).then(r => setDoctor(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!doctor) return <div className="page-container"><div className="empty-state"><h3>Doctor not found</h3></div></div>;

  const daysOrder = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  return (
    <div className="page-container">
      <div className="doctor-profile-card">
        <div className="profile-top">
          <div className="profile-avatar-lg">{doctor.full_name?.charAt(0)}</div>
          <div className="profile-info">
            <h1>{doctor.full_name}</h1>
            <span className="badge badge-blue">{doctor.treatment_type}</span>
            {doctor.specialisation && <p className="profile-spec"><Star size={16} /> {doctor.specialisation}</p>}
            <div className="profile-meta">
              {doctor.experience_years > 0 && <span><Clock size={14} /> {doctor.experience_years} yrs exp</span>}
              {doctor.consultation_fee > 0 && <span><DollarSign size={14} /> PKR {doctor.consultation_fee}</span>}
            </div>
          </div>
          <Link to={`/doctors/${id}/book`} className="btn-primary btn-lg">
            <Calendar size={18} /> Book Appointment
          </Link>
        </div>

        {doctor.bio && (
          <div className="profile-section">
            <h3>About</h3>
            <p>{doctor.bio}</p>
          </div>
        )}

        {doctor.clinics?.length > 0 && (
          <div className="profile-section">
            <h3>Clinic Locations</h3>
            <div className="clinics-list">
              {doctor.clinics.map(c => (
                <div key={c.id} className="clinic-item">
                  <MapPin size={16} />
                  <div>
                    <strong>{c.name}</strong>
                    <p>{c.address}, {c.city}</p>
                    {c.phone && <p>📞 {c.phone}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {doctor.schedules?.length > 0 && (
          <div className="profile-section">
            <h3>Availability</h3>
            <div className="schedule-list">
              {[...doctor.schedules].sort((a,b) => daysOrder.indexOf(a.day_of_week) - daysOrder.indexOf(b.day_of_week)).map(s => (
                <div key={s.id} className="schedule-item">
                  <span className="day-badge">{s.day_of_week}</span>
                  <span>{s.start_time} – {s.end_time}</span>
                  <span className="slot-info">{s.slot_duration} min slots</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
