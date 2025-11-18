import React from 'react';
import { Link } from 'react-router-dom';
import SpinWheel from '../components/SpinWheel';

// PUBLIC_INTERFACE
export default function SpinPage() {
  /**
   * SpinPage
   * Renders the Daily Spin and provides CTA to earn more tickets via Mini-Games.
   */
  return (
    <div role="main" aria-label="Daily Spin Page" style={{ padding: '20px' }}>
      <h2 style={{ color: '#1E3A8A' }}>Daily Spin</h2>
      <p style={{ marginTop: 0 }}>
        Need more tickets? Earn them by getting perfect scores in{' '}
        <Link to="/mini-games" style={{ color: '#1E3A8A', fontWeight: 700 }}>Mini-Games</Link>.
      </p>
      <SpinWheel autoSpin={false} />
    </div>
  );
}
