import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  Users, 
  Star, 
  CreditCard, 
  Network, 
  User, 
  Smartphone, 
  ArrowDownCircle, 
  Clock, 
  XCircle,
  ChevronRight
} from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    walletBalance: 0,
    totalReferrals: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [walletRes, teamsRes] = await Promise.all([
          api.get('/wallet/deposits'),
          api.get('/teams')
        ]);
        
        setStats({
          walletBalance: walletRes.data.balance || 0,
          totalReferrals: teamsRes.data.summary?.totalItems || 0,
          recentActivity: walletRes.data.deposits.slice(0, 5) || []
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardData();
  }, [user]);

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-text">
          <h1 className="gradient-text">Welcome back, {user.firstName}!</h1>
          <p>Here's what's happening with your account today.</p>
        </div>
        <div className="header-actions">
          <Link to="/profile" className="btn-primary">Add Funds</Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-card">
          <div className="stat-icon">
            <Wallet size={24} className="text-primary" />
          </div>
          <div className="stat-info">
            <span className="label">Wallet Balance</span>
            <span className="value">₹{stats.walletBalance}</span>
          </div>
          <div className="stat-chart-mini">
            <div className="bar" style={{height: '40%'}}></div>
            <div className="bar" style={{height: '60%'}}></div>
            <div className="bar" style={{height: '50%'}}></div>
            <div className="bar" style={{height: '80%'}}></div>
            <div className="bar" style={{height: '70%'}}></div>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon">
            <Users size={24} className="text-primary" />
          </div>
          <div className="stat-info">
            <span className="label">Your Network</span>
            <span className="value">{stats.totalReferrals} Members</span>
          </div>
          <Link to="/teams" className="stat-link">View Tree <ChevronRight size={14} style={{display: 'inline'}} /></Link>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon">
            <Star size={24} className="text-primary" />
          </div>
          <div className="stat-info">
            <span className="label">Membership</span>
            <span className="value">{user.subscription ? `Richway ${user.subscriptionPlan.replace('_', ' ')}` : 'Free User'}</span>
          </div>
          {!user.subscription && <Link to="/profile" className="stat-link highlight">Get Membership</Link>}
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="glass-card activity-panel">
          <div className="panel-header">
            <h3>Recent Wallet Activity</h3>
            <Link to="/profile">View All</Link>
          </div>
          <div className="activity-list">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map(act => (
                <div key={act._id} className="activity-item">
                  <div className={`activity-type ${act.status}`}>
                    {act.status === 'approved' ? <ArrowDownCircle size={18} /> : act.status === 'pending' ? <Clock size={18} /> : <XCircle size={18} />}
                  </div>
                  <div className="activity-details">
                    <span className="title">Deposit Request</span>
                    <span className="date">{new Date(act.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="activity-amount">
                    <span className="value">₹{act.amount}</span>
                    <span className={`status ${act.status}`}>{act.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-msg">No recent activity found.</p>
            )}
          </div>
        </div>

        <div className="glass-card quick-links-panel">
          <h3>Quick Actions</h3>
          <div className="quick-links-grid">
            <Link to="/profile" className="quick-link-item">
              <span className="icon"><CreditCard size={28} /></span>
              <span>My Wallet</span>
            </Link>
            <Link to="/teams" className="quick-link-item">
              <span className="icon"><Network size={28} /></span>
              <span>Network Tree</span>
            </Link>
            <Link to="/profile" className="quick-link-item">
              <span className="icon"><User size={28} /></span>
              <span>Edit Profile</span>
            </Link>
            <button className="quick-link-item" onClick={() => {
              const text = `Join me on Richway! ${window.location.origin}/auth?ref=${user.referralCode}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }}>
              <span className="icon"><Smartphone size={28} /></span>
              <span>Share WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}