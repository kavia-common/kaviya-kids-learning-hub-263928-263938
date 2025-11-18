import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * ParentDashboard
 * Protected parent area displaying:
 * - Mock child progress chart (inline SVG bars)
 * - Screen time tracker UI with daily/weekly views and adjustable limits (non-persistent)
 * Route protection: if no session, redirects to /parent
 * Styling: Corporate Navy with gold accents, rounded cards, accessible and keyboard-friendly
 */
export default function ParentDashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    let sess = null;
    try {
      sess = JSON.parse(localStorage.getItem('kaviya.parentSession') || 'null');
    } catch {
      sess = null;
    }
    if (!sess?.loggedIn) {
      navigate('/parent', { replace: true });
      return;
    }
    setSession(sess);
  }, [navigate]);

  // Mock child data
  const childProfile = useMemo(
    () => {
      let kid = null;
      try {
        kid = JSON.parse(localStorage.getItem('kaviya.kidProfile') || 'null');
      } catch {
        kid = null;
      }
      return kid || { username: 'SkyKid', age: 8, avatar: '🙂', avatarColor: '#1E3A8A' };
    },
    []
  );

  // Mock progress data (XP earned last 7 days)
  const [progressData] = useState([30, 55, 40, 75, 20, 60, 90]); // arbitrary values
  const maxVal = Math.max(...progressData, 100);

  // Screen time tracker state (non-persistent)
  const [view, setView] = useState('daily'); // 'daily' | 'weekly'
  const [limits, setLimits] = useState({
    daily: 60,  // minutes per day
    weekly: 420 // minutes per week
  });
  const [used, setUsed] = useState({
    daily: 35,
    weekly: 210
  });

  const pctDaily = Math.min(100, Math.round((used.daily / Math.max(1, limits.daily)) * 100));
  const pctWeekly = Math.min(100, Math.round((used.weekly / Math.max(1, limits.weekly)) * 100));

  const changeLimit = (key, delta) => {
    setLimits((prev) => {
      const next = Math.max(10, (prev[key] || 0) + delta);
      return { ...prev, [key]: next };
    });
  };

  const adjustUsed = (key, delta) => {
    setUsed((prev) => {
      const next = Math.max(0, (prev[key] || 0) + delta);
      return { ...prev, [key]: next };
    });
  };

  const logout = () => {
    try {
      localStorage.removeItem('kaviya.parentSession');
    } catch {
      // ignore
    }
    navigate('/parent', { replace: true });
  };

  if (!session) return null;

  return (
    <main aria-labelledby="parent-dash-title" style={styles.wrap}>
      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={{ ...styles.avatar, background: childProfile.avatarColor }} aria-hidden="true">
              <span style={styles.avatarEmoji}>{childProfile.avatar}</span>
            </div>
            <div>
              <h1 id="parent-dash-title" style={styles.title}>
                Welcome, {session.email}
              </h1>
              <p style={styles.subtitle}>
                Monitoring {childProfile.username} (Age {childProfile.age})
              </p>
            </div>
          </div>

          <div style={styles.headerActions}>
            <button
              style={styles.secondaryBtn}
              onClick={() => navigate('/')}
              title="Back to Home"
            >
              Home
            </button>
            <button
              style={{ ...styles.secondaryBtn, borderColor: '#DC2626', color: '#DC2626' }}
              onClick={logout}
              title="Sign out of parent session"
            >
              Log Out
            </button>
          </div>
        </header>

        {/* Progress card with inline SVG bar chart */}
        <section aria-label="Child progress" style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Weekly Progress</h2>
            <span style={styles.cardHint}>XP earned per day</span>
          </div>
          <div role="img" aria-label="Bar chart of XP over last 7 days" style={styles.chartWrap}>
            {/* Inline SVG simple bars */}
            <svg width="100%" height="140" viewBox="0 0 350 140" focusable="false">
              {/* Axis line */}
              <line x1="0" y1="120" x2="350" y2="120" stroke="#E5E7EB" strokeWidth="2" />
              {progressData.map((v, i) => {
                const barWidth = 32;
                const gap = 18;
                const x = 12 + i * (barWidth + gap);
                const h = Math.round((v / maxVal) * 100);
                const y = 120 - h;
                return (
                  <g key={i}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={h}
                      rx="8"
                      fill="url(#gradNavyGold)"
                    />
                    <text
                      x={x + barWidth / 2}
                      y={y - 6}
                      fill="#111827"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {v}
                    </text>
                  </g>
                );
              })}
              {/* Labels */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => {
                const barWidth = 32;
                const gap = 18;
                const x = 12 + i * (barWidth + gap);
                return (
                  <text
                    key={d}
                    x={x + barWidth / 2}
                    y={132}
                    fill="#6B7280"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {d}
                  </text>
                );
              })}
              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradNavyGold" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#1E3A8A" />
                  <stop offset="100%" stopColor="#1E40AF" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div style={styles.progressFootnote}>
            Tip: Encourage short, focused sessions for better retention.
          </div>
        </section>

        {/* Screen Time Tracker */}
        <section aria-label="Screen time tracker" style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Screen Time</h2>
            <div role="tablist" aria-label="Screen time views" style={styles.tablist}>
              <button
                role="tab"
                aria-selected={view === 'daily'}
                onClick={() => setView('daily')}
                style={{ ...styles.tabBtn, ...(view === 'daily' ? styles.tabBtnActive : {}) }}
              >
                Daily
              </button>
              <button
                role="tab"
                aria-selected={view === 'weekly'}
                onClick={() => setView('weekly')}
                style={{ ...styles.tabBtn, ...(view === 'weekly' ? styles.tabBtnActive : {}) }}
              >
                Weekly
              </button>
            </div>
          </div>

          {/* Meter */}
          <div style={styles.meterWrap} aria-live="polite">
            {view === 'daily' ? (
              <>
                <div style={styles.meterRow}>
                  <span style={styles.meterLabel}>Used</span>
                  <span style={styles.meterValue}>{used.daily} / {limits.daily} min</span>
                </div>
                <div style={styles.meterTrack} title={`Daily usage ${pctDaily}%`}>
                  <div style={{ ...styles.meterFill, width: `${pctDaily}%` }} />
                </div>
                <div style={styles.controls}>
                  <div style={styles.controlGroup} aria-label="Adjust daily used minutes" role="group">
                    <button style={styles.smallBtn} onClick={() => adjustUsed('daily', -5)} aria-label="Decrease used time by 5 minutes">-5</button>
                    <button style={styles.smallBtn} onClick={() => adjustUsed('daily', +5)} aria-label="Increase used time by 5 minutes">+5</button>
                  </div>
                  <div style={styles.controlGroup} aria-label="Adjust daily limit" role="group">
                    <button style={styles.smallBtn} onClick={() => changeLimit('daily', -10)} aria-label="Decrease daily limit by 10 minutes">-10</button>
                    <div style={styles.limitBadge} aria-label={`Daily limit ${limits.daily} minutes`}>
                      Limit: {limits.daily}m
                    </div>
                    <button style={styles.smallBtn} onClick={() => changeLimit('daily', +10)} aria-label="Increase daily limit by 10 minutes">+10</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={styles.meterRow}>
                  <span style={styles.meterLabel}>Used</span>
                  <span style={styles.meterValue}>{used.weekly} / {limits.weekly} min</span>
                </div>
                <div style={styles.meterTrack} title={`Weekly usage ${pctWeekly}%`}>
                  <div style={{ ...styles.meterFill, width: `${pctWeekly}%` }} />
                </div>
                <div style={styles.controls}>
                  <div style={styles.controlGroup} aria-label="Adjust weekly used minutes" role="group">
                    <button style={styles.smallBtn} onClick={() => adjustUsed('weekly', -15)} aria-label="Decrease used time by 15 minutes">-15</button>
                    <button style={styles.smallBtn} onClick={() => adjustUsed('weekly', +15)} aria-label="Increase used time by 15 minutes">+15</button>
                  </div>
                  <div style={styles.controlGroup} aria-label="Adjust weekly limit" role="group">
                    <button style={styles.smallBtn} onClick={() => changeLimit('weekly', -30)} aria-label="Decrease weekly limit by 30 minutes">-30</button>
                    <div style={styles.limitBadge} aria-label={`Weekly limit ${limits.weekly} minutes`}>
                      Limit: {limits.weekly}m
                    </div>
                    <button style={styles.smallBtn} onClick={() => changeLimit('weekly', +30)} aria-label="Increase weekly limit by 30 minutes">+30</button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={styles.progressFootnote}>
            Note: These controls are a mock preview and not yet connected to backend.
          </div>
        </section>
      </div>
    </main>
  );
}

