import { Slot, Stack,Redirect } from "expo-router";
import {useAuthStore} from "../../store/authStore"
export default function AuthLayout() {
 
  return (
   <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" />
    </Stack>
  );
}