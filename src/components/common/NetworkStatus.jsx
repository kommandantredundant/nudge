import React, { useState, useEffect } from 'react';
import { useNetworkStatus } from '../../utils/networkUtils';
import './NetworkStatus.css';

/**
 * NetworkStatus component - Displays online/offline status
 * Can be used as a floating indicator or inline component
 */
const NetworkStatus = ({ 
  variant = 'floating', // 'floating', 'inline', 'banner'
  showWhenOnline = false,
  position = 'top-right' // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
}) => {
  const { online, checking } = useNetworkStatus();
  const [visible, setVisible] = useState(false);

  // Show/hide based on network status and settings
  useEffect(() => {
    if (!online) {
      setVisible(true);
    } else if (online && showWhenOnline) {
      setVisible(true);
      // Auto-hide after 3 seconds when coming back online
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [online, showWhenOnline]);

  if (!visible) return null;

  const getPositionClasses = () => {
    if (variant !== 'floating') return '';
    
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4'
    };
    
    return positions[position] || positions['top-right'];
  };

  const getStatusIcon = () => {
    if (checking) {
      return (
        <div className="network-status-icon checking">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    }

    if (online) {
      return (
        <div className="network-status-icon online">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12.55C5.5 12.28 6.02 12.07 6.57 11.93L6.23 11.59C5.84 11.2 5.84 10.57 6.23 10.18L10.18 6.23C10.57 5.84 11.2 5.84 11.59 6.23L15.54 10.18C15.93 10.57 15.93 11.2 15.54 11.59L15.2 11.93C15.75 12.07 16.27 12.28 16.77 12.55L18.38 10.94C19.17 10.15 19.17 8.85 18.38 8.06L15.94 5.62C15.15 4.83 13.85 4.83 13.06 5.62L10.62 8.06L8.18 5.62C7.39 4.83 6.09 4.83 5.3 5.62L2.86 8.06C2.07 8.85 2.07 10.15 2.86 10.94L5 13.08C5 12.9 5 12.73 5 12.55Z" fill="currentColor"/>
            <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z" fill="currentColor"/>
            <path d="M12 2C13.1 2 14 2.9 14 4H10C10 2.9 10.9 2 12 2Z" fill="currentColor"/>
            <path d="M12 6C7.58 6 4 9.58 4 14C4 18.42 7.58 22 12 22C16.42 22 20 18.42 20 14C20 9.58 16.42 6 12 6ZM12 20C8.69 20 6 17.31 6 14C6 10.69 8.69 8 12 8C15.31 8 18 10.69 18 14C18 17.31 15.31 20 12 20Z" fill="currentColor"/>
            <circle cx="12" cy="14" r="3" fill="currentColor"/>
          </svg>
        </div>
      );
    }

    return (
      <div className="network-status-icon offline">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16.72 11.06C16.5 8.93 15.38 7.06 13.72 5.84C13.27 5.52 12.79 5.25 12.28 5.04C10.88 4.48 9.28 4.48 7.88 5.04C7.37 5.25 6.89 5.52 6.44 5.84C4.78 7.06 3.66 8.93 3.44 11.06C3.16 13.73 4.23 16.16 6.06 17.78C6.51 18.18 7.02 18.52 7.57 18.78C8.97 19.44 10.63 19.44 12.03 18.78C12.58 18.52 13.09 18.18 13.54 17.78C15.37 16.16 16.44 13.73 16.72 11.06Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
  };

  const getStatusText = () => {
    if (checking) return 'Checking connection...';
    if (online) return 'Back online';
    return 'You\'re offline';
  };

  const getStatusMessage = () => {
    if (checking) return 'Verifying network connection';
    if (online) return 'Your connection has been restored';
    return 'Some features may not be available until you reconnect';
  };

  const getVariantClasses = () => {
    const baseClasses = 'network-status';
    const variantClasses = {
      floating: 'network-status--floating',
      inline: 'network-status--inline',
      banner: 'network-status--banner'
    };
    
    return `${baseClasses} ${variantClasses[variant] || variantClasses.floating}`;
  };

  return (
    <div className={`${getVariantClasses()} ${getPositionClasses()}`}>
      {getStatusIcon()}
      <div className="network-status-content">
        <div className="network-status-title">{getStatusText()}</div>
        {variant !== 'inline' && (
          <div className="network-status-message">{getStatusMessage()}</div>
        )}
      </div>
      {variant === 'floating' && (
        <button 
          className="network-status-close"
          onClick={() => setVisible(false)}
          aria-label="Close notification"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default NetworkStatus;