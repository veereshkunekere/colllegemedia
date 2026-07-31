// chat.js
// Everything related to conversation rooms: joining/leaving, typing
// indicators, and delivered/seen receipts. Sending the actual message is
// still done over the REST endpoint (messages.controllers.js) so it can be
// persisted first — this module only handles the realtime side.

const MessageModel = require("../../models/message.models");
const ConversationModel = require("../../models/conversation.models");
const { emitToConversation } = require("./presence");

const register = (io, socket) => {
  socket.on("joinConversation", async (conversationId) => {
    try {
      const exists = await ConversationModel.findOne({
        _id: conversationId,
        participants: socket.userId,
      });
      if (!exists) return;

      socket.join(conversationId);
      console.log(`[chat] socket ${socket.id} joined ${conversationId}`);
    } catch (error) {
      console.log("[chat] joinConversation error", error);
    }
  });

  socket.on("leaveConversation", (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on("typingStart", ({ conversationId }) => {
    socket.to(conversationId).emit("userTyping", { userId: socket.userId });
  });

  socket.on("typingStop", ({ conversationId }) => {
    socket.to(conversationId).emit("userTypingStop", { userId: socket.userId });
  });

  socket.on("markSeen", async ({ conversationId }) => {
    try {
      const conversation = await ConversationModel.findOne({
        _id: conversationId,
        participants: socket.userId,
      });
      if (!conversation) return;

      await MessageModel.updateMany(
        { conversationId, senderId: { $ne: socket.userId }, seen: false },
        { seen: true, seenAt: new Date() }
      );

      emitToConversation(conversationId, "messagesSeen", {
        conversationId,
        userId: socket.userId,
      });
    } catch (error) {
      console.log("[chat] markSeen error", error);
    }
  });

  socket.on("messageDelivered", async ({ messageId }) => {
    try {
      const message = await MessageModel.findById(messageId);
      if (!message) return;
      if (message.receiverId.toString() !== socket.userId.toString()) return;

      const updated = await MessageModel.findOneAndUpdate(
        { _id: messageId, receiverId: socket.userId, delivered: false },
        { delivered: true, deliveredAt: new Date() },
        { new: true }
      );
      if (!updated) return;

      emitToConversation(updated.conversationId, "messageDelivered", {
        messageId: updated._id,
      });
    } catch (error) {
      console.log("[chat] messageDelivered error", error);
    }
  });
};

module.exports = { register };
