import React from "react";
import { View, Text } from "react-native";

import authStyles from "../../styles/authStyles";
import { Typography, Colors, Spacing } from "../../theme";

export default function AuthHeader({
  title,
  subtitle,
  children,
}) {
  return (
    <View
      style={{
        marginBottom: Spacing.xl,
        alignItems: "center",
      }}
    >
      <Text
        style={[
          Typography.h1,
          {
            color: Colors.light.accent,
            textAlign: "center",
          },
        ]}
      >
        {title}
      </Text>

      {subtitle ? (
        <Text
          style={[
            Typography.body,
            {
              color: Colors.light.textSecondary,
              marginTop: Spacing.sm,
              textAlign: "center",
            },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}

      {children}
    </View>
  );
}