const styles = {
  wrap: {
    minHeight: '100vh',
    padding: '28px 16px 48px',
    background:
      'radial-gradient(1200px 600px at 20% 20%, rgba(30, 58, 138, 0.06), transparent), ' +
      'radial-gradient(1000px 500px at 80% 30%, rgba(245, 158, 11, 0.08), transparent), ' +
      'linear-gradient(180deg, #ffffff 0%, #f3f4f6 100%)',
  },
  container: {
    maxWidth: 1024,
    margin: '0 auto',
    display: 'grid',
    gap: 16,
  },
  header: {
    background: '#fff',
    borderRadius: 18,
    border: '1px solid rgba(17, 24, 39, 0.06)',
    padding: 16,
    boxShadow: '0 10px 30px rgba(17,24,39,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  avatar: {
    height: 52,
    width: 52,
    borderRadius: 14,
    display: 'grid',
    placeItems: 'center',
    color: '#fff',
    boxShadow: '0 10px 20px rgba(30,58,138,0.28)',
  },
  avatarEmoji: { fontSize: 26 },
  title: { margin: 0, fontSize: 22, color: '#1E3A8A', letterSpacing: '-0.01em' },
  subtitle: { margin: 0, color: '#374151', fontSize: 14 },
  headerActions: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  secondaryBtn: {
    border: '2px solid #F59E0B',
    background: '#fff',
    color: '#1E3A8A',
    borderRadius: 999,
    padding: '10px 14px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 22px rgba(245,158,11,0.25)',
    fontSize: 14,
  },
  card: {
    background: '#fff',
    borderRadius: 18,
    border: '1px solid rgba(17, 24, 39, 0.06)',
    padding: 16,
    boxShadow: '0 10px 30px rgba(17,24,39,0.15)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: { margin: 0, fontSize: 18, color: '#111827' },
  cardHint: { fontSize: 13, color: '#6B7280' },
  chartWrap: { marginTop: 8 },
  progressFootnote: { marginTop: 8, fontSize: 12, color: '#6B7280' },
  tablist: {
    display: 'inline-flex',
    background: '#F3F4F6',
    borderRadius: 999,
    padding: 4,
    gap: 4,
    border: '1px solid #E5E7EB',
  },
  tabBtn: {
    border: 'none',
    background: 'transparent',
    color: '#1E3A8A',
    borderRadius: 999,
    padding: '8px 12px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  tabBtnActive: {
    background: 'linear-gradient(135deg, #1E3A8A, #1E40AF)',
    color: '#fff',
    boxShadow: '0 8px 18px rgba(30, 58, 138, 0.35)',
  },
  meterWrap: { display: 'grid', gap: 10 },
  meterRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  meterLabel: { fontWeight: 800, color: '#1E3A8A' },
  meterValue: { color: '#374151', fontSize: 14 },
  meterTrack: {
    height: 16,
    background: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
    border: '1px solid #E5E7EB',
  },
  meterFill: {
    height: '100%',
    background:
      'linear-gradient(90deg, rgba(245,158,11,1) 0%, rgba(251,191,36,1) 60%, rgba(253,230,138,1) 100%)',
    transition: 'width 250ms ease',
  },
  controls: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  controlGroup: { display: 'flex', gap: 8, alignItems: 'center' },
  smallBtn: {
    border: '2px solid #1E3A8A',
    background: '#fff',
    color: '#1E3A8A',
    borderRadius: 10,
    padding: '8px 10px',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 8px 16px rgba(30,58,138,0.20)',
    fontSize: 12,
  },
  limitBadge: {
    border: '2px solid #F59E0B',
    background: '#FFFBEB',
    color: '#92400E',
    borderRadius: 12,
    padding: '6px 10px',
    fontWeight: 800,
    fontSize: 12,
  },
};
