const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const MemberSchema = new mongoose.Schema({
  memberId: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4
  },
  memberName: {
    type: String,
    required: [true, 'Member name is required']
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Member', MemberSchema);