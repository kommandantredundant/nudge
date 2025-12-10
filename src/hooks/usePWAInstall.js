import { useState, useEffect, useCallback } from 'react';

// Local storage keys
const PWA_INSTALL_KEYS = {
  DISMISSED: 'pwa_install_dismissed',
  INSTALL_DATE: 'pwa_install_date',
  INSTALL_METHOD: 'pwa_install_method',
  PROMPT_COUNT: 'pwa_prompt_count',
  LAST_PROMPT: 'pwa_last_prompt'
};

// Installation states
export const INSTALL_STATES = {
  CAN_INSTALL: 'can_install',
  INSTALLING: 'installing',
  INSTALLED: 'installed',
  UNSUPPORTED: 'unsupported',
  DISMISSED: 'dismissed'
};

export const usePWAInstall = () => {
  const [installState, setInstallState] = useState(INSTALL_STATES.UNSUPPORTED);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installEvent, setInstallEvent] = useState(null);
  const [promptCount, setPromptCount] = useState(0);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Check if running on iOS
  const checkIsIOS = useCallback(() => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }, []);

  // Check if app is running in standalone mode
  const checkIsStandalone = useCallback(() => {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    );
  }, []);

  // Check if PWA installation is supported
  const isSupported = useCallback(() => {
    return 'beforeinstallprompt' in window || checkIsIOS();
  }, [checkIsIOS]);

  // Load installation data from localStorage
  const loadInstallData = useCallback(() => {
    try {
      const dismissed = localStorage.getItem(PWA_INSTALL_KEYS.DISMISSED);
      const installDate = localStorage.getItem(PWA_INSTALL_KEYS.INSTALL_DATE);
      const installMethod = localStorage.getItem(PWA_INSTALL_KEYS.INSTALL_METHOD);
      const count = parseInt(localStorage.getItem(PWA_INSTALL_KEYS.PROMPT_COUNT) || '0');
      const lastPrompt = localStorage.getItem(PWA_INSTALL_KEYS.LAST_PROMPT);

      return {
        dismissed: dismissed === 'true',
        installDate: installDate || null,
        installMethod: installMethod || null,
        promptCount: count,
        lastPrompt: lastPrompt || null
      };
    } catch (error) {
      console.error('Error loading PWA install data:', error);
      return {
        dismissed: false,
        installDate: null,
        installMethod: null,
        promptCount: 0,
        lastPrompt: null
      };
    }
  }, []);

  // Save installation data to localStorage
  const saveInstallData = useCallback((data) => {
    try {
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          localStorage.getItem(PWA_INSTALL_KEYS[key.toUpperCase()], value.toString());
        } else {
          localStorage.removeItem(PWA_INSTALL_KEYS[key.toUpperCase()]);
        }
      });
    } catch (error) {
      console.error('Error saving PWA install data:', error);
    }
  }, []);

  // Initialize installation state
  const initializeInstallState = useCallback(() => {
    const ios = checkIsIOS();
    const standalone = checkIsStandalone();
    const supported = isSupported();
    const installData = loadInstallData();

    setIsIOS(ios);
    setIsStandalone(standalone);

    if (standalone || installData.installDate) {
      setInstallState(INSTALL_STATES.INSTALLED);
    } else if (!supported) {
      setInstallState(INSTALL_STATES.UNSUPPORTED);
    } else if (installData.dismissed) {
      setInstallState(INSTALL_STATES.DISMISSED);
    } else {
      setInstallState(INSTALL_STATES.CAN_INSTALL);
    }

    setPromptCount(installData.promptCount);
  }, [checkIsIOS, checkIsStandalone, isSupported, loadInstallData]);

  // Handle beforeinstallprompt event
  const handleBeforeInstallPrompt = useCallback((event) => {
    // Prevent the mini-infobar from appearing on mobile
    event.preventDefault();
    
    // Stash the event so it can be triggered later
    setDeferredPrompt(event);
    setInstallEvent(event);
    
    // Update state to show install prompt
    if (!checkIsStandalone() && !loadInstallData().dismissed) {
      setInstallState(INSTALL_STATES.CAN_INSTALL);
    }
  }, [checkIsStandalone, loadInstallData]);

  // Handle appinstalled event
  const handleAppInstalled = useCallback((event) => {
    // Clear the deferred prompt
    setDeferredPrompt(null);
    setInstallEvent(null);
    
    // Update state
    setInstallState(INSTALL_STATES.INSTALLED);
    
    // Save installation data
    saveInstallData({
      installDate: new Date().toISOString(),
      installMethod: 'native'
    });
    
    // Track installation event for analytics
    if (window.gtag) {
      window.gtag('event', 'pwa_installed', {
        method: 'native',
        platform: navigator.platform
      });
    }
    
    console.log('PWA was installed');
  }, [saveInstallData]);

  // Install the PWA
  const install = useCallback(async () => {
    if (installState === INSTALL_STATES.INSTALLED) {
      return { success: false, message: 'App is already installed' };
    }

    if (installState === INSTALL_STATES.INSTALLING) {
      return { success: false, message: 'Installation is already in progress' };
    }

    if (isIOS) {
      // For iOS, we can't programmatically install
      // Show instructions for manual installation
      setInstallState(INSTALL_STATES.INSTALLING);
      return { 
        success: false, 
        message: 'iOS requires manual installation. Please follow the instructions.',
        requiresManualAction: true 
      };
    }

    if (!deferredPrompt) {
      return { success: false, message: 'Installation prompt not available' };
    }

    try {
      setInstallState(INSTALL_STATES.INSTALLING);
      
      // Show the install prompt
      const result = await deferredPrompt.prompt();
      
      // Wait for the user's response
      const { outcome } = result;
      
      if (outcome === 'accepted') {
        // Save installation data
        saveInstallData({
          installDate: new Date().toISOString(),
          installMethod: 'prompt'
        });
        
        // Track installation event for analytics
        if (window.gtag) {
          window.gtag('event', 'pwa_installed', {
            method: 'prompt',
            platform: navigator.platform
          });
        }
        
        return { success: true, message: 'Installation successful' };
      } else {
        setInstallState(INSTALL_STATES.CAN_INSTALL);
        return { success: false, message: 'Installation cancelled by user' };
      }
    } catch (error) {
      console.error('Error during PWA installation:', error);
      setInstallState(INSTALL_STATES.CAN_INSTALL);
      return { success: false, message: 'Installation failed', error };
    }
  }, [installState, isIOS, deferredPrompt, saveInstallData]);

  // Dismiss the install prompt
  const dismiss = useCallback(() => {
    const newPromptCount = promptCount + 1;
    setPromptCount(newPromptCount);
    
    saveInstallData({
      dismissed: true,
      promptCount: newPromptCount,
      lastPrompt: new Date().toISOString()
    });
    
    setInstallState(INSTALL_STATES.DISMISSED);
    
    // Track dismissal for analytics
    if (window.gtag) {
      window.gtag('event', 'pwa_install_dismissed', {
        prompt_count: newPromptCount
      });
    }
  }, [promptCount, saveInstallData]);

  // Reset installation state (for testing or re-prompting)
  const reset = useCallback(() => {
    saveInstallData({
      dismissed: false,
      installDate: null,
      installMethod: null,
      promptCount: 0,
      lastPrompt: null
    });
    
    if (isSupported() && !checkIsStandalone()) {
      setInstallState(INSTALL_STATES.CAN_INSTALL);
    } else {
      setInstallState(INSTALL_STATES.UNSUPPORTED);
    }
    
    setPromptCount(0);
  }, [isSupported, checkIsStandalone, saveInstallData]);

  // Check if we should show the prompt
  const shouldShowPrompt = useCallback(() => {
    if (process.env.NODE_ENV !== 'production') {
      return false;
    }
    
    if (installState !== INSTALL_STATES.CAN_INSTALL) {
      return false;
    }
    
    const installData = loadInstallData();
    
    // Don't show if dismissed
    if (installData.dismissed) {
      return false;
    }
    
    // Don't show if prompted too many times (max 3 times)
    if (installData.promptCount >= 3) {
      return false;
    }
    
    // Don't show if prompted recently (wait at least 7 days)
    if (installData.lastPrompt) {
      const lastPromptDate = new Date(installData.lastPrompt);
      const daysSinceLastPrompt = (Date.now() - lastPromptDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastPrompt < 7) {
        return false;
      }
    }
    
    return true;
  }, [installState, loadInstallData]);

  // Get installation instructions for iOS
  const getIOSInstallInstructions = useCallback(() => {
    return {
      steps: [
        'Tap the Share button in Safari',
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" to install the app'
      ],
      note: 'This will add Nudge to your home screen for easy access.'
    };
  }, []);

  // Set up event listeners
  useEffect(() => {
    initializeInstallState();
    
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Listen for appinstalled event
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => {
      setIsStandalone(mediaQuery.matches);
      if (mediaQuery.matches) {
        setInstallState(INSTALL_STATES.INSTALLED);
      }
    };
    
    mediaQuery.addEventListener('change', handleDisplayModeChange);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, [initializeInstallState, handleBeforeInstallPrompt, handleAppInstalled]);

  return {
    // State
    installState,
    isIOS,
    isStandalone,
    isSupported: isSupported(),
    promptCount,
    
    // Actions
    install,
    dismiss,
    reset,
    
    // Utilities
    shouldShowPrompt,
    getIOSInstallInstructions,
    
    // Event data
    deferredPrompt,
    installEvent
  };
};