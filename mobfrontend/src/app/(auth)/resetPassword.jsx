import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

import { useAuthStore } from "../../store/authStore";

import Screen from "../../styling/components/ui/Screen";
import AppInput from "../../styling/components/ui/AppInput";
import AppButton from "../../styling/components/ui/AppButton";

import AuthLayout from "../../styling/components/auth/AuthLayout";
import AuthContainer from "../../styling/components/auth/AuthContainer";
import AuthHeader from "../../styling/components/auth/AuthHeader";
import AuthFooter from "../../styling/components/auth/AuthFooter";

export default function ResetPassword() {
  const router = useRouter();

  const resetPassword = useAuthStore((state) => state.resetPassword);
  const loading = useAuthStore((state) => state.loading);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleReset = async () => {
    if (!newPassword || newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    const result = await resetPassword(newPassword);

    if (!result.success) {
      Alert.alert("Reset Failed", result.message);

      // A stale/used/expired reset token can't be recovered from here —
      // send the user back to request a fresh OTP.
      router.push("/forgotPassword");
      return;
    }

    Alert.alert("Success", "Password reset successfully. Please log in.");

    router.replace("/login");
  };

  return (
    <Screen scroll keyboard>
      <AuthLayout>
        <AuthContainer>
          <AuthHeader
            title="Campus Media"
            subtitle="Choose a new password"
          />

          <AppInput
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />

          <AppInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <AppButton
            title="Reset Password"
            loading={loading}
            onPress={handleReset}
          />

          <AuthFooter
            text="Back to"
            actionText="Login"
            onPress={() => router.push("/login")}
          />
        </AuthContainer>
      </AuthLayout>
    </Screen>
  );
}