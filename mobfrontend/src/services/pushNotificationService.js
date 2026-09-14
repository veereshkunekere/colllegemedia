import * as Notifications from "expo-notifications";
import {
  getMessaging,
  getToken,
} from "@react-native-firebase/messaging";

export async function getFCMToken() {
  try {
    // Request Android notification permission
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } =
        await Notifications.requestPermissionsAsync();

      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("[FCM] Notification permission denied");
      return null;
    }

    // Get FCM token
    const messaging = getMessaging();

    const token = await getToken(messaging);

    console.log("[FCM] Token obtained");

    return token;
  } catch (error) {
    console.error("[FCM] Token error:", error);
    return null;
  }
}