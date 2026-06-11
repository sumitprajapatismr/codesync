const express = require('express');
const { getContests, getContestById, createContest, joinContest } = require('../controllers/contestController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getContests);
router.get('/:id', protect, getContestById);
router.post('/create', protect, createContest);
router.post('/:id/join', protect, joinContest);

module.exports = router;
