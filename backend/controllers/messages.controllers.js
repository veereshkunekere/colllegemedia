const User = require("../models/user.models");
const MessageModel = require("../models/message.models");
const mongoose = require("mongoose");  // Add for ObjectId conversion if needed
const { getOnlineUserSocket } = require("./socketManager");
const { emitToUser } = require("./socketManager");
const {onlineUsers}=require("../controllers/socketManager")

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

messagesControllers.getChats = async (req, res) => {
  try {
    const myId = req.user;  // String ID
    const Messages = await MessageModel.find({
      $or: [
        { senderId: req.params.id, receiverId: myId },
        { senderId: myId, receiverId: req.params.id }
      ]
    }).sort({ createdAt: 1 });

    const formattedMessages = Messages.map(msg => ({
      ...msg.toObject(),
      senderId: msg.senderId.toString(),
      receiverId: msg.receiverId.toString(),  // Fixed consistent naming
      text: msg.text,  // Ensure 'text' field is used
    }));

    return res.status(200).json({ messages: formattedMessages });
  } catch (error) {
    console.log("error in getChats", error);
    return res.status(500).json({ error: "Failed to fetch chats" });
  }
};

messagesControllers.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newMessage = new MessageModel({
      senderId,
      receiverId,  // Fixed typo
      text: message,
    });

    await newMessage.save();
    
    emitToUser(receiverId, 'newMessage', {
    ...newMessage.toObject(),
    senderId: newMessage.senderId.toString(),
    receiverId: newMessage.receiverId.toString(),
  });

  console.log(`Emitted newMessage to receiver ${receiverId}`);    

    return res.status(201).json({ message: "Message sent successfully", newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
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

module.exports = messagesControllers;