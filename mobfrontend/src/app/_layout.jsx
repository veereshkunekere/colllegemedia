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

import {
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";

import {GestureHandlerRootView} from "react-native-gesture-handler";

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

  useEffect(() => {
    checkAuth();
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
    <GestureHandlerRootView style={{ flex: 1 }} >
      <BottomSheetModalProvider>
        <Stack screenOptions={{headerShown: false,}}>
         <Stack.Screen name="(tabs)"/>
         <Stack.Screen name="(auth)"/>
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}