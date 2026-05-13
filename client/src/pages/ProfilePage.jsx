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
  Settings,
  Bank
} from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ 
    firstName: '', 
    lastName: '', 
    phone: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: ''
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const [wallet, setWallet] = useState({ deposits: [], balance: 0, mainBalance: 0, withdrawals: [] });
  const [depositForm, setDepositForm] = useState({ amount: '', utrNumber: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '' });
  const [depositMsg, setDepositMsg] = useState('');
  const [withdrawMsg, setWithdrawMsg] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const api = (await import('../api')).default;
        const res = await api.get('/streaming/packages');
        setPackages(res.data);
      } catch (err) {
        console.error('Failed to fetch packages', err);
      } finally {
        setLoadingPackages(false);
      }
    };
    fetchPackages();
  }, []);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const api = (await import('../api')).default;
        const res = await api.get('/wallet/summary');
        setWallet({
          deposits: res.data.deposits,
          balance: res.data.depositBalance,
          mainBalance: res.data.mainBalance,
          withdrawals: res.data.withdrawals
        });
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
      setDepositMsg('Deposit request submitted! Waiting for admin approval.');
      setDepositForm({ amount: '', utrNumber: '' });
      setWallet(prev => ({ ...prev, deposits: [res.data.deposit, ...prev.deposits] }));
    } catch (err) {
      setDepositMsg(err.response?.data?.message || 'Error submitting deposit');
    } finally {
      setDepositing(false);
      setTimeout(() => setDepositMsg(''), 5000);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    if (!user.bankName || !user.accountNumber) {
      setWithdrawMsg('Please update your bank details in profile before withdrawing.');
      return;
    }
    setWithdrawing(true);
    setWithdrawMsg('');
    try {
      const api = (await import('../api')).default;
      const res = await api.post('/wallet/withdraw', withdrawForm);
      setWithdrawMsg('Withdrawal requested successfully! Waiting for admin approval.');
      setWithdrawForm({ amount: '' });
      setWallet(prev => ({ 
        ...prev, 
        mainBalance: res.data.newMainBalance,
        withdrawals: [res.data.withdrawal, ...prev.withdrawals] 
      }));
    } catch (err) {
      setWithdrawMsg(err.response?.data?.message || 'Error requesting withdrawal');
    } finally {
      setWithdrawing(false);
      setTimeout(() => setWithdrawMsg(''), 5000);
    }
  };

  const referralLink = useMemo(() => {
    return `${window.location.origin}/auth?ref=${user?.referralCode || ''}`;
  }, [user?.referralCode]);

  const profileCompletion = useMemo(() => {
    if (!user) return 0;
    let score = 0;
    if (user.firstName) score += 25;
    if (user.lastName) score += 20;
    if (user.phone) score += 20;
    if (user.email) score += 20;
    if (user.bankName && user.accountNumber) score += 20;
    return score;
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const startEdit = () => {
    setForm({ 
      firstName: user.firstName, 
      lastName: user.lastName || '', 
      phone: user.phone || '',
      bankName: user.bankName || '',
      accountNumber: user.accountNumber || '',
      ifscCode: user.ifscCode || '',
      accountHolderName: user.accountHolderName || ''
    });
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
      const pkg = packages.find(p => p.key === plan);
      if (!pkg) throw new Error('Package not found');
      
      const planDisplayName = pkg.name;
      setSaveMsg(`Processing ${planDisplayName} subscription...`);
      const api = (await import('../api')).default;
      const res = await api.post('/streaming/subscribe', { packageId: pkg._id });
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

              {/* Bank Details Display */}
              <div className="info-item" style={{display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)'}}>
                <Bank size={18} className="text-dim" />
                <div style={{flex: 1}}>
                  <label>Bank Account</label>
                  <div className="value" style={{fontSize: '0.85rem'}}>
                    {user.bankName ? (
                      <>
                        <div style={{fontWeight: 600}}>{user.bankName}</div>
                        <div className="text-dim">{user.accountNumber}</div>
                        <div className="text-dim" style={{fontSize: '0.75rem'}}>{user.ifscCode}</div>
                      </>
                    ) : (
                      <span className="text-dim">Not provided</span>
                    )}
                  </div>
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
              
              <div style={{display: 'flex', gap: '15px'}}>
                <div className="wallet-balance-box">
                  <span className="label">Deposit Wallet</span>
                  <span className="value">₹{wallet.balance}</span>
                </div>
                <div className="wallet-balance-box" style={{background: 'linear-gradient(135deg, #1DB954 0%, #15803d 100%)'}}>
                  <span className="label" style={{color: 'rgba(255,255,255,0.8)'}}>Main Wallet (Earnings)</span>
                  <span className="value" style={{color: '#fff'}}>₹{wallet.mainBalance}</span>
                </div>
              </div>
            </div>

            <div className="wallet-actions-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '0 30px 30px'}}>
              <div className="deposit-section-premium" style={{padding: 0}}>
                <form onSubmit={handleDepositSubmit} className="deposit-form-modern">
                  <h4>Quick Deposit</h4>
                  <div className="deposit-input-grid" style={{gridTemplateColumns: '1fr'}}>
                    <div className="form-group">
                      <label>Amount (₹)</label>
                      <input type="number" required value={depositForm.amount} onChange={e => setDepositForm({...depositForm, amount: e.target.value})} min="1" placeholder="0.00" />
                    </div>
                    <div className="form-group">
                      <label>UTR Number</label>
                      <input type="text" required value={depositForm.utrNumber} onChange={e => setDepositForm({...depositForm, utrNumber: e.target.value})} placeholder="Transaction ID" />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" disabled={depositing} style={{width: '100%'}}>
                    {depositing ? 'Processing...' : 'Deposit Funds'}
                  </button>
                  {depositMsg && <div className="form-feedback-floating">{depositMsg}</div>}
                </form>
              </div>

              <div className="withdraw-section-premium">
                <form onSubmit={handleWithdrawSubmit} className="deposit-form-modern" style={{background: 'rgba(29, 185, 84, 0.05)', borderColor: 'rgba(29, 185, 84, 0.2)'}}>
                  <h4 style={{color: '#1DB954'}}>Withdraw Earnings</h4>
                  <div className="deposit-input-grid" style={{gridTemplateColumns: '1fr'}}>
                    <div className="form-group">
                      <label>Amount to Withdraw (₹)</label>
                      <input type="number" required value={withdrawForm.amount} onChange={e => setWithdrawForm({...withdrawForm, amount: e.target.value})} min="1" placeholder="0.00" />
                    </div>
                    <div style={{fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '-10px'}}>
                      Funds will be sent to your registered bank account.
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" disabled={withdrawing} style={{width: '100%', background: '#1DB954'}}>
                    {withdrawing ? 'Processing...' : 'Withdraw to Bank'}
                  </button>
                  {withdrawMsg && <div className="form-feedback-floating" style={{color: '#1DB954', background: 'rgba(29, 185, 84, 0.1)'}}>{withdrawMsg}</div>}
                </form>
              </div>
            </div>

            <div className="deposit-history-premium" style={{paddingTop: 0}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                <h4 className="section-subtitle" style={{margin: 0}}>Transaction History</h4>
                <div style={{display: 'flex', gap: '10px', fontSize: '0.8rem'}}>
                   <span className="text-dim">Latest activity</span>
                </div>
              </div>
              <div className="history-table-mini" style={{maxHeight: '300px'}}>
                {[...wallet.deposits.map(d => ({...d, type: 'deposit'})), ...wallet.withdrawals.map(w => ({...w, type: 'withdrawal'}))]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((item, idx) => (
                  <div key={item._id || idx} className="history-row-item">
                    <div className="row-info">
                      <span className="amount" style={{color: item.type === 'withdrawal' ? '#ef4444' : '#1DB954'}}>
                        {item.type === 'withdrawal' ? '-' : '+'}₹{item.amount}
                      </span>
                      <span className="utr">{item.type === 'withdrawal' ? 'Withdrawal' : item.utrNumber}</span>
                    </div>
                    <div className="row-meta">
                      <span className={`status-badge-compact ${item.status}`}>{item.status}</span>
                      <span className="date">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {wallet.deposits.length === 0 && wallet.withdrawals.length === 0 ? <p className="empty-history">No history found.</p> : null}
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
                  {loadingPackages ? (
                    <div className="loading-spinner-small" />
                  ) : (
                    packages.map(pkg => (
                      <div key={pkg._id} className={`plan-item ${pkg.key === '1_year' ? 'featured' : ''}`} onClick={() => handleSubscribe(pkg.key)}>
                        {pkg.discountPercentage && <div className="plan-offer-badge">{pkg.discountPercentage}% OFF</div>}
                        <span className="plan-name">{pkg.name}</span>
                        <div className="plan-price-group">
                           {pkg.originalPrice && <span className="original-price">₹{pkg.originalPrice}</span>}
                           <span className="plan-price">₹{pkg.price}</span>
                        </div>
                        <button className="btn-plan-select">Select</button>
                      </div>
                    ))
                  )}
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

                {/* Bank Details Section */}
                <div className="form-group full-width" style={{marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px'}}>
                   <h4 style={{fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-dim)'}}>Bank Details (For Withdrawals)</h4>
                </div>

                <div className="form-group">
                  <label>Bank Name</label>
                  <input name="bankName" value={form.bankName} onChange={handleChange} placeholder="e.g. HDFC Bank" />
                </div>
                <div className="form-group">
                  <label>Account Number</label>
                  <input name="accountNumber" value={form.accountNumber} onChange={handleChange} placeholder="Account Number" />
                </div>
                <div className="form-group">
                  <label>IFSC Code</label>
                  <input name="ifscCode" value={form.ifscCode} onChange={handleChange} placeholder="IFSC Code" />
                </div>
                <div className="form-group">
                  <label>Account Holder</label>
                  <input name="accountHolderName" value={form.accountHolderName} onChange={handleChange} placeholder="Full Name" />
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
