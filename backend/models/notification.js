const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['APPOINTMENT', 'SERVICE', 'SYSTEM', 'OTHER']
  },
  status: {
    type: String,
    required: true,
    enum: ['read', 'unread'],
    default: 'unread'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);