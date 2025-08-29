const { v4: uuidv4 } = require('uuid');

// In-memory storage (replace with database later)
let services = [
  {
    id: uuidv4(),
    name: 'API Gateway',
    description: 'Core API services and routing',
    status: 'operational',
    uptime: 99.98,
    lastUpdated: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: 'Database Cluster',
    description: 'Primary database and replicas',
    status: 'operational',
    uptime: 99.95,
    lastUpdated: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: 'Authentication Service',
    description: 'User authentication and authorization',
    status: 'operational',
    uptime: 99.99,
    lastUpdated: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: 'File Storage',
    description: 'Document and media storage',
    status: 'degraded',
    uptime: 98.5,
    lastUpdated: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: 'Email Service',
    description: 'Transactional email delivery',
    status: 'operational',
    uptime: 99.92,
    lastUpdated: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: 'CDN',
    description: 'Content delivery network',
    status: 'operational',
    uptime: 99.97,
    lastUpdated: new Date().toISOString()
  }
];

// Get all services
const getAllServices = (req, res) => {
  try {
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

// Get service by ID
const getServiceById = (req, res) => {
  try {
    const service = services.find(s => s.id === req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service' });
  }
};

// Create new service
const createService = (req, res) => {
  try {
    const { name, description, status = 'operational' } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    const newService = {
      id: uuidv4(),
      name,
      description,
      status,
      uptime: 100,
      lastUpdated: new Date().toISOString()
    };

    services.push(newService);
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' });
  }
};

// Update service
const updateService = (req, res) => {
  try {
    const serviceIndex = services.findIndex(s => s.id === req.params.id);
    if (serviceIndex === -1) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const { name, description, status, uptime } = req.body;
    const updatedService = {
      ...services[serviceIndex],
      ...(name && { name }),
      ...(description && { description }),
      ...(status && { status }),
      ...(uptime !== undefined && { uptime }),
      lastUpdated: new Date().toISOString()
    };

    services[serviceIndex] = updatedService;
    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service' });
  }
};

// Delete service
const deleteService = (req, res) => {
  try {
    const serviceIndex = services.findIndex(s => s.id === req.params.id);
    if (serviceIndex === -1) {
      return res.status(404).json({ error: 'Service not found' });
    }

    services.splice(serviceIndex, 1);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  services // Export for other controllers to access
};
