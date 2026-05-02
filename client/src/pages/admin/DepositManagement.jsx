import { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2,
  XCircle,
  Wallet
} from '../../components/Icons';
import api from '../../api';
import '../AdminPage.css';

export default function DepositManagement() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const depositsRes = await api.get('/admin/deposits');
        setDeposits(depositsRes.data);
      } catch (err) {
        console.error('Failed to fetch admin deposits', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeposits();
  }, []);

  const handleDepositAction = async (depositId, action) => {
    try {
      await api.put(`/admin/deposits/${depositId}/${action}`);
      setDeposits(deposits.map(d => d._id === depositId ? { ...d, status: action === 'approve' ? 'approved' : 'rejected' } : d));
    } catch (err) {
      console.error('Failed to update deposit', err);
      alert('Failed to update deposit status');
    }
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  const pendingCount = deposits.filter(d => d.status === 'pending').length;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="gradient-text" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Deposit Approvals</h1>
        <p>Review and verify user wallet deposit requests</p>
      </div>

      <div className="deposit-management-section glass-card">
        <div className="section-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <Wallet size={22} className="text-primary" />
            <h2 style={{margin: 0}}>Pending Requests</h2>
          </div>
          <span className="badge" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)' }}>{pendingCount} Pending</span>
        </div>
        
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Amount (₹)</th>
                <th>UTR / Transaction ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map(d => (
                <tr key={d._id}>
                  <td>
                    <div className="user-details-cell">
                        <strong>{d.user ? `${d.user.firstName} ${d.user.lastName}` : 'Unknown User'}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{d.user?.email}</div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 'bold', color: '#10b981' }}>₹{d.amount}</td>
                  <td><code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{d.utrNumber}</code></td>
                  <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className="badge" style={{ 
                        backgroundColor: d.status === 'approved' ? '#1DB954' : d.status === 'rejected' ? '#ef4444' : '#f59e0b',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        width: 'fit-content',
                        fontSize: '0.75rem'
                    }}>
                      {d.status === 'approved' ? <CheckCircle2 size={12} /> : d.status === 'rejected' ? <XCircle size={12} /> : <Clock size={12} />}
                      {d.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {d.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleDepositAction(d._id, 'approve')} className="btn-secondary" style={{ backgroundColor: '#1DB954', border: 'none', padding: '6px 12px', fontSize: '0.8rem' }}>
                          Approve
                        </button>
                        <button onClick={() => handleDepositAction(d._id, 'reject')} className="btn-secondary" style={{ backgroundColor: '#ef4444', border: 'none', padding: '6px 12px', fontSize: '0.8rem' }}>
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#6b7280' }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
              {deposits.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No deposit requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
