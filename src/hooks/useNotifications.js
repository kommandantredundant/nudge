import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing browser notifications
 * Handles permission requests, notification sending, and notification logic
 */
export const useNotifications = () => {
  const [notificationPermission, setNotificationPermission] = useState('default');

  // Check notification permission on mount
  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = useCallback(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    }
    return false;
  }, []);

  const sendBatchNotification = useCallback((overdueContacts) => {
    const count = overdueContacts.length;
    const names = overdueContacts.slice(0, 3).map(c => c.name).join(', ');
    const more = count > 3 ? ` and ${count - 3} more` : '';

    new Notification('Thread Reminder', {
      body: `Time to reach out to: ${names}${more}`,
      icon: '/icon-192.png',
      tag: 'thread-daily',
      requireInteraction: true
    });
  }, []);

  const sendBirthdayNotification = useCallback((birthdayContacts) => {
    const count = birthdayContacts.length;
    const names = birthdayContacts.slice(0, 3).map(c => c.name).join(', ');
    const more = count > 3 ? ` and ${count - 3} more` : '';

    new Notification('🎂 Birthday Reminder!', {
      body: `${count === 1 ? 'It\'s' : 'Birthdays today:'} ${names}${more}`,
      icon: '/icon-192.png',
      tag: 'thread-birthday',
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200]
    });
  }, []);

  const checkAndNotify = useCallback((
    settings,
    contacts,
    saveData,
    getBirthdayContacts,
    getOverdueContacts
  ) => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Check if current time matches any notification time exactly (within same minute)
    const shouldNotify = settings.notificationTimes.some(time => time === currentTime);

    if (!shouldNotify) return;

    // Check if already notified in the last 2 minutes to prevent duplicates
    const lastCheck = settings.lastCheck ? new Date(settings.lastCheck) : null;
    if (lastCheck && Math.abs(now - lastCheck) / (1000 * 60) < 2) {
      return;
    }

    // Check for birthdays first
    const birthdayContacts = getBirthdayContacts();
    if (birthdayContacts.length > 0 && notificationPermission === 'granted') {
      sendBirthdayNotification(birthdayContacts);
    }

    // Then check for overdue contacts
    const overdueContacts = getOverdueContacts();
    if (overdueContacts.length > 0 && notificationPermission === 'granted') {
      sendBatchNotification(overdueContacts);
    }

    if (birthdayContacts.length > 0 || overdueContacts.length > 0) {
      saveData(contacts, null, { ...settings, lastCheck: now.toISOString() });
    }
  }, [notificationPermission, sendBatchNotification, sendBirthdayNotification]);

  return {
    notificationPermission,
    checkNotificationPermission,
    requestNotificationPermission,
    sendBatchNotification,
    sendBirthdayNotification,
    checkAndNotify
  };
};

export default useNotifications;
