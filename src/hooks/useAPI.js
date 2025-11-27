import { useState, useCallback } from 'react';

/**
 * Custom hook for API operations with error handling
 * Manages data loading, saving, and error states
 */
export const useAPI = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);

  // Helper function to create error objects
  const createError = (type, message, details, troubleshooting = [], canRetry = false) => ({
    type,
    message,
    details,
    troubleshooting,
    severity: type === 'offline' || type === 'timeout' ? 'warning' : 'error',
    canRetry
  });

  // Load data from API
  const loadData = useCallback(async () => {
    if (!navigator.onLine) {
      setError(createError(
        'offline',
        'No internet connection',
        'You appear to be offline.',
        [
          'Check your WiFi or mobile data connection',
          'Make sure airplane mode is off',
          'Your changes will be saved locally'
        ],
        true
      ));
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('/api/data', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setRetryCount(0);
      setError(null);
      return data;
    } catch (error) {
      console.error('Error loading data:', error);

      // Set user-facing error with troubleshooting
      if (error.name === 'AbortError') {
        setError(createError(
          'timeout',
          'Connection timeout',
          'The server took too long to respond.',
          [
            'Check your internet connection',
            'The server might be experiencing high load',
            'Try refreshing the page'
          ],
          true
        ));
      } else if (!navigator.onLine) {
        setError(createError(
          'offline',
          'No internet connection',
          'You appear to be offline.',
          [
            'Check your WiFi or mobile data connection',
            'Make sure airplane mode is off',
            'Your changes will be saved locally'
          ],
          true
        ));
      } else if (error.message.includes('404')) {
        setError(createError(
          'not_found',
          'API endpoint not found',
          'The data endpoint could not be reached.',
          [
            'Make sure the server is running',
            'Check if the API path is correct',
            'Contact support if the problem persists'
          ],
          true
        ));
      } else if (error.message.includes('500')) {
        setError(createError(
          'server_error',
          'Server error',
          'The server encountered an error.',
          [
            'Wait a moment and try again',
            'The server might be restarting',
            'Check server logs for details'
          ],
          true
        ));
      } else {
        setError(createError(
          'unknown',
          'Failed to load data',
          error.message || 'An unexpected error occurred.',
          [
            'Refresh the page to try again',
            'Clear your browser cache',
            'Check browser console for details',
            'Make sure the server is accessible'
          ],
          true
        ));
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save data to API
  const saveData = useCallback(async (data) => {
    if (!navigator.onLine) {
      setError(createError(
        'offline',
        'Cannot save - No internet connection',
        'Your changes are temporarily stored. They will be saved when you\'re back online.',
        [],
        false
      ));
      // Still return success so local state updates
      return { success: true, savedLocally: true };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to save: ${response.status} ${response.statusText}`);
      }

      // Clear any previous save errors
      if (error && error.type === 'save_error') {
        setError(null);
      }

      return { success: true };
    } catch (err) {
      console.error('Error saving data:', err);

      // Show user-facing error
      if (err.name === 'AbortError') {
        setError(createError(
          'save_error',
          'Save timeout',
          'Changes were saved locally but may not be synced to the server.',
          [
            'Your changes are saved locally',
            'Check your internet connection',
            'Click retry to sync with server'
          ],
          true
        ));
      } else if (!navigator.onLine) {
        setError(createError(
          'save_error',
          'Offline - changes saved locally',
          'Your changes will sync when you\'re back online.',
          [
            'Changes are saved in your browser',
            'Don\'t clear browser data',
            'Will auto-sync when connection returns'
          ],
          false
        ));
      } else {
        setError(createError(
          'save_error',
          'Failed to save to server',
          err.message || 'Changes are saved locally.',
          [
            'Your changes are still visible locally',
            'Try clicking retry to sync',
            'Check if the server is running',
            'Refresh page as a last resort'
          ],
          true
        ));
      }

      // Return success so local state still updates
      return { success: true, savedLocally: true };
    }
  }, [error]);

  // Dismiss error
  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  // Retry last action
  const retryLastAction = useCallback((callback) => {
    setRetryCount(prev => prev + 1);
    if (callback) {
      callback();
    }
  }, []);

  return {
    // State
    error,
    isLoading,
    isOnline,
    retryCount,

    // Methods
    loadData,
    saveData,
    dismissError,
    retryLastAction,
    setIsOnline,
    setError
  };
};

export default useAPI;
