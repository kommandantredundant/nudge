/**
 * Network utilities for detecting online/offline status
 * and handling network-related events
 */

import React from 'react';

// Event listeners for online/offline status
const onlineListeners = [];
const offlineListeners = [];

// Current network status
let isOnline = navigator.onLine;

/**
 * Add a listener for online events
 * @param {Function} callback - Function to call when online
 */
export const addOnlineListener = (callback) => {
  if (typeof callback === 'function') {
    onlineListeners.push(callback);
  }
};

/**
 * Add a listener for offline events
 * @param {Function} callback - Function to call when offline
 */
export const addOfflineListener = (callback) => {
  if (typeof callback === 'function') {
    offlineListeners.push(callback);
  }
};

/**
 * Remove a listener for online events
 * @param {Function} callback - Function to remove
 */
export const removeOnlineListener = (callback) => {
  const index = onlineListeners.indexOf(callback);
  if (index > -1) {
    onlineListeners.splice(index, 1);
  }
};

/**
 * Remove a listener for offline events
 * @param {Function} callback - Function to remove
 */
export const removeOfflineListener = (callback) => {
  const index = offlineListeners.indexOf(callback);
  if (index > -1) {
    offlineListeners.splice(index, 1);
  }
};

/**
 * Get current online status
 * @returns {boolean} True if online, false if offline
 */
export const getOnlineStatus = () => isOnline;

/**
 * Check if the browser is online
 * @returns {Promise<boolean>} Promise that resolves to true if online
 */
export const checkOnlineStatus = () => {
  return fetch('/api/health', { 
    method: 'HEAD',
    cache: 'no-cache'
  })
    .then(() => true)
    .catch(() => false);
};

/**
 * Initialize network status listeners
 */
export const initializeNetworkListeners = () => {
  const handleOnline = () => {
    isOnline = true;
    console.log('Network: Online');
    onlineListeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in online listener:', error);
      }
    });
  };

  const handleOffline = () => {
    isOnline = false;
    console.log('Network: Offline');
    offlineListeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in offline listener:', error);
      }
    });
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

/**
 * Custom hook for network status (for React components)
 * @returns {Object} Network status and utilities
 */
export const useNetworkStatus = () => {
  const [online, setOnline] = React.useState(navigator.onLine);
  const [checking, setChecking] = React.useState(false);

  React.useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkConnection = React.useCallback(async () => {
    setChecking(true);
    try {
      const isActuallyOnline = await checkOnlineStatus();
      setOnline(isActuallyOnline);
      return isActuallyOnline;
    } catch (error) {
      setOnline(false);
      return false;
    } finally {
      setChecking(false);
    }
  }, []);

  return {
    online,
    checking,
    checkConnection
  };
};

/**
 * Network-aware fetch wrapper
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise} Fetch promise
 */
export const networkAwareFetch = async (url, options = {}) => {
  if (!navigator.onLine) {
    throw new Error('Device is offline');
  }

  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    // Check if it's a network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      // Try to check if we're actually offline
      const isActuallyOnline = await checkOnlineStatus();
      if (!isActuallyOnline) {
        throw new Error('Network connection lost');
      }
    }
    throw error;
  }
};

/**
 * Queue for offline actions
 */
class OfflineQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  /**
   * Add an action to the queue
   * @param {Function} action - Function to execute when online
   * @param {Object} options - Options for the action
   */
  add(action, options = {}) {
    const queueItem = {
      id: Date.now() + Math.random(),
      action,
      options,
      timestamp: new Date().toISOString(),
      retries: 0,
      maxRetries: options.maxRetries || 3
    };

    this.queue.push(queueItem);
    
    if (navigator.onLine && !this.isProcessing) {
      this.processQueue();
    }

    return queueItem.id;
  }

  /**
   * Process the queue
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0 && navigator.onLine) {
      const item = this.queue.shift();
      
      try {
        await item.action();
        console.log('Offline action completed:', item.id);
      } catch (error) {
        console.error('Offline action failed:', item.id, error);
        
        if (item.retries < item.maxRetries) {
          item.retries++;
          this.queue.unshift(item);
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * item.retries));
        } else {
          console.error('Max retries exceeded for action:', item.id);
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Clear the queue
   */
  clear() {
    this.queue = [];
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      length: this.queue.length,
      isProcessing: this.isProcessing,
      items: this.queue
    };
  }
}

// Create a singleton instance
export const offlineQueue = new OfflineQueue();

// Initialize network listeners
initializeNetworkListeners();

// Process queue when coming back online
window.addEventListener('online', () => {
  offlineQueue.processQueue();
});