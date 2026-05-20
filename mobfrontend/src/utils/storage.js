import * as SecureStore
  from "expo-secure-store";

const TOKEN_KEY = "auth_token";

export const saveToken =
  async (token) => {
    try {
      await SecureStore.setItemAsync(
        TOKEN_KEY,
        token
      );
    } catch (error) {
      console.log(
        "Error saving token:",
        error
      );
    }
  };

export const getToken =
  async () => {
    try {
      return await SecureStore.getItemAsync(
        TOKEN_KEY
      );
    } catch (error) {
      console.log(
        "Error getting token:",
        error
      );

      return null;
    }
  };

export const removeToken =
  async () => {
    try {
      await SecureStore.deleteItemAsync(
        TOKEN_KEY
      );
    } catch (error) {
      console.log(
        "Error removing token:",
        error
      );
    }
  };