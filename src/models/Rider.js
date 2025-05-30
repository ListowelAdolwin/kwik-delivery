
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const riderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true,
    minlength: 6
  },
  isActive: {
    type: Boolean,
    default: true
  },
  vehicleType: {
    type: String,
    enum: ['bicycle', 'motorcycle', 'car', 'van'],
    default: 'bicycle'
  },
  licenseNumber: String,
  currentLocation: {
    latitude: Number,
    longitude: Number,
    updatedAt: Date
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  },
  earnings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
riderSchema.index({ email: 1 });
riderSchema.index({ phone: 1 });
riderSchema.index({ isActive: 1 });

// Hash password before saving
riderSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
riderSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

// Remove sensitive data when converting to JSON
riderSchema.methods.toJSON = function() {
  const rider = this.toObject();
  delete rider.passwordHash;
  return rider;
};

module.exports = mongoose.model('Rider', riderSchema);
