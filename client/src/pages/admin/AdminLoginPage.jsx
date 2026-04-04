import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLoginPage.css';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(email, password);
      // The useEffect above will handle redirection if it's an admin
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card glass-card">
        <div className="admin-login-header">
          <div className="admin-brand-icon">🛡️</div>
          <h1>Richway Executive</h1>
          <p>Administration Portal Access</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && <div className="admin-error-message">{error}</div>}
          
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
            {isLoading ? 'Verifying...' : 'Authorize Access'}
          </button>
        </form>

        <div className="admin-login-footer">
          <Link to="/">Back to Main Site</Link>
          <span>v2.4.0 Secure Node</span>
        </div>
      </div>
      <div className="admin-bg-ornament"></div>
    </div>
  );
}
