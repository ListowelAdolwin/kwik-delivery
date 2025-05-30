
const jwt = require('jsonwebtoken');
const Rider = require('../models/Rider');
const Admin = require('../models/Admin');
const ApiKey = require('../models/ApiKey');

// JWT Authentication middleware
const authenticateJWT = (userType) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Access token required'
        });
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user;
      if (userType === 'rider') {
        user = await Rider.findById(decoded.id);
      } else if (userType === 'admin') {
        user = await Admin.findById(decoded.id);
      }

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      req.user = user;
      req.userType = userType;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  };
};

// API Key authentication middleware
const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required'
      });
    }

    const keyRecord = await ApiKey.findOne({ 
      key: apiKey, 
      isActive: true 
    });

    if (!keyRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }

    // Check if key is expired
    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'API key expired'
      });
    }

    // Check usage limit
    if (keyRecord.usageCount >= keyRecord.usageLimit) {
      return res.status(429).json({
        success: false,
        message: 'API key usage limit exceeded'
      });
    }

    // Update usage
    keyRecord.usageCount += 1;
    keyRecord.lastUsed = new Date();
    await keyRecord.save();

    req.apiKey = keyRecord;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

module.exports = {
  authenticateRider: authenticateJWT('rider'),
  authenticateAdmin: authenticateJWT('admin'),
  authenticateApiKey
};
