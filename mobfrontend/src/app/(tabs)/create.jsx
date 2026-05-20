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
    <View
      style={styles.container}
    >
      <Text
        style={styles.title}
      >
        Create Post
      </Text>

      <TextInput
        placeholder="What's happening on campus?"
        placeholderTextColor="#777"
        multiline
        value={content}
        onChangeText={
          setContent
        }
        style={styles.input}
      />

      {image && (
        <Image
          source={{
            uri: image,
          }}
          style={
            styles.preview
          }
        />
      )}

      <TouchableOpacity
        style={
          styles.imageBtn
        }
        onPress={
          pickImage
        }
      >
        <Ionicons
          name="image-outline"
          size={22}
          color="#fff"
        />

        <Text
          style={
            styles.imageBtnText
          }
        >
          Pick Image
        </Text>
      </TouchableOpacity>

      <View
        style={
          styles.switchRow
        }
      >
        <Text
          style={
            styles.switchText
          }
        >
          Post Anonymously
        </Text>

        <Switch
          value={
            isAnonymous
          }
          onValueChange={
            setIsAnonymous
          }
        />
      </View>

      <TouchableOpacity
        style={
          styles.postBtn
        }
        onPress={
          handlePost
        }
        disabled={
          createPostLoading
        }
      >
        {createPostLoading ? (
          <ActivityIndicator
            color="#fff"
          />
        ) : (
          <Text
            style={
              styles.postBtnText
            }
          >
            Post
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles =StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#050505",
      padding: 20,
    },

    title: {
      color: "#fff",
      fontSize: 28,
      fontWeight: "700",
      marginBottom: 24,
    },

    input: {
      backgroundColor:
        "#121212",
      borderRadius: 22,
      padding: 18,
      color: "#fff",
      minHeight: 180,
      fontSize: 18,
      textAlignVertical:
        "top",
    },

    preview: {
      width: "100%",
      height: 240,
      borderRadius: 20,
      marginTop: 20,
    },

    imageBtn: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 20,
    },

    imageBtnText: {
      color: "#fff",
      marginLeft: 10,
      fontSize: 16,
    },

    switchRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      marginTop: 30,
    },

    switchText: {
      color: "#fff",
      fontSize: 16,
    },

    postBtn: {
      backgroundColor:
        "#7c3aed",
      marginTop: 40,
      borderRadius: 18,
      paddingVertical: 18,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    postBtnText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "700",
    },
  });