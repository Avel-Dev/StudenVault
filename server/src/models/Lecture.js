const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required'],
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    default: null,
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  day: {
    type: String,
    required: [true, 'Day is required'],
  },
  startTime: {
    type: String,
    default: '09:00',
  },
  endTime: {
    type: String,
    default: '10:00',
  },
  room: {
    type: String,
    default: 'Room 301',
  },
  notes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
  }],
  googleEventId: {
    type: String,
    default: null,
  },
  syncStatus: {
    type: String,
    enum: ['not_synced', 'synced', 'failed'],
    default: 'not_synced',
  },
  syncError: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

lectureSchema.index({ subject: 1, date: -1 });
lectureSchema.index({ date: 1 });

module.exports = mongoose.model('Lecture', lectureSchema);
