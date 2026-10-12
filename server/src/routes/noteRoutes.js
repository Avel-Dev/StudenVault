const express = require('express');
const router = express.Router();
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} = require('../controllers/noteController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, getNotes);
router.get('/:id', protect, getNoteById);

// Admin-only write routes
router.post('/', protect, authorize('admin'), upload.single('file'), createNote);
router.put('/:id', protect, authorize('admin'), updateNote);
router.delete('/:id', protect, authorize('admin'), deleteNote);

module.exports = router;
