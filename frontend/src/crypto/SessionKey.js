export async function deriveSessionKey(
  myIdentityPrivateKey,
  theirIdentityPublicKey
) {
  return crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: theirIdentityPublicKey
    },
    myIdentityPrivateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}
