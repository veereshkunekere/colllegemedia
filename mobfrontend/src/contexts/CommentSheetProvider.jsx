import { createContext, useContext, useMemo, useRef, useState, useCallback, useEffect} from "react";
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
  Alert,
} from "react-native";
import { useCommentStore } from "../store/commentStore";
import { useAuthStore } from "../store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { formatTimeAgo } from "../utils/formatTime";
import { searchUsers } from "../services/searchService";
import { useCommentSheetStore } from "../store/commentSheetStore";
import { useRouter } from "expo-router";

const CommentSheetContext = createContext();

export const CommentSheetProvider = ({ children }) => {
  const bottomSheetRef = useRef(null);
  const commentsListRef = useRef(null);
  const inputRef = useRef(null);

  const [commentText, setCommentText] = useState("");
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [mentionSuggestions, setMentionSuggestions] = useState([]);

  const { comments, loadComments, createComment, deleteComment } = useCommentStore();
  const currentUserId = useAuthStore(
  (state) => state.user?._id
);
  const openPostId = useCommentSheetStore((state) => state.openPostId);
  const highlightCommentId = useCommentSheetStore((state) => state.highlightCommentId);
  const openSheet = useCommentSheetStore((state) => state.open);
  const closeSheet = useCommentSheetStore((state) => state.close);
  const setSheetReady = useCommentSheetStore((state) => state.setReady);
  const selectedPost = openPostId ? { _id: openPostId } : null;
  const router = useRouter();

  const snapPoints = useMemo(() => ["65%", "85%"], []);

  useEffect(() => {
    setSheetReady(true);
    return () => setSheetReady(false);
  }, [setSheetReady]);

  useEffect(() => {
    if (!openPostId) return;

    loadComments(openPostId).then(() => {
      const index = useCommentStore.getState().comments.findIndex(
        (comment) => String(comment._id) === String(highlightCommentId)
      );
      requestAnimationFrame(() => {
        bottomSheetRef.current?.snapToIndex(0);
        if (index >= 0) {
          commentsListRef.current?.scrollToIndex({ index, animated: false });
        }
      });
    });
  }, [openPostId, highlightCommentId, loadComments]);

  useEffect(() => {
    const beforeCursor = commentText.slice(0, selection.start);
    const token = beforeCursor.match(/(^|\s)@(\w*)$/);
    if (!token || !token[2]) {
      setMentionSuggestions([]);
      return undefined;
    }

    const timeout = setTimeout(async () => {
      try {
        setMentionSuggestions(await searchUsers(token[2]));
      } catch (_) {
        setMentionSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [commentText, selection.start]);

  const handleAddComment = useCallback(async () => {
  if (!selectedPost) return;
  if (!commentText.trim()) return;

  const result = await createComment(
    selectedPost._id,
    commentText
  );

  if (!result.success) {
    Alert.alert("Error", result.message || "Couldn't add comment. Try again.");
    return;
  }

  setCommentText("");
  setSelection({ start: 0, end: 0 });
}, [commentText, createComment, selectedPost]);

  const handleDeleteComment = useCallback(
  (commentId) => {
    Alert.alert(
      "Delete Comment",
      "This can't be undone. Delete this comment?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const result = await deleteComment(
              selectedPost._id,
              commentId
            );

            if (!result.success) {
              Alert.alert(
                "Error",
                "Couldn't delete comment."
              );
            }
          },
        },
      ]
    );
  },
  [deleteComment, selectedPost]
);

  const openComments = useCallback(
  async (post) => {
    openSheet(post._id);
  },
  [openSheet]
);

  const closeComments = useCallback(() => {
    Keyboard.dismiss();
    bottomSheetRef.current?.close();
  }, []);

  const handleSheetClose = useCallback(() => {
    closeSheet();
    setCommentText("");
    setMentionSuggestions([]);
  }, [closeSheet]);

  const handleSelectMention = useCallback((user) => {
    const beforeCursor = commentText.slice(0, selection.start);
    const tokenStart = beforeCursor.lastIndexOf("@");
    const nextText = `${commentText.slice(0, tokenStart)}@${user.username} ${commentText.slice(selection.start)}`;
    const nextCursor = tokenStart + user.username.length + 2;
    setCommentText(nextText);
    setSelection({ start: nextCursor, end: nextCursor });
    setMentionSuggestions([]);
  }, [commentText, selection.start]);

  const handleReply = useCallback((item) => {
    const username = item.userId?.username || item.username;
    const nextText = `@${username} `;
    setCommentText(nextText);
    setSelection({ start: nextText.length, end: nextText.length });
    inputRef.current?.focus();
  }, []);

  const renderCommentContent = useCallback((item) => {
    const mentionByUsername = new Map(
      (item.mentions || []).map((mention) => [mention.username, mention._id])
    );
    return item.content.split(/(@\w+)/g).map((part, index) => {
      const username = part.startsWith("@") ? part.slice(1) : null;
      if (!username || !mentionByUsername.has(username)) {
        return <Text key={index}>{part}</Text>;
      }
      return (
        <Text
          key={index}
          style={styles.mention}
          onPress={() => router.push({ pathname: "/profile/[profileId]", params: { profileId: String(mentionByUsername.get(username)) } })}
        >
          {part}
        </Text>
      );
    });
  }, [router]);


const renderItem = useCallback(
  ({ item }) => {
    const isOwner =
      String(item.userId?._id) ===
      String(currentUserId);

    return (
      <View style={[styles.commentItem, String(item._id) === String(highlightCommentId) && styles.highlightedComment]}>
        <View style={styles.commentAvatar}>
          <Text style={styles.avatarText}>
            {(item.userId?.username ||
              item.username ||
              "?")[0].toUpperCase()}
          </Text>
        </View>

        <View style={styles.commentBody}>
          <Text style={styles.commentUsername}>
            {item.userId?.username ||
              item.username}
          </Text>

          <Text style={styles.commentText}>
            {renderCommentContent(item)}
          </Text>

          <View style={styles.commentMeta}>
            <Text style={styles.commentTime}>
              {formatTimeAgo(item.createdAt)}
            </Text>

            <TouchableOpacity onPress={() => handleReply(item)}>
              <Text style={styles.replyBtn}>
                Reply
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.likeComment}
        >
          <Text
            style={{
              color: "#666",
              fontSize: 11,
            }}
          >
            ♡
          </Text>
        </TouchableOpacity>

        {isOwner && (
          <TouchableOpacity
            onPress={() =>
              handleDeleteComment(
                item._id
              )
            }
            hitSlop={10}
            style={{
              paddingLeft: 8,
              paddingTop: 2,
            }}
          >
            <Ionicons
              name="trash-outline"
              size={16}
              color="#666"
            />
          </TouchableOpacity>
        )}
      </View>
    );
  },
  [currentUserId, handleDeleteComment, handleReply, highlightCommentId, renderCommentContent]
);

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
        <View style={styles.inputSection}>
        {mentionSuggestions.length > 0 && (
          <View style={styles.mentionDropdown}>
            {mentionSuggestions.map((user) => (
              <TouchableOpacity key={user._id} style={styles.mentionSuggestion} onPress={() => handleSelectMention(user)}>
                <Text style={styles.mentionSuggestionText}>@{user.username}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={styles.inputRow}>
          <View style={styles.inputWrap}>
            <BottomSheetTextInput
              ref={inputRef}
              value={commentText}
              onChangeText={setCommentText}
              selection={selection}
              onSelectionChange={({ nativeEvent }) => setSelection(nativeEvent.selection)}
              placeholder="Add a comment..."
              placeholderTextColor="#555"
              style={styles.textInput}
              multiline
              maxLength={200}
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
        </View>

        {/* COMMENTS LIST — Below the input */}
        <BottomSheetFlatList
          data={comments}
          ref={commentsListRef}
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
  inputSection: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#222",
    backgroundColor: "#111",
  },
  mentionDropdown: {
    marginHorizontal: 12,
    marginBottom: 4,
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    overflow: "hidden",
  },
  mentionSuggestion: {
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  mentionSuggestionText: {
    color: "#c4b5fd",
    fontSize: 14,
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
  highlightedComment: {
    backgroundColor: "#2b2140",
    borderRadius: 10,
    paddingHorizontal: 8,
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
  mention: {
    color: "#a78bfa",
    fontWeight: "600",
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