import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { lightColors, darkColors } from '../constants/theme';

export function useTheme() {
  const systemTheme = useColorScheme();
  const { themeMode } = useThemeStore();

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemTheme === 'dark');

  const colors = isDark ? darkColors : lightColors;

  return {
    colors,
    isDark,
  };
}
