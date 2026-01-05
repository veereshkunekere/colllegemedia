import api, { BASE_URL } from "../util/api";
import { create } from "zustand";
import { io } from "socket.io-client";

// For socket connection, remove trailing /api if present
const SOCKET_BASE = (BASE_URL && BASE_URL.endsWith('/api')) ? BASE_URL.replace(/\/api$/, '') : BASE_URL;

export const useAuthStore = create((set, get) => ({
  authuser: null,
  isLoggingIn: false,
  isLoggingOut: false,
  isSigningup: false,
  isCheckingAuth: false,
  hasCheckedAuth: false,  // New: Prevents duplicate checkAuth calls
  socket: null,

  login: async (email, password) => {
    try {
      set({ isLoggingIn: true });
      const response = await api.post(`/auth/login`, {
        email: email,
        password: password
      }, {
        withCredentials: true,
      });
      console.log("Response", response);
      if (response.status === 200) {
        console.log(response.data.message);
        set({ authuser: response.data.user, isLoggingIn: false });
        localStorage.setItem("id", response.data.user._id);
        get().connectSocket();
        return response;
      } else {
        set({ isLoggingIn: false });
        console.log(response.data);
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      set({ isLoggingIn: false });
      console.error("Error during login:", error);
      throw error;  // Re-throw for component catch
    }
  },

  connectSocket: () => {
    const { authuser, socket, hasCheckedAuth } = get();
    if (!authuser || socket?.connected || !hasCheckedAuth) return;  // Strong guard: Skip duplicates
    console.log("Connecting socket...");
    console.log("authuser", authuser);
    const newSocket = io(SOCKET_BASE || '/', {
      query: { userId: authuser._id },
      withCredentials: true,
    });
    newSocket.on("connect", () => {
      console.log("Socket connected successfully:", newSocket.id);
    });
    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });
    set({ socket: newSocket });
    console.log("New socket created:", newSocket);
  },

  checkAuth: async () => {
    const { hasCheckedAuth } = get();
    if (hasCheckedAuth) {
      console.log("Auth already checked—skipping");  // Log to confirm guard
      return;
    }
    set({ isCheckingAuth: true, hasCheckedAuth: true });  // Set guard EARLY
    try {
      const response = await api.get(`/auth/verify-token`);
      console.log("Auth check response:", response);
      if (response.status === 200 && response.data.user && response.data.data === "authorized") {
        set({ authuser: response.data.user });
        localStorage.setItem("id", response.data.user._id);
        get().connectSocket();  // Only call once
      } else {
        console.log("User not authenticated");
        set({ authuser: null });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      set({ authuser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoggingOut: true });
      const response = await api.post(`/auth/logout`, {});
      if (response.status === 200) {
        const socket = get().socket;
        set({ authuser: null, socket: null, hasCheckedAuth: false });  // Reset guard for next login
        localStorage.removeItem("id");
        socket?.disconnect();
        console.log("Logout successful:", response.data.message);
      } else {
        console.log("Logout failed:", response.data.message);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      set({ isLoggingOut: false });
    }
  },
}));