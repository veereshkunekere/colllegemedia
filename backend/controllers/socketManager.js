const socket=require('socket.io')

const socketManager = (server) => {
    const io = new socket.Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });

        // Handle other events here
    });

    return io;
}

module.exports= socketManager;