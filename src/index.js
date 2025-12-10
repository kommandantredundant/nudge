import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Service Worker Registration
const registerServiceWorker = () => {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('Service Worker registered: ', registration);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available; show update notification
                if (window.confirm('New content is available. Would you like to reload the page?')) {
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed: ', error);
        });
    });

    // Handle service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CACHE_UPDATED') {
        console.log('Content has been updated in the background');
      }
    });

    // Handle controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Controller changed, reloading page');
      window.location.reload();
    });
  }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker after the app has rendered
registerServiceWorker();