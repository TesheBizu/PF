import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { loginStart, loginSuccess, loginFailure } from '../../redux/slices/authSlice';
import './Admin.css';

function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((s) => s.auth);
  const [form, setForm]     = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [tab, setTab]       = useState('google'); // 'google' | 'password'

  useEffect(() => {
    if (isAuthenticated) navigate('/admin/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // ── Email / password login ──────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    dispatch(loginStart());
    try {
      const { data } = await api.post('/auth/login', form);
      dispatch(loginSuccess(data));
      toast.success(`Welcome back, ${data.user.name}! 👋`);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      dispatch(loginFailure(msg));
      toast.error(`❌ ${msg}`);
    }
  };

  // ── Google login ────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    dispatch(loginStart());
    try {
      const { data } = await api.post('/auth/google-login', {
        credential: credentialResponse.credential,
      });
      dispatch(loginSuccess(data));
      toast.success(`Welcome, ${data.user.name}! 👋`);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Google sign-in failed';
      dispatch(loginFailure(msg));
      toast.error(`❌ ${msg}`);
    }
  };

  const handleGoogleError = () => {
    toast.error('❌ Google sign-in was cancelled or failed');
  };

  return (
    <div className="admin-login">
      <div className="admin-login__card animate-fadeInUp">
        {/* Logo */}
        <div className="admin-login__logo">
          <div className="admin-login__logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 className="admin-login__title">Admin Portal</h1>
          <p className="admin-login__sub">Sign in to manage your portfolio</p>
        </div>

        {/* Tab switcher */}
        <div className="admin-login__tabs">
          <button
            className={`admin-login__tab${tab === 'google' ? ' admin-login__tab--active' : ''}`}
            onClick={() => setTab('google')}
          >Google</button>
          <button
            className={`admin-login__tab${tab === 'password' ? ' admin-login__tab--active' : ''}`}
            onClick={() => setTab('password')}
          >Password</button>
        </div>

        {/* ── Google tab ── */}
        {tab === 'google' && (
          <div className="admin-login__google">
            
            <div className="admin-login__google-btn">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                shape="rectangular"
                size="large"
                width="100%"
                text="signin_with"
                logo_alignment="center"
              />
            </div>
            {!import.meta.env.VITE_GOOGLE_CLIENT_ID ||
             import.meta.env.VITE_GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE' ? (
              <div className="admin-login__setup-warn">
                ⚠️ Google Client ID not configured yet.<br/>
                <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">
                  Set it up in Google Cloud Console →
                </a>
              </div>
            ) : null}
          </div>
        )}

        {/* ── Password tab ── */}
        {tab === 'password' && (
          <form onSubmit={handleSubmit} id="admin-login-form" noValidate>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="admin-email" className="form-label">Email Address</label>
              <input
                id="admin-email" name="email" type="email"
                placeholder="abc123@gmail.com"
                className="form-input" value={form.email}
                onChange={handleChange} autoComplete="email" required
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="admin-password" className="form-label">Password</label>
              <div className="admin-login__pw-wrap">
                <input
                  id="admin-password" name="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••" className="form-input"
                  value={form.password} onChange={handleChange}
                  autoComplete="current-password" required
                />
                <button type="button" className="admin-login__pw-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit" id="admin-login-submit" className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}
              disabled={loading}>
              {loading ? (
                <><span className="contact__spinner" /> Signing in...</>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  Sign In
                </>
              )}
            </button>
          </form>
        )}

        <p className="admin-login__back">
          <a href="/" className="admin-login__back-link">← Back to portfolio</a>
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
