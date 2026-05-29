import { create } from "zustand";
import API from "../services/api";

import {
  loginUser,
  logoutUser,
  verifyToken,
} from "../services/authService";

import {
  saveToken,
  getToken,
  removeToken,
} from "../utils/storage";

import {useChatStore} from "../store/chatStore"

import {
 ensureIdentityKeys
}
from "../services/cryptoService";

import {
 updatePublicKey
}
from "../services/authService";

import {deleteKeys} from "../services/sessionServive"
export const useAuthStore =
  create((set,get) => ({
    user: null,

    token: null,

    loading: false,

    isCheckingAuth: true,

    login: async (
      email,
      password
    ) => {
      try {
        set({
          loading: true,
        });

        const data =
          await loginUser(
            email,
            password
          );

        await saveToken(
          data.token
        );

        console.log("token is",data.token);

        set({
          user: data.user,
          token: data.token,
        });
        console.log(data);
        console.log(get().user);

        const keys = await ensureIdentityKeys(data.user._id);

await updatePublicKey(
 keys.publicKey
);



console.log(
 "Identity keys ready",
 keys
);

        useChatStore.getState().connectRealtime({token: data.token,userId:data.user._id});

        return {
          success: true,
        };
      } catch (error) {
        return {
          success: false,
          message:
            error.message ||
            "Login failed",
        };
      } finally {
        set({
          loading: false,
        });
      }
    },

    logout: async () => {
      try {
        await logoutUser();

        await removeToken();

        set({
          user: null,
          token: null,
        });
      } catch (error) {
        console.log(
          "Logout Error:",
          error
        );
      }
    },

    checkAuth: async () => {
      try {
        const storedToken = await getToken();


        if (!storedToken) {
          set({
            isCheckingAuth:
              false,
          });

          return;
        }

        const data = await verifyToken();

        set({
          user: data.user,
          token:
            storedToken,
        });
                
        // await deleteKeys(data.user._id);
        // get().logout();
        // return;
        

        const keys =
 await ensureIdentityKeys(
  data.user._id
 );

 const res =await updatePublicKey(
  keys.publicKey
);
console.log("res for update of pubKey",res);
console.log(
 "keys are",
 keys
);

        useChatStore.getState().connectRealtime({token: storedToken,userId:data.user._id});
      } catch (error) {
        await removeToken();

        set({
          user: null,
          token: null,
        });
      } finally {
        set({
          isCheckingAuth:
            false,
        });
      }
    },
  }));