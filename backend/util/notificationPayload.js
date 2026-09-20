const getActorId = (actor) => actor?._id || actor;

const buildNotificationData = ({
  type,
  notificationId,
  entityType,
  entityId,
  actor,
  metadata = {},
}) => {
  const actorId = getActorId(actor);
  const data = {
    type,
    notificationId: String(notificationId),
    entityType,
    entityId: String(entityId),
    senderName: actor?.username || "Someone",
    senderProfilePicture: actor?.profilePicture || "",
  };

  if ((type === "LIKE" || type === "COMMENT" || type === "MENTION") && entityType === "POST") {
    data.postId = String(entityId);
  }

  if (type === "COMMENT" || type === "MENTION") {
    if (metadata.commentId) data.commentId = String(metadata.commentId);
  }

  if (type === "MESSAGE" && entityType === "MESSAGE") {
    data.conversationId = String(entityId);
    if (actorId) data.senderId = String(actorId);
  }

  if ((type === "FOLLOW" || type === "MENTION") && entityType === "USER") {
    data.userId = String(entityId);
  }

  return data;
};

module.exports = { buildNotificationData };