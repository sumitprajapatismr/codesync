const express = require('express');
const { createRoom, joinRoomCheck, getRoomHistory, getRoomVersions, getRoomMessages } = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/create', protect, createRoom);
router.get('/join/:roomId', protect, joinRoomCheck);
router.get('/history', protect, getRoomHistory);
router.get('/:roomId/versions', protect, getRoomVersions);
router.get('/:roomId/messages', protect, getRoomMessages);

module.exports = router;
