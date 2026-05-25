import { Tabs,Redirect } from "expo-router";
import {useAuthStore} from "../../store/authStore"
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {CommentSheetProvider} from "../../contexts/CommentSheetProvider";
export default function TabsLayout() {
  const {user} = useAuthStore();
  if(!user){
    return <Redirect href="/login"/>
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CommentSheetProvider>
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="create"/>
      <Tabs.Screen name="profile" />
    </Tabs>
    </CommentSheetProvider>
    </GestureHandlerRootView>
  );
}