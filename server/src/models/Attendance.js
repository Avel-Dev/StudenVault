const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required'],
  },
  lecture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture',
    required: [true, 'Lecture is required'],
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required'],
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    required: true,
    default: 'present',
  },
  markedBy: {
    type: String,
    enum: ['faculty', 'student'],
    default: 'faculty',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Unique compound index on student and lecture
attendanceSchema.index({ student: 1, lecture: 1 }, { unique: true });
attendanceSchema.index({ student: 1, subject: 1 });
attendanceSchema.index({ subject: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
