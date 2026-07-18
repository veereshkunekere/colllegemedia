import { StyleSheet } from "react-native";
import {
  Colors,
  Radius,
  Spacing,
  Typography,
} from "../theme";

export default StyleSheet.create({
  label: {
    ...Typography.label,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },

  container: {
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    overflow: "hidden",
  },

  picker: {
    color: Colors.text,
    height: 56,
  },

  disabled: {
    opacity: 0.5,
  },

  error: {
    borderColor: "#e74c3c",
  },

  helper: {
    marginTop: Spacing.sm,
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  helperError: {
    color: "#e74c3c",
  },
});