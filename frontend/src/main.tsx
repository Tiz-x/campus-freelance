import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './styles/global.css'

// Suppress Apollo DevTools message
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.__APOLLO_CLIENT__ = {};
}

// Save scroll position before page unload
window.addEventListener('beforeunload', () => {
  sessionStorage.setItem('scrollPosition', window.scrollY.toString());
});

const rootElement = document.getElementById('root');

// Simple loading indicator
if (rootElement && rootElement.innerHTML === '') {
  rootElement.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f7fb;">
      <div style="text-align: center;">
        <div style="width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #1a9c6e; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        <p style="margin-top: 1rem; color: #64748b;">Loading...</p>
        <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
      </div>
    </div>
  `;
}

ReactDOM.createRoot(rootElement!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Restore scroll position after load
window.addEventListener('load', () => {
  const savedScroll = sessionStorage.getItem('scrollPosition');
  if (savedScroll) {
    setTimeout(() => {
      window.scrollTo(0, parseInt(savedScroll));
    }, 100);
  }
});