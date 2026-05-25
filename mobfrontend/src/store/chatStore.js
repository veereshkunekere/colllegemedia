import { create }
  from "zustand";

import API
  from "../services/api";

import {
  connectSocket,
  getSocket,
} from "../services/socket";
import { useAuthStore } from "./authStore";


export const useChatStore =
  create((set, get) => ({

    conversations: [],

    messages: [],

    activeConversation:
      null,

    socketConnected:
      false,
    
    onlineUsers: [],

    currentUserId:null,


    // CONNECT SOCKET

    connectRealtime:({token , userId}) => {

        if ( get().socketConnected) {
           return;
       }
         set({currentUserId:userId});

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
          if ( message.conversationId !== get().activeConversation ) return;
           if(message.senderId !== get().currentUserId) socket.emit( "messageDelivered", { messageId: message._id, });
            const current = get().activeConversation;
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

        socket.on("messageDelivered", ({ messageId }) => {

               set((state) => ({

                messages:
                 state.messages.map(
                  (msg)=>

                   msg._id === messageId
                    ? {
                                   ...msg,
                        status:
                         "delivered",
                      }
                    : msg
                 ),
              }));
            }
           );

       socket.on( "messagesSeen", ({ conversationId }) => {

             const currentUserId = get().currentUserId;

             set((state) => ({

                messages : state.messages.map( (msg) =>
                   msg.conversationId === conversationId &&
                    msg.senderId === currentUserId ? {
                                         ...msg,
                                         status: "seen",
                                    } : msg
                ),
             }));
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

            console.log("result is",res.data.messages)
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

        console.log("selected conversationId",conversationId);
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
          // console.log("result of loadMessages",res.data.messages);
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

     set((state) => {

 const withoutTemp =
   state.messages.filter(
    (msg)=>
      msg._id !==
      payload.clientTempId
   );

 const exists =
   withoutTemp.some(
    (msg)=>
      msg._id ===
      realMessage._id
   );

 return {
   messages:
    exists
     ? withoutTemp
     : [
         ...withoutTemp,
         {
           ...realMessage,
           decryptedText:
            payload.cipherText,
           status:"sent",
         }
       ]
 };
});

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