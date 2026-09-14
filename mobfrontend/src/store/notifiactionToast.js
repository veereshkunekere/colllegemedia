import { create } from "zustand";

export const useNotificationToastStore =
    create((set) => ({
        notification: null,

        showToast: (notification) => {
            set({
                notification,
            });
        },

        hideToast: () => {
            set({
                notification: null,
            });
        },
    }));