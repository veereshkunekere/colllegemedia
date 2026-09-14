import { create } from "zustand";

export const usePresenceStore = create((set,get) => ({
    onlineUsers: new Set(),

    setOnline: (userId) =>
        set((state) => {
            const onlineUsers = new Set(state.onlineUsers);
            onlineUsers.add(userId);

            return { onlineUsers };
        }),

    setOffline: (userId) =>
        set((state) => {
            const onlineUsers = new Set(state.onlineUsers);
            onlineUsers.delete(userId);

            return { onlineUsers };
        }),

    
    getOnlineUsers: () => {
        return Array.from(get().onlineUsers);
    },

    isOnline: (userId) => {
        return get().onlineUsers.has(userId);
    }
}));