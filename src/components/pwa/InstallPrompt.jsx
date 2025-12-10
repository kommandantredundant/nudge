import React, { useState, useEffect } from 'react';
import { usePWAInstall, INSTALL_STATES } from '../../hooks/usePWAInstall.js';
import { Download, X, Smartphone, Bell, Wifi, Shield } from 'lucide-react';
import './InstallPrompt.css';

const InstallPrompt = ({ 
  mode = 'banner', 
  autoShow = true, 
  delay = 3000,
  onInstall,
  onDismiss,
  className = ''
}) => {
  const {
    installState,
    isIOS,
    isSupported,
    install,
    dismiss,
    shouldShowPrompt,
    getIOSInstallInstructions
  } = usePWAInstall();

  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installResult, setInstallResult] = useState(null);

  // Check if prompt should be shown
  useEffect(() => {
    if (autoShow && shouldShowPrompt() && isSupported) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [autoShow, delay, shouldShowPrompt, isSupported]);

  // Handle install button click
  const handleInstall = async () => {
    setIsInstalling(true);
    setInstallResult(null);
    
    try {
      const result = await install();
      setInstallResult(result);
      
      if (result.success) {
        setIsVisible(false);
        if (onInstall) {
          onInstall(result);
        }
      } else if (result.requiresManualAction) {
        // Show iOS instructions
        // Keep the prompt visible with instructions
      }
    } catch (error) {
      setInstallResult({ 
        success: false, 
        message: 'Installation failed', 
        error 
      });
    } finally {
      setIsInstalling(false);
    }
  };

  // Handle dismiss button click
  const handleDismiss = () => {
    setIsVisible(false);
    dismiss();
    
    if (onDismiss) {
      onDismiss();
    }
  };

  // Don't render if not supported or already installed
  if (!isSupported || installState === INSTALL_STATES.INSTALLED) {
    return null;
  }

  // Don't render if not visible
  if (!isVisible && !installResult?.requiresManualAction) {
    return null;
  }

  // Render different modes
  const renderBanner = () => (
    <div className={`pwa-install-prompt banner visible ${className}`}>
      <div className="pwa-install-prompt-content">
        <img 
          src="/icon-192.svg" 
          alt="Nudge App" 
          className="pwa-install-prompt-icon"
        />
        <div className="pwa-install-prompt-info">
          <div className="pwa-install-prompt-title">Install Nudge</div>
          <div className="pwa-install-prompt-description">
            Get quick access to stay connected with your contacts
          </div>
        </div>
        <div className="pwa-install-prompt-actions">
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className={`pwa-install-button ${isInstalling ? 'installing' : ''}`}
          >
            {isInstalling ? 'Installing...' : 'Install'}
          </button>
          <button
            onClick={handleDismiss}
            className="pwa-dismiss-button"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );

  const renderModal = () => (
    <div className={`pwa-install-prompt modal visible ${className}`}>
      <button
        onClick={handleDismiss}
        className="pwa-install-prompt-close"
        aria-label="Close"
      >
        <X size={20} />
      </button>
      
      <div className="pwa-install-prompt-content">
        <img 
          src="/icon-192.svg" 
          alt="Nudge App" 
          className="pwa-install-prompt-icon"
        />
        
        <div className="pwa-install-prompt-info">
          <h2 className="pwa-install-prompt-title">Install Nudge</h2>
          <p className="pwa-install-prompt-description">
            Stay connected with the people who matter most. Install Nudge for the best experience.
          </p>
          
          <ul className="pwa-install-prompt-benefits">
            <li>Quick access from your home screen</li>
            <li>Works offline</li>
            <li>Faster loading times</li>
            <li>Native app experience</li>
          </ul>
        </div>
        
        {isIOS && installResult?.requiresManualAction ? (
          <div className="pwa-install-ios-instructions">
            <h4>How to install on iOS:</h4>
            <ol className="pwa-install-ios-steps">
              <li>Tap the Share button in Safari</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" to install the app</li>
            </ol>
            <p className="pwa-install-ios-note">
              This will add Nudge to your home screen for easy access.
            </p>
          </div>
        ) : (
          <div className="pwa-install-prompt-actions">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className={`pwa-install-button modal ${isInstalling ? 'installing' : ''}`}
            >
              {isInstalling ? 'Installing...' : 'Install App'}
            </button>
            <button
              onClick={handleDismiss}
              className="pwa-dismiss-button modal"
            >
              Maybe later
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderInline = () => (
    <div className={`pwa-install-prompt inline visible ${className}`}>
      <div className="pwa-install-prompt-content">
        <div className="pwa-install-prompt-info">
          <h3 className="pwa-install-prompt-title">
            <Smartphone size={20} style={{ marginRight: '0.5rem' }} />
            Install Nudge
          </h3>
          <p className="pwa-install-prompt-description">
            Get the best experience with our app - faster, offline access, and native feel.
          </p>
          
          <ul className="pwa-install-prompt-benefits">
            <li><Bell size={16} /> Push notifications</li>
            <li><Wifi size={16} /> Works offline</li>
            <li><Shield size={16} /> Secure & private</li>
          </ul>
        </div>
        
        <div className="pwa-install-prompt-actions">
          {isIOS && installResult?.requiresManualAction ? (
            <div className="pwa-install-ios-instructions">
              <h4>Install on iOS:</h4>
              <ol className="pwa-install-ios-steps">
                <li>Tap Share in Safari</li>
                <li>Add to Home Screen</li>
                <li>Tap Add</li>
              </ol>
            </div>
          ) : (
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className={`pwa-install-button ${isInstalling ? 'installing' : ''}`}
            >
              <Download size={16} className="install-icon" />
              {isInstalling ? 'Installing...' : 'Install'}
            </button>
          )}
          
          <button
            onClick={handleDismiss}
            className="pwa-dismiss-button"
          >
            Dismiss
          </button>
        </div>
      </div>
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

export default InstallPrompt;