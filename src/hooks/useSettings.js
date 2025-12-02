import { useCallback } from 'react';
import { useApp } from '../context/AppContext.jsx';

export const useSettings = () => {
  const {
    settings,
    updateSettings,
    loading,
    error
  } = useApp();

  // Update notification times
  const updateNotificationTimes = useCallback(async (notificationTimes) => {
    try {
      await updateSettings({ notificationTimes });
    } catch (error) {
      throw error;
    }
  }, [updateSettings]);

  // Add a notification time
  const addNotificationTime = useCallback(async (time = '12:00') => {
    if (settings.notificationTimes.length >= 4) {
      throw new Error('Maximum of 4 notification times allowed');
    }
    
    const updatedTimes = [...settings.notificationTimes, time];
    await updateNotificationTimes(updatedTimes);
  }, [settings.notificationTimes, updateNotificationTimes]);

  // Update a specific notification time
  const updateNotificationTime = useCallback(async (index, time) => {
    const updatedTimes = [...settings.notificationTimes];
    updatedTimes[index] = time;
    await updateNotificationTimes(updatedTimes);
  }, [settings.notificationTimes, updateNotificationTimes]);

  // Remove a notification time
  const removeNotificationTime = useCallback(async (index) => {
    if (settings.notificationTimes.length <= 1) {
      throw new Error('At least one notification time is required');
    }
    
    const updatedTimes = settings.notificationTimes.filter((_, i) => i !== index);
    await updateNotificationTimes(updatedTimes);
  }, [settings.notificationTimes, updateNotificationTimes]);

  // Update theme
  const updateTheme = useCallback(async (theme) => {
    try {
      await updateSettings({ theme });
    } catch (error) {
      throw error;
    }
  }, [updateSettings]);

  // Update last check time
  const updateLastCheck = useCallback(async (lastCheck = new Date().toISOString()) => {
    try {
      await updateSettings({ lastCheck });
    } catch (error) {
      throw error;
    }
  }, [updateSettings]);

  // Get notification time options for select inputs
  const getNotificationTimeOptions = useCallback(() => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        options.push({ value: time, label: time });
      }
    }
    return options;
  }, []);

  // Check if a time is already in notification times
  const isNotificationTimeAdded = useCallback((time) => {
    return settings.notificationTimes.includes(time);
  }, [settings.notificationTimes]);

  // Get formatted notification times for display
  const getFormattedNotificationTimes = useCallback(() => {
    return settings.notificationTimes.map(time => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const minute = parseInt(minutes);
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
      
      return {
        value: time,
        display: `${displayHour}:${String(minute).padStart(2, '0')} ${period}`
      };
    });
  }, [settings.notificationTimes]);

  return {
    // Raw data
    settings,
    loading,
    error,
    
    // Individual settings
    notificationTimes: settings.notificationTimes || [],
    theme: settings.theme || 'auto',
    lastCheck: settings.lastCheck,
    
    // Actions
    updateSettings,
    updateNotificationTimes,
    addNotificationTime,
    updateNotificationTime,
    removeNotificationTime,
    updateTheme,
    updateLastCheck,
    
    // Utility methods
    getNotificationTimeOptions,
    isNotificationTimeAdded,
    getFormattedNotificationTimes,
    
    // Computed values
    maxNotificationTimesReached: settings.notificationTimes?.length >= 4,
    minNotificationTimesReached: settings.notificationTimes?.length <= 1
  };
};