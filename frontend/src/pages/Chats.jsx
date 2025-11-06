// Updated Chats.jsx (X-like Messages Sidebar)
import { chatStore } from "../store/chatStore";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';

function Chats() {
    const { getMessagedContacts, isLoadingContacts, contacts, setSelectedUser, selectedUser, getChats } = chatStore();
    const navigate = useNavigate();

    useEffect(() => {
        const getContacts = async () => {
            await getMessagedContacts();
        };
        getContacts();
    }, []);

    const GetChats = async (id) => {
        await getChats(id);
        await setSelectedUser(id);
        console.log("Selected User ID:", selectedUser);
        navigate(`/chats/${id}`);
    };

    return (
        <div className="flex flex-col h-full bg-black border-l border-gray-800">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Messages</h2>
                <svg className="w-6 h-6 text-gray-500 cursor-pointer" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a1 1 0 011-1h12a1 1 0 110 2H5a1 1 0 01-1-1zM2 9a1 1 0 000 2h16a1 1 0 100-2H2zm0 6a1 1 0 100 2h5v-2H2zm7 0a1 1 0 100 2h9a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
            </div>

            {/* Loading */}
            {isLoadingContacts ? (
                <div className="flex items-center justify-center flex-1">
                    <p className="text-gray-500">Loading...</p>
                </div>
            ) : (
                /* Chat List */
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {contacts.map((user) => (
                        <div
                            onClick={() => GetChats(user._id)}
                            key={user._id}
                            className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-900 transition border-b border-gray-800 ${
                                selectedUser === user._id ? "bg-gray-900" : ""
                            }`}
                        >
                            <img
                                src="/default-avatar.png"
                                alt="User avatar"
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-700"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold truncate">{user.username}</p>
                                <p className="text-gray-500 text-sm truncate">Last message placeholder...</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">•</p>
                            </div>
                        </div>
                    ))}
                    {contacts.length === 0 && (
                        <div className="flex items-center justify-center flex-1 py-8">
                            <div className="text-center text-gray-500">
                                <ChatBubbleIcon className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                                <p className="text-sm">No messages yet</p>
                                <p className="text-xs">Start a conversation</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Chats;