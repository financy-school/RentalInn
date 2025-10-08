/**
 * RentalInn Design System
 * Centralized spacing, sizing, and layout constants
 */

// ============================================
// SPACING SCALE
// ============================================
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// ============================================
// BORDER RADIUS
// ============================================
export const RADIUS = {
  small: 10, // Small elements like badges
  medium: 14, // Medium cards, inputs
  large: 18, // Main cards, containers
  xlarge: 22, // Special elements
  round: 28, // Search bars, pills
  circle: 9999, // Circular elements
};

// ============================================
// SHADOW PRESETS
// ============================================
export const SHADOW = {
  // Light shadow for background elements
  light: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  // Medium shadow for standard cards
  medium: {
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  // Strong shadow for primary elements
  strong: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },

  // Prominent shadow for modals/overlays
  prominent: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
};

// ============================================
// FONT SIZES
// ============================================
export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  display: 32,
};

// ============================================
// FONT WEIGHTS
// ============================================
export const FONT_WEIGHT = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// ============================================
// PADDING PRESETS
// ============================================
export const PADDING = {
  small: 12,
  medium: 16,
  large: 18,
  xlarge: 20,
};

// ============================================
// ICON SIZES
// ============================================
export const ICON_SIZE = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ============================================
// COMPONENT HEIGHT
// ============================================
export const HEIGHT = {
  button: 44,
  input: 48,
  chip: 36,
  header: 60,
};

// ============================================
// BORDER WIDTH
// ============================================
export const BORDER_WIDTH = {
  thin: 1,
  medium: 1.5,
  thick: 2,
  accent: 5, // For left border accents
};

// ============================================
// Z-INDEX LAYERS
// ============================================
export const Z_INDEX = {
  background: 0,
  content: 1,
  sticky: 10,
  overlay: 100,
  modal: 1000,
  toast: 2000,
};

// ============================================
// BREAKPOINTS (for responsive design)
// ============================================
export const BREAKPOINTS = {
  small: 360,
  medium: 768,
  large: 1024,
  xlarge: 1280,
};

// ============================================
// ANIMATION DURATION
// ============================================
export const DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
};

export default {
  SPACING,
  RADIUS,
  SHADOW,
  FONT_SIZE,
  FONT_WEIGHT,
  PADDING,
  ICON_SIZE,
  HEIGHT,
  BORDER_WIDTH,
  Z_INDEX,
  BREAKPOINTS,
  DURATION,
};
