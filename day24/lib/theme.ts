export const colors = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F9',
    border: '#E2E8F0',
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    primary: '#6366F1',
    primaryLight: '#EEF2FF',
    primaryDark: '#4F46E5',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    accent: '#8B5CF6',
    cardShadow: 'rgba(15, 23, 42, 0.08)',
    tabBar: '#FFFFFF',
    overlay: 'rgba(15, 23, 42, 0.5)',
  },
  dark: {
    background: '#0B0F1A',
    surface: '#151B2B',
    surfaceSecondary: '#1E2640',
    border: '#2A3454',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    primary: '#818CF8',
    primaryLight: '#1E1B4B',
    primaryDark: '#6366F1',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    accent: '#A78BFA',
    cardShadow: 'rgba(0, 0, 0, 0.4)',
    tabBar: '#151B2B',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  small: { fontSize: 11, fontWeight: '500' as const, lineHeight: 14 },
};

export type ThemeColors = typeof colors.light;
