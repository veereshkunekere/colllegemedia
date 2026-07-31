const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "LIKE",
        "COMMENT",
        "REPLY",
        "FOLLOW",
        "MENTION",
        "MESSAGE",
        "POST",
        "ADMIN",
      ],
    },

    entityType: {
      type: String,
      required: true,
      enum: [
        "POST",
        "COMMENT",
        "MESSAGE",
        "USER",
        "SYSTEM",
      ],
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({
  recipient: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);