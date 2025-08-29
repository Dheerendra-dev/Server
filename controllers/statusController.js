const { services } = require('./serviceController');
const { incidents } = require('./incidentController');

// Get system status overview
const getSystemStatus = (req, res) => {
  try {
    const totalServices = services.length;
    const operationalServices = services.filter(s => s.status === 'operational').length;
    const degradedServices = services.filter(s => s.status === 'degraded').length;
    const downServices = services.filter(s => s.status === 'major' || s.status === 'partial').length;
    
    const activeIncidents = incidents.filter(i => i.status !== 'resolved').length;
    const averageUptime = services.reduce((sum, service) => sum + service.uptime, 0) / totalServices;

    let overallStatus = 'operational';
    if (downServices > 0) {
      overallStatus = 'major';
    } else if (degradedServices > 0 || activeIncidents > 0) {
      overallStatus = 'degraded';
    }

    res.json({
      overallStatus,
      totalServices,
      operationalServices,
      degradedServices,
      downServices,
      activeIncidents,
      averageUptime: Math.round(averageUptime * 100) / 100,
      lastUpdated: new Date().toISOString()
    });
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
