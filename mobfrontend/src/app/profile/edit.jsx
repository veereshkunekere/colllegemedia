import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";

import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { getProfile, updateProfile } from "../../services/profileService";

export default function EditProfile() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState(null); // { uri, name, type }
  const [previewUri, setPreviewUri] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const profile = await getProfile();
        setUsername(profile?.username || "");
        setBio(profile?.bio || "");
        setLink(profile?.links?.[0] || "");
        setPreviewUri(profile?.profilePicture || null);
      } catch (error) {
        console.log("error loading profile for edit", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow photo library access to change your profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      const filename = asset.uri.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      setImage({ uri: asset.uri, name: filename, type });
      setPreviewUri(asset.uri);
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert("Username required", "Please enter a username.");
      return;
    }

    try {
      setUpdating(true);
      await updateProfile({
        username: username.trim(),
        bio: bio.trim(),
        link: link.trim(),
        image,
      });
      router.back();
    } catch (error) {
      console.log("error updating profile", error);
      Alert.alert(
        "Update failed",
        error.response?.data?.message || "Please try again."
      );
    } finally {
      setUpdating(false);
    }
  };

  const initial = username?.charAt(0)?.toUpperCase() || "?";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#050505",marginTop: 40 }}
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: "#fff", fontSize: 16 }}>Cancel</Text>
        </Pressable>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
          Edit Profile
        </Text>
        <Pressable onPress={handleSave} disabled={updating || loading}>
          {updating ? (
            <ActivityIndicator color="#3897f0" size="small" />
          ) : (
            <Text
              style={{
                color: "#3897f0",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              Done
            </Text>
          )}
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* Avatar */}
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <Pressable onPress={pickImage}>
              <View
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  backgroundColor: "#262626",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {previewUri ? (
                  <Image
                    source={{ uri: previewUri }}
                    style={{ width: 96, height: 96 }}
                  />
                ) : (
                  <Text
                    style={{ color: "#fff", fontSize: 32, fontWeight: "700" }}
                  >
                    {initial}
                  </Text>
                )}
              </View>
              <Text
                style={{
                  color: "#3897f0",
                  textAlign: "center",
                  marginTop: 8,
                  fontWeight: "600",
                }}
              >
                Change photo
              </Text>
            </Pressable>
          </View>

          {/* Username */}
          <Field label="Username">
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="username"
              placeholderTextColor="#666"
              autoCapitalize="none"
              style={inputStyle}
            />
          </Field>

          {/* Bio */}
          <Field label="Bio">
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Tell people about yourself"
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
              style={[inputStyle, { height: 80, textAlignVertical: "top" }]}
            />
          </Field>

          {/* Link */}
          <Field label="Link">
            <TextInput
              value={link}
              onChangeText={setLink}
              placeholder="https://example.com"
              placeholderTextColor="#666"
              autoCapitalize="none"
              keyboardType="url"
              style={inputStyle}
            />
          </Field>
        </>
      )}
    </ScrollView>
  );
}

function Field({ label, children }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={{ color: "#a8a8a8", marginBottom: 6, fontSize: 13 }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

const inputStyle = {
  backgroundColor: "#1a1a1a",
  borderRadius: 8,
  paddingHorizontal: 14,
  paddingVertical: 10,
  color: "#fff",
  fontSize: 15,
  borderWidth: 1,
  borderColor: "#262626",
};