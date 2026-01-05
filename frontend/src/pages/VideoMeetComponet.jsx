import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, data } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCallStore } from '../store/useCallStore';
import { chatStore } from '../store/chatStore';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';

export default function VideoMeetComponet() {
  const { id: remoteId } = useParams();
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const setupRef = useRef(false);
  const screenStreamRef=useRef();
  const [connectionState, setConnectionState] = useState('new');
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [isMuted,setIsMuted]=useState(null);
  const [isRemoteMuted,setIsRemoteMuted]=useState(false);
  const [isCamOff,setIsCamOff]=useState(false);
  const [isRemoteCamOff,setIsRemoteCamOff]=useState(false);
  const [ScreenShare,setScreenShare]=useState(false);
  const mountId = `mount-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const localStreamRef=useRef(null);
  const remoteStreamRef=useRef(new MediaStream());
  let peerConnectionRef=useRef();

  const { socket } = useAuthStore();
  const { isInitiator, pendingOffer, clearPendingOffer, clearCall,inCallwith,setInCallWith } = useCallStore();
  const {selectedUser}=chatStore();
  console.log(`[VideoMeet ${mountId}] Mount: remoteId=${remoteId}, isInitiator=${isInitiator}`);

  const servers = {
    iceServers: [
      { 
        urls: 'stun:stun.l.google.com:19302' 
      },
       {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject"
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject"
    }
    ]
  };

  const getPermission = async () => {
    try {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      let audioAvailable=localStreamRef.current.getAudioTracks()[0];
      let videAvailable=localStreamRef.current.getVideoTracks()[0];
      if(audioAvailable) setIsMuted(false)
        else setIsMuted(true)
      if(videAvailable) setIsCamOff(false)
        else setIsCamOff(true)
      console.log(`[VideoMeet ${mountId}] Local stream ready`);
      return localStreamRef.current;
    } catch (error) {
      console.error('[VideoMeet] Media error:', error);
    }
  };

  const createPeerConnection = () => {
    peerConnectionRef.current = new RTCPeerConnection(servers);
    remoteStreamRef.current = new MediaStream();
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStreamRef.current;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => peerConnectionRef.current.addTrack(track, localStreamRef.current));
    }



    console.log(localStreamRef.current)
    peerConnectionRef.current.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => remoteStreamRef.current.addTrack(track));
      console.log(`[VideoMeet ${mountId}] Remote stream connected`);
      setIsDisconnected(false);  // Hide reconnect UI
    };

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`[VideoMeet ${mountId}] ICE candidate sent`);
        socket.emit('ice-candidate', { candidate: event.candidate, to: remoteId });
      }
    };

    // Monitor connection state
    peerConnectionRef.current.oniceconnectionstatechange = () => {
      const state = peerConnectionRef.current.iceConnectionState;
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
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      console.log(`[VideoMeet ${mountId}] Offer sent`);
      socket.emit('video-offer', { offer, to: remoteId });
    } catch (err) {
      console.error('[VideoMeet] Offer error:', err);
    }
  };

  const handleOffer = async (offer) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(offer);
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
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
      if (!peerConnectionRef.current) {
        useCallStore.setState({ pendingOffer: incomingOffer });
        return;
      }
      handleOffer(incomingOffer);
    };

    const handleAudioToggle=(data)=>{
     if(data.from===inCallwith){
      console.log("remote has muted themself");
       setIsRemoteMuted(data.audioState)
     }
    }

    const handleVideoToggle = (data) => {
      console.log("video toggle data received:", data, "inCallwith:", inCallwith);
  if (data.from === inCallwith) {
    console.log('Remote toggled camera off:', data.videoState);  // Fix message
    setIsRemoteCamOff(data.videoState);
    console.log('Updated remote cam off state:', data.videoState);  // Log new value
  }
};

    const handleVideoCallAnswer = (data) => {
      const { from, answer } = data;
      if (from !== remoteId) return;
      console.log(`[VideoMeet ${mountId}] Answer received from ${from}`);
      peerConnectionRef.current.setRemoteDescription(answer);
    };

    const handleVideoIceCandidate = (data) => {
      const { from, candidate } = data;
      if (from !== remoteId) return;
      console.log(`[VideoMeet ${mountId}] ICE received from ${from}`);
      peerConnectionRef.current.addIceCandidate(candidate).catch(console.error);
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
    socket.on('audio-state-change',handleAudioToggle);
    socket.on('video-state-change',handleVideoToggle)

    return () => {
      console.log(`[VideoMeet ${mountId}] Detaching socket listeners`);
      socket.off('video-call-offer', handleVideoCallOffer);
      socket.off('video-call-answer', handleVideoCallAnswer);
      socket.off('video-ice-candidate', handleVideoIceCandidate);
      socket.off('end-call', handleEndCall);
      socket.off('video-state-change',handleVideoToggle);
      socket.off('audio-state-change',handleAudioToggle);
    };
  }, [socket, remoteId, isInitiator]);

  const endCallCleanup = () => {
    console.log(`[VideoMeet ${mountId}] Ending call`);
    if (screenStreamRef.current) {
    screenStreamRef.current.getTracks().forEach(track => track.stop());
    screenStreamRef.current = null;
   }
    setScreenShare(false);
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
    if (peerConnectionRef.current) peerConnectionRef.current.close();
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

  useEffect(()=>{
    if(!isRemoteCamOff && remoteVideoRef.current && remoteStreamRef.current){
      remoteVideoRef.current.srcObject=remoteStreamRef.current;
      console.log("remote video set from useEffect" );
    }
  },[isRemoteCamOff])

    useEffect(()=>{
    if(!isCamOff && localVideoRef.current && localStreamRef.current){
      localVideoRef.current.srcObject=localStreamRef.current;
      console.log("remote video set from useEffect" );
    }
  },[isCamOff])

  // Mute toggle
  const toggleMute = () => {
    if (localStreamRef.current) {
      try {
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !audioTrack.enabled;
          console.log(audioTrack.enabled)
          setIsMuted(!audioTrack.enabled);
          socket.emit("audio-state-change",{audioState:!audioTrack.enabled,to:inCallwith})
          console.log("Audio track found", audioTrack,"and audio toggled to",isMuted);
        }
        else console.log("No audio track found");
      } catch (error) {
        console.error("Error toggling mute:", error);
      }
    }else console.log("No local stream available");
  };

 const toggleVideo = async () => {
  if(ScreenShare) return
  if (localStreamRef.current) {
    try {
      const videotrack = localStreamRef.current.getVideoTracks()[0];
      if (videotrack) {
        const newEnabled = !videotrack.enabled;
        videotrack.enabled = newEnabled;
        const camOff = !newEnabled; 
        setIsCamOff(camOff);
        console.log('Camera toggled to off:', camOff);
        socket.emit('video-state-change', { videoState: camOff, to: inCallwith });
      }
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  } else {
    console.log('No local stream available');
  }
};

const handleScreenShare=async ()=>{
  if(ScreenShare) return;
   try {
    const screenStream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});
    const screenVideoTrack = screenStream.getVideoTracks()[0];
    screenStreamRef.current=screenStream;
    
    localStreamRef.current.getTracks().forEach((track)=>{
      if(track.kind==='video'){
         track.stop();
         localStreamRef.current.removeTrack(track)
        }
    });
    const videoSender = peerConnectionRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
    if (videoSender) {
      await videoSender.replaceTrack(screenVideoTrack);
    } else {
      // Rare fallback
      peerConnectionRef.current.addTrack(screenVideoTrack, screenStream);
    }

     localStreamRef.current.addTrack(screenVideoTrack)
    if(localVideoRef.current) localVideoRef.current.srcObject=localStreamRef.current 
    setScreenShare(true);
    screenStream.getVideoTracks()[0].onended=()=>{
     stopScreenSharing();
    }
   
    
   } catch (error) {
    console.log(error);
   }
}

const stopScreenSharing = async () => {
  if (!ScreenShare) return;
  try {
    // Stop and clean screen stream
    if (screenStreamRef.current) {
      const screenVideoTrack = screenStreamRef.current.getVideoTracks()[0];
      if (screenVideoTrack) screenVideoTrack.stop();
      screenStreamRef.current = null;
    }

    // Remove screen video from local stream
    const screenTrackInLocal = localStreamRef.current.getTracks().find(t => t.kind === 'video');
    if (screenTrackInLocal) {
      localStreamRef.current.removeTrack(screenTrackInLocal);
    }

    // Get fresh camera video (audio: false to avoid dupes)
    const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    const cameraVideoTrack = cameraStream.getVideoTracks()[0];

    // Replace video track in peer connection
    const videoSender = peerConnectionRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
    if (videoSender) {
      videoSender.replaceTrack(cameraVideoTrack);  // No await needed here
    }

    // Update local preview: add camera to existing stream (keeps audio)
    localStreamRef.current.addTrack(cameraVideoTrack);
    if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;

    setScreenShare(false);
    setIsCamOff(false);
    console.log('[VideoMeet] Screen share stopped, camera resumed');
  } catch (error) {
    console.error('[VideoMeet] Stop screen share error:', error);
    // Fallback: full restart
    getPermission().then((fullStream) => {
      // Replace all senders
      ['audio', 'video'].forEach(kind => {
        const track = fullStream.getTracks().find(t => t.kind === kind);
        if (track) {
          const sender = peerConnectionRef.current.getSenders().find(s => s.track && s.track.kind === kind);
          if (sender) sender.replaceTrack(track);
        }
      });
      localStreamRef.current = fullStream;
      if (localVideoRef.current) localVideoRef.current.srcObject = fullStream;
      setScreenShare(false);
      setIsCamOff(false);
    });
  }
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
       {isRemoteCamOff?
       <div className="relative w-full h-full border-2 border-white flex items-center justify-center bg-gray-800">
        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-green-400 text-white text-4xl font-bold">
         {inCallwith.charAt(0).toUpperCase()}
        </div>
      </div>
       :
        <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="relative w-full h-full object-cover border-2 border-white"
      />}
      {isCamOff?
      <div className="absolute top-4 right-4 w-40 h-40 border-2 border-white flex items-center justify-center bg-gray-800">
        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-green-400 text-white text-4xl font-bold">
         {inCallwith.charAt(0).toUpperCase()}
        </div>
      </div>
      :
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-4 right-4 w-40 h-40 rounded-lg border-2 border-white shadow-lg"
      />}
      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        <button
          onClick={toggleMute}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
         {isMuted?<VolumeOffIcon className='bg-blue-200'/>:<VolumeUpIcon/>}
        </button>
         <button
          onClick={toggleVideo}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
         {isCamOff?<VideocamOffIcon/>:<VideocamIcon/>}
        </button>
        <button
          onClick={handleEndCall}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          End Call
        </button>
         <button
          onClick={ScreenShare?stopScreenSharing:handleScreenShare}
        className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          {ScreenShare?<StopScreenShareIcon /> : <ScreenShareIcon />}
        </button>

      </div>
      {/* Status */}
      <div className="absolute top-4 left-4 text-white bg-black px-2 py-1 rounded text-sm">
        Status: {connectionState}
        <div>
          {isRemoteCamOff?<VideocamOffIcon></VideocamOffIcon>:<VideocamIcon></VideocamIcon>}
          {isRemoteMuted?<VolumeOffIcon></VolumeOffIcon>:<VolumeUpIcon></VolumeUpIcon>}
        </div>
      </div>
    </div>
  );
}