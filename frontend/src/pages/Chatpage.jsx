import React, { useEffect, useState } from 'react';
import { chatStore } from "../store/chatStore";
import Chats from './Chats';
import { useAuthStore } from '../store/useAuthStore';
import { useCallStore } from '../store/useCallStore';
import { useNavigate } from 'react-router-dom';
import api from '../util/api';

const Chatpage = () => {

  const [messageText, setMessageText] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const navigate = useNavigate();

  const {
    contacts,
    selectedUser,
    messages,
    getChats,
    sendMessage,
    listenForSocketMessages,
    getMessagedContacts,
  } = chatStore();

  const {socket}=useAuthStore();

  useEffect(() => {
    getMessagedContacts();  // Fetch contacts on load
  }, [getMessagedContacts]);

  useEffect(() => {
    if(socket) listenForSocketMessages(socket);
    return ()=>{
     if(socket) socket.off("newMessage")
    }
  },[socket,listenForSocketMessages])
  // Fetch messages when selectedUser changes

  // Check online status when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      getChats(selectedUser);
       api.get(`/messages/isOnline/${selectedUser}`)
        .then(res => setIsOnline(res.data.isOnline))
        .catch(() => setIsOnline(false));
    }
  }, [selectedUser, getChats]);

  useEffect(() => {
    if (socket) {
      const handleUserOnline = (id) => {
        if (id === selectedUser) {
          setIsOnline(true);
          console.log(`User ${id} came online`);
        }
      };

      const handleUserOffline = (id) => {
        if (id === selectedUser) {
          setIsOnline(false);
          console.log(`User ${id} went offline`);
        }
      };

      socket.on('userOnline', handleUserOnline);
      socket.on('userOffline', handleUserOffline);

      return () => {
        socket.off('userOnline', handleUserOnline);
        socket.off('userOffline', handleUserOffline);
      };
    }
  }, [socket, selectedUser]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedUser) return;

    const newMessage = {
      senderId: localStorage.getItem("id"),
      receiverId: selectedUser,
      message: messageText,
      timestamp: new Date().toISOString(),
    };

    await sendMessage(newMessage);

    setMessageText("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`w-0 ${selectedUser?'md-20':'md-80'} text-white h-full overflow-y-auto`}>
        <Chats />
      </div>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-lg">
          {selectedUser ? (
            <>
              <div className="flex items-center px-4 py-3 bg-gray-900 text-white rounded-t-lg">
                
                <img
                  src="/default-avatar.png"
                  alt="DP"
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                />

                <div className="ml-3">
                  <p className="text-lg font-semibold">
                    {contacts.find((u) => u._id === selectedUser)?.username || "User"}
                  </p>
                  <p className="text-sm text-green-400">{isOnline?"Online":"Offline"}</p>
                </div>

                {selectedUser && isOnline  && (
                 <div className='ml-auto'>
                  <button
                    onClick={() => {
                    useCallStore.setState({ isInitiator: true });  // Already good, but add guard if needed
                    navigate(`/call/${selectedUser}`);
                }}
                      className="ml-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                 >
                   Call
                  </button>
                 </div>
               )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages && messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg max-w-md ${
                        msg.senderId === localStorage.getItem("id")
                          ? "bg-blue-500 text-white ml-auto"
                          : "bg-gray-200 text-gray-800 mr-auto"
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center mt-10">No messages yet. Start the conversation!</p>
                )}
              </div>
              <div className="flex items-center gap-2 p-4 border-t bg-gray-100 rounded-b-lg">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center w-80">
              <p className="text-gray-500 text-lg">Select a contact to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatpage;
