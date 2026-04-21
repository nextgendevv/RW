import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
      setSaveMsg('Subscription failed. Please try again.');
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
      <div className="profile-wrapper">
        
        {/* Left Section: Identity & Progress */}
        <div className="profile-column">
          <div className="glass-card profile-card main-identity">
            <div className="profile-avatar-container">
              <div className="profile-avatar">{initials}</div>
              <div className="online-indicator" />
            </div>
            <h2 className="profile-name gradient-text">{user.firstName} {user.lastName}</h2>
            <p className="profile-status">{user.subscription ? 'Premium Member' : 'Free Member'}</p>
            <p className="profile-joined">Joined on {joinDate}</p>

            <div className="completion-stats">
              <div className="completion-header">
                <span>Profile Completion</span>
                <span>{profileCompletion}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${profileCompletion}%` }} />
              </div>
            </div>

            {!user.subscription ? (
              <div className="glass-card premium-panel" style={{ marginTop: '24px', padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: 'var(--primary-green)' }}>Upgrade to Premium</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
                  Subscribe to unlock NetX Streaming and watch premium movies and TV shows!
                </p>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                  <div className="package-card" style={{ flex: 1, padding: '16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                    <h4 style={{ margin: '0 0 8px 0' }}>1 Month</h4>
                    <div style={{ fontSize: '1.5rem', color: '#00ff88', marginBottom: '16px', fontWeight: 'bold' }}>₹99</div>
                    <button 
                      className="btn-primary" style={{ width: '100%', padding: '8px', fontSize: '0.9rem' }}
                      onClick={() => handleSubscribe('1_month')}
                      disabled={saving}
                    >
                      Subscribe
                    </button>
                  </div>
                  <div className="package-card" style={{ flex: 1, padding: '16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                    <h4 style={{ margin: '0 0 8px 0' }}>1 Year</h4>
                    <div style={{ fontSize: '1.5rem', color: '#00ff88', marginBottom: '16px', fontWeight: 'bold' }}>₹499</div>
                    <button 
                      className="btn-primary" style={{ width: '100%', padding: '8px', fontSize: '0.9rem' }}
                      onClick={() => handleSubscribe('1_year')}
                      disabled={saving}
                    >
                      Subscribe
                    </button>
                  </div>
                  <div className="package-card" style={{ flex: 1, padding: '16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', background: 'rgba(0,255,136,0.05)' }}>
                    <h4 style={{ margin: '0 0 8px 0' }}>5 Years</h4>
                    <div style={{ fontSize: '1.5rem', color: '#00ff88', marginBottom: '16px', fontWeight: 'bold' }}>₹1999</div>
                    <button 
                      className="btn-primary" style={{ width: '100%', padding: '8px', fontSize: '0.9rem', background: 'linear-gradient(135deg, #00ff88, #00cc6a)' }}
                      onClick={() => handleSubscribe('5_years')}
                      disabled={saving}
                    >
                      Subscribe
                    </button>
                  </div>
                </div>
                {saveMsg && <div className="form-feedback">{saveMsg}</div>}
              </div>
            ) : (
              <div className="glass-card premium-panel" style={{ marginTop: '24px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '2rem' }}>🎬</div>
                  <div>
                     <h3 style={{ margin: 0, color: 'var(--primary-green)' }}>NetX Streaming Access</h3>
                     <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Included with your subscription</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
                  Watch premium movies and TV shows on our partner streaming platform, NetX. Activating generates an account with your current email!
                </p>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                  onClick={async () => {
                    try {
                       const api = (await import('../api')).default;
                       setSaving(true);
                       setSaveMsg('Syncing account to NetX...');
                       const response = await api.post('/streaming/sync-access');
                       if (response.data.success) {
                          setSaveMsg('Success! Redirecting...');
                          window.location.href = response.data.redirectUrl || 'https://netx-1.onrender.com';
                       }
                    } catch (err) {
                       console.error('Failed to sync to streaming', err);
                       setSaveMsg(err.response?.data?.message || 'Failed to fetch streaming access.');
                       setTimeout(() => setSaveMsg(''), 4000);
                    } finally {
                       setSaving(false);
                    }
                  }}
                  disabled={saving}
                >
                  Activate & Go to NetX 
                </button>
                {saveMsg && <div className="form-feedback" style={{marginTop: '15px'}}>{saveMsg}</div>}
              </div>
            )}

            <div className="identity-actions">
              <button className="btn-secondary" onClick={startEdit}>Edit Profile</button>
              <button className="btn-logout-minimal" onClick={handleLogout}>Sign Out</button>
            </div>
          </div>

          <div className="glass-card profile-card contact-details">
            <h3 className="section-title">Personal Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Email Address</label>
                <div className="value">{user.email}</div>
              </div>
              <div className="info-item">
                <label>Phone Number</label>
                <div className="value">{user.phone || 'Not set'}</div>
              </div>
            </div>
          </div>

          <div className="glass-card profile-card wallet-panel" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="section-title" style={{ margin: 0 }}>My Wallet</h3>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#00ff88' }}>₹{wallet.balance}</div>
            </div>
            
            <form onSubmit={handleDepositSubmit} style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '12px' }}>Add Funds</h4>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Amount (₹)</label>
                <input type="number" required value={depositForm.amount} onChange={e => setDepositForm({...depositForm, amount: e.target.value})} min="1" />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>UTR / Transaction ID</label>
                <input type="text" required value={depositForm.utrNumber} onChange={e => setDepositForm({...depositForm, utrNumber: e.target.value})} />
              </div>
              <button type="submit" className="btn-primary" disabled={depositing} style={{ width: '100%', padding: '8px' }}>
                {depositing ? 'Submitting...' : 'Request Deposit'}
              </button>
              {depositMsg && <div className="form-feedback" style={{ marginTop: '10px' }}>{depositMsg}</div>}
            </form>

            <h4 style={{ marginBottom: '12px' }}>Deposit History</h4>
            <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
              {wallet.deposits.length === 0 ? <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No deposits yet.</p> : null}
              {wallet.deposits.map(dep => (
                <div key={dep._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>₹{dep.amount}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>UTR: {dep.utrNumber}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{new Date(dep.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="badge" style={{ 
                        backgroundColor: dep.status === 'approved' ? '#1DB954' : dep.status === 'rejected' ? '#e74c3c' : '#f39c12',
                        color: '#fff', fontSize: '0.75rem', padding: '4px 8px'
                    }}>
                      {dep.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section: Network & Referrals */}
        <div className="profile-column">
          <div className="glass-card referral-panel premium-panel">
            <div className="panel-header">
              <div className="icon-box">🔗</div>
              <div>
                <h3>Growth Network</h3>
                <p>Expand your reach and earn rewards</p>
              </div>
            </div>

            <div className="link-section">
              <label>Your Unique Referral Link</label>
              <div className="referral-input-group">
                <div className="referral-url">{referralLink}</div>
                <button className={`btn-copy-icon ${copied ? 'copied' : ''}`} onClick={copyReferral}>
                  {copied ? '✓' : '⧉'}
                </button>
              </div>
            </div>

            <div className="share-actions">
              <button className="share-btn whatsapp" onClick={shareWhatsApp}>
                WhatsApp
              </button>
              <button className="share-btn telegram" onClick={shareTelegram}>
                Telegram
              </button>
              <button className="share-btn copy" onClick={copyReferral}>
                {copied ? 'Link Copied' : 'Copy Link'}
              </button>
            </div>

            <div className="referral-footer-stats">
              <div className="mini-stat">
                <span className="label">Referral Code</span>
                <span className="value code">{user.referralCode}</span>
              </div>
              <div className="mini-stat">
                <span className="label">Network Status</span>
                <span className="value status-active">Verified</span>
              </div>
            </div>
          </div>

          {editing && (
            <div className="glass-card profile-card edit-overlay">
              <h3 className="section-title">Modify Profile</h3>
              <form className="edit-form" onSubmit={handleSave}>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Optional" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input name="phone" value={form.phone} onChange={handleChange} required />
                </div>
                {saveMsg && <div className="form-feedback">{saveMsg}</div>}
                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Update Details'}
                  </button>
                  <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>Dismiss</button>
                </div>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
