import API from "./api";

export const getMessages = async (conversationId) => {
    try {
      const response = await API.get(`/messages/getChats/${recieverId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    } 
};

export const sendMessage = async (messageData) => {
    try {
      const response = await API.post("/messages/sendMessage", messageData);
      return response.data;
    }
    catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
};

export const getMessagedContacts = async () => {
    try {
      const response = await API.get("/messages/getContacts");
      return response.data;
    } catch (error) {
      console.error("Error fetching messaged contacts:", error);
      throw error;
    }
};
