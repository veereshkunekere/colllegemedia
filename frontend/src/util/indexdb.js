const DB_NAME = "e2ee_chat_db";
const DB_VERSION = 1;

let db = null;

export function openDB() {
  if (db) return Promise.resolve(db);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const dbInstance = event.target.result;

      if (!dbInstance.objectStoreNames.contains("keys")) {
        dbInstance.createObjectStore("keys", { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onerror = () => reject(request.error);
  });
}
