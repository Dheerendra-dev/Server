const { services } = require('./serviceController');
const { incidents } = require('./incidentController');
const websocketService = require('../services/websocketService');

// Get system status overview
const getSystemStatus = (req, res) => {
  try {
    const { organizationId, tenantId } = req.query;

    // Filter services and incidents by organization/tenant if provided
    let filteredServices = services;
    let filteredIncidents = incidents;

    if (organizationId) {
      filteredServices = services.filter(s => s.organizationId === organizationId);
      filteredIncidents = incidents.filter(i => i.organizationId === organizationId);
    } else if (tenantId) {
      filteredServices = services.filter(s => s.tenantId === tenantId);
      filteredIncidents = incidents.filter(i => i.tenantId === tenantId);
    }

    const totalServices = filteredServices.length;
    const operationalServices = filteredServices.filter(s => s.status === 'operational').length;
    const degradedServices = filteredServices.filter(s => s.status === 'degraded').length;
    const downServices = filteredServices.filter(s => s.status === 'major' || s.status === 'partial').length;

    const activeIncidents = filteredIncidents.filter(i => i.status !== 'resolved').length;
    const averageUptime = totalServices > 0 ?
      filteredServices.reduce((sum, service) => sum + service.uptime, 0) / totalServices : 100;

    let overallStatus = 'operational';
    if (downServices > 0) {
      overallStatus = 'major';
    } else if (degradedServices > 0 || activeIncidents > 0) {
      overallStatus = 'degraded';
    }

    const statusData = {
      overallStatus,
      totalServices,
      operationalServices,
      degradedServices,
      downServices,
      activeIncidents,
      averageUptime: Math.round(averageUptime * 100) / 100,
      lastUpdated: new Date().toISOString(),
      organizationId,
      tenantId
    };

    res.json(statusData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch system status' });
  }
};

// Health check endpoint
const getHealth = (req, res) => {
  try {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
};

module.exports = {
  getSystemStatus,
  getHealth
};
