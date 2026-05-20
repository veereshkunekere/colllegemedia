import { create } from "zustand";

import {
  getFeedPosts,
  toggleLikePost,
  createNewPost
} from "../services/postService";

export const usePostStore =create((set, get) => ({
    posts: [],

    nextCursor: null,

    loading: false,

    refreshing: false,
    hasMore: true,
    createPostLoading: false,

    fetchPosts:async (
        refresh = false
      ) => {
        const {
          posts,
          nextCursor,
          loading,
          hasMore,
        } = get();

        if (loading || (!hasMore && !refresh)) {
           return;
        }
        if (
          loading &&
          !refresh
        ) {
          return;
        }

        try {
          set({
            loading: true,
          });

          const data =
            await getFeedPosts(
              refresh
                ? null
                : nextCursor
            );
        
            const mergedPosts =  refresh ? data.posts : 
             [
              ...posts,
              ...data.posts,
            ];

const uniquePosts =
  Array.from(
    new Map(
      mergedPosts.map(
        (post) => [
          post._id,
          post,
        ]
      )
    ).values()
  );

set({
  posts: uniquePosts,

  nextCursor: data.nextCursor,
  hasMore: data.hasMore,
});

         
        } catch (error) {
          console.log(
            "Feed Error:",
            error
          );
        } finally {
          set({
            loading: false,
            refreshing: false,
          });
        }
      },

    refreshPosts:async () => {
        set({
          refreshing: true,
        });

        await get().fetchPosts(
          true
        );
      },

    toggleLike :async (postId) => {
    const oldPosts =get().posts;

    const updatedPosts =oldPosts.map(
        (post) => {
          if (
            post._id !==
            postId
          ) {
            return post;
          }

          return {
            ...post,

            likedByUser:
              !post.likedByUser,

            likesCount:
              post.likedByUser
                ? post.likesCount -
                  1
                : post.likesCount +
                  1,
          };
        }
      );

    set({
      posts:
        updatedPosts,
    });

    try {
      await toggleLikePost(
        postId
      );
    } catch (error) {
      set({
        posts: oldPosts,
      });

      console.log(
        "Like Error:",
        error
      );
    }
    },

    createNewPost:async (postData) => {
    try {
      set({
        createPostLoading:
          true,
      });

      const data =
        await createNewPost(
          postData
        );

      set((state) => ({
        posts: [
          data.savedTweet,
          ...state.posts,
        ],
      }));

      return {
        success: true,
      };
    } catch (error) {
      console.log(error);

      return {
        success: false,
      };
    } finally {
      set({
        createPostLoading:
          false,
      });
    }
  },
  }));



