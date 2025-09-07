import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import { Appearance, StatusBar, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../navigation/constants';

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
  const [themeMode, setThemeMode] = useState(THEME_MODES.LIGHT);
  const [systemTheme, setSystemTheme] = useState(THEME_MODES.LIGHT);
  const [loading, setLoading] = useState(true);

  // Computed theme based on mode and system preference
  const currentTheme = useMemo(() => {
    return themeMode === THEME_MODES.SYSTEM ? systemTheme : themeMode;
  }, [themeMode, systemTheme]);

  const isDarkMode = useMemo(() => {
    return currentTheme === THEME_MODES.DARK;
  }, [currentTheme]);

  const isSystemTheme = useMemo(() => {
    return themeMode === THEME_MODES.SYSTEM;
  }, [themeMode]);

  // Load saved theme preference
  const loadThemePreference = useCallback(async () => {
    try {
      setLoading(true);

      const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
      const systemColorScheme =
        Appearance.getColorScheme() || THEME_MODES.LIGHT;

      setSystemTheme(systemColorScheme);

      if (savedTheme && Object.values(THEME_MODES).includes(savedTheme)) {
        setThemeMode(savedTheme);
      } else {
        // Default to system theme for first-time users
        setThemeMode(THEME_MODES.SYSTEM);
        await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, THEME_MODES.SYSTEM);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      setThemeMode(THEME_MODES.LIGHT);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save theme preference
  const saveThemePreference = useCallback(async theme => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, theme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, []);

  // Set theme programmatically
  const setTheme = useCallback(
    async theme => {
      if (!Object.values(THEME_MODES).includes(theme)) {
        console.warn(`Invalid theme mode: ${theme}`);
        return;
      }

      setThemeMode(theme);
      await saveThemePreference(theme);
    },
    [saveThemePreference],
  );

  // Toggle between light and dark themes
  const toggleTheme = useCallback(async () => {
    const newTheme =
      currentTheme === THEME_MODES.LIGHT ? THEME_MODES.DARK : THEME_MODES.LIGHT;

    await setTheme(newTheme);
  }, [currentTheme, setTheme]);

  // Handle system theme changes
  const handleSystemThemeChange = useCallback(preferences => {
    const newSystemTheme = preferences.colorScheme || THEME_MODES.LIGHT;
    setSystemTheme(newSystemTheme);

    if (__DEV__) {
      console.log('System theme changed to:', newSystemTheme);
    }
  }, []);

  // Update status bar when theme changes
  const updateStatusBar = useCallback(() => {
    const config = THEME_CONFIG[currentTheme];
    if (config) {
      StatusBar.setBarStyle(config.statusBarStyle, true);

      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(config.statusBarBackgroundColor, true);
      }
    }
  }, [currentTheme]);

  // Initialize theme on component mount
  useEffect(() => {
    loadThemePreference();
  }, [loadThemePreference]);

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(handleSystemThemeChange);

    return () => subscription?.remove();
  }, [handleSystemThemeChange]);

  // Update status bar when theme changes
  useEffect(() => {
    if (!loading) {
      updateStatusBar();
    }
  }, [currentTheme, loading, updateStatusBar]);

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
      systemTheme,
      availableThemes: Object.values(THEME_MODES),
    }),
    [
      currentTheme,
      isDarkMode,
      themeMode,
      isSystemTheme,
      loading,
      toggleTheme,
      setTheme,
      systemTheme,
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
