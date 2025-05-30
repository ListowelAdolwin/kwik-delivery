
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Rider = require('../models/Rider');
const { authenticateRider } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');
const deliveryService = require('../services/deliveryService');

/**
 * @swagger
 * /api/riders/register:
 *   post:
 *     summary: Register a new rider
 *     tags: [Riders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               vehicleType:
 *                 type: string
 *                 enum: [bicycle, motorcycle, car, van]
 *     responses:
 *       201:
 *         description: Rider registered successfully
 */
router.post('/register', validateRequest(schemas.riderRegister), async (req, res) => {
  try {
    const { password, ...riderData } = req.body;
    
    const rider = new Rider({
      ...riderData,
      passwordHash: password
    });
    
    await rider.save();
    
    const token = jwt.sign(
      { id: rider._id, type: 'rider' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(201).json({
      success: true,
      data: {
        rider,
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
 * /api/riders/login:
 *   post:
 *     summary: Login rider
 *     tags: [Riders]
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
router.post('/login', validateRequest(schemas.riderLogin), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const rider = await Rider.findOne({ email, isActive: true }).select('+passwordHash');
    
    if (!rider || !(await rider.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const token = jwt.sign(
      { id: rider._id, type: 'rider' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    // Remove password hash from response
    rider.passwordHash = undefined;
    
    res.json({
      success: true,
      data: {
        rider,
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
 * /api/riders/deliveries:
 *   get:
 *     summary: Get available deliveries for riders
 *     tags: [Riders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Available deliveries retrieved successfully
 */
router.get('/deliveries', authenticateRider, async (req, res) => {
  try {
    const deliveries = await deliveryService.getAvailableDeliveries();
    
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
 * /api/riders/deliveries/{id}/accept:
 *   post:
 *     summary: Accept a delivery
 *     tags: [Riders]
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
 *         description: Delivery accepted successfully
 */
router.post('/deliveries/:id/accept', authenticateRider, async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await deliveryService.acceptDelivery(id, req.user._id);
    
    res.json({
      success: true,
      message: 'Delivery accepted successfully',
      data: delivery
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
 * /api/riders/deliveries/{id}/status:
 *   put:
 *     summary: Update delivery status
 *     tags: [Riders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PICKED_UP, IN_TRANSIT, DELIVERED]
 *               notes:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *     responses:
 *       200:
 *         description: Delivery status updated successfully
 */
router.put('/deliveries/:id/status', 
  authenticateRider, 
  validateRequest(schemas.updateDeliveryStatus),
  async (req, res) => {
    try {
      const { id } = req.params;
      const delivery = await deliveryService.updateDeliveryStatus(
        id, 
        req.body.status, 
        req.user._id,
        req.body
      );
      
      res.json({
        success: true,
        message: 'Delivery status updated successfully',
        data: delivery
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
 * /api/riders/my-deliveries:
 *   get:
 *     summary: Get rider's assigned deliveries
 *     tags: [Riders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Rider deliveries retrieved successfully
 */
router.get('/my-deliveries', authenticateRider, async (req, res) => {
  try {
    const deliveries = await deliveryService.getDeliveriesByRider(req.user._id);
    
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

module.exports = router;
