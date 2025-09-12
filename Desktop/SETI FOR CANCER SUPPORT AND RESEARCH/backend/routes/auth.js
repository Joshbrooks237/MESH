const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Mock user database - in production, this would be a real database
const users = [
  {
    id: 1,
    email: 'researcher@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Dr. Sarah Johnson',
    role: 'researcher',
    institution: 'Memorial Sloan Kettering',
    specialization: 'Cancer Genomics',
    joinedProjects: ['cancer-genome-2024'],
    contributions: 1247,
    reputation: 95
  }
];

// POST /api/auth/register - Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('role').isIn(['researcher', 'volunteer', 'student', 'clinician', 'institution'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password, name, role, institution, specialization } = req.body;

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      name,
      role,
      institution: institution || '',
      specialization: specialization || '',
      joinedProjects: [],
      contributions: 0,
      reputation: 0,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// POST /api/auth/login - Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// POST /api/auth/logout - Logout user
router.post('/logout', (req, res) => {
  // In a real implementation, you might want to blacklist the token
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// GET /api/auth/profile - Get user profile
router.get('/profile', (req, res) => {
  try {
    // In a real implementation, you'd get the user ID from the JWT token
    // For now, return the first user as an example
    const user = users[0];
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('institution').optional().trim().isLength({ min: 0, max: 200 }),
  body('specialization').optional().trim().isLength({ min: 0, max: 200 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // In a real implementation, you'd get the user ID from the JWT token
    const userIndex = 0; // Use first user as example
    const updatedUser = { ...users[userIndex], ...req.body };

    users[userIndex] = updatedUser;

    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// GET /api/auth/stats - Get authentication statistics
router.get('/stats', (req, res) => {
  try {
    const stats = {
      totalUsers: users.length,
      researchers: users.filter(u => u.role === 'researcher').length,
      volunteers: users.filter(u => u.role === 'volunteer').length,
      students: users.filter(u => u.role === 'student').length,
      clinicians: users.filter(u => u.role === 'clinician').length,
      institutions: users.filter(u => u.role === 'institution').length,
      averageReputation: Math.round(
        users.reduce((sum, u) => sum + u.reputation, 0) / users.length
      ),
      totalContributions: users.reduce((sum, u) => sum + u.contributions, 0)
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch authentication statistics'
    });
  }
});

module.exports = router;
