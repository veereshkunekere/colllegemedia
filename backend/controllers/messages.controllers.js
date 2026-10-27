const User = require("../models/user.models");
const MessageModel = require("../models/message.models");
const mongoose = require("mongoose");  // Add for ObjectId conversion if needed
const { getOnlineUserSocket } = require("./socketManager");
const { emitToUser } = require("./socketManager");
const {onlineUsers}=require("../controllers/socketManager")
const ConversationModel = require("../models/conversation.models");
const {emitToConversation} = require("./socketManager");
const messagesControllers = {};
const NotificationService = require("../services/notification.service");
const NotificationTypes = require("../util/notificationTypes");

messagesControllers.getMessagedContacts = async (req, res) => {
  try {
    const myId = req.user;  // String ID from middleware
    const messagedUsers = await MessageModel.aggregate([
      { 
        $match: { 
          $or: [
            { senderId: new mongoose.Types.ObjectId(myId) }, 
            { receiverId: new mongoose.Types.ObjectId(myId) } 
          ] 
        } 
      },
      {
        $group: {
          _id: null,
          users: { 
            $addToSet: { 
              $cond: [{ $eq: ["$senderId", new mongoose.Types.ObjectId(myId)] }, "$receiverId", "$senderId"] 
            } 
          }
        }
      },
      { $unwind: "$users" },
      {
        $lookup: { 
          from: "users", 
          localField: "users", 
          foreignField: "_id", 
          as: "user" 
        }
      },
      { $unwind: "$user" },
      { $match: { "user._id": { $ne: new mongoose.Types.ObjectId(myId) } } },
      { $project: { _id: "$user._id", username: "$user.username" } }
    ]);
    const users = messagedUsers.map(u => ({ 
      _id: u._id.toString(), 
      username: u.username 
    }));
    return res.status(200).json({ message: "messaged users sent", users });
  } catch (error) {
    console.log("error in getMessagedContacts", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

messagesControllers.isOnline = async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = onlineUsers.get(userId.toString());  // Check if has entry
    return res.status(200).json({ isOnline: !!userData && userData.sockets.length > 0 });
  } catch (error) {
    console.log("error in isOnline", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

messagesControllers.getMessages = async (req, res) => {
    try {
      const {
        conversationId,
      } = req.params;

      let conversation = await ConversationModel.findById(conversationId);
      
      if (!conversation) {  
        return res.status(404).json({ error: "Conversation not found" });
      }

      if (!conversation.participants.some(p => p.toString() === req.user.toString())) {
        return res.status(403).json({ error: "Not a participant of this conversation" });
      }

      const limit = 30;
      const { cursor, since, after, missing } = req.query;
      const query = { conversationId };

      // Catch-up sync is based on the receiver's ratchet counter, not timestamps.
      // In a one-to-one conversation, messageNumber belongs to each sender's chain.
      if (after !== undefined) {
        const afterNumber = Number(after);
        if (!Number.isSafeInteger(afterNumber) || afterNumber < -1) {
          return res.status(400).json({ error: "Invalid message sync cursor" });
        }

        const missingNumbers = String(missing || "")
          .split(",")
          .filter(Boolean)
          .map(Number)
          .filter((n) => Number.isSafeInteger(n) && n >= 0);

        query.senderId = { $ne: req.user };
        query.$or = [
          { messageNumber: { $gt: afterNumber } },
          ...(missingNumbers.length ? [{ messageNumber: { $in: missingNumbers } }] : []),
        ];
      } else {
        // Keep timestamp-based pagination for older history requests.
        if (since) {
          const sinceDate = new Date(since);
          if (!Number.isNaN(sinceDate.getTime())) query.createdAt = { $gt: sinceDate };
        }
        if (cursor) {
          const cursorDate = new Date(cursor);
          if (!Number.isNaN(cursorDate.getTime())) {
            query.createdAt = { ...(query.createdAt || {}), $lt: cursorDate };
          }
        }
      }

      const messages = await MessageModel.find(query)
        .sort(after !== undefined ? { senderId: 1, messageNumber: 1 } : { createdAt: -1 })
        .limit(limit);
          

      return res
        .status(200)
        .json({
          messages,
          nextCursor:
            messages.length > 0
              ? (after !== undefined
                  ? null
                  : messages[messages.length - 1].createdAt)
              : null,
        });
    } catch (error) {
      console.log(
        "getMessages error",
        error
      );

      return res
        .status(500)
        .json({
          error:
            "Failed to fetch messages",
        });
    }
  };

messagesControllers.sendMessage = async (req, res) => {
    try {
      const senderId = req.user;

      const {
        conversationId,

        cipherText,

        sessionId,

        messageNumber,

        previousChainLength,
        nonce
      } = req.body;

      if (
        !conversationId ||
        !cipherText ||
        !nonce
      ) {
        return res
          .status(400)
          .json({
            error:
              "Missing required fields",
          });
      }

      // VERIFY
      // CONVERSATION

      const conversation = await ConversationModel.findById( conversationId );

      if ( !conversation ) {
        return res
          .status(404)
          .json({
            error:
              "Conversation not found",
          });
      }

      if (!conversation.participants.some( p => p.toString() === senderId.toString())) {
          return res.status(403).json({
            error: "Not a participant of this conversation"
          });
      }

      const receiverId = conversation.participants.find(
                             (id) =>
                             id.toString() !==
                             senderId.toString()
                            );
      // CREATE MESSAGE

      const newMessage = new MessageModel(
          {
            conversationId,

            senderId,

            receiverId,

            cipherText,

            sessionId,

            messageNumber,

            previousChainLength,
            nonce
          }
        );

      await newMessage.save();
      console.log(newMessage);

    

      // UNREAD COUNT

     await ConversationModel.findByIdAndUpdate(conversationId, {
  lastMessage: "Encrypted message",
  lastMessageSender: senderId,
  lastMessageAt: new Date(),
  $inc: { [`unreadCounts.${receiverId.toString()}`]: 1 },
});

      // Deliver the persisted message before running non-critical push work.
      // Notification/FCM failures must not turn a successful send into an HTTP failure.
      emitToConversation(conversationId, "newMessage", newMessage);

      res.status(201).json({
        message: "Message sent",
        newMessage,
      });

      void NotificationService.createNotification({
        recipient: receiverId,
        actor: senderId,
        type: NotificationTypes.MESSAGE,
        entityType: "MESSAGE",
        entityId: conversationId,
        metadata: {
          messageId: newMessage._id,
          messageNumber: newMessage.messageNumber,
        },
      }).catch((error) => {
        console.error("[messages] non-blocking notification failed", error);
      });
    } catch (error) {
      console.log(
        "sendMessage error",
        error
      );

      return res
        .status(500)
        .json({
          error:
            "Internal server error",
        });
    }
  };

module.exports = messagesControllers;