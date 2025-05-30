
const mongoose = require('mongoose');

const deliveryHistorySchema = new mongoose.Schema({
  deliveryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Delivery',
    required: true
  },
  status: {
    type: String,
    required: true
  },
  updatedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    userType: {
      type: String,
      enum: ['rider', 'admin', 'system'],
      required: true
    }
  },
  notes: String,
  location: {
    latitude: Number,
    longitude: Number
  }
}, {
  timestamps: true
});

// Index for efficient queries
deliveryHistorySchema.index({ deliveryId: 1, createdAt: -1 });

module.exports = mongoose.model('DeliveryHistory', deliveryHistorySchema);
