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

// Connect Database
connectDB();

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get('/', (req, res) => {
  res.send('CodeSync Backend is Running');
});

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CodeSync Backend is running smoothly'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/interviews', interviewRoutes);

// Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`
  );
});