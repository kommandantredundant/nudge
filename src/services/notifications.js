/**
 * Notification service for handling browser notifications
 */

import { isNotificationTime, shouldCheckNotifications, getCurrentTime } from '../utils/dateUtils.js';

class NotificationService {
  constructor() {
    this.permission = 'default';
    this.isSupported = 'Notification' in window;
    this.checkPermission();
  }

  /**
   * Check current notification permission
   */
  checkPermission() {
    if (this.isSupported) {
      this.permission = Notification.permission;
    }
    return this.permission;
  }

  /**
   * Request notification permission from user
   * @returns {Promise<string>} Permission status
   */
  async requestPermission() {
    if (!this.isSupported) {
      console.warn('Notifications not supported in this browser');
      return 'unsupported';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Check if notifications are enabled
   * @returns {boolean} True if notifications are granted
   */
  isEnabled() {
    return this.isSupported && this.permission === 'granted';
  }

  /**
   * Show a notification
   * @param {string} title - Notification title
   * @param {Object} options - Notification options
   * @returns {Notification|null} Notification object or null if failed
   */
  show(title, options = {}) {
    if (!this.isEnabled()) {
      console.warn('Notifications not enabled');
      return null;
    }

    const defaultOptions = {
      icon: '/icon-192.svg',
      badge: '/icon-192.svg',
      tag: 'nudge-notification',
      requireInteraction: false,
      silent: false,
      ...options
    };

    try {
      return new Notification(title, defaultOptions);
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  /**
   * Show a notification for overdue contacts
   * @param {Array} contacts - Array of overdue contacts
   * @returns {Notification|null} Notification object or null if failed
   */
  showOverdueNotification(contacts) {
    if (!contacts || contacts.length === 0) {
      return null;
    }

    const count = contacts.length;
    const names = contacts.slice(0, 3).map(c => c.name).join(', ');
    const more = count > 3 ? ` and ${count - 3} more` : '';
    
    return this.show('Nudge Reminder', {
      body: `Time to reach out to: ${names}${more}`,
      tag: 'nudge-overdue',
      requireInteraction: true
    });
  }

  /**
   * Show a notification for birthdays
   * @param {Array} contacts - Array of contacts with birthdays today
   * @returns {Notification|null} Notification object or null if failed
   */
  showBirthdayNotification(contacts) {
    if (!contacts || contacts.length === 0) {
      return null;
    }

    const count = contacts.length;
    const names = contacts.slice(0, 3).map(c => c.name).join(', ');
    const more = count > 3 ? ` and ${count - 3} more` : '';
    
    return this.show('🎂 Birthday Reminder!', {
      body: `${count === 1 ? 'It\'s' : 'Birthdays today:'} ${names}${more}`,
      tag: 'nudge-birthday',
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200]
    });
  }

  /**
   * Show a test notification
   * @param {string} type - Type of test notification
   * @param {string} message - Custom message
   * @returns {Notification|null} Notification object or null if failed
   */
  showTestNotification(type = 'daily', message = 'Test notification') {
    const titles = {
      daily: 'Nudge Test - Daily Reminder',
      birthday: '🎂 Nudge Test - Birthday Reminder',
      overdue: 'Nudge Test - Overdue Contacts',
      custom: 'Nudge Test'
    };

    return this.show(titles[type] || titles.custom, {
      body: message,
      tag: `nudge-test-${Date.now()}`
    });
  }

  /**
   * Check and send notifications if needed
   * @param {Array} contacts - Array of all contacts
   * @param {Array} circles - Array of circles
   * @param {Object} settings - App settings
   * @returns {Object} Result object with sent notifications info
   */
  async checkAndNotify(contacts, circles, settings) {
    const result = {
      sentOverdue: false,
      sentBirthday: false,
      overdueCount: 0,
      birthdayCount: 0,
      error: null
    };

    try {
      // Check if it's time to notify
      if (!isNotificationTime(settings.notificationTimes)) {
        return result;
      }

      // Check if we recently sent notifications to avoid duplicates
      if (!shouldCheckNotifications(settings.lastCheck)) {
        return result;
      }

      // Get overdue and birthday contacts
      const { getOverdueContacts, getBirthdayContacts } = await import('../utils/contactUtils.js');
      const overdueContacts = getOverdueContacts(contacts, circles);
      const birthdayContacts = getBirthdayContacts(contacts);

      result.overdueCount = overdueContacts.length;
      result.birthdayCount = birthdayContacts.length;

      // Send overdue notification
      if (overdueContacts.length > 0) {
        this.showOverdueNotification(overdueContacts);
        result.sentOverdue = true;
      }

      // Send birthday notification
      if (birthdayContacts.length > 0) {
        this.showBirthdayNotification(birthdayContacts);
        result.sentBirthday = true;
      }

      return result;
    } catch (error) {
      console.error('Error in checkAndNotify:', error);
      result.error = error.message;
      return result;
    }
  }

  /**
   * Schedule periodic notification checks
   * @param {Function} callback - Function to call for checking notifications
   * @param {number} interval - Check interval in milliseconds (default: 1 minute)
   * @returns {number} Interval ID for clearing
   */
  schedulePeriodicCheck(callback, interval = 60 * 1000) {
    return setInterval(callback, interval);
  }

  /**
   * Clear all active notifications
   */
  clearAll() {
    if (this.isSupported) {
      Notification.closeAll();
    }
  }

  /**
   * Clear notifications by tag
   * @param {string} tag - Tag of notifications to clear
   */
  clearByTag(tag) {
    if (this.isSupported) {
      // Get all active notifications and close matching ones
      // Note: This is a workaround as there's no direct API to clear by tag
      // In a real implementation, you might need to track active notifications
    }
  }
}

// Create and export a singleton instance
const notificationService = new NotificationService();
export default notificationService;

// Export individual methods for easier importing
export const {
  checkPermission,
  requestPermission,
  isEnabled,
  show,
  showOverdueNotification,
  showBirthdayNotification,
  showTestNotification,
  checkAndNotify,
  schedulePeriodicCheck,
  clearAll,
  clearByTag
} = notificationService;