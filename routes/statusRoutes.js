const express = require('express');
const router = express.Router();
const { getSystemStatus, getHealth } = require('../controllers/statusController');

// @route   GET /api/status
// @desc    Get system status overview
// @access  Public
router.get('/', getSystemStatus);

// @route   GET /health
// @desc    Health check endpoint
// @access  Public
router.get('/health', getHealth);

module.exports = router;
