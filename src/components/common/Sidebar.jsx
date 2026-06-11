import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ links }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const portalLabels = {
    admin: 'Admin Portal',
    patient: 'Patient Portal',
    doctor: 'Doctor Portal',
    assistant: 'Assistant Portal',
    super_admin: 'Super Admin Portal',
  };

  const portalLabel = portalLabels[user?.role] || 'Portal';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-name">Doctor Hub</span>
        <span className="sidebar-portal-label">{portalLabel}</span>
      </div>
      <nav className="sidebar-nav">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            {Icon && <Icon size={18} />}
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <button type="button" className="sidebar-logout" onClick={handleLogout}>
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
