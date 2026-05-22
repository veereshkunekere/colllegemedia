import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
} from "react-native";

import {
  useEffect,
} from "react";

import {
  usePostStore,
} from "../../store/postStore";

import PostCard from
  "../../components/feed/PostCard";

import FeedHeader from "../../components/feed/FeedHeader"
import TrendingChips from "../../components/feed/TrendingChips"
import CommentsBottomSheet from "../../components/feed/commentBottomSheet";
import { useCommentStore } from "../../store/commentStore";
export default function Home() {
 
  const activePost = useCommentStore((state) => state.activePost);
const setActivePost = useCommentStore((state) => state.setActivePost);
  const posts =
    usePostStore(
      (state) =>
        state.posts
    );

  const loading =
    usePostStore(
      (state) =>
        state.loading
    );

  const refreshing =
    usePostStore(
      (state) =>
        state.refreshing
    );

  const fetchPosts =
    usePostStore(
      (state) =>
        state.fetchPosts
    );

  const refreshPosts =
    usePostStore(
      (state) =>
        state.refreshPosts
    );


  useEffect(() => {
    fetchPosts(true);
  }, []);


  return (
    <View
      style={styles.container}
    >
      <FlatList data={posts}

        ListHeaderComponent={
      <>
      <FeedHeader />
      <TrendingChips />
      </>
  }
        keyExtractor={(item) =>
          item._id
        }

        renderItem={({item,}) => (
          <PostCard
            post={item}
          />
        )}

        contentContainerStyle={{
          padding: 16,
        }}

        onEndReached={() => {
          fetchPosts();
        }}

        onEndReachedThreshold={
          0.5
        }

        refreshControl={  <RefreshControl
           refreshing={
              refreshing
            }
            onRefresh={
              refreshPosts
            }
          />
        }

        ListFooterComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color="#7c3aed"
              style={{
                marginVertical: 20,
              }}
            />
          ) : null
        }

        ListEmptyComponent={
          !loading && (
            <Text
              style={{
                color:
                  "#fff",
                textAlign:
                  "center",
                marginTop: 50,
              }}
            >
              No Posts Yet
            </Text>
          )
        }

        removeClippedSubviews={true}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}        
      />
      <CommentsBottomSheet
      post={activePost}
      onClose={() => setActivePost(null)}
     />
  
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#050505",
    },
  });