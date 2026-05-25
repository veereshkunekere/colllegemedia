import { create }
  from "zustand";

import API
  from "../services/api";

import {
  connectSocket,
  getSocket,
} from "../services/socket";

export const useChatStore =
  create((set, get) => ({

    conversations: [],

    messages: [],

    activeConversation:
      null,

    socketConnected:
      false,
    
    onlineUsers: [],



    // CONNECT SOCKET

    connectRealtime:({token}) => {

        if ( get().socketConnected) {
           return;
       }

        const socket = connectSocket({token});
        socket.off("connect");
        socket.off("disconnect");
        socket.off("newMessage");
        socket.off("connect_error");

        socket.on("connect_error", (err) => {
             console.log("socket auth failed",err.message);
            }
        );

        socket.on( "connect",() => {
          console.log("socket connected",socket.id);
            set({
              socketConnected:
                true,
            });
          },
          
        );

        socket.on("disconnect",() => {
             set({ socketConnected: false,});
          });



        // NEW MESSAGE

        socket.on("newMessage", ( message ) => {
            const current = get().activeConversation;
            if (  String(current) === String(message.conversationId ) ) {
              set( ( state ) => ({
                  messages:
                    [
                      ...state.messages,

                      message,
                    ],
                })
              );
            }
            set((state) => {
                const exists =
                state.messages.some(
                  (msg) =>
                    msg._id ===
                    message._id
                );

              if (exists) {
                return state;
              }

              return {
                messages: [
                  ...state.messages,
            
                   message,
                ],
              };
          });
          }
        );
      },



    // LOAD INBOX

    loadConversations:  async () => {
        try {

          const res =
            await API.get(
              "/messages/conversations"
            );

          set({
            conversations:
              res.data
                .conversations,
          });

        } catch (
          error
        ) {
          console.log(
            error
          );
        }
      },



    // OPEN CHAT

    openConversation:  async (
        conversationId
      ) => {

        set({
          activeConversation:
            conversationId,

          messages: [],
        });

        const socket = getSocket();

        socket.emit(
          "joinConversation",

          conversationId
        );

        await get()
          .loadMessages(
            conversationId
          );
      },



    // LOAD MESSAGES

    loadMessages:  async (
        conversationId
      ) => {

        try {

          const res =
            await API.get(
              `/messages/${conversationId}`
            );

          set({
            messages:
              res.data
                .messages,
          });

        } catch (
          error
        ) {
          console.log(
            error
          );
        }
      },



    // SEND MESSAGE

   sendMessage:  async (payload) => {

    const optimisticMessage = {

      ...payload,

      _id:
        payload.clientTempId,

      decryptedText:
        payload.cipherText,

      senderId:
        payload.senderId,

      status:
        "sending",

      optimistic: true,

      createdAt:
        new Date(),
    };



    // ADD IMMEDIATELY

    set((state) => ({
      messages: [
        ...state.messages,

        optimisticMessage,
      ],
    }));



    try {

      const res =
        await API.post(
          "/messages/sendMessage",

          payload
        );

      const realMessage =
        res.data.newMessage;

      // REPLACE TEMP

      set((state) => ({
        messages:
          state.messages.map(
            (msg) =>
              msg._id ===
              payload.clientTempId
                ? {
                    ...realMessage,

                    decryptedText:
                      payload.cipherText,

                    status:
                      "sent",
                  }
                : msg
          ),
      }));

    } catch (error) {

      // MARK FAILED

      set((state) => ({
        messages:
          state.messages.map(
            (msg) =>
              msg._id ===
              payload.clientTempId
                ? {
                    ...msg,

                    status:
                      "failed",
                  }
                : msg
          ),
      }));

      console.log(error);
    }
  },

  }));