import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLinkClick = () => {
    if (window.innerWidth <= 900) {
      onClose();
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-icon">🌿</div>
        <h1 className="brand-name">Richway</h1>
        <button className="sidebar-close" onClick={onClose}>✕</button>
      </div>
      <div className="sidebar-user">
        <p>Welcome, {user?.firstName || 'User'}</p>
      </div>
      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          onClick={handleLinkClick}
        >
          Dashboard
        </NavLink>
        <NavLink 
          to="/profile" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          onClick={handleLinkClick}
        >
          Profile
        </NavLink>
        <NavLink 
          to="/teams" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          onClick={handleLinkClick}
        >
          Teams
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink 
            to="/admin" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={handleLinkClick}
          >
            Admin
          </NavLink>
        )}
      </nav>
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>
    </aside>
  );
}