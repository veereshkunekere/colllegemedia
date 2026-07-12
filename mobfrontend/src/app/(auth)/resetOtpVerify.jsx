import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

import { useState } from "react";

import { useRouter } from "expo-router";

import { useAuthStore } from "../../store/authStore";

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

    router.push("/(auth)/resetPassword");
  };

  const handleResend = async () => {
    if (!resetEmail) {
      Alert.alert(
        "Error",
        "Reset session lost. Please request a new OTP from the start."
      );
      router.push("/(auth)/forgotPassword");
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
    <View style={styles.container}>
      <Text style={styles.title}>Campus Media</Text>

      <Text style={styles.subtitle}>
        {resetEmail
          ? `Enter the OTP sent to ${resetEmail}`
          : "Enter the OTP sent to your email"}
      </Text>

      <TextInput
        placeholder="Reset OTP"
        placeholderTextColor="#777"
        value={otp}
        onChangeText={setOtp}
        autoCapitalize="none"
        keyboardType="number-pad"
        maxLength={6}
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify OTP</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResend} disabled={loading}>
        <Text style={styles.linkText}>Resend OTP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  title: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 10,
  },

  subtitle: {
    color: "#8e8e8e",
    fontSize: 16,
    marginBottom: 40,
  },

  input: {
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: "#fff",
    fontSize: 16,
    marginBottom: 18,
  },

  button: {
    backgroundColor: "#7c3aed",
    borderRadius: 16,
    paddingVertical: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  linkText: {
    color: "#a78bfa",
    textAlign: "center",
    marginTop: 28,
    fontSize: 15,
  },
});