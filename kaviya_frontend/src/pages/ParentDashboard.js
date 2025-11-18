import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import parentService from '../api/services/parentService';

/**
 * PUBLIC_INTERFACE
 * ParentDashboard fetches child progress for the authenticated parent.
 */
export default function ParentDashboard() {
  const { user } = useAuth();
  const childId = user?.childId || user?.id || user?._id || 'me';
  const [view, setView] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr('');
    parentService
      .getParentView(childId)
      .then((data) => {
        if (mounted) setView(data);
      })
      .catch((e) => setErr(e?.message || 'Failed to load parent view'))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [childId]);

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: '#1E3A8A' }}>Parent Dashboard</h2>
      {loading && <p>Loading...</p>}
      {err && <p style={{ color: '#DC2626' }}>{err}</p>}
      {!loading && !err && (
        <>
          <section style={{ background: '#fff', padding: 16, borderRadius: 10, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <h4 style={{ marginTop: 0, color: '#6B7280' }}>Overview</h4>
            <p>Child: {view?.child?.name || 'Unknown'}</p>
            <p>XP: {view?.child?.xp ?? 0}</p>
            <p>Level: {view?.child?.level ?? 1}</p>
          </section>

          <section style={{ marginTop: 12, background: '#fff', padding: 16, borderRadius: 10, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <h4 style={{ marginTop: 0, color: '#6B7280' }}>Recent Quizzes</h4>
            <ul>
              {(view?.recentQuizzes || []).map((q, idx) => (
                <li key={idx}>
                  {q.subject}: {q.score}/{q.total}
                </li>
              ))}
              {(!view?.recentQuizzes || view.recentQuizzes.length === 0) && <li>No data</li>}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
