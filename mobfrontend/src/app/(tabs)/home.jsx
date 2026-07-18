import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
} from "react-native";

import { useEffect } from "react";

import { usePostStore } from "../../store/postStore";

import PostCard from "../../styling/components/feed/PostCard";
import FeedHeader from "../../styling/components/feed/FeedHeader";

import { Colors, Spacing, Radius, Shadows } from "../../styling/theme";

export default function Home() {
  const posts = usePostStore((state) => state.posts);
  const loading = usePostStore((state) => state.loading);
  const refreshing = usePostStore((state) => state.refreshing);
  const fetchPosts = usePostStore((state) => state.fetchPosts);
  const refreshPosts = usePostStore((state) => state.refreshPosts);

  useEffect(() => {
    fetchPosts(true);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <FeedHeader />
          </>
        }
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <PostCard post={item} />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        onEndReached={() => {
          fetchPosts();
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshPosts}
            tintColor={Colors.light.accent}
          />
        }
        ListFooterComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color={Colors.light.accent}
              style={{ marginVertical: Spacing.xl }}
            />
          ) : null
        }
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>No Posts Yet</Text>
          )
        }
        removeClippedSubviews={true}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 100,
  },

  cardWrapper: {
    marginBottom: Spacing.xl,
    borderRadius: Radius.xl,
    overflow: "hidden",
    backgroundColor: Colors.light.surface,
    ...Shadows.cardLarge,
  },

  emptyText: {
    textAlign: "center",
    color: Colors.light.textMuted,
    marginTop: 80,
    fontSize: 15,
  },
});