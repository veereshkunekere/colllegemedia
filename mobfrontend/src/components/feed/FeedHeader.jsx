import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function FeedHeader() {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.logo}>
          CollegeMedia
        </Text>

        <Text style={styles.subtitle}>
          Your campus community
        </Text>
      </View>

      <View style={styles.onlineBox}>
        <View style={styles.onlineDot} />

        <Text style={styles.onlineText}>
          1.2k online
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 26,
  },

  logo: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#8e8e8e",
    fontSize: 16,
    marginTop: 6,
  },

  onlineBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151515",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },

  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: "#00ff95",
    marginRight: 8,
  },

  onlineText: {
    color: "#fff",
    fontWeight: "600",
  },
});