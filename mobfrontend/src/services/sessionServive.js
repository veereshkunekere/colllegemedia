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

export const saveSendState = async ( conversationId, sendChainKey,sendMessageNumber,user) => {
  await SecureStore.setItemAsync(
    `sendChainKey_${user}_${conversationId}`,
    sendChainKey
  );
  await SecureStore.setItemAsync(
    `sendMessageNumber_${user}_${conversationId}`,
    String(sendMessageNumber)
  );
}

export const saveReceiveState = async ( conversationId, receiveChainKey,receiveMessageNumber,user) => {
  await SecureStore.setItemAsync(
    `receiveChainKey_${user}_${conversationId}`,
    receiveChainKey
  );
  await SecureStore.setItemAsync(
    `receiveMessageNumber_${user}_${conversationId}`,
    String(receiveMessageNumber)
  );
}

export const getSendState = async ( conversationId,user) => {
  const sendChainKey = await SecureStore.getItemAsync(
    `sendChainKey_${user}_${conversationId}`
  );
  const sendMessageNumber = await SecureStore.getItemAsync(
    `sendMessageNumber_${user}_${conversationId}`
  );
  return {sendChainKey, sendMessageNumber: Number(sendMessageNumber) || 0};
}

export const getReceiveState = async ( conversationId,user) => {
  const receiveChainKey = await SecureStore.getItemAsync(
    `receiveChainKey_${user}_${conversationId}`
  );
  const receiveMessageNumber = await SecureStore.getItemAsync(
    `receiveMessageNumber_${user}_${conversationId}`
  );
  return {receiveChainKey, receiveMessageNumber: Number(receiveMessageNumber) || -1};
}

export const deleteRatchetState =
 async (
  conversationId,
  userId
 ) => {

  await SecureStore.deleteItemAsync(
   `sharedSecret_${userId}_${conversationId}`
  );

  await SecureStore.deleteItemAsync(
   `rootKey_${userId}_${conversationId}`
  );

  await SecureStore.deleteItemAsync(
   `sendChainKey_${userId}_${conversationId}`
  );

  await SecureStore.deleteItemAsync(
   `receiveChainKey_${userId}_${conversationId}`
  );

  await SecureStore.deleteItemAsync(
   `sendMessageNumber_${userId}_${conversationId}`
  );

  await SecureStore.deleteItemAsync(
   `receiveMessageNumber_${userId}_${conversationId}`
  );

  console.log(
   "Ratchet state deleted"
  );
};