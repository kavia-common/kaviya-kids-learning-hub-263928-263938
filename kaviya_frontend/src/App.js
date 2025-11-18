import React from 'react';
import './App.css';
import AppLayout from './components/AppLayout';
import { Routes, Route, Navigate } from 'react-router-dom';
import KidAuthPage from './pages/KidAuthPage';
import KidDashboard from './pages/KidDashboard';
import QuizPage from './pages/QuizPage';
import ParentDashboard from './pages/ParentDashboard';
import StickerBookPage from './pages/StickerBookPage';
import BadgesPage from './pages/BadgesPage';
import MiniGamesHub from './pages/MiniGamesHub';
import SpinPage from './pages/SpinPage';
import WorldMapPage from './pages/WorldMapPage';
import StoryModePage from './pages/StoryModePage';
import JournalPage from './pages/JournalPage';
import ApiHealthPage from './pages/ApiHealthPage';
import { useAuth } from './context/AuthContext';

// PUBLIC_INTERFACE
function ProtectedRoute({ children }) {
  /** A simple protected route wrapper that redirects unauthenticated users to /auth */
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

// PUBLIC_INTERFACE
function App() {
  /** Main app routes rendered inside the AppLayout chrome */
  return (
    <AppLayout>
      <Routes>
        <Route path="/auth" element={<KidAuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <KidDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:subject"
          element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent"
          element={
            <ProtectedRoute>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rewards"
          element={
            <ProtectedRoute>
              <StickerBookPage />
            </ProtectedRoute>
          }
        />
        <Route path="/badges" element={<ProtectedRoute><BadgesPage /></ProtectedRoute>} />
        <Route path="/mini-games" element={<ProtectedRoute><MiniGamesHub /></ProtectedRoute>} />
        <Route path="/spin" element={<ProtectedRoute><SpinPage /></ProtectedRoute>} />
        <Route path="/world" element={<ProtectedRoute><WorldMapPage /></ProtectedRoute>} />
        <Route path="/story" element={<ProtectedRoute><StoryModePage /></ProtectedRoute>} />
        <Route path="/journal" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
        <Route path="/_health" element={<ApiHealthPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
