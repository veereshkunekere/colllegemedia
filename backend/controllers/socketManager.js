const { get } = require('http');
const { Server } = require('socket.io');
const onlineUsers = new Map(); // userId => { sockets: [], timeout: null }

const socketManager = (server) => {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    const connections = {}; // { roomPath: [{ socketId, userId, username }] }

    console.log('Socket.IO server initialized');

    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId?.toString();
        console.log(`✅ User connected: socketId = ${socket.id}, userId = ${userId}`);

        if (!userId) {
            console.log('Connection without userId; disconnecting');
            socket.disconnect(true);
            return;
        }

        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, { sockets: [], timeout: null });
        }
        const userData = onlineUsers.get(userId);
        userData.sockets.push(socket);

        // Clear any pending offline timeout
        if (userData.timeout) {
            clearTimeout(userData.timeout);
            userData.timeout = null;
        }

        // Broadcast online if first socket
        if (userData.sockets.length === 1) {
            io.emit('userOnline', userId);
            console.log(`Broadcasted userOnline for ${userId}`);
        }

        socket.on('video-offer', (data) => {
            console.log(`Received video-offer from ${userId} to ${data.to}`, data.offer.type);
            const { offer, to } = data;
            emitToUser(to, 'video-call-offer', { from: userId, offer });
        });

        socket.on('video-answer', (data) => {
         console.log(`Received video-answer from ${userId}:`, data.answer.type);
         const { answer, to } = data;
         emitToUser(to, 'video-call-answer', { from: userId, answer });  // Forward answer back to caller
       });

        socket.on('ice-candidate', (data) => {
         console.log(`Received ICE candidate from ${userId}`);
         const { candidate, to } = data;
         emitToUser(to, 'video-ice-candidate', { from: userId, candidate });  // Forward ICE to other peer
       });

       socket.on('audio-state-change',(data)=>{
        emitToUser(data.to,'audio-state-change',{audioState:data.audioState,from:userId})
       });

       socket.on('video-state-change',(data)=>{
        console.log(data)
          emitToUser(data.to,'video-state-change',{videoState:data.videoState,from:userId})
       })
       
       socket.on('end-call', (data) => {
       console.log(`Received end-call from ${userId} to ${data.to}`);
       const { to } = data;
       emitToUser(to, 'end-call', { from: userId });
       });

       socket.on('call-declined', (data) => {
            console.log(`Received call-declined from ${userId} to ${data.to}`);
            const { to } = data;
            emitToUser(to, 'call-declined', { from: userId });
       })
        // Handle disconnect
        socket.on('disconnect', (reason) => {
            console.log(`User ${userId} socket disconnected (reason: ${reason})`);
            userData.sockets = userData.sockets.filter((s) => s.id !== socket.id);

            if (userData.sockets.length === 0) {
                // Grace period for reconnect
                userData.timeout = setTimeout(() => {
                    if (onlineUsers.has(userId) && onlineUsers.get(userId).sockets.length === 0) {
                        onlineUsers.delete(userId);
                        io.emit('userOffline', userId);
                        console.log(`Broadcasted userOffline for ${userId} after timeout`);
                    }
                }, 5000);
            }
        });
    });

    return io;
};

const getOnlineUserSocket = (userId) => {
    const key = userId?.toString();
    const userData = onlineUsers.get(key);
    console.log(`Looking up sockets for userId ${key}: ${userData ? userData.sockets.length : 0} found`);
    return userData?.sockets[0] || null;
};

const emitToUser = (userId, event, data) => {
    const key = userId?.toString();
    const userData = onlineUsers.get(key);
    if (userData) {
        console.log('call declined to user', userId,'by',data.from)
        userData.sockets.forEach((socket) => socket.emit(event, data));
    }
};

module.exports = socketManager;
module.exports.getOnlineUserSocket = getOnlineUserSocket;
module.exports.emitToUser = emitToUser;
module.exports.onlineUsers = onlineUsers;