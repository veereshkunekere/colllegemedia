// src/styles/authStyles.js

import { StyleSheet } from "react-native";
import {
  Colors,
  Spacing,
  Radius,
  Shadows,
} from "../theme";

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  card: {
    backgroundColor: Colors.light.background,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    ...Shadows.card,
},

cardFlat: {
    backgroundColor: Colors.light.background,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
},

cardTransparent: {
    backgroundColor: "transparent",
    padding: Spacing.xl,
},
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.light.background,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: Spacing.xxl,
  },

  form: {
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },

  footer: {
    marginTop: Spacing.lg,
    alignItems: "center",
  },

  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.md,
    flexWrap: "wrap",
  },

  divider: {
    marginVertical: Spacing.lg,
  },

  pickerContainer: {
  backgroundColor: Colors.light.surface,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: Colors.light.border,
  marginBottom: Spacing.md,
  overflow: "hidden",
},

picker: {
  color: Colors.light.text,
  height: 54,
},
});