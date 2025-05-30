
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const ApiKey = require('../models/ApiKey');
const { authenticateAdmin } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');
const deliveryService = require('../services/deliveryService');

/**
 * @swagger
 * /api/admins/register:
 *   post:
 *     summary: Register a new admin
 *     tags: [Admins]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, super_admin]
 *     responses:
 *       201:
 *         description: Admin registered successfully
 */
router.post('/register', validateRequest(schemas.adminRegister), async (req, res) => {
  try {
    const { password, ...adminData } = req.body;
    
    const admin = new Admin({
      ...adminData,
      passwordHash: password,
      permissions: ['view_deliveries', 'manage_riders', 'generate_api_keys', 'view_analytics']
    });
    
    await admin.save();
    
    const token = jwt.sign(
      { id: admin._id, type: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(201).json({
      success: true,
      data: {
        admin,
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/admins/login:
 *   post:
 *     summary: Login admin
 *     tags: [Admins]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', validateRequest(schemas.adminLogin), async (req, res) => {
  try {
    console.log('Login request received', req.body);
    const { email, password } = req.body;
    
    const admin = await Admin.findOne({ email, isActive: true }).select('+passwordHash');
    
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const token = jwt.sign(
      { id: admin._id, type: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    // Remove password hash from response
    admin.passwordHash = undefined;
    
    res.json({
      success: true,
      data: {
        admin,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/admins/deliveries:
 *   get:
 *     summary: Get all deliveries (admin view)
 *     tags: [Admins]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by delivery status
 *       - in: query
 *         name: riderId
 *         schema:
 *           type: string
 *         description: Filter by rider ID
 *     responses:
 *       200:
 *         description: Deliveries retrieved successfully
 */
router.get('/deliveries', authenticateAdmin, async (req, res) => {
  try {
    const filters = {};
    
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    if (req.query.riderId) {
      filters.riderId = req.query.riderId;
    }
    
    const deliveries = await deliveryService.getAllDeliveries(filters);
    
    res.json({
      success: true,
      data: deliveries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/admins/api-keys:
 *   post:
 *     summary: Generate a new API key
 *     tags: [Admins]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - issuedTo
 *             properties:
 *               name:
 *                 type: string
 *               issuedTo:
 *                 type: string
 *               usageLimit:
 *                 type: number
 *               expiresAt:
 *                 type: string
 *                 format: date
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: API key generated successfully
 */
router.post('/api-keys', 
  authenticateAdmin, 
  validateRequest(schemas.createApiKey),
  async (req, res) => {
    try {
      const apiKey = new ApiKey(req.body);
      console.log("apiKey", apiKey);
      await apiKey.save();
      
      res.status(201).json({
        success: true,
        message: 'API key generated successfully',
        data: apiKey
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/admins/api-keys:
 *   get:
 *     summary: Get all API keys
 *     tags: [Admins]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: API keys retrieved successfully
 */
router.get('/api-keys', authenticateAdmin, async (req, res) => {
  try {
    const apiKeys = await ApiKey.find()
      .select('-key') // Don't return actual keys for security
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: apiKeys
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/admins/api-keys/{id}/deactivate:
 *   put:
 *     summary: Deactivate an API key
 *     tags: [Admins]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: API key deactivated successfully
 */
router.put('/api-keys/:id/deactivate', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const apiKey = await ApiKey.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-key');
    
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }
    
    res.json({
      success: true,
      message: 'API key deactivated successfully',
      data: apiKey
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
