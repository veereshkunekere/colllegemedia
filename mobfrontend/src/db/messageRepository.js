import { measure } from "react-native-reanimated";
import {getDB} from "./database";

export const saveMessage = async (
  message,
  userId
) => {
  const db = getDB(userId);

  console.log("message recieved to save",message);

  await db.runAsync(
    `
      INSERT OR REPLACE INTO messages
      (
        id,
        conversationId,

        senderId,
        receiverId,

        plaintext,
        cipherText,
        nonce,
        messageType,

        messageNumber,
        status,

        delivered,
        seen,

        createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      message._id,

      message.conversationId,

      message.senderId,
      message.receiverId,

      message.plaintext,
      message.cipherText,
      message.nonce,
      message.messageType,

      message.messageNumber,
      message.status,

      message.delivered ? 1 : 0,
      message.seen ? 1 : 0,

      message.createdAt
    ]
  );

  console.log("message saved",message);
};

export const getMessagesByConversation =
 async (
  conversationId,
  userId
 ) => {

  const db = getDB(userId);

  return await db.getAllAsync(
    `
      SELECT *
      FROM messages
      WHERE conversationId = ?
      ORDER BY createdAt ASC
    `,
    [conversationId]
  );
};

export const updateMessageStatus =
 async (
  messageId,
  status,
  userId
 ) => {

  const db = getDB(userId);
  await db.runAsync(
   `
    UPDATE messages
    SET status = ?
    WHERE id = ?
   `,
   [status, messageId]
  );
};

export const replaceMessageId =
 async (
  oldId,
  newId,
  userId
 ) => {

  const db = getDB(userId);
  await db.runAsync(
   `
    UPDATE messages
    SET id = ?
    WHERE id = ?
   `,
   [newId, oldId]
  );
};

export const markMessageSent =
 async (
  oldId,
  newId,
  userId
 ) => {

  const db = getDB(userId);
  await db.runAsync(
   `
    UPDATE messages
    SET
      id = ?,
      status = 'sent'
    WHERE id = ?
   `,
   [newId, oldId]
  );
};

export const getLastMessage =
 async (
  conversationId,
  userId
 ) => {

  const db =
   getDB(userId);

  return await db.getFirstAsync(
   `
    SELECT *
    FROM messages
    WHERE conversationId = ?
    ORDER BY messageNumber DESC
    LIMIT 1
   `,
   [conversationId]
  );
};