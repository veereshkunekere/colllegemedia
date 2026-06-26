import React, {
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";

import * as ImagePicker
  from "expo-image-picker";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  usePostStore,
} from "../../store/postStore";

export default function Create() {
  const [
    content,
    setContent,
  ] = useState("");

  const [
    image,
    setImage,
  ] = useState(null);

  const [
    isAnonymous,
    setIsAnonymous,
  ] = useState(false);

  const createNewPost =
    usePostStore(
      (state) =>
        state.createNewPost
    );

  const createPostLoading =
    usePostStore(
      (state) =>
        state.createPostLoading
    );

  const pickImage =
    async () => {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (
        permission.status !==
        "granted"
      ) {
        Alert.alert(
          "Permission Required",
          "Allow gallery access"
        );

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync(
          {
            mediaTypes:
              ImagePicker.MediaTypeOptions.Images,

            allowsEditing:
              false,

            quality: 0.7,
          }
        );

      if (
        !result.canceled
      ) {
        setImage(
          result.assets[0]
            .uri
        );
      }
    };

  const handlePost =
    async () => {
      if (
        !content.trim()
      ) {
        Alert.alert(
          "Error",
          "Post content required"
        );

        return;
      }

      const formData =
        new FormData();

      formData.append(
        "content",
        content
      );

      formData.append(
        "isAnonymous",
        String(isAnonymous)
      );

      if (image) {
        formData.append(
          "images",
          {
            uri: image,

            name:
              "post.jpg",

            type:
              "image/jpeg",
          }
        );
      }

      const result =
        await createNewPost(
          formData
        );

      if (
        result.success
      ) {
        setContent("");
        setImage(null);
        setIsAnonymous(
          false
        );

        Alert.alert(
          "Success",
          "Post created"
        );
      } else {
        Alert.alert(
          "Error",
          "Failed to create post"
        );
      }
    };

  return (
  <View style={styles.container}>
    <Text style={styles.title}>Create Post</Text>

    <View style={styles.card}>
      <TextInput
        placeholder="What's happening on campus?"
        placeholderTextColor="#040404"
        multiline
        value={content}
        onChangeText={setContent}
        style={styles.input}
      />

      {image && (
        <Image
          source={{ uri: image }}
          style={styles.preview}
        />
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.imageBtn}
          onPress={pickImage}
        >
          <Ionicons
            name="image-outline"
            size={22}
            color="#7B61FF"
          />
          <Text style={styles.imageBtnText}>
            Add Photo
          </Text>
        </TouchableOpacity>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>
            Anonymous
          </Text>

          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
          />
        </View>
      </View>
    </View>

    <TouchableOpacity
      style={styles.postBtn}
      onPress={handlePost}
      disabled={createPostLoading}
    >
      {createPostLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          <Ionicons
            name="send"
            size={20}
            color="#fff"
          />
          <Text style={styles.postBtnText}>
            Publish Post
          </Text>
        </>
      )}
    </TouchableOpacity>
  </View>
);
}

const styles =StyleSheet.create({
   container: {
  flex: 1,
  backgroundColor: "#FAFAFA",
  paddingHorizontal: 18,
  paddingTop: 18,
},

title: {
  color: "#0f0e0e",
  fontSize: 28,
  fontWeight: "700",
  marginBottom: 20,
},

card: {
  backgroundColor: "#d0c9c9",
  borderRadius: 24,
  borderWidth:1,
  borderColor:"#0000",
  padding: 18,
},

input: {
  color: "#fff",
  fontSize: 17,
  minHeight: 180,
  textAlignVertical: "top",
},

preview: {
  width: "100%",
  height: 240,
  borderRadius: 18,
  marginTop: 18,
},

actionsRow: {
  marginTop: 18,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

imageBtn: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#e4dddd",
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: 14,
},

imageBtnText: {
  color: "#fff",
  marginLeft: 8,
  fontSize: 15,
  fontWeight: "600",
},

switchRow: {
  flexDirection: "row",
  alignItems: "center",
},

switchText: {
  color: "#fff",
  marginRight: 8,
  fontSize: 15,
},

postBtn: {
  backgroundColor: "#7B61FF",
  height: 56,
  borderRadius: 18,
  marginTop: 24,

  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
},

postBtnText: {
  color: "#fff",
  fontSize: 17,
  fontWeight: "700",
  marginLeft: 10,
},
  });