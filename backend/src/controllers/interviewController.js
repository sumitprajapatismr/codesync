const Session = require('../models/Session');
const User = require('../models/User');
const Room = require('../models/Room');

// @desc    Create a new interview session
// @route   POST /api/interviews/create
// @access  Private
const createInterviewSession = async (req, res, next) => {
  const { candidateEmail, problemId, roomName } = req.body;

  try {
    const candidate = await User.findOne({ email: candidateEmail });
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate user not found' });
    }

    if (candidate._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot interview yourself' });
    }

    // Generate Room ID
    let roomId = '';
    let isUnique = false;
    while (!isUnique) {
      roomId = Math.random().toString(36).substring(2, 10).toUpperCase();
      const existing = await Room.findOne({ roomId });
      if (!existing) isUnique = true;
    }

    // Create room first
    const room = await Room.create({
      roomId,
      name: roomName || `Interview: ${req.user.name} & ${candidate.name}`,
      owner: req.user._id,
      participants: [req.user._id, candidate._id],
      problem: problemId || null,
      isInterview: true,
    });

    // Create session
    const session = await Session.create({
      interviewer: req.user._id,
      candidate: candidate._id,
      room: room._id,
      activityLog: [{
        action: 'session_created',
        user: req.user._id,
        details: `Interview session initiated by ${req.user.name}`,
      }],
      status: 'Active',
    });

    // Attach session to room
    room.interviewSession = session._id;
    await room.save();

    res.status(201).json({
      success: true,
      data: {
        session,
        roomId: room.roomId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get session logs & details
// @route   GET /api/interviews/:id
// @access  Private
const getSessionDetails = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('interviewer', 'name email avatar')
      .populate('candidate', 'name email avatar')
      .populate('room', 'roomId name currentCode selectedLanguage')
      .populate('activityLog.user', 'name');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInterviewSession,
  getSessionDetails,
};
