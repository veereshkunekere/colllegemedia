const Notification = require("../models/notification.model");
const { sendNotification} = require("../controllers/socket/notifications");

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

      const notification = await Notification.create({
        recipient,
        actor,
        type,
        entityType,
        entityId,
        metadata,
      });

      await notification.populate([
        {
          path: "actor",
          select: "username profilePicture",
        },
      ]);

      if (emit) {
        sendNotification(recipient, notification);
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

  
}

module.exports = NotificationService;