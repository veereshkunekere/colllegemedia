import React, { useEffect, useState,useRef } from "react";
import { chatStore } from "../store/chatStore";
import Chats from "./Chats";
import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore";
import { useNavigate } from "react-router-dom";
import api from "../util/api";

const Chatpage = () => {
  const [messageText, setMessageText] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const navigate = useNavigate();
  const BottomRef = useRef(null);
  const {
    contacts,
    selectedUser,
    messages,
    getChats,
    sendMessage,
    listenForSocketMessages,
    getMessagedContacts,
  } = chatStore();

  const { socket } = useAuthStore();

  useEffect(() => {
    getMessagedContacts();
  }, [getMessagedContacts]);

  useEffect(()=>{
    if(BottomRef.current){
      BottomRef.current.scrollIntoView({behavior:"smooth"})
    }
  })
  useEffect(() => {
    if (socket) listenForSocketMessages(socket);
    return () => socket?.off("newMessage");
  }, [socket, listenForSocketMessages]);

  useEffect(() => {
    if (selectedUser) {
      getChats(selectedUser);
      api
        .get(`/messages/isOnline/${selectedUser}`)
        .then((res) => setIsOnline(res.data.isOnline))
        .catch(() => setIsOnline(false));
    }
  }, [selectedUser, getChats]);

  useEffect(() => {
    if (!socket) return;

    const online = (id) => id === selectedUser && setIsOnline(true);
    const offline = (id) => id === selectedUser && setIsOnline(false);

    socket.on("userOnline", online);
    socket.on("userOffline", offline);

    return () => {
      socket.off("userOnline", online);
      socket.off("userOffline", offline);
    };
  }, [socket, selectedUser]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedUser) return;

    await sendMessage({
      senderId: localStorage.getItem("id"),
      receiverId: selectedUser,
      message: messageText,
      timestamp: new Date().toISOString(),
    });

    setMessageText("");
  };

 
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`hidden md:block ${selectedUser ? "md:w-80" : "md:w-96"}`}>
        <Chats />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#efeae2]">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="flex items-center px-4 py-3 bg-[#075e54] text-white sticky top-0 z-10">
              <img
                src="/default-avatar.png"
                alt="avatar"
                className="w-11 h-11 rounded-full"
              />
              <div className="ml-3">
                <p className="font-bold text-lg">
                  {contacts.find((u) => u._id === selectedUser)?.username ||
                    "User"}
                </p>
                <p className="text-sm text-[#d9fdd3]">
                  {isOnline ? "online" : "offline"}
                </p>
              </div>

              {isOnline && (
                <button
                  onClick={() => {
                    useCallStore.setState({ isInitiator: true });
                    navigate(`/call/${selectedUser}`);
                  }}
                  className="ml-auto bg-[#25d366] px-3 py-1 rounded-full text-sm"
                >
                  Call
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((msg, i) => {
                const isMe =
                  msg.senderId === localStorage.getItem("id");

                return (
                  <div
                    key={i}
                    className={`flex ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`relative px-3 py-2 max-w-xs max-w-md text-sm shadow text-gray-800
                        ${
                          isMe
                            ? "bg-[#d9fdd3] rounded-lg rounded-tr-none"
                            : "bg-white rounded-lg rounded-tl-none"
                        }`}
                    >
                      <p>{msg.text}</p>
                      <span className="block text-[10px] text-gray-500 text-right mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={BottomRef}></div>
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-2 bg-[#f0f2f5] sticky bottom-0">
              <input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message"
                className="flex-1 px-4 py-2 rounded-full text-sm outline-none text-black"
              />
              <button
                onClick={handleSendMessage}
                className="bg-[#25d366] text-white px-4 py-2 rounded-full"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatpage;
