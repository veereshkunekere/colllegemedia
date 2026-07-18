import React from 'react';
import buttonStyles from "../../styles/buttonStyles";
import { View, Text, Pressable } from 'react-native';
import { ActivityIndicator } from 'react-native';
export default function AppButton({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary'
  disabled = false,
  loading = false,
  style,
}) {
  const styles = buttonStyles;
  const variantStyle = variant === 'primary' ? styles.primary : styles.secondary;
  const textStyle = variant === 'primary' ? styles.text : styles.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.base, variantStyle, (disabled || loading) && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : undefined} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </Pressable>
  );
}
