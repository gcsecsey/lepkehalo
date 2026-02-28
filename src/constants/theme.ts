/**
 * App theme constants
 * Colors and spacing values used throughout the app
 */

export const colors = {
  primary: '#007AFF',
  primaryDark: '#0056B3',

  background: '#f5f5f5',
  surface: '#ffffff',

  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#999999',
    inverse: '#ffffff',
  },

  error: '#ff3b30',
  success: '#34c759',
  warning: '#ff9500',

  border: '#e0e0e0',
  shadow: '#000000',

  scanner: {
    overlay: 'rgba(0, 0, 0, 0.6)',
    frame: '#007AFF',
    flash: '#ffcc00',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 28,
  round: 9999,
} as const;

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;
