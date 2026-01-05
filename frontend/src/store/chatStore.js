import {create} from "zustand"
import api from "../util/api"
import { useAuthStore } from "./useAuthStore";
export const chatStore = create((set,get)=>({
    isLoadingContacts:false,
    isLoadingMessages:false,
    selectedUser:null,
    contacts:[],
    messages:[],

    getMessagedContacts:async ()=>{
       try{
        set({isLoadingContacts:true});
        const response=await api.get("/messages/getContacts");
        console.log(response);
        const users=response.data.users;
         set({ contacts: users });
        return users;
       } catch(error){
        console.log("error in messageStore",error);
        return [];
       }finally{
        set({isLoadingContacts:false});
       }
    },

    getChats:async (userId)=>{
       try {
        if(userId === get().selectedUser || !userId) return;
        set({selectedUser:userId});
        set({isLoadingMessages:true});
        const response=await api.get(`/messages/getChats/${userId}`);
        const data=response.data.messages;
        set({messages:data});
        console.log("messages", data);
        // Optionally, you can also emit an event to the socket if needed
        //TODO: Emit an event to notify other users about the new chat
        console.log("response in getChats", response);
        return data;   
       } catch (error) {
        console.log(error)
       }finally{
        set({isLoadingMessages:false});
       }
    },

    sendMessage: async (message) => {
      try {
        const response = await api.post("/messages/sendMessage", message);
        console.log("response from sendMessage", response.data);
        // Add sent message to local state
        set((state) => ({
          messages: [...state.messages, response.data.newMessage],
        }));
      } catch (error) {
        console.log("error in chatStore", error);
      }
    },

    listenForSocketMessages: (socket) => {
      if (!socket) return;
      socket.on("newMessage", (message) => {
      console.log("Received new message via socket:", message);
      const state = get();
      // FIX: Only append if message belongs to current chat
      if (state.selectedUser && 
          (message.senderId === state.selectedUser || message.receiverId === state.selectedUser)) {
        set((currentState) => ({
          messages: [...currentState.messages, message],
        }));
      } else {
        console.log("Message ignored: Not for current chat");
        // Optional: Add notification logic here for background messages
      }
    });
  },

    setSelectedUser: (userId) => {
        set({ selectedUser: userId });
        console.log("Selected User ID:", get().selectedUser);
    },
}))