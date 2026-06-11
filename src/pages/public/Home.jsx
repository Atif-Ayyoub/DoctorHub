import { Link } from 'react-router-dom';
import { Search, Calendar, Shield, Star, Users, Clock, FileText, MessageCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>Your Health, <span className="highlight">Our Priority</span></h1>
          <p>Find the best Allopathic, Homeopathic, or Herbal doctors near you. Book appointments, manage your health records, and get prescriptions — all in one place.</p>
          <div className="hero-actions">
            <Link to="/doctors" className="btn-primary btn-lg">
              <Search size={20} /> Find doctors in Pakistan
            </Link>
            <Link to="/register" className="btn-outline btn-lg">Create patient account</Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-visual">
            <div className="hero-logo-orbit" aria-hidden="true" />
            <img
              src="/doctor-hub-healthcare-logo.jpg"
              alt="Doctor Hub Healthcare Platform Logo"
              className="hero-logo-img"
              width="640"
              height="640"
              fetchPriority="high"
            />
            <div className="floating-card floating-card-top">
              <Calendar size={18} />
              <span>Online Appointments</span>
            </div>
            <div className="floating-card floating-card-left">
              <FileText size={18} />
              <span>Medical History</span>
            </div>
            <div className="floating-card floating-card-right">
              <MessageCircle size={18} />
              <span>Prescriptions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-row">
        <h2 className="sr-only">Doctor Hub healthcare platform highlights</h2>
        <div className="stat-item"><h3>500+</h3><p>Verified Doctors</p></div>
        <div className="stat-item"><h3>10K+</h3><p>Happy Patients</p></div>
        <div className="stat-item"><h3>3</h3><p>Treatment Types</p></div>
        <div className="stat-item"><h3>24/7</h3><p>Support</p></div>
      </section>

      {/* Features */}
      <section className="features">
        <h2>Why Choose Doctor Hub?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <Search size={32} className="feature-icon" />
            <h3>Smart Search</h3>
            <p>Find doctors by disease, treatment type, or specialisation with powerful filters.</p>
          </div>
          <div className="feature-card">
            <Calendar size={32} className="feature-icon" />
            <h3>Easy Booking</h3>
            <p>Book appointments online and upload payment proof — all from your dashboard.</p>
          </div>
          <div className="feature-card">
            <Shield size={32} className="feature-icon" />
            <h3>Secure Records</h3>
            <p>Medical history is immutable and protected. Only authorized access allowed.</p>
          </div>
          <div className="feature-card">
            <Star size={32} className="feature-icon" />
            <h3>Expert Doctors</h3>
            <p>Allopathic, Homeopathic, and Herbal specialists all verified on our platform.</p>
          </div>
          <div className="feature-card">
            <Users size={32} className="feature-icon" />
            <h3>Care Teams</h3>
            <p>Doctors work with assistants who handle bookings and payment verification.</p>
          </div>
          <div className="feature-card">
            <Clock size={32} className="feature-icon" />
            <h3>Prescription History</h3>
            <p>All prescriptions stored permanently so you never lose your medical records.</p>
          </div>
        </div>
      </section>

      {/* Treatment Types */}
      <section className="treatment-types">
        <h2>All Treatment Types</h2>
        <div className="treatment-grid">
          <div className="treatment-card">
            <span>💊</span>
            <h3>Allopathic</h3>
            <p>Modern conventional medicine using pharmaceuticals and surgery.</p>
            <Link to="/doctors?treatment_type=Allopathic" className="btn-outline">Browse Doctors</Link>
          </div>
          <div className="treatment-card">
            <span>🌿</span>
            <h3>Homeopathic</h3>
            <p>Natural remedies using highly diluted substances to trigger healing.</p>
            <Link to="/doctors?treatment_type=Homeopathic" className="btn-outline">Browse Doctors</Link>
          </div>
          <div className="treatment-card">
            <span>🌱</span>
            <h3>Herbal</h3>
            <p>Plant-based treatments using nature's remedies for health and wellness.</p>
            <Link to="/doctors?treatment_type=Herbal" className="btn-outline">Browse Doctors</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to take control of your health?</h2>
        <p>Join thousands of patients managing their health with Doctor Hub.</p>
        <div className="hero-actions">
          <Link to="/doctors" className="btn-outline btn-lg">Search doctors by disease</Link>
          <Link to="/login" className="btn-outline btn-lg">Login to patient portal</Link>
          <Link to="/register" className="btn-primary btn-lg">Create free patient account</Link>
        </div>
      </section>
    </div>
  );
}
