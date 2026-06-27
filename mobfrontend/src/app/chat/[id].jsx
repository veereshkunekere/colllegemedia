import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  View,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
} from "react-native";


import 'react-native-get-random-values';
import * as Crypto from "expo-crypto";


import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useLocalSearchParams, useRouter }
  from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  useChatStore,
} from "../../store/chatStore";

import {
  useAuthStore,
} from "../../store/authStore";

import ChatBubble
  from "../../components/chats/ChatBubble";

import {
  getSocket,
} from "../../services/socket";


export default function ChatRoom() {
  const { receiverId } = useLocalSearchParams();
  const { id } =
    useLocalSearchParams();

  const router = useRouter();

  const insets =
    useSafeAreaInsets();

  const flatListRef =
    useRef(null);

  const [text, setText] =
    useState("");

  const user =
    useAuthStore(
      (state) => state.user
    );

  const {
    messages,

    openConversation,

    sendMessage,
    activeConversation, 
    currentUserId,
    onlineUsers,
  } = useChatStore();
 

const otherUser =
  activeConversation?.participants?.find(
    p => String(p._id) !== String(currentUserId)
  );

// TODO: wire up real presence once online/offline tracking is implemented
// (see useChatStore's onlineUsers + the "Online/offline flow" plan).
const isOtherUserOnline =
  otherUser?._id
    ? onlineUsers?.includes?.(String(otherUser._id))
    : false;


  useEffect(() => {

    if (!id || !user?._id)
      return;

    openConversation(
      id,
      user._id
    );

    const socket =
      getSocket();

    socket.emit(
      "markSeen",
      {
        conversationId: id,
      }
    );

    return () => {

      socket.emit(
        "leaveConversation",
        id
      );
    };

  }, [id]);

  const handleSend =
    async () => {

      if (!text.trim())
        return;

      const payload = {

        conversationId:
          id,

        cipherText:
          text,

        senderId:
          user._id,
        
        previousChainLength: 0,

        clientTempId:
          Crypto.randomUUID(),
      };

      setText("");

      await sendMessage(
        payload
      );
      setTimeout(() => {
        flatListRef.current?.scrollToEnd(
          {
            animated: true,
          }
        );
      }, 100);
    };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#fff",
      }}
      edges={["bottom", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
        {/* WhatsApp-style header */}
        <View
          style={[
            styles.header,
            { paddingTop: insets.top + 10 },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={26} color="#0a0a0a" />
          </TouchableOpacity>

          <View style={styles.avatar}>
            {otherUser?.profilePicture ? (
              <Image
                source={{ uri: otherUser.profilePicture }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarInitial}>
                {otherUser?.username?.[0]?.toUpperCase() || "?"}
              </Text>
            )}
          </View>

          <View style={styles.headerTextWrap}>
            <Text style={styles.headerName} numberOfLines={1}>
              {otherUser?.username || "User"}
            </Text>
            <Text style={styles.headerStatus} numberOfLines={1}>
              {isOtherUserOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(
            item,
            index
          ) =>
            item?._id?.toString?.() ||
            index.toString()
          }
          renderItem={({
            item,
          }) => (
            <ChatBubble
              message={item}
              isMine={
                String(
                  item.senderId
                ) ===
                String(
                  user._id
                )
              }
            />
          )}
          contentContainerStyle={{
            padding: 14,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          
        />

        <View
          style={{
            flexDirection:
              "row",

            paddingHorizontal:
              12,

            paddingTop: 8,

            paddingBottom:
              insets.bottom + 8,
          }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message"
            style={{
              flex: 1,
              backgroundColor:
                "#1f1f1f",
              borderRadius: 24,
              paddingHorizontal:
                16,
              paddingVertical: 12,
              color: "white",
            }}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={{
              backgroundColor: "#007bff",
              borderRadius: 24,
              paddingHorizontal: 24,
              paddingVertical: 12,
              marginLeft: 8,
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
              }}
            >
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
    backgroundColor: "#fff",
  },

  backButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginRight: 4,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EFEFEF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },

  avatarImage: {
    width: 42,
    height: 42,
  },

  avatarInitial: {
    color: "#0a0a0a",
    fontSize: 16,
    fontWeight: "700",
  },

  headerTextWrap: {
    flex: 1,
  },

  headerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0a0a0a",
  },

  headerStatus: {
    fontSize: 12,
    color: "#8e8e8e",
    marginTop: 1,
  },
});