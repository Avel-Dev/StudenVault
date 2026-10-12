const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide subject name'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Please provide subject code'],
    uppercase: true,
    trim: true,
  },
  semester: {
    type: Number,
    required: [true, 'Please specify semester'],
    min: 1,
    max: 8,
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  description: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

subjectSchema.index({ code: 1, semester: 1 }, { unique: true });
subjectSchema.index({ semester: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
