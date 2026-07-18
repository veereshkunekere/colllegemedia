import { useState } from "react";
import { View, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter, useLocalSearchParams } from "expo-router";

import AuthLayout from "../../styling/components/auth/AuthLayout";
import AuthContainer from "../../styling/components/auth/AuthContainer";
import AuthHeader from "../../styling/components/auth/AuthHeader";
import AuthFooter from "../../styling/components/auth/AuthFooter";

import AppInput from "../../styling/components/ui/AppInput";
import AppButton from "../../styling/components/ui/AppButton";
import Screen from "../../styling/components/ui/Screen";

import authStyles from "../../styling/styles/authStyles";

import { useAuthStore } from "../../store/authStore";

export default function Signup() {
  const router = useRouter();
  const { token } = useLocalSearchParams();

  const signup = useAuthStore((state) => state.signup);
  const loading = useAuthStore((state) => state.loading);

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
    const { username, email, password, role, department, batch, course } =
      formData;

    if (!username || !email || !password || !role || !department || !batch || !course) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    const result = await signup({ ...formData, token });

    if (!result.success) {
      Alert.alert("Signup Failed", result.message);
      return;
    }

    Alert.alert("Success", "Account created successfully");

    router.push({
      pathname: "/(auth)/emailVerify",
      params: { email: formData.email },
    });
  };

  return (
    <Screen scroll keyboard>
      <AuthLayout>
        <AuthContainer>
          <AuthHeader
            title="Campus Media"
            subtitle="Create your account"
          />

          <AppInput
            placeholder="Username"
            value={formData.username}
            onChangeText={(text) => handleChange("username", text)}
          />

          <AppInput
            placeholder="College Email"
            value={formData.email}
            onChangeText={(text) => handleChange("email", text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <AppInput
            placeholder="Password"
            secureTextEntry
            value={formData.password}
            onChangeText={(text) => handleChange("password", text)}
          />

          <AppInput
            placeholder="Batch (2026)"
            keyboardType="numeric"
            value={formData.batch}
            onChangeText={(text) => handleChange("batch", text)}
          />

          <View style={authStyles.pickerContainer}>
            <Picker
              selectedValue={formData.role}
              style={authStyles.picker}
              onValueChange={(value) => handleChange("role", value)}
            >
              <Picker.Item label="Student" value="student" />
              <Picker.Item label="Teacher" value="teacher" />
              <Picker.Item label="HOD" value="hod" />
              <Picker.Item label="Principal" value="principal" />
              <Picker.Item label="Alumni" value="alumni" />
            </Picker>
          </View>

          <View style={authStyles.pickerContainer}>
            <Picker
              selectedValue={formData.department}
              style={authStyles.picker}
              onValueChange={(value) => handleChange("department", value)}
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

          <View style={authStyles.pickerContainer}>
            <Picker
              selectedValue={formData.course}
              style={authStyles.picker}
              onValueChange={(value) => handleChange("course", value)}
            >
              <Picker.Item label="B.Tech" value="B.Tech" />
              <Picker.Item label="M.Tech" value="M.Tech" />
              <Picker.Item label="MBA" value="MBA" />
              <Picker.Item label="MCA" value="MCA" />
              <Picker.Item label="PhD" value="PhD" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>

          <AppButton
            title="Sign Up"
            loading={loading}
            onPress={handleSignup}
          />

          <AuthFooter
            text="Already have an account?"
            actionText="Login"
            onPress={() => router.push("/login")}
          />
        </AuthContainer>
      </AuthLayout>
    </Screen>
  );
}