/**
 * App Environment Detection Utility
 * Detects the current app environment and provides environment-specific configurations
 */

// Environment types
export const ENVIRONMENT_TYPES = {
  BROWSER: 'browser',
  STANDALONE: 'standalone',
  IOS_STANDALONE: 'ios_standalone',
  ANDROID_STANDALONE: 'android_standalone',
  DESKTOP_PWA: 'desktop_pwa'
};

// Browser types
export const BROWSER_TYPES = {
  CHROME: 'chrome',
  FIREFOX: 'firefox',
  SAFARI: 'safari',
  EDGE: 'edge',
  OPERA: 'opera',
  UNKNOWN: 'unknown'
};

// Platform types
export const PLATFORM_TYPES = {
  IOS: 'ios',
  ANDROID: 'android',
  DESKTOP: 'desktop',
  UNKNOWN: 'unknown'
};

/**
 * Detects the current platform
 * @returns {string} Platform type
 */
export const detectPlatform = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return PLATFORM_TYPES.IOS;
  }
  
  if (/android/i.test(userAgent)) {
    return PLATFORM_TYPES.ANDROID;
  }
  
  return PLATFORM_TYPES.DESKTOP;
};

/**
 * Detects the current browser
 * @returns {string} Browser type
 */
export const detectBrowser = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    return BROWSER_TYPES.CHROME;
  }
  
  if (userAgent.includes('Firefox')) {
    return BROWSER_TYPES.FIREFOX;
  }
  
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return BROWSER_TYPES.SAFARI;
  }
  
  if (userAgent.includes('Edg')) {
    return BROWSER_TYPES.EDGE;
  }
  
  if (userAgent.includes('Opera')) {
    return BROWSER_TYPES.OPERA;
  }
  
  return BROWSER_TYPES.UNKNOWN;
};

/**
 * Checks if the app is running in standalone mode
 * @returns {boolean} True if in standalone mode
 */
