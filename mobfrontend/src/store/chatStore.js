import { create }
  from "zustand";

import API
  from "../services/api";

import {
  getSocket,
} from "../services/sockets/socketManager";


import { getIdentityKeys,deriveSharedSecret,encryptMessage,decryptMessage,deriveRootKey,deriveInitialChainKeys,deriveMessageKey,advanceChainKey, } from "../services/cryptoService";
import {getSharedSecret,saveSharedSecret,getRootKey,saveRootKey,loadSession,deleteRatchetState,deleteKeys,getReceiveState,getSendState,saveReceiveState,saveSendState} from "../services/sessionServive"
import {saveSkippedKey,getSkippedKey,deleteSkippedKey} from "../db/skippedKeysRepository"
import { saveMessage,getMessagesByConversation,markMessageSent,updateMessageStatus, getLastMessage } from "../db/messageRepository";


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

async function processIncomingMessage(message,myId,set,get,skipUI=false){
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
                console.log(
 "DUPLICATE PATH",
 message.messageNumber,
 receiveMessageNumber
);
                const skipped = await getSkippedKey(
                 message.conversationId,
                 message.messageNumber,
                 myId
                );

               if(skipped){
                console.log(
 "SKIPPED KEY FOUND",
 !!skipped
);

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
             let plaintext;
try {
  plaintext = decryptMessage(message.cipherText, message.nonce, messageKey);
} catch (e) {
  console.log("[DECRYPT] failed for msg", message._id, "— legacy/corrupt message");
  message.plaintext = "[Message could not be decrypted]";
  message.decryptFailed = true;
  await saveMessage(message, myId);
  // still advance the ratchet so future messages aren't broken
  const nextReceiveChain = advanceChainKey(currentChain);
  await saveReceiveState(message.conversationId, nextReceiveChain, message.messageNumber, myId);
  // update UI
  set(state => ({ messages: [...state.messages, message] }));
  return message;
}
              get().emitMessageDelivered(message._id);


              console.log("plaintxt",plaintext);

                 message.plaintext = plaintext;
                 message.messageType = message.messageType || "text";
                 message.status = message.status || "received";
                 await saveMessage(message,myId);

                const nextReceiveChain = advanceChainKey(currentChain);

                console.log(
 "saving receive state",
 message.messageNumber
);
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

if (
  get().activeConversation && (
  String(get().activeConversation._id) ===
  String(message.conversationId)
)) {
  setTimeout(() => {
    get().emitMarkSeen(message.conversationId);
  }, 300);
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

  if (!message) {
    return;
  }

  let shouldStartWorker = false;

  set((state) => {

    if (
      state.receiveProcessingIds.has(
        message._id
      )
    ) {
      console.log(
        "[RECEIVE QUEUE] duplicate",
        message._id
      );

      return state;
    }

    if (!state.receiveWorkerRunning) {
      shouldStartWorker = true;
    }

    return {
      receiveWorkerRunning:
        state.receiveWorkerRunning || shouldStartWorker,

      receiveProcessingIds: new Set([
        ...state.receiveProcessingIds,
        message._id,
      ]),

      receiveQueue: [
        ...state.receiveQueue,
        message,
      ],
    };
  });

  if (shouldStartWorker) {
    console.log(
      "[RECEIVE QUEUE] starting worker"
    );

    get().processReceiveQueue();
  }
},

processReceiveQueue: async () => {

  console.log(
    "[RECEIVE WORKER START]"
  );

  while (true) {

    const currentState = get();

    if (
      currentState.receiveQueue.length === 0
    ) {

      console.log(
        "[RECEIVE QUEUE] queue empty, worker stopping"
      );

      set({
        receiveWorkerRunning: false
      });

      break;
    }

    const message =
      currentState.receiveQueue[0];

    if (!message) {

      console.log(
        "[RECEIVE QUEUE] missing message, skipping"
      );

      set((s) => ({
        receiveQueue:
          s.receiveQueue.slice(1)
      }));

      continue;
    }

    console.log(
      "[RECEIVE QUEUE] dequeue",
      message._id,
      "queueLength:",
      currentState.receiveQueue.length
    );

    try {

      const myId =
        currentState.currentUserId;

     

      await receiveMutex.withLock(
        message.conversationId,
        async () => {

          console.log(
            "[RECEIVE LOCK] acquired",
            message.conversationId
          );

          await processIncomingMessage(
            message,
            myId,
            set,
            get,
            false
          );

          console.log(
            "[RECEIVE LOCK] released",
            message.conversationId
          );
        }
      );

    } catch (error) {

      console.error(
        "[RECEIVE QUEUE] error",
        message._id,
        error
      );

    } finally {

      set((s) => ({

        receiveQueue:
          s.receiveQueue.slice(1),

        receiveProcessingIds:
          new Set(
            [...s.receiveProcessingIds]
              .filter(
                id => id !== message._id
              )
          ),

      }));
    }
  }
},

    // ===== SEND QUEUE METHODS =====
enqueueSendMessage: (payload) => {

  if (!payload) {
    return;
  }

  let shouldStartWorker = false;

  set((state) => {

    if (!state.sendWorkerRunning) {
      shouldStartWorker = true;
    }

    return {
      sendWorkerRunning:
        state.sendWorkerRunning || shouldStartWorker,

      sendQueue: [
        ...state.sendQueue,
        payload,
      ],
    };
  });

  if (shouldStartWorker) {

    console.log(
      "[SEND QUEUE] starting worker"
    );

    get().processSendQueue();
  }
},

processSendQueue: async () => {

  console.log(
    "[SEND WORKER START]"
  );

  while (true) {

    const currentState = get();

    if (
      currentState.sendQueue.length === 0
    ) {

      console.log(
        "[SEND QUEUE] queue empty, worker stopping"
      );

      set({
        sendWorkerRunning: false
      });

      break;
    }

    const payload =
      currentState.sendQueue[0];

    if (!payload) {

      console.log(
        "[SEND QUEUE] missing payload, skipping"
      );

      set((s) => ({
        sendQueue:
          s.sendQueue.slice(1)
      }));

      continue;
    }

    console.log(
      "[SEND QUEUE] dequeue",
      payload.clientTempId,
      "queueLength:",
      currentState.sendQueue.length
    );

    try {

      await get().sendMessageInternal(
        payload
      );

    } catch (error) {

      console.error(
        "[SEND QUEUE] error",
        payload.clientTempId,
        error
      );

    } finally {

      set((s) => ({
        sendQueue:
          s.sendQueue.slice(1),
      }));
    }
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

    clearActiveConversation: () => {
    set({
        activeConversation: null,
        messages: [],
        sharedSecret: null
    });
},

    handleNewMessage: async (message)=>{
        console.log("[SOCKET] RECEIVE NUMBER", message.messageNumber);
          console.log("[SOCKET] new msg received", message);
          console.log("receiver state", await getReceiveState(message.conversationId,get().currentUserId));
          console.log("[SOCKET] activeConversation", get().activeConversation);
          
          // Ignore my own message
          if ( String(message.conversationId) !== String(get().activeConversation._id) ) {
            console.log("[SOCKET] message not for active conversation, ignoring");
            return;
          }
          
          if ( message.senderId === get().currentUserId ) {
            console.log("[SOCKET] message from self, ignoring");
            return;
          }
          
          console.log("[SOCKET] msg is for me only");
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
    },

    handleMessageDelivered: async ({ messageId }) => {

      await updateMessageStatus(messageId,"delivered",get().currentUserId); //TODO:add userId to updateMessageStatus

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
            },

    handleMessagesSeen: async ({ conversationId }) => {

    const currentUserId =
      get().currentUserId;

    const myMessages =
      get().messages.filter(
        msg =>
          msg.conversationId === conversationId &&
          msg.senderId === currentUserId
      );

    for (const msg of myMessages) {

      await updateMessageStatus(
        msg._id,
        "seen",
        currentUserId
      );
    }

    set((state) => ({

      messages:
        state.messages.map(
          (msg) =>

            msg.conversationId ===
              conversationId &&
            msg.senderId ===
              currentUserId

              ? {
                  ...msg,
                  status: "seen"
                }

              : msg
        )
    }));

    console.log(
      "[SEEN] conversation seen",
      conversationId
    );
  },

  emitMessageDelivered: (messageId) => {
    const socket = getSocket();

    if (!socket?.connected) {
        return;
    }

    socket.emit("messageDelivered", {
        messageId,
    });
},

emitMarkSeen: (conversationId) => {
    const socket = getSocket();

    if (!socket?.connected) {
        return;
    }

    socket.emit("markSeen", {
        conversationId,
    });
},

joinConversation: (conversationId) => {
    const socket = getSocket();

    if (!socket?.connected) return;

    socket.emit(
        "joinConversation",
        conversationId
    );
},

leaveConversation: (conversationId) => {
    const socket = getSocket();

    if (!socket?.connected) return;

    socket.emit(
        "leaveConversation",
        conversationId
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

      if (!conversationId) {
        console.log(
            "[CHAT] Invalid conversation"
        );
        return;
    }

    let conversation = get().conversations.find(c => c._id === conversationId);

    if (!conversation) {
        console.log(
            "[CHAT] Conversation not found in store"
        );
        try {
          console.log(
            "[CHAT] Fetching conversation from server",
            conversationId
        );
            const res = await API.get(`/messages/conversation/${conversationId}`);
            conversation = res.data.conversation;

             if (!conversation) {
        console.error(
          "[CHAT] Conversation not found on server"
        );
        return;
      }
        set((state) => {
        const exists = state.conversations.some(
          (c) =>
            String(c._id) ===
            String(conversation._id)
        );

        if (exists) {
          return state;
        }

        return {
          conversations: [
            ...state.conversations,
            conversation,
          ],
        };
      });
        } catch (error) {
            console.error(
                "[CHAT] Failed to fetch conversation from server",
                error
            );
            console.log(
              error.response?.data,
              error.response?.status,
              error.response?.headers
            );
            return;
        }
    }


    set({
        activeConversation: conversation,
        messages: [],
        sharedSecret: null,
    });

 
        
        console.log("selected conversationId",conversation._id);

        const myKeys = await getIdentityKeys(myId);
        console.log(conversation);
        const receiver = conversation.participants.find(
            p => String(p._id ?? p) !== String(myId)
        );

       const receiverId = receiver?._id ?? receiver;

        if (!receiverId) {
           throw new Error("Receiver ID not found in conversation");
        }
        const res = await API.get(`/user/public-key/${receiverId}`);

       let sharedSecret = await getSharedSecret(conversation._id,myId);
       console.log("existing shared secret",sharedSecret);
       console.log("my id",await getReceiveState(conversation._id,myId));
       console.log("my id",await getSendState(conversation._id,myId));


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
      conversation._id,
      sharedSecret,
      myId
    );
  }

              let rootKey = await getRootKey( conversation._id,myId );
              console.log(
              "existing root key",
              rootKey
            );

              if(!rootKey){

              rootKey = await deriveRootKey( sharedSecret);

              await saveRootKey( conversation._id, rootKey,myId);
              let chain = await deriveInitialChainKeys( rootKey );
              let sendChainKey = chain.sendChainKey;
              let receiveChainKey = chain.receiveChainKey;

                console.log("CREATED BY", conversation?.createdBy, "MY ID", myId, "WILL SWAP", String(myId) !== String(conversation?.createdBy));

              if(String(myId) !== String(conversation.createdBy)){
                  const temp = sendChainKey;
                  sendChainKey = receiveChainKey; 
                  receiveChainKey = temp;
              }
               await saveSendState( conversation._id, sendChainKey, 0, myId );
               await saveReceiveState( conversation._id, receiveChainKey, -1, myId );

              }


console.log(
 "ROOT KEY",
 rootKey
);


 set({sharedSecret});

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

        get().joinConversation(conversation._id);

        await get()
          .loadMessages(
            conversation._id,
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

    const since = lastMessage ? lastMessage.createdAt : undefined;

const res = await API.get(`/messages/${conversationId}`, {
  params: since ? { since } : {}
});

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

  } 
  catch (error) {

    console.log(
      "[SYNC] loadMessages error",
      error
    );

  }
  finally {

  set({
    pendingMessages: [],
    isSyncing: false
  });


  const activeConversation =
    get().activeConversation;

if (
    activeConversation &&
    String(conversationId) ===
    String(activeConversation._id)
) {
    get().emitMarkSeen(
        conversationId
    );
}

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