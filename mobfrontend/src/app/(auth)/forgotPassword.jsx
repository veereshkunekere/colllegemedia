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

    router.push("/(auth)/resetOtpVerify");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Campus Media</Text>

      <Text style={styles.subtitle}>
        Enter your email to receive a reset OTP
      </Text>

      <TextInput
        placeholder="College Email"
        placeholderTextColor="#777"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSendOtp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send OTP</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.linkText}>Back to Login</Text>
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