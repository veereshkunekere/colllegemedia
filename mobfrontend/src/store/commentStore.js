import { create }
  from "zustand";

import {
  fetchComments,
  addComment,
} from "../services/commentService";

import { usePostStore }
  from "./postStore";

export const useCommentStore =
  create((set, get) => ({
    comments: [],

    loading: false,

    activePost: null,

    activeComment: null,
     
    // commentStore.js — add a clearComments action
    clearComments: () => set({ comments: [] }),

    setActivePost: (post) => {
  set({
    activePost: post,
  });
},

    loadComments:
      async (tweetId) => {
        try {
          set({
            comments: [],
            loading: true,
          });

          const data =
            await fetchComments(
              tweetId
            );

          set({
            comments:
              data.comments,
          });
        } catch (error) {
          console.log(error);
        } finally {
          set({
            loading: false,
          });
        }
      },

    createComment:async (
        tweetId,
        content
      ) => {
        const oldComments =
          get().comments;

        const optimisticComment =
          {
            _id:
              Date.now().toString(),

            username:
              "You",

            content,

            createdAt:
              new Date(),
          };

        set({
          comments: [
            optimisticComment,
            ...oldComments,
          ],
        });

        try {
          const data =
            await addComment(
              tweetId,
              content
            );

          set({
            comments: [
              data.comment,
              ...oldComments,
            ],
          });

          usePostStore.setState(
  (state) => ({
    posts: state.posts.map(
      (post) =>
        post._id ===
        tweetId
          ? {
              ...post,
              commentsCount:
                post.commentsCount +
                1,
            }
          : post
    ),
  })
);

          return {
            success: true,
          };
        } catch (error) {
          set({
            comments:
              oldComments,
          });

          usePostStore.setState(
  (state) => ({
    posts: state.posts.map(
      (post) =>
        post._id ===
        tweetId
          ? {
              ...post,

              commentsCount:
                Math.max(
                  0,
                  post.commentsCount -
                    1
                ),
            }
          : post
    ),
  })
);
          return {
            success: false,
          };
        }
      },
  }));