import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCallStore } from '../store/useCallStore';
import { chatStore } from '../store/chatStore';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
export default function VideoMeetComponet() {
  const { id: remoteId } = useParams();
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const setupRef = useRef(false);
  const mountId = `mount-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [connectionState, setConnectionState] = useState('new');
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [isMuted,setIsMuted]=useState();  // For UI
  const localStreamRef=useRef(null);
  let remoteStream;
  let peerConnection;

  const { socket } = useAuthStore();
  const { isInitiator, pendingOffer, clearPendingOffer, clearCall } = useCallStore();
  const {selectedUser}=chatStore();
  console.log(`[VideoMeet ${mountId}] Mount: remoteId=${remoteId}, isInitiator=${isInitiator}`);

  const servers = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  const getPermission = async () => {
    try {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      console.log(`[VideoMeet ${mountId}] Local stream ready`);
      return localStreamRef.current;
    } catch (error) {
      console.error('[VideoMeet] Media error:', error);
    }
  };

  const createPeerConnection = () => {
    peerConnection = new RTCPeerConnection(servers);
    remoteStream = new MediaStream();
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => peerConnection.addTrack(track, localStreamRef.current));
    }

    console.log(localStreamRef.current)
    peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
      console.log(`[VideoMeet ${mountId}] Remote stream connected`);
      setIsDisconnected(false);  // Hide reconnect UI
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`[VideoMeet ${mountId}] ICE candidate sent`);
        socket.emit('ice-candidate', { candidate: event.candidate, to: remoteId });
      }
    };

    // Monitor connection state
    peerConnection.oniceconnectionstatechange = () => {
      const state = peerConnection.iceConnectionState;
      setConnectionState(state);
      console.log(`[VideoMeet ${mountId}] ICE state: ${state}`);
      if (state === 'disconnected' || state === 'failed') {
        setIsDisconnected(true);
      } else if (state === 'connected') {
        setIsDisconnected(false);
      }
    };
  };

  const createOffer = async () => {
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      console.log(`[VideoMeet ${mountId}] Offer sent`);
      socket.emit('video-offer', { offer, to: remoteId });
    } catch (err) {
      console.error('[VideoMeet] Offer error:', err);
    }
  };

  const handleOffer = async (offer) => {
    try {
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      console.log(`[VideoMeet ${mountId}] Answer sent`);
      socket.emit('video-answer', { answer, to: remoteId });
    } catch (err) {
      console.error('[VideoMeet] Answer error:', err);
    }
  };

  // Socket listeners
  useEffect(() => {
    if (!socket || !remoteId || setupRef.current) return;

    console.log(`[VideoMeet ${mountId}] Attaching socket listeners`);

    const handleVideoCallOffer = (data) => {
      const { from, offer: incomingOffer } = data;
      if (from !== remoteId || isInitiator) return;
      console.log(`[VideoMeet ${mountId}] Offer received from ${from}`);
      if (!peerConnection) {
        useCallStore.setState({ pendingOffer: incomingOffer });
        return;
      }
      handleOffer(incomingOffer);
    };

    const handleVideoCallAnswer = (data) => {
      const { from, answer } = data;
      if (from !== remoteId) return;
      console.log(`[VideoMeet ${mountId}] Answer received from ${from}`);
      peerConnection.setRemoteDescription(answer);
    };

    const handleVideoIceCandidate = (data) => {
      const { from, candidate } = data;
      if (from !== remoteId) return;
      console.log(`[VideoMeet ${mountId}] ICE received from ${from}`);
      peerConnection.addIceCandidate(candidate).catch(console.error);
    };

    const handleEndCall = (data) => {
      if (data.from !== remoteId) return;
      console.log(`[VideoMeet ${mountId}] Call ended by remote`);
      endCallCleanup();
      navigate(-1);
    };

    socket.on('video-call-offer', handleVideoCallOffer);
    socket.on('video-call-answer', handleVideoCallAnswer);
    socket.on('video-ice-candidate', handleVideoIceCandidate);
    socket.on('end-call', handleEndCall);

    return () => {
      console.log(`[VideoMeet ${mountId}] Detaching socket listeners`);
      socket.off('video-call-offer', handleVideoCallOffer);
      socket.off('video-call-answer', handleVideoCallAnswer);
      socket.off('video-ice-candidate', handleVideoIceCandidate);
      socket.off('end-call', handleEndCall);
    };
  }, [socket, remoteId, isInitiator]);

  const endCallCleanup = () => {
    console.log(`[VideoMeet ${mountId}] Ending call`);
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
    if (peerConnection) peerConnection.close();
    clearPendingOffer();
    localStreamRef.current = null;
    clearCall();
    socket.emit('end-call', { to: remoteId });
  };

  const handleEndCall = () => {
    if (window.confirm('End video call?')) {
      endCallCleanup();
      navigate(-1);
    }
  };

  const handleReconnect = () => {
    endCallCleanup();
    navigate(`/chats/${remoteId}`);  // Back to chat to re-start
  };

  useEffect(() => {
  if (socket) {
    socket.on('call-declined', ({ from }) => {
      console.log('selectedUser',selectedUser,'from',from,"remoteId",remoteId );
      if (from ===remoteId ) {  // Match to current call
        console.log(`[VideoMeet ${mountId}] Call declined by remote`);
        endCallCleanup();
        alert('Call was declined by the other user.');
        navigate(-1);
      }
    });
    return () => socket.off('call-declined');
  }
}, [socket, selectedUser,mountId]);

  // Main setup (fresh every time)
  useEffect(() => {
    if (setupRef.current) {
      console.log(`[VideoMeet ${mountId}] Skipping re-setup`);
      return;
    }
    setupRef.current = true;

    console.log(`[VideoMeet ${mountId}] Starting fresh setup`);
    getPermission().then(() => {
      createPeerConnection();
      if (isInitiator) {
        setTimeout(createOffer, 200);
      } else if (pendingOffer) {
        console.log(`[VideoMeet ${mountId}] Handling pending offer`);
        handleOffer(pendingOffer);
        clearPendingOffer();
      }
    });

    return () => {
      console.log(`[VideoMeet ${mountId}] Unmount cleanup`);
      setupRef.current = false;
      endCallCleanup();
    };
  }, []);  // Once on mount

  // Mute toggle
  const toggleMute = () => {
    console.log(`[VideoMeet ${mountId}] Toggling mute`);
    console.log(localStreamRef.current);
    if (localStreamRef.current) {
      console.log(`[VideoMeet ${mountId}] Toggling mute`);
      try {
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (audioTrack) {
          console.log("Audio track found", audioTrack);
          audioTrack.enabled = !audioTrack.enabled;
          setIsMuted(!audioTrack.enabled);

        }
        else console.log("No audio track found");
      } catch (error) {
        console.error("Error toggling mute:", error);
      }
    }else console.log("No local stream available");
  };

  if (isDisconnected) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white bg-black">
        <p className="text-lg mb-4">Call disconnected (e.g., refresh or network issue).</p>
        <button
          onClick={handleReconnect}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Reconnect (Go Back to Chat)
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen bg-black">
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover border-2 border-white"
      />
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-4 right-4 w-40 h-40 rounded-lg border-2 border-white shadow-lg"
      />
      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        <button
          onClick={toggleMute}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
         {isMuted?<VolumeOffIcon className='bg-blue-200'/>:<VolumeUpIcon/>}
        </button>
        <button
          onClick={handleEndCall}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          End Call
        </button>
      </div>
      {/* Status */}
      <div className="absolute top-4 left-4 text-white bg-black px-2 py-1 rounded text-sm">
        Status: {connectionState}
      </div>
    </div>
  );
}