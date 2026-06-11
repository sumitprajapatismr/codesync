const express = require('express');
const { createInterviewSession, getSessionDetails } = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/create', protect, createInterviewSession);
router.get('/:id', protect, getSessionDetails);

module.exports = router;
