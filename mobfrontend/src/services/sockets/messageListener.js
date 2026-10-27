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

    const handleConnect = async () => {
        const store = useChatStore.getState();
        const conversation = store.activeConversation;
        if (!conversation?._id || !store.currentUserId) return;
        const joined = await store.joinConversation(conversation._id);
        if (joined) await store.loadMessages(conversation._id, store.currentUserId);
    };

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
    
     socket.on("connect", handleConnect);

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
        socket.off("connect", handleConnect);
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
    
    