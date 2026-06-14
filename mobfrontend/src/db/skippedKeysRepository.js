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
     messageKey,
     storedAt
    )
    VALUES (?, ?, ?,datetime('now'))
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

export async function deleteExpiredKeys(db) {
  // Delete any skipped key older than 7 days
  await db.runAsync(
    `DELETE FROM skipped_keys 
     WHERE storedAt < datetime('now', '-7 days')`
  );
}

