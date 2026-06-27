import { Tabs, Redirect } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CommentSheetProvider } from "../../contexts/CommentSheetProvider";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CommentSheetProvider>
        <Tabs
          screenOptions={{
            // Custom "header" used purely as a notch/status-bar spacer.
            // Every tab screen now automatically renders BELOW the notch,
            // without each screen needing its own useSafeAreaInsets() call.
            // Change the backgroundColor here if a screen needs a different
            // status-bar-area color (e.g. dark screens) — see note below.
            headerShown: true,
            header: () => (
              <View
                style={{
                  height: insets.top,
                  backgroundColor: "#fff",
                }}
              />
            ),

            tabBarStyle: {
              height: 72,
              paddingTop: 8,
              paddingBottom: 10,
              backgroundColor: "#fff",
              borderTopWidth: 1,
              borderTopColor: "#EAEAEA",
            },

            tabBarActiveTintColor: "#7C3AED",
            tabBarInactiveTintColor: "#A9A9B2",

            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "500",
            },
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              title: "home",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home-outline" color={color} size={size} />
              ),
            }}
          />

          <Tabs.Screen
            name="chat"
            options={{
              title: "chat",
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  color={color}
                  size={size}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="create"
            options={{
              title: "create",
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name="add-circle-outline"
                  color={color}
                  size={size}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="search"
            options={{
              title: "search",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="search-outline" color={color} size={size} />
              ),
            }}
          />

          <Tabs.Screen
            name="profile"
            options={{
              title: "profile",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person-outline" color={color} size={size} />
              ),
            }}
          />

        </Tabs>
      </CommentSheetProvider>
    </GestureHandlerRootView>
  );
}