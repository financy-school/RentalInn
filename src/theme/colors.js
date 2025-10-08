/**
 * RentalInn Color Palette
 * Centralized color system for consistent theming across the app
 */

// ============================================
// PRIMARY BRAND COLORS
// ============================================
export const PRIMARY = '#001C68'; // Deep Navy
export const SECONDARY = '#EE7B11'; // Orange
export const ACCENT = '#F9FAFB'; // Light Gray

// ============================================
// BACKGROUND COLORS
// ============================================
export const BACKGROUND = '#f8f9fa'; // Main app background
export const BACKGROUND_LIGHT = '#FFFFFF'; // Light surfaces
export const BACKGROUND_DARK = '#0B1220'; // Dark mode background
export const CARD_BACKGROUND = 'rgba(255, 255, 255, 0.98)'; // Card surfaces

// ============================================
// TEXT COLORS
// ============================================
export const TEXT_PRIMARY = '#212529'; // Main text
export const TEXT_SECONDARY = '#6C757D'; // Secondary text
export const TEXT_LIGHT = '#FFFFFF'; // Light text
export const TEXT_DARK = '#000000'; // Dark text

// ============================================
// STATUS COLORS
// ============================================
export const SUCCESS = '#28A745'; // Success state
export const ERROR = '#DC3545'; // Error state
export const WARNING = '#FFC107'; // Warning state
export const INFO = '#17A2B8'; // Info state

// ============================================
// NEUTRAL COLORS
// ============================================
export const WHITE = '#FFFFFF';
export const BLACK = '#000000';
export const GRAY_LIGHT = '#A0A0A0';
export const GRAY_DARK = '#343A40';

// ============================================
// BORDER COLORS (with opacity)
// ============================================
export const BORDER_LIGHT = 'rgba(238, 123, 17, 0.06)';
export const BORDER_STANDARD = 'rgba(238, 123, 17, 0.08)';
export const BORDER_MEDIUM = 'rgba(238, 123, 17, 0.10)';
export const BORDER_EMPHASIS = 'rgba(238, 123, 17, 0.15)';

// ============================================
// SHADOW COLORS
// ============================================
export const SHADOW_PRIMARY = PRIMARY; // Use primary color for shadows
export const SHADOW_DARK = '#000000';

// ============================================
// OPACITY VALUES
// ============================================
export const OPACITY_LIGHT = 0.06;
export const OPACITY_STANDARD = 0.08;
export const OPACITY_MEDIUM = 0.1;
export const OPACITY_EMPHASIS = 0.15;
export const OPACITY_CARD = 0.98;
export const OPACITY_OVERLAY = 0.95;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert hex color to rgba with custom opacity
 * @param {string} hex - Hex color code
 * @param {number} alpha - Opacity value (0-1)
 * @returns {string} - RGBA color string
 */
export const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Get color with specific opacity
 * @param {string} color - Base color
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} - RGBA color string
 */
export const withOpacity = (color, opacity) => hexToRgba(color, opacity);

// ============================================
// THEME OBJECT (for backward compatibility)
// ============================================
const colors = {
  // Brand
  primary: PRIMARY,
  secondary: SECONDARY,
  accent: ACCENT,

  // Backgrounds
  background: BACKGROUND,
  backgroundLight: BACKGROUND_LIGHT,
  backgroundDark: BACKGROUND_DARK,
  cardBackground: CARD_BACKGROUND,

  // Text
  textPrimary: TEXT_PRIMARY,
  textSecondary: TEXT_SECONDARY,
  textLight: TEXT_LIGHT,
  textDark: TEXT_DARK,

  // Status
  success: SUCCESS,
  error: ERROR,
  warning: WARNING,
  info: INFO,

  // Neutrals
  white: WHITE,
  black: BLACK,
  light_gray: GRAY_LIGHT,
  light_black: GRAY_DARK,

  // Borders
  borderLight: BORDER_LIGHT,
  borderStandard: BORDER_STANDARD,
  borderMedium: BORDER_MEDIUM,
  borderEmphasis: BORDER_EMPHASIS,

  // Legacy support
  onPrimary: TEXT_LIGHT,
  onBackground: TEXT_PRIMARY,
  onSurface: TEXT_PRIMARY,
};

export default colors;
