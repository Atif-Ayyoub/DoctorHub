import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

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
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <span className="brand-icon">🏥</span>
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
            <Link to="/login" className="btn-outline" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" className="btn-primary" onClick={() => setMenuOpen(false)}>Register</Link>
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
