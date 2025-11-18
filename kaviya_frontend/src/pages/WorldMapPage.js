import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * WorldMapPage with entry to Mini-Games hub plus islands.
 */
import SpinWheel from '../components/SpinWheel';
import { countOpenChallenges, getChallengesForKid, acceptChallenge, updateChallenge } from '../utils/challenges';

const SPIN_LAST = 'lms.spin.lastSpinAt';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function canSpin() {
  try {
    if (typeof window === 'undefined') return false;
    const last = window.localStorage.getItem(SPIN_LAST);
    if (!last) return true;
    const lastDate = new Date(last);
    return Date.now() - lastDate.getTime() >= ONE_DAY_MS;
  } catch {
    return false;
  }
}

export default function WorldMapPage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [xp, setXp] = useState(0);
  const [completed, setCompleted] = useState({
    math: 0,
    grammar: 0,
    science: 0,
  });

  // Challenges
  const [openCount, setOpenCount] = useState(0);
  const [showChallenges, setShowChallenges] = useState(false);
  const modalCloseBtnRef = useRef(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = JSON.parse(window.localStorage.getItem('kaviya.kidProfile') || 'null');
        if (stored) setProfile(stored);
      }
    } catch {}
    try {
      if (typeof window !== 'undefined') {
        const storedXP = JSON.parse(window.localStorage.getItem('kaviya.kidXP') || 'null');
        if (typeof storedXP === 'number') setXp(storedXP);
        else setXp(120);
      } else {
        setXp(120);
      }
    } catch { setXp(120); }
    try {
      if (typeof window !== 'undefined') {
        const storedComp = JSON.parse(window.localStorage.getItem('kaviya.completed') || 'null');
        if (storedComp && typeof storedComp === 'object') {
          setCompleted({
            math: Number(storedComp.math || 0),
            grammar: Number(storedComp.grammar || 0),
            science: Number(storedComp.science || 0),
          });
        } else {
          setCompleted({ math: 3, grammar: 0, science: 1 });
        }
      } else {
        setCompleted({ math: 3, grammar: 0, science: 1 });
      }
    } catch {
      setCompleted({ math: 3, grammar: 0, science: 1 });
    }
  }, []);

  useEffect(() => {
    if (profile?.username) {
      setOpenCount(countOpenChallenges(profile.username));
    }
  }, [profile, showChallenges]);

  const thresholds = useMemo(
    () => ({
      math: 0,
      grammar: 100,
      science: 200,
    }),
    []
  );

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

  const goIsland = (island) => {
    if (!island.unlocked) return;
    navigate(island.to);
  };

  const [showSpin, setShowSpin] = useState(false);
  const [eligible, setEligible] = useState(canSpin());

  useEffect(() => {
    const t = setInterval(() => setEligible(canSpin()), 30000);
    return () => clearInterval(t);
  }, []);

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
                XP: <b>{xp}</b> • Math: {completed.math} • Grammar: {completed.grammar} • Science: {completed.science}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/journal"
              aria-label="Open Learning Journal"
              style={{
                border: '2px solid #1E3A8A',
                background: '#F59E0B',
                color: '#111827',
                borderRadius: 999,
                padding: '8px 12px',
                fontWeight: 800,
                boxShadow: '0 10px 22px rgba(245,158,11,0.20)',
                textDecoration: 'none'
              }}
            >
              📓 Journal
            </Link>
            <div style={styles.progressPill} title="XP unlocks more islands">
              <span style={styles.pillEmoji} aria-hidden="true">✨</span>
              <span style={styles.pillText}>Gain XP to unlock more adventures!</span>
            </div>

            {profile?.username && openCount > 0 && (
              <button
                type="button"
                onClick={() => setShowChallenges(true)}
                aria-label={`You have ${openCount} open challenge${openCount>1?'s':''}`}
                style={{
                  border: '2px solid #F59E0B',
                  background: '#FFFBEB',
                  color: '#92400E',
                  borderRadius: 999,
                  padding: '8px 12px',
                  fontWeight: 800,
                  boxShadow: '0 10px 22px rgba(245,158,11,0.20)',
                }}
              >
                🎯 Challenges ({openCount})
              </button>
            )}
          </div>
        </header>

        <section
          role="region"
          aria-label="Daily Spin Entry"
          style={{
            marginTop: 8,
            background: '#FFFFFF',
            borderRadius: 12,
            padding: 12,
            boxShadow: '0 8px 18px rgba(17,24,39,0.15)',
            border: '2px solid #1E3A8A',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: '#1E3A8A', color: '#F59E0B',
              display: 'grid', placeItems: 'center', fontWeight: 900
            }}>
              ✨
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#1E3A8A' }}>Daily Spin</div>
              <div style={{ color: '#374151', fontSize: 14 }}>
                {eligible ? 'Daily Spin is ready!' : 'Daily Spin available after 24 hours.'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSpin(true)}
              disabled={!eligible}
              aria-disabled={!eligible}
              style={{
                background: eligible ? '#F59E0B' : '#9CA3AF',
                color: '#111827',
                border: 'none',
                padding: '8px 14px',
                borderRadius: 999,
                fontWeight: 800,
                cursor: eligible ? 'pointer' : 'not-allowed'
              }}
            >
              {eligible ? 'Spin Now' : 'Not Ready'}
            </button>
          </div>
          {showSpin && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Daily Spin Modal"
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(17,24,39,0.55)',
                display: 'grid', placeItems: 'center',
                zIndex: 50
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowSpin(false);
              }}
            >
              <div style={{ width: 'min(92vw, 900px)' }}>
                <SpinWheel autoSpin={true} />
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShowSpin(false)}
                    style={{
                      background: 'transparent', color: '#FFFFFF',
                      border: '2px solid #FFFFFF',
                      padding: '8px 14px',
                      borderRadius: 999,
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Challenges modal */}
        {showChallenges && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Challenges"
            style={{
              position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.55)', display: 'grid', placeItems: 'center', zIndex: 60
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowChallenges(false); }}
          >
            <div style={{ background: '#fff', width: 'min(92vw, 680px)', borderRadius: 16, boxShadow: '0 16px 40px rgba(0,0,0,0.3)', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottom: '1px solid #E5E7EB' }}>
                <h2 style={{ margin: 0, color: '#1E3A8A' }}>Challenges</h2>
                <button
                  ref={modalCloseBtnRef}
                  onClick={() => setShowChallenges(false)}
                  style={{ border: '2px solid #1E3A8A', background: '#fff', color: '#1E3A8A', borderRadius: 999, padding: '6px 10px', fontWeight: 800, cursor: 'pointer' }}
                  aria-label="Close challenges"
                >
                  Close
                </button>
              </div>
              <div style={{ padding: 14 }}>
                {(() => {
                  const list = getChallengesForKid(profile?.username || '');
                  const openList = list.filter((c) => c.status === 'Open');
                  const acceptedList = list.filter((c) => c.status === 'Accepted');
                  if (openList.length === 0 && acceptedList.length === 0) {
                    return <p style={{ color: '#6B7280' }}>No current challenges. Check back later!</p>;
                  }
                  return (
                    <>
                      {openList.length > 0 && (
                        <>
                          <h3 style={{ margin: '4px 0', color: '#111827' }}>Open</h3>
                          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                            {openList.map((c) => (
                              <li key={c.id} style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 10, background: '#FFFBEB' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                                  <div style={{ fontWeight: 800, color: '#92400E' }}>
                                    {c.subject} • Target {c.target}
                                  </div>
                                  <span style={{ fontSize: 12, color: '#6B7280' }}>{new Date(c.createdAt).toLocaleString()}</span>
                                </div>
                                {c.message && <div style={{ color: '#6B7280', marginTop: 4, fontSize: 14 }}>“{c.message}”</div>}
                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      acceptChallenge(profile?.username || '', c.id);
                                      setShowChallenges(false); // close and refresh pill
                                    }}
                                    style={{ border: 'none', background: 'linear-gradient(135deg, #1E3A8A, #1E40AF)', color: '#fff', borderRadius: 999, padding: '8px 12px', fontWeight: 800, cursor: 'pointer' }}
                                  >
                                    Accept
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateChallenge(profile?.username || '', c.id, { status: 'Canceled' });
                                      setShowChallenges(false);
                                    }}
                                    style={{ border: '2px solid #DC2626', background: '#fff', color: '#DC2626', borderRadius: 999, padding: '8px 12px', fontWeight: 800, cursor: 'pointer' }}
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      {acceptedList.length > 0 && (
                        <>
                          <h3 style={{ margin: '12px 0 4px', color: '#111827' }}>Accepted</h3>
                          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                            {acceptedList.map((c) => (
                              <li key={c.id} style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 10, background: '#EFF6FF' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                                  <div style={{ fontWeight: 800, color: '#1D4ED8' }}>
                                    {c.subject} • Target {c.target}
                                  </div>
                                  {c.dueBy && <span style={{ fontSize: 12, color: '#1D4ED8' }}>Due by {new Date(c.dueBy).toLocaleDateString()}</span>}
                                </div>
                                {c.message && <div style={{ color: '#374151', marginTop: 4, fontSize: 14 }}>“{c.message}”</div>}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

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

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
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
                    {!isLocked && island.id === 'math' && (
                      <button
                        type="button"
                        onClick={() => navigate('/story')}
                        aria-label="Open Story Mode for Math Mountain"
                        style={styles.secondaryStoryBtn}
                        title="Story Mode"
                      >
                        📖 Story Mode
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* Mini-Games Hub entry */}
        <section
          aria-label="Mini-Games entry"
          style={{
            marginTop: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 12
          }}
        >
          <article style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: '0 10px 28px rgba(17,24,39,0.12)', border: '1px solid rgba(17,24,39,0.06)' }}>
            <h3 style={{ marginTop: 0, color: '#1E3A8A' }}>Mini-Games</h3>
            <p style={{ marginTop: 4, color: '#374151' }}>
              Practice skills with quick games and earn XP, stickers, and spin tickets!
            </p>
            <Link to="/mini-games" style={{
              display: 'inline-block',
              padding: '10px 14px',
              background: '#1E3A8A',
              color: '#fff',
              borderRadius: 10,
              textDecoration: 'none',
              fontWeight: 700
            }}>Go to Mini-Games</Link>
          </article>
        </section>

        {/* Legend / Tips */}
        <section aria-label="Map legend and tips" style={styles.tipsCard}>
          <div style={styles.tipsHeader}>
            <h3 style={styles.tipsTitle}>Map Tips</h3>
            <span style={styles.tipsEmoji} aria-hidden="true">🧭</span>
          </div>
          <ul style={styles.tipsList}>
            <li>Complete quizzes to earn XP and unlock new islands.</li>
            <li>Play Mini-Games for quick practice and rewards.</li>
            <li>Come back daily for new adventures and a Daily Spin.</li>
          </ul>
        </section>

        <section aria-label="Collections" style={styles.tipsCard}>
          <div style={styles.tipsHeader}>
            <h3 style={styles.tipsTitle}>Collections</h3>
            <span style={styles.tipsEmoji} aria-hidden="true">🎨</span>
          </div>
          <p style={{ margin: 0, color: '#374151', fontSize: 14 }}>
            Visit your Sticker Book to arrange your rewards!
          </p>
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => navigate('/stickers')}
              style={{
                border: '2px solid #F59E0B',
                background: '#fff',
                color: '#1E3A8A',
                borderRadius: 999,
                padding: '8px 12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 10px 22px rgba(245,158,11,0.25)',
                fontSize: 14,
              }}
            >
              Open Sticker Book
            </button>
          </div>
        </section>
      </div>

      <style>{`
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
  secondaryStoryBtn: {
    border: '2px solid #1E3A8A',
    background: '#fff',
    color: '#1E3A8A',
    borderRadius: 999,
    padding: '10px 14px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 22px rgba(30,58,138,0.20)',
    fontSize: 14,
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
