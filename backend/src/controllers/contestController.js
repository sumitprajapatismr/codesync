const Contest = require('../models/Contest');
const Problem = require('../models/Problem');

// @desc    Get all contests
// @route   GET /api/contests
// @access  Private
const getContests = async (req, res, next) => {
  try {
    const contests = await Contest.find({}).sort({ startTime: 1 });
    res.json({ success: true, data: contests });
  } catch (error) {
    next(error);
  }
};

// @desc    Get contest details
// @route   GET /api/contests/:id
// @access  Private
const getContestById = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('problems', 'title difficulty tags')
      .populate('leaderboard.user', 'name avatar rating');

    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    res.json({ success: true, data: contest });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a contest
// @route   POST /api/contests/create
// @access  Private
const createContest = async (req, res, next) => {
  const { title, startTime, endTime, problemIds } = req.body;

  try {
    const contest = await Contest.create({
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      problems: problemIds || [],
    });

    res.status(201).json({ success: true, data: contest });
  } catch (error) {
    next(error);
  }
};

// @desc    Join a contest (register)
// @route   POST /api/contests/:id/join
// @access  Private
const joinContest = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    // Check if already registered
    const isRegistered = contest.leaderboard.some(
      (entry) => entry.user.toString() === req.user._id.toString()
    );

    if (isRegistered) {
      return res.status(400).json({ success: false, message: 'Already registered for this contest' });
    }

    contest.leaderboard.push({
      user: req.user._id,
      score: 0,
      solvedProblemsCount: 0,
      submissions: [],
    });

    await contest.save();

    res.json({ success: true, message: 'Registered for contest successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContests,
  getContestById,
  createContest,
  joinContest,
};
