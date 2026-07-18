import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from "react-native";

import { useEffect,useCallback } from "react";

import { useRouter,useFocusEffect } from "expo-router";

import { useChatStore } from "../../store/chatStore";

import { useAuthStore } from "../../store/authStore";

import ConversationCard from "../../styling/components/chats/ConversationCard";

export default function Chats() {
  const { selectActiveConv } = useChatStore();

  const router = useRouter();

  const conversations = useChatStore(
    (state) => state.conversations
  );

  const loadConversations = useChatStore(
    (state) => state.loadConversations
  );

  const currentUser = useAuthStore(
    (state) => state.user
  );

  const handleConvSelection = (item) => {
    selectActiveConv(item);
    router.push(`chat/${item._id}`);
  };

useFocusEffect(
  useCallback(() => {
    loadConversations();
  }, [])
);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <FlatList
        data={conversations}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingBottom: 100,
        }}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.chatCard}>
            <ConversationCard
              conversation={item}
              currentUserId={currentUser?._id}
              onPress={() =>
                handleConvSelection(item)
              }
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No conversations yet
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111",
  },

  chatCard: {
    backgroundColor: "#FFF",
    borderRadius: 22,
    marginBottom: 12,
    overflow: "hidden",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.05,
    shadowRadius: 6,

    elevation: 2,
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 120,
  },

  emptyText: {
    color: "#999",
    fontSize: 16,
  },
});