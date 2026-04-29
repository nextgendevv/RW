import { useState, useEffect } from 'react';
import { 
  Users, 
  HandCoins, 
  Activity, 
  UserCheck, 
  Clock, 
  X,
  Eye,
  CheckCircle2,
  XCircle,
  LayoutDashboard
} from '../components/Icons';
import api from '../api';
import './AdminPage.css';

const TreeNode = ({ node, isLastChild }) => {
  return (
    <div className={`tree-node ${isLastChild ? 'last-child' : ''}`}>
      <div className="tree-content">
        <div className="tree-user-info">
          <div className="tree-user-avatar">{node.firstName[0]}</div>
          <div className="tree-user-details">
            <h4>{node.firstName} {node.lastName}</h4>
            <span>Level {node.level} • {new Date(node.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="tree-gain">Commission: 10%</div>
      </div>
      
      {node.children && node.children.length > 0 && (
        <div className="tree-node-children">
          {node.children.map((child, index) => (
            <TreeNode 
              key={child._id} 
              node={child} 
              isLastChild={index === node.children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserTeam, setSelectedUserTeam] = useState(null);
  const [loadingTeam, setLoadingTeam] = useState(false);

  const [commissions, setCommissions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, statsRes, depositsRes, commissionsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/stats'),
          api.get('/admin/deposits'),
          api.get('/admin/commissions')
        ]);
        setUsers(usersRes.data);
        setStats(statsRes.data);
        setDeposits(depositsRes.data);
        setCommissions(commissionsRes.data);
      } catch (err) {
        console.error('Failed to fetch admin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  const handleDepositAction = async (depositId, action) => {
    try {
      await api.put(`/admin/deposits/${depositId}/${action}`);
      setDeposits(deposits.map(d => d._id === depositId ? { ...d, status: action === 'approve' ? 'approved' : 'rejected' } : d));
    } catch (err) {
      console.error('Failed to update deposit', err);
      alert('Failed to update deposit status');
    }
  };

  const handleViewTeam = async (userId) => {
    setLoadingTeam(true);
    try {
      const response = await api.get(`/admin/users/${userId}/team`);
      setSelectedUserTeam(response.data);
    } catch (err) {
      console.error('Failed to load user team', err);
      alert('Failed to load user team');
    } finally {
      setLoadingTeam(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <LayoutDashboard size={32} className="text-primary" />
          <div>
            <h1 className="gradient-text" style={{margin: 0}}>Admin Dashboard</h1>
            <p style={{margin: 0}}>Monitor system activity and manage users across the network</p>
          </div>
        </div>
      </div>

      <div className="stats-overview">
        <div className="stat-card glass-card">
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span className="stat-label">Total Users</span>
            <Users size={20} className="text-primary" />
          </div>
          <span className="stat-value">{stats?.totalUsers || 0}</span>
          <div className="stat-status positive">+ {stats?.newUsersLast7Days || 0} this week</div>
        </div>
        <div className="stat-card glass-card">
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span className="stat-label">Total Commission Shared</span>
            <HandCoins size={20} className="text-primary" />
          </div>
          <span className="stat-value" style={{ color: '#00ff88' }}>
            ₹{commissions.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
          </span>
          <div className="stat-status positive">{commissions.length} shares</div>
        </div>
        <div className="stat-card glass-card">
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span className="stat-label">System Health</span>
            <Activity size={20} className="text-primary" />
          </div>
          <span className="stat-value">Optimal</span>
          <div className="pulse-indicator" />
        </div>
      </div>

      <div className="user-management-section glass-card">
        <div className="section-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <UserCheck size={22} className="text-primary" />
            <h2 style={{margin: 0}}>User Management</h2>
          </div>
          <span className="badge">{users.length} Users</span>
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
                    {u.subscription ? (
                      <span className="badge" style={{ backgroundColor: '#1DB954', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> Premium
                      </span>
                    ) : (
                      <button onClick={() => handleUpgradeToPremium(u._id)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
                        Upgrade
                      </button>
                    )}
                    <button onClick={() => handleViewTeam(u._id)} className="btn-secondary" style={{ marginLeft: '8px', padding: '4px 8px', fontSize: '0.8rem', backgroundColor: '#333', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Eye size={12} /> {loadingTeam ? '...' : 'View Team'}
                    </button>
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

      <div className="deposit-management-section glass-card" style={{ marginTop: '40px' }}>
        <div className="section-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <Clock size={22} className="text-primary" />
            <h2 style={{margin: 0}}>Deposit Requests</h2>
          </div>
          <span className="badge">{deposits.filter(d => d.status === 'pending').length} Pending</span>
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
                    {d.user ? `${d.user.firstName} ${d.user.lastName}` : 'Unknown User'}
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{d.user?.email}</div>
                  </td>
                  <td style={{ fontWeight: 'bold', color: '#00ff88' }}>₹{d.amount}</td>
                  <td>{d.utrNumber}</td>
                  <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className="badge" style={{ 
                        backgroundColor: d.status === 'approved' ? '#1DB954' : d.status === 'rejected' ? '#e74c3c' : '#f39c12',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        width: 'fit-content'
                    }}>
                      {d.status === 'approved' ? <CheckCircle2 size={12} /> : d.status === 'rejected' ? <XCircle size={12} /> : <Clock size={12} />}
                      {d.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {d.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleDepositAction(d._id, 'approve')} className="btn-secondary" style={{ backgroundColor: '#1DB954', border: 'none', padding: '4px 8px', fontSize: '0.8rem' }}>
                          Approve
                        </button>
                        <button onClick={() => handleDepositAction(d._id, 'reject')} className="btn-secondary" style={{ backgroundColor: '#e74c3c', border: 'none', padding: '4px 8px', fontSize: '0.8rem' }}>
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-dim)' }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
              {deposits.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No deposit requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="commission-log-section glass-card" style={{ marginTop: '40px' }}>
        <div className="section-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <HandCoins size={22} className="text-primary" />
            <h2 style={{margin: 0}}>Commission Shares</h2>
          </div>
          <span className="badge">{commissions.length} Events</span>
        </div>
        
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Recipient (Referrer)</th>
                <th>From (Subscriber)</th>
                <th>Plan</th>
                <th>Amount (₹)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map(c => (
                <tr key={c._id}>
                  <td>
                    {c.recipient ? `${c.recipient.firstName} ${c.recipient.lastName}` : 'Unknown'}
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{c.recipient?.email}</div>
                  </td>
                  <td>
                    {c.fromUser ? `${c.fromUser.firstName} ${c.fromUser.lastName}` : 'Unknown'}
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{c.fromUser?.email}</div>
                  </td>
                  <td><span className="badge" style={{ backgroundColor: '#333' }}>{c.plan}</span></td>
                  <td style={{ fontWeight: 'bold', color: '#00ff88' }}>₹{c.amount.toFixed(2)}</td>
                  <td>{new Date(c.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {commissions.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No commission shares recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Details Modal */}
      {selectedUserTeam && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: '20px'
        }}>
          <div className="modal-content glass-card" style={{
            width: '100%', maxWidth: '800px', maxHeight: '90vh',
            overflowY: 'auto', padding: '32px', position: 'relative'
          }}>
            <button onClick={() => setSelectedUserTeam(null)} style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'transparent', border: 'none', color: '#fff',
              fontSize: '1.5rem', cursor: 'pointer'
            }}><X size={24} /></button>
            
            <h2 className="gradient-text" style={{ marginBottom: '8px' }}>
              Team Structure level-wise: {selectedUserTeam.targetUser?.firstName} {selectedUserTeam.targetUser?.lastName}
            </h2>
            <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
              <div className="mini-stat">
                <span className="label">Total Members</span>
                <span className="value">{selectedUserTeam.summary.totalItems}</span>
              </div>
            </div>

            <div className="tree-container">
              <div className="tree-root">
                <h3 style={{ marginBottom: '24px', color: 'var(--primary-green)' }}>Referral Tree Layout</h3>
                {selectedUserTeam.tree && selectedUserTeam.tree.length > 0 ? (
                  selectedUserTeam.tree.map((node, i) => (
                    <TreeNode 
                      key={node._id} 
                      node={node} 
                      isLastChild={i === selectedUserTeam.tree.length - 1} 
                    />
                  ))
                ) : (
                  <div className="empty-state">No network tree found for this user.</div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
