const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",                    // Change to your frontend URL in production
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,               // Better for mobile/reconnections
  pingInterval: 25000,
  connectTimeout: 45000
});

// Simple in-memory storage (replace with Redis/MongoDB in production)
const users = new Map();            // socket.id -> { username, namespace? }
const messageHistory = new Map();   // room -> array of messages (max 100)

// Middleware for authentication (runs on every connection)
const authMiddleware = (socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query.token;
  
  // Simple demo auth — in real app, verify JWT or session
  if (!token) {
    return next(new Error("Authentication required"));
  }
  
  // You can decode token here and attach user data
  socket.user = { id: socket.id, token }; // placeholder
  console.log(`Auth passed for socket ${socket.id}`);
  next();
};

// Global middleware (applied to all namespaces)
io.use((socket, next) => {
  console.log(`New connection attempt: ${socket.id} from ${socket.handshake.address}`);
  next();
});

// ====================== Main Chat Namespace ======================
const chatNamespace = io.of('/chat');

chatNamespace.use(authMiddleware);   // Protect this namespace

chatNamespace.on('connection', (socket) => {
  console.log(`User connected to /chat: ${socket.id}`);

  let username = 'Anonymous';

  // Set username
  socket.on('set username', (name) => {
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      name = `User-${socket.id.slice(0, 6)}`;
    }
    username = name.trim();
    users.set(socket.id, { username, namespace: '/chat' });

    // Broadcast join
    chatNamespace.emit('user joined', {
      username,
      message: `${username} joined the chat`,
      onlineCount: users.size
    });

    // Send recent history (last 50 messages)
    const history = messageHistory.get('general') || [];
    socket.emit('message history', history.slice(-50));
  });

  // Typing indicator
  socket.on('typing', (isTyping) => {
    socket.broadcast.emit('user typing', { username, isTyping });
  });

  // Public chat message with simple rate limit
  let lastMessageTime = 0;
  socket.on('chat message', (msg) => {
    if (!username || typeof msg !== 'string' || msg.trim() === '') return;

    const now = Date.now();
    if (now - lastMessageTime < 500) { // 500ms cooldown per user
      return socket.emit('error', { message: 'Message too fast' });
    }
    lastMessageTime = now;

    const messageData = {
      id: Date.now().toString(36),
      username,
      message: msg.trim(),
      timestamp: new Date().toISOString()
    };

    // Save to history (keep last 100)
    let history = messageHistory.get('general') || [];
    history.push(messageData);
    if (history.length > 100) history.shift();
    messageHistory.set('general', history);

    chatNamespace.emit('chat message', messageData);
  });

  // Join room
  socket.on('join room', (room) => {
    if (!room || typeof room !== 'string') return;
    socket.join(room);
    socket.to(room).emit('room message', {
      username: 'System',
      message: `${username} joined room ${room}`,
      timestamp: new Date().toISOString()
    });
  });

  // Room message
  socket.on('room message', ({ room, message }) => {
    if (!room || !message) return;
    const msgData = {
      username,
      message: message.trim(),
      room,
      timestamp: new Date().toISOString()
    };
    chatNamespace.to(room).emit('room message', msgData);
  });

  // Private message
  socket.on('private message', ({ toSocketId, message }) => {
    if (!toSocketId || !message) return;
    const msgData = {
      from: username,
      message: message.trim(),
      timestamp: new Date().toISOString()
    };
    chatNamespace.to(toSocketId).emit('private message', msgData);
    socket.emit('private message', { ...msgData, to: 'You' });
  });

  // Get online users
  socket.on('get online users', () => {
    const online = Array.from(users.values()).map(u => u.username);
    socket.emit('online users', online);
  });

  // Disconnect
  socket.on('disconnect', () => {
    users.delete(socket.id);
    chatNamespace.emit('user left', {
      username,
      message: `${username} left the chat`,
      onlineCount: users.size
    });
    console.log(`User disconnected from /chat: ${socket.id} (${username})`);
  });
});

// ====================== Admin Namespace (Protected) ======================
const adminNamespace = io.of('/admin');

adminNamespace.use(authMiddleware);
adminNamespace.use((socket, next) => {
  // Extra check for admin (demo: any authenticated is admin here)
  // In real app, check user.role === 'admin'
  next();
});

adminNamespace.on('connection', (socket) => {
  console.log(`Admin connected: ${socket.id}`);

  socket.on('admin broadcast', (msg) => {
    io.emit('admin notification', { message: msg, from: 'Admin' }); // broadcast to all namespaces
  });

  socket.on('disconnect', () => {
    console.log(`Admin disconnected: ${socket.id}`);
  });
});

// Basic HTTP route
app.get('/', (req, res) => {
  res.send(`
    <h1>🚀 Enhanced Socket.IO Backend Running</h1>
    <p>Namespaces:</p>
    <ul>
      <li><strong>/chat</strong> — Main chat with rooms, typing, history</li>
      <li><strong>/admin</strong> — Protected admin namespace</li>
    </ul>
    <p>Connect using Socket.IO client on port 3000.</p>
  `);
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Enhanced Socket.IO server running on http://localhost:${PORT}`);
  console.log(`   → Chat namespace: /chat`);
  console.log(`   → Admin namespace: /admin`);
});