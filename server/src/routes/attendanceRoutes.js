const express = require('express');
const router = express.Router();
const {
  getStudentSummary,
  getMyAttendanceLogs,
  logStudentAttendance,
  bulkMarkAttendance,
  getLectureAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// Student attendance routes
router.get('/summary', protect, getStudentSummary);
router.get('/my-logs', protect, getMyAttendanceLogs);
router.post('/log-self', protect, logStudentAttendance);

// Admin / Faculty attendance routes
router.post('/bulk', protect, authorize('admin'), bulkMarkAttendance);
router.get('/lecture/:lectureId', protect, authorize('admin'), getLectureAttendance);

module.exports = router;
