import { useState } from 'react';
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

  const referralLink = `${window.location.origin}/?ref=${user?.referralCode}`;

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
      setSaveMsg('Profile updated successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || '?';
  const joinDate = new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="profile-bg">
      <div className="profile-wrapper">

        {/* Left: Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar">{initials}</div>
          <h2 className="profile-name">{user.firstName} {user.lastName}</h2>
          <p className="profile-email">{user.email}</p>
          <p className="profile-joined">Member since {joinDate}</p>

          <div className="profile-divider" />

          {!editing ? (
            <>
              <div className="profile-info-list">
                <div className="profile-info-item">
                  <span className="info-label">📞 Phone</span>
                  <span className="info-value">{user.phone}</span>
                </div>
                <div className="profile-info-item">
                  <span className="info-label">🆔 Referral Code</span>
                  <span className="info-value code-badge">{user.referralCode}</span>
                </div>
                {user.referredBy && (
                  <div className="profile-info-item">
                    <span className="info-label">🎁 Referred By</span>
                    <span className="info-value">Yes</span>
                  </div>
                )}
              </div>
              {saveMsg && <div className="success-msg">{saveMsg}</div>}
              <div className="profile-actions">
                <button className="btn-secondary" onClick={startEdit}>✏️ Edit Profile</button>
                <button className="btn-danger" onClick={handleLogout}>🚪 Logout</button>
              </div>
            </>
          ) : (
            <form className="edit-form" onSubmit={handleSave}>
              <div className="form-group">
                <label>First Name</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Optional" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} required />
              </div>
              <div className="profile-actions">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : '💾 Save Changes'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>

        {/* Right: Referral Panel */}
        <div className="referral-panel">
          <div className="referral-header">
            <span className="referral-icon">🔗</span>
            <h3>Your Referral Link</h3>
          </div>
          <p className="referral-desc">Share this link with friends. When they register using it, your referral code is applied automatically!</p>

          <div className="referral-link-box">
            <span className="referral-link-text">{referralLink}</span>
          </div>

          <button className={`btn-copy ${copied ? 'copied' : ''}`} onClick={copyReferral}>
            {copied ? '✅ Copied!' : '📋 Copy Link'}
          </button>

          <div className="referral-divider" />

          <div className="referral-stats">
            <div className="stat-card">
              <span className="stat-icon">🎯</span>
              <span className="stat-label">Your Code</span>
              <span className="stat-value">{user.referralCode}</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🌿</span>
              <span className="stat-label">Status</span>
              <span className="stat-value green">Active</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
