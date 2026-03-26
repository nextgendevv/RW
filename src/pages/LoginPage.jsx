import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label>Email <span className="required">*</span></label>
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
      </div>
      <div className="form-group">
        <label>Password <span className="required">*</span></label>
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Your password" required />
      </div>
      {error && <div className="error-msg">{error}</div>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? <span className="spinner" /> : 'Sign In'}
      </button>
    </form>
  );
}
