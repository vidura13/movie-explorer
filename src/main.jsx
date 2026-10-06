import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

/**
 * Application entry point.
 *
 * StrictMode is kept on in development: it double-invokes effects on purpose to
 * surface missing cleanup. Every effect in this project cancels its own work
 * (AbortController, clearTimeout), so the double-invocation is a feature here
 * rather than noise.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
