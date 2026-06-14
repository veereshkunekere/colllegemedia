import { Tabs, Redirect } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CommentSheetProvider } from "../../contexts/CommentSheetProvider";

import {
  House,
  MessageCircle,
  PlusSquare,
  User,
  Search,
} from "lucide-react-native";

export default function TabsLayout() {
  const { user } = useAuthStore();

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CommentSheetProvider>
        <Tabs
          screenOptions={{
            headerShown: false,

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
                <House color={color} size={size} />
              ),
            }}
          />

          <Tabs.Screen
            name="chat"
            options={{
              title: "chat",
              tabBarIcon: ({ color, size }) => (
                <MessageCircle color={color} size={size} />
              ),
            }}
          />

          <Tabs.Screen
            name="create"
            options={{
              title: "create",
              tabBarIcon: ({ color, size }) => (
                <PlusSquare color={color} size={size} />
              ),
            }}
          />

          <Tabs.Screen
            name="search"
            options={{
              title: "search",
              tabBarIcon: ({ color, size }) => (
                <Search color={color} size={size} />
              ),
            }}
          />

          <Tabs.Screen
            name="profile"
            options={{
              title: "profile",
              tabBarIcon: ({ color, size }) => (
                <User color={color} size={size} />
              ),
            }}
          />

        </Tabs>
      </CommentSheetProvider>
    </GestureHandlerRootView>
  );
}