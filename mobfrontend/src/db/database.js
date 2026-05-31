import * as SQLite from "expo-sqlite";

let db = null;
let currentDbUser = null;

export const getDB = (
  userId
) => {

  if (!db || currentDbUser !== userId) {

    db =
      SQLite.openDatabaseSync(
        `collegemedia_${userId}.db`
      );

      currentDbUser = userId;

  }

  return db;
};

export const initDB = async (userId) => {

    const db = getDB(userId);
            
  await db.execAsync(`
    
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversationId TEXT,

      senderId TEXT,
      receiverId TEXT,

      plaintext TEXT,

      cipherText TEXT,
      nonce TEXT,

      messageType TEXT,

      messageNumber INTEGER,

      status TEXT,

      delivered INTEGER,
      seen INTEGER,

      createdAt TEXT
    );

  `);

  await db.execAsync(`
     CREATE TABLE IF NOT EXISTS skipped_keys (
  conversationId TEXT,

  messageNumber INTEGER,

  messageKey TEXT,

  PRIMARY KEY (
    conversationId,
    messageNumber
  )
);
    
    `);

  console.log("SQLite initialized");
};

export default db;