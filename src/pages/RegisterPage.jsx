import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    referralCode: '', password: '', confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-fill referral code from URL ?ref=CODE
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setForm(f => ({ ...f, referralCode: ref }));
  }, [searchParams]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-group">
          <label>First Name <span className="required">*</span></label>
          <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="John" required />
        </div>
        <div className="form-group">
          <label>Last Name <span className="optional">(optional)</span></label>
          <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Doe" />
        </div>
      </div>
      <div className="form-group">
        <label>Email <span className="required">*</span></label>
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
      </div>
      <div className="form-group">
        <label>Phone Number <span className="required">*</span></label>
        <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" required />
      </div>
      <div className="form-group">
        <label>Referral Code <span className="optional">(optional)</span></label>
        <input
          name="referralCode"
          value={form.referralCode}
          onChange={handleChange}
          placeholder="e.g. ABC123"
          className={form.referralCode ? 'input-filled' : ''}
        />
        {form.referralCode && (
          <span className="referral-badge">✓ Referral applied</span>
        )}
      </div>
      <div className="form-group">
        <label>Password <span className="required">*</span></label>
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" required />
      </div>
      <div className="form-group">
        <label>Confirm Password <span className="required">*</span></label>
        <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" required />
      </div>
      {error && <div className="error-msg">{error}</div>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? <span className="spinner" /> : 'Create Account'}
      </button>
    </form>
  );
}
