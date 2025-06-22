export const socketHandler = (io) => {
  const users = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('login', (userId) => {
      users.set(userId, socket.id);
      socket.userId = userId;
      io.emit('userStatus', { userId, status: 'online' });
    });

    socket.on('message', async (data) => {
      const recipientSocket = users.get(data.recipientId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('message', {
          ...data,
          senderId: socket.userId
        });
      }
    });

    socket.on('typing', (data) => {
      const recipientSocket = users.get(data.recipientId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('typing', {
          senderId: socket.userId
        });
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        users.delete(socket.userId);
        io.emit('userStatus', { userId: socket.userId, status: 'offline' });
      }
    });
  });
};