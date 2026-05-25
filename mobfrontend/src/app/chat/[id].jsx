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
} from "react-native";

import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useLocalSearchParams }
  from "expo-router";

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

  const { id } =
    useLocalSearchParams();

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
  } = useChatStore();

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

        sessionId:
          "session_1",

        messageNumber:
          Date.now(),

        previousChainLength:
          0,

        clientTempId:
          uuidv4(),
      };

      setText("");

      await sendMessage(
        payload
      );
    };

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
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
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd(
              {
                animated: true,
              }
            )
          }
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