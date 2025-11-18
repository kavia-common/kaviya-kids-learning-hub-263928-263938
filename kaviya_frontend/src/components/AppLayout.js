import React from 'react';
import NavBar from './NavBar';

/**
 * PUBLIC_INTERFACE
 * AppLayout wraps pages with global NavBar and main container.
 */
export default function AppLayout({ children }) {
  return (
    <div style={{ background: '#F3F4F6', minHeight: '100vh' }}>
      <NavBar />
      <div role="main" style={{ maxWidth: 1200, margin: '0 auto', padding: '16px' }}>
        {children}
      </div>
    </div>
  );
}
