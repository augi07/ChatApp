const express = require('express');
const mysql = require('mysql2/promise');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use('/api/auth', authRoutes);

const pool = mysql.createPool({
  host: 'db',
  user: 'chatuser',
  password: 'chatpassword',
  database: 'chatdb'
});

// Wait for the Database to be ready
const waitForDB = async () => {
  let connected = false;
  while (!connected) {
    try {
      await pool.query('SELECT 1');
      console.log('✅ Database connected!');
      connected = true;
    } catch (err) {
      console.log('⏳ Waiting for database...');
      await new Promise(res => setTimeout(res, 2000));
    }
  }
};

// Initialize Database (Runs `schema.sql`)
const initDB = async () => {
  await waitForDB();
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql')).toString();
    const statements = schema.split(';').filter(stmt => stmt.trim());
    for (let statement of statements) {
      await pool.query(statement);
    }
    console.log('✅ Database initialized successfully!');
  } catch (err) {
    console.error('❌ DB init error:', err);
  }
};

initDB();

// Real-time Chat with Socket.io
io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  // Load Chat History
  socket.on('loadMessages', async () => {
    try {
      const [messages] = await pool.query('SELECT * FROM messages ORDER BY created_at ASC');
      socket.emit('messagesLoaded', messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  });

  // Handle New Messages
  socket.on('sendMessage', async ({ user_id, content }) => {
    try {
      const [result] = await pool.query('INSERT INTO messages (user_id, content) VALUES (?, ?)', [user_id, content]);
      const newMessage = { id: result.insertId, user_id, content, created_at: new Date() };

      io.emit('newMessage', newMessage); // Broadcast message to all clients
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});