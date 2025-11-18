/* PUBLIC_INTERFACE */
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * KidAuthPage
 * A cheerful login/signup page for kids with:
 * - Avatar selection (8+ colorful emoji circles)
 * - Username input (3–15 chars, alphanumeric)
 * - Age selection (6–12)
 * On submit, stores data temporarily in localStorage and navigates to /dashboard.
 * Accessibility: labeled fields, focus styles, keyboard navigation for avatars.
 */
export default function KidAuthPage() {
  const navigate = useNavigate();

  // 10 playful emoji avatars with distinct color tokens for variety
  const avatars = useMemo(
    () => [
      { id: 'a1', emoji: '🐱', color: '#1E3A8A' },
      { id: 'a2', emoji: '🐶', color: '#F59E0B' },
      { id: 'a3', emoji: '🦊', color: '#059669' },
      { id: 'a4', emoji: '🐼', color: '#2563EB' },
      { id: 'a5', emoji: '🐵', color: '#EF4444' },
      { id: 'a6', emoji: '🦄', color: '#8B5CF6' },
      { id: 'a7', emoji: '🐨', color: '#14B8A6' },
      { id: 'a8', emoji: '🐸', color: '#84CC16' },
      { id: 'a9', emoji: '🐯', color: '#F97316' },
      { id: 'a10', emoji: '🐧', color: '#0EA5E9' },
    ],
    []
  );

  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0].id);
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [errors, setErrors] = useState({ username: '', age: '' });

  const usernameRegex = /^[a-zA-Z0-9]{3,15}$/;

  const validate = () => {
    const next = { username: '', age: '' };
    if (!usernameRegex.test(username)) {
      next.username = 'Use 3–15 letters or numbers, no spaces.';
    }
    const ageNum = Number(age);
    if (!age || Number.isNaN(ageNum) || ageNum < 6 || ageNum > 12) {
      next.age = 'Pick an age between 6 and 12.';
    }
    setErrors(next);
    return !next.username && !next.age;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const chosen = avatars.find((a) => a.id === selectedAvatar);
    const payload = {
      username,
      age: Number(age),
      avatar: chosen?.emoji || '🙂',
      avatarColor: chosen?.color || '#1E3A8A',
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('kaviya.kidProfile', JSON.stringify(payload));
    } catch {
      // If storage fails, still continue to next route
    }
    // After auth, go to World Map (/dashboard)
    navigate('/dashboard');
  };

  const handleAvatarKeyDown = (e, id) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedAvatar(id);
    }
  };

  return (
    <main aria-labelledby="kid-auth-title">
      <div style={styles.wrap}>
        <section style={styles.card} aria-label="Kid sign in">
          <header style={styles.header}>
            <h1 id="kid-auth-title" style={styles.title}>
              Choose Your Look & Start! ✨
            </h1>
            <p style={styles.subtitle}>
              Pick an avatar, set your name, and let the adventure begin.
            </p>
          </header>

          {/* Avatar Grid */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle} id="avatar-group-label">
              Pick an avatar
            </h2>
            <div
              role="radiogroup"
              aria-labelledby="avatar-group-label"
              style={styles.avatarGrid}
            >
              {avatars.map((a) => {
                const active = selectedAvatar === a.id;
                return (
                  <div
                    key={a.id}
                    role="radio"
                    aria-checked={active}
                    tabIndex={0}
                    onKeyDown={(e) => handleAvatarKeyDown(e, a.id)}
                    onClick={() => setSelectedAvatar(a.id)}
                    style={{
                      ...styles.avatar,
                      outline: active ? `3px solid var(--color-gold)` : 'none',
                      boxShadow: active ? '0 8px 24px rgba(245,158,11,0.35)' : 'var(--shadow)',
                      background: a.color,
                    }}
                    aria-label={`Avatar ${a.emoji}`}
                  >
                    <span aria-hidden="true" style={styles.avatarEmoji}>
                      {a.emoji}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div style={styles.formRow}>
              <label htmlFor="username" style={styles.label}>
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-describedby="username-help"
                aria-invalid={!!errors.username}
                placeholder="e.g., SkyKid7"
                style={{
                  ...styles.input,
                  borderColor: errors.username ? 'var(--error, #DC2626)' : '#e5e7eb',
                }}
              />
              <small id="username-help" style={styles.help}>
                3–15 characters, letters and numbers only.
              </small>
              {errors.username ? (
                <div role="alert" style={styles.errorText}>
                  {errors.username}
                </div>
              ) : null}
            </div>

            <div style={styles.formRow}>
              <label htmlFor="age" style={styles.label}>
                Age
              </label>
              <select
                id="age"
                name="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                aria-invalid={!!errors.age}
                style={{
                  ...styles.input,
                  borderColor: errors.age ? 'var(--error, #DC2626)' : '#e5e7eb',
                }}
              >
                <option value="" disabled>
                  Select age
                </option>
                {[6, 7, 8, 9, 10, 11, 12].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              {errors.age ? (
                <div role="alert" style={styles.errorText}>
                  {errors.age}
                </div>
              ) : null}
            </div>

            <div style={styles.actions}>
              <button type="submit" style={styles.primaryBtn}>
                Let’s Go 🚀
              </button>
              <span aria-hidden="true" style={styles.or}>
                or
              </span>
              <button
                type="button"
                onClick={() => navigate('/')}
                style={styles.secondaryBtn}
              >
                Back Home
              </button>
            </div>
          </form>

          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              onClick={() => navigate('/spin')}
              style={{
                border: '2px solid #1E3A8A',
                background: '#FFFBEB',
                color: '#92400E',
                borderRadius: 999,
                padding: '8px 12px',
                fontWeight: 800,
                boxShadow: '0 8px 18px rgba(245,158,11,0.20)',
                cursor: 'pointer'
              }}
              aria-label="Go to Daily Spin"
            >
              ✨ Daily Spin
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: '40px 16px',
    background:
      'radial-gradient(1200px 600px at 20% 20%, rgba(30, 58, 138, 0.08), transparent), ' +
      'radial-gradient(1000px 500px at 80% 30%, rgba(245, 158, 11, 0.10), transparent), ' +
      'linear-gradient(180deg, #ffffff 0%, #f3f4f6 100%)',
  },
  card: {
    width: '100%',
    maxWidth: 960,
    background: 'var(--color-surface, #fff)',
    borderRadius: 20,
    padding: 28,
    boxShadow: 'var(--shadow)',
    border: '1px solid rgba(17, 24, 39, 0.06)',
  },
  header: {
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    margin: 0,
    fontSize: 'clamp(28px, 4.5vw, 40px)',
    color: 'var(--color-navy, #1E3A8A)',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    marginTop: 8,
    color: '#374151',
    fontSize: 16,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    margin: '12px 0 10px',
    color: '#111827',
  },
  avatarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
    gap: 14,
  },
  avatar: {
    height: 72,
    width: 72,
    borderRadius: '999px',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'transform 0.12s ease, box-shadow 0.12s ease',
    color: '#fff',
    outlineOffset: 3,
  },
  avatarEmoji: {
    fontSize: 32,
    filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.15))',
  },
  formRow: {
    marginTop: 18,
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontWeight: 600,
    marginBottom: 6,
    color: '#111827',
  },
  input: {
    border: '2px solid #e5e7eb',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 16,
    outline: 'none',
    transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
    background: '#fff',
  },
  help: {
    marginTop: 6,
    color: '#6b7280',
    fontSize: 12,
  },
  errorText: {
    color: 'var(--error, #DC2626)',
    fontSize: 13,
    marginTop: 6,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 22,
    flexWrap: 'wrap',
  },
  primaryBtn: {
    border: 'none',
    background: 'linear-gradient(135deg, #1E3A8A, #1E40AF)',
    color: '#fff',
    borderRadius: 999,
    padding: '12px 20px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 12px 24px rgba(30, 58, 138, 0.35)',
    fontSize: 16,
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
  },
  or: {
    color: '#6b7280',
    fontSize: 13,
    padding: '0 6px',
  },
};
