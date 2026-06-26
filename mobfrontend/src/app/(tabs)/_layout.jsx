import { Tabs, Redirect } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CommentSheetProvider } from "../../contexts/CommentSheetProvider";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#7B61FF";
const INACTIVE = "#9CA3AF";

const TAB_ICONS = {
  home: { active: "home", inactive: "home-outline" },
  chat: { active: "chatbubble", inactive: "chatbubble-outline" },
  create: { active: "add-circle", inactive: "add-circle-outline" },
  search: { active: "search", inactive: "search-outline" },
  profile: { active: "person", inactive: "person-outline" },
};

function TabIcon({ routeName, focused }) {
  const icons = TAB_ICONS[routeName];
  if (!icons) return null;

  return (
    <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
      <Ionicons
        name={focused ? icons.active : icons.inactive}
        size={30}
        color={focused ? ACCENT : INACTIVE}
      />
    </View>
  );
}

function CreateTabIcon({ focused }) {
  return (
    <View style={styles.fabWrap}>
      <View style={[styles.fab, focused && styles.fabFocused]}>
        <Ionicons name="add" size={28} color="#FFF" />
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { user, isLoading } = useAuthStore();
  const insets = useSafeAreaInsets();

  if (isLoading) {
    return null; // or a splash/loading view
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  // Keep the bar clear of home-indicator / gesture areas on every device.
  const bottomOffset = Math.max(insets.bottom, 8);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CommentSheetProvider>
        <Tabs
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: [styles.tabBar, { bottom: bottomOffset }],
            tabBarItemStyle: styles.tabBarItem,
            tabBarIcon: ({ focused }) => (
              <TabIcon routeName={route.name} focused={focused} />
            ),
          })}
        >
          <Tabs.Screen name="home" />
          <Tabs.Screen name="chat" />

          <Tabs.Screen
  name="create"
  options={{
    tabBarStyle: {
      height: 60,
    },
    tabBarItemStyle: {
      justifyContent: "center",
      alignItems: "center",
    },
  }}
/>

          <Tabs.Screen name="search" />
          <Tabs.Screen name="profile" />
        </Tabs>
      </CommentSheetProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 22,
    right: 22,

    height: 60,
    borderRadius: 32,

    backgroundColor: "#FFFFFF",
    borderTopWidth: 0,

    // Let the FAB pop out above the bar instead of being clipped.
    overflow: "visible",

    flexDirection: "row",
      alignItems: "center",

  // Spread items evenly
  justifyContent: "space-around",

    paddingHorizontal: 4,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,

    elevation: 12,
  },

  tabBarItem: {
    flex: 1,
    height: "100%",
    
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  activeIconContainer: {
    backgroundColor: "#F3F0FF",
  },

  // Wrapper fills the tab item and centers the FAB without
  // relying on a negative margin to "lift" it.
  fabWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  fab: {
    width: 54,
    height: 54,
    borderRadius: 27,

    backgroundColor: ACCENT,

    justifyContent: "center",
    alignItems: "center",

    // Raises the button above the bar's top edge by roughly half its
    // own height, centered on that edge — works regardless of bar height.

    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,

    elevation: 15,

    ...Platform.select({
      android: {
        // Android elevation shadows are sometimes clipped by sibling
        // siblings drawing order; nudging zIndex keeps it on top.
        zIndex: 10,
      },
    }),
  },

  fabFocused: {
    backgroundColor: "#6A4FE0",
  },
});