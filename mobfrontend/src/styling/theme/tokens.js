import { Platform } from 'react-native';

/**
 * Colors
 * Consolidated from every screen's inline StyleSheet.
 * NOTE: the app currently mixes two accent purples (#7c3aed in auth/chat,
 * #7B61FF in home/create/PostCard). Picked #7c3aed as the single accent —
 * update CREATE/POST_CARD usages to match once screens are migrated.
 */


// Status/semantic colors used across chat badges, post badges, buttons
export const Semantic = {
  danger: '#e74c3c',
  success: '#2ecc71',
  info: '#3897f0',
};





export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
