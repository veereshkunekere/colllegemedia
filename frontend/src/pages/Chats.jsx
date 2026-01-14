import { chatStore } from "../store/chatStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Chats() {
  const {
    getMessagedContacts,
    isLoadingContacts,
    contacts,
    setSelectedUser,
    selectedUser,
    getChats,
  } = chatStore();

  const navigate = useNavigate();

  useEffect(() => {
    getMessagedContacts();
  }, [getMessagedContacts]);

  const openChat = async (id) => {
    await getChats(id);
    setSelectedUser(id);
    navigate(`/chats/${id}`);
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 font-semibold">
        Chats
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingContacts ? (
          <p className="text-center text-gray-400 mt-6">Loading...</p>
        ) : contacts.length === 0 ? (
          <p className="text-center text-gray-400 mt-6">
            No chats yet
          </p>
        ) : (
          contacts.map((user) => (
            <div
              key={user._id}
              onClick={() => openChat(user._id)}
              className={`flex items-center gap-3 p-3 cursor-pointer border-b border-gray-800 hover:bg-[#202c33]
                ${selectedUser === user._id ? "bg-[#202c33]" : ""}`}
            >
              <img
                src="/default-avatar.png"
                alt="avatar"
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <p className="font-medium">{user.username}</p>
                <p className="text-xs text-gray-400 truncate">
                  Tap to chat
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Chats;
