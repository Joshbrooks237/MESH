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
