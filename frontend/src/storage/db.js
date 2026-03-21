import { openDB } from "idb";

export const db = await openDB("e2ee-chat", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("keys")) {
      db.createObjectStore("keys");
    }
    if (!db.objectStoreNames.contains("messages")) {
      db.createObjectStore("messages", { keyPath: "id", autoIncrement: true });
    }
  }
});
