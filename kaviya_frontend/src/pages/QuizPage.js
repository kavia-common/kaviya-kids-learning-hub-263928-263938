import React, { useState, useEffect, useMemo, useRef, useContext } from 'react';
import '../App.css';
import '../index.css';
import { PetContext } from '../context/PetContext';
import { useParams } from 'react-router-dom';
import { findMatchingAcceptedChallenges, completeChallenge } from '../utils/challenges';
import { addXP as addMiniXP } from '../utils/miniGamesStorage';
import { addSticker } from '../utils/stickers';

// Corporate Navy theme tokens
const COLORS = {
  primary: '#1E3A8A', // Navy
  accent: '#F59E0B',  // Gold
  surface: '#FFFFFF',
  bg: '#F3F4F6',
  text: '#111827',
  success: '#059669',
  error: '#DC2626',
};
const RADIUS = 12;

// Base question bank with difficulty + hint fields
const sampleQuestions = [
  { id: 1, question: 'What is 2 + 2?', options: ['3', '4', '5'], answer: '4', difficulty: 'easy', hint: 'Think of pairs!' },
  { id: 2, question: 'What planet is known as the Red Planet?', options: ['Earth', 'Mars', 'Jupiter'], answer: 'Mars', difficulty: 'medium', hint: 'Named after the Roman god of war.' },
  { id: 3, question: 'Spell the word for a young cat.', options: ['Kitten', 'Kiten', 'Kiton'], answer: 'Kitten', difficulty: 'easy', hint: "It rhymes with 'mitten'." },
  { id: 4, question: 'What is 9 x 3?', options: ['27', '21', '24'], answer: '27', difficulty: 'hard', hint: "It's three less than 30." },
];

const MOODS = {
  HAPPY: 'happy',
  CONFUSED: 'confused',
  EXCITED: 'excited',
};

const LAST_MOOD_KEY = 'kkh_last_mood';

