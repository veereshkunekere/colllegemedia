import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function TrendingChips() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
    >
      <TouchableOpacity style={styles.activeChip}>
        <Ionicons
          name="flame"
          size={16}
          color="#d28cff"
        />

        <Text style={styles.activeText}>
          Trending
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.chip}>
        <Text style={styles.chipText}>
          Finals Week · 234 posts
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.chip}>
        <Text style={styles.chipText}>
          CS 301 · 89 posts
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.chip}>
        <Text style={styles.chipText}>
          Study Groups
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 26,
  },

  activeChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22112d",
    borderWidth: 1,
    borderColor: "#7026a3",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    marginRight: 12,
  },

  activeText: {
    color: "#d28cff",
    marginLeft: 8,
    fontWeight: "600",
  },

  chip: {
    backgroundColor: "#375371",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    marginRight: 12,
  },

  chipText: {
    color: "#d6d6d6",
    fontWeight: "500",
  },
});