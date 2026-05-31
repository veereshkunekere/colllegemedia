import { create }
  from "zustand";

import API
  from "../services/api";

import {
  connectSocket,
  getSocket,
} from "../services/socket";

import * as SecureStore
 from "expo-secure-store";
import { getIdentityKeys,deriveSharedSecret,encryptMessage,decryptMessage,deriveRootKey,deriveInitialChainKeys,deriveMessageKey,advanceChainKey, } from "../services/cryptoService";
import {getSharedSecret,saveSharedSecret,getRootKey,saveRootKey,saveChainKeys,getChainKeys,loadSession,getMessageNumbers,saveMessageNumbers,deleteRatchetState,deleteKeys} from "../services/sessionServive"
import axios from "axios";
import {saveSkippedKey,getSkippedKey,deleteSkippedKey} from "../db/skippedKeysRepository"
import { saveMessage,getMessagesByConversation,markMessageSent,updateMessageStatus, getLastMessage } from "../db/messageRepository";

async function processIncomingMessage(message,myId,socket,set,get){
  console.log("recieved msgs for process",message);
 const { sendChainKey, receiveChainKey} = await getChainKeys(message.conversationId,myId);
            const { sendMessageNumber, receiveMessageNumber} = await getMessageNumbers( message.conversationId,myId);
            const MAX_SKIP = 50;
            if(
             message.messageNumber -
             receiveMessageNumber >
             MAX_SKIP
            ){
             console.log(
              "too many skipped messages"
             );
             return;
            }
            console.log("RECIEVE CHAIN", receiveChainKey);
console.log(
 "incoming",
 message.messageNumber
);

console.log(
 "last received",
 receiveMessageNumber
);
             
              if ( message.messageNumber <= receiveMessageNumber ) {
                const skipped = await getSkippedKey(
                 message.conversationId,
                 message.messageNumber,
                 myId
                );

               if(skipped){

                const plaintext =
                 decryptMessage(
                  message.cipherText,
                  message.nonce,
                  skipped.messageKey
                 );

                await deleteSkippedKey(
                 message.conversationId,
                 message.messageNumber,
                 myId
                );

                message.plaintext =
                 plaintext;

                await saveMessage(
                 message,
                 myId
                );

                set((state) => {
                   const exists =
                     state.messages.some(
                       msg => msg._id === message._id
                     );

                   if (exists) return state;

                   return {
                     messages: [
                       ...state.messages,
                       message
                     ]
                   };
                 });

                return;
               }
               }
               let currentReceive = receiveMessageNumber;
               let currentChain = receiveChainKey;
               while(currentReceive + 1 < message.messageNumber){

 const skippedKey =
  deriveMessageKey(
   currentChain
  );

 await saveSkippedKey(
  message.conversationId,
  currentReceive + 1,
  skippedKey,
  myId
 );

 currentChain =
  advanceChainKey(
   currentChain
  );

 currentReceive++;

}
              const messageKey = deriveMessageKey( currentChain);
              const plaintext = decryptMessage(
                                 message.cipherText,
                                 message.nonce,
                                 messageKey
                                );

              console.log("plaintxt",plaintext);

                 message.plaintext = plaintext;
                 message.messageType = message.messageType || "text";
                 message.status = message.status || "received";
                 await saveMessage(message,myId);

                 await saveMessageNumbers(
                  message.conversationId, 
                  sendMessageNumber,
                  Math.max( message.messageNumber,receiveMessageNumber),
                  myId
                );

                const nextReceiveChain = advanceChainKey(currentChain);

                await saveChainKeys(
                        message.conversationId,
                        sendChainKey,
                        nextReceiveChain,
                        socket.userId
                      );
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
              console.log(message.plaintext);
              return {
                messages: [
                  ...state.messages,
            
                   message,
                ],
              };
          });
}

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

        socket.userId = userId;

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

        socket.on("newMessage", async ( message ) => {
          console.log( "RECEIVE NUMBER", message.messageNumber);
          console.log("new msg received",message);
          console.log(get().activeConversation);
  // Ignore my own message
          if ( message.conversationId !== get().activeConversation ) return;
          if ( message.senderId === socket.userId) {
              return;
           }
          console.log("msg is for me only");
           if(message.senderId !== get().currentUserId) socket.emit( "messageDelivered", { messageId: message._id, });
            processIncomingMessage(message,socket.userId,socket,set,get);
           
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

//       await deleteRatchetState(
//   conversationId,
//   myId
// );

        console.log("selected conversationId",conversationId);
        const nums = await getMessageNumbers( conversationId,myId);



        console.log("MESSAGE NUMBERS",nums);

        const myKeys = await getIdentityKeys(myId);
        const conversation =  get().activeConversation;
        console.log(conversation);
        const receiverId = conversation.participants.find(p => String(p._id) !== String(myId));
        const res = await API.get(`/user/public-key/${receiverId._id}`);

       let sharedSecret = await getSharedSecret(conversationId,myId);

if(!sharedSecret){

  console.log(
  "MY KEYS",
  await getIdentityKeys(myId)
);

console.log(
  "RECEIVER PUB",
  res.data
);
console.log(res.data.publicKey);
  sharedSecret =
   deriveSharedSecret(
    myKeys.privateKey,
    res.data.publicKey
   );

  await saveSharedSecret(
    conversationId,
    sharedSecret,
    myId
  );
}

            let rootKey = await getRootKey( conversationId,myId );

            if(!rootKey){

            rootKey = deriveRootKey( sharedSecret);

            await saveRootKey( conversationId, rootKey,myId);
            let chain = deriveInitialChainKeys( rootKey );
            let sendChainKey = chain.sendChainKey;
            let receiveChainKey = chain.receiveChainKey;
            if(String(myId) !== String(conversation.createdBy)){
                const temp = sendChainKey;
                sendChainKey = receiveChainKey; 
                receiveChainKey = temp;
            }
             await saveChainKeys( conversationId, sendChainKey, receiveChainKey,myId );

            }
console.log(
 "ROOT KEY",
 rootKey
);

console.log(
 await getChainKeys(
  conversationId,
  myId
 )
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
            conversationId,
            myId
          );
      },



    // LOAD MESSAGES

    loadMessages:  async (
        conversationId,
        myId
      ) => {

        try {

          const localMessages = await getMessagesByConversation( conversationId,myId);
          const lastMessage = await getLastMessage( conversationId, myId);
          const lastMessageNumber = lastMessage ? lastMessage.messageNumber : -1;
          const res = await API.get(`/messages/${conversationId}`, {
   params:{
    afterMessageNumber:
      lastMessageNumber
   }});
             console.log("last local msg number",lastMessage);
         console.log(
 "SYNCED",
 res.data.messages.map(
  m => m.messageNumber
 )
);
          set({ messages: localMessages});
          for(const msg of res.data.messages){
            const exists = localMessages.some( m => m._id === msg._id );
            if(exists) continue;
             await processIncomingMessage(
              msg,
              myId,
              getSocket(),
              set,
              get
             )
          }
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
    
    const { sendChainKey, receiveChainKey} = await getChainKeys(payload.conversationId,payload.senderId);
    const messageKey =deriveMessageKey(sendChainKey);
    const { sendMessageNumber, receiveMessageNumber} = await getMessageNumbers( payload.conversationId,payload.senderId);
    const encrypted = encryptMessage(payload.cipherText,messageKey);

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

      messageNumber:sendMessageNumber,

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

    //ADD TO LOCAL
await saveMessage(
  {
  _id: payload.clientTempId,
  ...payload,
  plaintext: payload.cipherText,
  messageType: "text",
  nonce: encrypted.nonce,
  cipherText: encrypted.cipherText,
  status: "sending",
  messageNumber: sendMessageNumber,
  createdAt: new Date().toISOString()
},
payload.senderId
);
    
    console.log("SEND CHAIN", sendChainKey);
    console.log("encrypted data",encrypted);
    try {

      const finalPayload = {...payload,cipherText: encrypted.cipherText, nonce: encrypted.nonce,messageNumber:sendMessageNumber};

      const res =
        await API.post(
          "/messages/sendMessage",

          finalPayload
        );

      const realMessage = res.data.newMessage;
      const nextSendChain = advanceChainKey(sendChainKey);
      await saveChainKeys(payload.conversationId,nextSendChain,receiveChainKey,payload.senderId);
      await saveMessageNumbers(  payload.conversationId,  sendMessageNumber + 1, receiveMessageNumber,payload.senderId);
      await markMessageSent(payload.clientTempId,realMessage._id,payload.senderId);
      
      console.log(await getChainKeys(payload.conversationId,payload.senderId));
      console.log(await getMessageNumbers( payload.conversationId,payload.senderId));

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

    } 
    catch (error) {

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

      await updateMessageStatus(payload.clientTempId,"failed",payload.senderId);
      console.log(error);
    }
  },

  }));