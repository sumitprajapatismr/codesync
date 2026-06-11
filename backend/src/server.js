require('dotenv').config();
const express = require('express');
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

const app = express();

// =========================
// CORS FIX (IMPORTANT)
// =========================
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://codesync-sooty-three.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROOT ROUTE
app.get("/", (req, res) => {
  res.send("CodeSync Backend is Running");
});

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "CodeSync Backend is running smoothly"
  });
});

// DB CONNECTION
connectDB();

// API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/interviews', interviewRoutes);

// ERROR HANDLER
app.use(errorHandler);

// IMPORTANT: NO server.listen() (Vercel serverless)

module.exports = app;