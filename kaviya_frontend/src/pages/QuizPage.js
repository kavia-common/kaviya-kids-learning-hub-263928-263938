import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * QuizPage
 * Animated, accessible quiz interface for subjects at /quiz/:subject.
 * Features:
 * - Large rounded answer buttons (navy with gold accents), hover/active states
 * - Animated transitions between questions (slide/fade)
 * - Feedback animations: confetti on correct, shake/pulse on incorrect
 * - Progress indicator (Question x of n) and score
 * - Local mock question sets for Math and Science
 * - Accessibility: focus management and ARIA live feedback
 * - Results screen with cheerful XP gain mock and button to return to /dashboard
 */
export default function QuizPage() {
  const { subject } = useParams();
  const navigate = useNavigate();

  // Mock data (can be replaced by API later)
  const QUESTIONS = useMemo(() => {
    const math = [
      {
        id: 'm1',
        question: 'What is 7 + 5?',
        choices: ['10', '11', '12', '13'],
        answerIndex: 2,
        hint: 'Add with your fingers!',
      },
      {
        id: 'm2',
        question: 'Which is an even number?',
        choices: ['7', '9', '12', '15'],
        answerIndex: 2,
        hint: 'Even numbers can be split into two equal groups.',
      },
      {
        id: 'm3',
        question: 'What is 3 × 4?',
        choices: ['7', '12', '14', '9'],
        answerIndex: 1,
        hint: 'Multiplication is repeated addition.',
      },
      {
        id: 'm4',
        question: 'What comes after 29?',
        choices: ['28', '30', '31', '27'],
        answerIndex: 1,
        hint: 'Count up by one.',
      },
      {
        id: 'm5',
        question: 'Which shape has 4 equal sides?',
        choices: ['Triangle', 'Rectangle', 'Square', 'Circle'],
        answerIndex: 2,
        hint: 'All sides the same length.',
      },
    ];
    const science = [
      {
        id: 's1',
        question: 'Plants make food using sunlight. What is this called?',
        choices: ['Breathing', 'Photosynthesis', 'Digestion', 'Evaporation'],
        answerIndex: 1,
        hint: 'Photo = light!',
      },
      {
        id: 's2',
        question: 'Which of these is a gas we breathe in?',
        choices: ['Oxygen', 'Gold', 'Water', 'Sand'],
        answerIndex: 0,
        hint: 'It helps our bodies use energy.',
      },
      {
        id: 's3',
        question: 'What planet do we live on?',
        choices: ['Mars', 'Venus', 'Earth', 'Jupiter'],
        answerIndex: 2,
        hint: 'The blue planet!',
      },
      {
        id: 's4',
        question: 'What do bees collect from flowers?',
        choices: ['Rocks', 'Nectar', 'Soil', 'Snow'],
        answerIndex: 1,
        hint: 'It’s sweet and tasty to them!',
      },
      {
        id: 's5',
        question: 'Water turns into gas when it...',
        choices: ['Boils', 'Freezes', 'Melts', 'Rains'],
        answerIndex: 0,
        hint: 'Bubbles and steam!',
      },
    ];

    return {
      math,
      science,
    };
  }, []);

  const normalized = (subject || '').toLowerCase();
  const questionSet = normalized === 'math' ? QUESTIONS.math : normalized === 'science' ? QUESTIONS.science : null;

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState('idle'); // 'idle' | 'correct' | 'incorrect' | 'transition' | 'done'
  const [ariaMessage, setAriaMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const buttonsRef = useRef([]);
  const cardRef = useRef(null);
  const liveRegionRef = useRef(null);

  useEffect(() => {
    // If subject invalid, return to dashboard
    if (!questionSet) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, questionSet]);

  useEffect(() => {
    // When question index changes, move focus to first answer button
    const t = setTimeout(() => {
      buttonsRef.current?.[0]?.focus();
    }, 150);
    return () => clearTimeout(t);
  }, [index]);

  useEffect(() => {
    // Announce question changes
    if (questionSet && questionSet[index]) {
      setAriaMessage(`Question ${index + 1} of ${questionSet.length}. ${questionSet[index].question}`);
    }
  }, [index, questionSet]);

  if (!questionSet) return null;

  const total = questionSet.length;
  const current = questionSet[index];

  const handleChoice = (choiceIndex) => {
    if (status === 'transition') return; // prevent double click during transition
    const isCorrect = choiceIndex === current.answerIndex;

    if (isCorrect) {
      setStatus('correct');
      setScore((s) => s + 1);
      setAriaMessage('Correct! 🎉');
      triggerConfetti();
      pulseCard();
      // Next question after short delay
      setTimeout(() => {
        nextQuestion();
      }, 900);
    } else {
      setStatus('incorrect');
      setAriaMessage('Oops, not quite. Try the next one!');
      shakeCard();
      // Small delay, then allow move forward automatically
      setTimeout(() => {
        nextQuestion();
      }, 1000);
    }
  };

  const nextQuestion = () => {
    if (index + 1 >= total) {
      setStatus('done');
      setAriaMessage(`Quiz complete! You scored ${score} out of ${total}.`);
      // Award XP: 10 per correct
      awardXp(10 * (score + 0));
      // Record completion to reflect on World Map
      recordCompletion();
      // Move focus to results actions later
      return;
    }
    setStatus('transition');
    // slide out/in animation
    slideOutIn(() => {
      setIndex((i) => i + 1);
      setStatus('idle');
    });
  };

  const slideOutIn = (cb) => {
    const el = cardRef.current;
    if (!el) {
      cb();
      return;
    }
    el.classList.remove('slide-in');
    el.classList.add('slide-out');
    setTimeout(() => {
      cb();
      el.classList.remove('slide-out');
      el.classList.add('slide-in');
    }, 220);
  };

  const pulseCard = () => {
    const el = cardRef.current;
    if (!el) return;
    el.classList.remove('pulse');
    // reflow
    void el.offsetWidth;
    el.classList.add('pulse');
  };

  const shakeCard = () => {
    const el = cardRef.current;
    if (!el) return;
    el.classList.remove('shake');
    // reflow
    void el.offsetWidth;
    el.classList.add('shake');
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 900);
  };

  const handleRestart = () => {
    setIndex(0);
    setScore(0);
    setStatus('idle');
    setAriaMessage('Restarted quiz.');
    buttonsRef.current?.[0]?.focus();
  };

  function recordCompletion() {
    try {
      const key = 'kaviya.completed';
      const prev = JSON.parse(localStorage.getItem(key) || 'null') || {};
      const subjectKey = (normalized || 'other').toLowerCase();
      const next = {
        ...prev,
        [subjectKey]: Number(prev[subjectKey] || 0) + 1,
      };
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // PUBLIC_INTERFACE
  function awardXp(amount) {
    /**
     * Adds XP to localStorage "kaviya.kidXP" to influence world map locks.
     * Safe no-op on storage errors.
     */
    try {
      const current = JSON.parse(localStorage.getItem('kaviya.kidXP') || '0') || 0;
      const next = Math.max(0, Number(current) + Number(amount || 0));
      localStorage.setItem('kaviya.kidXP', JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  const progressPercent = Math.round(((index + (status === 'done' ? 1 : 0)) / total) * 100);

  return (
    <main style={styles.wrap} aria-labelledby="quiz-title">
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 id="quiz-title" style={styles.title}>
              {normalized === 'math' ? 'Math Quiz 🔢' : 'Science Quiz 🔬'}
            </h1>
            <p style={styles.subtitle}>
              Question {Math.min(index + 1, total)} of {total} • Score: {score}
            </p>
          </div>

          <div style={styles.progressWrap} aria-hidden="true" title={`Progress ${progressPercent}%`}>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressFill, width: `${progressPercent}%` }} />
            </div>
            <span style={styles.progressPct}>{progressPercent}%</span>
          </div>
        </header>

        {/* Live region for feedback */}
        <div
          ref={liveRegionRef}
          aria-live="polite"
          aria-atomic="true"
          style={styles.visuallyHidden}
        >
          {ariaMessage}
        </div>

        {status !== 'done' ? (
          <section
            ref={cardRef}
            className="slide-in"
            style={styles.card}
            aria-label={`Question ${index + 1}`}
          >
            <div style={styles.questionRow}>
              <div style={styles.qIcon} aria-hidden="true">
                {normalized === 'math' ? '➗' : '🧪'}
              </div>
              <h2 style={styles.questionText}>{current.question}</h2>
            </div>

            <div role="group" aria-label="Answer choices" style={styles.choicesGrid}>
              {current.choices.map((c, i) => {
                const isCorrect = i === current.answerIndex;
                const isSelectedState = status === 'correct' || status === 'incorrect';
                const stateStyle =
                  isSelectedState && isCorrect
                    ? styles.choiceCorrect
                    : isSelectedState && !isCorrect
                    ? styles.choiceDisabled
                    : {};
                return (
                  <button
                    key={i}
                    ref={(el) => (buttonsRef.current[i] = el)}
                    style={{ ...styles.choiceBtn, ...stateStyle }}
                    onClick={() => handleChoice(i)}
                    disabled={status === 'transition'}
                    aria-label={`Answer ${i + 1}: ${c}`}
                  >
                    <span style={styles.choiceLabel}>{String.fromCharCode(65 + i)}</span>
                    <span>{c}</span>
                  </button>
                );
              })}
            </div>

            <div style={styles.hintRow}>
              <span style={styles.hintLabel}>Hint:</span>
              <span style={styles.hintText}>{current.hint}</span>
            </div>
          </section>
        ) : (
          <section style={styles.card} aria-label="Results">
            <div style={styles.resultsHead}>
              <div style={styles.resultsIcon} aria-hidden="true">
                🏆
              </div>
              <h2 style={styles.resultsTitle}>Great job!</h2>
              <p style={styles.resultsSub}>
                You scored {score} out of {total}.
              </p>
            </div>

            <div style={styles.xpBox} role="status" aria-live="polite">
              <div style={styles.xpBadge} aria-hidden="true">
                ✨
              </div>
              <div>
                <div style={styles.xpTitle}>XP Gained</div>
                <div style={styles.xpAmount}>
                  +{10 * score} XP
                </div>
                <div style={styles.xpFootnote}>Keep it up to level up faster!</div>
              </div>
            </div>

            <div style={styles.resultsActions}>
              <button style={styles.primaryBtn} onClick={handleRestart} autoFocus>
                Try Again 🔁
              </button>
              <button style={styles.secondaryBtn} onClick={handleBackToDashboard}>
                Back to Dashboard
              </button>
            </div>
          </section>
        )}

        {/* Local animation styles */}
        <style>{`
          .slide-in {
            animation: slideIn 240ms ease both;
          }
          .slide-out {
            animation: slideOut 200ms ease both;
          }
          .pulse {
            animation: pulse 450ms ease;
          }
          .shake {
            animation: shake 350ms ease;
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-8px); }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-6px); }
            50% { transform: translateX(6px); }
            75% { transform: translateX(-3px); }
          }
        `}</style>
      </div>

      {showConfetti && <ConfettiOverlay />}
    </main>
  );
}

/**
 * Simple confetti overlay (CSS-based circles) to avoid extra deps.
 */
function ConfettiOverlay() {
  const pieces = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div aria-hidden="true" style={confettiStyles.wrap}>
      {pieces.map((i) => (
        <span
          key={i}
          style={{
            ...confettiStyles.piece,
            left: `${(i * 37) % 100}%`,
            animationDelay: `${(i % 6) * 80}ms`,
            background:
              i % 4 === 0
                ? '#F59E0B'
                : i % 4 === 1
                ? '#1E3A8A'
                : i % 4 === 2
                ? '#10B981'
                : '#8B5CF6',
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(120vh) rotate(540deg); opacity: 0; }
        }
      `}</style>
    </div>
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
    maxWidth: 980,
    margin: '0 auto',
    display: 'grid',
    gap: 16,
  },
  header: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
  },
  title: {
    margin: 0,
    fontSize: 28,
    color: '#1E3A8A',
    letterSpacing: '-0.01em',
  },
  subtitle: {
    margin: '6px 0 0',
    color: '#374151',
    fontSize: 14,
  },
  progressWrap: {
    display: 'grid',
    gap: 6,
    alignContent: 'end',
    minWidth: 220,
  },
  progressTrack: {
    height: 12,
    background: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
    border: '1px solid #E5E7EB',
  },
  progressFill: {
    height: '100%',
    background:
      'linear-gradient(90deg, rgba(245,158,11,1) 0%, rgba(251,191,36,1) 60%, rgba(253,230,138,1) 100%)',
    transition: 'width 300ms ease',
  },
  progressPct: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  card: {
    background: '#fff',
    borderRadius: 18,
    border: '1px solid rgba(17, 24, 39, 0.06)',
    padding: 16,
    boxShadow: '0 10px 30px rgba(17,24,39,0.15)',
  },
  questionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  qIcon: {
    height: 44,
    width: 44,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    background: 'linear-gradient(135deg, #1E3A8A22, #F59E0B22)',
    fontSize: 22,
  },
  questionText: {
    margin: 0,
    fontSize: 20,
    color: '#111827',
  },
  choicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 12,
    marginTop: 12,
  },
  choiceBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    border: '2px solid #1E3A8A',
    background: 'linear-gradient(135deg, #1E3A8A, #1E40AF)',
    color: '#fff',
    borderRadius: 16,
    padding: '16px 18px',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 12px 24px rgba(30, 58, 138, 0.35)',
    transition: 'transform 0.12s ease, box-shadow 0.12s ease, background 0.2s ease',
  },
  choiceCorrect: {
    background: 'linear-gradient(135deg, #059669, #10B981)',
    borderColor: '#059669',
    boxShadow: '0 12px 24px rgba(5, 150, 105, 0.35)',
  },
  choiceDisabled: {
    background: 'linear-gradient(135deg, #6B7280, #9CA3AF)',
    borderColor: '#6B7280',
    boxShadow: '0 10px 20px rgba(107, 114, 128, 0.25)',
    opacity: 0.9,
  },
  choiceLabel: {
    height: 30,
    width: 30,
    minWidth: 30,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: '#F59E0B',
    color: '#111827',
    fontWeight: 900,
    border: '2px solid #B45309',
    boxShadow: '0 6px 14px rgba(245, 158, 11, 0.35)',
  },
  hintRow: {
    marginTop: 8,
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
  },
  hintLabel: {
    fontWeight: 800,
    color: '#1E3A8A',
  },
  hintText: {
    color: '#374151',
  },
  resultsHead: {
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 6,
  },
  resultsIcon: {
    fontSize: 40,
  },
  resultsTitle: {
    margin: '8px 0 4px',
    fontSize: 24,
    color: '#1E3A8A',
  },
  resultsSub: {
    margin: 0,
    color: '#374151',
  },
  xpBox: {
    marginTop: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    border: '2px solid #F59E0B',
    background: '#FFFBEB',
    borderRadius: 16,
    padding: 12,
  },
  xpBadge: {
    height: 44,
    width: 44,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    background: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
    color: '#111827',
    fontWeight: 900,
    border: '2px solid #B45309',
    boxShadow: '0 8px 18px rgba(245, 158, 11, 0.35)',
    fontSize: 22,
  },
  xpTitle: {
    fontWeight: 800,
    color: '#92400E',
    fontSize: 14,
    letterSpacing: '0.02em',
  },
  xpAmount: {
    marginTop: 2,
    fontWeight: 900,
    color: '#111827',
    fontSize: 18,
  },
  xpFootnote: {
    fontSize: 12,
    color: '#6B7280',
  },
  resultsActions: {
    display: 'flex',
    gap: 10,
    justifyContent: 'center',
    marginTop: 14,
    flexWrap: 'wrap',
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
    transition: 'transform 0.12s ease, box-shadow 0.12s ease',
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
    transition: 'transform 0.12s ease, box-shadow 0.12s ease',
  },
  visuallyHidden: {
    position: 'absolute',
    left: -9999,
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
};

const confettiStyles = {
  wrap: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: 40,
  },
  piece: {
    position: 'absolute',
    top: '-10px',
    width: '10px',
    height: '14px',
    borderRadius: '2px',
    animation: 'fall 900ms ease forwards',
  },
};
