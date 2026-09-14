import * as Notifications from "expo-notifications";
import { router } from "expo-router";

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
  console.log("[Notification] Received data:",data?.type);
  console.log("[Notification] Conversation ID:",data.conversationId);
  console.log("[Notification] Post ID:",data.entityId);
  if (!data?.type) return;

  switch (data.type) {
    case "MESSAGE":
      if (data.conversationId) {

        router.push({
          pathname: "src/app/(tabs)/chat/[conversationId].jsx",
          params: {
            id: String(data.entityId),
          },
        });
      }
      break;

    case "LIKE":
      if (data.postId) {
        router.push({
          pathname: "/post/[id]",
          params: {
            id: String(data.postId),
          },
        });
      }
      break;

    case "COMMENT":
      if (data.postId) {
        router.push({
          pathname: "/post/[id]",
          params: {
            id: String(data.postId),
          },
        });
      }
      break;

    case "FOLLOW":
      if (data.userId) {
        router.push({
          pathname: "/profile/[id]",
          params: {
            id: String(data.userId),
          },
        });
      }
      break;

    default:
      console.log(
        "[Notification] Unknown type:",
        data.type
      );
  }
}