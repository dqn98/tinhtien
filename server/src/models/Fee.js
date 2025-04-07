const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  feeId: {
    type: String,
    required: true,
    unique: true
  },
  feeName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  paidBy: {
    type: String,
    required: true
  },
  memberIds: {
    type: [String],
    default: []
  },
  eventId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Fee', feeSchema);