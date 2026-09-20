import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import API from "./api";
import { useCommentSheetStore } from "../store/commentSheetStore";

let navigationReady = false;
const pendingDeepLinks = [];

const markAsRead = (notificationId) => {
  if (!notificationId) return;
  API.patch(`/notifications/${notificationId}/read`).catch((error) => {
    console.warn("[Notification] Could not mark as read", error?.message);
  });
};

const normalizeData = (data) => ({
  ...data,
  notificationId: data.notificationId || data._id,
  postId: data.postId || (data.entityType === "POST" ? data.entityId : undefined),
  commentId: data.commentId || data.metadata?.commentId,
  conversationId:
    data.conversationId || (data.entityType === "MESSAGE" ? data.entityId : undefined),
  userId: data.userId || (data.entityType === "USER" ? data.entityId : undefined),
  senderId: data.senderId || data.actor?._id,
});

export function setupNotificationNavigation() {
  // App is running/backgrounded and user taps notification
  const subscription =
    Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data =
          response.notification.request.content.data;

        handleNotificationNavigation(data);
      }
    );

  return () => subscription.remove();
}

export function handleNotificationNavigation(data) {
  const normalizedData = normalizeData(data || {});
  if (!normalizedData.type) return;

  markAsRead(normalizedData.notificationId);

  if (!navigationReady) {
    pendingDeepLinks.push(normalizedData);
    return;
  }

  switch (normalizedData.type) {
    case "MESSAGE":
      if (normalizedData.conversationId) {
        router.push({
          pathname: "/chat/[id]",
          params: {
            id: String(normalizedData.conversationId),
            receiverId: String(normalizedData.senderId || ""),
          },
        });
      }
      break;

    case "LIKE":
    case "COMMENT":
      if (normalizedData.postId) {
        useCommentSheetStore.getState().open(normalizedData.postId, {
          highlightCommentId: normalizedData.commentId,
        });
      }
      break;

    case "FOLLOW":
    case "MENTION":
      if (normalizedData.userId) {
        router.push({
          pathname: "/profile/[profileId]",
          params: {
            profileId: String(normalizedData.userId),
          },
        });
      }
      break;

    default:
      console.log("[Notification] Unknown type:", normalizedData.type);
  }
}

export function markNotificationNavigationReady() {
  navigationReady = true;
  while (pendingDeepLinks.length) {
    handleNotificationNavigation(pendingDeepLinks.shift());
  }
}