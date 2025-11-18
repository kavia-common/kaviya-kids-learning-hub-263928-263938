import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../api/services/dashboardService';

/**
 * PUBLIC_INTERFACE
 * KidDashboard fetches XP/level/badges from backend and shows loading/error states.
 */
export default function KidDashboard() {
  const { user } = useAuth();
  const userId = user?.id || user?._id || user?.userId || 'me';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    dashboardService
      .getDashboard(userId)
      .then((res) => {
        if (mounted) setData(res);
      })
      .catch((err) => setError(err?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [userId]);

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: '#1E3A8A' }}>Kid Dashboard</h2>
      {loading && <p>Loading dashboard...</p>}
      {error && <p style={{ color: '#DC2626' }}>{error}</p>}
      {!loading && !error && (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <h4 style={{ margin: 0, color: '#6B7280' }}>XP</h4>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{data?.xp ?? 0}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <h4 style={{ margin: 0, color: '#6B7280' }}>Level</h4>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{data?.level ?? 1}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <h4 style={{ margin: 0, color: '#6B7280' }}>Badges</h4>
            <ul style={{ marginTop: 8 }}>
              {(data?.badges || []).map((b, idx) => (
                <li key={idx}>{b?.name || b}</li>
              ))}
              {(!data?.badges || data.badges.length === 0) && <li>No badges yet</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
