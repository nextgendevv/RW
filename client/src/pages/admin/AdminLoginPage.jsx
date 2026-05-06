import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLoginPage.css';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { adminLogin, adminUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (adminUser) {
      navigate('/admin/dashboard');
    }
  }, [adminUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await adminLogin(email, password);
      // Success will trigger useEffect above
    } catch (err) {
      setError(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      {/* Decorative Background Elements */}
      <div className="admin-glow-1"></div>
      <div className="admin-glow-2"></div>

      <div className="admin-card-wrapper">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-brand-icon">🛡️</div>
            <h1>Richway Executive</h1>
            <p>Administration Portal Access</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '24px' }}>
            {error && <div className="error-msg">⚠ {error}</div>}
            
            <div className="form-group">
              <label>Master Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@richway.com"
                required 
              />
            </div>

            <div className="form-group">
              <label>Security Key</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required 
              />
            </div>

            <button 
              type="submit" 
              className="btn-admin-login" 
              disabled={isLoading}
            >
              {isLoading ? <span className="spinner" /> : 'Authorize Access'}
            </button>
          </form>

          <div className="admin-login-footer">
            <Link to="/">Back to Main Site</Link>
            <span>v2.4.0 Secure Node</span>
          </div>
        </div>
      </div>
    </div>
  );
}
