
const express = require('express');
const router = express.Router();
const { authenticateApiKey } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');
const deliveryService = require('../services/deliveryService');
const { calculateDeliveryFee } = require('../utils/feeCalculator');

/**
 * @swagger
 * /api/delivery-fee:
 *   post:
 *     summary: Calculate delivery fee
 *     tags: [Delivery]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - storeLocation
 *               - customerLocation
 *             properties:
 *               storeLocation:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *               customerLocation:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *               deliveryType:
 *                 type: string
 *                 enum: [standard, express]
 *     responses:
 *       200:
 *         description: Fee calculated successfully
 */
router.post('/delivery-fee', 
  authenticateApiKey, 
  validateRequest(schemas.calculateFee),
  async (req, res) => {
    try {
      const { storeLocation, customerLocation, deliveryType } = req.body;
      
      const feeCalculation = calculateDeliveryFee(
        storeLocation,
        customerLocation,
        deliveryType
      );

      res.json({
        success: true,
        data: feeCalculation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/deliveries:
 *   post:
 *     summary: Create a new delivery
 *     tags: [Delivery]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - storeLocation
 *               - customerLocation
 *             properties:
 *               orderId:
 *                 type: string
 *               storeLocation:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *               customerLocation:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *               deliveryType:
 *                 type: string
 *                 enum: [standard, express]
 *               customerInfo:
 *                 type: object
 *               storeInfo:
 *                 type: object
 *     responses:
 *       201:
 *         description: Delivery created successfully
 */
router.post('/', 
  authenticateApiKey, 
  validateRequest(schemas.createDelivery),
  async (req, res) => {
    try {
      const delivery = await deliveryService.createDelivery(req.body);
      
      res.status(201).json({
        success: true,
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
 * /api/deliveries/track/{trackingNumber}:
 *   get:
 *     summary: Track delivery by tracking number
 *     tags: [Delivery]
 *     parameters:
 *       - in: path
 *         name: trackingNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delivery tracking information
 */
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const trackingInfo = await deliveryService.trackDelivery(trackingNumber);
    
    res.json({
      success: true,
      data: trackingInfo
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/deliveries/{id}:
 *   delete:
 *     summary: Cancel a delivery
 *     tags: [Delivery]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delivery cancelled successfully
 */
router.delete('/:id', authenticateApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await deliveryService.cancelDelivery(id, {
      userId: req.apiKey._id,
      userType: 'system'
    });
    
    res.json({
      success: true,
      message: 'Delivery cancelled successfully',
      data: delivery
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
