import { Background } from "@react-navigation/elements";
import React from "react";
import { View, Text } from "react-native";

export default function Hub() {
  return (
    <View style={styles.container}>
      <Text>Hub Screen</Text>
    </View>
  );
}

const styles = {
  container: {
    BackgroundColor: "#e76d6d", 

  }
}