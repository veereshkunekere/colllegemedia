import { Tabs,Redirect } from "expo-router";
import {useAuthStore} from "../../store/authStore"
export default function TabsLayout() {
  const {user} = useAuthStore();
  if(!user){
    return <Redirect href="/login"/>
  }
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="message" />
      <Tabs.Screen name="create"/>
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}