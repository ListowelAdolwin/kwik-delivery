
const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  issuedTo: {
    type: String,
    required: true
  },
  usageLimit: {
    type: Number,
    default: 10000 // requests per month
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: Date,
  permissions: [{
    type: String,
    enum: ['create_delivery', 'track_delivery', 'cancel_delivery', 'calculate_fee']
  }]
}, {
  timestamps: true
});

// Generate API key before saving
apiKeySchema.pre('validate', function(next) {
  if (!this.key) {
    this.key = 'dk_' + crypto.randomBytes(32).toString('hex');
  }
  next();
});

// Index for efficient queries
apiKeySchema.index({ key: 1 });
apiKeySchema.index({ isActive: 1 });

module.exports = mongoose.model('ApiKey', apiKeySchema);
