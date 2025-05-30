
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Delivery Service API',
      version: '1.0.0',
      description: 'A comprehensive RESTful API for managing delivery services with rider management, order tracking, and eCommerce integration.',
      contact: {
        name: 'API Support',
        email: 'support@deliveryservice.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key'
        }
      },
      schemas: {
        Delivery: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Delivery ID'
            },
            orderId: {
              type: 'string',
              description: 'Order ID from eCommerce platform'
            },
            trackingNumber: {
              type: 'string',
              description: 'Unique tracking number'
            },
            storeLocation: {
              type: 'object',
              properties: {
                latitude: { type: 'number' },
                longitude: { type: 'number' }
              }
            },
            customerLocation: {
              type: 'object',
              properties: {
                latitude: { type: 'number' },
                longitude: { type: 'number' }
              }
            },
            deliveryType: {
              type: 'string',
              enum: ['standard', 'express']
            },
            fee: {
              type: 'number',
              description: 'Delivery fee in currency units'
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']
            },
            riderId: {
              type: 'string',
              description: 'Assigned rider ID'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Rider: {
          type: 'object',
          properties: {
            _id: {
              type: 'string'
            },
            name: {
              type: 'string'
            },
            email: {
              type: 'string'
            },
            phone: {
              type: 'string'
            },
            vehicleType: {
              type: 'string',
              enum: ['bicycle', 'motorcycle', 'car', 'van']
            },
            isActive: {
              type: 'boolean'
            },
            totalDeliveries: {
              type: 'number'
            },
            rating: {
              type: 'number',
              minimum: 1,
              maximum: 5
            }
          }
        },
        Admin: {
          type: 'object',
          properties: {
            _id: {
              type: 'string'
            },
            name: {
              type: 'string'
            },
            email: {
              type: 'string'
            },
            role: {
              type: 'string',
              enum: ['admin', 'super_admin']
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            isActive: {
              type: 'boolean'
            }
          }
        },
        ApiKey: {
          type: 'object',
          properties: {
            _id: {
              type: 'string'
            },
            name: {
              type: 'string'
            },
            issuedTo: {
              type: 'string'
            },
            usageLimit: {
              type: 'number'
            },
            usageCount: {
              type: 'number'
            },
            isActive: {
              type: 'boolean'
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string'
            },
            errors: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Delivery',
        description: 'Delivery management endpoints'
      },
      {
        name: 'Riders',
        description: 'Rider authentication and delivery management'
      },
      {
        name: 'Admins',
        description: 'Admin authentication and system management'
      }
    ]
  },
  apis: ['./src/routes/*.js'], // Path to the API files
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Delivery Service API Documentation'
  }));
};
