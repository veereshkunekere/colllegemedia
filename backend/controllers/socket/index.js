// controllers/socket/index.js
//
//   App Starts -> Authentication -> ONE Socket.IO server -> per-domain modules
//                                          |
//                        ┌─────────────────┼─────────────────┐
//                        ▼                 ▼                 ▼
//                    presence            chat            notifications
//                  (online/offline)  (rooms, typing,     (server push,
//                                     read receipts)       likes/comments/
//                        ▼                                 follows/posts)
//                     webrtc
//                  (call signaling)
//
// This file owns the io instance and the single connection lifecycle.
// Each domain module only registers its own event handlers — none of them
// know about each other, so adding a new feature (e.g. "groups") means
// adding controllers/socket/groups.js and one line below, nothing else.

const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const presence = require("./presence");
const chat = require("./chat");
const webrtc = require("./webrtc");
const notifications = require("./notifications");

let io;

const socketManager = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "https://colllegemedia-froontend.onrender.com",
        "https://colllegemedia-frontend.onrender.com",
        "http://localhost:5173",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  presence.init(io);

  console.log("Socket.IO server initialized");

  // ── AUTH ────────────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Unauthorized"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      console.log("socket auth error", error);
      next(new Error("Unauthorized"));
    }
  });

  // ── CONNECTION ──────────────────────────────────────────────────────
  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`✅ User connected: socketId=${socket.id}, userId=${userId}`);

    if (!userId) {
      console.log("Connection without userId; disconnecting");
      socket.disconnect(true);
      return;
    }

    presence.handleConnect(io, socket);

    // Each domain module wires up its own socket.on(...) handlers.
    chat.register(io, socket);
    webrtc.register(io, socket);
    notifications.register(io, socket);

    socket.on("disconnect", (reason) => {
      console.log(`User ${userId} socket disconnected (reason: ${reason})`);
      presence.handleDisconnect(io, socket);
    });
  });

  return io;
};

module.exports = socketManager;
module.exports.getOnlineUserSocket = presence.getOnlineUserSocket;
module.exports.emitToUser = presence.emitToUser;
module.exports.emitToConversation = presence.emitToConversation;
module.exports.onlineUsers = presence.onlineUsers;
module.exports.sendNotification = notifications.sendNotification;
module.exports.NOTIFICATION_TYPES = notifications.NOTIFICATION_TYPES;
