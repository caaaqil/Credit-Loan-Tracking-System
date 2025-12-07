const express = require('express');
const { protect } = require('../middleware/auth');
const { getMonthlyReport } = require('../controllers/reportController');

const router = express.Router();

// @route   GET /api/reports/monthly
// @desc    Get monthly report
// @access  Private
router.get('/monthly', protect, getMonthlyReport);

module.exports = router;
