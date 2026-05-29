import { create }
  from "zustand";

import API
  from "../services/api";

import {
  connectSocket,
  getSocket,
} from "../services/socket";
import { useAuthStore } from "./authStore";
import { getIdentityKeys,deriveSharedSecret,encryptMessage,decryptMessage } from "../services/cryptoService";
import axios from "axios";


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

    sharedSecret: null,


    // CONNECT SOCKET

    selectActiveConv:(conversation) => {
        set({activeConversation:conversation});
    },

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
          console.log("new msg received",message);
          if ( message.conversationId !== get().activeConversation?._id ) return;
          console.log("msg is for me only");
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

              const plaintext = decryptMessage(
  message.cipherText,
  message.nonce,
  get().sharedSecret
);

console.log("plaintxt",plaintext);

message.plaintext = plaintext;
console.log(message.plaintext);
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

            console.log("result is",res.data)
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

    openConversation:  async ( conversationId ,myId ) => {
        
        console.log("selected conversationId",conversationId);
        const myKeys = await getIdentityKeys(myId);
        const conversation =  get().activeConversation;
        console.log(conversation);
        const receiverId = conversation.participants.find(p => String(p._id) !== String(myId));
        const res = await API.get(`/user/public-key/${receiverId._id}`);

const sharedSecret =
 deriveSharedSecret(

  myKeys.privateKey,

  res.data.publicKey

 );

 set({sharedSecret});

        set({
          activeConversation:
            conversationId,

          messages: [],
        });

        console.log(
 "MY ID",
 myId
);

console.log(
 "RECEIVER ID",
 receiverId
);

console.log(
 "MY PUB",
 myKeys.publicKey
);

console.log(
 "RECEIVER PUB",
 res.data.publicKey
);

console.log(
 "SHARED SECRET",
 sharedSecret
);
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

    console.log("payload",payload);
    

    const encrypted = encryptMessage(payload.cipherText,get().sharedSecret);

    const optimisticMessage = {

      ...payload,

      _id:
        payload.clientTempId,

      plaintext:
        payload.cipherText,

      senderId:
        payload.senderId,

      status:
        "sending",

      conversationId:payload.conversationId,

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

      const finalPayload = {...payload,cipherText: encrypted.cipherText, nonce: encrypted.nonce,};

      const res =
        await API.post(
          "/messages/sendMessage",

          finalPayload
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
           plaintext:
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