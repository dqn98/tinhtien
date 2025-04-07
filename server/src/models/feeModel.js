const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const FeeSchema = new mongoose.Schema({
  feeId: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4
  },
  feeName: {
    type: String,
    required: [true, 'Fee name is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number']
  },
  memberIds: [{
    type: String,
    ref: 'Member'
  }],
  eventId: {
    type: String,
    required: true,
    ref: 'Event'
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Fee', FeeSchema);