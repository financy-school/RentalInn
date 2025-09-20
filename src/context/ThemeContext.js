import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import { StatusBar, Platform } from 'react-native';

// Theme type definitions
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// Create theme context with default values
const ThemeContext = createContext({
  theme: THEME_MODES.LIGHT,
  isDarkMode: false,
  toggleTheme: () => {},
  setTheme: () => {},
  themeMode: THEME_MODES.LIGHT,
  isSystemTheme: false,
  loading: true,
});

// Theme configuration object
const THEME_CONFIG = {
  [THEME_MODES.LIGHT]: {
    statusBarStyle: 'dark-content',
    statusBarBackgroundColor: '#ffffff',
  },
  [THEME_MODES.DARK]: {
    statusBarStyle: 'light-content',
    statusBarBackgroundColor: '#000000',
  },
};

export const ThemeProvider = ({ children }) => {
  // Force theme to always be light
  const [themeMode] = useState(THEME_MODES.LIGHT);
  const [loading, setLoading] = useState(false); // No loading needed since theme is fixed

  // Always use light theme
  const currentTheme = useMemo(() => {
    return THEME_MODES.LIGHT;
  }, []);

  const isDarkMode = useMemo(() => {
    return false; // Always light mode
  }, []);

  const isSystemTheme = useMemo(() => {
    return false; // Never using system theme
  }, []);

  // Load saved theme preference - simplified since we always use light theme
  const loadThemePreference = useCallback(async () => {
    try {
      setLoading(true);
      // Always set to light theme regardless of saved preference
      // No need to load or save theme preferences
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set theme programmatically - no-op since theme is fixed
  const setTheme = useCallback(async () => {
    // No-op: theme is always light, cannot be changed
    console.warn('Theme switching is disabled - always using light theme');
  }, []);

  // Toggle between light and dark themes - no-op since theme is fixed
  const toggleTheme = useCallback(async () => {
    // No-op: theme is always light, cannot be toggled
    console.warn('Theme toggling is disabled - always using light theme');
  }, []);

  // Update status bar - always use light theme config
  const updateStatusBar = useCallback(() => {
    const config = THEME_CONFIG[THEME_MODES.LIGHT]; // Always use light theme config
    if (config) {
      StatusBar.setBarStyle(config.statusBarStyle, true);

      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(config.statusBarBackgroundColor, true);
      }
    }
  }, []);

  // Initialize theme on component mount - simplified
  useEffect(() => {
    loadThemePreference();
  }, [loadThemePreference]);

  // Update status bar when component mounts
  useEffect(() => {
    updateStatusBar();
  }, [updateStatusBar]);

  // Context value with memoization for performance
  const contextValue = useMemo(
    () => ({
      theme: currentTheme,
      isDarkMode,
      themeMode,
      isSystemTheme,
      loading,
      toggleTheme,
      setTheme,
      systemTheme: THEME_MODES.LIGHT, // Always light
      availableThemes: [THEME_MODES.LIGHT], // Only light theme available
    }),
    [
      currentTheme,
      isDarkMode,
      themeMode,
      isSystemTheme,
      loading,
      toggleTheme,
      setTheme,
    ],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

// HOC for theme-aware components
export const withTheme = Component => {
  const ThemedComponent = props => {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };

  ThemedComponent.displayName = `withTheme(${
    Component.displayName || Component.name
  })`;
  return ThemedComponent;
};

export { ThemeContext };
export default ThemeProvider;