export const isStandaloneMode = () => {
  // Check display-mode media query
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Check iOS standalone mode
  if (window.navigator.standalone === true) {
    return true;
  }
  
  // Check Android app mode
  if (document.referrer.includes('android-app://')) {
    return true;
  }
  
  // Check for PWA display modes
  if (window.matchMedia('(display-mode: minimal-ui)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches) {
    return true;
  }
  
  return false;
};

/**
 * Detects the current app environment
 * @returns {string} Environment type
 */
export const detectEnvironment = () => {
  const platform = detectPlatform();
  const isStandalone = isStandaloneMode();
  
  if (!isStandalone) {
    return ENVIRONMENT_TYPES.BROWSER;
  }
  
  switch (platform) {
    case PLATFORM_TYPES.IOS:
      return ENVIRONMENT_TYPES.IOS_STANDALONE;
    case PLATFORM_TYPES.ANDROID:
      return ENVIRONMENT_TYPES.ANDROID_STANDALONE;
    case PLATFORM_TYPES.DESKTOP:
      return ENVIRONMENT_TYPES.DESKTOP_PWA;
    default:
      return ENVIRONMENT_TYPES.STANDALONE;
  }
};

/**
 * Gets environment-specific configuration
 * @returns {Object} Environment configuration
 */
export const getEnvironmentConfig = () => {
  const environment = detectEnvironment();
  const platform = detectPlatform();
  const browser = detectBrowser();
  
  const baseConfig = {
    environment,
    platform,
    browser,
    isStandalone: isStandaloneMode(),
    supportsInstall: false,
    supportsNotifications: false,
    supportsOffline: true,
    prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
  };
  
  // Platform-specific configurations
  switch (platform) {
    case PLATFORM_TYPES.IOS:
      return {
        ...baseConfig,
        supportsInstall: true,
        supportsNotifications: false, // iOS PWA has limited notification support
        installMethod: 'manual',
        installInstructions: [
          'Tap the Share button in Safari',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to install the app'
        ]
      };
      
    case PLATFORM_TYPES.ANDROID:
      return {
        ...baseConfig,
        supportsInstall: true,
        supportsNotifications: true,
        installMethod: 'native',
        customUrlScheme: 'nudge://'
      };
      
    case PLATFORM_TYPES.DESKTOP:
      return {
        ...baseConfig,
        supportsInstall: browser !== BROWSER_TYPES.SAFARI,
        supportsNotifications: 'Notification' in window,
        installMethod: browser !== BROWSER_TYPES.SAFARI ? 'native' : 'manual'
      };
      
    default:
      return baseConfig;
  }
};

/**
 * Checks if the environment supports PWA installation
 * @returns {boolean} True if installation is supported
 */
export const supportsInstallation = () => {
  const config = getEnvironmentConfig();
  return config.supportsInstall;
};

/**
 * Gets the appropriate URL scheme for deep linking
 * @returns {string} URL scheme
 */
export const getDeepLinkScheme = () => {
  const config = getEnvironmentConfig();
  
  if (config.customUrlScheme) {
    return config.customUrlScheme;
  }
  
  // Fallback to web URL
  return window.location.origin;
};

/**
 * Generates a deep link for a specific path
 * @param {string} path - The path to deep link to
 * @returns {string} Deep link URL
 */
export const generateDeepLink = (path = '/') => {
  const scheme = getDeepLinkScheme();
  
  if (scheme.startsWith('http')) {
    return `${scheme}${path}`;
  }
  
  return `${scheme}${path}`;
};

/**
 * Checks if the app can switch to the installed version
 * @returns {boolean} True if switching is possible
 */
export const canSwitchToInstalled = () => {
  const config = getEnvironmentConfig();
  
  // Can't switch if already in standalone mode
  if (config.isStandalone) {
    return false;
  }
  
  // Can switch if custom URL scheme is available
  return !!config.customUrlScheme;
};

/**
 * Gets the switching delay for the current platform
 * @returns {number} Delay in milliseconds
 */
export const getSwitchingDelay = () => {
  const platform = detectPlatform();
  
  switch (platform) {
    case PLATFORM_TYPES.IOS:
      return 1500; // iOS needs more time for app switching
    case PLATFORM_TYPES.ANDROID:
      return 1000;
    default:
      return 500;
  }
};

/**
 * Checks if the current environment supports a specific feature
 * @param {string} feature - Feature to check
 * @returns {boolean} True if feature is supported
 */
export const supportsFeature = (feature) => {
  const config = getEnvironmentConfig();
  
  switch (feature) {
    case 'install':
      return config.supportsInstall;
    case 'notifications':
      return config.supportsNotifications;
    case 'offline':
      return config.supportsOffline;
    case 'deepLinking':
      return config.isStandalone || !!config.customUrlScheme;
    case 'customScheme':
      return !!config.customUrlScheme;
    default:
      return false;
  }
};

/**
 * Gets analytics data for the current environment
 * @returns {Object} Analytics data
 */
export const getAnalyticsData = () => {
  const config = getEnvironmentConfig();
  
  return {
    environment: config.environment,
    platform: config.platform,
    browser: config.browser,
    isStandalone: config.isStandalone,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    pixelRatio: window.devicePixelRatio || 1,
    language: navigator.language || 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    connection: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt
    } : null
  };
};

/**
 * Environment detection object with all utility functions
 */
export const appEnvironment = {
  detectPlatform,
  detectBrowser,
  isStandaloneMode,
  detectEnvironment,
  getEnvironmentConfig,
  supportsInstallation,
  getDeepLinkScheme,
  generateDeepLink,
  canSwitchToInstalled,
  getSwitchingDelay,
  supportsFeature,
  getAnalyticsData,
  // Constants
  ENVIRONMENT_TYPES,
  BROWSER_TYPES,
  PLATFORM_TYPES
};

export default appEnvironment;