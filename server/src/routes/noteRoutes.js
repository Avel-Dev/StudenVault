const express = require('express');
const router = express.Router();
const {
  getNotes,
  getNoteById,
  createNote,
  deleteNote,
} = require('../controllers/noteController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, getNotes);
router.get('/:id', protect, getNoteById);

// Admin can upload notes, student/faculty with upload permissions can also upload
router.post('/', protect, upload.single('file'), createNote);
router.delete('/:id', protect, authorize('admin'), deleteNote);

module.exports = router;
