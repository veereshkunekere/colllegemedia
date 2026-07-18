// src/components/auth/AuthContainer.jsx

import React from "react";
import { View } from "react-native";

import authStyles from "../../styles/authStyles";

export default function AuthContainer({
  children,
  style,
}) {
  return (
    <View
      style={[
        authStyles.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}