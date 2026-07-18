import { StyleSheet } from "react-native";
import {
    Colors,
    Radius,
    Spacing,
    Typography,
    Shadows,
} from "../theme";
/**
 * Layout snippets with no single owning component — row, center, divider, etc.
 * These are colors-agnostic layout only; pull colors from theme where needed.
 */
export default StyleSheet.create({
  flex1: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  center: { justifyContent: 'center', alignItems: 'center' },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: Spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyStateText: {
    color: Colors.textMuted,
    fontSize: 16,
  },
  marginTop: (value) => ({ marginTop: value }),
  marginBottom: (value) => ({ marginBottom: value }),
  marginHorizontal: (value) => ({ marginHorizontal: value }),
  paddingTop: (value) => ({ paddingTop: value }),
  paddingBottom: (value) => ({ paddingBottom: value }),
  paddingHorizontal: (value) => ({ paddingHorizontal: value }),
});
