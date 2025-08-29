const express = require('express');
const router = express.Router();
const {
  getAllIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  addIncidentUpdate,
  deleteIncident
} = require('../controllers/incidentController');
const { validateIncident, validateIncidentUpdate, validateUUID } = require('../middleware/validation');

// @route   GET /api/incidents
// @desc    Get all incidents
// @access  Public
router.get('/', getAllIncidents);

// @route   GET /api/incidents/:id
// @desc    Get incident by ID
// @access  Public
router.get('/:id', validateUUID, getIncidentById);

// @route   POST /api/incidents
// @desc    Create new incident
// @access  Private (add auth middleware later)
router.post('/', validateIncident, createIncident);

// @route   PUT /api/incidents/:id
// @desc    Update incident
// @access  Private (add auth middleware later)
router.put('/:id', validateUUID, validateIncident, updateIncident);

// @route   POST /api/incidents/:id/updates
// @desc    Add update to incident
// @access  Private (add auth middleware later)
router.post('/:id/updates', validateUUID, validateIncidentUpdate, addIncidentUpdate);

// @route   DELETE /api/incidents/:id
// @desc    Delete incident
// @access  Private (add auth middleware later)
router.delete('/:id', validateUUID, deleteIncident);

module.exports = router;
