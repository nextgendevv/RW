import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">🌿</div>
        <h1 className="brand-name">GreenVault</h1>
      </div>
      <div className="sidebar-user">
        <p>Welcome, {user?.firstName || 'User'}</p>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Dashboard</NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Profile</NavLink>
        <NavLink to="/teams" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Teams</NavLink>
      </nav>
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>
    </aside>
  );
}