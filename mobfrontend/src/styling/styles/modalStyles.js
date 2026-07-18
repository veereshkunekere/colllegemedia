import { StyleSheet } from "react-native";
import {
    Colors,
    Radius,
    Spacing,
    Typography,
    Shadows,
} from "../theme";
// Consolidated from CommentSheetProvider.jsx + commentBottomSheet.jsx
export default StyleSheet.create({
  sheetBg: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.md,
    borderTopRightRadius: Radius.md,
  },
  handle: {
    backgroundColor: Colors.light.backgroundElement,
    width: 36,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.lg - 2,
    paddingVertical: Spacing.md,
    minHeight: 40,
    justifyContent: 'center',
  },
});
