const winston = require('winston');

// Logger for errors
const errorLogger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

const errorHandler = (err, req, res, next) => {
  // Log the error
  errorLogger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    user: req.user ? req.user.id : 'unauthenticated',
    body: req.body,
    query: req.query,
    params: req.params
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: isDevelopment ? errors : undefined
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      error: `${field} already exists`,
      code: 'DUPLICATE_ERROR',
      field: field
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      code: 'TOKEN_EXPIRED'
    });
  }

  // PostgreSQL unique violation
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Resource already exists',
      code: 'UNIQUE_VIOLATION',
      constraint: err.constraint
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      error: 'Referenced resource does not exist',
      code: 'FOREIGN_KEY_VIOLATION',
      constraint: err.constraint
    });
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR',
    ...(isDevelopment && {
      stack: err.stack,
      details: err.details
    })
  });
};

module.exports = errorHandler;
