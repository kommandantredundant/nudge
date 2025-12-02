import React from 'react';
import { Settings, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useNotifications } from '../../hooks/useNotifications.js';
import Button from '../common/Button.jsx';

const Header = ({ onSettingsToggle, showSettings }) => {
  const { currentTheme } = useTheme();
  const { 
    notificationCounts, 
    permissionStatus, 
    requestPermission,
    shouldShowNotifications 
  } = useNotifications();

  const handleNotificationRequest = async () => {
    try {
      await requestPermission();
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-nord10 to-nord8 rounded-xl flex items-center justify-center">
            <svg 
              viewBox="0 0 24 24" 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              style={{ color: '#BF616A' }}
            >
              <path d="M 7 9 Q 12 5, 17 9 Q 19 12, 17 15 Q 12 19, 7 15 Q 5 12, 7 9 Z" fill="none" stroke="currentColor"/>
              <circle cx="7" cy="9" r="1.5" fill="currentColor"/>
              <circle cx="17" cy="9" r="1.5" fill="currentColor"/>
              <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Nudge
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Stay connected
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {/* Birthday notifications */}
          {notificationCounts.birthdays > 0 && (
            <div className="notification-badge birthday">
              🎂 {notificationCounts.birthdays} birthday{notificationCounts.birthdays > 1 ? 's' : ''}
            </div>
          )}
          
          {/* Overdue notifications */}
          {notificationCounts.overdue > 0 && (
            <div className="notification-badge overdue">
              {notificationCounts.overdue} overdue
            </div>
          )}
          
          {/* Notification permission request */}
          {permissionStatus.status === 'default' && shouldShowNotifications && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleNotificationRequest}
              className="px-4 py-2"
              style={{ backgroundColor: '#EBCB8B', color: '#2E3440' }}
            >
              <Bell className="w-4 h-4" />
              Enable Notifications
            </Button>
          )}
          
          {/* Settings button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onSettingsToggle}
            className="p-2"
            aria-label="Settings"
            aria-expanded={showSettings}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;