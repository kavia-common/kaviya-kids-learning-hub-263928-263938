import React from 'react';
import NavBar from './NavBar';

/**
 * PUBLIC_INTERFACE
 * AppLayout
 * Wraps pages with the global NavBar and a main content container.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Routed page content
 */
export default function AppLayout({ children }) {
  return (
    <div>
      <NavBar />
      <div role="main">{children}</div>
    </div>
  );
}
