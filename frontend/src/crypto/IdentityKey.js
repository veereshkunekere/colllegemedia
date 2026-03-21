import { db } from "../storage/db";

export async function getOrCreateIdentityKey() {
  const stored = await db.get("keys", "identity");

  if (stored) return stored;

  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey"]
  );

  await db.put("keys", keyPair, "identity");
  return keyPair;
}
