import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  PhoneIcon as Phone, 
  Wallet, 
  Tv, 
  Film, 
  LinkIcon, 
  Check, 
  Copy, 
  ShieldCheck, 
  HelpCircle,
  LogOut,
  Settings
} from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const [wallet, setWallet] = useState({ deposits: [], balance: 0 });
  const [depositForm, setDepositForm] = useState({ amount: '', utrNumber: '' });
  const [depositMsg, setDepositMsg] = useState('');
  const [depositing, setDepositing] = useState(false);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const api = (await import('../api')).default;
        const res = await api.get('/wallet/deposits');
        setWallet(res.data);
      } catch (err) {
        console.error('Failed to fetch wallet', err);
      }
    };
    if (user) fetchWallet();
  }, [user]);

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    setDepositing(true);
    setDepositMsg('');
    try {
      const api = (await import('../api')).default;
      const res = await api.post('/wallet/deposit', depositForm);
      setDepositMsg('Deposit requested successfully! Waiting for admin approval.');
      setDepositForm({ amount: '', utrNumber: '' });
      setWallet(prev => ({ ...prev, deposits: [res.data.deposit, ...prev.deposits] }));
    } catch (err) {
      setDepositMsg(err.response?.data?.message || 'Error requesting deposit');
    } finally {
      setDepositing(false);
      setTimeout(() => setDepositMsg(''), 5000);
    }
  };

  const referralLink = useMemo(() => {
    return `${window.location.origin}/auth?ref=${user?.referralCode || ''}`;
  }, [user?.referralCode]);

  const profileCompletion = useMemo(() => {
    if (!user) return 0;
    let score = 0;
    if (user.firstName) score += 25;
    if (user.lastName) score += 25;
    if (user.phone) score += 25;
    if (user.email) score += 25;
    return score;
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const startEdit = () => {
    setForm({ firstName: user.firstName, lastName: user.lastName || '', phone: user.phone });
    setEditing(true);
    setSaveMsg('');
  };

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      setEditing(false);
      setSaveMsg('Success! Your profile is now up to date.');
      setTimeout(() => setSaveMsg(''), 4000);
    } catch (err) {
      setSaveMsg('Error: Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubscribe = async (plan) => {
    // Plan prices
    const prices = {
      '1_month': 99,
      '1_year': 499,
      '5_years': 1999
    };
    const price = prices[plan] || 499;

    // Check balance before even trying
    if (wallet.balance < price) {
      setSaveMsg(`Insufficient funds! ₹${price} required, but you have ₹${wallet.balance}. Please add funds below.`);
      setTimeout(() => setSaveMsg(''), 6000);
      return;
    }

    try {
      setSaving(true);
      const planName = plan === '1_month' ? '1 Month' : (plan === '1_year' ? '1 Year' : '5 Years');
      setSaveMsg(`Processing ${planName} subscription...`);
      const api = (await import('../api')).default;
      const res = await api.post('/streaming/subscribe', { plan });
      if (res.data.success) {
        setSaveMsg('Subscription successful! Refreshing...');
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      console.error('Failed to subscribe', err);
      setSaveMsg(err.response?.data?.message || 'Subscription failed. Please try again.');
      setTimeout(() => setSaveMsg(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  const shareWhatsApp = () => {
    const text = `Join me on Richway and start growing your network! Use my link: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareTelegram = () => {
    const text = `Join me on Richway and start growing your network!`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!user) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'R';
  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="profile-bg">
      <div className="profile-wrapper-premium">
        
        {/* Column 1: Identity & Profile Stats */}
        <div className="profile-sidebar">
          <div className="glass-card main-identity-card">
            <div className="profile-avatar-container">
              <div className="profile-avatar">{initials}</div>
              <div className="online-indicator" />
            </div>
            <h2 className="profile-name gradient-text">{user.firstName} {user.lastName}</h2>
            <p className="profile-status">{user.subscription ? 'Premium Member' : 'Free Member'}</p>
            <p className="profile-joined">Joined on {joinDate}</p>

            <div className="completion-stats-mini">
              <div className="completion-header">
                <span>Profile Strength</span>
                <span>{profileCompletion}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${profileCompletion}%` }} />
              </div>
            </div>

            <div className="identity-actions-vertical">
              <button className="btn-primary-outline" onClick={startEdit} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                <Settings size={16} /> Edit Profile Details
              </button>
              <button className="btn-logout-minimal" onClick={handleLogout} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>

          <div className="glass-card personal-info-card">
            <h3 className="card-title">Personal Data</h3>
            <div className="info-list">
              <div className="info-item" style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <Mail size={18} className="text-dim" />
                <div style={{flex: 1}}>
                  <label>Email</label>
                  <div className="value">{user.email}</div>
                </div>
              </div>
              <div className="info-item" style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <Phone size={18} className="text-dim" />
                <div style={{flex: 1}}>
                  <label>Phone</label>
                  <div className="value">{user.phone || 'Not set'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Core Features (Wallet & Premium) */}
        <div className="profile-main-content">
          <div className="glass-card wallet-card-premium">
            <div className="wallet-header">
              <div className="wallet-title-group">
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px'}}>
                  <Wallet size={20} className="text-primary" />
                  <h3 style={{margin: 0}}>Financial Overview</h3>
                </div>
                <p>Manage your funds and deposit history</p>
              </div>
              <div className="wallet-balance-box">
                <span className="label">Available Balance</span>
                <span className="value">₹{wallet.balance}</span>
              </div>
            </div>

            <div className="deposit-section-premium">
              <form onSubmit={handleDepositSubmit} className="deposit-form-modern">
                <h4>Quick Deposit</h4>
                <div className="deposit-input-grid">
                  <div className="form-group">
                    <label>Amount (₹)</label>
                    <input type="number" required value={depositForm.amount} onChange={e => setDepositForm({...depositForm, amount: e.target.value})} min="1" placeholder="0.00" />
                  </div>
                  <div className="form-group">
                    <label>UTR Number</label>
                    <input type="text" required value={depositForm.utrNumber} onChange={e => setDepositForm({...depositForm, utrNumber: e.target.value})} placeholder="Transaction ID" />
                  </div>
                </div>
                <button type="submit" className="btn-primary" disabled={depositing}>
                  {depositing ? 'Processing...' : 'Submit Deposit Request'}
                </button>
                {depositMsg && <div className="form-feedback-floating">{depositMsg}</div>}
              </form>
            </div>

            <div className="deposit-history-premium">
              <h4 className="section-subtitle">Recent Transactions</h4>
              <div className="history-table-mini">
                {wallet.deposits.length === 0 ? <p className="empty-history">No history found.</p> : null}
                {wallet.deposits.map(dep => (
                  <div key={dep._id} className="history-row-item">
                    <div className="row-info">
                      <span className="amount">₹{dep.amount}</span>
                      <span className="utr">{dep.utrNumber}</span>
                    </div>
                    <div className="row-meta">
                      <span className={`status-badge-compact ${dep.status}`}>{dep.status}</span>
                      <span className="date">{new Date(dep.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card subscription-card-premium">
            <div className="card-header">
              <div className="header-icon"><Tv size={40} className="text-primary" /></div>
              <div className="header-text">
                <h3>Richway Membership</h3>
                <p>Unlock Premium Benefits & Start Earning Commissions</p>
              </div>
            </div>

            {!user.subscription ? (
              <div className="subscription-options">
                <div className="membership-benefits-list" style={{ marginBottom: '20px', fontSize: '0.9rem', color: 'var(--text-dim)', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Check size={14} className="text-primary" /> 10% Referral Commission on all network growth
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Check size={14} className="text-primary" /> Full Access to NetX Streaming Platform
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Check size={14} className="text-primary" /> Verified Profile Badge & Networking Tools
                  </div>
                </div>
                <div className="plan-selection">
                  <div className="plan-item" onClick={() => handleSubscribe('1_month')}>
                    <span className="plan-name">1 Month</span>
                    <span className="plan-price">₹99</span>
                    <button className="btn-plan-select">Select</button>
                  </div>
                  <div className="plan-item featured" onClick={() => handleSubscribe('1_year')}>
                    <span className="plan-name">1 Year</span>
                    <span className="plan-price">₹499</span>
                    <button className="btn-plan-select">Select</button>
                  </div>
                  <div className="plan-item" onClick={() => handleSubscribe('5_years')}>
                    <span className="plan-name">5 Years</span>
                    <span className="plan-price">₹1999</span>
                    <button className="btn-plan-select">Select</button>
                  </div>
                </div>
                {saveMsg && <div className="form-feedback" style={{marginTop: '15px'}}>{saveMsg}</div>}
              </div>
            ) : (
              <div className="active-subscription-view">
                 <div className="status-banner">
                    <ShieldCheck size={18} />
                    <span>Richway Member: {user.subscriptionPlan.replace('_', ' ')} Plan</span>
                 </div>
                 <button 
                   className="btn-primary btn-full" 
                   style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}
                   onClick={async () => {
                     try {
                        const api = (await import('../api')).default;
                        setSaving(true);
                        setSaveMsg('Redirecting to NetX...');
                        const response = await api.post('/streaming/sync-access');
                        if (response.data.success) {
                           window.location.href = response.data.redirectUrl || 'https://netx-1.onrender.com';
                        }
                     } catch (err) {
                        setSaveMsg('Sync failed. Try again.');
                        setTimeout(() => setSaveMsg(''), 4000);
                     } finally {
                        setSaving(false);
                     }
                   }}
                   disabled={saving}
                 >
                   <Film size={20} /> Launch NetX Streaming 
                 </button>
                 {saveMsg && <div className="form-feedback" style={{marginTop: '10px'}}>{saveMsg}</div>}
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Referral & Social */}
        <div className="profile-referral-sidebar">
          <div className="glass-card referral-card-premium">
            <div className="card-header-icon"><LinkIcon size={40} className="text-primary" /></div>
            <h3>Referral Program</h3>
            <p>Invite friends and earn 10% commission on every subscription.</p>

            <div className="referral-box-premium">
              <label>Your Link</label>
              <div className="input-with-copy">
                <input readOnly value={referralLink} />
                <button onClick={copyReferral} className={copied ? 'copied' : ''}>
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <div className="social-grid-premium">
              <button className="social-btn wa" onClick={shareWhatsApp}>WhatsApp</button>
              <button className="social-btn tg" onClick={shareTelegram}>Telegram</button>
            </div>

            <div className="referral-stats-mini">
              <div className="ref-stat">
                <span className="label">Referral Code</span>
                <span className="value code">{user.referralCode}</span>
              </div>
              <div className="ref-stat">
                <span className="label">Network Status</span>
                <span className="value active" style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                  <ShieldCheck size={14} /> Verified
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card support-card-mini">
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
              <HelpCircle size={18} className="text-dim" />
              <h4 style={{margin: 0}}>Need Help?</h4>
            </div>
            <p>Our support team is available 24/7 to assist with deposits or upgrades.</p>
            <button className="btn-ghost-small">Contact Support</button>
          </div>
        </div>

      </div>

      {editing && (
        <div className="edit-modal-overlay">
          <div className="glass-card edit-modal-content">
            <h3 className="modal-title">Update Profile</h3>
            <form className="edit-form-premium" onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Optional" />
                </div>
                <div className="form-group full-width">
                  <label>Phone Number</label>
                  <input name="phone" value={form.phone} onChange={handleChange} required />
                </div>
              </div>
              {saveMsg && <div className="form-feedback">{saveMsg}</div>}
              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
