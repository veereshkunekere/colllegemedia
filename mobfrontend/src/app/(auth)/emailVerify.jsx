import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

import {
  useState,
} from "react";

import {
  useRouter,
  useLocalSearchParams,
} from "expo-router";

import { getIdentityKeys } from "../../services/cryptoService";

import {
  useAuthStore,
} from "../../store/authStore";

export default function EmailVerify() {
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const {user} = useAuthStore();
  
  let done = false;

  const verifyEmail =
    useAuthStore(
      (state) =>
        state.verifyEmail
    );

  const loading =
    useAuthStore(
      (state) =>
        state.loading
    );

  const [otp, setOtp] = useState("");

  const handleVerify =
    async () => {
      if (
        !otp ||
        otp.length !== 6
      ) {
        Alert.alert(
          "Error",
          "Please enter a valid 6-digit OTP"
        );

        return;
      }

      const result = await verifyEmail(email, otp);

      if (
        !result.success
      ) {
        Alert.alert(
          "Login Failed",
          result.message
        );

        done=true;
        return;
      }

      // on success navigate to home
      router.push('/home');
      }

  return (
    <View
      style={styles.container}
    >
      <Text
        style={styles.title}
      >
        Campus Media
      </Text>

      <TextInput
        placeholder="Verification OTP"
        placeholderTextColor="#777"
        value={otp}
        onChangeText={
          setOtp
        }
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TouchableOpacity
        style={
          styles.button
        }
        onPress={
          handleVerify
        }
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator
            color="#fff"
          />
        ) : (
          <Text
            style={
              styles.buttonText
            }
          >
            Verify
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

}
const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#050505",
      justifyContent:
        "center",
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
      backgroundColor:
        "#121212",
      borderWidth: 1,
      borderColor:
        "#222",
      borderRadius: 16,
      paddingHorizontal: 18,
      paddingVertical: 16,
      color: "#fff",
      fontSize: 16,
      marginBottom: 18,
    },

    button: {
      backgroundColor:
        "#7c3aed",
      borderRadius: 16,
      paddingVertical: 18,
      justifyContent:
        "center",
      alignItems:
        "center",
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