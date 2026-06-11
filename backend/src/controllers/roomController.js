const Room = require('../models/Room');
const Problem = require('../models/Problem');
const Message = require('../models/Message');

// @desc    Create a new collaboration room
// @route   POST /api/rooms/create
// @access  Private
const createRoom = async (req, res, next) => {
  const { name, problemId, isInterview, interviewSessionId } = req.body;

  try {
    // Generate a unique 8-character room code (e.g. AB12CD34)
    let roomId = '';
    let isUnique = false;
    while (!isUnique) {
      roomId = Math.random().toString(36).substring(2, 10).toUpperCase();
      const existing = await Room.findOne({ roomId });
      if (!existing) isUnique = true;
    }

    let problem = null;
    let initialCode = {};

    if (problemId) {
      problem = await Problem.findById(problemId);
      if (problem && problem.defaultCodeTemplates) {
        initialCode = {
          cpp: problem.defaultCodeTemplates.cpp,
          java: problem.defaultCodeTemplates.java,
          python: problem.defaultCodeTemplates.python,
          javascript: problem.defaultCodeTemplates.javascript,
        };
      }
    }

    const room = await Room.create({
      roomId,
      name,
      owner: req.user._id,
      participants: [req.user._id],
      problem: problemId || null,
      currentCode: initialCode,
      isInterview: isInterview || false,
      interviewSession: interviewSessionId || null,
    });

    res.status(201).json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify and fetch metadata to join a room
// @route   GET /api/rooms/join/:roomId
// @access  Private
const joinRoomCheck = async (req, res, next) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate('problem')
      .populate('owner', 'name email avatar')
      .populate('participants', 'name email avatar rating');

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Add user to participants if not already in it
    if (!room.participants.some(p => p._id.toString() === req.user._id.toString())) {
      room.participants.push(req.user._id);
      await room.save();
    }

    res.json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's recent rooms
// @route   GET /api/rooms/history
// @access  Private
const getRoomHistory = async (req, res, next) => {
  try {
    const rooms = await Room.find({
      participants: req.user._id,
    })
      .populate('problem', 'title difficulty')
      .populate('owner', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
};

// @desc    Get room code versions
// @route   GET /api/rooms/:roomId/versions
// @access  Private
const getRoomVersions = async (req, res, next) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .select('versionHistory')
      .populate('versionHistory.user', 'name avatar');

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({ success: true, data: room.versionHistory });
  } catch (error) {
    next(error);
  }
};

// @desc    Get room messages
// @route   GET /api/rooms/:roomId/messages
// @access  Private
const getRoomMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .populate('sender', 'name avatar')
      .sort({ timestamp: 1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRoom,
  joinRoomCheck,
  getRoomHistory,
  getRoomVersions,
  getRoomMessages,
};
