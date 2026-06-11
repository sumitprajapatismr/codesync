const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  interviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
  },
  activityLog: [{
    action: {
      type: String, // 'join', 'leave', 'code_edit', 'compile', 'run_test', 'chat', etc.
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    details: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  status: {
    type: String,
    enum: ['Active', 'Completed'],
    default: 'Active',
  },
  recordingMetadata: {
    startTime: Date,
    endTime: Date,
    durationSeconds: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Session', sessionSchema);
