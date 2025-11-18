import React from 'react';
import NavBar from './NavBar';
import { PetProvider } from '../context/PetContext';
import PetWidget from './PetWidget';

/**
 * PUBLIC_INTERFACE
 * AppLayout
 * Wraps pages with the global NavBar and a main content container.
 *
 * Also mounts the Virtual Pet Companion globally so it appears across kid-facing pages.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Routed page content
 */
export default function AppLayout({ children }) {
  return (
    <PetProvider>
      <div style={{ background: '#F3F4F6', minHeight: '100vh' }}>
        <NavBar />
        <div role="main" style={{ maxWidth: 1200, margin: '0 auto', padding: '16px' }}>
          {children}
        </div>
        {/* Pet is global; parent/kid both see it, but it's unobtrusive and movable */}
        <PetWidget />
      </div>
    </PetProvider>
  );
}
