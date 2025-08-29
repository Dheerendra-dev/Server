const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
require('dotenv').config();

// Import middleware
const { getLogger } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const apiRoutes = require('./routes');

// Import WebSocket service
const websocketService = require('./services/websocketService');

const app = express();
const server = http.createServer(app);
const PORT = (typeof process !== 'undefined' && process.env && process.env.PORT) ? process.env.PORT : 5000;

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://status-backend-k1tx.onrender.com',
    'https://status-client-omega.vercel.app'
  ],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// Logging middleware
app.use(getLogger());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', apiRoutes);

// Health check route (direct access)
app.get('/health', require('./controllers/statusController').getHealth);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize WebSocket service
websocketService.initialize(server);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API endpoints: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket server initialized`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, websocketService };
