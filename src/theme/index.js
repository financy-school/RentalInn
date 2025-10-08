/**
 * RentalInn Theme System
 * Central export for all theme-related constants
 */

// Import all theme modules
import colors, * as Colors from './colors';
import layout from './layout';

// Re-export everything
export { colors, Colors, layout };

// Export individual modules for convenience
export * from './colors';
export * from './layout';

// Default export
export default {
  colors,
  layout,
};
