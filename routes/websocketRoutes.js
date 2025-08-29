const express = require('express');
const router = express.Router();
const websocketService = require('../services/websocketService');

// @route   GET /api/websocket/info
// @desc    Get WebSocket connection information
// @access  Public
router.get('/info', (req, res) => {
  try {
    const { organizationId, tenantId } = req.query;
    
    const connectedClients = websocketService.getConnectedClientsCount(organizationId, tenantId);
    const allClientsInfo = websocketService.getConnectedClientsInfo();
    
    // Filter client info by organization/tenant if requested
    let filteredClientsInfo = allClientsInfo;
    if (organizationId) {
      filteredClientsInfo = allClientsInfo.filter(client => client.organizationId === organizationId);
    } else if (tenantId) {
      filteredClientsInfo = allClientsInfo.filter(client => client.tenantId === tenantId);
    }
    
    res.json({
      connectedClients,
      totalConnectedClients: websocketService.getConnectedClientsCount(),
      clientsInfo: filteredClientsInfo,
      websocketEndpoint: '/socket.io',
      supportedEvents: [
        'authenticate',
        'join-organization',
        'leave-organization',
        'ping',
        'service-update',
        'incident-update',
        'status-update'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch WebSocket information' });
  }
});

// @route   POST /api/websocket/broadcast
// @desc    Manually broadcast a message (for testing/admin purposes)
// @access  Private (add auth middleware later)
router.post('/broadcast', (req, res) => {
  try {
    const { type, data, organizationId, tenantId } = req.body;
    
    if (!type || !data) {
      return res.status(400).json({ error: 'Type and data are required' });
    }
    
    switch (type) {
      case 'service-update':
        websocketService.broadcastServiceUpdate(data, organizationId, tenantId);
        break;
      case 'incident-update':
        websocketService.broadcastIncidentUpdate(data, organizationId, tenantId);
        break;
      case 'status-update':
        websocketService.broadcastStatusUpdate(data, organizationId, tenantId);
        break;
      default:
        return res.status(400).json({ error: 'Invalid broadcast type' });
    }
    
    res.json({
      success: true,
      message: `Broadcast sent successfully`,
      type,
      organizationId,
      tenantId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to broadcast message' });
  }
});

module.exports = router;
