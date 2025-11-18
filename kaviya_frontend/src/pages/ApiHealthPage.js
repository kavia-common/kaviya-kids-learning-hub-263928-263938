import React, { useState } from 'react';
import authService from '../api/services/authService';

/**
 * PUBLIC_INTERFACE
 * ApiHealthPage
 * Simple UI to test API connectivity (/api/health) and a test POST to /api/login.
 */
export default function ApiHealthPage() {
  const [healthResult, setHealthResult] = useState(null);
  const [healthError, setHealthError] = useState(null);

  const [u, setU] = useState('demo');
  const [p, setP] = useState('demo123');
  const [loginResult, setLoginResult] = useState(null);
  const [loginError, setLoginError] = useState(null);

  const runHealth = async () => {
    setHealthError(null);
    setHealthResult(null);
    try {
      const res = await authService.health();
      setHealthResult(res);
    } catch (e) {
      setHealthError(e?.message || 'Health check failed');
    }
  };

  const runLogin = async () => {
    setLoginError(null);
    setLoginResult(null);
    try {
      const res = await authService.debugLogin({ username: u, password: p });
      setLoginResult(res);
    } catch (e) {
      setLoginError(`${e?.status || 0} ${e?.message || 'Login failed'}`);
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>API Health & Login Debug</h1>

      <section style={{ marginTop: 16 }}>
        <h2>Health Check</h2>
        <button onClick={runHealth}>Ping /api/health</button>
        <div style={{ marginTop: 8 }}>
          {healthResult && <pre aria-label="health-result">{JSON.stringify(healthResult, null, 2)}</pre>}
          {healthError && <div style={{ color: '#DC2626' }}>{healthError}</div>}
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Login Debug</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input placeholder="username" value={u} onChange={(e) => setU(e.target.value)} />
          <input placeholder="password" type="password" value={p} onChange={(e) => setP(e.target.value)} />
          <button onClick={runLogin}>POST /api/login</button>
        </div>
        <div style={{ marginTop: 8 }}>
          {loginResult && <pre aria-label="login-result">{JSON.stringify(loginResult, null, 2)}</pre>}
          {loginError && <div style={{ color: '#DC2626' }}>{loginError}</div>}
        </div>
      </section>

      <p style={{ marginTop: 24, color: '#6b7280' }}>
        Note: This page is for temporary debugging and can be removed after verifying connectivity.
      </p>
    </main>
  );
}
