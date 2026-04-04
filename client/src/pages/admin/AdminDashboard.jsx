import { useState, useEffect } from 'react';
import api from '../../api';
import '../AdminPage.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRes = await api.get('/admin/stats');
        setStats(statsRes.data);
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="gradient-text" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Admin Dashboard</h1>
        <p>Monitor system activity and manage users across the network</p>
      </div>

      <div className="stats-overview">
        <div className="stat-card glass-card">
          <span className="stat-label">Total Users</span>
          <span className="stat-value">{stats?.totalUsers || 0}</span>
          <div className="stat-status positive">+ {stats?.newUsersLast7Days || 0} this week</div>
        </div>
        
        <div className="stat-card glass-card">
          <span className="stat-label">Role Distribution</span>
          <div className="role-distribution">
            {stats?.roleStats.map(role => (
              <div key={role._id} className="role-item">
                <span className="role-name">{role._id}</span>
                <span className="role-count">{role.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="stat-card glass-card">
          <span className="stat-label">System Health</span>
          <span className="stat-value">Optimal</span>
          <div className="pulse-indicator" style={{ backgroundColor: '#10b981' }} />
        </div>

        <div className="stat-card glass-card">
          <span className="stat-label">Platform Activity</span>
          <span className="stat-value" style={{ color: '#ef4444' }}>High</span>
          <div className="stat-status">Network operational</div>
        </div>
      </div>

      <div className="admin-recent-activity glass-card">
        <h2>Quick Reports</h2>
        <div className="reports-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          <div className="report-item" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Database Status</span>
            <div style={{ fontWeight: '600', color: '#10b981' }}>Connected</div>
          </div>
          <div className="report-item" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>API Latency</span>
            <div style={{ fontWeight: '600' }}>42ms</div>
          </div>
          <div className="report-item" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Uptime</span>
            <div style={{ fontWeight: '600' }}>99.98%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
