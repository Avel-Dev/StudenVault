const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide note title'],
    trim: true,
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required'],
  },
  originalName: {
    type: String,
    default: '',
  },
  fileType: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    default: 0,
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    min: 1,
    max: 8,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject reference is required'],
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    default: null,
  },
  examType: {
    type: String,
    enum: ['midterm', 'endsem'],
    required: [true, 'Exam type is required (midterm or endsem)'],
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Fast filtering indexes
noteSchema.index({ semester: 1, subject: 1, examType: 1, module: 1 });
noteSchema.index({ subject: 1 });
noteSchema.index({ semester: 1 });
noteSchema.index({ examType: 1 });
noteSchema.index({ module: 1 });

module.exports = mongoose.model('Note', noteSchema);
