import { useState, useEffect } from 'react';
import api from '../../api';
import '../AdminPage.css';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
                <th>Balances</th>
                <th>Status</th>
                <th>Contact</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="user-info">
                      <div className="avatar" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)' }}>{u.firstName?.[0] || 'U'}</div>
                      <div>
                        <div className="name">{u.firstName} {u.lastName}</div>
                        <div className="id" style={{fontSize: '0.7rem'}}>ID: {u._id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{fontSize: '0.85rem'}}>
                      <div>Dep: <strong>₹{u.walletBalance || 0}</strong></div>
                      <div>Main: <strong style={{color: '#1DB954'}}>₹{u.mainWalletBalance || 0}</strong></div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${u.subscription ? 'active' : 'inactive'}`} style={{ 
                      backgroundColor: u.subscription ? 'rgba(29, 185, 84, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: u.subscription ? '#1DB954' : '#ef4444',
                      border: `1px solid ${u.subscription ? '#1DB954' : '#ef4444'}`,
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {u.subscription ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div style={{fontSize: '0.85rem'}}>{u.email}</div>
                      <div className="phone" style={{fontSize: '0.8rem'}}>{u.phone || 'N/A'}</div>
                    </div>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{display: 'flex', gap: '8px'}}>
                      <button 
                        onClick={() => { setSelectedUser(u); setShowModal(true); }}
                        className="btn-secondary" 
                        style={{ padding: '6px 10px', fontSize: '0.75rem', margin: 0, background: '#3b82f6', color: '#fff', border: 'none' }}
                      >
                        Profile
                      </button>
                      {!u.subscription && (
                        <button onClick={() => handleUpgradeToPremium(u._id)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem', margin: 0 }}>
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedUser && (
        <div className="edit-modal-overlay">
          <div className="glass-card edit-modal-content" style={{ maxWidth: '500px' }}>
            <h3 className="modal-title">User Profile Details</h3>
            <div className="profile-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
              <div className="detail-item">
                <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Full Name</label>
                <div style={{ fontWeight: '600' }}>{selectedUser.firstName} {selectedUser.lastName}</div>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Referral Code</label>
                <div style={{ fontWeight: '600', color: '#ef4444' }}>{selectedUser.referralCode}</div>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Email</label>
                <div>{selectedUser.email}</div>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Phone</label>
                <div>{selectedUser.phone || 'N/A'}</div>
              </div>
              
              <div className="detail-item full-width" style={{ gridColumn: 'span 2', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', marginTop: '5px' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Bank Account Information</h4>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                  {selectedUser.bankName ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span className="text-dim">Bank Name:</span> <span>{selectedUser.bankName}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span className="text-dim">Acc Number:</span> <span>{selectedUser.accountNumber}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span className="text-dim">IFSC Code:</span> <span>{selectedUser.ifscCode}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-dim">Holder:</span> <span>{selectedUser.accountHolderName}</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontStyle: 'italic' }}>Bank details not updated by user</div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button className="btn-primary" onClick={() => setShowModal(false)} style={{ width: '100%' }}>Close Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
