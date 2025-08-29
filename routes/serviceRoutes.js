const express = require('express');
const router = express.Router();
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');
const { validateService, validateUUID } = require('../middleware/validation');

// @route   GET /api/services
// @desc    Get all services
// @access  Public
router.get('/', getAllServices);

// @route   GET /api/services/:id
// @desc    Get service by ID
// @access  Public
router.get('/:id', validateUUID, getServiceById);

// @route   POST /api/services
// @desc    Create new service
// @access  Private (add auth middleware later)
router.post('/', validateService, createService);

// @route   PUT /api/services/:id
// @desc    Update service
// @access  Private (add auth middleware later)
router.put('/:id', validateUUID, validateService, updateService);

// @route   DELETE /api/services/:id
// @desc    Delete service
// @access  Private (add auth middleware later)
router.delete('/:id', validateUUID, deleteService);

module.exports = router;
