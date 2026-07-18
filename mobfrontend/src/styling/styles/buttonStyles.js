import { StyleSheet } from "react-native";
import {
    Colors,
    Radius,
    Spacing,
    Typography,
    Shadows,
} from "../theme";
// Consolidated from auth screens' `button`/`buttonText` and create.jsx's `postBtn`
export default StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.xl - 6, // ~18
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.accent,
  },
  primary: {
    backgroundColor: Colors.light.accent,
  },
  secondary: {
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...Typography.button,
    color: '#fff',
  },
  textSecondary: {
    ...Typography.button,
    color: Colors.light.text,
  },
});
