import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * KidAuthPage provides Login/Signup using backend authService via AuthContext.
 */
export default function KidAuthPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'kid' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await signup({ name: form.name, email: form.email, password: form.password, role: form.role });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 420, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <h2 style={{ marginBottom: 8, color: '#1E3A8A' }}>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
      <p style={{ marginTop: 0, color: '#6B7280' }}>
        {mode === 'login' ? 'Log in to continue your learning adventure.' : 'Sign up to start earning XP and badges!'}
      </p>

      <div style={{ margin: '12px 0' }}>
        <button
          onClick={() => setMode('login')}
          style={{ marginRight: 8, padding: '8px 12px', background: mode === 'login' ? '#1E3A8A' : '#E5E7EB', color: mode === 'login' ? '#fff' : '#111827', border: 'none', borderRadius: 8 }}
        >
          Login
        </button>
        <button
          onClick={() => setMode('signup')}
          style={{ padding: '8px 12px', background: mode === 'signup' ? '#F59E0B' : '#E5E7EB', color: mode === 'signup' ? '#fff' : '#111827', border: 'none', borderRadius: 8 }}
        >
          Signup
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <>
            <label style={{ display: 'block', marginTop: 12 }}>Name</label>
            <input name="name" value={form.name} onChange={onChange} required placeholder="Your name" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #D1D5DB' }} />

            <label style={{ display: 'block', marginTop: 12 }}>Role</label>
            <select name="role" value={form.role} onChange={onChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #D1D5DB' }}>
              <option value="kid">Kid</option>
              <option value="parent">Parent</option>
            </select>
          </>
        )}

        <label style={{ display: 'block', marginTop: 12 }}>Email</label>
        <input type="email" name="email" value={form.email} onChange={onChange} required placeholder="you@example.com" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #D1D5DB' }} />

        <label style={{ display: 'block', marginTop: 12 }}>Password</label>
        <input type="password" name="password" value={form.password} onChange={onChange} required placeholder="••••••••" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #D1D5DB' }} />

        {error && <div style={{ marginTop: 12, color: '#DC2626' }}>{error}</div>}

        <button type="submit" disabled={loading} style={{ marginTop: 16, width: '100%', padding: '10px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8 }}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
