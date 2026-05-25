const mongoose =
  require("mongoose");

const ConversationSchema =
  new mongoose.Schema(
    {
      participants: [
        {
          type:
            mongoose.Schema.Types.ObjectId,

          ref: "User",

          required: true,
        },
      ],

      lastMessage: {
        type: String,

        default: "",
      },

      lastMessageSender: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",
      },

      lastMessageAt: {
        type: Date,

        default: Date.now,
      },

      unreadCounts: {
        type: Map,

        of: Number,

        default: {},
      },

      encryptionEnabled: {
        type: Boolean,

        default: true,
      },

      currentSessionId: {
        type: String,
      },
    },
    {
      timestamps: true,
    }
  );

ConversationSchema.index({
  participants: 1,
});

ConversationSchema.index({
  lastMessageAt: -1,
});

const ConversationModel =
  mongoose.model(
    "conversation",
    ConversationSchema
  );

module.exports =
  ConversationModel;