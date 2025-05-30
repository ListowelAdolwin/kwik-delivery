
const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

// Validation schemas
const schemas = {
  createDelivery: Joi.object({
    orderId: Joi.string().required(),
    storeLocation: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required()
    }).required(),
    customerLocation: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required()
    }).required(),
    deliveryType: Joi.string().valid('standard', 'express').default('standard'),
    customerInfo: Joi.object({
      name: Joi.string().required(),
      phone: Joi.string().required(),
      address: Joi.string().required()
    }),
    storeInfo: Joi.object({
      name: Joi.string().required(),
      phone: Joi.string().required(),
      address: Joi.string().required()
    }),
    notes: Joi.string().optional()
  }),

  calculateFee: Joi.object({
    storeLocation: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required()
    }).required(),
    customerLocation: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required()
    }).required(),
    deliveryType: Joi.string().valid('standard', 'express').default('standard')
  }),

  riderRegister: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    password: Joi.string().min(6).required(),
    vehicleType: Joi.string().valid('bicycle', 'motorcycle', 'car', 'van').default('bicycle'),
    licenseNumber: Joi.string().optional()
  }),

  riderLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  adminRegister: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'super_admin').default('admin')
  }),

  adminLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateDeliveryStatus: Joi.object({
    status: Joi.string().valid('PICKED_UP', 'IN_TRANSIT', 'DELIVERED').required(),
    notes: Joi.string().optional(),
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180)
    }).optional()
  }),

  createApiKey: Joi.object({
    name: Joi.string().required(),
    issuedTo: Joi.string().required(),
    usageLimit: Joi.number().default(10000),
    expiresAt: Joi.date().optional(),
    permissions: Joi.array().items(
      Joi.string().valid('create_delivery', 'track_delivery', 'cancel_delivery', 'calculate_fee')
    ).default(['create_delivery', 'track_delivery', 'cancel_delivery', 'calculate_fee'])
  })
};

module.exports = {
  validateRequest,
  schemas
};
