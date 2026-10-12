const Subject = require('../models/Subject');
const Module = require('../models/Module');
const Note = require('../models/Note');

// @route GET /api/subjects
exports.getSubjects = async (req, res, next) => {
  try {
    const { semester } = req.query;
    const filter = {};
    if (semester) {
      filter.semester = Number(semester);
    }
    const subjects = await Subject.find(filter)
      .populate('faculty', 'name email')
      .sort({ semester: 1, code: 1 });

    res.json({ success: true, count: subjects.length, subjects });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/subjects/:id
exports.getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id).populate('faculty', 'name email');
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    const modules = await Module.find({ subject: subject._id }).sort({ number: 1 });
    res.json({ success: true, subject, modules });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/subjects
exports.createSubject = async (req, res, next) => {
  try {
    const { name, code, semester, description, faculty, modules } = req.body;
    const subject = await Subject.create({
      name,
      code,
      semester: Number(semester),
      description,
      faculty: faculty || req.user._id,
    });

    // If modules were included in payload, create them
    if (Array.isArray(modules) && modules.length > 0) {
      for (const m of modules) {
        if (m.title && m.number) {
          await Module.create({
            subject: subject._id,
            number: Number(m.number),
            title: m.title.trim(),
            topics: Array.isArray(m.topics)
              ? m.topics
              : (m.topics ? String(m.topics).split(',').map((t) => t.trim()).filter(Boolean) : []),
          });
        }
      }
    }

    const createdModules = await Module.find({ subject: subject._id }).sort({ number: 1 });
    res.status(201).json({ success: true, subject, modules: createdModules });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/subjects/:id
exports.updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.json({ success: true, subject });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/subjects/:id
exports.deleteSubject = async (req, res, next) => {
  try {
    // If delete would orphan notes, block deletion with a message instead of leaving orphans
    const noteCount = await Note.countDocuments({ subject: req.params.id });
    if (noteCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete this subject because it contains ${noteCount} note(s). Please remove all notes under this subject first.`,
      });
    }

    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    // Delete modules belonging to subject
    await Module.deleteMany({ subject: subject._id });
    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Modules sub-operations
// @route GET /api/subjects/:subjectId/modules
exports.getModules = async (req, res, next) => {
  try {
    const modules = await Module.find({ subject: req.params.subjectId }).sort({ number: 1 });
    res.json({ success: true, modules });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/subjects/:subjectId/modules
exports.createModule = async (req, res, next) => {
  try {
    const { number, title, topics } = req.body;
    const mod = await Module.create({
      subject: req.params.subjectId,
      number: Number(number),
      title,
      topics: Array.isArray(topics) ? topics : (topics ? topics.split(',').map(t => t.trim()) : []),
    });
    res.status(201).json({ success: true, module: mod });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/subjects/:subjectId/modules/:moduleId
exports.updateModule = async (req, res, next) => {
  try {
    const { number, title, topics } = req.body;
    const updateData = {};
    if (number !== undefined) updateData.number = Number(number);
    if (title) updateData.title = title;
    if (topics !== undefined) {
      updateData.topics = Array.isArray(topics) ? topics : topics.split(',').map(t => t.trim());
    }

    const mod = await Module.findByIdAndUpdate(req.params.moduleId, updateData, {
      new: true,
      runValidators: true,
    });
    if (!mod) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }
    res.json({ success: true, module: mod });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/subjects/:subjectId/modules/:moduleId
exports.deleteModule = async (req, res, next) => {
  try {
    // If delete would orphan notes, block deletion with a message instead of leaving orphans
    const noteCount = await Note.countDocuments({ module: req.params.moduleId });
    if (noteCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete this module because it contains ${noteCount} note(s). Please remove all notes under this module first.`,
      });
    }

    const mod = await Module.findByIdAndDelete(req.params.moduleId);
    if (!mod) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }
    res.json({ success: true, message: 'Module deleted successfully' });
  } catch (err) {
    next(err);
  }
};
