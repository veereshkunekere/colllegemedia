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

export default function ResetOtpVerify() {
  const router = useRouter();

  const resetEmail = useAuthStore((state) => state.resetEmail);
  const verifyResetOtp = useAuthStore((state) => state.verifyResetOtp);
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const loading = useAuthStore((state) => state.loading);

  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }

    const result = await verifyResetOtp(otp);

    if (!result.success) {
      Alert.alert("Verification Failed", result.message);
      return;
    }

    router.push("/resetPassword");
  };

  const handleResend = async () => {
    if (!resetEmail) {
      Alert.alert(
        "Error",
        "Reset session lost. Please request a new OTP from the start."
      );
      router.push("/forgotPassword");
      return;
    }

    const result = await forgotPassword(resetEmail);

    if (!result.success) {
      Alert.alert("Request Failed", result.message);
      return;
    }

    Alert.alert("OTP Sent", "A new OTP has been sent to your email");
  };

  return (
    <Screen scroll keyboard>
      <AuthLayout>
        <AuthContainer>
          <AuthHeader
            title="Campus Media"
            subtitle={
              resetEmail
                ? `Enter the OTP sent to ${resetEmail}`
                : "Enter the OTP sent to your email"
            }
          />

          <AppInput
            placeholder="Reset OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />

          <AppButton
            title="Verify OTP"
            loading={loading}
            onPress={handleVerify}
          />

          <AuthFooter
            text="Didn't receive the OTP?"
            actionText="Resend OTP"
            onPress={handleResend}
          />
        </AuthContainer>
      </AuthLayout>
    </Screen>
  );
}