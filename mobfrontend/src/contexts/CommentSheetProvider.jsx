import { createContext, useContext, useMemo, useRef, useState, useCallback } from "react";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
} from "react-native";
import { useCommentStore } from "../store/commentStore";

const CommentSheetContext = createContext();

export const CommentSheetProvider = ({ children }) => {
  const bottomSheetRef = useRef(null);
  const inputRef = useRef(null);

  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { comments, loadComments, createComment } = useCommentStore();

  const snapPoints = useMemo(() => ["65%", "85%"], []);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    await createComment(selectedPost._id, commentText);
    setCommentText("");
    // Optional: Scroll to top after posting
    // flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const openComments = useCallback(async (post) => {
    setSelectedPost(post);
    setIsOpen(true);
    await loadComments(post._id);
    requestAnimationFrame(() => {
      bottomSheetRef.current?.snapToIndex(0);
    });
  }, []);

  const closeComments = useCallback(() => {
    Keyboard.dismiss();
    bottomSheetRef.current?.close();
  }, []);

  const handleSheetClose = useCallback(() => {
    setSelectedPost(null);
    setIsOpen(false);
    setCommentText("");
  }, []);

  const renderItem = useCallback(({ item }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentAvatar}>
        <Text style={styles.avatarText}>
          {(item.userId?.username || item.username || "?")[0].toUpperCase()}
        </Text>
      </View>
      <View style={styles.commentBody}>
        <Text style={styles.commentUsername}>
          {item.userId?.username || item.username}
        </Text>
        <Text style={styles.commentText}>{item.content}</Text>
        <View style={styles.commentMeta}>
          <Text style={styles.commentTime}>2h</Text>
          <TouchableOpacity>
            <Text style={styles.replyBtn}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.likeComment}>
        <Text style={{ color: "#666", fontSize: 11 }}>♡</Text>
      </TouchableOpacity>
    </View>
  ), []);

  return (
    <CommentSheetContext.Provider value={{ openComments, closeComments, selectedPost }}>
      {children}

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={handleSheetClose}
        keyboardBehavior={Platform.OS === "ios" ? "extend" : "interactive"}
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        animateOnMount
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
      >
        {/* HEADER */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Comments</Text>
        </View>

        {/* INPUT FIELD — NOW AT THE TOP */}
        <View style={styles.inputRow}>
          <View style={styles.inputWrap}>
            <BottomSheetTextInput
              ref={inputRef}
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Add a comment..."
              placeholderTextColor="#555"
              style={styles.textInput}
              multiline
              maxLength={300}
              returnKeyType="send"
              onSubmitEditing={handleAddComment}
            />
          </View>
          <TouchableOpacity
            onPress={handleAddComment}
            disabled={!commentText.trim()}
            style={[styles.sendBtn, !commentText.trim() && styles.sendBtnDisabled]}
          >
            <Text style={[styles.sendText, !commentText.trim() && styles.sendTextDisabled]}>
              Post
            </Text>
          </TouchableOpacity>
        </View>

        {/* COMMENTS LIST — Below the input */}
        <BottomSheetFlatList
          data={comments}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No comments yet.</Text>
              <Text style={styles.emptySubtitle}>Start the conversation.</Text>
            </View>
          }
        />
      </BottomSheet>
    </CommentSheetContext.Provider>
  );
};

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#111",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  handle: {
    backgroundColor: "#444",
    width: 36,
  },
  sheetHeader: {
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#222",
  },
  sheetTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  /* Input at Top */
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#222",
    backgroundColor: "#111",
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 40,
    justifyContent: "center",
  },
  textInput: {
    color: "#fff",
    fontSize: 14,
    maxHeight: 80,
  },
  sendBtn: {
    paddingHorizontal: 4,
  },
  sendBtnDisabled: {
    opacity: 0.3,
  },
  sendText: {
    color: "#3897f0",
    fontWeight: "700",
    fontSize: 14,
  },
  sendTextDisabled: {
    color: "#3897f0",
  },

  /* Comments List */
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  commentItem: {
    flexDirection: "row",
    paddingVertical: 12,
    alignItems: "flex-start",
    gap: 10,
  },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  commentBody: {
    flex: 1,
  },
  commentUsername: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 3,
  },
  commentText: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 20,
  },
  commentMeta: {
    flexDirection: "row",
    gap: 14,
    marginTop: 6,
    alignItems: "center",
  },
  commentTime: {
    color: "#555",
    fontSize: 12,
  },
  replyBtn: {
    color: "#555",
    fontSize: 12,
    fontWeight: "600",
  },
  likeComment: {
    paddingTop: 2,
    paddingLeft: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    gap: 6,
  },
  emptyTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  emptySubtitle: {
    color: "#555",
    fontSize: 13,
  },
});

export const useCommentSheet = () => useContext(CommentSheetContext);