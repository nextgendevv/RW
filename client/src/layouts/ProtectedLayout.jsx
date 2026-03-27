import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileHeader from '../components/MobileHeader';
import './DashboardLayout.css';

export default function ProtectedLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="app-layout">
      <MobileHeader onToggle={toggleSidebar} />
      
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} 
        onClick={closeSidebar} 
      />
      
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}