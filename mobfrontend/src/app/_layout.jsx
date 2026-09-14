import {
  Stack,
} from "expo-router";

import {
  useEffect,
} from "react";

import {
  ActivityIndicator,
  View,
} from "react-native";

import {
  useAuthStore,
} from "../store/authStore";
import * as Notifications from "expo-notifications";

import {useNotificationToastStore} from "../store/notifiactionToast"; 
import NotificationToast from "../styling/components/notifications/NotificationToast";
import {setupNotificationNavigation,handleNotificationNavigation} from "../services/notificationNavigation";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const checkAuth =
    useAuthStore(
      (state) =>
        state.checkAuth
    );

  const isCheckingAuth =
    useAuthStore(
      (state) =>
        state.isCheckingAuth
    );

    const toastNotification =
        useNotificationToastStore(
            (state) => state.notification
        );

    const hideToast =
        useNotificationToastStore(
            (state) => state.hideToast
        );


  useEffect(() => {

    checkAuth();

    async function checkInitialNotification() {
    const response =
      await Notifications.getLastNotificationResponseAsync();

    if (!response) return;

    const data =
      response.notification.request.content.data;

    handleNotificationNavigation(data);
  }

  checkInitialNotification();
    const cleanup = setupNotificationNavigation();
    return cleanup;
  }, []);

  if (isCheckingAuth) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent:
            "center",
          alignItems:
            "center",
          backgroundColor:
            "#050505",
        }}
      >
        <ActivityIndicator
          size="large"
          color="#7c3aed"
        />
      </View>
    );
  }

  return (
        <SafeAreaProvider>
          <Stack screenOptions={{headerShown: false,}}>
         <Stack.Screen name="(tabs)"/>
         <Stack.Screen name="(auth)"/>
        </Stack>
        <NotificationToast
                    notification={
                        toastNotification
                    }
                    onHide={hideToast}
          />
        </SafeAreaProvider>
  );
}