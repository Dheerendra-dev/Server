// Validation middleware
const validateService = (req, res, next) => {
  const { name, description } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
  }
  
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    return res.status(400).json({ error: 'Description is required and must be a non-empty string' });
  }
  
  if (req.body.status && !['operational', 'degraded', 'partial', 'major'].includes(req.body.status)) {
    return res.status(400).json({ error: 'Status must be one of: operational, degraded, partial, major' });
  }
  
  if (req.body.uptime && (typeof req.body.uptime !== 'number' || req.body.uptime < 0 || req.body.uptime > 100)) {
    return res.status(400).json({ error: 'Uptime must be a number between 0 and 100' });
  }
  
  next();
};

const validateIncident = (req, res, next) => {
  const { title, description } = req.body;
  
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
  }
  
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    return res.status(400).json({ error: 'Description is required and must be a non-empty string' });
  }
  
  if (req.body.impact && !['minor', 'major', 'critical'].includes(req.body.impact)) {
    return res.status(400).json({ error: 'Impact must be one of: minor, major, critical' });
  }
  
  if (req.body.status && !['investigating', 'identified', 'monitoring', 'resolved'].includes(req.body.status)) {
    return res.status(400).json({ error: 'Status must be one of: investigating, identified, monitoring, resolved' });
  }
  
  if (req.body.affectedServices && !Array.isArray(req.body.affectedServices)) {
    return res.status(400).json({ error: 'Affected services must be an array' });
  }
  
  next();
};

const validateIncidentUpdate = (req, res, next) => {
  const { status, message } = req.body;
  
  if (!status || typeof status !== 'string' || status.trim().length === 0) {
    return res.status(400).json({ error: 'Status is required and must be a non-empty string' });
  }
  
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required and must be a non-empty string' });
  }
  
  if (!['investigating', 'identified', 'monitoring', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Status must be one of: investigating, identified, monitoring, resolved' });
  }
  
  next();
};

const validateUUID = (req, res, next) => {
  const { id } = req.params;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  
  next();
};

module.exports = {
  validateService,
  validateIncident,
  validateIncidentUpdate,
  validateUUID
};
