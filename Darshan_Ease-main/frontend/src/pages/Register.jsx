import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { register } from '../services/authService';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    role: 'User'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUserInfo } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      showToast('Passwords do not match!', 'error');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await register(formData);
      setUserInfo(data);
      showToast('Account created successfully!', 'success');
      navigate('/');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to register';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container auth-page" style={{ maxWidth: '520px' }}>
      <div className="card auth-card fade-in">
        <h2 className="auth-title">Create Account</h2>
        {error && <p className="error-text" style={{ marginBottom: '16px' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+91 98765 43210" />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="User">Devotee</option>
                <option value="Organizer">Organizer</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Address (Optional)</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="City, State" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading} id="register-submit">
            <UserPlus size={18} />
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
