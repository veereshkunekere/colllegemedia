const Notification = require("../models/notification.model");
const { sendNotification} = require("../controllers/socket/notifications");
const PushNotificationService = require("../service/pushNotificationService");
const User = require("../models/user.models");
class NotificationService {
  /**
   * Creates a notification and optionally emits it in realtime.
   */
  static async createNotification({
    recipient,
    actor,
    type,
    entityType,
    entityId,
    metadata = {},
    emit = true,
  }) {
    try {
      // Don't notify yourself
      if (!recipient)
    throw new Error("recipient is required");

if (!actor)
    throw new Error("actor is required");

if (!type)
    throw new Error("type is required");

if (!entityType)
    throw new Error("entityType is required");

if (!entityId)
    throw new Error("entityId is required");
      if (String(recipient) === String(actor)) {
        return null;
      }

      console.log(`[NotificationService] Creating notification for recipient ${recipient} from actor ${actor} of type ${type} on entity ${entityType} with ID ${entityId}`
      );

      const notification = await Notification.create({
        recipient,
        actor,
        type,
        entityType,
        entityId,
        metadata,
      });

      await notification.populate(
          "actor",
          "username profilePicture",
      );

      if (emit) {
        sendNotification(recipient, notification);
      }

       // Find recipient for FCM
      const recipientUser =
        await User.findById(recipient).select(
          "fcmTokens username"
        );

      if (recipientUser?.fcmTokens?.length) {
        const actorName =
          notification.actor?.username ||
          "Someone";

        const {
          title,
          body,
        } = NotificationService.buildPushContent({
          type,
          actorName,
        });

        await PushNotificationService.sendToUser({
          user: recipientUser,

          title,

          body,

          data: {
            type,
            notificationId:
              notification._id.toString(),
            entityType,
            entityId:
              entityId.toString(),

    senderName:
      notification.actor?.username || "Someone",

    senderProfilePicture:
      notification.actor?.profilePicture || "",
          },
        });
      }

      return notification;
    } catch (error) {
      console.error(
        "[NotificationService]",
        error
      );

      throw error;
    }
  }

  static buildPushContent({
    type,
    actorName,
  }) {
    switch (type) {
      case "LIKE":
        return {
          title: actorName,
          body: "liked your post",
        };

      case "COMMENT":
        return {
          title: actorName,
          body: "commented on your post",
        };

      case "FOLLOW":
        return {
          title: actorName,
          body: "started following you",
        };

      case "MESSAGE":
        return {
          title: actorName,
          body: "sent you a message",
        };

      default:
        return {
          title: actorName,
          body: "sent you a notification",
        };
    }
  }

}

module.exports = NotificationService;