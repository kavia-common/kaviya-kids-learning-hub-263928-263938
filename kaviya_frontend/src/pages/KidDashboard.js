import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function KidDashboard() {
  /**
   * Kid Dashboard
   * - Reads kid profile from localStorage key "kaviya.kidProfile"
   * - If not available, redirects to /kid-auth
   * - Displays:
   *   1) XP progress bar with current XP towards next level
   *   2) Level indicator with cheerful badge
   *   3) Badges gallery (earned vs. locked)
   *   4) Subject cards (Math, Science) with icons and CTA buttons
   * - Styling: Corporate Navy with gold accents, rounded cards, cheerful fonts
   * - Simple CSS animations for progress growth and hover states
   */
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  // Demo gamification data can later be replaced by backend API.
  const [xp, setXp] = useState(120);
  const [level, setLevel] = useState(3);

  // Redirect logic on mount
  useEffect(() => {
    let stored = null;
    try {
      if (typeof window !== 'undefined') {
        stored = JSON.parse(window.localStorage.getItem('kaviya.kidProfile') || 'null');
      }
    } catch {
      stored = null;
    }
    if (!stored) {
      navigate('/kid-auth', { replace: true });
      return;
    }
    setProfile(stored);

    // playful initial animation: increment XP slightly to trigger CSS width animation
    const t = setTimeout(() => setXp((v) => v + 0), 50);
    return () => clearTimeout(t);
  }, [navigate]);

  // Compute next level target (naive formula; can be changed later)
  const levelConfig = useMemo(() => {
    // Example: levelTarget = base + level * multiplier
    const base = 100;
    const multiplier = 80;
    const target = base + level * multiplier;
    const current = xp % target;
    const fraction = Math.min(1, Math.max(0, current / target));
    return { target, current, fraction };
  }, [xp, level]);

  if (!profile) {
    return null; // Redirecting...
  }

  const handleStartQuiz = (subject) => {
    // For now navigate to a placeholder route; will be implemented in next tasks.
    navigate(`/quiz/${subject.toLowerCase()}`);
  };

  const earnedBadges = [
    { id: 'b1', name: 'First Steps', emoji: '👣', color: '#10B981' },
    { id: 'b2', name: 'Quick Thinker', emoji: '⚡', color: '#3B82F6' },
  ];
  const lockedBadges = [
    { id: 'b3', name: 'Math Whiz', emoji: '🧠', color: '#F59E0B' },
    { id: 'b4', name: 'Science Star', emoji: '🌟', color: '#8B5CF6' },
  ];

  return (
    <main style={styles.wrap} aria-labelledby="dashboard-title">
      <div style={styles.container}>
        {/* Header with avatar and greeting */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <div
              style={{
                ...styles.avatar,
                background: profile.avatarColor || '#1E3A8A',
              }}
              className="avatar-hover"
              aria-hidden="true"
            >
              <span style={styles.avatarEmoji}>{profile.avatar || '🙂'}</span>
            </div>
            <div>
              <h1 id="dashboard-title" style={styles.title}>
                Hey {profile.username}! <span aria-hidden="true">🎉</span>
              </h1>
              <p style={styles.subtitle}>Age {profile.age} • Ready to learn today?</p>
            </div>
          </div>

          {/* Level badge */}
          <div style={styles.levelBadge} aria-label={`Level ${level}`}>
            <div style={styles.levelBadgeInner}>
              <span style={styles.levelCrown} aria-hidden="true">
                👑
              </span>
              <span style={styles.levelText}>Level</span>
              <span style={styles.levelNumber}>{level}</span>
            </div>
          </div>
        </header>

        {/* XP Progress */}
        <section aria-label="XP Progress" style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>XP Progress</h2>
            <span style={styles.cardHint}>
              {levelConfig.current} / {levelConfig.target} XP
            </span>
          </div>
          <div style={styles.progressTrack} aria-hidden="true">
            <div
              style={{
                ...styles.progressFill,
                width: `${Math.round(levelConfig.fraction * 100)}%`,
              }}
              className="xp-fill-anim"
            />
          </div>
          <div style={styles.progressFootnote}>
            Earn XP by completing quizzes and challenges!
          </div>
        </section>

        {/* Badges Gallery */}
        <section aria-label="Badges" style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Badges</h2>
            <span style={styles.cardHint}>Collect them all</span>
          </div>
          <div style={styles.badgeGrid}>
            {earnedBadges.map((b) => (
              <article key={b.id} style={{ ...styles.badgeItem, boxShadow: 'var(--shadow)' }}>
                <div
                  style={{
                    ...styles.badgeCircle,
                    background: b.color,
                    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.12))',
                  }}
                  aria-label={`${b.name} badge earned`}
                  title={`${b.name} (earned)`}
                >
                  <span style={styles.badgeEmoji}>{b.emoji}</span>
                </div>
                <div style={styles.badgeLabel}>{b.name}</div>
              </article>
            ))}

            {lockedBadges.map((b) => (
              <article key={b.id} style={{ ...styles.badgeItem, opacity: 0.7 }}>
                <div
                  style={{
                    ...styles.badgeCircle,
                    background: '#E5E7EB',
                    border: '2px dashed #D1D5DB',
                  }}
                  aria-label={`${b.name} badge locked`}
                  title={`${b.name} (locked)`}
                >
                  <span style={{ ...styles.badgeEmoji, filter: 'grayscale(1)' }}>{b.emoji}</span>
                </div>
                <div style={{ ...styles.badgeLabel, color: '#6B7280' }}>{b.name}</div>
              </article>
            ))}
          </div>
        </section>

        {/* Subject Cards */}
        <section aria-label="Subjects" style={styles.grid2}>
          <article style={styles.subjectCard}>
            <div style={styles.subjIcon} aria-hidden="true">
              🔢
            </div>
            <h3 style={styles.subjTitle}>Math</h3>
            <p style={styles.subjDesc}>Numbers, puzzles, and brain teasers!</p>
            <button style={styles.primaryBtn} onClick={() => handleStartQuiz('Math')}>
              Start Math Quiz ➜
            </button>
          </article>

          <article style={styles.subjectCard}>
            <div style={styles.subjIcon} aria-hidden="true">
              🔬
            </div>
            <h3 style={styles.subjTitle}>Science</h3>
            <p style={styles.subjDesc}>Explore nature, space, and experiments!</p>
            <button style={styles.primaryBtn} onClick={() => handleStartQuiz('Science')}>
              Start Science Quiz ➜
            </button>
          </article>
        </section>

        {/* Footer actions */}
        <section aria-label="More actions" style={styles.footerActions}>
          <button
            style={styles.secondaryBtn}
            onClick={() => navigate('/kid-auth')}
            title="Switch Kid Profile"
          >
            Switch Profile
          </button>
          <button
            style={{ ...styles.secondaryBtn, borderColor: '#111827', color: '#111827' }}
            onClick={() => navigate('/')}
            title="Back to Home"
          >
            Back Home
          </button>
          <button
            style={{ ...styles.secondaryBtn, borderColor: '#1E3A8A', color: '#1E3A8A' }}
            onClick={() => navigate('/mini-games')}
            title="Play Mini-Games"
            aria-label="Play Mini-Games"
          >
            Play Mini-Games
          </button>
        </section>
      </div>

      {/* Local styles: simple animation helpers */}
      <style>{`
        .xp-fill-anim {
          transition: width 0.9s ease-in-out;
        }
        .subject-hover:hover {
          transform: translateY(-3px);
        }
      `}</style>
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
    maxWidth: 1100,
    margin: '0 auto',
    display: 'grid',
    gap: 16,
  },
  header: {
    background: 'var(--color-surface, #FFFFFF)',
    border: '1px solid rgba(17, 24, 39, 0.06)',
    borderRadius: 18,
    padding: 18,
    boxShadow: 'var(--shadow)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    height: 64,
    width: 64,
    borderRadius: 16,
    display: 'grid',
    placeItems: 'center',
    color: '#fff',
    boxShadow: '0 12px 22px rgba(30,58,138,0.30)',
    transition: 'transform 0.12s ease',
  },
  avatarEmoji: {
    fontSize: 32,
  },
  title: {
    margin: 0,
    fontSize: 24,
    color: 'var(--color-navy, #1E3A8A)',
    letterSpacing: '-0.01em',
  },
  subtitle: {
    margin: 0,
    fontSize: 14,
    color: '#374151',
  },
  levelBadge: {
    background: 'linear-gradient(135deg, #1E3A8A, #1E40AF)',
    color: '#fff',
    borderRadius: 16,
    padding: '10px 14px',
    border: '2px solid var(--color-gold, #F59E0B)',
    boxShadow: '0 10px 24px rgba(30, 58, 138, 0.35)',
  },
  levelBadgeInner: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  levelCrown: {
    fontSize: 20,
    filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.25))',
  },
  levelText: {
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  levelNumber: {
    background: '#fff',
    color: '#1E3A8A',
    borderRadius: 10,
    padding: '2px 8px',
    fontWeight: 800,
    border: '2px solid #F59E0B',
  },
  card: {
    background: '#fff',
    borderRadius: 18,
    border: '1px solid rgba(17, 24, 39, 0.06)',
    padding: 16,
    boxShadow: 'var(--shadow)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    margin: 0,
    fontSize: 18,
    color: '#111827',
  },
  cardHint: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressTrack: {
    width: '100%',
    height: 18,
    borderRadius: 999,
    background: '#E5E7EB',
    overflow: 'hidden',
    border: '1px solid #E5E7EB',
  },
  progressFill: {
    height: '100%',
    background:
      'linear-gradient(90deg, rgba(245,158,11,1) 0%, rgba(251,191,36,1) 60%, rgba(253,230,138,1) 100%)',
    borderRight: '2px solid #B45309',
  },
  progressFootnote: {
    marginTop: 8,
    fontSize: 13,
    color: '#6B7280',
  },
  badgeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: 14,
    marginTop: 10,
  },
  badgeItem: {
    background: '#fff',
    border: '1px solid rgba(17,24,39,0.06)',
    borderRadius: 16,
    padding: 12,
    display: 'grid',
    placeItems: 'center',
    transition: 'transform 0.12s ease, box-shadow 0.12s ease',
  },
  badgeCircle: {
    height: 64,
    width: 64,
    borderRadius: '999px',
    display: 'grid',
    placeItems: 'center',
    color: '#fff',
    marginBottom: 8,
  },
  badgeEmoji: {
    fontSize: 28,
  },
  badgeLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: '#111827',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 16,
  },
  subjectCard: {
    background: '#fff',
    borderRadius: 18,
    border: '1px solid rgba(17, 24, 39, 0.06)',
    padding: 16,
    boxShadow: 'var(--shadow)',
    display: 'grid',
    alignContent: 'start',
    gap: 8,
    transition: 'transform 0.12s ease, box-shadow 0.12s ease',
  },
  subjIcon: {
    height: 56,
    width: 56,
    borderRadius: 14,
    display: 'grid',
    placeItems: 'center',
    background: 'linear-gradient(135deg, #1E3A8A22, #F59E0B22)',
    fontSize: 28,
  },
  subjTitle: {
    margin: '6px 0 0',
    fontSize: 18,
    color: '#111827',
  },
  subjDesc: {
    margin: 0,
    color: '#374151',
    fontSize: 14,
  },
  primaryBtn: {
    border: 'none',
    marginTop: 8,
    background: 'linear-gradient(135deg, #1E3A8A, #1E40AF)',
    color: '#fff',
    borderRadius: 999,
    padding: '12px 16px',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 12px 24px rgba(30, 58, 138, 0.35)',
    fontSize: 14,
    transition: 'transform 0.12s ease, box-shadow 0.12s ease',
  },
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
  footerActions: {
    display: 'flex',
    gap: 10,
    justifyContent: 'flex-end',
    marginTop: 6,
  },
};
