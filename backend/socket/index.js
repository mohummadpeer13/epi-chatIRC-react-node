const { Server } = require('socket.io');
const chatEvents = require('./chatEvents');

const socketInit = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });



  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Charger les événements liés au chat
    chatEvents(socket, io);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketInit;
