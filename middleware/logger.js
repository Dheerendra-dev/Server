const morgan = require('morgan');

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req, res) => {
  if (!req._startAt || !res._startAt) {
    return '-';
  }

  const ms = (res._startAt[0] - req._startAt[0]) * 1000 +
    (res._startAt[1] - req._startAt[1]) * 1e-6;

  return ms.toFixed(3) + 'ms';
});

// Custom token for request ID (if you add request ID middleware later)
morgan.token('request-id', (req) => {
  return req.id || '-';
});

// Development format
const developmentFormat = ':method :url :status :response-time-ms - :res[content-length]';

// Production format with more details
const productionFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time-ms';

// Custom format for API logging
const apiFormat = '[:date[iso]] :method :url :status :response-time-ms :remote-addr';

// Logger configuration based on environment
const getLogger = () => {
  const env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return morgan(productionFormat);
    case 'test':
      return morgan('tiny');
    case 'api':
      return morgan(apiFormat);
    default:
      return morgan(developmentFormat);
  }
};

// Custom logger for specific routes
const apiLogger = morgan(apiFormat, {
  skip: (req) => {
    // Skip logging for health checks in production
    return process.env.NODE_ENV === 'production' && req.url === '/health';
  }
});

// Error logger
const errorLogger = morgan('combined', {
  skip: (req, res) => res.statusCode < 400
});

module.exports = {
  getLogger,
  apiLogger,
  errorLogger
};
