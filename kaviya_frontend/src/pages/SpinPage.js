import React from 'react';
import SpinWheel from '../components/SpinWheel';

// PUBLIC_INTERFACE
export default function SpinPage() {
  /**
   * SpinPage
   * Renders the Daily Spin as a full page, allowing navigation via /spin.
   * Summary: Accessible page wrapper around the SpinWheel component.
   * Returns a React element.
   */
  return (
    <div role="main" aria-label="Daily Spin Page">
      <SpinWheel autoSpin={false} />
    </div>
  );
}
