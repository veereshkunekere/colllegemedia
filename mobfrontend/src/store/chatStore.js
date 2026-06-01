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
import {getSharedSecret,saveSharedSecret,getRootKey,saveRootKey,loadSession,deleteRatchetState,deleteKeys,getReceiveState,getSendState,saveReceiveState,saveSendState} from "../services/sessionServive"
import axios from "axios";
import {saveSkippedKey,getSkippedKey,deleteSkippedKey} from "../db/skippedKeysRepository"
import { saveMessage,getMessagesByConversation,markMessageSent,updateMessageStatus, getLastMessage } from "../db/messageRepository";
import { removeToken } from "../utils/storage";
import { clearDatabase } from "../db/database";

// ============= MUTEX SYSTEM =============
class MutexManager {
  constructor() {
    this.locks = new Map();
  }

  async withLock(key, fn) {
    if (!this.locks.has(key)) {
      this.locks.set(key, Promise.resolve());
    }

    const currentLock = this.locks.get(key);
    const safePrev = currentLock.catch(() => {});
    const nextLock = safePrev.then(async () => {
      console.log("[MUTEX] acquire", key);
      try {
        const result = await fn();
        console.log("[MUTEX] release", key);
        return result;
      } catch (error) {
        console.log("[MUTEX] error", key, error);
        throw error;
      }
    });

    this.locks.set(key, nextLock);

    nextLock.catch(() => {}).finally(() => {
      if (this.locks.get(key) === nextLock) {
        this.locks.delete(key);
      }
    });

    return await nextLock;
  }
}

const receiveMutex = new MutexManager();
const sendMutex = new MutexManager();

