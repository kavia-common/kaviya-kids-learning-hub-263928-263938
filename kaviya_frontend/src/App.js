import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import KidAuthPage from './pages/KidAuthPage';
import ParentDashboardLogin from './pages/ParentDashboardLogin';
import KidDashboard from './pages/KidDashboard';
import QuizPage from './pages/QuizPage';
import './App.css';

// PUBLIC_INTERFACE
function LandingPage() {
  /**
   * Landing page with playful hero, cartoon-like gradient background, and
   * two primary actions. Uses Corporate Navy palette with gold accents.
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
          >
            Start Learning
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate('/parent')}
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
   * App root with routing for Landing, Kid Auth, and Parent areas.
   * Also toggles a simple light/dark data-theme for future extensibility.
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
          <Route path="/" element={<LandingPage />} />
          <Route path="/kid-auth" element={<KidAuthPage />} />
          <Route path="/parent" element={<ParentDashboardLogin />} />
          <Route path="/dashboard" element={<KidDashboard />} />
          <Route path="/quiz/:subject" element={<QuizPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
