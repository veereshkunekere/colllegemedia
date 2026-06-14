import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from "react-native";

import {
  useEffect,
} from "react";

import {
  useRouter,
} from "expo-router";

import {
  useChatStore,
} from "../../store/chatStore";

import {
  useAuthStore,
} from "../../store/authStore";

import ConversationCard
  from "../../components/chats/ConversationCard";

export default function Chats() {

  const {selectActiveConv} =useChatStore();

  const router =
    useRouter();

  const conversations =
    useChatStore(
      (state) =>
        state.conversations
    );

  const loadConversations =
    useChatStore(
      (state) =>
        state.loadConversations
    );

  const currentUser =
    useAuthStore(
      (state) =>
        state.user
    );
  
    const handleConvSelection = (item) =>{
         selectActiveConv(item);
          const otherUser = item.participants
      .find(
        (u) =>
          u._id !==
          currentUser._id
      );
      console.log("Other User:", otherUser);
         router.push({
          pathname: `chat/${item._id}`,
          params:{receiverId: otherUser}
    });
    }

  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <SafeAreaView
      style={styles.container}
    >

      <Text
        style={styles.title}
      >
        Chats
      </Text>

      <FlatList
        data={conversations}

        keyExtractor={(item) =>
          item._id
        }

        renderItem={({
          item,
        }) => (
          <ConversationCard
            conversation={item}

            currentUserId={
              currentUser?._id
            }

            onPress={()=> handleConvSelection(item)}
          />
        )}

        ListEmptyComponent={
          <View
            style={
              styles.emptyContainer
            }
          >
            <Text
              style={
                styles.emptyText
              }
            >
              No conversations yet
            </Text>
          </View>
        }
      />

    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,

      backgroundColor: "#ffffff",
      
    },

    title: {
      color: "#3e3b3b",

      fontSize: 30,

      fontWeight: "600",

      borderBottomWidth: 1,
    borderBottomColor: "#645e5e",
    paddingBottom: 10,
    padding:20
    },

    emptyContainer: {
      flex: 1,

      justifyContent:
        "center",

      alignItems:
        "center",

      marginTop: 120,
    },

    emptyText: {
      color: "#666",

      fontSize: 16,
    },
});