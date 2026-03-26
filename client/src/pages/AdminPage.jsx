import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPage.css';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, statsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/stats')
        ]);
        setUsers(usersRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Failed to fetch admin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="gradient-text">Admin Dashboard</h1>
        <p>Monitor system activity and manage users across the network</p>
      </div>

      <div className="stats-overview">
        <div className="stat-card glass-card">
          <span className="stat-label">Total Users</span>
          <span className="stat-value">{stats?.totalUsers || 0}</span>
          <div className="stat-status positive">+ {stats?.newUsersLast7Days || 0} this week</div>
        </div>
        <div className="stat-card glass-card">
          <span className="stat-label">Active Roles</span>
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
          <div className="pulse-indicator" />
        </div>
      </div>

      <div className="user-management-section glass-card">
        <div className="section-header">
          <h2>User Management</h2>
          <span className="badge">{users.length} Users</span>
        </div>
        
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Contact</th>
                <th>Joined</th>
                <th>Referral Code</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="user-info">
                      <div className="avatar">{u.firstName[0]}</div>
                      <div>
                        <div className="name">{u.firstName} {u.lastName}</div>
                        <div className="id">ID: {u._id.substring(18)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${u.role}`}>{u.role}</span>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div>{u.email}</div>
                      <div className="phone">{u.phone}</div>
                    </div>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td><code className="ref-code">{u.referralCode}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
