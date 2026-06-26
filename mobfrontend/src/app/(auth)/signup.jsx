import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";

import { Picker }
from
"@react-native-picker/picker";

import { useState } from "react";

import { useRouter, useLocalSearchParams } from "expo-router";

import { useAuthStore } from "../../store/authStore";

export default function Signup() {
  const router = useRouter();

  const { token } = useLocalSearchParams();

  const signup = useAuthStore(
    (state) => state.signup
  );

  const loading = useAuthStore(
    (state) => state.loading
  );

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    department: "",
    batch: "",
    course: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSignup = async () => {
    const {
      username,
      email,
      password,
      role,
      department,
      batch,
      course,
    } = formData;

    if (
      !username ||
      !email ||
      !password ||
      !role ||
      !department ||
      !batch ||
      !course
    ) {
      Alert.alert(
        "Error",
        "All fields are required"
      );
      return;
    }

    const result = await signup({
      ...formData,
      token,
    });

    if (!result.success) {
        console.log("error");
      Alert.alert(
        "Signup Failed",
        result.message
      );
      return;
    }else{

      Alert.alert(
      "Success",
      "Account created successfully"
      );

    router.push({
     pathname: "/(auth)/emailVerify",
     params: { email: formData.email },
    });

    }

  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>
        Campus Media
      </Text>

      <Text style={styles.subtitle}>
        Create your account
      </Text>

      <TextInput
        placeholder="Username"
        placeholderTextColor="#777"
        value={formData.username}
        onChangeText={(text) =>
          handleChange("username", text)
        }
        style={styles.input}
      />

      <TextInput
        placeholder="College Email"
        placeholderTextColor="#777"
        value={formData.email}
        onChangeText={(text) =>
          handleChange("email", text)
        }
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#777"
        value={formData.password}
        onChangeText={(text) =>
          handleChange("password", text)
        }
        secureTextEntry
        style={styles.input}
      />
      
      <TextInput   placeholder="Batch (2026)"
        placeholderTextColor="#777"
        value={formData.batch}
        onChangeText={(text) =>
          handleChange("batch", text)
        }
        keyboardType="numeric"
        style={styles.input}
      />

      <View style={styles.pickerContainer}>
        <Picker
         selectedValue={formData.role}
  style={styles.picker}
  onValueChange={(value) =>
    handleChange("role", value)
  }
>
  <Picker.Item label="Student" value="student" />
  <Picker.Item label="Teacher" value="teacher" />
  <Picker.Item label="HOD" value="hod" />
  <Picker.Item label="Principal" value="principal" />
  <Picker.Item label="Alumini" value="alumini" />
</Picker>
      </View>

<View style={styles.pickerContainer}>
  <Picker
  selectedValue={formData.department}
   style={styles.picker}
  onValueChange={(value) =>
    handleChange("department", value)
  }
>
  <Picker.Item label="CSE" value="CSE" />
  <Picker.Item label="ECE" value="ECE" />
  <Picker.Item label="EEE" value="EEE" />
  <Picker.Item label="ME" value="ME" />
  <Picker.Item label="CE" value="CE" />
  <Picker.Item label="IT" value="IT" />
  <Picker.Item label="Other" value="Other" />
</Picker>
</View>

<View style={styles.pickerContainer}>
  <Picker
  selectedValue={formData.course}
   style={styles.picker}
  onValueChange={(value) =>
    handleChange("course", value)
  }
>
  <Picker.Item label="B.Tech" value="B.Tech" />
  <Picker.Item label="M.Tech" value="M.Tech" />
  <Picker.Item label="MBA" value="MBA" />
  <Picker.Item label="MCA" value="MCA" />
  <Picker.Item label="PhD" value="PhD" />
  <Picker.Item label="Other" value="Other" />
</Picker>
</View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            Sign Up
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          router.push("/login")
        }
      >
        <Text style={styles.linkText}>
          Already have an account?
          Login
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
    paddingHorizontal: 24,
    paddingTop: 80,
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
  pickerContainer: {
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 10,
  marginBottom: 15,
  justifyContent: "center",
  height: 55,
  paddingHorizontal: 10,
},

picker: {
  width: "100%",
  height: 55,
  color: "#333",
},
});