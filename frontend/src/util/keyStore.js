import { openDB } from "./indexdb";

/**
 * Store identity keys securely
 */
export async function storeIdentityKeys({
  id,
  encryptedPrivateKey, // Uint8Array
  publicKeyJwk,
  iv,                  // Uint8Array
  salt,                // Uint8Array
}) {
  const db = await openDB();
  const tx = db.transaction("keys", "readwrite");
  const store = tx.objectStore("keys");

  store.put({
    id,
    encryptedPrivateKey,
    publicKeyJwk,
    iv,
    salt,
    createdAt: Date.now(),
  });

  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Retrieve identity keys
 */
export async function getIdentityKeys(id) {
  const db = await openDB();
  const tx = db.transaction("keys", "readonly");
  const store = tx.objectStore("keys");

  return new Promise((resolve, reject) => {
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}


export async function deleteIdentityKeys(id) {
  const db = await openDB();
  const tx = db.transaction("keys", "readwrite");
  const store = tx.objectStore("keys");

  store.delete(id);

  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}