// PUBLIC_INTERFACE
export default function QuizPage() {
  /**
   * QuizPage renders a quiz with adaptive next-quiz behavior based on mood.
   * - Post-quiz MoodSelector persists last mood in localStorage.
   * - Confused => extra hints + slower animations next quiz.
   * - Excited => slightly harder questions + extra confetti.
   * - Happy => normal difficulty + encouraging messages.
   * - Integrates with PetContext for mood-based pet reactions.
   * Accessibility:
   * - Focus management for new questions and feedback.
   * - ARIA live region for feedback.
   * - Tooltip explaining mood usage.
   */
  const petCtx = useContext(PetContext);
  const { encourage, setPetMood } = petCtx || { encourage: () => {}, setPetMood: () => {} };

  // mood persisted and used for next-quiz adjustments
  const [lastMood, setLastMood] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        return window.localStorage.getItem(LAST_MOOD_KEY) || MOODS.HAPPY;
      }
      return MOODS.HAPPY;
    } catch {
      return MOODS.HAPPY;
    }
  });

  // animation speed multiplier (confused -> slower)
  const [animSpeed, setAnimSpeed] = useState(1);
  // confetti intensity (excited -> more)
  const [confettiCount, setConfettiCount] = useState(15);
  // hint availability (confused -> auto-enable and allow extra)
  const [hintMode, setHintMode] = useState({ autoShow: false, extraHints: false });

  // choose questions for this run based on lastMood
  const questionSet = useMemo(() => {
    const easy = sampleQuestions.filter(q => q.difficulty === 'easy');
    const medium = sampleQuestions.filter(q => q.difficulty === 'medium');
    const hard = sampleQuestions.filter(q => q.difficulty === 'hard');

    if (lastMood === MOODS.EXCITED) {
      // prefer harder mix if available: medium + hard, fallback to all
      const mix = [...medium, ...hard];
      return mix.length ? mix : sampleQuestions;
    }
    // happy or confused -> normal mix (lightly biased to easy/medium)
    const mix = [...easy, ...medium];
    return mix.length ? mix : sampleQuestions;
  }, [lastMood]);

  // selection + score
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // refs for accessibility focus handling
  const questionRef = useRef(null);
  const feedbackLiveRef = useRef(null);
  const tooltipRef = useRef(null);

  const currentQuestion = questionSet[currentIndex];

  // apply next-quiz behavior knobs derived from lastMood
  useEffect(() => {
    if (lastMood === MOODS.CONFUSED) {
      setHintMode({ autoShow: true, extraHints: true });
      setAnimSpeed(0.7);
      setConfettiCount(10);
    } else if (lastMood === MOODS.EXCITED) {
      setHintMode({ autoShow: false, extraHints: false });
      setAnimSpeed(1.1);
      setConfettiCount(30);
    } else {
      setHintMode({ autoShow: false, extraHints: true }); // happy -> allow hint but not auto
      setAnimSpeed(1);
      setConfettiCount(18);
    }
  }, [lastMood]);

  // reset per-question state and focus
  useEffect(() => {
    setSelectedAnswer('');
    setFeedback('');
    setShowHint(hintMode.autoShow);
    // Focus the question for screen readers and keyboard users
    if (questionRef.current) {
      questionRef.current.focus();
    }
  }, [currentIndex, hintMode.autoShow]);

  const handleAnswer = () => {
    if (!selectedAnswer) return;
    const correct = selectedAnswer === currentQuestion.answer;

    if (correct) {
      setScore(prev => prev + 1);
      const msg = lastMood === MOODS.HAPPY
        ? 'Awesome! You’re on a roll! ⭐'
        : lastMood === MOODS.EXCITED
          ? 'Boom! Nailed it! 🚀'
          : 'Nice work! You got it!';
      setFeedback(msg);
      encourage && encourage('cheer'); // pet reacts positively
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 800);
    } else {
      const msg = lastMood === MOODS.CONFUSED
        ? 'Good try! Peek at the hint and take your time.'
        : 'Close! Try the hint and give it another shot.';
      setFeedback(msg);
      encourage && encourage('encourage'); // pet encourages
    }

    // move focus to feedback live region
    if (feedbackLiveRef.current) {
      feedbackLiveRef.current.focus();
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= questionSet.length) {
      setCompleted(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // mood selection component at end
  const [selectedMood, setSelectedMood] = useState(lastMood);
  const [moodNote, setMoodNote] = useState('');

  const saveMood = (m) => {
    setSelectedMood(m);
    setMoodNote(
      m === MOODS.CONFUSED
        ? 'We’ll slow things down and show extra hints next time.'
        : m === MOODS.EXCITED
          ? 'Next round will be a tiny bit harder with more celebration!'
          : 'Great! We’ll keep cheering you on with normal pace.'
    );
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LAST_MOOD_KEY, m);
      }
    } catch {
      // ok if storage blocked
    }
    setLastMood(m);
    setPetMood && setPetMood(m); // pet changes expression
    encourage && encourage(m === MOODS.CONFUSED ? 'soothe' : 'cheer');
  };

  // simple tooltip logic for explaining mood usage
  const [showTooltip, setShowTooltip] = useState(false);

  // Styles
  const containerStyle = {
    padding: 20,
    background: COLORS.bg,
    minHeight: '100vh',
  };
  const cardStyle = {
    background: COLORS.surface,
    borderRadius: RADIUS,
    boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
    padding: 20,
    border: `1px solid ${COLORS.primary}20`,
    transition: `transform ${250 / animSpeed}ms ease, box-shadow ${250 / animSpeed}ms ease`,
  };
  const headerStyle = {
    color: COLORS.primary,
    marginBottom: 12,
  };
  const btn = {
    background: COLORS.primary,
    color: 'white',
    border: 'none',
    padding: '10px 14px',
    borderRadius: 10,
    cursor: 'pointer',
  };
  const btnSecondary = {
    background: COLORS.accent,
    color: '#1f2937',
    border: 'none',
    padding: '10px 14px',
    borderRadius: 10,
    cursor: 'pointer',
    marginLeft: 8,
  };
  const radioWrap = {
    display: 'block',
    marginBottom: 8,
    padding: '8px 10px',
    borderRadius: 10,
    border: `1px solid ${COLORS.primary}30`,
  };
  const hintBox = {
    marginTop: 8,
    fontStyle: 'italic',
    background: '#fff7ed',
    border: `1px dashed ${COLORS.accent}`,
    padding: 10,
    borderRadius: 10,
    color: '#7c2d12',
  };
  const liveRegionStyle = {
    outline: 'none',
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    background: '#eef2ff',
    border: `1px solid ${COLORS.primary}40`,
  };

  // subject from URL
  const { subject: routeSubject } = useParams();
  const subjectNormalized = (routeSubject || '').toLowerCase();

  // toast for celebrations
  const [toast, setToast] = useState('');
  const toastRef = useRef(null);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  return (
    <div style={containerStyle}>
      <div style={{ ...cardStyle }}>
        <h2 style={headerStyle}>Quiz Time!</h2>

        {!completed ? (
          <div>
            <p
              ref={questionRef}
              tabIndex={-1}
              style={{ fontWeight: 600 }}
              aria-live="polite"
            >
              <strong>Question {currentIndex + 1}:</strong> {currentQuestion?.question}
            </p>

            <div role="group" aria-label="Answer options">
              {currentQuestion?.options.map((opt) => (
                <label key={opt} style={radioWrap}>
                  <input
                    type="radio"
                    name="answer"
                    value={opt}
                    checked={selectedAnswer === opt}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                  />
                  {' '}
                  {opt}
                </label>
              ))}
            </div>

            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
              <button
                style={btnSecondary}
                onClick={() => setShowHint((s) => !s)}
                aria-expanded={showHint}
                aria-controls="hint-panel"
              >
                {showHint ? 'Hide hint' : 'Show hint'}
              </button>

              {hintMode.extraHints && (
                <span
                  style={{ marginLeft: 10, color: COLORS.accent, fontSize: 12 }}
                  aria-label="Extra hints enabled"
                >
                  Extra hints enabled
                </span>
              )}
            </div>

            {showHint && (
              <div id="hint-panel" style={hintBox}>
                Hint: {currentQuestion?.hint}
                {hintMode.extraHints && (
                  <div style={{ marginTop: 6 }}>
                    Tip: Try removing options that can’t be right first.
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <button
                style={{ ...btn, opacity: selectedAnswer ? 1 : 0.6 }}
                onClick={handleAnswer}
                disabled={!selectedAnswer}
              >
                Check Answer
              </button>
              <button style={btnSecondary} onClick={nextQuestion} aria-label="Next question">
                Next
              </button>
            </div>

            <div
              ref={feedbackLiveRef}
              tabIndex={-1}
              role="status"
              aria-live="polite"
              style={liveRegionStyle}
            >
              {feedback}
            </div>

            <div style={{ marginTop: 12, color: COLORS.text }}>
              Score: {score} / {questionSet.length}
            </div>
          </div>
        ) : (
          <div>
            <h3 style={{ color: COLORS.primary, marginBottom: 4 }}>All done!</h3>
            <p>Your score: {score} / {questionSet.length}</p>

            {/* Challenge completion hook */}
            {(() => {
              try {
                const kid = typeof window !== 'undefined'
                  ? JSON.parse(window.localStorage.getItem('kaviya.kidProfile') || 'null')
                  : null;
                const username = kid?.username;
                const pct = questionSet.length > 0 ? Math.round((score / questionSet.length) * 100) : 0;

                if (username && subjectNormalized) {
                  const accepted = findMatchingAcceptedChallenges(username, subjectNormalized);
                  accepted.forEach((ch) => {
                    // challenge subjects are title case; normalize compare
                    const sNorm = (ch.subject || '').toLowerCase();
                    if (sNorm === subjectNormalized && pct >= Number(ch.target || 0)) {
                      completeChallenge(username, ch.id);
                      // award bonus XP and special sticker
                      addMiniXP(25);
                      addSticker('nature_star', 1); // if exists; fallback sticker
                      // also persist kid-level XP mock if used elsewhere
                      try {
                        if (typeof window !== 'undefined') {
                          const prevXP = Number(JSON.parse(window.localStorage.getItem('kaviya.kidXP') || '0')) || 0;
                          window.localStorage.setItem('kaviya.kidXP', JSON.stringify(prevXP + 25));
                        }
                      } catch {}
                      showToast('Challenge completed! +25 XP and a shiny star sticker! ⭐');
                    }
                  });
                }
              } catch {
                // ignore errors
              }
              return null;
            })()}

            {/* Simple confetti simulation with emojis for accessibility-friendly celebration */}
            <div aria-hidden="true" style={{ margin: '10px 0', fontSize: 18 }}>
              {'🎉'.repeat(Math.min(confettiCount, 50))}
            </div>

            {/* Mood selector with tooltip */}
            <div style={{ marginTop: 16, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <h4 style={{ margin: 0, color: COLORS.primary }}>How did that feel?</h4>
                <button
                  ref={tooltipRef}
                  aria-describedby={showTooltip ? 'mood-tip' : undefined}
                  aria-label="What is this for?"
                  onClick={() => setShowTooltip(s => !s)}
                  onBlur={() => setShowTooltip(false)}
                  style={{
                    marginLeft: 8,
                    background: 'transparent',
                    border: `1px solid ${COLORS.primary}`,
                    color: COLORS.primary,
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    lineHeight: '22px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  i
                </button>
              </div>

              {showTooltip && (
                <div
                  id="mood-tip"
                  role="tooltip"
                  style={{
                    position: 'absolute',
                    top: 36,
                    left: 0,
                    background: COLORS.surface,
                    border: `1px solid ${COLORS.primary}33`,
                    padding: 10,
                    borderRadius: 8,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                    maxWidth: 320,
                    zIndex: 5,
                    color: COLORS.text,
                  }}
                >
                  Pick a mood to help us adapt the next quiz:
                  - Confused: extra hints + slower pace
                  - Excited: slightly harder + more celebration
                  - Happy: normal difficulty with cheers
                </div>
              )}

              <fieldset
                aria-label="Select your mood"
                style={{
                  border: `1px solid ${COLORS.primary}33`,
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <legend style={{ color: COLORS.primary }}>Mood</legend>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <label style={radioWrap}>
                    <input
                      type="radio"
                      name="mood"
                      value={MOODS.HAPPY}
                      checked={selectedMood === MOODS.HAPPY}
                      onChange={() => saveMood(MOODS.HAPPY)}
                    />
                    {' '}🙂 Happy
                  </label>
                  <label style={radioWrap}>
                    <input
                      type="radio"
                      name="mood"
                      value={MOODS.CONFUSED}
                      checked={selectedMood === MOODS.CONFUSED}
                      onChange={() => saveMood(MOODS.CONFUSED)}
                    />
                    {' '}😕 Confused
                  </label>
                  <label style={radioWrap}>
                    <input
                      type="radio"
                      name="mood"
                      value={MOODS.EXCITED}
                      checked={selectedMood === MOODS.EXCITED}
                      onChange={() => saveMood(MOODS.EXCITED)}
                    />
                    {' '}🤩 Excited
                  </label>
                </div>
              </fieldset>

              {moodNote && (
                <div
                  role="status"
                  aria-live="polite"
                  style={{
                    marginTop: 10,
                    padding: 10,
                    borderRadius: 10,
                    background: '#ecfeff',
                    border: `1px solid ${COLORS.accent}55`,
                    color: COLORS.text,
                  }}
                >
                  {moodNote}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay confetti */}
      {showConfetti && (
        <div aria-hidden="true" style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', display: 'grid', placeItems: 'center',
          color: COLORS.accent, fontSize: 28
        }}>
          🎊
        </div>
      )}

      {/* Toast / live announcements */}
      <div
        ref={toastRef}
        role="status"
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          background: toast ? '#ECFDF5' : 'transparent',
          color: '#065F46',
          border: toast ? '2px solid #059669' : 'none',
          borderRadius: 12,
          padding: toast ? '10px 12px' : 0,
          boxShadow: toast ? '0 10px 22px rgba(5,150,105,0.25)' : 'none',
          transition: 'all 150ms ease',
          fontWeight: 800,
        }}
      >
        {toast}
      </div>
    </div>
  );
}
