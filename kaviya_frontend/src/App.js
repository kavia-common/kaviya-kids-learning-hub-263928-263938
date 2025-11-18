import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import KidAuthPage from './pages/KidAuthPage';
import ParentLoginPage from './pages/ParentLoginPage';
import ParentDashboard from './pages/ParentDashboard';
import KidDashboard from './pages/KidDashboard';
import QuizPage from './pages/QuizPage';
import BadgesPage from './pages/BadgesPage';
import WorldMapPage from './pages/WorldMapPage';
import StickerBookPage from './pages/StickerBookPage';
import StoryModePage from './pages/StoryModePage';
import AppLayout from './components/AppLayout';
import SpinPage from './pages/SpinPage';
import MiniGamesHub from './pages/MiniGamesHub';
import MiniGame_MathMaze from './pages/MiniGame_MathMaze';
import MiniGame_WordBuilder from './pages/MiniGame_WordBuilder';
import MiniGame_ScienceMatch from './pages/MiniGame_ScienceMatch';
import './App.css';
import JournalPage from './pages/JournalPage';

// PUBLIC_INTERFACE
function LandingPage() {
  /**
   * Landing page with playful hero and primary actions.
   */
  const navigate = useNavigate();

  return (
    <main className="landing">
      <div className="bg-shapes" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="stars" />
      </div>

      <section className="landing-content" role="region" aria-label="Intro">
        <h1 className="landing-title" aria-label="Kaviya Kids Learn">
          Kaviya Kids Learn
          <span className="sparkle" aria-hidden="true">✨</span>
        </h1>
        <p className="landing-subtitle">
          Adventure-packed lessons, quizzes, and badges—learning made fun!
        </p>

        <div className="cta-group" role="group" aria-label="Primary actions">
          <button
            className="btn-primary"
            onClick={() => navigate('/kid-auth')}
            aria-label="Start Learning"
          >
            Start Learning
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate('/parent')}
            aria-label="Parent Login"
          >
            Parent Login
          </button>
        </div>
      </section>

      <footer className="landing-footnote" aria-label="Theme notice">
        Corporate Navy theme with golden accents
      </footer>
    </main>
  );
}

// PUBLIC_INTERFACE
function App() {
  /**
   * App root with routing and theme toggle.
   */
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Guard document in case of non-browser environments
    try {
      if (typeof document !== 'undefined' && document?.documentElement) {
        document.documentElement.setAttribute('data-theme', theme);
      }
    } catch {
      // ignore if not available
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  // Guard BrowserRouter usage in non-browser environments
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <BrowserRouter>
      <AppLayout>
        <div className="App">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/kid-auth" element={<KidAuthPage />} />
            <Route path="/parent" element={<ParentLoginPage />} />
            <Route path="/parent/dashboard" element={<ParentDashboard />} />
            <Route path="/dashboard" element={<WorldMapPage />} />
            <Route path="/kid-dashboard" element={<KidDashboard />} />
            <Route path="/quiz/:subject" element={<QuizPage />} />
            <Route path="/badges" element={<BadgesPage />} />
            <Route path="/stickers" element={<StickerBookPage />} />
            <Route path="/story" element={<StoryModePage />} />
            <Route path="/spin" element={<SpinPage />} />
            {/* Mini-Games hub and games */}
            <Route path="/mini-games" element={<MiniGamesHub />} />
            <Route path="/mini-games/math-maze" element={<MiniGame_MathMaze />} />
            <Route path="/mini-games/word-builder" element={<MiniGame_WordBuilder />} />
            <Route path="/mini-games/science-match" element={<MiniGame_ScienceMatch />} />
            <Route path="/journal" element={<JournalPage />} />
          </Routes>
        </div>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
