// notifications.js
// Unlike chat/webrtc, notifications are almost entirely server -> client.
// Any controller (tweet, user, etc.) can call sendNotification(...) after a
// like/comment/follow/mention/new post happens — it doesn't need to know
// anything about sockets, rooms, or who's online.
//
// If/when notifications get persisted to a collection, save the doc here
// (in sendNotification) before emitting, so REST fetch on app-start and the
// realtime push stay in sync.

const { emitToUser } = require("./presence");
const SocketEvents = require("../../util/socketEvents");

/**
 * @param {string} userId - recipient
 * @param {{type:string, actorId:string, actorUsername?:string, entityId?:string, message?:string}} notification
 */
const sendNotification = (userId, notification) => {
  if (!userId || String(userId) === String(notification.actorId)) {
    // Never notify users about their own actions (e.g. liking your own post).
    return;
  }

  const payload = {
    ...notification,
    createdAt: new Date(),
  };

  emitToUser(userId, SocketEvents.NOTIFICATION_NEW, payload);
};

// Client can ask to join a personal room for future fan-out features
// (e.g. "new_post" broadcast to followers) — kept lightweight for now.
const register = (io, socket) => {
  socket.on(SocketEvents.NOTIFICATION_MARK_READ, ({ notificationId }) => {
    // Echo to the user's other connected devices so their unread badge
    // stays in sync across tabs/devices.
    emitToUser(socket.userId, SocketEvents.NOTIFICATION_READ, { notificationId });
  });
};

module.exports = { register, sendNotification };
