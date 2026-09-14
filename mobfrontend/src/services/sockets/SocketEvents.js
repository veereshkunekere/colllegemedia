export const SocketEvents = {
    CONNECT: "connect",
    DISCONNECT: "disconnect",
    CONNECT_ERROR: "connect_error",

    // Messaging
    NEW_MESSAGE: "newMessage",
    MESSAGE_DELIVERED: "messageDelivered",
    MESSAGES_SEEN: "messagesSeen",

    // Presence
    USER_ONLINE: "userOnline",
    USER_OFFLINE: "userOffline",

    // Notifications
    NOTIFICATION_NEW: "notification:new",
};