async function processIncomingMessage(message,myId,socket,set,get,skipUI=false){
  console.log("recieved msgs for process",message);
  console.log("incoming",message.messageNumber);
  
            const { receiveMessageNumber, receiveChainKey} = await getReceiveState(message.conversationId,myId);
            const { sendMessageNumber, sendChainKey} = await getSendState( message.conversationId,myId);
            console.log("RECIEVE CHAIN", receiveChainKey);
            console.log("last received",receiveMessageNumber);
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

               if(!skipUI){
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
               }

                return message;
               }
               return null;
               }
               let currentReceive = receiveMessageNumber;
               let currentChain = receiveChainKey;
              while(currentReceive + 1 < message.messageNumber){
                const skippedKey = deriveMessageKey( currentChain);

                await saveSkippedKey(message.conversationId,currentReceive + 1,skippedKey,myId);
                currentChain = advanceChainKey( currentChain);

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

                const nextReceiveChain = advanceChainKey(currentChain);

                 await saveReceiveState(
                  message.conversationId,
                  nextReceiveChain,
                  message.messageNumber,
                  myId
                );
           if(!skipUI){

  set((state) => {

    const exists =
     state.messages.some(
      msg => msg._id === message._id
     );

    if(exists){
      return state;
    }

    return {
      messages:[
        ...state.messages,
        message
      ]
    };
  });

}

return message;
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

    isSyncing: false,
    pendingMessages: [],

    receiveQueue: [],
    receiveWorkerRunning: false,
    receiveProcessingIds: new Set(),

    sendQueue: [],
    sendWorkerRunning: false,


    // ===== RECEIVE QUEUE METHODS =====
    enqueueReceiveMessage: (message) => {
      const state = get();
      
      if (!message) {
        return;
      }

      if (state.receiveProcessingIds.has(message._id)) {
        console.log("[RECEIVE QUEUE] ignoring duplicate message", message._id);
        return;
      }

      const queueLength = state.receiveQueue.length + 1;
      console.log("[RECEIVE QUEUE] enqueue", message._id, "messageNumber:", message.messageNumber, "queueLength:", queueLength);
      if (queueLength > 100) {
        console.warn("[RECEIVE QUEUE] unusually large", queueLength);
      }
      
      set((s) => ({
        receiveProcessingIds: new Set([...s.receiveProcessingIds, message._id]),
        receiveQueue: [...s.receiveQueue, message],
      }));

      if (!state.receiveWorkerRunning) {
        set({ receiveWorkerRunning: true });
        get().processReceiveQueue();
      }
    },

    processReceiveQueue: async () => {
      const state = get();
      
      if (state.receiveWorkerRunning && state.receiveQueue.length === 0) {
        console.log("[RECEIVE QUEUE] worker already running");
        return;
      }

      console.log("[RECEIVE QUEUE] worker started");

      while (true) {
        const currentState = get();
        
        if (currentState.receiveQueue.length === 0) {
          console.log("[RECEIVE QUEUE] queue empty, worker stopping");
          set({ receiveWorkerRunning: false });
          break;
        }

        const message = currentState.receiveQueue[0];
        if (!message) {
          console.log("[RECEIVE QUEUE] missing message, skipping");
          set((s) => ({ receiveQueue: s.receiveQueue.slice(1) }));
          continue;
        }

        const dequeueLength = currentState.receiveQueue.length;
        console.log("[RECEIVE QUEUE] dequeue", message._id, "queueLength:", dequeueLength);
        if (dequeueLength > 100) {
          console.warn("[RECEIVE QUEUE] unusually large", dequeueLength);
        }

        try {
          const myId = currentState.currentUserId;
          const socket = getSocket();

          await receiveMutex.withLock(
            message.conversationId,
            async () => {
              console.log("[RECEIVE LOCK] acquired for conversation", message.conversationId);
              await processIncomingMessage(message, myId, socket, set, get, false);
              console.log("[RECEIVE LOCK] released for conversation", message.conversationId);
            }
          );
        } catch (error) {
          console.error("[RECEIVE QUEUE] error processing message", message._id, error);
        }

        set((s) => ({
          receiveQueue: s.receiveQueue.slice(1),
          receiveProcessingIds: new Set(
            [...s.receiveProcessingIds].filter((id) => id !== message._id)
          ),
        }));
      }
    },

    // ===== SEND QUEUE METHODS =====
    enqueueSendMessage: (payload) => {
      const state = get();
      
      const queueLength = state.sendQueue.length + 1;
      console.log("[SEND QUEUE] enqueue", payload.clientTempId, "queueLength:", queueLength);
      if (queueLength > 100) {
        console.warn("[SEND QUEUE] unusually large", queueLength);
      }

      set((s) => ({
        sendQueue: [...s.sendQueue, payload],
      }));

      if (!state.sendWorkerRunning) {
        set({ sendWorkerRunning: true });
        get().processSendQueue();
      }
    },

    processSendQueue: async () => {
      const state = get();
      
      if (state.sendWorkerRunning && state.sendQueue.length === 0) {
        console.log("[SEND QUEUE] worker already running");
        return;
      }

      console.log("[SEND QUEUE] worker started");

      while (true) {
        const currentState = get();
        
        if (currentState.sendQueue.length === 0) {
          console.log("[SEND QUEUE] queue empty, worker stopping");
          set({ sendWorkerRunning: false });
          break;
        }

        const payload = currentState.sendQueue[0];
        if (!payload) {
          console.log("[SEND QUEUE] missing payload, skipping");
          set((s) => ({ sendQueue: s.sendQueue.slice(1) }));
          continue;
        }

        const dequeueLength = currentState.sendQueue.length;
        console.log("[SEND QUEUE] dequeue", payload.clientTempId, "queueLength:", dequeueLength);
        if (dequeueLength > 100) {
          console.warn("[SEND QUEUE] unusually large", dequeueLength);
        }

        try {
          await get().sendMessageInternal(payload);
        } catch (error) {
          console.error("[SEND QUEUE] error sending message", payload.clientTempId, error);
        }

        set((s) => ({
          sendQueue: s.sendQueue.slice(1),
        }));
      }
    },

    sendMessageInternal: async (payload) => {
      console.log("[SEND LOCK] acquiring for conversation", payload.conversationId);
      
      await sendMutex.withLock(
        payload.conversationId,
        async () => {
          console.log("[SEND LOCK] acquired for conversation", payload.conversationId);
          
          const { sendMessageNumber, sendChainKey } = await getSendState(
            payload.conversationId,
            payload.senderId
          );
          const messageKey = deriveMessageKey(sendChainKey);
          const encrypted = encryptMessage(payload.cipherText, messageKey);

          const optimisticMessage = {
            ...payload,
            _id: payload.clientTempId,
            plaintext: payload.cipherText,
            senderId: payload.senderId,
            status: "sending",
            conversationId: payload.conversationId,
            optimistic: true,
            messageNumber: sendMessageNumber,
            previousChainLength: payload.previousChainLength,
            createdAt: new Date(),
          };

          set((state) => ({
            messages: [...state.messages, optimisticMessage],
          }));

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
              createdAt: new Date().toISOString(),
            },
            payload.senderId
          );

          console.log("[SEND LOCK] SEND CHAIN", sendChainKey);
          console.log("[SEND LOCK] encrypted data", encrypted);
          
          try {
            const finalPayload = {
              ...payload,
              cipherText: encrypted.cipherText,
              nonce: encrypted.nonce,
              messageNumber: sendMessageNumber,
            };

            const res = await API.post("/messages/sendMessage", finalPayload);

            const realMessage = res.data.newMessage;
            const nextSendChain = advanceChainKey(sendChainKey);
            
            await saveSendState(
              payload.conversationId,
              nextSendChain,
              sendMessageNumber + 1,
              payload.senderId
            );
            
            await markMessageSent(
              payload.clientTempId,
              realMessage._id,
              payload.senderId
            );

            console.log("[SEND LOCK] message sent successfully", realMessage._id);

            set((state) => {
              const withoutTemp = state.messages.filter(
                (msg) => msg._id !== payload.clientTempId
              );

              const exists = withoutTemp.some(
                (msg) => msg._id === realMessage._id
              );

              return {
                messages: exists
                  ? withoutTemp
                  : [
                      ...withoutTemp,
                      {
                        ...realMessage,
                        plaintext: payload.cipherText,
                        status: "sent",
                      },
                    ],
              };
            });
          } catch (error) {
            console.log("[SEND LOCK] error sending", error);
            set((state) => ({
              messages: state.messages.map((msg) =>
                msg._id === payload.clientTempId
                  ? { ...msg, status: "failed" }
                  : msg
              ),
            }));

            await updateMessageStatus(
              payload.clientTempId,
              "failed",
              payload.senderId
            );
          }
          
          console.log("[SEND LOCK] released for conversation", payload.conversationId);
        }
      );
    },

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
          console.log("[SOCKET] RECEIVE NUMBER", message.messageNumber);
          console.log("[SOCKET] new msg received", message);
          console.log("[SOCKET] activeConversation", get().activeConversation);
          
          // Ignore my own message
          if ( message.conversationId !== get().activeConversation ) {
            console.log("[SOCKET] message not for active conversation, ignoring");
            return;
          }
          
          if ( message.senderId === socket.userId) {
            console.log("[SOCKET] message from self, ignoring");
            return;
          }
          
          console.log("[SOCKET] msg is for me only");
          if(message.senderId !== get().currentUserId) {
            socket.emit( "messageDelivered", { messageId: message._id, });
          }
           if (get().isSyncing) {
            set((state) => ({
              pendingMessages: [
                          ...state.pendingMessages,
                 message
              ]
            }));
            return;
          }
          
          // Always enqueue, never process directly
          get().enqueueReceiveMessage(message);           
        });

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

       let sharedSecret = await getSharedSecret(conversationId,myId);
       console.log("existing shared secret",sharedSecret);
       console.log("my id",await getReceiveState(conversationId,myId));
       console.log("my id",await getSendState(conversationId,myId));


  if(!sharedSecret){

    console.log(
    "MY KEYS",
    await getIdentityKeys(myId)
  );

  console.log(
    "RECEIVER PUB",
    res.data.publicKey
  );
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
              console.log(
              "existing root key",
              rootKey
            );

              if(!rootKey){

              rootKey = await deriveRootKey( sharedSecret);

              await saveRootKey( conversationId, rootKey,myId);
              let chain = await deriveInitialChainKeys( rootKey );
              let sendChainKey = chain.sendChainKey;
              let receiveChainKey = chain.receiveChainKey;
              if(String(myId) !== String(conversation.createdBy)){
                  const temp = sendChainKey;
                  sendChainKey = receiveChainKey; 
                  receiveChainKey = temp;
              }
               await saveSendState( conversationId, sendChainKey, 0, myId );
               await saveReceiveState( conversationId, receiveChainKey, -1, myId );

              }


console.log(
 "ROOT KEY",
 rootKey
);


 set({sharedSecret});

        set({
          activeConversation:
            conversationId,
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

set({messages: [] });
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

    loadMessages: async (
  conversationId,
  myId
) => {

  try {

    set({
      isSyncing: true,
      pendingMessages: []
    });

    const localMessages =
      await getMessagesByConversation(
        conversationId,
        myId
      );

    set({
      messages: localMessages
    });

    const lastMessage =
      await getLastMessage(
        conversationId,
        myId
      );

    const lastMessageNumber =
      lastMessage
        ? lastMessage.messageNumber
        : -1;

    const res =
      await API.get(
        `/messages/${conversationId}`,
        {
          params: {
            afterMessageNumber:
              lastMessageNumber
          }
        }
      );

    console.log(
      "last local msg number",
      lastMessage
    );

    console.log(
      "SYNCED",
      res.data.messages.map(
        m => m.messageNumber
      )
    );

    // Ignore my own messages
    const syncedMessages =
      res.data.messages.filter(
        msg =>
          String(msg.senderId) !==
          String(myId)
      );

    // Merge synced + pending socket messages
    const merged = [
      ...syncedMessages,
      ...get().pendingMessages
    ];

    // Deduplicate by _id
    const unique = Array.from(
      new Map(
        merged.map(
          msg => [msg._id, msg]
        )
      ).values()
    );

    // Sort by ratchet order
    unique.sort(
      (a, b) =>
        a.messageNumber -
        b.messageNumber
    );

    console.log(
      "[SYNC] processing messages",
      unique.map(
        m => m.messageNumber
      )
    );

    // Enqueue in order
    for (const msg of unique) {
      get().enqueueReceiveMessage(msg);
    }

  } catch (error) {

    console.log(
      "[SYNC] loadMessages error",
      error
    );

  } finally {

    set({
      pendingMessages: [],
      isSyncing: false
    });

    console.log(
      "[SYNC] completed"
    );
  }
},



    // SEND MESSAGE

    sendMessage: async (payload) => {
      console.log("[SEND] User calling sendMessage, enqueueing", payload.clientTempId);
      get().enqueueSendMessage(payload);
    },

  }));