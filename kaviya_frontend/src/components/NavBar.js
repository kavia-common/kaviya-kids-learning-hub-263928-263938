import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import VoiceControl from './VoiceControl';

/**
 * PUBLIC_INTERFACE
 * NavBar
 * Global, accessible top navigation bar with Corporate Navy styling.
 * Links:
 * - Home -> '/'
 * - Dashboard -> '/dashboard'
 * - Quizzes -> dropdown with Math '/quiz/math' and Science '/quiz/science'
 * - Badges -> '/badges'
 * - Logout -> clears kid session and redirects to '/'
 *
 * Accessibility:
 * - Keyboard navigable
 * - Escape to close dropdown
 * - ARIA attributes for menu/button states
 */
export default function NavBar() {
  const [open, setOpen] = useState(false);
  const menuBtnRef = useRef(null);
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close menu on navigation change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Close when clicking outside
  useEffect(() => {
    // Guard DOM access
    if (typeof document === 'undefined') return;
    const onDocClick = (e) => {
      if (!open) return;
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        menuBtnRef.current &&
        !menuBtnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onToggleMenu = () => setOpen((s) => !s);

  const onLogout = () => {
    // Log out kid session: clear kid profile and redirect home
    try {
      localStorage.removeItem('kaviya.kidProfile');
    } catch {
      // ignore storage errors
    }
    navigate('/', { replace: true });
  };

  const linkBase = {
    textDecoration: 'none',
    padding: '10px 14px',
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 14,
    color: '#E5E7EB',
  };

  const activeStyle = {
    background: '#0F2A6B',
    color: '#FFFFFF',
    boxShadow: '0 8px 18px rgba(245,158,11,0.25)',
    border: '2px solid #F59E0B',
  };

  const styles = {
    wrap: {
      position: 'sticky',
      top: 0,
      zIndex: 60,
      background: '#1E3A8A', // Navy
      color: '#fff',
      borderBottom: '3px solid #F59E0B', // Gold accent
      boxShadow: '0 8px 24px rgba(17, 24, 39, 0.25)',
    },
    inner: {
      maxWidth: 1100,
      margin: '0 auto',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      justifyContent: 'space-between',
    },
    brand: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      textDecoration: 'none',
      color: '#fff',
    },
    brandMark: {
      height: 36,
      width: 36,
      borderRadius: 10,
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
      color: '#111827',
      fontWeight: 900,
      border: '2px solid #B45309',
      boxShadow: '0 6px 16px rgba(245, 158, 11, 0.35)',
      fontSize: 18,
    },
    brandText: {
      fontWeight: 800,
      letterSpacing: '0.02em',
      fontSize: 18,
    },
    nav: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    quizWrap: {
      position: 'relative',
    },
    quizBtn: {
      ...linkBase,
      background: 'transparent',
      border: '2px solid rgba(255,255,255,0.15)',
      color: '#FFFFFF',
      cursor: 'pointer',
    },
    menu: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      left: 0,
      minWidth: 180,
      background: '#FFFFFF',
      color: '#111827',
      border: '1px solid #E5E7EB',
      borderRadius: 12,
      boxShadow: '0 12px 24px rgba(17,24,39,0.2)',
      padding: 6,
    },
    menuItem: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      background: 'transparent',
      border: 'none',
      color: '#111827',
      fontWeight: 700,
      padding: '10px 12px',
      borderRadius: 10,
      cursor: 'pointer',
    },
    logoutBtn: {
      ...linkBase,
      background: '#DC2626',
      border: '2px solid #7F1D1D',
      color: '#fff',
      cursor: 'pointer',
    },
  };

  return (
    <header style={styles.wrap} role="banner">
      <div style={styles.inner}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <NavLink to="/" style={styles.brand} aria-label="Go to home">
            <div style={styles.brandMark} aria-hidden="true">K</div>
            <div style={styles.brandText}>Kaviya Kids Learn</div>
          </NavLink>
          {/* Voice toggle integrated globally */}
          <div aria-label="Voice navigation" style={{ marginLeft: 8 }}>
            <VoiceControl />
          </div>
        </div>

        <nav aria-label="Primary" style={styles.nav}>
          <NavLink
            to="/"
            style={({ isActive }) => ({
              ...linkBase,
              ...(isActive ? activeStyle : { border: '2px solid rgba(255,255,255,0.15)' }),
            })}
          >
            Home
          </NavLink>

          <NavLink
            to="/dashboard"
            style={({ isActive }) => ({
              ...linkBase,
              ...(isActive ? activeStyle : { border: '2px solid rgba(255,255,255,0.15)' }),
            })}
          >
            World Map
          </NavLink>

          <div style={styles.quizWrap}>
            <button
              ref={menuBtnRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-controls="quiz-menu"
              onClick={onToggleMenu}
              style={styles.quizBtn}
            >
              Quizzes ▾
            </button>
            {open && (
              <div
                id="quiz-menu"
                role="menu"
                ref={menuRef}
                style={styles.menu}
              >
                <button
                  role="menuitem"
                  style={styles.menuItem}
                  onClick={() => navigate('/quiz/math')}
                >
                  🔢 Math
                </button>
                <button
                  role="menuitem"
                  style={styles.menuItem}
                  onClick={() => navigate('/quiz/science')}
                >
                  🔬 Science
                </button>
              </div>
            )}
          </div>

          <NavLink
            to="/badges"
            style={({ isActive }) => ({
              ...linkBase,
              ...(isActive ? activeStyle : { border: '2px solid rgba(255,255,255,0.15)' }),
            })}
          >
            Badges
          </NavLink>

          <NavLink
            to="/stickers"
            style={({ isActive }) => ({
              ...linkBase,
              ...(isActive ? activeStyle : { border: '2px solid rgba(255,255,255,0.15)' }),
            })}
          >
            Sticker Book
          </NavLink>

          <NavLink
            to="/journal"
            style={({ isActive }) => ({
              ...linkBase,
              ...(isActive ? activeStyle : { border: '2px solid rgba(255,255,255,0.15)' }),
            })}
            title="Learning Journal"
          >
            Journal
          </NavLink>

          <NavLink
            to="/story"
            style={({ isActive }) => ({
              ...linkBase,
              ...(isActive ? activeStyle : { border: '2px solid rgba(255,255,255,0.15)' }),
            })}
            title="Story Mode"
          >
            Story Mode
          </NavLink>

          <button type="button" onClick={onLogout} style={styles.logoutBtn} title="Log out kid session">
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
