import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * ParentLoginPage
 * A simple, accessible parent login form (email + password) at /parent.
 * - Basic front-end validation only
 * - On success, stores a mock "kaviya.parentSession" in localStorage and navigates to /parent/dashboard
 * - Corporate Navy theme with gold accents and rounded cards
 * - Accessible labels, aria-invalid, and error messaging with role="alert"
 */
export default function ParentLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [errors, setErrors] = useState({ email: '', pwd: '' });
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    try {
      const sess = JSON.parse(localStorage.getItem('kaviya.parentSession') || 'null');
      if (sess?.loggedIn) navigate('/parent/dashboard', { replace: true });
    } catch {
      // ignore
    }
  }, [navigate]);

  const validate = () => {
    const next = { email: '', pwd: '' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      next.email = 'Enter a valid email address.';
    }
    if (!pwd || pwd.length < 6) {
      next.pwd = 'Password must be at least 6 characters.';
    }
    setErrors(next);
    return !next.email && !next.pwd;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Mock login: do not send to backend; store minimal session only
    try {
      localStorage.setItem(
        'kaviya.parentSession',
        JSON.stringify({
          loggedIn: true,
          email: email.trim(),
          ts: new Date().toISOString(),
        })
      );
    } catch {
      // ignore storage failure
    }
    navigate('/parent/dashboard');
  };

  return (
    <main aria-labelledby="parent-login-title" style={styles.wrap}>
      <section style={styles.card} role="region" aria-label="Parent login form">
        <header style={styles.header}>
          <div style={styles.icon} aria-hidden="true">🛡️</div>
          <h1 id="parent-login-title" style={styles.title}>Parent Login</h1>
          <p style={styles.subtitle}>Secure access to your child’s progress and screen time controls.</p>
        </header>

        <form onSubmit={onSubmit} noValidate>
          <div style={styles.formRow}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby="email-help"
              placeholder="you@example.com"
              style={{
                ...styles.input,
                borderColor: errors.email ? '#DC2626' : '#e5e7eb',
              }}
            />
            <small id="email-help" style={styles.help}>We’ll never share your email.</small>
            {errors.email ? (
              <div role="alert" style={styles.errorText}>{errors.email}</div>
            ) : null}
          </div>

          <div style={styles.formRow}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <div style={styles.pwdWrap}>
              <input
                id="password"
                name="password"
                type={showPwd ? 'text' : 'password'}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                aria-invalid={!!errors.pwd}
                style={{
                  ...styles.input,
                  borderColor: errors.pwd ? '#DC2626' : '#e5e7eb',
                  paddingRight: 90,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                aria-pressed={showPwd}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
                style={styles.showBtn}
              >
                {showPwd ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.pwd ? (
              <div role="alert" style={styles.errorText}>{errors.pwd}</div>
            ) : null}
          </div>

          <div style={styles.actions}>
            <button type="submit" style={styles.primaryBtn}>Sign In</button>
            <button
              type="button"
              style={styles.secondaryBtn}
              onClick={() => navigate('/')}
            >
              Back Home
            </button>
          </div>
        </form>

        <footer style={styles.footnote}>
          Corporate Navy theme with gold accents • Accessible and keyboard-friendly
        </footer>
      </section>
    </main>
  );
}

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: '40px 16px',
    background:
      'radial-gradient(1200px 600px at 20% 20%, rgba(30, 58, 138, 0.08), transparent), ' +
      'radial-gradient(1000px 500px at 80% 30%, rgba(245, 158, 11, 0.10), transparent), ' +
      'linear-gradient(180deg, #ffffff 0%, #f3f4f6 100%)',
  },
  card: {
    width: '100%',
    maxWidth: 560,
    background: '#fff',
    borderRadius: 20,
    padding: 24,
    boxShadow: '0 10px 30px rgba(17,24,39,0.15)',
    border: '1px solid rgba(17, 24, 39, 0.06)',
  },
  header: { textAlign: 'center', marginBottom: 12 },
  icon: {
    fontSize: 36,
    filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.15))',
  },
  title: {
    margin: '6px 0 4px',
    fontSize: 28,
    color: '#1E3A8A',
    letterSpacing: '-0.01em',
  },
  subtitle: { margin: 0, color: '#374151' },
  formRow: { marginTop: 16, display: 'flex', flexDirection: 'column' },
  label: { fontWeight: 700, marginBottom: 6, color: '#111827' },
  input: {
    border: '2px solid #e5e7eb',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 16,
    outline: 'none',
    background: '#fff',
    transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
  },
  help: { marginTop: 6, color: '#6b7280', fontSize: 12 },
  errorText: { color: '#DC2626', fontSize: 13, marginTop: 6 },
  pwdWrap: { position: 'relative' },
  showBtn: {
    position: 'absolute',
    right: 8,
    top: 8,
    border: '2px solid #F59E0B',
    background: '#fff',
    color: '#1E3A8A',
    borderRadius: 999,
    padding: '6px 10px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 8px 18px rgba(245,158,11,0.25)',
    fontSize: 12,
  },
  actions: {
    display: 'flex',
    gap: 10,
    marginTop: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryBtn: {
    border: 'none',
    background: 'linear-gradient(135deg, #1E3A8A, #1E40AF)',
    color: '#fff',
    borderRadius: 999,
    padding: '12px 20px',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 12px 24px rgba(30, 58, 138, 0.35)',
    fontSize: 16,
  },
  secondaryBtn: {
    border: '2px solid #F59E0B',
    background: '#fff',
    color: '#1E3A8A',
    borderRadius: 999,
    padding: '12px 20px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 22px rgba(245,158,11,0.25)',
    fontSize: 16,
  },
  footnote: {
    marginTop: 14,
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
  },
};
