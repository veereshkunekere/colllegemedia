// src/components/auth/AuthLayout.jsx

import React from "react";
import { View } from "react-native";
import authStyles from "../../styles/authStyles";

export default function AuthLayout({
  children,
  style,
}) {
  return (
    <View style={[authStyles.container, style]}>
      {children}
    </View>
  );
}