import { useState } from "react";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import AuthLayout from "../../styling/components/auth/AuthLayout";
import AuthContainer from "../../styling/components/auth/AuthContainer";
import AuthHeader from "../../styling/components/auth/AuthHeader";
import AuthFooter from "../../styling/components/auth/AuthFooter";

import Screen from "../../styling/components/ui/Screen";
import AppInput from "../../styling/components/ui/AppInput";
import AppButton from "../../styling/components/ui/AppButton";

import { useAuthStore } from "../../store/authStore";

export default function EmailVerify() {
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const loading = useAuthStore((state) => state.loading);

  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }

    const result = await verifyEmail(email, otp);

    if (!result.success) {
      Alert.alert("Verification Failed", result.message);
      return;
    }

    router.push("/home");
  };

  return (
    <Screen scroll keyboard>
      <AuthLayout>
        <AuthContainer>
          <AuthHeader
            title="Campus Media"
            subtitle={`Enter the OTP sent to ${email}`}
          />

          <AppInput
            placeholder="Verification OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />

          <AppButton
            title="Verify Email"
            loading={loading}
            onPress={handleVerify}
          />

          <AuthFooter
            text="Didn't receive the OTP?"
            actionText="Go Back"
            onPress={() => router.back()}
          />
        </AuthContainer>
      </AuthLayout>
    </Screen>
  );
}