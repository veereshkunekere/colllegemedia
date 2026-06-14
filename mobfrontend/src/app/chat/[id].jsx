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
  StyleSheet,
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
  const { receiverId } = useLocalSearchParams();
  console.log("Receiver ID:", receiverId);
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
    activeConversation, 
    currentUserId
  } = useChatStore();
 

const otherUser =
  activeConversation?.participants?.find(
    p => String(p._id) !== String(currentUserId)
  );


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
          uuidv4(),
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
       <View style={styles.header}>
  <View style={styles.avatar}>
    <Text>
      {otherUser?.username?.[0]?.toUpperCase()}
    </Text>
  </View>

  <View>
    <Text style={styles.headerName}>
      {otherUser?.username}
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
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: "#eee",
  backgroundColor: "#fff",
},

avatar: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: "#ddd",
  justifyContent: "center",
  alignItems: "center",
  marginRight: 12,
},

headerName: {
  fontSize: 18,
  fontWeight: "600",
},
});