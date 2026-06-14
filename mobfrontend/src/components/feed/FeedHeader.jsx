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

      
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    paddingRight: 20,
    paddingLeft: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#645e5e",
    paddingBottom: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    color: "#203234",
    fontSize: 30,
    fontWeight: "bold",
    fontFamily:"poppins-regular"
  },

  subtitle: {
    color: "#8e8e8e",
    fontSize: 15,
    fontFamily:"poppins-regular"
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