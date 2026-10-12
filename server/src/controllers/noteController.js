const fs = require('fs');
const path = require('path');
const Note = require('../models/Note');
const Subject = require('../models/Subject');

// @route GET /api/notes
// Filters: semester, subject, module, examType, search
exports.getNotes = async (req, res, next) => {
  try {
    const { semester, subject, module: moduleId, examType, search } = req.query;
    const filter = {};

    if (semester) {
      filter.semester = Number(semester);
    }
    if (subject) {
      filter.subject = subject;
    }
    if (moduleId) {
      filter.module = moduleId;
    }
    if (examType) {
      filter.examType = examType.toLowerCase();
    }
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const notes = await Note.find(filter)
      .populate('subject', 'name code semester')
      .populate('module', 'number title')
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: notes.length, notes });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/notes/:id
exports.getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('subject', 'name code semester')
      .populate('module', 'number title')
      .populate('uploadedBy', 'name email');

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.json({ success: true, note });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/notes
// Handles multipart/form-data upload via Multer or direct JSON link
exports.createNote = async (req, res, next) => {
  try {
    const { title, semester, subject, module: moduleId, examType, directUrl, fileType: manualFileType } = req.body;

    if (!title || !semester || !subject || !examType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, semester, subject, and examType (midterm/endsem)',
      });
    }

    let fileUrl = directUrl || '';
    let fileType = manualFileType || 'application/pdf';
    let originalName = '';
    let fileSize = 0;

    if (req.file) {
      // Local development storage path (served statically via /uploads)
      fileUrl = `/uploads/${req.file.filename}`;
      fileType = req.file.mimetype;
      originalName = req.file.originalname;
      fileSize = req.file.size;
    } else if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a note file or provide a valid document link',
      });
    }

    const note = await Note.create({
      title,
      fileUrl,
      originalName: originalName || path.basename(fileUrl),
      fileType,
      fileSize,
      semester: Number(semester),
      subject,
      module: moduleId || null,
      examType: examType.toLowerCase(),
      uploadedBy: req.user._id,
    });

    const populatedNote = await Note.findById(note._id)
      .populate('subject', 'name code semester')
      .populate('module', 'number title')
      .populate('uploadedBy', 'name email');

    res.status(201).json({ success: true, note: populatedNote });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/notes/:id
exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // If local file, delete from uploads directory
    if (note.fileUrl && note.fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../../', note.fileUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.warn('Could not remove file from disk:', unlinkErr.message);
        }
      }
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (err) {
    next(err);
  }
};
