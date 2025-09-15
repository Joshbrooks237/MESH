const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { pgConnection } = require('../config/database');
const {
  generateAccessToken,
  generateRefreshToken,
  revokeToken,
  ROLES
} = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(100).required(),
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required(),
  role: Joi.string().valid(...Object.values(ROLES)).default(ROLES.OPERATOR),
  warehouseId: Joi.number().integer().optional(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  department: Joi.string().max(100).optional()
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.details.map(d => d.message)
      });
    }

    const { username, email, password, firstName, lastName, role, warehouseId, phone, department } = value;

    // Check if user already exists
    const existingUser = await pgConnection('users')
      .where('username', username)
      .orWhere('email', email)
      .first();

    if (existingUser) {
      return res.status(409).json({
        error: existingUser.username === username ? 'Username already exists' : 'Email already exists',
        code: 'USER_EXISTS'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const [userId] = await pgConnection('users').insert({
      username,
      email,
      password_hash: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      role,
      warehouse_id: warehouseId,
      phone,
      department,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }).returning('id');

    // Generate tokens
    const user = {
      id: userId,
      username,
      email,
      role,
      warehouse_id: warehouseId
    };

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token securely
    await pgConnection('refresh_tokens').insert({
      user_id: userId,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      created_at: new Date()
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userId,
        username,
        email,
        firstName,
        lastName,
        role,
        warehouseId
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '1h'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      code: 'REGISTRATION_ERROR'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.details.map(d => d.message)
      });
    }

    const { username, password } = value;

    // Find user
    const user = await pgConnection('users')
      .select('id', 'username', 'email', 'password_hash', 'first_name', 'last_name', 'role', 'warehouse_id', 'is_active')
      .where('username', username)
      .orWhere('email', username)
      .first();

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        error: 'Account is disabled',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate tokens
    const userPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      warehouse_id: user.warehouse_id
    };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    // Store refresh token
    await pgConnection('refresh_tokens').insert({
      user_id: user.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      created_at: new Date()
    });

    // Update last login
    await pgConnection('users')
      .where('id', user.id)
      .update({
        last_login: new Date(),
        updated_at: new Date()
      });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        warehouseId: user.warehouse_id
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '1h'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      code: 'LOGIN_ERROR'
    });
  }
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { error, value } = refreshTokenSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.details.map(d => d.message)
      });
    }

    const { refreshToken } = value;

    // Verify refresh token exists and is valid
    const tokenRecord = await pgConnection('refresh_tokens')
      .where('token', refreshToken)
      .where('expires_at', '>', new Date())
      .first();

    if (!tokenRecord) {
      return res.status(401).json({
        error: 'Invalid or expired refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Get user details
    const user = await pgConnection('users')
      .select('id', 'username', 'email', 'role', 'warehouse_id')
      .where('id', tokenRecord.user_id)
      .where('is_active', true)
      .first();

    if (!user) {
      return res.status(401).json({
        error: 'User not found or inactive',
        code: 'USER_NOT_FOUND'
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    res.json({
      accessToken,
      expiresIn: '1h'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Token refresh failed',
      code: 'REFRESH_ERROR'
    });
  }
});

// Logout (revoke tokens)
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      await revokeToken(token);
    }

    // Remove refresh token from database
    if (req.body.refreshToken) {
      await pgConnection('refresh_tokens')
        .where('token', req.body.refreshToken)
        .del();
    }

    res.json({
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      code: 'LOGOUT_ERROR'
    });
  }
});

// Demo users (in-memory for development)
const demoUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@enterprise-storage.com',
    password: '$2a$12$fMFMTZPuScRriI9GQX4CO.cLbCgZPnJ5UKQBts3uCHvow.1SvIDI.', // password123
    firstName: 'System',
    lastName: 'Administrator',
    role: 'super_admin',
    department: 'IT Administration',
    is_active: true
  },
  {
    id: 2,
    username: 'manager',
    email: 'manager@enterprise-storage.com',
    password: '$2a$12$fMFMTZPuScRriI9GQX4CO.cLbCgZPnJ5UKQBts3uCHvow.1SvIDI.', // password123
    firstName: 'Warehouse',
    lastName: 'Manager',
    role: 'manager',
    department: 'Operations',
    is_active: true
  },
  {
    id: 3,
    username: 'supervisor',
    email: 'supervisor@enterprise-storage.com',
    password: '$2a$12$fMFMTZPuScRriI9GQX4CO.cLbCgZPnJ5UKQBts3uCHvow.1SvIDI.', // password123
    firstName: 'Operations',
    lastName: 'Supervisor',
    role: 'supervisor',
    department: 'Operations',
    is_active: true
  },
  {
    id: 4,
    username: 'operator',
    email: 'operator@enterprise-storage.com',
    password: '$2a$12$fMFMTZPuScRriI9GQX4CO.cLbCgZPnJ5UKQBts3uCHvow.1SvIDI.', // password123
    firstName: 'Warehouse',
    lastName: 'Operator',
    role: 'operator',
    department: 'Operations',
    is_active: true
  }
];

// Login user (with demo users fallback)
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.details.map(d => d.message)
      });
    }

    const { username, password } = value;

    // Use demo users directly (simplified)
    const user = demoUsers.find(u => u.username === username || u.email === username);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        error: 'Account is disabled',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate tokens (simplified)
    const userPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      warehouseId: user.warehouseId
    };

    const jwt = require('jsonwebtoken');
    const accessToken = jwt.sign(userPayload, 'enterprise-storage-secret-key-2024', { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user.id, username: user.username }, 'enterprise-storage-refresh-secret-key-2024', { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '1h'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      code: 'LOGIN_ERROR',
      details: error.message
    });
  }
});

// Debug authentication
router.post('/debug-login', async (req, res) => {
  const { username, password } = req.body;

  const user = demoUsers.find(u => u.username === username || u.email === username);
  if (!user) {
    return res.json({ error: 'User not found', username });
  }

  const bcrypt = require('bcryptjs');
  const isValidPassword = await bcrypt.compare(password, user.password);

  res.json({
    username,
    password,
    userFound: !!user,
    passwordValid: isValidPassword,
    user: user ? { id: user.id, username: user.username, role: user.role } : null
  });
});

// Simple test login (bypasses complex logic)
router.post('/test-login', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('Test login attempt:', { username, password });

    const user = demoUsers.find(u => u.username === username);
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'User not found' });
    }

    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('Invalid password');
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Simple response without JWT for testing
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Test login error:', error);
    res.status(500).json({ error: 'Test login failed', details: error.message });
  }
});

// Get demo credentials
router.get('/demo-credentials', (req, res) => {
  res.json({
    message: 'Demo credentials for testing',
    credentials: {
      admin: { username: 'admin', password: 'password123', role: 'super_admin' },
      manager: { username: 'manager', password: 'password123', role: 'manager' },
      supervisor: { username: 'supervisor', password: 'password123', role: 'supervisor' },
      operator: { username: 'operator', password: 'password123', role: 'operator' }
    },
    note: 'These are demo credentials for testing the application'
  });
});

// Get current user profile
router.get('/profile', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    const user = await pgConnection('users')
      .select('id', 'username', 'email', 'first_name', 'last_name', 'role', 'warehouse_id', 'phone', 'department', 'last_login', 'created_at')
      .where('id', req.user.id)
      .first();

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        warehouseId: user.warehouse_id,
        phone: user.phone,
        department: user.department,
        lastLogin: user.last_login,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      code: 'PROFILE_ERROR'
    });
  }
});

module.exports = router;
