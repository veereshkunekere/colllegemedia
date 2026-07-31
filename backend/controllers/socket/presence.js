// presence.js
// Owns the single source of truth for "who is online" and how to reach them.
// Every other module (chat, notifications, webrtc) reaches a user through
// emitToUser()/emitToConversation() instead of touching sockets directly.

const OFFLINE_GRACE_MS = 5000;

// userId(string) => { sockets: Socket[], timeout: NodeJS.Timeout|null }
const onlineUsers = new Map();

let ioRef = null;

const init = (io) => {
  ioRef = io;
};

const getOnlineUserSocket = (userId) => {
  const key = userId?.toString();
  const userData = onlineUsers.get(key);
  return userData?.sockets[0] || null;
};

const isUserOnline = (userId) => onlineUsers.has(userId?.toString());

const emitToUser = (userId, event, data) => {
  const key = userId?.toString();
  const userData = onlineUsers.get(key);
  if (userData) {
    userData.sockets.forEach((socket) => socket.emit(event, data));
  }
};

const emitToConversation = (conversationId, event, data) => {
  ioRef?.to(conversationId).emit(event, data);
};

// Called once per new socket connection.
const handleConnect = (io, socket) => {
  const userId = socket.userId;

  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, { sockets: [], timeout: null });
  }
  const userData = onlineUsers.get(userId);
  userData.sockets.push(socket);

  // Cancel any pending "gone offline" broadcast — user just reconnected.
  if (userData.timeout) {
    clearTimeout(userData.timeout);
    userData.timeout = null;
  }

  // Only announce online on the FIRST active socket for this user
  // (a user can have multiple tabs/devices connected at once).
  if (userData.sockets.length === 1) {
    io.emit("userOnline", userId);
    console.log(`[presence] userOnline: ${userId}`);
  }
};

// Called on socket disconnect.
const handleDisconnect = (io, socket) => {
  const userId = socket.userId;
  const userData = onlineUsers.get(userId);
  if (!userData) return;

  userData.sockets = userData.sockets.filter((s) => s.id !== socket.id);

  if (userData.sockets.length === 0) {
    // Grace period so a quick reconnect (page refresh, network blip)
    // doesn't flicker the user's presence to everyone else.
    userData.timeout = setTimeout(() => {
      const current = onlineUsers.get(userId);
      if (current && current.sockets.length === 0) {
        onlineUsers.delete(userId);
        io.emit("userOffline", userId);
        console.log(`[presence] userOffline: ${userId}`);
      }
    }, OFFLINE_GRACE_MS);
  }
};

module.exports = {
  init,
  onlineUsers,
  getOnlineUserSocket,
  isUserOnline,
  emitToUser,
  emitToConversation,
  handleConnect,
  handleDisconnect,
};
