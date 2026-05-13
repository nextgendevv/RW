import { useState, useEffect } from 'react';
import api from '../../api';

export default function WithdrawalManagement() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const res = await api.get('/admin/withdrawals');
      setWithdrawals(res.data);
    } catch (err) {
      console.error('Failed to fetch withdrawals', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const adminMessage = prompt(`Enter ${action} reason (optional):`);
      const res = await api.put(`/admin/withdrawals/${id}/${action}`, { adminMessage });
      setMsg({ text: res.data.message, type: 'success' });
      fetchWithdrawals();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Action failed', type: 'error' });
    } finally {
      setTimeout(() => setMsg({ text: '', type: '' }), 5000);
    }
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="gradient-text" style={{ background: 'linear-gradient(135deg, #1DB954 0%, #15803d 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Withdrawal Approvals</h1>
        <p>Manage and process withdrawal requests from users' Main Wallets</p>
      </div>

      {msg.text && (
        <div className={`alert ${msg.type}`} style={{ padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', background: msg.type === 'success' ? 'rgba(29, 185, 84, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: msg.type === 'success' ? '#1DB954' : '#ef4444' }}>
          {msg.text}
        </div>
      )}

      <div className="glass-card table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Bank Details</th>
              <th>Requested</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No withdrawal requests found.</td>
              </tr>
            )}
            {withdrawals.map(w => (
              <tr key={w._id}>
                <td>
                  <div className="user-info">
                    <div className="avatar">{w.user?.firstName[0]}</div>
                    <div>
                      <div className="name">{w.user?.firstName} {w.user?.lastName}</div>
                      <div className="id">{w.user?.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontWeight: '700', fontSize: '1.1rem' }}>₹{w.amount}</td>
                <td>
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong>{w.bankDetails.bankName}</strong><br/>
                    {w.bankDetails.accountNumber}<br/>
                    {w.bankDetails.ifscCode}<br/>
                    <small>{w.bankDetails.accountHolderName}</small>
                  </div>
                </td>
                <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${w.status}`}>{w.status}</span>
                </td>
                <td>
                  {w.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => handleAction(w._id, 'approve')} 
                        className="btn-primary"
                        style={{ background: '#1DB954', padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleAction(w._id, 'reject')} 
                        className="btn-logout"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', margin: 0 }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {w.status !== 'pending' && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Processed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
