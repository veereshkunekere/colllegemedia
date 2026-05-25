import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  useLocalSearchParams,
} from "expo-router";

import {
  useChatStore,
} from "../../store/chatStore";

import {
  useAuthStore,
} from "../../store/authStore";

import ChatBubble
  from "../../components/chats/ChatBubble";

export default function
ChatRoom() {

    clientTempId: crypto.randomUUID();

  const { id } =
    useLocalSearchParams();

  const flatListRef =
    useRef();

  const [
    text,
    setText,
  ] = useState("");

  const messages =
    useChatStore(
      (state) =>
        state.messages
    );

  const openConversation =
    useChatStore(
      (state) =>
        state.openConversation
    );

  const sendMessage =
    useChatStore(
      (state) =>
        state.sendMessage
    );

  const currentUser =
    useAuthStore(
      (state) =>
        state.user
    );

  useEffect(() => {

    openConversation(id);

  }, [id]);



  const handleSend =
    async () => {

      if (
        !text.trim()
      ) {
        return;
      }

      // LATER:
      // encrypt here

      const payload = {

        conversationId:
          id,

        receiverId:
          "TEMP_RECEIVER_ID",

        cipherText:
          text,

        sessionId:
          "session_1",

        messageNumber:
          Date.now(),

        previousChainLength:
          0,
      };

      await sendMessage(
        payload
      );

      setText("");

      flatListRef.current
        ?.scrollToEnd({
          animated: true,
        });
    };



  return (
    <SafeAreaView
      style={styles.container}
    >

      <KeyboardAvoidingView
        style={{ flex: 1 }}

        behavior={
          Platform.OS ===
          "ios"
            ? "padding"
            : undefined
        }
      >

        <FlatList
          ref={flatListRef}

          data={messages}

          keyExtractor={(
            item
          ) =>
            item._id
          }

          renderItem={({
            item,
          }) => (
            <ChatBubble
              message={item}

              isMine={
                item.senderId ===
                currentUser?._id
              }
            />
          )}

          contentContainerStyle={{
            padding: 14,
          }}

          onContentSizeChange={() =>
            flatListRef.current
              ?.scrollToEnd({
                animated: true,
              })
          }
        />



        <View
          style={styles.inputBar}
        >

          <TextInput
            value={text}

            onChangeText={
              setText
            }

            placeholder="Message..."

            placeholderTextColor="#777"

            style={styles.input}
          />

          <TouchableOpacity
            onPress={
              handleSend
            }
          >

            <Ionicons
              name="send"

              size={24}

              color="#7c3aed"
            />

          </TouchableOpacity>

        </View>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,

      backgroundColor:
        "#050505",
    },

    inputBar: {
      flexDirection: "row",

      alignItems: "center",

      padding: 14,

      borderTopWidth: 1,

      borderTopColor:
        "#1f1f1f",

      backgroundColor:
        "#050505",
    },

    input: {
      flex: 1,

      backgroundColor:
        "#111",

      borderRadius: 22,

      paddingHorizontal: 16,

      paddingVertical: 12,

      color: "#fff",

      marginRight: 10,
    },
});