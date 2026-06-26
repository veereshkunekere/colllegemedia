import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  SafeAreaView,
} from "react-native";

import { useEffect } from "react";

import { usePostStore } from "../../store/postStore";

import PostCard from "../../components/feed/PostCard";
import FeedHeader from "../../components/feed/FeedHeader";
import TrendingChips from "../../components/feed/TrendingChips";

export default function Home() {
  const posts = usePostStore((state) => state.posts);

  const loading = usePostStore((state) => state.loading);

  const refreshing = usePostStore(
    (state) => state.refreshing
  );

  const fetchPosts = usePostStore(
    (state) => state.fetchPosts
  );

  const refreshPosts = usePostStore(
    (state) => state.refreshPosts
  );

  useEffect(() => {
    fetchPosts(true);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
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
          />
        }
        ListFooterComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color="#7B61FF"
              style={{ marginVertical: 20 }}
            />
          ) : null
        }
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>
              No Posts Yet
            </Text>
          )
        }
        removeClippedSubviews={true}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingTop:20
  },

  listContent: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 100,
  },

  cardWrapper: {
    marginBottom: 18,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 80,
    fontSize: 15,
  },
});