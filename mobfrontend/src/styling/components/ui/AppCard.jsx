import React from 'react';
import { View } from 'react-native';
import cardStyles from "../../styles/cardStyles";

export default function AppCard({ children, variant = 'base', large = false, style }) {
  const styles = cardStyles;
  const variantStyle = variant === 'flat' ? styles.flat : styles.base;

  return (
    <View style={[variantStyle, large && styles.large, style]}>
      {children}
    </View>
  );
}
