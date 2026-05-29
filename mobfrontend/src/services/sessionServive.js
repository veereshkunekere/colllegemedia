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
    await SecureStore.deleteItemAsync(`privateKey_${user}`);
    await SecureStore.deleteItemAsync(`publicKey_${user}`);
    console.log("deleting keys");
}

export const saveSharedSecret = async (
  conversationId,
  sharedSecret
) => {
  console.log(
  typeof sharedSecret,
  sharedSecret
);

  await SecureStore.setItemAsync(
    `sharedSecret_${conversationId}`,
    sharedSecret
  );
};

export const getSharedSecret = async (conversationId) => {
    const sharedSecret = await SecureStore.getItemAsync(`sharedSecret_${conversationId}`);
    return sharedSecret;
}

export const saveRootKey = async ( conversationId, rootKey) => {

 await SecureStore.setItemAsync(
  `rootKey_${conversationId}`,
  rootKey
 );
};

export const getRootKey = async ( conversationId) => {

 return await SecureStore.getItemAsync(
  `rootKey_${conversationId}`
 );
};

export const saveChainKeys = async ( conversationId, sendChainKey,receiveChainKey) => {

 await SecureStore.setItemAsync(
  `sendChainKey_${conversationId}`,
  sendChainKey
 );

 await SecureStore.setItemAsync(
  `receiveChainKey_${conversationId}`,
  receiveChainKey
 );
};

export const getChainKeys = async ( conversationId ) => {

 const sendChainKey =
  await SecureStore.getItemAsync(
   `sendChainKey_${conversationId}`
  );

 const receiveChainKey =
  await SecureStore.getItemAsync(
   `receiveChainKey_${conversationId}`
  );

 return {
  sendChainKey,
  receiveChainKey
 };
};

export const saveMessageNumbers = async (
  conversationId,
  sendMessageNumber,
  receiveMessageNumber
) => {

  await SecureStore.setItemAsync(
    `sendMessageNumber_${conversationId}`,
    String(sendMessageNumber)
  );

  await SecureStore.setItemAsync(
    `receiveMessageNumber_${conversationId}`,
    String(receiveMessageNumber)
  );
};

export const getMessageNumbers = async (
  conversationId
) => {

  const sendMessageNumber =
    await SecureStore.getItemAsync(
      `sendMessageNumber_${conversationId}`
    );

  const receiveMessageNumber =
    await SecureStore.getItemAsync(
      `receiveMessageNumber_${conversationId}`
    );

  return {
    sendMessageNumber:
      sendMessageNumber
        ? Number(sendMessageNumber)
        : 0,

    receiveMessageNumber:
      receiveMessageNumber
        ? Number(receiveMessageNumber)
        : -1
  };
};