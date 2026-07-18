import { View } from "react-native";
import React, { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

import Screen from "../../styling/components/ui/Screen";
import AppInput from "../../styling/components/ui/AppInput";
import AppButton from "../../styling/components/ui/AppButton";

import AuthLayout from "../../styling/components/auth/AuthLayout";
import AuthContainer from "../../styling/components/auth/AuthContainer";
import AuthHeader from "../../styling/components/auth/AuthHeader";
import AuthFooter from "../../styling/components/auth/AuthFooter";

import {
  useAuthStore,
} from "../../store/authStore";

export default function Login() {
  const router =
    useRouter();

  const login =
    useAuthStore(
      (state) =>
        state.login
    );

  const loading =
    useAuthStore(
      (state) =>
        state.loading
    );

  const [email, setEmail] =
    useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const handleLogin =
    async () => {
      if (
        !email ||
        !password
      ) {
        Alert.alert(
          "Error",
          "Please fill all fields"
        );

        return;
      }

      const result =
        await login(
          email,
          password
        );

      if (
        !result.success
      ) {
        Alert.alert(
          "Login Failed",
          result.message
        );

        return;
      }

      router.replace(
        "/home"
      );
    };

  return (
    <Screen
        scroll
        keyboard
    >
        <AuthLayout>

            <AuthContainer>

                <AuthHeader
                    title="Campus Media"
                    subtitle="Sign in to continue."
                />

                <AppInput
                    placeholder="College Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <AppInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <AppButton
                    title="Login"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loading}
                />

                <AuthFooter
                    text="Don't have an account?"
                    actionText="Register"
                    onPress={() =>
                        router.push("/signup")
                    }
                />

                <AuthFooter
                    text="Forgot your password?"
                    actionText="Reset"
                    onPress={() =>
                        router.push("/forgotPassword")
                    }
                />

            </AuthContainer>

        </AuthLayout>
    </Screen>
);
}
