import React from 'react';
import { View } from 'react-native';
import { Colors,Spacing } from "@/theme";

export default function Divider({ style }) {
  return (
    <View
      style={[{ height: 1, backgroundColor: Colors.light.border, marginVertical: Spacing.small }, style]}
    />
  );
}
