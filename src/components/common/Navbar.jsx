import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, LogOut, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardLink = () => {
    if (!user) return '/';
    const map = { patient: '/patient', doctor: '/doctor', assistant: '/assistant', admin: '/admin', super_admin: '/superadmin' };
    return map[user.role] || '/';
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-brand">
        <Link to="/" aria-label="Doctor Hub home">
          <img
            src="/doctor-hub-healthcare-logo.jpg"
            alt="Doctor Hub Healthcare Platform Logo"
            className="brand-logo"
            width="60"
            height="60"
          />
          <span className="brand-text">Doctor Hub</span>
        </Link>
      </div>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        {!user && (
          <>
            <Link to="/doctors" onClick={() => setMenuOpen(false)}>Find Doctors</Link>
            <Link to="/login" className="btn-outline nav-login" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" className="btn-primary nav-register" onClick={() => setMenuOpen(false)}>Register</Link>
          </>
        )}
        {user && (
          <>
            <Link to={dashboardLink()} onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link to="/notifications" onClick={() => setMenuOpen(false)} aria-label="View notifications"><Bell size={18} /></Link>
            <span className="user-badge">{user.role.replace('_', ' ')}</span>
            <button onClick={handleLogout} className="btn-outline btn-sm">
              <LogOut size={16} /> Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
