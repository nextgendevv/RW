import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Users, 
  Settings, 
  LogOut, 
  X,
  Leaf
} from '../components/Icons';
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
        <div className="brand-icon"><Leaf size={28} className="text-primary" /></div>
        <h1 className="brand-name">Richway</h1>
        <button className="sidebar-close" onClick={onClose}><X size={20} /></button>
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
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <LayoutDashboard size={18} />
            Dashboard
          </div>
        </NavLink>
        <NavLink 
          to="/profile" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          onClick={handleLinkClick}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <User size={18} />
            Profile
          </div>
        </NavLink>
        <NavLink 
          to="/teams" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          onClick={handleLinkClick}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <Users size={18} />
            Teams
          </div>
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink 
            to="/admin" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={handleLinkClick}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <Settings size={18} />
              Admin
            </div>
          </NavLink>
        )}
      </nav>
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="btn-logout" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}