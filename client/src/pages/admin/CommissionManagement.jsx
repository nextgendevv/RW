import { useState, useEffect } from 'react';
import { 
  HandCoins, 
  CheckCircle2,
  Clock,
  ArrowRight
} from '../../components/Icons';
import api from '../../api';
import '../AdminPage.css';

export default function CommissionManagement() {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        const res = await api.get('/admin/commissions');
        setCommissions(res.data);
      } catch (err) {
        console.error('Failed to fetch commissions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommissions();
  }, []);

  const handleGiveCommission = async (id) => {
    try {
      await api.put(`/admin/commissions/${id}/pay`);
      setCommissions(commissions.map(c => c._id === id ? { ...c, status: 'paid' } : c));
    } catch (err) {
      console.error('Failed to give commission', err);
      alert('Failed to give commission. Please try again.');
    }
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  const pendingCount = commissions.filter(c => c.status === 'pending').length;
  const totalPaid = commissions
    .filter(c => c.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="gradient-text" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Commission Management</h1>
        <p>Review and manually distribute referral rewards</p>
      </div>

      <div className="stats-overview" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card glass-card">
          <span className="stat-label">Pending Commissions</span>
          <span className="stat-value" style={{ color: '#f59e0b' }}>{pendingCount}</span>
          <div className="stat-status">Waiting for approval</div>
        </div>
        <div className="stat-card glass-card">
          <span className="stat-label">Total Paid Out</span>
          <span className="stat-value" style={{ color: '#10b981' }}>₹{totalPaid.toFixed(2)}</span>
          <div className="stat-status positive">{commissions.filter(c => c.status === 'paid').length} successful payments</div>
        </div>
      </div>

      <div className="user-management-section glass-card">
        <div className="section-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <HandCoins size={22} className="text-primary" />
            <h2 style={{margin: 0}}>Commission Requests</h2>
          </div>
          <span className="badge" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)' }}>{commissions.length} Total</span>
        </div>
        
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Referrer (Recipient)</th>
                <th>From User</th>
                <th>Plan Details</th>
                <th>Amount (₹)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map(c => (
                <tr key={c._id}>
                  <td>
                    <div className="user-details-cell">
                        <strong>{c.recipient ? `${c.recipient.firstName} ${c.recipient.lastName}` : 'Unknown'}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{c.recipient?.email}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{c.fromUser?.firstName}</span>
                        <ArrowRight size={12} style={{ color: '#6b7280' }} />
                        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Subscribed</span>
                    </div>
                  </td>
                  <td><span className="badge" style={{ background: '#333', fontSize: '0.7rem' }}>{c.plan}</span></td>
                  <td style={{ fontWeight: 'bold', color: '#10b981' }}>₹{c.amount.toFixed(2)}</td>
                  <td>
                    <span className="badge" style={{ 
                        backgroundColor: c.status === 'paid' ? '#1DB954' : '#f59e0b',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        width: 'fit-content',
                        fontSize: '0.75rem'
                    }}>
                      {c.status === 'paid' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {(c.status || 'pending').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {c.status !== 'paid' ? (
                      <button onClick={() => handleGiveCommission(c._id)} className="btn-secondary" style={{ backgroundColor: '#1DB954', border: 'none', padding: '6px 12px', fontSize: '0.8rem' }}>
                        Give Commission
                      </button>
                    ) : (
                      <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Successfully Paid</span>
                    )}
                  </td>
                </tr>
              ))}
              {commissions.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No commission events found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
