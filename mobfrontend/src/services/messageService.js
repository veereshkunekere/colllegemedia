import API from "./api";

export const getMessages = async (conversationId) => {
    try {
      const response = await API.get(`/messages/${conversationId}`);
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
      const response = await API.get("/messages/conversations");
      return response.data;
    } catch (error) {
      console.error("Error fetching messaged contacts:", error);
      throw error;
    }
};

export const createOrGetConversation = async (receiverId) => {
    console.log("Creating/getting conversation with receiverId:", receiverId);
    try {
      const response = await API.post('/messages/conversation', { receiverId });
      console.log("Received conversation response:", response.data.conversation);
      return response.data.conversation;
    } catch (error) {
      console.error('Error creating/getting conversation:', error);
      throw error;
    }
};
