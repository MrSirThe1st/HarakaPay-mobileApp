// HarakaPay Color Scheme - School Payment App
export const colors = {
  // Primary Colors
  primary: '#3B82F6',        // Blue (main brand color)
  primaryLight: '#60A5FA',   // Lighter blue
  primaryDark: '#1E40AF',    // Darker blue
  
  // Secondary Colors
  secondary: '#1E40AF',      // Dark blue
  secondaryLight: '#3B82F6', // Lighter blue
  secondaryDark: '#1E3A8A',  // Darker blue
  
  // Background Colors
  background: '#3B82F6',     // Blue background
  surface: '#FFFFFF',        // White surface
  surfaceLight: '#F9FAFB',   // Light gray surface
  
  // Text Colors
  textPrimary: '#FFFFFF',    // White text
  textSecondary: '#E0E7FF',  // Light blue text
  textDark: '#1F2937',       // Dark text
  textMuted: '#6B7280',      // Muted text
  
  // Status Colors
  success: '#10B981',        // Green
  warning: '#F59E0B',        // Orange
  error: '#EF4444',          // Red
  info: '#3B82F6',           // Blue
  
  // Accent Colors
  accent: '#3B82F6',         // Same as primary
  accentLight: '#60A5FA',    // Lighter accent
  
  // Card Colors
  cardBackground: '#FFFFFF',
  cardBorder: '#E5E7EB',
  cardShadow: 'rgba(0, 0, 0, 0.1)',
  
  // Button Colors
  buttonPrimary: '#3B82F6',
  buttonSecondary: '#F3F4F6',
  buttonText: '#FFFFFF',
  buttonTextSecondary: '#3B82F6',
  
  // Avatar Colors
  avatarBackground: '#3B82F6',
  avatarText: '#FFFFFF',
  
  // Status Badge Colors
  statusActive: '#10B981',
  statusInactive: '#6B7280',
  statusPending: '#F59E0B',
  
  // Gradient Colors
  gradientStart: '#3B82F6',
  gradientEnd: '#1E40AF',
  
  // Shadow Colors
  shadowLight: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.2)',
  shadowDark: 'rgba(0, 0, 0, 0.3)',
};

// Typography
export const typography = {
  // Font Sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  
  // Font Weights
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  
  // Line Heights
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

// Border Radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
};
