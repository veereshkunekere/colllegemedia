import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import {
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";

import { Ionicons } from "@expo/vector-icons";

import { useCommentStore } from "../../store/commentStore";

import { formatTimeAgo } from "../../utils/formatTime";

export default function CommentsBottomSheet({
  onClose,
  post,
}) {
  const bottomSheetRef = useRef(null);

  const snapPoints = useMemo(
    () => ["85%"],
    []
  );

  const [commentText, setCommentText] =
    useState("");

  const comments = useCommentStore(
    (state) => state.comments
  );

  const loading = useCommentStore(
    (state) => state.loading
  );

  const loadComments = useCommentStore(
    (state) => state.loadComments
  );

  const createComment = useCommentStore(
    (state) => state.createComment
  );

  const handlePresent = () => {
    bottomSheetRef.current?.present();
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    const result = await createComment(
      post._id,
      commentText
    );

    if (result.success) {
      setCommentText("");
    }
  };

  useEffect(() => {
    if (post?._id) {
      handlePresent();
      loadComments(post._id);
    }
  }, [post?._id]);

  const renderItem = ({ item }) => (
    <View style={styles.commentRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.userId?.username?.[0]
            ?.toUpperCase()}
        </Text>
      </View>

      <View style={styles.commentContent}>
        <Text style={styles.commentText}>
          <Text style={styles.username}>
            {item.userId?.username}{" "}
          </Text>
          {item.content}
        </Text>

        <Text style={styles.time}>
          {formatTimeAgo(item.createdAt)}
        </Text>
      </View>
    </View>
  );

  return (
    <BottomSheetModal
  ref={bottomSheetRef}
  snapPoints={snapPoints}
  enablePanDownToClose
  keyboardBehavior="extend"
  android_keyboardInputMode="adjustResize"
  keyboardBlurBehavior="restore"
  onDismiss={onClose}
>
       <View style={styles.container}>
          <Text style={styles.title}>
            Comments
          </Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#7c3aed"
              style={{
                marginTop: 40,
              }}
            />
          ) : (
            <BottomSheetFlatList
               data={comments}
               keyExtractor={(item) => item._id}
               renderItem={renderItem}
               showsVerticalScrollIndicator={false}
               keyboardShouldPersistTaps="handled"
               style={{ flex: 1 }}
               contentContainerStyle={{
                 paddingBottom: 20,
               }}
               ListEmptyComponent={
                 <View style={styles.emptyContainer}>
                   <Text style={styles.emptyText}>
                     No comments yet
                   </Text>

                    <Text style={styles.emptySubtext}>
                     Start the conversation.
                     </Text>
                 </View>
              }
/>
          )}

          <View style={styles.inputWrapper}>
            <BottomSheetTextInput
              placeholder="Add a comment..."
              placeholderTextColor="#888"
              value={commentText}
              onChangeText={setCommentText}
              style={styles.input}
              multiline
            />

            <TouchableOpacity
              onPress={handleComment}
            >
              <Ionicons
                name="send"
                size={24}
                color={
                  commentText.trim()
                    ? "#7c3aed"
                    : "#555"
                }
              />
            </TouchableOpacity>
          </View>
        </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },

  container: {
  flex: 1,
  backgroundColor: "#111",
},

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },

  commentRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 18,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },

  avatarText: {
    color: "#fff",
    fontWeight: "700",
  },

  commentContent: {
    flex: 1,
  },

  username: {
    color: "#fff",
    fontWeight: "700",
  },

  commentText: {
    color: "#ddd",
    lineHeight: 22,
    fontSize: 15,
  },

  time: {
    color: "#888",
    fontSize: 12,
    marginTop: 6,
  },

  inputWrapper: {
  borderTopWidth: 1,
  borderTopColor: "#222",
  paddingHorizontal: 16,
  paddingVertical: 10,
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#111",
},

  input: {
    flex: 1,
    backgroundColor: "#1f1f1f",
    color: "#fff",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },

  emptyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  emptySubtext: {
    color: "#777",
    marginTop: 6,
  },
});