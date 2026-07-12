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
      router.push("/(auth)/forgotPassword");
      return;
    }

    Alert.alert("Success", "Password reset successfully. Please log in.");

    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Campus Media</Text>

      <Text style={styles.subtitle}>Choose a new password</Text>

      <TextInput
        placeholder="New Password"
        placeholderTextColor="#777"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={styles.input}
      />

      <TextInput
        placeholder="Confirm New Password"
        placeholderTextColor="#777"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleReset}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Reset Password</Text>
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