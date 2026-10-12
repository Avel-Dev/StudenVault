const express = require('express');
const router = express.Router();
const {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  getModules,
  createModule,
  updateModule,
  deleteModule,
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/auth');

// Public / student readable routes
router.get('/', protect, getSubjects);
router.get('/:id', protect, getSubjectById);
router.get('/:subjectId/modules', protect, getModules);

// Admin-only management routes
router.post('/', protect, authorize('admin'), createSubject);
router.put('/:id', protect, authorize('admin'), updateSubject);
router.delete('/:id', protect, authorize('admin'), deleteSubject);

router.post('/:subjectId/modules', protect, authorize('admin'), createModule);
router.put('/:subjectId/modules/:moduleId', protect, authorize('admin'), updateModule);
router.delete('/:subjectId/modules/:moduleId', protect, authorize('admin'), deleteModule);

module.exports = router;
