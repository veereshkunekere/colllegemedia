import { StyleSheet } from "react-native";
import {
    Colors,
    Radius,
    Spacing,
    Typography,
    Shadows,
} from "../theme";
// Consolidated from home.jsx `cardWrapper`, chat.jsx `chatCard`, PostCard.jsx `card`
export default StyleSheet.create({
  base: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  flat: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  large: {
    ...Shadows.cardLarge,
  },
});
