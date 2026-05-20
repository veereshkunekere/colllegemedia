import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../app/screens/HomeScreen";
import HubScreen from "../app/screens/HubScreen";
// import CreateScreen from "../screens/CreateScreen";
// import ProjectsScreen from "../screens/ProjectsScreen";
// import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#111827",
          borderTopWidth: 0,
          height: 70,
        },
        tabBarActiveTintColor: "#8B5CF6",
        tabBarInactiveTintColor: "#9CA3AF",
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Hub" component={HubScreen} />
      {/* <Tab.Screen name="Create" component={CreateScreen} />
      <Tab.Screen name="Projects" component={ProjectsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} /> */}
    </Tab.Navigator>
  );
}