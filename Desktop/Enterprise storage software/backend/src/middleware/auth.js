const jwt = require('jsonwebtoken');
// const { redisClient } = require('../config/database'); // Disabled for demo

const JWT_SECRET = process.env.JWT_SECRET || 'enterprise-storage-secret-key-2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'enterprise-storage-refresh-secret-key-2024';

// User roles hierarchy
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  SUPERVISOR: 'supervisor',
  OPERATOR: 'operator',
  AUDITOR: 'auditor',
  VIEWER: 'viewer'
};

// Role permissions mapping
const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ['*'], // All permissions
  [ROLES.ADMIN]: [
    'user.manage',
    'inventory.manage',
    'warehouse.manage',
    'tracking.view',
    'reporting.view',
    'reporting.generate'
  ],
  [ROLES.MANAGER]: [
    'inventory.view',
    'inventory.manage',
    'warehouse.view',
    'tracking.view',
    'reporting.view',
    'reporting.generate'
  ],
  [ROLES.SUPERVISOR]: [
    'inventory.view',
    'inventory.update',
    'warehouse.view',
    'tracking.view',
    'tracking.update'
  ],
  [ROLES.OPERATOR]: [
    'inventory.view',
    'inventory.update',
    'warehouse.view',
    'tracking.view',
    'tracking.update'
  ],
  [ROLES.AUDITOR]: [
    'inventory.view',
    'warehouse.view',
    'tracking.view',
    'reporting.view',
    'audit.view'
  ],
  [ROLES.VIEWER]: [
    'inventory.view',
    'warehouse.view',
    'tracking.view'
  ]
};

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    // Skip Redis blacklist check for now
    console.log('Skipping Redis token validation for demo purposes');

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            error: 'Token has expired',
            code: 'TOKEN_EXPIRED'
          });
        }
        return res.status(403).json({
          error: 'Invalid token',
          code: 'TOKEN_INVALID'
        });
      }

      // Store user info in request
      req.user = {
        id: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
        warehouseId: decoded.warehouseId,
        permissions: ROLE_PERMISSIONS[decoded.role] || []
      };

      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

// Middleware to authorize based on roles
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next(); // Super admin has access to everything
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// Middleware to check specific permissions
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next(); // Super admin has all permissions
    }

    const userPermissions = req.user.permissions || [];

    if (!userPermissions.includes('*') && !userPermissions.includes(requiredPermission)) {
      return res.status(403).json({
        error: 'Permission denied',
        code: 'PERMISSION_DENIED',
        required: requiredPermission,
        permissions: userPermissions
      });
    }

    next();
  };
};

// Generate access token
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      warehouseId: user.warehouse_id
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '1h' }
  );
};

// Generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username
    },
    JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

// Revoke token (add to blacklist)
const revokeToken = async (token) => {
  try {
    console.log('Token revocation skipped for demo purposes');
    // For demo purposes, we're not using Redis for token blacklisting
  } catch (error) {
    console.error('Error revoking token:', error);
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  checkPermission,
  generateAccessToken,
  generateRefreshToken,
  revokeToken,
  ROLES,
  ROLE_PERMISSIONS
};
