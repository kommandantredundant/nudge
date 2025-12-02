import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import notificationService from '../services/notifications.js';

export const useNotifications = () => {
  const {
    contacts,
    circles,
    settings,
    requestNotificationPermission,
    checkAndNotify,
    canSendNotifications,
    notificationPermission
  } = useApp();

  const [lastNotificationResult, setLastNotificationResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  // Request permission
  const requestPermission = useCallback(async () => {
    try {
      const permission = await requestNotificationPermission();
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  }, [requestNotificationPermission]);

  // Send test notification
  const sendTestNotification = useCallback(async (type = 'daily', message = 'Test notification') => {
    try {
      const notification = notificationService.showTestNotification(type, message);
      return notification;
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }, []);

  // Check and send notifications manually
  const checkNotifications = useCallback(async () => {
    if (isChecking) return;
    
    try {
      setIsChecking(true);
      const result = await checkAndNotify();
      setLastNotificationResult(result);
      return result;
    } catch (error) {
      console.error('Error checking notifications:', error);
      throw error;
    } finally {
      setIsChecking(false);
    }
  }, [checkAndNotify, isChecking]);

  // Get notification counts
  const getNotificationCounts = useCallback(() => {
    if (!contacts.length || !circles.length) {
      return { overdue: 0, birthdays: 0, total: 0 };
    }

    const { getOverdueContacts, getBirthdayContacts } = require('../utils/contactUtils.js');
    const overdue = getOverdueContacts(contacts, circles).length;
    const birthdays = getBirthdayContacts(contacts).length;
    
    return {
      overdue,
      birthdays,
      total: overdue + birthdays
    };
  }, [contacts, circles]);

  // Check if notifications should be shown
  const shouldShowNotifications = useCallback(() => {
    return canSendNotifications && settings.notificationTimes.length > 0;
  }, [canSendNotifications, settings.notificationTimes]);

  // Get permission status with human-readable text
  const getPermissionStatus = useCallback(() => {
    switch (notificationPermission) {
      case 'granted':
        return { status: 'granted', text: 'Enabled', color: 'success' };
      case 'denied':
        return { status: 'denied', text: 'Blocked', color: 'error' };
      case 'default':
        return { status: 'default', text: 'Not requested', color: 'warning' };
      default:
        return { status: 'unsupported', text: 'Not supported', color: 'error' };
    }
  }, [notificationPermission]);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    notificationService.clearAll();
  }, []);

  // Get notification settings summary
  const getNotificationSettings = useCallback(() => {
    return {
      enabled: shouldShowNotifications(),
      permission: getPermissionStatus(),
      times: settings.notificationTimes || [],
      lastCheck: settings.lastCheck,
      canSend: canSendNotifications
    };
  }, [shouldShowNotifications, getPermissionStatus, settings, canSendNotifications]);

  // Auto-check notifications when dependencies change
  useEffect(() => {
    if (shouldShowNotifications() && contacts.length > 0 && circles.length > 0) {
      // Check notifications immediately
      checkNotifications();
      
      // Set up periodic checks (every minute)
      const interval = setInterval(checkNotifications, 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [shouldShowNotifications, contacts.length, circles.length, checkNotifications]);

  return {
    // State
    notificationPermission,
    lastNotificationResult,
    isChecking,
    
    // Computed values
    canSendNotifications,
    shouldShowNotifications,
    notificationCounts: getNotificationCounts(),
    permissionStatus: getPermissionStatus(),
    notificationSettings: getNotificationSettings(),
    
    // Actions
    requestPermission,
    sendTestNotification,
    checkNotifications,
    clearAllNotifications,
    
    // Utility methods
    getNotificationCounts,
    getPermissionStatus,
    getNotificationSettings
  };
};