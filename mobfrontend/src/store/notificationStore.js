import { create } from "zustand";
import API from "../services/api";
import {useChatStore} from "../store/chatStore"
export const useNotificationStore = create((set) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,

    fetchNotifications: async () => {
        try {
            set({
                loading: true,
                error: null,
            });

            const response = await API.get(`/notifications`);

            const data = await response.data;
            console.log(
                "[Notification] Fetched notifications:",
                response.status,
                response.success,
                data.success
            );

            if (response.status !== 200 || !data.success) {
                throw new Error(
                    data.message ||
                        "Failed to fetch notifications"
                );
            }

            const notifications =
                data.notifications || [];

            set({
                notifications,
                unreadCount:
                    notifications.filter(
                        (notification) =>
                            !notification.isRead
                    ).length,
                loading: false,
            });
        } catch (error) {
            console.error(
                "[Notification] Fetch error:",
                error
            );

            set({
                loading: false,
                error: error.message,
            });
        }
    },

    addNotification: (notification) => {
        console.log(
            "[Notification] Adding notification:",
            notification.entityId,"activeConversation:",useChatStore.getState().activeConversation?._id
        );

        if(!notification || !notification._id) {
            console.error(
                "[Notification] Invalid notification object:",
                notification
            );
            return;
        }

       const activeConversationId =
        useChatStore.getState().activeConversation?._id;

       const isActiveConversation =
        String(activeConversationId) ===
        String(notification.entityId);
 
        if(isActiveConversation && notification.type === "MESSAGE") {
            console.log(
                "[Notification] Notification is for active conversation, marking as read immediately."
            );
            notification.isRead = true;
        }
        
        set((state) => ({
            notifications: [
                notification,
                ...state.notifications,
            ],

            unreadCount:
                state.unreadCount +
                (notification.isRead ? 0 : 1),
        }));
    },

    markAsRead: async (notificationId) => {
    try {
        await API.patch(`/notifications/${notificationId}/read`);

        set((state) => {
            const notification = state.notifications.find(
                (n) => n._id === notificationId
            );

            if (!notification || notification.isRead) {
                return state;
            }

            return {
                notifications: state.notifications.map((n) =>
                    n._id === notificationId
                        ? { ...n, isRead: true }
                        : n
                ),
                unreadCount: Math.max(
                    0,
                    state.unreadCount - 1
                ),
            };
        });
    } catch (error) {
        console.error(
            "[Notification] Mark as read error:",
            error.response?.data || error.message
        );
    }
    },

    markAllAsRead: async () => {
    try {
        await API.patch("/notifications/read-all");

        set((state) => ({
            notifications: state.notifications.map(
                (notification) => ({
                    ...notification,
                    isRead: true,
                })
            ),
            unreadCount: 0,
        }));
    } catch (error) {
        console.error(
            "[Notification] Mark all as read error:",
            error.response?.data || error.message
        );
    }
    },

    setNotifications: (notifications) => {
        set({
            notifications,

            unreadCount:
                notifications.filter(
                    (notification) =>
                        !notification.isRead
                ).length,
        });
    },

    reset: () => {
        set({
            notifications: [],
            unreadCount: 0,
        });
    },
}));