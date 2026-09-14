import { getSocket } from "./socketManager";
import { SocketEvents } from "./SocketEvents";
import {useChatStore} from "../../store/chatStore";

export const registerMessageListener = () => {
    const socket = getSocket();

    if (!socket) {
        console.warn(
            "[Message] Socket not available"
        );
        return () => {};
    }

    const handleNewMessage = (message) => {
        useChatStore
            .getState()
            .handleNewMessage(message);
    };

    const handleMessageDelivered = (data) => {
        useChatStore
            .getState()
            .handleMessageDelivered(data);
    };

    const handleMessagesSeen = (data) => {
        useChatStore
            .getState()
            .handleMessagesSeen(data);
    };
    
     socket.on(
        SocketEvents.NEW_MESSAGE,
        handleNewMessage
    );

    socket.on(
        SocketEvents.MESSAGE_DELIVERED,
        handleMessageDelivered
    );

    socket.on(
        SocketEvents.MESSAGES_SEEN,
        handleMessagesSeen
    );

    return () => {
        socket.off(
            SocketEvents.NEW_MESSAGE,
            handleNewMessage
        );

        socket.off(
            SocketEvents.MESSAGE_DELIVERED,
            handleMessageDelivered
        );

        socket.off(
            SocketEvents.MESSAGES_SEEN,
            handleMessagesSeen
        );
    };

}
    
    