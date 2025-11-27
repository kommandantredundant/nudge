import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing app theme (light/dark/auto)
 * Syncs with system preferences and persists user selection
 */
export const useTheme = (initialTheme = 'auto') => {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [themePreference, setThemePreference] = useState(initialTheme);

  // Apply theme to DOM and state
  const applyTheme = useCallback((theme) => {
    let effectiveTheme = theme || 'auto';

    if (effectiveTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = prefersDark ? 'dark' : 'light';
    }

    setCurrentTheme(effectiveTheme);

    // Apply theme to document for CSS selectors if needed
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Update theme preference and apply it
  const updateTheme = useCallback((newTheme) => {
    setThemePreference(newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    applyTheme(themePreference);

    if (themePreference === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleThemeChange = () => applyTheme('auto');
      mediaQuery.addEventListener('change', handleThemeChange);

      return () => {
        mediaQuery.removeEventListener('change', handleThemeChange);
      };
    }
  }, [themePreference, applyTheme]);

  return {
    currentTheme,
    themePreference,
    updateTheme,
    applyTheme,
    isDark: currentTheme === 'dark'
  };
};

export default useTheme;
