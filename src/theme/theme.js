import {MD3LightTheme, MD3DarkTheme, configureFonts} from 'react-native-paper';
import colors from './color';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: '#FFFFFF',
    secondary: colors.secondary,
    onSecondary: '#FFFFFF',
    accent: colors.accent,
    background: colors.backgroundLight,
    onBackground: colors.textPrimary,
    surface: '#FFFFFF',
    onSurface: colors.textPrimary,
    error: colors.error,
    onError: '#FFFFFF',
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
    white: colors.white,
    black: colors.black,
    light_black: colors.light_black,
    light_gray: colors.light_gray,
  },
  fonts: configureFonts({
    default: {
      regular: {
        fontFamily: 'Poppins-Regular',
        fontWeight: 'normal',
      },
      medium: {
        fontFamily: 'Poppins-Medium',
        fontWeight: 'normal',
      },
      light: {
        fontFamily: 'Poppins-Light',
        fontWeight: 'normal',
      },
      thin: {
        fontFamily: 'Poppins-Thin',
        fontWeight: 'normal',
      },
    },
  }),
  roundness: 2,
  animation: {
    scale: 1.0,
  },
  dark: false,
  mode: 'adaptive',
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#BB86FC', // Adjusted Brand Color for Dark Mode
    onPrimary: '#000000',
    secondary: colors.secondary,
    onSecondary: '#000000',
    accent: colors.accent,
    background: colors.backgroundDark,
    onBackground: '#FFFFFF',
    surface: '#121212',
    onSurface: '#FFFFFF',
    error: colors.error,
    onError: '#000000',
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
    textPrimary: '#FFFFFF',
    textSecondary: colors.textSecondary,
    white: colors.white,
    black: colors.black,
    light_black: colors.light_black,
    light_gray: colors.light_gray,
  },
  fonts: configureFonts({
    default: {
      regular: {
        fontFamily: 'Poppins-Regular',
        fontWeight: 'normal',
      },
      medium: {
        fontFamily: 'Poppins-Medium',
        fontWeight: 'normal',
      },
      light: {
        fontFamily: 'Poppins-Light',
        fontWeight: 'normal',
      },
      thin: {
        fontFamily: 'Poppins-Thin',
        fontWeight: 'normal',
      },
    },
  }),
  roundness: 2,
  animation: {
    scale: 1.0,
  },
  dark: true,
  mode: 'adaptive',
};

export {lightTheme, darkTheme};
