import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import NotificationBell from "../../components/notifications/NotificationBell";
import { useNotificationStore } from "../../../store/notificationStore";
export default function FeedHeader() {
  const router = useRouter();
  const unreadCount = useNotificationStore(
    (state) => state.unreadCount
  );
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.logo}>
          ColllegeMedia
        </Text>
      </View>

      <NotificationBell
        onPress={() =>
          router.push("/notifications")
        }
      >
        <Ionicons name="notifications-outline" size={26} color="#203234" />
       
      </NotificationBell>

     
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },

  logo: {
    color: "#100f0f",
    fontSize: 30,
    fontWeight:"700"
  },

  
  rightIcons: {
    flexDirection: "row",
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,

    elevation: 2,
  },
});