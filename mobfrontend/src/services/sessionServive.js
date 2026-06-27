import * as SecureStore
 from "expo-secure-store";

import {deriveSharedSecret} from "./cryptoService";

export const saveSession = async ( conversationId, session) => {

await SecureStore.setItemAsync(

    `session_${conversationId}`,

    JSON.stringify(
      session
    )
  );
};

export const loadSession = async ( conversationId ) => {

  const data =
   await SecureStore
    .getItemAsync(
      `session_${conversationId}`
    );

  if(!data) return null;

  return JSON.parse(data);
};

export const deleteKeys = async (user) => {
    await SecureStore.deleteItemAsync(`identityPrivateKey_${user}`);
    await SecureStore.deleteItemAsync(`identityPublicKey_${user}`);
    console.log("deleting keys");
}

export const saveSharedSecret = async (
  conversationId,
  sharedSecret,
  userId
) => {
  console.log(
  typeof sharedSecret,
  sharedSecret
);

  await SecureStore.setItemAsync(
    `sharedSecret_${userId}_${conversationId}`,
    sharedSecret
  );
};

export const getSharedSecret = async (conversationId,userId) => {
    const sharedSecret = await SecureStore.getItemAsync(`sharedSecret_${userId}_${conversationId}`);
    return sharedSecret;
}

export const saveRootKey = async ( conversationId, rootKey,user) => {

 await SecureStore.setItemAsync(
  `rootKey_${user}_${conversationId}`,
  rootKey
 );
};

export const getRootKey = async ( conversationId,user) => {

 return await SecureStore.getItemAsync(
  `rootKey_${user}_${conversationId}`
 );
};

// sessionService.js
export const saveReceiveState = async (conversationId, receiveChainKey, receiveMessageNumber, user) => {
  await SecureStore.setItemAsync(
    `receiveState_${user}_${conversationId}`,
    JSON.stringify({ receiveChainKey, receiveMessageNumber })
  );
};

export const getReceiveState = async (conversationId, user) => {
  const data = await SecureStore.getItemAsync(`receiveState_${user}_${conversationId}`);
  if (!data) return { receiveChainKey: null, receiveMessageNumber: -1 };
  const parsed = JSON.parse(data);
  return {
    receiveChainKey: parsed.receiveChainKey ?? null,
    receiveMessageNumber: parsed.receiveMessageNumber ?? -1
  };
};

export const saveSendState = async (conversationId, sendChainKey, sendMessageNumber, user) => {
  await SecureStore.setItemAsync(
    `sendState_${user}_${conversationId}`,
    JSON.stringify({ sendChainKey, sendMessageNumber })
  );
};

export const getSendState = async (conversationId, user) => {
  const data = await SecureStore.getItemAsync(`sendState_${user}_${conversationId}`);
  if (!data) return { sendChainKey: null, sendMessageNumber: 0 };
  const parsed = JSON.parse(data);
  return {
    sendChainKey: parsed.sendChainKey ?? null,
    sendMessageNumber: parsed.sendMessageNumber ?? 0
  };
};

export const deleteRatchetState =
 async (
  conversationId,
  userId
 ) => {

 await SecureStore.deleteItemAsync(`receiveState_${userId}_${conversationId}`);
await SecureStore.deleteItemAsync(`sendState_${userId}_${conversationId}`);
// keep deleting old keys too for cleanup
await SecureStore.deleteItemAsync(`sendChainKey_${userId}_${conversationId}`);
await SecureStore.deleteItemAsync(`receiveChainKey_${userId}_${conversationId}`);
await SecureStore.deleteItemAsync(`sendMessageNumber_${userId}_${conversationId}`);
await SecureStore.deleteItemAsync(`receiveMessageNumber_${userId}_${conversationId}`);

  console.log(
   "Ratchet state deleted"
  );
};