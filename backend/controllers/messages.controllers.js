const User = require("../models/user.models");
const MessageModel = require("../models/message.models");
const mongoose = require("mongoose");  // Add for ObjectId conversion if needed
const { getOnlineUserSocket } = require("./socketManager");
const { emitToUser } = require("./socketManager");
const {onlineUsers}=require("../controllers/socketManager")
const ConversationModel = require("../models/conversation.models");
const {emitToConversation} = require("./socketManager");
const messagesControllers = {};

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

      const limit = 30;

      const cursor = req.query.cursor;
      const afterMessageNumber = Number( req.query.afterMessageNumber );
      console.log(
 "SYNC AFTER",
 afterMessageNumber
);

      let query = {
        conversationId,
      };

      if(!isNaN(afterMessageNumber)){
        query.messageNumber ={
           $gt:
             afterMessageNumber
        }
      }

      // PAGINATION

      if (cursor) {
        query.createdAt = {
          $lt: new Date(
            cursor
          ),
        };
      }

      const messages =
        await MessageModel.find(
          query
        )
          .sort({
            messageNumber:1,
          });

          console.log(
 "FOUND",
 messages.map(
  m => m.messageNumber
 )
);
          

      return res
        .status(200)
        .json({
          messages,

          nextCursor:
            messages.length >
            0
              ? messages[
                  0
                ].createdAt
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
        nonce,
        ratchetKey
      } = req.body;

      console.log(nonce);
      if (
        !conversationId ||
        !cipherText 
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
            nonce,
            ratchetKey
          }
        );

      await newMessage.save();
      console.log(newMessage);

      // UPDATE
      // CONVERSATION

      conversation.lastMessage = "Encrypted message";

      conversation.lastMessageSender = senderId;

      conversation.lastMessageAt = new Date();

      // UNREAD COUNT

      const currentUnread = conversation.unreadCounts.get( receiverId.toString() ) || 0;

      conversation.unreadCounts.set( receiverId.toString(), currentUnread + 1 );

      await conversation.save();

      emitToConversation( conversationId, "newMessage", newMessage );

      // SOCKET EMIT
      // LATER

      return res
        .status(201)
        .json({
          message:
            "Message sent",

          newMessage,
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