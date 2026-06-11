import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import { MapPin, Clock, DollarSign, Star, Calendar } from 'lucide-react';
import { SEO, SITE_URL } from '../../components/common/SEO';
import { breadcrumb } from '../../utils/seo';

export default function DoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/doctors/${id}`).then(r => setDoctor(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!doctor) return <div className="page-container"><div className="empty-state"><h1>Doctor not found</h1></div></div>;

  const daysOrder = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const title = `${doctor.full_name} | ${doctor.specialisation || 'Doctor Profile'} | Doctor Hub`;
  const description = `View ${doctor.full_name}'s ${doctor.treatment_type || 'healthcare'} profile, clinic locations, availability, consultation fee, and book appointments online.`;
  const profilePath = `/doctors/${id}`;

  return (
    <div className="page-container">
      <SEO
        title={title}
        description={description.slice(0, 160)}
        path={profilePath}
        jsonLd={[
          breadcrumb([{ name: 'Home', path: '/' }, { name: 'Find Doctors', path: '/doctors' }, { name: doctor.full_name, path: profilePath }]),
          {
            '@context': 'https://schema.org',
            '@type': 'Physician',
            name: doctor.full_name,
            url: `${SITE_URL}${profilePath}`,
            medicalSpecialty: doctor.specialisation || doctor.treatment_type,
            priceRange: doctor.consultation_fee ? `PKR ${doctor.consultation_fee}` : undefined,
            description: doctor.bio || description,
          }
        ]}
      />
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
            <h2>About {doctor.full_name}</h2>
            <p>{doctor.bio}</p>
          </div>
        )}

        {doctor.clinics?.length > 0 && (
          <div className="profile-section">
            <h2>Clinic Locations</h2>
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
            <h2>Availability</h2>
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
