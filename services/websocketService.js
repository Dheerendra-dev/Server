const { Server } = require('socket.io');
const { getLogger } = require('../middleware/logger');

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedClients = new Map(); // Store client info with organization/tenant data
    this.logger = console; // Will be updated when initialized
  }

  /**
   * Initialize WebSocket server
   * @param {http.Server} server - HTTP server instance
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: [
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'https://status-backend-k1tx.onrender.com',
          'https://status-client-omega.vercel.app'
        ],
        credentials: true,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
    this.logger = console; // Use console for now, can be enhanced later
    this.logger.log('🔌 WebSocket service initialized');
  }

  /**
   * Setup WebSocket event handlers
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      this.logger.log(`📡 Client connected: ${socket.id}`);

      // Handle client authentication/organization setup
      socket.on('authenticate', (data) => {
        this.handleAuthentication(socket, data);
      });

      // Handle joining organization/tenant rooms
      socket.on('join-organization', (data) => {
        this.handleJoinOrganization(socket, data);
      });

      // Handle leaving organization/tenant rooms
      socket.on('leave-organization', (data) => {
        this.handleLeaveOrganization(socket, data);
      });

      // Handle client disconnect
      socket.on('disconnect', (reason) => {
        this.handleDisconnect(socket, reason);
      });

      // Handle ping for connection health
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date().toISOString() });
      });
    });
  }

  /**
   * Handle client authentication
   * @param {Socket} socket - Socket instance
   * @param {Object} data - Authentication data
   */
  handleAuthentication(socket, data) {
    try {
      const { userId, organizationId, tenantId, userRole } = data;

      // Store client information
      this.connectedClients.set(socket.id, {
        userId,
        organizationId,
        tenantId,
        userRole,
        connectedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      });

      // Join organization-specific room if provided
      if (organizationId) {
        socket.join(`org:${organizationId}`);
        this.logger.log(`👥 Client ${socket.id} joined organization: ${organizationId}`);
      }

      // Join tenant-specific room if provided
      if (tenantId) {
        socket.join(`tenant:${tenantId}`);
        this.logger.log(`🏢 Client ${socket.id} joined tenant: ${tenantId}`);
      }

      // Send authentication success
      socket.emit('authenticated', {
        success: true,
        clientId: socket.id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error('Authentication error:', error);
      socket.emit('authentication-error', {
        error: 'Authentication failed',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Handle joining organization room
   * @param {Socket} socket - Socket instance
   * @param {Object} data - Organization data
   */
  handleJoinOrganization(socket, data) {
    try {
      const { organizationId } = data;
      if (!organizationId) {
        socket.emit('error', { message: 'Organization ID is required' });
        return;
      }

      socket.join(`org:${organizationId}`);

      // Update client info
      const clientInfo = this.connectedClients.get(socket.id);
      if (clientInfo) {
        clientInfo.organizationId = organizationId;
        clientInfo.lastActivity = new Date().toISOString();
      }

      socket.emit('joined-organization', {
        organizationId,
        timestamp: new Date().toISOString()
      });

      this.logger.log(`👥 Client ${socket.id} joined organization: ${organizationId}`);
    } catch (error) {
      this.logger.error('Join organization error:', error);
      socket.emit('error', { message: 'Failed to join organization' });
    }
  }

  /**
   * Handle leaving organization room
   * @param {Socket} socket - Socket instance
   * @param {Object} data - Organization data
   */
  handleLeaveOrganization(socket, data) {
    try {
      const { organizationId } = data;
      if (!organizationId) {
        socket.emit('error', { message: 'Organization ID is required' });
        return;
      }

      socket.leave(`org:${organizationId}`);

      socket.emit('left-organization', {
        organizationId,
        timestamp: new Date().toISOString()
      });

      this.logger.log(`👥 Client ${socket.id} left organization: ${organizationId}`);
    } catch (error) {
      this.logger.error('Leave organization error:', error);
      socket.emit('error', { message: 'Failed to leave organization' });
    }
  }

  /**
   * Handle client disconnect
   * @param {Socket} socket - Socket instance
   * @param {string} reason - Disconnect reason
   */
  handleDisconnect(socket, reason) {
    this.logger.log(`📡 Client disconnected: ${socket.id}, reason: ${reason}`);
    this.connectedClients.delete(socket.id);
  }

  /**
   * Broadcast service status update
   * @param {Object} service - Updated service data
   * @param {string} organizationId - Organization ID (optional)
   * @param {string} tenantId - Tenant ID (optional)
   */
  broadcastServiceUpdate(service, organizationId = null, tenantId = null) {
    try {
      const updateData = {
        type: 'service-update',
        data: service,
        timestamp: new Date().toISOString()
      };

      if (organizationId) {
        this.io.to(`org:${organizationId}`).emit('service-update', updateData);
        this.logger.log(`📢 Service update broadcasted to organization: ${organizationId}`);
      } else if (tenantId) {
        this.io.to(`tenant:${tenantId}`).emit('service-update', updateData);
        this.logger.log(`📢 Service update broadcasted to tenant: ${tenantId}`);
      } else {
        // Broadcast to all connected clients
        this.io.emit('service-update', updateData);
        this.logger.log('📢 Service update broadcasted to all clients');
      }
    } catch (error) {
      this.logger.error('Broadcast service update error:', error);
    }
  }

  /**
   * Broadcast incident update
   * @param {Object} incident - Updated incident data
   * @param {string} organizationId - Organization ID (optional)
   * @param {string} tenantId - Tenant ID (optional)
   */
  broadcastIncidentUpdate(incident, organizationId = null, tenantId = null) {
    try {
      const updateData = {
        type: 'incident-update',
        data: incident,
        timestamp: new Date().toISOString()
      };

      if (organizationId) {
        this.io.to(`org:${organizationId}`).emit('incident-update', updateData);
        this.logger.log(`📢 Incident update broadcasted to organization: ${organizationId}`);
      } else if (tenantId) {
        this.io.to(`tenant:${tenantId}`).emit('incident-update', updateData);
        this.logger.log(`📢 Incident update broadcasted to tenant: ${tenantId}`);
      } else {
        // Broadcast to all connected clients
        this.io.emit('incident-update', updateData);
        this.logger.log('📢 Incident update broadcasted to all clients');
      }
    } catch (error) {
      this.logger.error('Broadcast incident update error:', error);
    }
  }

  /**
   * Broadcast system status update
   * @param {Object} status - Updated system status data
   * @param {string} organizationId - Organization ID (optional)
   * @param {string} tenantId - Tenant ID (optional)
   */
  broadcastStatusUpdate(status, organizationId = null, tenantId = null) {
    try {
      const updateData = {
        type: 'status-update',
        data: status,
        timestamp: new Date().toISOString()
      };

      if (organizationId) {
        this.io.to(`org:${organizationId}`).emit('status-update', updateData);
        this.logger.log(`📢 Status update broadcasted to organization: ${organizationId}`);
      } else if (tenantId) {
        this.io.to(`tenant:${tenantId}`).emit('status-update', updateData);
        this.logger.log(`📢 Status update broadcasted to tenant: ${tenantId}`);
      } else {
        // Broadcast to all connected clients
        this.io.emit('status-update', updateData);
        this.logger.log('📢 Status update broadcasted to all clients');
      }
    } catch (error) {
      this.logger.error('Broadcast status update error:', error);
    }
  }

  /**
   * Get connected clients count
   * @param {string} organizationId - Organization ID (optional)
   * @param {string} tenantId - Tenant ID (optional)
   * @returns {number} Number of connected clients
   */
  getConnectedClientsCount(organizationId = null, tenantId = null) {
    if (organizationId) {
      const room = this.io.sockets.adapter.rooms.get(`org:${organizationId}`);
      return room ? room.size : 0;
    } else if (tenantId) {
      const room = this.io.sockets.adapter.rooms.get(`tenant:${tenantId}`);
      return room ? room.size : 0;
    } else {
      return this.io.engine.clientsCount;
    }
  }

  /**
   * Get all connected clients info
   * @returns {Array} Array of client information
   */
  getConnectedClientsInfo() {
    return Array.from(this.connectedClients.entries()).map(([socketId, info]) => ({
      socketId,
      ...info
    }));
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

module.exports = websocketService;
