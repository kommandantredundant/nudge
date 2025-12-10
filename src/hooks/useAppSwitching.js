import { useState, useEffect, useCallback, useRef } from 'react';
import { appEnvironment } from '../utils/appEnvironment.js';

// Local storage keys
const APP_SWITCHING_KEYS = {
  LAST_SWITCH: 'app_last_switch',
  SWITCH_COUNT: 'app_switch_count',
  USER_PREFERENCES: 'app_switch_preferences',
  DEEP_LINK_QUEUE: 'app_deep_link_queue'
};

// Switching states
export const SWITCHING_STATES = {
  IDLE: 'idle',
  DETECTING: 'detecting',
  SWITCHING: 'switching',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

/**
 * Hook for handling app switching between browser and installed app
 */
export const useAppSwitching = () => {
  const [switchingState, setSwitchingState] = useState(SWITCHING_STATES.IDLE);
  const [canSwitch, setCanSwitch] = useState(false);
  const [deepLinkQueue, setDeepLinkQueue] = useState([]);
  const [switchCount, setSwitchCount] = useState(0);
  const [lastSwitch, setLastSwitch] = useState(null);
  const [userPreferences, setUserPreferences] = useState({});
  const switchingTimeoutRef = useRef(null);
  const environmentConfigRef = useRef(null);

  // Initialize environment config
  useEffect(() => {
    environmentConfigRef.current = appEnvironment.getEnvironmentConfig();
  }, []);

  // Load saved data from localStorage
  const loadSavedData = useCallback(() => {
    try {
      const savedSwitchCount = parseInt(localStorage.getItem(APP_SWITCHING_KEYS.SWITCH_COUNT) || '0');
      const savedLastSwitch = localStorage.getItem(APP_SWITCHING_KEYS.LAST_SWITCH);
      const savedPreferences = JSON.parse(localStorage.getItem(APP_SWITCHING_KEYS.USER_PREFERENCES) || '{}');
      const savedQueue = JSON.parse(localStorage.getItem(APP_SWITCHING_KEYS.DEEP_LINK_QUEUE) || '[]');

      setSwitchCount(savedSwitchCount);
      setLastSwitch(savedLastSwitch ? new Date(savedLastSwitch) : null);
      setUserPreferences(savedPreferences);
      setDeepLinkQueue(savedQueue);
    } catch (error) {
      console.error('Error loading app switching data:', error);
    }
  }, []);

  // Save data to localStorage
  const saveData = useCallback((data) => {
    try {
      if (data.switchCount !== undefined) {
        localStorage.setItem(APP_SWITCHING_KEYS.SWITCH_COUNT, data.switchCount.toString());
      }
      if (data.lastSwitch) {
        localStorage.setItem(APP_SWITCHING_KEYS.LAST_SWITCH, data.lastSwitch.toISOString());
      }
      if (data.userPreferences) {
        localStorage.setItem(APP_SWITCHING_KEYS.USER_PREFERENCES, JSON.stringify(data.userPreferences));
      }
      if (data.deepLinkQueue) {
        localStorage.setItem(APP_SWITCHING_KEYS.DEEP_LINK_QUEUE, JSON.stringify(data.deepLinkQueue));
      }
    } catch (error) {
      console.error('Error saving app switching data:', error);
    }
  }, []);

  // Initialize the hook
  useEffect(() => {
    loadSavedData();
    setCanSwitch(appEnvironment.canSwitchToInstalled());
  }, [loadSavedData]);

  // Parse URL parameters for switching instructions
  const parseURLParameters = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const switchToApp = urlParams.get('switch_to_app');
    const deepLink = urlParams.get('deep_link');
    const source = urlParams.get('source');
    const referrer = urlParams.get('referrer');

    return {
      shouldSwitch: switchToApp === 'true',
      deepLink: deepLink || '/',
      source,
      referrer
    };
  }, []);

  // Handle URL parameters and deep linking
  const handleURLParameters = useCallback(() => {
    const params = parseURLParameters();
    
    if (params.shouldSwitch && canSwitch) {
      // Add to deep link queue
      const linkItem = {
        path: params.deepLink,
        timestamp: Date.now(),
        source: params.source || 'url_param',
        referrer: params.referrer
      };
      
      setDeepLinkQueue(prev => [...prev, linkItem]);
      saveData({ deepLinkQueue: [...deepLinkQueue, linkItem] });
      
      return true;
    }
    
    return false;
  }, [parseURLParameters, canSwitch, deepLinkQueue, saveData]);

  // Track switching events for analytics
  const trackSwitchingEvent = useCallback((event, data = {}) => {
    const analyticsData = appEnvironment.getAnalyticsData();
    
    const eventData = {
      event,
      timestamp: new Date().toISOString(),
      ...analyticsData,
      ...data
    };
    
    // Send to analytics service if available
    if (window.gtag) {
      window.gtag('event', event, eventData);
    }
    
    // Log for debugging
    console.log('App switching event:', eventData);
  }, []);

  // Switch to installed app
  const switchToInstalledApp = useCallback(async (path = '/') => {
    if (!canSwitch) {
      return { success: false, message: 'Cannot switch to installed app' };
    }

    setSwitchingState(SWITCHING_STATES.SWITCHING);
    
    try {
      const config = environmentConfigRef.current;
      const deepLinkURL = appEnvironment.generateDeepLink(path);
      
      // Track switching attempt
      trackSwitchingEvent('app_switch_attempt', {
        target_path: path,
        deep_link_url: deepLinkURL
      });
      
      // Create invisible iframe for deep linking
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = deepLinkURL;
      
      const promise = new Promise((resolve) => {
        const timeout = setTimeout(() => {
          // If we're still here, the app switch failed
          cleanup();
          resolve({ success: false, message: 'App switch timeout - app may not be installed' });
        }, appEnvironment.getSwitchingDelay() + 2000);
        
        const cleanup = () => {
          clearTimeout(timeout);
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        };
        
        // Listen for page visibility changes (app switch success)
        const handleVisibilityChange = () => {
          if (document.hidden) {
            cleanup();
            resolve({ success: true, message: 'App switch initiated successfully' });
          }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Add iframe to DOM
        document.body.appendChild(iframe);
        
        // Clean up after delay
        setTimeout(() => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          cleanup();
        }, appEnvironment.getSwitchingDelay());
      });
      
      const result = await promise;
      
      if (result.success) {
        // Update switching statistics
        const newSwitchCount = switchCount + 1;
        const newLastSwitch = new Date();
        
        setSwitchCount(newSwitchCount);
        setLastSwitch(newLastSwitch);
        
        saveData({
          switchCount: newSwitchCount,
          lastSwitch: newLastSwitch
        });
        
        setSwitchingState(SWITCHING_STATES.COMPLETED);
        
        // Track successful switch
        trackSwitchingEvent('app_switch_success', {
          switch_count: newSwitchCount,
          target_path: path
        });
        
        // Clear deep link queue
        setDeepLinkQueue([]);
        saveData({ deepLinkQueue: [] });
      } else {
        setSwitchingState(SWITCHING_STATES.FAILED);
        
        // Track failed switch
        trackSwitchingEvent('app_switch_failed', {
          error: result.message,
          target_path: path
        });
      }
      
      return result;
    } catch (error) {
      setSwitchingState(SWITCHING_STATES.FAILED);
      
      // Track error
      trackSwitchingEvent('app_switch_error', {
        error: error.message,
        target_path: path
      });
      
      return { success: false, message: 'App switch failed', error };
    }
  }, [canSwitch, switchCount, saveData, trackSwitchingEvent]);

  // Handle deep link from installed app
  const handleDeepLink = useCallback((path) => {
    // Add to deep link queue
    const linkItem = {
      path,
      timestamp: Date.now(),
      source: 'deep_link'
    };
    
    setDeepLinkQueue(prev => [...prev, linkItem]);
    saveData({ deepLinkQueue: [...deepLinkQueue, linkItem] });
    
    // Track deep link received
    trackSwitchingEvent('deep_link_received', {
      path
    });
  }, [deepLinkQueue, saveData, trackSwitchingEvent]);

  // Process deep link queue
  const processDeepLinkQueue = useCallback(() => {
    if (deepLinkQueue.length === 0) {
      return null;
    }
    
    // Get the most recent deep link
    const latestLink = deepLinkQueue[deepLinkQueue.length - 1];
    
    // Check if link is recent (within 5 minutes)
    const linkAge = Date.now() - latestLink.timestamp;
    if (linkAge > 5 * 60 * 1000) {
      // Remove old links
      const filteredQueue = deepLinkQueue.filter(link => Date.now() - link.timestamp <= 5 * 60 * 1000);
      setDeepLinkQueue(filteredQueue);
      saveData({ deepLinkQueue: filteredQueue });
      return null;
    }
    
    return latestLink;
  }, [deepLinkQueue, saveData]);

  // Update user preferences
  const updateUserPreferences = useCallback((preferences) => {
    const newPreferences = { ...userPreferences, ...preferences };
    setUserPreferences(newPreferences);
    saveData({ userPreferences: newPreferences });
    
    // Track preference update
    trackSwitchingEvent('preferences_updated', {
      preferences: newPreferences
    });
  }, [userPreferences, saveData, trackSwitchingEvent]);

  // Check if we should show app switch prompt
  const shouldShowSwitchPrompt = useCallback(() => {
    if (!canSwitch) {
      return false;
    }
    
    // Check user preferences
    if (userPreferences.disableSwitchPrompt) {
      return false;
    }
    
    // Check if recently switched (within 24 hours)
    if (lastSwitch) {
      const hoursSinceLastSwitch = (Date.now() - lastSwitch.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastSwitch < 24) {
        return false;
      }
    }
    
    // Check if user has switched too many times
    if (switchCount >= 10) {
      return false;
    }
    
    return true;
  }, [canSwitch, userPreferences, lastSwitch, switchCount]);

  // Reset switching state
  const reset = useCallback(() => {
    setSwitchingState(SWITCHING_STATES.IDLE);
    setDeepLinkQueue([]);
    setSwitchCount(0);
    setLastSwitch(null);
    setUserPreferences({});
    
    // Clear localStorage
    Object.values(APP_SWITCHING_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }, []);

  // Initialize on mount
  useEffect(() => {
    // Check for URL parameters on mount
    const shouldSwitch = handleURLParameters();
    if (shouldSwitch) {
      const latestLink = processDeepLinkQueue();
      if (latestLink) {
        switchToInstalledApp(latestLink.path);
      }
    }
  }, [handleURLParameters, processDeepLinkQueue, switchToInstalledApp]);

  // Listen for visibility changes (detect app switch back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && switchingState === SWITCHING_STATES.SWITCHING) {
        // User returned to browser, likely app switch failed
        setSwitchingState(SWITCHING_STATES.FAILED);
        
        trackSwitchingEvent('app_switch_returned', {
          state: switchingState
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [switchingState, trackSwitchingEvent]);

  return {
    // State
    switchingState,
    canSwitch,
    deepLinkQueue,
    switchCount,
    lastSwitch,
    userPreferences,
    environmentConfig: environmentConfigRef.current,
    
    // Actions
    switchToInstalledApp,
    handleDeepLink,
    processDeepLinkQueue,
    updateUserPreferences,
    reset,
    
    // Utilities
    shouldShowSwitchPrompt,
    parseURLParameters,
    
    // Constants
    SWITCHING_STATES
  };
};

export default useAppSwitching;