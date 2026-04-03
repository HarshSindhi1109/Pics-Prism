const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    set: (value) => value.toLowerCase(),
  },
  email: {
    type: String,
    required: true,
    unique: true,
    set: (value) => value.toLowerCase(),
  },
  password: {
    type: String,
    default: null, // allow Google users
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer',
  },
  profilePicUrl: {
    type: String,
    default: '/uploads/profile-pic.webp',
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  hasPassword: {
    type: Boolean,
    default: false,
  },
});

UserSchema.pre('save', function (next) {
  this.hasPassword = !!this.password;
  next();
});

module.exports = mongoose.model('User', UserSchema);
