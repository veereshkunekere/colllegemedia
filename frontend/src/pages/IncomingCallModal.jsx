// components/IncomingCallModal.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCallStore } from '../store/useCallStore';
import { Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';

const IncomingCallModal = ({ show, fromUserId, fromUsername, offer, onDecline,onAnswer }) => {
  const navigate = useNavigate();
  const { setPendingOffer,setInCallWith } = useCallStore();
  const {socket}=useAuthStore();
  if (!show) return null;

  const handleAccept = () => {
    if (offer) {
      setPendingOffer(offer);  // Store for VideoMeetComponet to consume
    }
    setInCallWith(fromUserId)
    useCallStore.setState({ isInitiator: false });
    navigate(`/call/${fromUserId}`);
    onAnswer();
  };

  const handleDecline = () => {
    if(socket && fromUserId){
      socket.emit('call-declined', { to: fromUserId });
    }
    setPendingOffer(null);
    onDecline();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg text-white text-center">
        <h2 className="text-xl font-bold mb-2">Incoming Video Call</h2>
        <p className="mb-4">From: {fromUsername}</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleAccept}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition"
          >
            Accept
          </button>
          <button
            onClick={handleDecline}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;