const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  transcript: {
    type: String,
    required: true
  },
  summary: {
    type: [String],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Meeting', meetingSchema);
