import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from './use-theme';

/**
 * const styles = useStyles((colors) => ({
 *   card: { backgroundColor: colors.surface, borderColor: colors.border },
 * }));
 */
export function useStyles<T extends StyleSheet.NamedStyles<T>>(
  styleFn: (colors: ReturnType<typeof useTheme>) => T
) {
  const colors = useTheme();
  return useMemo(() => StyleSheet.create(styleFn(colors)), [colors, styleFn]);
}
