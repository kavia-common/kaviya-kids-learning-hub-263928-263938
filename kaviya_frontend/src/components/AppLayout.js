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
      <div>
        <NavBar />
        <div role="main">{children}</div>
        {/* Pet is global; parent/kid both see it, but it's unobtrusive and movable */}
        <PetWidget />
      </div>
    </PetProvider>
  );
}
