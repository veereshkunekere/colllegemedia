import { create } from "zustand";

export const useCommentSheetStore = create((set) => ({
  openPostId: null,
  highlightCommentId: null,
  isReady: false,

  open: (postId, { highlightCommentId = null } = {}) =>
    set({ openPostId: String(postId), highlightCommentId }),

  close: () => set({ openPostId: null, highlightCommentId: null }),

  setReady: (isReady) => set({ isReady }),
}));