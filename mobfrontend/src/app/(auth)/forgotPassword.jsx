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

export default function ForgotPassword() {
  const router = useRouter();

  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const loading = useAuthStore((state) => state.loading);

  const [email, setEmail] = useState("");

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your college email");
      return;
    }

    const result = await forgotPassword(email);

    if (!result.success) {
      Alert.alert("Request Failed", result.message);
      return;
    }

    Alert.alert("OTP Sent", "Check your email for the reset OTP");

    router.push("/resetOtpVerify");
  };

  return (
    <Screen scroll keyboard>
      <AuthLayout>
        <AuthContainer>
          <AuthHeader
            title="Campus Media"
            subtitle="Enter your college email to receive a reset OTP"
          />

          <AppInput
            placeholder="College Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <AppButton
            title="Send OTP"
            loading={loading}
            onPress={handleSendOtp}
          />

          <AuthFooter
            text="Remember your password?"
            actionText="Login"
            onPress={() => router.push("/login")}
          />
        </AuthContainer>
      </AuthLayout>
    </Screen>
  );
}