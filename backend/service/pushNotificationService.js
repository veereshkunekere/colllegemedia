require("../configs/firebaseAdmin");

const {
  getMessaging,
} = require("firebase-admin/messaging");

class PushNotificationService {
  static async sendToUser({
    user,
    title,
    body,
    data = {},
  }) {
    if (!user?.fcmTokens?.length) {
      console.log(
        "[Push] User has no FCM tokens:",
        user?._id
      );
      return;
    }

    const tokens = user.fcmTokens.map(
      (item) => item.token
    );

    const message = {
      tokens,

      notification: {
        title,
        body,
      },

      data: Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          String(value),
        ])
      ),

      android: {
        priority: "high",
        notification: {
          sound: "default",
        },
      },
    };

    try {
      const response =
        await getMessaging().sendEachForMulticast(
          message
        );

      console.log(
        `[Push] Sent: ${response.successCount}, Failed: ${response.failureCount}`
      );

      return response;
    } catch (error) {
      console.error(
        "[Push] Failed to send notification:",
        error
      );

      throw error;
    }
  }
}

module.exports = PushNotificationService;