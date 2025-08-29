# Plive Server

Backend API server for the Plive status page application.

## Features

- **RESTful API** for services and incidents management
- **Real-time WebSocket Updates** for live status notifications
- **Multi-tenant Organization Support** with room-based broadcasting
- **Team Management** with user authentication and role-based access
- **CORS enabled** for frontend integration
- **Security headers** with Helmet.js
- **Request logging** with Morgan
- **Environment configuration** with dotenv
- **UUID generation** for unique identifiers

## API Endpoints

### Health Check

- `GET /health` - Server health status

### Services

- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Incidents

- `GET /api/incidents` - Get all incidents
- `GET /api/incidents/:id` - Get incident by ID
- `POST /api/incidents` - Create new incident
- `PUT /api/incidents/:id` - Update incident
- `POST /api/incidents/:id/updates` - Add update to incident
- `DELETE /api/incidents/:id` - Delete incident

### System Status

- `GET /api/status` - Get overall system status overview

### WebSocket Real-time Updates

- `GET /api/websocket/info` - Get WebSocket connection information
- `POST /api/websocket/broadcast` - Manual broadcast for testing
- **WebSocket Endpoint**: `/socket.io` - Real-time connection endpoint

#### WebSocket Events

- **Client to Server**: `authenticate`, `join-organization`, `leave-organization`, `ping`
- **Server to Client**: `service-update`, `incident-update`, `status-update`, `pong`

## Installation

1. Navigate to the server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Start the development server:

```bash
npm run dev
```

Or start in production mode:

```bash
npm start
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

## Sample Data

The server includes sample services and incidents for testing:

### Services

- API Gateway
- Database Cluster
- Authentication Service
- File Storage
- Email Service
- CDN

### Incidents

- File Storage Performance Issues (with updates)

## Development

- `npm run dev` - Start with nodemon for auto-restart
- `npm start` - Start in production mode

## API Usage Examples

### Create a new service

```bash
curl -X POST http://localhost:5000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Payment Service",
    "description": "Payment processing and billing",
    "status": "operational"
  }'
```

### Update service status

```bash
curl -X PUT http://localhost:5000/api/services/SERVICE_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "degraded",
    "uptime": 98.5
  }'
```

### Create an incident

```bash
curl -X POST http://localhost:5000/api/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Database Connection Issues",
    "description": "Users experiencing login problems",
    "impact": "major",
    "affectedServices": ["Authentication Service", "Database Cluster"]
  }'
```

### Add incident update

```bash
curl -X POST http://localhost:5000/api/incidents/INCIDENT_ID/updates \
  -H "Content-Type: application/json" \
  -d '{
    "status": "identified",
    "message": "We have identified the root cause and are implementing a fix."
  }'
```

## Security

- CORS enabled for cross-origin requests
- Helmet.js for security headers
- Input validation on all endpoints
- Error handling middleware

## WebSocket Real-time Updates

### Connection Example

```javascript
const socket = io("http://localhost:5000");

// Authenticate with organization
socket.emit("authenticate", {
  userId: "user-123",
  organizationId: "org-456",
  tenantId: "tenant-789",
  userRole: "admin",
});

// Listen for real-time updates
socket.on("service-update", (data) => {
  console.log("Service updated:", data.data);
});

socket.on("incident-update", (data) => {
  console.log("Incident updated:", data.data);
});
```

### Multi-tenant Support

Services and incidents can be filtered by organization or tenant:

```bash
# Get status for specific organization
curl "http://localhost:5000/api/status?organizationId=org-456"

# Create service with organization
curl -X POST http://localhost:5000/api/services \
  -H "Content-Type: application/json" \
  -d '{"name": "Service", "description": "Test", "organizationId": "org-456"}'
```

### Testing WebSocket

Open `examples/websocket-client.html` in your browser to test the WebSocket functionality with a complete client interface.

## Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- Authentication and authorization
- ✅ **Real-time updates with WebSockets** - IMPLEMENTED
- Email notifications
- Metrics and monitoring integration
- Rate limiting
- API documentation with Swagger
