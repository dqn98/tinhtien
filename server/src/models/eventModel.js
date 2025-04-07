const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const EventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4
  },
  eventName: {
    type: String,
    required: [true, 'Event name is required']
  },
  eventDescription: {
    type: String
  },
  eventStartDate: {
    type: Date
  },
  eventEndDate: {
    type: Date
  },
  memberIds: [{
    type: String,
    ref: 'Member'
  }],
  feeIds: [{
    type: String,
    ref: 'Fee'
  }],
  createdDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', EventSchema);