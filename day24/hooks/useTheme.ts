import { useColorScheme as useRNColorScheme } from 'react-native';

import { colors, ThemeColors } from '@/lib/theme';

export function useTheme(): { colors: ThemeColors; isDark: boolean } {
  const scheme = useRNColorScheme();
  const isDark = scheme === 'dark';
  return {
    colors: isDark ? colors.dark : colors.light,
    isDark,
  };
}
