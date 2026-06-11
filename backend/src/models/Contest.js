const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  problems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
  }],
  leaderboard: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    solvedProblemsCount: {
      type: Number,
      default: 0,
    },
    submissions: [{
      problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
      status: String, // 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', etc.
      submittedAt: { type: Date, default: Date.now },
      scoreEarned: Number,
    }],
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Contest', contestSchema);
