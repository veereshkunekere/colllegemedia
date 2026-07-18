import React from "react";
import { View, Text, Pressable } from "react-native";
import { Typography, Colors, Spacing } from "../../theme";

export default function AuthFooter({
  text,
  actionText,
  onPress,
  style,
}) {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginTop: Spacing.lg,
          flexWrap: "wrap",
        },
        style,
      ]}
    >
      <Text
        style={[
          Typography.body,
          {
            color: Colors.light.textSecondary,
          },
        ]}
      >
        {text}
      </Text>

      <Pressable
        onPress={onPress}
        android_ripple={{ color: Colors.light.border }}
      >
        <Text
          style={[
            Typography.body,
            {
              color: Colors.light.primary,
              fontWeight: "700",
              marginLeft: Spacing.xs,
            },
          ]}
        >
          {actionText}
        </Text>
      </Pressable>
    </View>
  );
}