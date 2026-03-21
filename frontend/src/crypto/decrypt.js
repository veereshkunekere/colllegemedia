export async function decryptMessage(payload, sessionKey) {
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(payload.iv)
    },
    sessionKey,
    new Uint8Array(payload.data)
  );

  return new TextDecoder().decode(decrypted);
}
