// Professional Slate & Blue palette for an 'Ultra Pro Max' feel
export const lightColors = {
  primary: '#2563EB', // Modern Blue 600
  primaryLight: '#60A5FA', // Blue 400
  primaryDark: '#1E40AF', // Blue 800
  secondary: '#64748B', // Slate 500
  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF', // White
  surfaceLight: '#F1F5F9', // Slate 100
  text: '#0F172A', // Slate 900
  textMuted: '#64748B', // Slate 500
  success: '#10B981', // Emerald 500
  danger: '#EF4444', // Red 500
  warning: '#F59E0B', // Amber 500
  border: '#E2E8F0', // Slate 200
  cardGradient: ['#FFFFFF', '#F8FAFC'],
};

export const darkColors = {
  primary: '#3B82F6', // Blue 500
  primaryLight: '#93C5FD', // Blue 300
  primaryDark: '#2563EB', // Blue 600
  secondary: '#94A3B8', // Slate 400
  background: '#020617', // Slate 950 (Very deep blue black)
  surface: '#0F172A', // Slate 900
  surfaceLight: '#1E293B', // Slate 800
  text: '#F8FAFC', // Slate 50
  textMuted: '#94A3B8', // Slate 400
  success: '#34D399', // Emerald 400
  danger: '#F87171', // Red 400
  warning: '#FBBF24', // Amber 400
  border: '#1E293B', // Slate 800
  cardGradient: ['#0F172A', '#020617'],
};

export const theme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
    h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.5 },
    h3: { fontSize: 20, fontWeight: '600' as const },
    body: { fontSize: 16, fontWeight: '400' as const, letterSpacing: 0.2 },
    caption: { fontSize: 14, fontWeight: '500' as const, letterSpacing: 0.1 },
    small: { fontSize: 12, fontWeight: '400' as const },
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 5,
    },
  }
};
