import React, { useState, useEffect } from 'react';
import { usePWAInstall, INSTALL_STATES } from '../../hooks/usePWAInstall.js';
import { Download, Check, Smartphone, Loader2 } from 'lucide-react';
import './InstallPrompt.css';

const InstallButton = ({ 
  variant = 'primary',
  size = 'medium',
  showText = true,
  className = '',
  onInstall,
  onInstallStart,
  onInstallComplete,
  onError
}) => {
  const {
    installState,
    isIOS,
    isSupported,
    install,
    shouldShowPrompt
  } = usePWAInstall();

  const [isInstalling, setIsInstalling] = useState(false);
  const [installResult, setInstallResult] = useState(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Don't render if not supported or already installed
  if (!isSupported || installState === INSTALL_STATES.INSTALLED) {
    return null;
  }

  // Don't render if shouldn't show prompt
  if (!shouldShowPrompt()) {
    return null;
  }

  // Handle install button click
  const handleInstall = async () => {
    if (isInstalling) return;

    setIsInstalling(true);
    setInstallResult(null);
    
    if (onInstallStart) {
      onInstallStart();
    }

    try {
      const result = await install();
      setInstallResult(result);
      
      if (result.success) {
        if (onInstallComplete) {
          onInstallComplete(result);
        }
      } else if (result.requiresManualAction) {
        setShowIOSInstructions(true);
      } else {
        if (onError) {
          onError(result);
        }
      }
    } catch (error) {
      const errorResult = { 
        success: false, 
        message: 'Installation failed', 
        error 
      };
      setInstallResult(errorResult);
      
      if (onError) {
        onError(errorResult);
      }
    } finally {
      setIsInstalling(false);
    }
  };

  // Get button text based on state
  const getButtonText = () => {
    if (isInstalling) return 'Installing...';
    if (installResult?.success) return 'Installed!';
    if (isIOS) return 'Install App';
    return 'Install App';
  };

  // Get button icon based on state
  const getButtonIcon = () => {
    if (isInstalling) return <Loader2 size={16} className="install-icon spin" />;
    if (installResult?.success) return <Check size={16} className="install-icon" />;
    return <Download size={16} className="install-icon" />;
  };

  // Size classes
  const sizeClasses = {
    small: 'px-3 py-1 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  // Variant classes
  const variantClasses = {
    primary: 'pwa-install-button',
    secondary: 'pwa-dismiss-button',
    outline: 'pwa-install-button-outline'
  };

  const buttonClasses = [
    'pwa-install-button-component',
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || sizeClasses.medium,
    isInstalling ? 'installing' : '',
    installResult?.success ? 'installed' : '',
    className
  ].filter(Boolean).join(' ');

  // Render iOS instructions
  if (showIOSInstructions && isIOS) {
    return (
      <div className="pwa-install-ios-instructions" style={{ marginTop: '1rem' }}>
        <h4>How to install on iOS:</h4>
        <ol className="pwa-install-ios-steps">
          <li>Tap the Share button in Safari</li>
          <li>Scroll down and tap "Add to Home Screen"</li>
          <li>Tap "Add" to install the app</li>
        </ol>
        <p className="pwa-install-ios-note">
          This will add Nudge to your home screen for easy access.
        </p>
        <button
          onClick={() => setShowIOSInstructions(false)}
          className="pwa-dismiss-button"
          style={{ marginTop: '1rem' }}
        >
          Got it
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleInstall}
      disabled={isInstalling || installResult?.success}
      className={buttonClasses}
      title={isIOS ? 'Follow instructions to install on iOS' : 'Install Nudge app'}
    >
      <Smartphone size={16} className="install-icon" />
      {getButtonIcon()}
      {showText && (
        <span>{getButtonText()}</span>
      )}
    </button>
  );
};

// Specialized button variants
export const CompactInstallButton = (props) => (
  <InstallButton 
    {...props}
    size="small"
    showText={false}
    variant="outline"
    className="compact-install-button"
  />
);

export const ProminentInstallButton = (props) => (
  <InstallButton 
    {...props}
    size="large"
    variant="primary"
    className="prominent-install-button"
  />
);

export const SubtleInstallButton = (props) => (
  <InstallButton 
    {...props}
    size="medium"
    variant="secondary"
    showText={false}
    className="subtle-install-button"
  />
);

export default InstallButton;