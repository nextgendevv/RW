import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminMobileHeader from '../components/AdminMobileHeader';
import './DashboardLayout.css';
import './AdminLayout.css';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="app-layout admin-side">
      <AdminMobileHeader onToggle={toggleSidebar} />
      
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} 
        onClick={closeSidebar} 
      />
      
      <AdminSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      <main className="app-content admin-content">
        <div className="admin-breadcrumb">
          <span>Admin Portal</span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
