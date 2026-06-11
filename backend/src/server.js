require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const connectDB = require('./config/db');

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

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROOT
app.get("/", (req, res) => {
  res.send("CodeSync Backend is Running");
});

// HEALTH
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// DB
connectDB();

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/interviews', interviewRoutes);

// ERROR HANDLER
app.use(errorHandler);

// SOCKET
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

socketHandler(io);

//  IMPORTANT: VERCEL me listen mat karo
// server.listen(PORT) YAHAN NAHI HOGA

module.exports = app;