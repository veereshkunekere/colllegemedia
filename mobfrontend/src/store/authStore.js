import { create } from "zustand";

import {
  loginUser,
  logoutUser,
  registerUser,
  verifyToken,
  verifyOtpRequest,
  updatePublicKey,
} from "../services/authService";

import {
  saveToken,
  getToken,
  removeToken,
} from "../utils/storage";

import {
  generateIdentityKeys,
  getIdentityKeys,
} from "../services/cryptoService";

import { useChatStore } from "../store/chatStore";

import {deleteKeys,deleteRatchetState} from "../services/sessionServive";
import {clearDatabase,initDB} from "../db/database";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: false,
  isCheckingAuth: true,

  // ─── SIGNUP ────────────────────────────────────────────────────────────────
  // Sends user details to /auth/verify-email with publicKey: null.
  // No key generation happens here — keys are created on the OTP screen.
  // Backend returns the saved unverified user; we store it so verifyEmail()
  // can key generation to user._id instead of email.
  signup: async (userData) => {
    try {
      set({ loading: true });

      const data = await registerUser({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        department: userData.department,
        batch: userData.batch,
        course: userData.course,
        publicKey: null, // never send a key at signup
      });

      // Store unverified user so verifyEmail() has access to user._id
      set({ user: data.user });

      return { success: true };
    } catch (error) {
      console.log("Error in authStore.signup:", error);
      return {
        success: false,
        message: error.message || "Signup failed",
      };
    } finally {
      set({ loading: false });
    }
  },

  // ─── VERIFY EMAIL (OTP screen) ─────────────────────────────────────────────
  // 1. Read user._id from state (set during signup).
  // 2. Try to load existing identity keys by userId.
  // 3. Only generate new keys if none exist — safe for OTP retries.
  // 4. Send { email, otp, publicKey } to /auth/verify-otp.
  // 5. Save token, update store, connect socket.
  // No email-based key lookup, no key migration.
  verifyEmail: async (email, otp) => {
    try {
      set({ loading: true });

      const userId = get().user?._id;
      if (!userId) {
        return {
          success: false,
          message: "User session lost. Please sign up again.",
        };
      }

      // Load keys if they already exist (retry-safe)
      let keys = null;
      try {
        keys = await getIdentityKeys(userId);
      } catch (_) {
        // Key doesn't exist yet — will generate below
      }

      if (!keys || !keys.publicKey || !keys.privateKey) {
        keys = await generateIdentityKeys(userId);
      }

      // Only publicKey goes to the server; privateKey stays in SecureStore
      const data = await verifyOtpRequest(email, otp, keys.publicKey);

      await saveToken(data.token);

      set({ user: data.user, token: data.token });

      useChatStore
        .getState()
        .connectRealtime({ token: data.token, userId: data.user._id });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || "OTP verification failed",
      };
    } finally {
      set({ loading: false });
    }
  },

  // ─── LOGIN ─────────────────────────────────────────────────────────────────
  // Load identity keys by userId after login.
  // If missing (new device), generate new keys and push publicKey to backend.
  login: async (email, password) => {
    try {
      set({ loading: true });

      const data = await loginUser(email, password);

      await saveToken(data.token);

      set({ user: data.user, token: data.token });
      await initDB(data.user._id);

      let keys = null;
      try {
        keys = await getIdentityKeys(data.user._id);
      } catch (_) {}

      if (!keys || !keys.publicKey || !keys.privateKey) {
        keys = await generateIdentityKeys(data.user._id);
      }

      // Sync publicKey with backend if out of date
      if (!data.user.publicKey || data.user.publicKey !== keys.publicKey) {
        await updatePublicKey(keys.publicKey);
      } else {
        console.log("Keys are in sync");
      }

      useChatStore
        .getState()
        .connectRealtime({ token: data.token, userId: data.user._id });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Login failed",
      };
    } finally {
      set({ loading: false });
    }
  },

  // ─── CHECK AUTH (app startup) ──────────────────────────────────────────────
  checkAuth: async () => {
    try {
      const storedToken = await getToken();

      if (!storedToken) {
        set({ isCheckingAuth: false });
        return;
      }

      const data = await verifyToken();
      
      // deleteKeys(data.user._id);
      // deleteRatchetState(data.user._id);
      // await clearDatabase();
      // get().logout();
      // return;

      set({ user: data.user, token: storedToken });
      await initDB(data.user._id);
 
      let keys = null;
      try {
        keys = await getIdentityKeys(data.user._id);
      } catch (_) {}

      if (!keys || !keys.privateKey || !keys.publicKey) {
        keys = await generateIdentityKeys(data.user._id);
      }

      if (!data.user.publicKey || data.user.publicKey !== keys.publicKey) {
        await updatePublicKey(keys.publicKey);
      } else {
        console.log("Keys are in sync");
      }

      useChatStore
        .getState()
        .connectRealtime({ token: storedToken, userId: data.user._id });
    } catch (error) {
      console.log("checkAuth error:", error);
      await removeToken();
      set({ user: null, token: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // ─── LOGOUT ────────────────────────────────────────────────────────────────
  logout: async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.log("Logout error:", error);
    }
    await removeToken();
    set({ user: null, token: null });
  },
}));