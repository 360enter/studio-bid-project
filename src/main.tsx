import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global API url injection and cross-origin fetch interception for Cloudflare Pages production SPA
const originalFetch = window.fetch;

const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  let url = typeof input === 'string' ? input : (input instanceof URL ? input.href : input.url);
  
  const apiUrl = import.meta.env.VITE_API_URL;
  if (url.startsWith('/api/') || (url.includes('/api/') && !url.startsWith('http'))) {
    const apiPath = url.startsWith('/api/') ? url : '/api/' + url.split('/api/')[1];
    if (apiUrl) {
      const cleanBase = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      url = `${cleanBase}${apiPath}`;
    } else {
      const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      if (!isLocalHost) {
        console.warn(`[API ERROR] Requesting relative route: "${apiPath}" inside static deployment, but "VITE_API_URL" is not specified in production configuration.`);
      }
    }
  }

  if (typeof input !== 'string' && !(input instanceof URL)) {
    try {
      const newRequest = new Request(url, input);
      return originalFetch.call(window, newRequest, init);
    } catch {
      // Fallback in case of closed Request object cloning restrictions
      return originalFetch.call(window, url, init);
    }
  }
  return originalFetch.call(window, url, init);
};

try {
  // Attempt standard assignment
  (window as any).fetch = customFetch;
} catch (e) {
  try {
    // Fallback: Redefine the fetch property descriptor if standard setter is blocked or getter-only
    Object.defineProperty(window, 'fetch', {
      value: customFetch,
      configurable: true,
      writable: true,
      enumerable: true
    });
  } catch (err) {
    console.error("[AXIOM INTERCEPT] Critical: Unable to patch browser fetch resolver.", err);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
