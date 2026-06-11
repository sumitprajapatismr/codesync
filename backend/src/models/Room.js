const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
  },
  selectedLanguage: {
    type: String,
    default: 'javascript',
  },
  currentCode: {
    type: Map,
    of: String,
    default: {},
  },
  versionHistory: [{
    code: String,
    language: String,
    timestamp: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  isInterview: {
    type: Boolean,
    default: false,
  },
  interviewSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Rooms auto-delete after 24 hours to clean DB, or we can keep it without expiration. Let's keep it without expiration but add standard timestamps
  },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
