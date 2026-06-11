require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = async () => {
  const connect = require('./config/db');
  await connect();
};

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const problemRoutes = require('./routes/problemRoutes');
const roomRoutes = require('./routes/roomRoutes');
const codeRoutes = require('./routes/codeRoutes');
const contestRoutes = require('./routes/contestRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');
const socketHandler = require('./sockets/socketHandler');

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB Connection
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/interviews', interviewRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'CodeSync Backend is running smoothly' });
});

// Error Handler Middleware
app.use(errorHandler);

// Setup Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize Socket Handlers
socketHandler(io);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
