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
} from "expo-router";

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
    <View
      style={styles.container}
    >
      <Text
        style={styles.title}
      >
        Campus Media
      </Text>

      <Text
        style={
          styles.subtitle
        }
      >
        Login to continue
      </Text>

      <TextInput
        placeholder="College Email"
        placeholderTextColor="#777"
        value={email}
        onChangeText={
          setEmail
        }
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#777"
        value={password}
        onChangeText={
          setPassword
        }
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity
        style={
          styles.button
        }
        onPress={
          handleLogin
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
            Login
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          router.push(
            "/signup"
          )
        }
      >
        <Text
          style={
            styles.linkText
          }
        >
          Don’t have an
          account? Sign Up
        </Text>
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