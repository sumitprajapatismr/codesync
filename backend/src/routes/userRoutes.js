const express = require('express');
const {
  getUserProfile,
  getLeaderboard,
  updateGitHub,
  sendFriendRequest,
  acceptFriendRequest,
  getFriends,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/profile/:id', protect, getUserProfile);
router.get('/leaderboard', protect, getLeaderboard);
router.post('/github', protect, updateGitHub);
router.post('/friends/request/:id', protect, sendFriendRequest);
router.post('/friends/accept/:id', protect, acceptFriendRequest);
router.get('/friends', protect, getFriends);

module.exports = router;
