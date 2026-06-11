const express = require('express');
const { runCode, submitCode } = require('../controllers/codeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Run code
router.post('/run', protect, runCode);

// Submit code
router.post('/submit', submitCode);

module.exports = router;
