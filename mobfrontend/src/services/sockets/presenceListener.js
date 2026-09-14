import { getSocket } from "./socketManager";
import { SocketEvents } from "./SocketEvents";
import { usePresenceStore } from "../../store/presenceStore";

export const registerPresenceListener = () => {
    const socket = getSocket();

    if (!socket) return () => {};

    const handleOnline = (userId) => {
        usePresenceStore
            .getState()
            .setOnline(userId);
    };

    const handleOffline = (userId) => {
        usePresenceStore
            .getState()
            .setOffline(userId);
    };

    socket.on(
        SocketEvents.USER_ONLINE,
        handleOnline
    );

    socket.on(
        SocketEvents.USER_OFFLINE,
        handleOffline
    );

    return () => {
        socket.off(
            SocketEvents.USER_ONLINE,
            handleOnline
        );

        socket.off(
            SocketEvents.USER_OFFLINE,
            handleOffline
        );
    };
};