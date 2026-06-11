const User = require('../models/User');

// @desc    Get user profile by ID
// @route   GET /api/users/profile/:id
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('solvedProblems', 'title difficulty tags')
      .populate('friends', 'name email avatar rating');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Private
const getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('name avatar rating solvedProblems')
      .sort({ rating: -1 })
      .limit(50); // Get top 50 users

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Update GitHub Profile
// @route   POST /api/users/github
// @access  Private
const updateGitHub = async (req, res, next) => {
  const { githubUsername } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.githubUsername = githubUsername;
    await user.save();

    res.json({
      success: true,
      message: 'GitHub username updated successfully',
      data: { githubUsername: user.githubUsername },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send Friend Request
// @route   POST /api/users/friends/request/:id
// @access  Private
const sendFriendRequest = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target user not found' });
    }

    if (targetUser._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot send a friend request to yourself' });
    }

    // Check if already friends
    if (currentUser.friends.includes(targetUser._id)) {
      return res.status(400).json({ success: false, message: 'You are already friends with this user' });
    }

    // Check if request already sent
    if (targetUser.friendRequests.includes(currentUser._id)) {
      return res.status(400).json({ success: false, message: 'Friend request already sent' });
    }

    targetUser.friendRequests.push(currentUser._id);
    await targetUser.save();

    res.json({ success: true, message: 'Friend request sent successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept Friend Request
// @route   POST /api/users/friends/accept/:id
// @access  Private
const acceptFriendRequest = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const senderUser = await User.findById(req.params.id);

    if (!senderUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if request exists
    if (!currentUser.friendRequests.includes(senderUser._id)) {
      return res.status(400).json({ success: false, message: 'No friend request found from this user' });
    }

    // Add each other to friends
    currentUser.friends.push(senderUser._id);
    senderUser.friends.push(currentUser._id);

    // Remove from request list
    currentUser.friendRequests = currentUser.friendRequests.filter(
      (reqId) => reqId.toString() !== senderUser._id.toString()
    );

    await currentUser.save();
    await senderUser.save();

    res.json({ success: true, message: 'Friend request accepted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Friends list
// @route   GET /api/users/friends
// @access  Private
const getFriends = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'friends',
      'name email avatar rating'
    );
    res.json({ success: true, data: user.friends });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  getLeaderboard,
  updateGitHub,
  sendFriendRequest,
  acceptFriendRequest,
  getFriends,
};
