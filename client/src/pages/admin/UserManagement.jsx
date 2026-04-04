import { useState, useEffect } from 'react';
import api from '../../api';
import '../AdminPage.css';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRes = await api.get('/admin/users');
        setUsers(usersRes.data);
      } catch (err) {
        console.error('Failed to fetch admin users', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleUpgradeToPremium = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/premium`);
      setUsers(users.map(u => u._id === userId ? { ...u, subscription: true } : u));
    } catch (err) {
      console.error('Failed to upgrade user', err);
      alert('Failed to upgrade user');
    }
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="gradient-text" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>User Management</h1>
        <p>Monitor system activity and manage users across the network</p>
      </div>

      <div className="user-management-section glass-card">
        <div className="section-header">
          <h2>User Management</h2>
          <span className="badge" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)' }}>{users.length} Users</span>
        </div>
        
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Status</th>
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
                      <div className="avatar" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)' }}>{u.firstName[0]}</div>
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
                    {u.subscription ? (
                      <span className="badge" style={{ backgroundColor: '#1DB954' }}>Premium</span>
                    ) : (
                      <button onClick={() => handleUpgradeToPremium(u._id)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
                        Upgrade
                      </button>
                    )}
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
