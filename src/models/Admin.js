
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
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
  passwordHash: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  permissions: [{
    type: String,
    enum: ['view_deliveries', 'manage_riders', 'generate_api_keys', 'view_analytics']
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
adminSchema.index({ email: 1 });
adminSchema.index({ isActive: 1 });

// Hash password before saving
adminSchema.pre('save', async function(next) {
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
adminSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

// Remove sensitive data when converting to JSON
adminSchema.methods.toJSON = function() {
  const admin = this.toObject();
  delete admin.passwordHash;
  return admin;
};

module.exports = mongoose.model('Admin', adminSchema);
