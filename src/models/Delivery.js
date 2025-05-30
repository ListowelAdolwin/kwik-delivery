
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const DeliveryStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

const DeliveryType = {
  STANDARD: 'standard',
  EXPRESS: 'express'
};

const deliverySchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  trackingNumber: {
    type: String,
    unique: true,
    default: () => nanoid(10).toUpperCase()
  },
  storeLocation: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
  customerLocation: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
  deliveryType: {
    type: String,
    enum: Object.values(DeliveryType),
    default: DeliveryType.STANDARD
  },
  fee: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: Object.values(DeliveryStatus),
    default: DeliveryStatus.PENDING
  },
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider',
    default: null
  },
  customerInfo: {
    name: String,
    phone: String,
    address: String
  },
  storeInfo: {
    name: String,
    phone: String,
    address: String
  },
  notes: String,
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date
}, {
  timestamps: true
});

// Index for efficient queries
deliverySchema.index({ trackingNumber: 1 });
deliverySchema.index({ orderId: 1 });
deliverySchema.index({ status: 1 });
deliverySchema.index({ riderId: 1 });
deliverySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Delivery', deliverySchema);
module.exports.DeliveryStatus = DeliveryStatus;
module.exports.DeliveryType = DeliveryType;
