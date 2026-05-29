import * as SecureStore
 from "expo-secure-store";

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