import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminSidebar({ isOpen, onClose }) {
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
    <aside className={`sidebar admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-icon">🛡️</div>
        <h1 className="brand-name">Richway Admin</h1>
        <button className="sidebar-close" onClick={onClose}>✕</button>
      </div>
      
      <div className="sidebar-user">
        <div className="admin-status">Admin Access</div>
        <p>{user?.firstName} {user?.lastName}</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/admin/dashboard" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          onClick={handleLinkClick}
        >
          Dashboard
        </NavLink>
        <NavLink 
          to="/admin/users" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          onClick={handleLinkClick}
        >
          User Management
        </NavLink>
        <NavLink 
          to="/admin/deposits" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          onClick={handleLinkClick}
        >
          Deposit Approvals
        </NavLink>
        <NavLink 
          to="/admin/commissions" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          onClick={handleLinkClick}
        >
          Commission Management
        </NavLink>
        <div className="nav-divider" />
        <NavLink 
          to="/dashboard" 
          className="nav-link back-to-site"
          onClick={handleLinkClick}
        >
          Back to Site
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>
    </aside>
  );
}
