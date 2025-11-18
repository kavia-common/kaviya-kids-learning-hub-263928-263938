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
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <div className="App">
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout><LandingPage /></AppLayout>} />
          <Route path="/kid-auth" element={<AppLayout><KidAuthPage /></AppLayout>} />
          <Route path="/parent" element={<AppLayout><ParentLoginPage /></AppLayout>} />
          <Route path="/parent/dashboard" element={<AppLayout><ParentDashboard /></AppLayout>} />
          <Route path="/dashboard" element={<AppLayout><WorldMapPage /></AppLayout>} />
          <Route path="/kid-dashboard" element={<AppLayout><KidDashboard /></AppLayout>} />
          <Route path="/quiz/:subject" element={<AppLayout><QuizPage /></AppLayout>} />
          <Route path="/badges" element={<AppLayout><BadgesPage /></AppLayout>} />
          <Route path="/stickers" element={<AppLayout><StickerBookPage /></AppLayout>} />
          <Route path="/story" element={<AppLayout><StoryModePage /></AppLayout>} />
          <Route path="/spin" element={<AppLayout><SpinPage /></AppLayout>} />
          {/* Mini-Games hub and games */}
          <Route path="/mini-games" element={<AppLayout><MiniGamesHub /></AppLayout>} />
          <Route path="/mini-games/math-maze" element={<AppLayout><MiniGame_MathMaze /></AppLayout>} />
          <Route path="/mini-games/word-builder" element={<AppLayout><MiniGame_WordBuilder /></AppLayout>} />
          <Route path="/mini-games/science-match" element={<AppLayout><MiniGame_ScienceMatch /></AppLayout>} />
          <Route path="/journal" element={<AppLayout><JournalPage /></AppLayout>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
