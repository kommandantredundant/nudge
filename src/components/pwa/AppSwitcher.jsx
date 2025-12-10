import React, { useState, useEffect } from 'react';
import { useAppSwitching, SWITCHING_STATES } from '../../hooks/useAppSwitching.js';
import { appEnvironment } from '../../utils/appEnvironment.js';
import { 
  ExternalLink, 
  Smartphone, 
  Monitor, 
  ArrowRight, 
  X, 
  Check, 
  AlertCircle,
  Settings,
  Download
} from 'lucide-react';
import './AppSwitcher.css';

const AppSwitcher = ({ 
  mode = 'banner',
  autoShow = true,
  delay = 2000,
  onSwitch,
  onDismiss,
  className = ''
}) => {
  const {
    switchingState,
    canSwitch,
    switchCount,
    lastSwitch,
    userPreferences,
    environmentConfig,
    switchToInstalledApp,
    processDeepLinkQueue,
    updateUserPreferences,
    shouldShowSwitchPrompt,
    reset
  } = useAppSwitching();

  const [isVisible, setIsVisible] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchResult, setSwitchResult] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [deepLinkPath, setDeepLinkPath] = useState('/');

  // Check if prompt should be shown
  useEffect(() => {
    if (autoShow && shouldShowSwitchPrompt() && canSwitch) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [autoShow, delay, shouldShowSwitchPrompt, canSwitch]);

  // Check for deep links
  useEffect(() => {
    const latestLink = processDeepLinkQueue();
    if (latestLink) {
      setDeepLinkPath(latestLink.path);
      if (shouldShowSwitchPrompt()) {
        setIsVisible(true);
      }
    }
  }, [processDeepLinkQueue, shouldShowSwitchPrompt]);

  // Handle switch to installed app
  const handleSwitchToApp = async () => {
    setIsSwitching(true);
    setSwitchResult(null);
    
    try {
      const result = await switchToInstalledApp(deepLinkPath);
      setSwitchResult(result);
      
      if (result.success) {
        setIsVisible(false);
        if (onSwitch) {
          onSwitch(result);
        }
      }
    } catch (error) {
      setSwitchResult({ 
        success: false, 
        message: 'Failed to switch to app', 
        error 
      });
    } finally {
      setIsSwitching(false);
    }
  };

  // Handle dismiss
  const handleDismiss = () => {
    setIsVisible(false);
    
    // Update user preferences to reduce prompt frequency
    if (switchCount >= 3) {
      updateUserPreferences({ 
        disableSwitchPrompt: true,
        dismissedAt: new Date().toISOString()
      });
    }
    
    if (onDismiss) {
      onDismiss();
    }
  };

  // Handle settings toggle
  const handleSettingsToggle = () => {
    setShowSettings(!showSettings);
  };

  // Handle preference changes
  const handlePreferenceChange = (key, value) => {
    updateUserPreferences({ [key]: value });
  };

  // Get environment-specific messaging
  const getEnvironmentMessage = () => {
    const config = environmentConfig;
    
    if (config.platform === 'ios') {
      return {
        title: 'Open in Nudge App',
        description: 'For the best experience, open this page in the Nudge app installed on your device.',
        benefits: [
          'Faster loading times',
          'Offline access',
          'Native iOS experience',
          'Push notifications'
        ]
      };
    }
    
    if (config.platform === 'android') {
      return {
        title: 'Open in Nudge App',
        description: 'Switch to the Nudge app for a faster, more integrated experience.',
        benefits: [
          'Quick app switching',
          'Background sync',
          'Native Android experience',
          'Widget support'
        ]
      };
    }
    
    return {
      title: 'Open in Nudge App',
      description: 'Get the best experience with the Nudge app installed on your device.',
      benefits: [
        'Faster performance',
        'Offline support',
        'System integration',
        'Auto-updates'
      ]
    };
  };

  // Don't render if can't switch or not visible
  if (!canSwitch || (!isVisible && !switchResult?.success === false)) {
    return null;
  }

  const message = getEnvironmentMessage();

  // Render different modes
  const renderBanner = () => (
    <div className={`app-switcher banner visible ${className}`}>
      <div className="app-switcher-content">
        <div className="app-switcher-icon">
          {environmentConfig.platform === 'ios' ? (
            <Smartphone size={24} />
          ) : (
            <Monitor size={24} />
          )}
        </div>
        
        <div className="app-switcher-info">
          <div className="app-switcher-title">{message.title}</div>
          <div className="app-switcher-description">{message.description}</div>
        </div>
        
        <div className="app-switcher-actions">
          <button
            onClick={handleSwitchToApp}
            disabled={isSwitching}
            className={`app-switcher-button ${isSwitching ? 'switching' : ''}`}
          >
            {isSwitching ? 'Opening...' : 'Open App'}
            <ArrowRight size={16} className="ml-1" />
          </button>
          
          <button
            onClick={handleDismiss}
            className="app-switcher-dismiss"
          >
            Stay in Browser
          </button>
        </div>
      </div>
      
      {switchResult && !switchResult.success && (
        <div className="app-switcher-error">
          <AlertCircle size={16} />
          <span>{switchResult.message}</span>
        </div>
      )}
    </div>
  );

  const renderModal = () => (
    <div className={`app-switcher modal visible ${className}`}>
      <div className="app-switcher-backdrop" onClick={handleDismiss} />
      
      <div className="app-switcher-dialog">
        <div className="app-switcher-header">
          <div className="app-switcher-icon large">
            <Smartphone size={32} />
          </div>
          <button
            onClick={handleDismiss}
            className="app-switcher-close"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="app-switcher-body">
          <h2 className="app-switcher-title">{message.title}</h2>
          <p className="app-switcher-description">{message.description}</p>
          
          <div className="app-switcher-benefits">
            <h3>Why switch to the app?</h3>
            <ul>
              {message.benefits.map((benefit, index) => (
                <li key={index}>
                  <Check size={16} className="benefit-icon" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          
          {deepLinkPath !== '/' && (
            <div className="app-switcher-deep-link">
              <strong>Navigation:</strong> {deepLinkPath}
            </div>
          )}
        </div>
        
        <div className="app-switcher-footer">
          <button
            onClick={handleSwitchToApp}
            disabled={isSwitching}
            className={`app-switcher-button primary ${isSwitching ? 'switching' : ''}`}
          >
            {isSwitching ? (
              <>
                <div className="spinner" />
                Opening App...
              </>
            ) : (
              <>
                <Download size={16} className="mr-1" />
                Open in App
              </>
            )}
          </button>
          
          <div className="app-switcher-secondary-actions">
            <button
              onClick={handleSettingsToggle}
              className="app-switcher-settings"
            >
              <Settings size={16} className="mr-1" />
              Settings
            </button>
            
            <button
              onClick={handleDismiss}
              className="app-switcher-dismiss"
            >
              Continue in Browser
            </button>
          </div>
        </div>
        
        {switchResult && !switchResult.success && (
          <div className="app-switcher-error">
            <AlertCircle size={16} />
            <span>{switchResult.message}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderInline = () => (
    <div className={`app-switcher inline visible ${className}`}>
      <div className="app-switcher-content">
        <div className="app-switcher-info">
          <h3 className="app-switcher-title">
            <Smartphone size={20} className="mr-2" />
            {message.title}
          </h3>
          <p className="app-switcher-description">{message.description}</p>
        </div>
        
        <div className="app-switcher-actions">
          <button
            onClick={handleSwitchToApp}
            disabled={isSwitching}
            className={`app-switcher-button ${isSwitching ? 'switching' : ''}`}
          >
            {isSwitching ? (
              <>
                <div className="spinner small" />
                Opening...
              </>
            ) : (
              <>
                <ExternalLink size={16} className="mr-1" />
                Open App
              </>
            )}
          </button>
          
          <button
            onClick={handleDismiss}
            className="app-switcher-dismiss"
          >
            Dismiss
          </button>
        </div>
      </div>
      
      {showSettings && (
        <div className="app-switcher-settings-panel">
          <h4>App Switching Settings</h4>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={userPreferences.disableSwitchPrompt || false}
                onChange={(e) => handlePreferenceChange('disableSwitchPrompt', e.target.checked)}
              />
              Don't show app switching prompts
            </label>
          </div>
          
          {switchCount > 0 && (
            <div className="switch-stats">
              <p>App switches: {switchCount}</p>
              {lastSwitch && (
                <p>Last switch: {new Date(lastSwitch).toLocaleDateString()}</p>
              )}
            </div>
          )}
        </div>
      )}
      
      {switchResult && !switchResult.success && (
        <div className="app-switcher-error">
          <AlertCircle size={16} />
          <span>{switchResult.message}</span>
        </div>
      )}
    </div>
  );

  // Render based on mode
  switch (mode) {
    case 'modal':
      return renderModal();
    case 'inline':
      return renderInline();
    case 'banner':
    default:
      return renderBanner();
  }
};

export default AppSwitcher;