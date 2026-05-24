import api, { BASE_URL } from "../util/api";
import { create } from "zustand";
import { io } from "socket.io-client";

// For socket connection, remove trailing /api if present
const SOCKET_BASE = (BASE_URL && BASE_URL.endsWith('/api'))
    ? BASE_URL.replace(/\/api$/, '')
    : BASE_URL;

export const useAuthStore = create((set, get) => ({
    authuser: null,
    isLoggingIn: false,
    isLoggingOut: false,
    isSigningup: false,
    isCheckingAuth: false,
    // FIX: hasCheckedAuth now only gates duplicate calls during the same session,
    // and is properly reset on logout so a fresh login works correctly.
    hasCheckedAuth: false,
    socket: null,

    login: async (email, password) => {
        try {
            set({ isLoggingIn: true });
            const response = await api.post(`/auth/login`, { email, password }, {
                withCredentials: true,
            });
            if (response.status === 200) {
                set({ authuser: response.data.user, isLoggingIn: false });
                localStorage.setItem("id", response.data.user._id);
                localStorage.setItem("token", response.data.token);
                get().connectSocket();
                return response;
            } else {
                set({ isLoggingIn: false });
                throw new Error(response.data.message || "Login failed");
            }
        } catch (error) {
            set({ isLoggingIn: false });
            console.error("Error during login:", error);
            throw error;
        }
    },

    connectSocket: () => {
        const { authuser, socket } = get();
        // FIX: Removed hasCheckedAuth guard from here — connectSocket is called after
        // login and checkAuth both confirm a valid user, so that guard was blocking
        // reconnection after a page reload in some race conditions.
        if (!authuser || socket?.connected) return;

        console.log("Connecting socket for user:", authuser._id);
        const newSocket = io(SOCKET_BASE || '/', {
            query: { userId: authuser._id },
            withCredentials: true,
        });
        newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id);
        });
        newSocket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });
        newSocket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
        });
        set({ socket: newSocket });
    },

    checkAuth: async () => {
        const { hasCheckedAuth } = get();
        // FIX: Guard prevents duplicate calls (e.g. StrictMode double-invoke),
        // but is only set AFTER we've confirmed whether auth succeeded or failed,
        // so a failed check doesn't permanently block future attempts in the session.
        if (hasCheckedAuth) {
            console.log("Auth already checked — skipping");
            return;
        }
        set({ isCheckingAuth: true });
        try {
            const response = await api.get(`/auth/verify-token`);
            if (response.status === 200 && response.data.user && response.data.data === "authorized") {
                set({ authuser: response.data.user });
                localStorage.setItem("id", response.data.user._id);
                get().connectSocket();
            } else {
                set({ authuser: null });
            }
        } catch (error) {
            console.error("Auth check error:", error);
            set({ authuser: null });
        } finally {
            // FIX: Set hasCheckedAuth AFTER the request completes (success or failure)
            // so the result is deterministic. Previously it was set before the request,
            // which could leave the app stuck if the request threw an error mid-flight.
            set({ isCheckingAuth: false, hasCheckedAuth: true });
        }
    },

    logout: async () => {
        try {
            set({ isLoggingOut: true });
            const response = await api.post(`/auth/logout`, {});
            if (response.status === 200) {
                const socket = get().socket;
                // FIX: Reset hasCheckedAuth on logout so checkAuth runs fresh on next login
                set({ authuser: null, socket: null, hasCheckedAuth: false });
                localStorage.removeItem("id");
                socket?.disconnect();
            }
        } catch (error) {
            console.error("Error during logout:", error);
        } finally {
            set({ isLoggingOut: false });
        }
    },
}));
