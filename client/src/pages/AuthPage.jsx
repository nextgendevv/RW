import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AuthPage({ defaultRef, defaultTab }) {
  const getInitialTab = () => {
    if (defaultTab === 'signup' || defaultTab === 'signin') {
      return defaultTab;
    }
    if (defaultRef) {
      return 'signup';
    }
    return 'signin';
  };
  const [tab, setTab] = useState(getInitialTab);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    referralCode: defaultRef || '', password: '', confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    setLoginForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleRegChange = (e) => {
    setRegForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(loginForm.email, loginForm.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(regForm);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        {/* Logo / Brand */}
        <div className="auth-brand">
          <div className="brand-icon">🌿</div>
          <h1 className="brand-name">Richway</h1>
          <p className="brand-tagline">Premium Referral Network</p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`tab-btn ${tab === 'signin' ? 'active' : ''}`}
            onClick={() => { setTab('signin'); setError(''); }}
          >
            Sign In
          </button>
          <button
            className={`tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        {/* Sign In Form */}
        {tab === 'signin' && (
          <form className="auth-form" onSubmit={handleLogin} noValidate>
            <div className="form-group">
              <label>Email <span className="required">*</span></label>
              <input
                name="email" type="email"
                value={loginForm.email} onChange={handleLoginChange}
                placeholder="john@example.com" required
              />
            </div>
            <div className="form-group">
              <label>Password <span className="required">*</span></label>
              <input
                name="password" type="password"
                value={loginForm.password} onChange={handleLoginChange}
                placeholder="Your password" required
              />
            </div>
            {error && <div className="error-msg">⚠ {error}</div>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>
            <p className="auth-switch">
              Don't have an account?{' '}
              <span onClick={() => { setTab('signup'); setError(''); }}>Sign Up</span>
            </p>
          </form>
        )}

        {/* Sign Up Form */}
        {tab === 'signup' && (
          <form className="auth-form" onSubmit={handleRegister} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label>First Name <span className="required">*</span></label>
                <input
                  name="firstName" value={regForm.firstName}
                  onChange={handleRegChange} placeholder="John" required
                />
              </div>
              <div className="form-group">
                <label>Last Name <span className="optional">(optional)</span></label>
                <input
                  name="lastName" value={regForm.lastName}
                  onChange={handleRegChange} placeholder="Doe"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email <span className="required">*</span></label>
              <input
                name="email" type="email"
                value={regForm.email} onChange={handleRegChange}
                placeholder="john@example.com" required
              />
            </div>
            <div className="form-group">
              <label>Phone Number <span className="required">*</span></label>
              <input
                name="phone" type="tel"
                value={regForm.phone} onChange={handleRegChange}
                placeholder="+91 98765 43210" required
              />
            </div>
            <div className="form-group">
              <label>Referral Code <span className="optional">(optional)</span></label>
              <div className="input-with-badge">
                <input
                  name="referralCode"
                  value={regForm.referralCode}
                  onChange={handleRegChange}
                  placeholder="e.g. ABC123"
                  className={regForm.referralCode ? 'input-filled' : ''}
                />
                {regForm.referralCode && (
                  <span className="referral-badge">✓ Applied</span>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>Password <span className="required">*</span></label>
              <input
                name="password" type="password"
                value={regForm.password} onChange={handleRegChange}
                placeholder="Min 6 characters" required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password <span className="required">*</span></label>
              <input
                name="confirmPassword" type="password"
                value={regForm.confirmPassword} onChange={handleRegChange}
                placeholder="Re-enter password" required
              />
            </div>
            {error && <div className="error-msg">⚠ {error}</div>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
            <p className="auth-switch">
              Already have an account?{' '}
              <span onClick={() => { setTab('signin'); setError(''); }}>Sign In</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
