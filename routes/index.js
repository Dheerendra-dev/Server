const express = require('express');
const router = express.Router();

// Import route modules
const serviceRoutes = require('./serviceRoutes');
const incidentRoutes = require('./incidentRoutes');
const statusRoutes = require('./statusRoutes');
const websocketRoutes = require('./websocketRoutes');

// Mount routes
router.use('/services', serviceRoutes);
router.use('/incidents', incidentRoutes);
router.use('/status', statusRoutes);
router.use('/websocket', websocketRoutes);

// Health check route (separate from status)
router.get('/health', require('../controllers/statusController').getHealth);

module.exports = router;
