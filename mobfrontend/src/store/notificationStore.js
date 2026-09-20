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

        const data = response.data;

        console.log(
            "[Notification] Fetched notifications:",
            response.status,
            data.success
        );

        if (response.status !== 200 || !data.success) {
            throw new Error(
                data.message ||
                    "Failed to fetch notifications"
            );
        }

        const rawNotifications =
            data.notifications || [];

        // Group MESSAGE notifications by conversation
        const conversationMap = new Map();
        const otherNotifications = [];

        for (const notification of rawNotifications) {

            if (
                notification.type === "MESSAGE" &&
                notification.entityId
            ) {
                const conversationId =
                    String(notification.entityId);

                const existing =
                    conversationMap.get(conversationId);

                if (existing) {

                    // Add this message to the
                    // existing conversation notification
                    existing.unreadMessages =
                        (existing.unreadMessages || 1) + 1;

                    // Keep the latest notification
                    if (
                        new Date(notification.createdAt) >
                        new Date(existing.createdAt)
                    ) {
                        existing.createdAt =
                            notification.createdAt;

                        existing.updatedAt =
                            notification.updatedAt;

                        existing.metadata =
                            notification.metadata;

                        existing._id =
                            notification._id;
                    }

                    // If ANY notification for this
                    // conversation is unread,
                    // conversation remains unread.
                    existing.isRead =
                        existing.isRead &&
                        notification.isRead;

                } else {

                    conversationMap.set(
                        conversationId,
                        {
                            ...notification,
                            unreadMessages:
                                notification.isRead
                                    ? 0
                                    : 1,
                        }
                    );
                }

            } else {

                // Likes, comments, follows, etc.
                otherNotifications.push(
                    notification
                );
            }
        }

        const notifications = [
            ...conversationMap.values(),
            ...otherNotifications,
        ];

        // Sort newest first
        notifications.sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );

        const unreadCount =
            notifications.filter(
                (notification) =>
                    !notification.isRead
            ).length;

        set({
            notifications,
            unreadCount,
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
    if (!notification || !notification._id) {
        console.error(
            "[Notification] Invalid notification:",
            notification
        );
        return;
    }

    const activeConversationId =
        useChatStore.getState().activeConversation?._id;

    const isActiveConversation =
        String(activeConversationId) ===
        String(notification.entityId);

    const notificationToAdd = {
        ...notification,

        isRead:
            isActiveConversation &&
            notification.type === "MESSAGE"
                ? true
                : notification.isRead,
    };

    set((state) => {

        // --------------------------------
        // MESSAGE NOTIFICATION
        // --------------------------------
        if (notification.type === "MESSAGE") {

            const existingIndex =
                state.notifications.findIndex(
                    (item) =>
                        item.type === "MESSAGE" &&
                        String(item.entityId) ===
                            String(notification.entityId)
                );

            // Same conversation already has a notification
            if (existingIndex !== -1) {

                const updatedNotifications =
                    [...state.notifications];

                const existing =
                    updatedNotifications[existingIndex];

                updatedNotifications[existingIndex] = {
                    ...existing,

                    // Keep latest notification data
                    ...notification,

                    // Keep conversation notification unread
                    isRead:
                        existing.isRead &&
                        notificationToAdd.isRead
                            ? true
                            : false,

                    // Number of unread messages
                    unreadMessages:
                        (existing.unreadMessages || 1) + 1,
                };

                return {
                    notifications:
                        updatedNotifications,

                    // IMPORTANT:
                    // don't increase unreadCount
                    // because conversation already exists
                    unreadCount:
                        state.unreadCount,
                };
            }

            // First notification for this conversation
            return {
                notifications: [
                    {
                        ...notificationToAdd,
                        unreadMessages: 1,
                    },
                    ...state.notifications,
                ],

                unreadCount:
                    state.unreadCount +
                    (notificationToAdd.isRead ? 0 : 1),
            };
        }

        // --------------------------------
        // OTHER NOTIFICATIONS
        // --------------------------------

        const exists =
            state.notifications.some(
                (item) =>
                    String(item._id) ===
                    String(notification._id)
            );

        if (exists) {
            console.log(
                "[Notification] Duplicate ignored:",
                notification._id
            );

            return state;
        }

        return {
            notifications: [
                notificationToAdd,
                ...state.notifications,
            ],

            unreadCount:
                state.unreadCount +
                (notificationToAdd.isRead ? 0 : 1),
        };
    });
},

    markAsRead: async (conversationId) => {
    try {
        await API.patch(
            `/notifications/conversation/${conversationId}/read`
        );

        set((state) => ({
            notifications:
                state.notifications.map((notification) =>
                    notification.type === "MESSAGE" &&
                    String(notification.entityId) ===
                        String(conversationId)
                        ? {
                              ...notification,
                              isRead: true,
                              unreadMessages: 0,
                          }
                        : notification
                ),

            unreadCount:
                state.notifications.filter(
                    (notification) =>
                        !notification.isRead &&
                        !(
                            notification.type === "MESSAGE" &&
                            String(notification.entityId) ===
                                String(conversationId)
                        )
                ).length,
        }));
    } catch (error) {
        console.error(
            "[Notification] Conversation read error:",
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