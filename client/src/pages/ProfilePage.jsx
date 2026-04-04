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
            <p className="profile-status">Premium Member</p>
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

            {user.subscription && (
              <div style={{ backgroundColor: '#1DB954', padding: '10px', borderRadius: '5px', marginTop: '20px' }}>
                <p>👑 **NetX Pro Benefit Active!**</p>
                <p>You can watch movies on **NetX** for free with this email.</p>
                <button onClick={() => window.location.href='https://netx-1.onrender.com'}>
                    Go to NetX Now
                </button>
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
