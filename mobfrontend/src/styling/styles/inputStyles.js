import { StyleSheet } from "react-native";
import {
    Colors,
    Radius,
    Spacing,
    Typography,
    Shadows,
} from "../theme";
// Consolidated from the identical `input` block repeated in all 6 auth screens
export default StyleSheet.create({
  base: {
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl - 6, // ~18
    paddingVertical: Spacing.lg,
    color: Colors.text,
    fontSize: 16,
  },
  focused: {
    borderColor: Colors.accent,
  },
  error: {
    borderColor: '#e74c3c',
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
});
