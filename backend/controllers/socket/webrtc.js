// webrtc.js
// Pure signaling relay for video calls. This module never touches the DB —
// it just forwards SDP offers/answers and ICE candidates between two peers
// via presence.emitToUser, the same way every other module reaches a user.

const { emitToUser } = require("./presence");

const register = (io, socket) => {
  const userId = socket.userId;

  socket.on("video-offer", ({ offer, to }) => {
    emitToUser(to, "video-call-offer", { from: userId, offer });
  });

  socket.on("video-answer", ({ answer, to }) => {
    emitToUser(to, "video-call-answer", { from: userId, answer });
  });

  socket.on("ice-candidate", ({ candidate, to }) => {
    emitToUser(to, "video-ice-candidate", { from: userId, candidate });
  });

  socket.on("audio-state-change", ({ to, audioState }) => {
    emitToUser(to, "audio-state-change", { audioState, from: userId });
  });

  socket.on("video-state-change", ({ to, videoState }) => {
    emitToUser(to, "video-state-change", { videoState, from: userId });
  });

  socket.on("end-call", ({ to }) => {
    emitToUser(to, "end-call", { from: userId });
  });

  socket.on("call-declined", ({ to }) => {
    emitToUser(to, "call-declined", { from: userId });
  });
};

module.exports = { register };
