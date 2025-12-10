/**
 * Service Worker for Nudge PWA
 * Implements caching strategies, offline support, and background sync
 */

// Import Workbox libraries from CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js');

// Workbox will take care of precaching the assets
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
workbox.precaching.cleanupOutdatedCaches();

// App switching and deep linking constants
const APP_SWITCHING_EVENTS = {
  DEEP_LINK_RECEIVED: 'deep_link_received',
  APP_SWITCH_REQUESTED: 'app_switch_requested',
  APP_SWITCH_COMPLETED: 'app_switch_completed',
  APP_SWITCH_FAILED: 'app_switch_failed'
};

// Store for deep links and app switching data
let deepLinkQueue = [];
let appSwitchingData = {};

// Cache version for manual cache management
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// Cache static assets with CacheFirst strategy
workbox.routing.registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: STATIC_CACHE,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache HTML pages with NetworkFirst strategy
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'document',
  new workbox.strategies.NetworkFirst({
    cacheName: 'html-cache',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Cache API responses with NetworkFirst strategy and background sync
workbox.routing.registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new workbox.strategies.NetworkFirst({
    cacheName: API_CACHE,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
      new workbox.backgroundSync.BackgroundSyncPlugin('api-queue', {
        maxRetentionTime: 24 * 60, // 24 hours
      }),
    ],
  })
);

// Cache external resources (CDN, etc.)
workbox.routing.registerRoute(
  ({ url }) =>
    url.origin.startsWith('https://fonts.googleapis.com') ||
    url.origin.startsWith('https://fonts.gstatic.com'),
  new workbox.strategies.CacheFirst({
    cacheName: 'external-resources',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// Offline fallback for HTML pages
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'document',
  async ({ event }) => {
    try {
      return await fetch(event.request);
    } catch (error) {
      return caches.match('/offline.html');
    }
  }
);

// Push notification support
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192.svg',
      badge: '/favicon.ico',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1,
      },
      actions: [
        {
          action: 'explore',
          title: 'Explore',
          icon: '/icon-192.svg',
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icon-192.svg',
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Nudge', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
  
  // Handle deep linking from notifications
  if (event.notification.data && event.notification.data.deepLink) {
    event.waitUntil(
      handleDeepLinkNotification(event.notification.data.deepLink)
    );
  }
});

// Handle deep link from notification
async function handleDeepLinkNotification(deepLink) {
  try {
    // Try to find an existing client first
    const allClients = await clients.matchAll({
      includeUncontrolled: true,
      type: 'window'
    });
    
    for (const client of allClients) {
      const url = new URL(client.url);
      if (url.origin === self.location.origin) {
        // Focus existing client and navigate to deep link
        await client.focus();
        await client.navigate(deepLink);
        return;
      }
    }
    
    // Open new client if none exists
    await clients.openWindow(deepLink);
  } catch (error) {
    console.error('Error handling deep link notification:', error);
  }
}

// Background sync for failed requests
const bgSyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin('failed-requests', {
  maxRetentionTime: 24 * 60, // 24 hours
});

// Handle online/offline events
self.addEventListener('online', () => {
  console.log('Service worker: Online');
  // Process any queued background sync requests
  self.registration.sync.register('sync-queued-requests');
});

self.addEventListener('offline', () => {
  console.log('Service worker: Offline');
});

// Cache cleanup on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches that don't match our current version
          if (
            (cacheName.startsWith('static-') && !cacheName.includes(CACHE_VERSION)) ||
            (cacheName.startsWith('api-') && !cacheName.includes(CACHE_VERSION))
          ) {
            console.log('Service worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Skip waiting for new service worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Periodic sync for background data refresh
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Refresh critical data in the background
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('api-')) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }
});

// Handle fetch events for additional offline functionality
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version if available
      if (response) {
        return response;
      }

      // Otherwise, fetch from network
      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response since it can only be consumed once
        const responseToCache = response.clone();

        caches.open(STATIC_CACHE).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // If both cache and network fail, provide offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});

// Handle custom URL schemes for deep linking
self.addEventListener('fetch', (event) => {
  // Handle custom URL schemes (e.g., nudge://)
  if (event.request.url.startsWith('nudge://')) {
    event.respondWith(handleCustomUrlScheme(event.request));
    return;
  }
  
  // Handle app switching requests
  if (event.request.url.includes('switch_to_app=true')) {
    event.respondWith(handleAppSwitchRequest(event.request));
    return;
  }
});

// Handle custom URL schemes
async function handleCustomUrlScheme(request) {
  try {
    const url = new URL(request.url);
    const path = url.pathname + url.search;
    
    // Add to deep link queue
    const deepLinkData = {
      path,
      timestamp: Date.now(),
      source: 'custom_scheme',
      userAgent: request.headers.get('User-Agent')
    };
    
    deepLinkQueue.push(deepLinkData);
    
    // Notify all clients about the deep link
    const allClients = await clients.matchAll({
      includeUncontrolled: true,
      type: 'window'
    });
    
    allClients.forEach(client => {
      client.postMessage({
        type: APP_SWITCHING_EVENTS.DEEP_LINK_RECEIVED,
        data: deepLinkData
      });
    });
    
    // Redirect to the web app
    const webUrl = self.location.origin + path;
    return Response.redirect(webUrl, 302);
  } catch (error) {
    console.error('Error handling custom URL scheme:', error);
    return new Response('Invalid URL scheme', { status: 400 });
  }
}

