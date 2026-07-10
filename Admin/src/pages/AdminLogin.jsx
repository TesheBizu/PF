import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import api from '../services/api';
import { loginStart, loginSuccess, loginFailure } from '../redux/slices/authSlice';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import './Admin.css';

const TOTP_LENGTH = 6;

function AdminLogin({ theme, onToggleTheme }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((s) => s.auth);
  const [form, setForm]     = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [tab, setTab]       = useState('password');
  const [totpStep, setTotpStep] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [totp, setTotp] = useState(Array(TOTP_LENGTH).fill(''));
  const [totpError, setTotpError] = useState(false);
  const totpRefs = useRef([]);
  const cardRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (totpStep && totpRefs.current[0]) {
      totpRefs.current[0].focus();
    }
  }, [totpStep]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    dispatch(loginStart());
    try {
      const { data } = await api.post('/auth/login', form);
      if (data.requiresTOTP) {
        setTotpStep(true);
        setTempToken(data.tempToken);
        dispatch(loginFailure('2FA Code Required'));
        toast.info('Enter your authenticator code');
      } else {
        dispatch(loginSuccess(data));
        toast.success(`Welcome back, ${data.user.name}!`);
        navigate('/', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      dispatch(loginFailure(msg));
      toast.error(msg);
    }
  };

  const handleTotpSubmit = async (e) => {
    e.preventDefault();
    const code = totp.join('');
    if (code.length !== TOTP_LENGTH) {
      setTotpError(true);
      setTimeout(() => setTotpError(false), 500);
      toast.error('Please enter a 6-digit code');
      return;
    }
    dispatch(loginStart());
    try {
      const { data } = await api.post('/auth/totp/verify-login', { tempToken, totpCode: code });
      dispatch(loginSuccess(data));
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || '2FA verification failed';
      dispatch(loginFailure(msg));
      toast.error(msg);
      setTotpError(true);
      setTimeout(() => setTotpError(false), 500);
    }
  };

  const handleTotpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const next = [...totp];
    next[index] = value;
    setTotp(next);
    setTotpError(false);
    if (value && index < TOTP_LENGTH - 1) {
      totpRefs.current[index + 1].focus();
    }
  };

  const handleTotpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !totp[index] && index > 0) {
      totpRefs.current[index - 1].focus();
    }
    if (e.key === 'Enter') {
      handleTotpSubmit(e);
    }
  };

  const handleTotpPaste = useCallback((e) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, TOTP_LENGTH);
    if (!data) return;
    const next = [...totp];
    for (let i = 0; i < TOTP_LENGTH; i++) {
      next[i] = data[i] || '';
    }
    setTotp(next);
    const focusIdx = Math.min(data.length, TOTP_LENGTH - 1);
    totpRefs.current[focusIdx].focus();
  }, [totp]);

  const handleGoogleSuccess = async (credentialResponse) => {
    dispatch(loginStart());
    try {
      const { data } = await api.post('/auth/google-login', {
        credential: credentialResponse.credential,
      });
      dispatch(loginSuccess(data));
      toast.success(`Welcome, ${data.user.name}!`);
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Google sign-in failed';
      dispatch(loginFailure(msg));
      toast.error(msg);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google sign-in was cancelled or failed');
  };

  const goBack = () => {
    setTotpStep(false);
    setTempToken('');
    setTotp(Array(TOTP_LENGTH).fill(''));
    setTotpError(false);
  };

  return (
    <div className="admin-login">
      {/* Ambient background glow */}
      <div className="admin-login__glow admin-login__glow--1" />
      <div className="admin-login__glow admin-login__glow--2" />

      <ThemeToggle theme={theme} onToggle={onToggleTheme} className="admin-login__theme-btn" />

      <div className="admin-login__card" ref={cardRef}>
        {/* Brand */}
        <div className="admin-login__brand">
          <div className="admin-login__monogram">
            <svg viewBox="0 0 32 32" fill="none" width="20" height="20">
              <rect width="32" height="32" rx="8" fill="url(#mono-grad)" />
              <text x="16" y="22" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="800" fontFamily="Inter">T</text>
              <defs>
                <linearGradient id="mono-grad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="var(--color-primary)" />
                  <stop offset="1" stopColor="var(--color-accent)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="admin-login__wordmark">TESHOME</span>
        </div>

        <h1 className="admin-login__title">
          {totpStep ? 'Two-Factor Auth' : 'Welcome Back'}
        </h1>
        <p className="admin-login__sub">
          {totpStep
            ? 'Enter the 6-digit code from your authenticator app'
            : 'Sign in to your portfolio control panel'}
        </p>

        {totpStep ? (
          <form onSubmit={handleTotpSubmit} noValidate>
            <div className="admin-login__totp-group">
              <label className="admin-login__totp-label">Authentication Code</label>
              <div className={`admin-login__totp-row${totpError ? ' admin-login__totp-row--shake' : ''}`}>
                {totp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (totpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleTotpChange(i, e.target.value)}
                    onKeyDown={(e) => handleTotpKeyDown(i, e)}
                    onPaste={i === 0 ? handleTotpPaste : undefined}
                    className={`admin-login__totp-input${digit ? ' admin-login__totp-input--filled' : ''}`}
                    autoComplete="one-time-code"
                    aria-label={`Digit ${i + 1}`}
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary admin-login__submit-btn"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
            <button type="button" className="admin-login__back-btn" onClick={goBack}>
              ← Back to login
            </button>
          </form>
        ) : (
          <>
            {/* Segmented tabs */}
            <div className="admin-login__tabs">
              <button
                className={`admin-login__tab${tab === 'password' ? ' admin-login__tab--active' : ''}`}
                onClick={() => setTab('password')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Email & Password
              </button>
              <button
                className={`admin-login__tab${tab === 'google' ? ' admin-login__tab--active' : ''}`}
                onClick={() => setTab('google')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
                Google
              </button>
            </div>

            {tab === 'password' && (
              <form onSubmit={handleSubmit} noValidate>
                <div className="admin-login__input-group">
                  <label htmlFor="admin-email" className="admin-login__input-label">Email Address</label>
                  <div className="admin-login__input-wrap">
                    <svg className="admin-login__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <input
                      id="admin-email" name="email" type="email"
                      placeholder="you@example.com"
                      className="admin-login__input" value={form.email}
                      onChange={handleChange} autoComplete="email" required
                    />
                  </div>
                </div>
                <div className="admin-login__input-group">
                  <label htmlFor="admin-password" className="admin-login__input-label">Password</label>
                  <div className="admin-login__input-wrap">
                    <svg className="admin-login__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <input
                      id="admin-password" name="password"
                      type={showPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="admin-login__input"
                      value={form.password} onChange={handleChange}
                      autoComplete="current-password" required
                    />
                    <button type="button" className="admin-login__pw-toggle"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? 'Hide password' : 'Show password'}>
                      {showPw ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary admin-login__submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="admin-login__spinner" /> Signing in...</>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            )}

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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>Google Client ID not configured. Set it up in the&nbsp;
                      <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">Google Cloud Console</a>
                    </span>
                  </div>
                ) : null}
              </div>
            )}
          </>
        )}

        <div className="admin-login__footer">
          <a
            href={import.meta.env.VITE_PUBLIC_SITE_URL || '/'}
            className="admin-login__footer-link"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to portfolio
          </a>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
