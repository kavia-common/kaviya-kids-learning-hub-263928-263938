import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { PetProvider } from './context/PetContext';

// Entry point: guard DOM access to avoid SSR/test crashes
const rootEl = (typeof document !== 'undefined') ? document.getElementById('root') : null;
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <PetProvider>
        <App />
      </PetProvider>
    </React.StrictMode>
  );
}
