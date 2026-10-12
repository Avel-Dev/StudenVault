const express = require('express');
const router = express.Router();
const {
  getLectures,
  getUpcomingLectures,
  getLectureById,
  createLecture,
  updateLecture,
  deleteLecture,
  syncLectureCalendar,
  syncAllLectures,
} = require('../controllers/lectureController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getLectures);
router.get('/upcoming', protect, getUpcomingLectures);
router.get('/:id', protect, getLectureById);

// Google Calendar sync triggers
router.post('/:id/sync-calendar', protect, syncLectureCalendar);
router.post('/sync-all', protect, syncAllLectures);

// Admin-only management
router.post('/', protect, authorize('admin'), createLecture);
router.put('/:id', protect, authorize('admin'), updateLecture);
router.delete('/:id', protect, authorize('admin'), deleteLecture);

module.exports = router;