// Handle app switching requests
async function handleAppSwitchRequest(request) {
  try {
    const url = new URL(request.url);
    const deepLink = url.searchParams.get('deep_link') || '/';
    const source = url.searchParams.get('source') || 'web';
    
    // Store app switching data
    appSwitchingData = {
      deepLink,
      source,
      timestamp: Date.now(),
      userAgent: request.headers.get('User-Agent'),
      referrer: request.headers.get('Referer')
    };
    
    // Check if we can switch to installed app
    const canSwitch = await checkInstalledApp();
    
    if (canSwitch) {
      // Attempt to switch to installed app
      const switchResult = await attemptAppSwitch(deepLink);
      
      if (switchResult.success) {
        // Notify clients about successful switch
        const allClients = await clients.matchAll({
          includeUncontrolled: true,
          type: 'window'
        });
        
        allClients.forEach(client => {
          client.postMessage({
            type: APP_SWITCHING_EVENTS.APP_SWITCH_COMPLETED,
            data: { ...appSwitchingData, ...switchResult }
          });
        });
        
        return new Response('App switch initiated', { status: 200 });
      } else {
        // Notify clients about failed switch
        const allClients = await clients.matchAll({
          includeUncontrolled: true,
          type: 'window'
        });
        
        allClients.forEach(client => {
          client.postMessage({
            type: APP_SWITCHING_EVENTS.APP_SWITCH_FAILED,
            data: { ...appSwitchingData, error: switchResult.error }
          });
        });
      }
    }
    
    // If we can't switch or switch failed, continue with web app
    return Response.redirect(self.location.origin + deepLink, 302);
  } catch (error) {
    console.error('Error handling app switch request:', error);
    return new Response('App switch failed', { status: 500 });
  }
}

// Check if installed app is available
async function checkInstalledApp() {
  try {
    // Check for custom URL scheme support
    // This is a simplified check - in a real implementation,
    // you might want to use more sophisticated detection
    return true; // Assume app is installed for demo purposes
  } catch (error) {
    console.error('Error checking installed app:', error);
    return false;
  }
}

// Attempt to switch to installed app
async function attemptAppSwitch(deepLink) {
  try {
    // Create custom URL scheme link
    const customUrl = `nudge://${deepLink}`;
    
    // In a real implementation, you would use a more sophisticated method
    // to detect if the app switch was successful
    return {
      success: true,
      customUrl,
      deepLink,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error attempting app switch:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Handle message events from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'GET_DEEP_LINK_QUEUE':
        // Send deep link queue to client
        event.ports[0].postMessage({
          type: 'DEEP_LINK_QUEUE_RESPONSE',
          data: deepLinkQueue
        });
        break;
        
      case 'CLEAR_DEEP_LINK_QUEUE':
        // Clear deep link queue
        deepLinkQueue = [];
        break;
        
      case 'GET_APP_SWITCHING_DATA':
        // Send app switching data to client
        event.ports[0].postMessage({
          type: 'APP_SWITCHING_DATA_RESPONSE',
          data: appSwitchingData
        });
        break;
        
      case 'TRACK_APP_SWITCHING_EVENT':
        // Track app switching event for analytics
        if (event.data.data) {
          trackAppSwitchingEvent(event.data.data);
        }
        break;
    }
  }
});

// Track app switching events for analytics
function trackAppSwitchingEvent(eventData) {
  // In a real implementation, you would send this to your analytics service
  console.log('App switching event:', eventData);
  
  // Store events for offline analytics
  const events = JSON.parse(localStorage.getItem('app_switching_events') || '[]');
  events.push({
    ...eventData,
    timestamp: Date.now()
  });
  
  // Keep only last 100 events
  if (events.length > 100) {
    events.splice(0, events.length - 100);
  }
  
  try {
    localStorage.setItem('app_switching_events', JSON.stringify(events));
  } catch (error) {
    console.error('Error storing app switching event:', error);
  }
}

// Handle background sync for app switching events
self.addEventListener('sync', (event) => {
  if (event.tag === 'app-switching-events') {
    event.waitUntil(syncAppSwitchingEvents());
  }
});

// Sync app switching events to server
async function syncAppSwitchingEvents() {
  try {
    const events = JSON.parse(localStorage.getItem('app_switching_events') || '[]');
    
    if (events.length === 0) {
      return;
    }
    
    // In a real implementation, you would send these events to your analytics server
    console.log('Syncing app switching events:', events);
    
    // Clear synced events
    localStorage.removeItem('app_switching_events');
  } catch (error) {
    console.error('Error syncing app switching events:', error);
  }
}

// Register for periodic sync to handle app switching analytics
if ('periodicSync' in self.registration) {
  self.registration.periodicSync.register('app-switching-events', {
    minInterval: 24 * 60 * 60 * 1000 // 24 hours
  }).catch(error => {
    console.error('Error registering periodic sync:', error);
  });
}