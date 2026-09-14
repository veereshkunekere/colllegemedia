import { getSocket } from "./socketManager";
import { SocketEvents } from "./SocketEvents";
import { useNotificationStore } from "../../store/notificationStore";
import { useNotificationToastStore } from "../../store/notifiactionToast";
export const registerNotificationListener = () => {
    const socket = getSocket();

    if (!socket) {
        console.warn(
            "[Notification] Socket not available"
        );
        return () => {};
    }

    const handleNotification = (notification) => {
        console.log(
            "[Notification] New notification:",
            notification,notification.username
        );

        useNotificationStore
            .getState()
            .addNotification(notification);

        useNotificationToastStore
            .getState()
            .showToast(notification);
    };

    socket.on(
        SocketEvents.NOTIFICATION_NEW,
        handleNotification
    );

    return () => {
        socket.off(
            SocketEvents.NOTIFICATION_NEW,
            handleNotification
        );
    };
};