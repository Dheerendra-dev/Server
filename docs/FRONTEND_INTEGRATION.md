# Frontend Integration Guide for Render Deployment

## 🌐 Your Render Configuration

Based on your current setup:
- **Backend URL**: `https://status-backend-k1tx.onrender.com`
- **Frontend URL**: `https://status-client-omega.vercel.app`
- **CORS**: Already configured for both URLs

## 🔌 Frontend WebSocket Integration

### 1. Install Socket.IO Client

```bash
npm install socket.io-client
```

### 2. WebSocket Connection Setup

```javascript
import { io } from 'socket.io-client';

// Use your Render backend URL
const BACKEND_URL = 'https://status-backend-k1tx.onrender.com';
const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling'],
  timeout: 5000
});

// Authentication with organization/tenant
socket.emit('authenticate', {
  userId: 'user-123',
  organizationId: 'org-456',
  tenantId: 'tenant-789',
  userRole: 'admin'
});
```

### 3. React Hook Example

```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const useWebSocket = (organizationId, tenantId) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [services, setServices] = useState([]);
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const newSocket = io('https://status-backend-k1tx.onrender.com');
    
    newSocket.on('connect', () => {
      setConnected(true);
      
      // Authenticate with organization
      newSocket.emit('authenticate', {
        userId: 'current-user-id',
        organizationId,
        tenantId,
        userRole: 'admin'
      });
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    // Listen for real-time updates
    newSocket.on('service-update', (data) => {
      setServices(prev => {
        const updated = prev.map(service => 
          service.id === data.data.id ? data.data : service
        );
        
        // Add new service if not exists
        if (!prev.find(s => s.id === data.data.id)) {
          updated.push(data.data);
        }
        
        return updated;
      });
    });

    newSocket.on('incident-update', (data) => {
      setIncidents(prev => {
        const updated = prev.map(incident => 
          incident.id === data.data.id ? data.data : incident
        );
        
        // Add new incident if not exists
        if (!prev.find(i => i.id === data.data.id)) {
          updated.push(data.data);
        }
        
        return updated;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [organizationId, tenantId]);

  return { socket, connected, services, incidents };
};

export default useWebSocket;
```

### 4. API Integration

```javascript
const API_BASE_URL = 'https://status-backend-k1tx.onrender.com/api';

// API service
export const apiService = {
  // Services
  getServices: (organizationId) => 
    fetch(`${API_BASE_URL}/services?organizationId=${organizationId}`),
  
  createService: (service) =>
    fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service)
    }),

  updateService: (id, updates) =>
    fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }),

  // Incidents
  getIncidents: (organizationId) =>
    fetch(`${API_BASE_URL}/incidents?organizationId=${organizationId}`),
  
  createIncident: (incident) =>
    fetch(`${API_BASE_URL}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incident)
    }),

  // Status
  getStatus: (organizationId) =>
    fetch(`${API_BASE_URL}/status?organizationId=${organizationId}`),

  // WebSocket info
  getWebSocketInfo: () =>
    fetch(`${API_BASE_URL}/websocket/info`)
};
```

### 5. Component Example

```javascript
import React, { useEffect, useState } from 'react';
import useWebSocket from './hooks/useWebSocket';
import { apiService } from './services/api';

const StatusDashboard = ({ organizationId, tenantId }) => {
  const { socket, connected, services, incidents } = useWebSocket(organizationId, tenantId);
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    // Load initial data
    const loadData = async () => {
      try {
        const [servicesRes, incidentsRes, statusRes] = await Promise.all([
          apiService.getServices(organizationId),
          apiService.getIncidents(organizationId),
          apiService.getStatus(organizationId)
        ]);

        const servicesData = await servicesRes.json();
        const incidentsData = await incidentsRes.json();
        const statusData = await statusRes.json();

        setSystemStatus(statusData);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, [organizationId]);

  const handleServiceUpdate = async (serviceId, updates) => {
    try {
      await apiService.updateService(serviceId, {
        ...updates,
        organizationId,
        tenantId
      });
      // Real-time update will be received via WebSocket
    } catch (error) {
      console.error('Failed to update service:', error);
    }
  };

  return (
    <div className="status-dashboard">
      <div className="connection-status">
        Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
      
      <div className="system-overview">
        <h2>System Status: {systemStatus?.overallStatus}</h2>
        <p>Services: {systemStatus?.totalServices}</p>
        <p>Active Incidents: {systemStatus?.activeIncidents}</p>
      </div>

      <div className="services">
        <h3>Services</h3>
        {services.map(service => (
          <div key={service.id} className={`service ${service.status}`}>
            <h4>{service.name}</h4>
            <p>{service.description}</p>
            <span className="status">{service.status}</span>
            <button onClick={() => handleServiceUpdate(service.id, { 
              status: service.status === 'operational' ? 'degraded' : 'operational' 
            })}>
              Toggle Status
            </button>
          </div>
        ))}
      </div>

      <div className="incidents">
        <h3>Recent Incidents</h3>
        {incidents.map(incident => (
          <div key={incident.id} className={`incident ${incident.impact}`}>
            <h4>{incident.title}</h4>
            <p>{incident.description}</p>
            <span className="status">{incident.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusDashboard;
```

## 🚀 Environment Configuration

### Development vs Production

```javascript
// config.js
const config = {
  development: {
    API_URL: 'http://localhost:5001',
    WS_URL: 'http://localhost:5001'
  },
  production: {
    API_URL: 'https://status-backend-k1tx.onrender.com',
    WS_URL: 'https://status-backend-k1tx.onrender.com'
  }
};

export const API_BASE_URL = config[process.env.NODE_ENV || 'development'].API_URL;
export const WS_URL = config[process.env.NODE_ENV || 'development'].WS_URL;
```

## 🔧 Testing Your Integration

1. **Open your frontend**: `https://status-client-omega.vercel.app`
2. **Check WebSocket connection** in browser dev tools
3. **Test real-time updates** by making API calls
4. **Verify organization filtering** works correctly

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Already configured for your URLs
2. **WebSocket Connection Failed**: Check network and firewall
3. **Authentication Issues**: Verify organization/tenant IDs
4. **Missing Updates**: Ensure proper event listeners

### Debug WebSocket

```javascript
socket.on('connect', () => console.log('Connected to WebSocket'));
socket.on('disconnect', (reason) => console.log('Disconnected:', reason));
socket.on('connect_error', (error) => console.error('Connection error:', error));
```

Your backend is already configured and ready for your frontend integration! 🚀
