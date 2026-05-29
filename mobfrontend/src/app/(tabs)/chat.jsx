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
         router.push(`chat/${item._id}`);
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

      backgroundColor:
        "#050505",
    },

    title: {
      color: "#fff",

      fontSize: 30,

      fontWeight: "800",

      paddingHorizontal: 20,

      paddingTop: 20,

      paddingBottom: 10,
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