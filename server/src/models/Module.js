const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject reference is required'],
  },
  number: {
    type: Number,
    required: [true, 'Module number is required'],
    min: 1,
  },
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true,
  },
  topics: [{
    type: String,
    trim: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

moduleSchema.index({ subject: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Module', moduleSchema);
