require('dotenv').config();

const config = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // CORS configuration
  corsOrigin: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Security configuration
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  
  // Database configuration (for future use)
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/plive_db',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'plive_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  },
  
  // External services configuration
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASS
  },
  
  // Monitoring configuration
  sentry: {
    dsn: process.env.SENTRY_DSN
  },
  
  slack: {
    webhookUrl: process.env.WEBHOOK_URL
  },
  
  // Rate limiting configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  
  // File upload configuration
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
  }
};

module.exports = config;
