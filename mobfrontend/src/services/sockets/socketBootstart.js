import { connectSocket } from "./socketManager";

import {
    registerPresenceListener,
} from "./presenceListener";

import {
    registerMessageListener,
} from "./messageListener";

import {
    registerNotificationListener,
} from "./notificationListener";

import { useChatStore } from "../../store/chatStore";

export const startSocketServices = ({
    token,
    userId,
}) => {

    const socket = connectSocket({
        token,
    });

    socket.userId = userId;
    useChatStore.setState({
    currentUserId: userId
});

    const cleanupPresence =
        registerPresenceListener();

    const cleanupMessages =
        registerMessageListener();

    const cleanupNotifications =
        registerNotificationListener();

    return () => {
        cleanupPresence();
        cleanupMessages();
        cleanupNotifications();
    };
};