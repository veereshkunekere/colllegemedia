import { getDB }
 from "./database";

export const saveSkippedKey =
 async (
  conversationId,
  messageNumber,
  messageKey,
  userId
 ) => {

  const db =
   getDB(userId);

  await db.runAsync(
   `
    INSERT OR REPLACE
    INTO skipped_keys
    (
     conversationId,
     messageNumber,
     messageKey
    )
    VALUES (?, ?, ?)
   `,
   [
    conversationId,
    messageNumber,
    messageKey
   ]
  );
};

export const getSkippedKey =
 async (
  conversationId,
  messageNumber,
  userId
 ) => {

  const db =
   getDB(userId);

  return await db.getFirstAsync(
   `
    SELECT *
    FROM skipped_keys
    WHERE
      conversationId = ?
    AND
      messageNumber = ?
   `,
   [
    conversationId,
    messageNumber
   ]
  );
};

export const deleteSkippedKey =
 async (
  conversationId,
  messageNumber,
  userId
 ) => {

  const db =
   getDB(userId);

  await db.runAsync(
   `
    DELETE
    FROM skipped_keys
    WHERE
      conversationId = ?
    AND
      messageNumber = ?
   `,
   [
    conversationId,
    messageNumber
   ]
  );
};

export const getSkippedNumbers = async (conversationId, userId) => {
  const db = getDB(userId);
  const rows = await db.getAllAsync(
    `
      SELECT messageNumber
      FROM skipped_keys
      WHERE conversationId = ?
      ORDER BY messageNumber ASC
    `,
    [conversationId]
  );
  return rows.map((row) => Number(row.messageNumber));
};
