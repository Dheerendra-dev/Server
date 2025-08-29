const { v4: uuidv4 } = require('uuid');
const websocketService = require('../services/websocketService');

// In-memory storage (replace with database later)
let incidents = [
  {
    id: uuidv4(),
    title: 'File Storage Performance Issues',
    description: 'Users experiencing slow upload speeds',
    status: 'investigating',
    impact: 'minor',
    affectedServices: ['File Storage'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date().toISOString(),
    updates: [
      {
        id: uuidv4(),
        status: 'investigating',
        message: 'We are investigating reports of slow file upload speeds.',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: uuidv4(),
        status: 'identified',
        message: 'We have identified the issue as a network bottleneck and are working on a fix.',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
      }
    ]
  }
];

// Get all incidents
const getAllIncidents = (req, res) => {
  try {
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
};

// Get incident by ID
const getIncidentById = (req, res) => {
  try {
    const incident = incidents.find(i => i.id === req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
};

// Create new incident
const createIncident = (req, res) => {
  try {
    const { title, description, impact = 'minor', affectedServices = [], organizationId, tenantId } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const newIncident = {
      id: uuidv4(),
      title,
      description,
      status: 'investigating',
      impact,
      affectedServices,
      organizationId,
      tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updates: []
    };

    incidents.push(newIncident);

    // Broadcast incident creation via WebSocket
    websocketService.broadcastIncidentUpdate(newIncident, organizationId, tenantId);

    res.status(201).json(newIncident);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create incident' });
  }
};

// Update incident
const updateIncident = (req, res) => {
  try {
    const incidentIndex = incidents.findIndex(i => i.id === req.params.id);
    if (incidentIndex === -1) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const { title, description, status, impact, affectedServices, organizationId, tenantId } = req.body;
    const updatedIncident = {
      ...incidents[incidentIndex],
      ...(title && { title }),
      ...(description && { description }),
      ...(status && { status }),
      ...(impact && { impact }),
      ...(affectedServices && { affectedServices }),
      ...(organizationId && { organizationId }),
      ...(tenantId && { tenantId }),
      updatedAt: new Date().toISOString()
    };

    incidents[incidentIndex] = updatedIncident;

    // Broadcast incident update via WebSocket
    websocketService.broadcastIncidentUpdate(
      updatedIncident,
      updatedIncident.organizationId,
      updatedIncident.tenantId
    );

    res.json(updatedIncident);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update incident' });
  }
};

// Add update to incident
const addIncidentUpdate = (req, res) => {
  try {
    const incidentIndex = incidents.findIndex(i => i.id === req.params.id);
    if (incidentIndex === -1) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const { status, message } = req.body;
    if (!status || !message) {
      return res.status(400).json({ error: 'Status and message are required' });
    }

    const newUpdate = {
      id: uuidv4(),
      status,
      message,
      createdAt: new Date().toISOString()
    };

    incidents[incidentIndex].updates.push(newUpdate);
    incidents[incidentIndex].status = status;
    incidents[incidentIndex].updatedAt = new Date().toISOString();

    // Broadcast incident update via WebSocket
    websocketService.broadcastIncidentUpdate(
      incidents[incidentIndex],
      incidents[incidentIndex].organizationId,
      incidents[incidentIndex].tenantId
    );

    res.status(201).json(newUpdate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add incident update' });
  }
};

// Delete incident
const deleteIncident = (req, res) => {
  try {
    const incidentIndex = incidents.findIndex(i => i.id === req.params.id);
    if (incidentIndex === -1) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const deletedIncident = incidents[incidentIndex];
    incidents.splice(incidentIndex, 1);

    // Broadcast incident deletion via WebSocket
    websocketService.broadcastIncidentUpdate(
      { ...deletedIncident, deleted: true },
      deletedIncident.organizationId,
      deletedIncident.tenantId
    );

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete incident' });
  }
};

module.exports = {
  getAllIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  addIncidentUpdate,
  deleteIncident,
  incidents // Export for other controllers to access
};
