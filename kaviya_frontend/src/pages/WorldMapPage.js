import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * WorldMapPage
 * Kid-friendly world map at /dashboard acting as the main home screen.
 *
 * - Shows three themed "islands" as large cards with playful motion and lock state:
 *   1) Math Mountain
 *   2) Grammar Galaxy
 *   3) Science Swamp
 *
 * - Lock/unlock logic: read mock XP from localStorage profile or internal state.
 *   Uses thresholds:
 *     Math Mountain: XP >= 0  (always unlocked)
 *     Grammar Galaxy: XP >= 100
 *     Science Swamp: XP >= 200
 *
 * - Clicking an unlocked island routes to content:
 *     Math -> /quiz/math (existing)
 *     Grammar -> /quiz/grammar (placeholder route - handled by /quiz/:subject page with fallback)
 *     Science -> /quiz/science (existing)
 *
 * - Accessibility:
 *   - Islands are buttons with aria-labels and disabled state
 *   - Visible lock badges for locked islands
 *   - Focus styles and keyboard navigation preserved
 *
 * - Branding:
 *   - Corporate Navy with gold accents
 *   - Rounded shapes, cheerful emoji "theming"
 *
 * - Mock progress box shows XP, completed quizzes (derived from localStorage or mock)
 */
export default function WorldMapPage() {
  /**
   * Mock data/keys used:
   * - localStorage "kaviya.kidProfile" { username, age, avatar, avatarColor }
   * - localStorage "kaviya.kidXP": number (awarded from QuizPage)
   * - localStorage "kaviya.completed": { math, grammar, science }
   *
   * Unlock thresholds:
   *  - Math Mountain: 0 XP (always unlocked)
   *  - Grammar Galaxy: 100 XP
   *  - Science Swamp: 200 XP
   */
  const navigate = useNavigate();

  // Load kid profile (username, avatar, color) and XP from localStorage
  const [profile, setProfile] = useState(null);
  const [xp, setXp] = useState(0);
  const [completed, setCompleted] = useState({
    math: 0,
    grammar: 0,
    science: 0,
  });

  useEffect(() => {
    // Read kid profile
    try {
      const stored = JSON.parse(localStorage.getItem('kaviya.kidProfile') || 'null');
      if (stored) setProfile(stored);
    } catch {
      // ignore parse error
    }

    // Read XP - if we later add XP saving from QuizPage, read it; else mock
    try {
      const storedXP = JSON.parse(localStorage.getItem('kaviya.kidXP') || 'null');
      if (typeof storedXP === 'number') {
        setXp(storedXP);
      } else {
        // fallback to a friendly default if not present
        setXp(120);
      }
    } catch {
      setXp(120);
    }

    // Read completed quizzes counts (mock or stored)
    try {
      const storedComp = JSON.parse(localStorage.getItem('kaviya.completed') || 'null');
      if (storedComp && typeof storedComp === 'object') {
        setCompleted({
          math: Number(storedComp.math || 0),
          grammar: Number(storedComp.grammar || 0),
          science: Number(storedComp.science || 0),
        });
      } else {
        setCompleted({ math: 3, grammar: 0, science: 1 });
      }
    } catch {
      setCompleted({ math: 3, grammar: 0, science: 1 });
    }
  }, []);

  // Simple thresholds for unlocks
  const thresholds = useMemo(
    () => ({
      math: 0,
      grammar: 100,
      science: 200,
    }),
    []
  );

  // Compute lock states based on XP
  const islands = useMemo(
    () => [
      {
        id: 'math',
        name: 'Math Mountain',
        emoji: '⛰️',
        color: '#1E3A8A',
        gradient: 'linear-gradient(135deg, #1E3A8A22, #F59E0B22)',
        to: '/quiz/math',
        unlocked: xp >= thresholds.math,
        subtitle: 'Numbers, puzzles, and peaks!',
      },
      {
        id: 'grammar',
        name: 'Grammar Galaxy',
        emoji: '🪐',
        color: '#8B5CF6',
        gradient: 'linear-gradient(135deg, #7C3AED22, #F59E0B22)',
        to: '/quiz/grammar',
        unlocked: xp >= thresholds.grammar,
        subtitle: 'Words and stars align!',
      },
      {
        id: 'science',
        name: 'Science Swamp',
        emoji: '🧪',
        color: '#059669',
        gradient: 'linear-gradient(135deg, #05966922, #F59E0B22)',
        to: '/quiz/science',
        unlocked: xp >= thresholds.science,
        subtitle: 'Discover, mix, and explore!',
      },
    ],
    [xp, thresholds]
  );

  // PUBLIC_INTERFACE
  const goIsland = (island) => {
    /**
     * Navigate to the island's content if unlocked, else do nothing.
     */
    if (!island.unlocked) return;
    navigate(island.to);
  };

  return (
    <main aria-labelledby="world-map-title" style={styles.wrap}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <div
              style={{
                ...styles.avatar,
                background: profile?.avatarColor || '#1E3A8A',
              }}
              aria-hidden="true"
              className="avatar-hover"
            >
              <span style={styles.avatarEmoji}>{profile?.avatar || '🙂'}</span>
            </div>
            <div>
              <h1 id="world-map-title" style={styles.title}>
                {profile?.username ? `${profile.username}'s Learning World` : 'Your Learning World'}{' '}
                <span aria-hidden="true">🗺️</span>
              </h1>
              <p style={styles.subtitle}>
                XP: <b>{xp}</b> • Math: {completed.math} • Grammar: {completed.grammar} • Science:{' '}
                {completed.science}
              </p>
            </div>
          </div>

          <div style={styles.progressPill} title="XP unlocks more islands">
            <span style={styles.pillEmoji} aria-hidden="true">✨</span>
            <span style={styles.pillText}>Gain XP to unlock more adventures!</span>
          </div>
        </header>

        {/* Map area - responsive grid of island cards */}
        <section
          aria-label="Learning World Islands"
          style={styles.grid}
        >
          {islands.map((island) => {
            const isLocked = !island.unlocked;
            return (
              <article
                key={island.id}
                style={{ ...styles.card, background: '#fff' }}
                aria-labelledby={`${island.id}-title`}
              >
                <div
                  style={{
                    ...styles.cardTop,
                    background: island.gradient,
                  }}
                  aria-hidden="true"
                >
                  <div
                    style={{
                      ...styles.icon,
                      background: island.color,
                      borderColor: 'rgba(17,24,39,0.15)',
                    }}
                  >
                    <span style={styles.iconEmoji}>{island.emoji}</span>
                  </div>
                </div>

                <div style={styles.cardBody}>
                  <h2 id={`${island.id}-title`} style={styles.cardTitle}>
                    {island.name}
                  </h2>
                  <p style={styles.cardDesc}>{island.subtitle}</p>

                  <div style={styles.metaRow}>
                    <span style={styles.metaLabel}>Status:</span>
                    {isLocked ? (
                      <span style={styles.lockBadge} role="status" aria-live="polite">
                        🔒 Locked • Need {Math.max(0, thresholds[island.id] - xp)} XP
                      </span>
                    ) : (
                      <span style={styles.unlockBadge} role="status" aria-live="polite">
                        🔓 Unlocked
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => goIsland(island)}
                    disabled={isLocked}
                    aria-label={`${island.name} ${isLocked ? 'is locked' : 'enter island'}`}
                    style={{
                      ...styles.ctaBtn,
                      ...(isLocked ? styles.ctaBtnDisabled : {}),
                    }}
                  >
                    {isLocked ? 'Locked' : 'Enter ➜'}
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        {/* Legend / Tips */}
        <section aria-label="Map legend and tips" style={styles.tipsCard}>
          <div style={styles.tipsHeader}>
            <h3 style={styles.tipsTitle}>Map Tips</h3>
            <span style={styles.tipsEmoji} aria-hidden="true">🧭</span>
          </div>
          <ul style={styles.tipsList}>
            <li>Complete quizzes to earn XP and unlock new islands.</li>
            <li>Check your badges for extra challenges and rewards.</li>
            <li>Come back daily for new adventures.</li>
          </ul>
        </section>
      </div>

      <style>{`
        /* Subtle float/hover animation for island icon bubble */
        .island-bubble {
          animation: floaty 3s ease-in-out infinite;
        }
        @keyframes floaty {
          0% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0); }
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
    background: '#fff',
    borderRadius: 18,
    border: '1px solid rgba(17, 24, 39, 0.06)',
    padding: 16,
    boxShadow: '0 10px 28px rgba(17,24,39,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    height: 56,
    width: 56,
    borderRadius: 14,
    display: 'grid',
    placeItems: 'center',
    color: '#fff',
    boxShadow: '0 12px 22px rgba(30,58,138,0.28)',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  title: {
    margin: 0,
    fontSize: 24,
    color: '#1E3A8A',
    letterSpacing: '-0.01em',
  },
  subtitle: {
    margin: '4px 0 0',
    color: '#374151',
    fontSize: 14,
  },
  progressPill: {
    border: '2px solid #F59E0B',
    background: '#FFFBEB',
    color: '#92400E',
    borderRadius: 999,
    padding: '8px 12px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontWeight: 800,
    boxShadow: '0 10px 22px rgba(245,158,11,0.20)',
  },
  pillEmoji: { fontSize: 16 },
  pillText: { fontSize: 13 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 16,
  },
  card: {
    borderRadius: 18,
    border: '1px solid rgba(17, 24, 39, 0.06)',
    boxShadow: '0 10px 30px rgba(17,24,39,0.15)',
    overflow: 'hidden',
    display: 'grid',
  },
  cardTop: {
    minHeight: 80,
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
  },
  icon: {
    height: 68,
    width: 68,
    borderRadius: 18,
    display: 'grid',
    placeItems: 'center',
    color: '#fff',
    border: '2px solid',
    boxShadow: '0 12px 24px rgba(0,0,0,0.10)',
  },
  iconEmoji: { fontSize: 32, filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))' },
  cardBody: {
    display: 'grid',
    gap: 8,
    padding: 14,
    alignContent: 'start',
  },
  cardTitle: {
    margin: 0,
    fontSize: 18,
    color: '#111827',
  },
  cardDesc: {
    margin: 0,
    color: '#374151',
    fontSize: 14,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  metaLabel: {
    fontWeight: 800,
    color: '#1E3A8A',
    fontSize: 13,
  },
  lockBadge: {
    border: '2px dashed #6B7280',
    color: '#6B7280',
    borderRadius: 12,
    padding: '6px 10px',
    fontWeight: 800,
    background: '#F3F4F6',
    fontSize: 12,
  },
  unlockBadge: {
    border: '2px solid #059669',
    color: '#065F46',
    borderRadius: 12,
    padding: '6px 10px',
    fontWeight: 800,
    background: '#ECFDF5',
    fontSize: 12,
  },
  ctaBtn: {
    border: 'none',
    background: 'linear-gradient(135deg, #1E3A8A, #1E40AF)',
    color: '#fff',
    borderRadius: 999,
    padding: '12px 16px',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 12px 24px rgba(30, 58, 138, 0.35)',
    fontSize: 14,
    marginTop: 4,
  },
  ctaBtnDisabled: {
    background: 'linear-gradient(135deg, #6B7280, #9CA3AF)',
    cursor: 'not-allowed',
    boxShadow: '0 10px 20px rgba(107,114,128,0.25)',
  },
  tipsCard: {
    background: '#fff',
    borderRadius: 18,
    border: '1px solid rgba(17, 24, 39, 0.06)',
    padding: 16,
    boxShadow: '0 10px 30px rgba(17,24,39,0.15)',
  },
  tipsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  tipsTitle: {
    margin: 0,
    fontSize: 18,
    color: '#111827',
  },
  tipsEmoji: { fontSize: 20 },
  tipsList: {
    margin: '8px 0 0',
    padding: '0 18px',
    color: '#374151',
    fontSize: 14,
    lineHeight: 1.6,
  },
};
