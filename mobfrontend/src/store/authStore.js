import { create } from "zustand";

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

export const useAuthStore =
  create((set) => ({
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

        useChatStore.getState().connectRealtime({token: data.token});

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

        useChatStore.getState().connectRealtime({token: storedToken});
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