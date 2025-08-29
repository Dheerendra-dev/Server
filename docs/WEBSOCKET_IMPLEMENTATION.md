# WebSocket Real-time Status Updates Implementation

## Overview

This implementation provides real-time status updates for a team management system with multi-tenant organization support using WebSocket connections. The system broadcasts service updates, incident updates, and system status changes to connected clients in real-time.

## Features

- **Real-time Updates**: Instant notifications for service status changes, incident updates, and system status
- **Multi-tenant Support**: Organization and tenant-based room management
- **Authentication**: Client authentication with user roles and organization/tenant assignment
- **Scalable Architecture**: Room-based broadcasting for efficient message delivery
- **Connection Management**: Automatic connection handling, reconnection, and cleanup

## Architecture

### Components

1. **WebSocket Service** (`services/websocketService.js`)
   - Singleton service managing all WebSocket connections
   - Handles client authentication and room management
   - Provides broadcasting methods for different update types

2. **Updated Controllers**
   - `serviceController.js`: Broadcasts service updates
   - `incidentController.js`: Broadcasts incident updates
   - `statusController.js`: Enhanced with organization/tenant filtering

3. **WebSocket Routes** (`routes/websocketRoutes.js`)
   - Connection information endpoint
   - Manual broadcast endpoint for testing

4. **Client Example** (`examples/websocket-client.html`)
   - Complete HTML client demonstrating all features

## WebSocket Events

### Client to Server Events

| Event | Description | Data |
|-------|-------------|------|
| `authenticate` | Authenticate client with user info | `{ userId, organizationId, tenantId, userRole }` |
| `join-organization` | Join organization room | `{ organizationId }` |
| `leave-organization` | Leave organization room | `{ organizationId }` |
| `ping` | Health check ping | `{}` |

### Server to Client Events

| Event | Description | Data |
|-------|-------------|------|
| `authenticated` | Authentication success | `{ success, clientId, timestamp }` |
| `authentication-error` | Authentication failure | `{ error, timestamp }` |
| `joined-organization` | Successfully joined org | `{ organizationId, timestamp }` |
| `left-organization` | Successfully left org | `{ organizationId, timestamp }` |
| `service-update` | Service status change | `{ type, data, timestamp }` |
| `incident-update` | Incident status change | `{ type, data, timestamp }` |
| `status-update` | System status change | `{ type, data, timestamp }` |
| `pong` | Response to ping | `{ timestamp }` |
| `error` | Error message | `{ message }` |

## Multi-tenant Architecture

### Room Structure

- **Global**: All connected clients (no room prefix)
- **Organization**: `org:{organizationId}` - All clients in an organization
- **Tenant**: `tenant:{tenantId}` - All clients in a specific tenant

### Broadcasting Logic

1. **Organization-specific**: Broadcasts to `org:{organizationId}` room
2. **Tenant-specific**: Broadcasts to `tenant:{tenantId}` room
3. **Global**: Broadcasts to all connected clients

## API Endpoints

### WebSocket Information
```
GET /api/websocket/info?organizationId={id}&tenantId={id}
```
Returns connection statistics and client information.

### Manual Broadcast (Testing)
```
POST /api/websocket/broadcast
{
  "type": "service-update|incident-update|status-update",
  "data": { ... },
  "organizationId": "optional",
  "tenantId": "optional"
}
```

## Usage Examples

### Basic Connection (JavaScript)
```javascript
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  // Authenticate with organization
  socket.emit('authenticate', {
    userId: 'user-123',
    organizationId: 'org-456',
    tenantId: 'tenant-789',
    userRole: 'admin'
  });
});

// Listen for real-time updates
socket.on('service-update', (data) => {
  console.log('Service updated:', data.data);
});

socket.on('incident-update', (data) => {
  console.log('Incident updated:', data.data);
});
```

### Organization Management
```javascript
// Join organization room
socket.emit('join-organization', { organizationId: 'org-456' });

// Leave organization room
socket.emit('leave-organization', { organizationId: 'org-456' });
```

## Data Flow

1. **Client Connection**
   - Client connects to WebSocket server
   - Client authenticates with user/organization info
   - Server assigns client to appropriate rooms

2. **Status Updates**
   - API endpoint receives update request
   - Controller processes the update
   - Controller calls WebSocket service to broadcast
   - WebSocket service sends to relevant rooms
   - Connected clients receive real-time updates

3. **Room Management**
   - Clients can join/leave organization rooms
   - Broadcasts are targeted to specific rooms
   - Global broadcasts reach all clients

## Configuration

### CORS Settings
```javascript
cors: {
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://status-backend-k1tx.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST']
}
```

### Transport Options
- WebSocket (preferred)
- Polling (fallback)

## Error Handling

- Connection errors are logged and reported to clients
- Authentication failures trigger `authentication-error` events
- Invalid room operations send `error` events
- Automatic cleanup on client disconnect

## Security Considerations

1. **Authentication**: Implement proper user authentication before production
2. **Authorization**: Add role-based access control for sensitive operations
3. **Rate Limiting**: Consider implementing rate limiting for WebSocket events
4. **Input Validation**: Validate all incoming WebSocket data
5. **CORS**: Configure CORS origins for production environment

## Performance Optimization

1. **Room-based Broadcasting**: Reduces unnecessary message delivery
2. **Connection Pooling**: Efficient connection management
3. **Event Throttling**: Consider throttling high-frequency updates
4. **Memory Management**: Automatic cleanup of disconnected clients

## Testing

### Manual Testing
1. Open `examples/websocket-client.html` in a browser
2. Connect to the WebSocket server
3. Authenticate with organization/tenant info
4. Test real-time updates by making API calls

### API Testing
```bash
# Create a service (triggers broadcast)
curl -X POST http://localhost:5000/api/services \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Service", "description": "Test", "organizationId": "org-456"}'

# Update service status (triggers broadcast)
curl -X PUT http://localhost:5000/api/services/{id} \
  -H "Content-Type: application/json" \
  -d '{"status": "degraded"}'
```

## Future Enhancements

1. **Database Integration**: Store connection metadata in database
2. **Clustering Support**: Redis adapter for multi-server deployments
3. **Message Persistence**: Store and replay missed messages
4. **Advanced Analytics**: Connection and usage analytics
5. **Push Notifications**: Integration with mobile push notifications
6. **Message Queuing**: Queue messages for offline clients

## Troubleshooting

### Common Issues

1. **Connection Failures**
   - Check CORS configuration
   - Verify server is running on correct port
   - Check firewall settings

2. **Authentication Issues**
   - Verify authentication data format
   - Check server logs for errors
   - Ensure proper event handling

3. **Missing Updates**
   - Verify client is in correct room
   - Check organization/tenant IDs
   - Confirm event listeners are set up

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG=socket.io* npm run dev
```
