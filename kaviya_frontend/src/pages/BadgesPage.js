import React, { useMemo } from 'react';

/**
 * PUBLIC_INTERFACE
 * BadgesPage
 * Placeholder page that shows earned vs locked badges.
 * Reads from localStorage key 'kaviya.badges' if available, otherwise uses mock data.
 */
export default function BadgesPage() {
  const { earned, locked } = useMemo(() => {
    try {
      const raw = localStorage.getItem('kaviya.badges');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.earned) && Array.isArray(parsed.locked)) {
          return { earned: parsed.earned, locked: parsed.locked };
        }
      }
    } catch {
      // ignore parse errors
    }
    return {
      earned: [
        { id: 'b1', name: 'First Steps', emoji: '👣', color: '#10B981' },
        { id: 'b2', name: 'Quick Thinker', emoji: '⚡', color: '#3B82F6' },
      ],
      locked: [
        { id: 'b3', name: 'Math Whiz', emoji: '🧠' },
        { id: 'b4', name: 'Science Star', emoji: '🌟' },
        { id: 'b5', name: 'Perfect Streak', emoji: '🔥' },
      ],
    };
  }, []);

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
      maxWidth: 980,
      margin: '0 auto',
      display: 'grid',
      gap: 16,
    },
    section: {
      background: '#fff',
      borderRadius: 18,
      border: '1px solid rgba(17, 24, 39, 0.06)',
      padding: 16,
      boxShadow: '0 10px 30px rgba(17,24,39,0.15)',
    },
    headerRow: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    title: {
      margin: 0,
      fontSize: 22,
      color: '#1E3A8A',
      letterSpacing: '-0.01em',
    },
    hint: { fontSize: 13, color: '#6B7280' },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: 14,
      marginTop: 10,
    },
    badgeCard: {
      background: '#fff',
      border: '1px solid rgba(17,24,39,0.06)',
      borderRadius: 16,
      padding: 12,
      display: 'grid',
      placeItems: 'center',
      transition: 'transform 0.12s ease, box-shadow 0.12s ease',
      boxShadow: '0 10px 24px rgba(30,58,138,0.10)',
    },
    circle: {
      height: 68,
      width: 68,
      borderRadius: '999px',
      display: 'grid',
      placeItems: 'center',
      color: '#fff',
      marginBottom: 8,
    },
    emoji: { fontSize: 30 },
    label: { fontSize: 14, fontWeight: 700, color: '#111827' },
    lockedCircle: {
      background: '#E5E7EB',
      border: '2px dashed #D1D5DB',
      color: '#6B7280',
    },
    lockedLabel: { color: '#6B7280' },
  };

  return (
    <div style={styles.wrap} aria-labelledby="badges-title">
      <div style={styles.container}>
        <section style={styles.section}>
          <div style={styles.headerRow}>
            <h1 id="badges-title" style={styles.title}>Badges</h1>
            <span style={styles.hint}>Earn badges by completing quizzes and streaks</span>
          </div>

          <div style={styles.grid} aria-label="Earned badges">
            {earned.map((b) => (
              <article key={b.id} style={styles.badgeCard} title={`${b.name} (earned)`}>
                <div style={{ ...styles.circle, background: b.color || '#10B981' }}>
                  <span style={styles.emoji} aria-hidden="true">{b.emoji}</span>
                </div>
                <div style={styles.label}>{b.name}</div>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.headerRow}>
            <h2 style={styles.title}>Locked</h2>
            <span style={styles.hint}>Keep learning to unlock these!</span>
          </div>

          <div style={styles.grid} aria-label="Locked badges">
            {locked.map((b) => (
              <article key={b.id} style={{ ...styles.badgeCard, opacity: 0.85 }} title={`${b.name} (locked)`}>
                <div style={{ ...styles.circle, ...styles.lockedCircle }}>
                  <span style={{ ...styles.emoji, filter: 'grayscale(1)' }} aria-hidden="true">
                    {b.emoji}
                  </span>
                </div>
                <div style={{ ...styles.label, ...styles.lockedLabel }}>{b.name}</div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
